const { createServer } = require('http')
const { Server } = require('socket.io')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
})

// Store active users and their socket connections
const activeUsers = new Map()
const userSockets = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user authentication and join
  socket.on('authenticate', async (userId) => {
    try {
      // Update user online status in Supabase
      await supabase
        .from('users')
        .update({ 
          online: true, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', userId)

      // Store user connection
      activeUsers.set(userId, {
        socketId: socket.id,
        userId,
        joinedAt: new Date()
      })
      userSockets.set(socket.id, userId)

      socket.userId = userId
      console.log(`User ${userId} authenticated`)

      // Notify other users that this user is online
      socket.broadcast.emit('user_online', { userId })

      // Get user's chats and join chat rooms
      const { data: chatParticipants } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId)

      if (chatParticipants) {
        chatParticipants.forEach(({ chat_id }) => {
          socket.join(chat_id)
        })
      }

    } catch (error) {
      console.error('Authentication error:', error)
      socket.emit('auth_error', { message: 'Authentication failed' })
    }
  })

  // Handle joining a specific chat
  socket.on('join_chat', (chatId) => {
    socket.join(chatId)
    console.log(`User ${socket.userId} joined chat ${chatId}`)
  })

  // Handle leaving a chat
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId)
    console.log(`User ${socket.userId} left chat ${chatId}`)
  })

  // Handle sending messages
  socket.on('send_message', async ({ chatId, message }) => {
    try {
      // Save message to Supabase
      const { data: savedMessage, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: message.sender_id,
          content: message.content,
          message_type: message.message_type || 'text'
        })
        .select(`
          *,
          sender:users(id, full_name, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error saving message:', error)
        socket.emit('message_error', { error: 'Failed to save message' })
        return
      }

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)

      // Broadcast message to all users in the chat
      io.to(chatId).emit('new_message', savedMessage)

      console.log(`Message sent in chat ${chatId}`)

    } catch (error) {
      console.error('Send message error:', error)
      socket.emit('message_error', { error: 'Failed to send message' })
    }
  })

  // Handle typing indicators
  socket.on('typing_start', async (chatId) => {
    if (!socket.userId) return

    try {
      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', socket.userId)
        .single()

      if (user) {
        socket.to(chatId).emit('typing_start', {
          userId: socket.userId,
          userName: user.full_name,
          chatId
        })
      }
    } catch (error) {
      console.error('Typing start error:', error)
    }
  })

  socket.on('typing_stop', (chatId) => {
    if (!socket.userId) return
    
    socket.to(chatId).emit('typing_stop', {
      userId: socket.userId,
      chatId
    })
  })

  // Handle message read receipts
  socket.on('mark_messages_read', async ({ chatId, messageIds }) => {
    try {
      if (!socket.userId || !messageIds.length) return

      // Insert read receipts
      const readReceipts = messageIds.map(messageId => ({
        message_id: messageId,
        user_id: socket.userId,
        read_at: new Date().toISOString()
      }))

      await supabase
        .from('message_reads')
        .upsert(readReceipts, { 
          onConflict: 'message_id,user_id',
          ignoreDuplicates: true 
        })

      // Notify other users in the chat about read receipts
      socket.to(chatId).emit('messages_read', {
        userId: socket.userId,
        messageIds,
        chatId
      })

    } catch (error) {
      console.error('Mark messages read error:', error)
    }
  })

  // Handle user status updates
  socket.on('update_status', async ({ online }) => {
    if (!socket.userId) return

    try {
      await supabase
        .from('users')
        .update({ 
          online,
          last_seen: new Date().toISOString()
        })
        .eq('id', socket.userId)

      // Broadcast status change
      if (online) {
        socket.broadcast.emit('user_online', { userId: socket.userId })
      } else {
        socket.broadcast.emit('user_offline', { userId: socket.userId })
      }

    } catch (error) {
      console.error('Update status error:', error)
    }
  })

  // Handle disconnection
  socket.on('disconnect', async () => {
    const userId = userSockets.get(socket.id)
    
    if (userId) {
      try {
        // Update user offline status
        await supabase
          .from('users')
          .update({ 
            online: false, 
            last_seen: new Date().toISOString() 
          })
          .eq('id', userId)

        // Clean up user tracking
        activeUsers.delete(userId)
        userSockets.delete(socket.id)

        // Notify other users
        socket.broadcast.emit('user_offline', { userId })

        console.log(`User ${userId} disconnected`)

      } catch (error) {
        console.error('Disconnect error:', error)
      }
    }
  })
})

const PORT = process.env.SOCKET_PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('Socket.IO server closed')
    process.exit(0)
  })
})