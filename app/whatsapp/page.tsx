"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Search, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Send, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatList } from '@/components/chat/chat-list'
import { ChatHeader } from '@/components/chat/chat-header'
import { MessageBubble } from '@/components/chat/message-bubble'
import { TypingIndicator } from '@/components/chat/typing-indicator'
import { SummaryDialog } from '@/components/chat/summary-dialog'
import { SummaryDisplay } from '@/components/chat/summary-display'
import { useSocket } from '@/hooks/useSocket'
import { Chat, Message, SummChannel, ChatListItem, TypingUser } from '@/types/chat'
import { formatChatTime, generateId } from '@/lib/utils'

// Mock current user
const CURRENT_USER_ID = 'user-1'

export default function WhatsAppClone() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)
  const [summaryContent, setSummaryContent] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summarizedChatName, setSummarizedChatName] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  
  // Socket connection
  const socket = useSocket(CURRENT_USER_ID)

  // Mock data
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: null,
      is_group: false,
      avatar_url: null,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      participants: [
        {
          id: 'user-2',
          email: 'sarah@example.com',
          full_name: 'Sarah Johnson',
          avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          online: true,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: '1',
          chat_id: '1',
          sender_id: 'user-2',
          content: 'Hey! How are you doing?',
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
        {
          id: '2',
          chat_id: '1',
          sender_id: CURRENT_USER_ID,
          content: "I'm doing great! Just finished a project at work.",
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          read_by: ['user-2']
        },
        {
          id: '3',
          chat_id: '1',
          sender_id: 'user-2',
          content: 'That sounds awesome! What kind of project was it?',
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
      ],
      last_message: {
        id: '3',
        chat_id: '1',
        sender_id: 'user-2',
        content: 'That sounds awesome! What kind of project was it?',
        message_type: 'text',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      unread_count: 2
    },
    {
      id: '2',
      name: null,
      is_group: false,
      avatar_url: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      participants: [
        {
          id: 'user-3',
          email: 'mike@example.com',
          full_name: 'Mike Chen',
          avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          online: false,
          last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          created_at: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: '4',
          chat_id: '2',
          sender_id: 'user-3',
          content: 'Thanks for the help yesterday!',
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '5',
          chat_id: '2',
          sender_id: CURRENT_USER_ID,
          content: 'No problem at all! Happy to help.',
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
          read_by: ['user-3']
        },
      ],
      last_message: {
        id: '5',
        chat_id: '2',
        sender_id: CURRENT_USER_ID,
        content: 'No problem at all! Happy to help.',
        message_type: 'text',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
      },
      unread_count: 0
    },
    {
      id: '3',
      name: 'Work Team',
      is_group: true,
      avatar_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      participants: [
        {
          id: 'user-4',
          email: 'emma@example.com',
          full_name: 'Emma Wilson',
          avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          online: true,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'user-5',
          email: 'alex@example.com',
          full_name: 'Alex Rodriguez',
          avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          online: false,
          last_seen: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          created_at: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: '6',
          chat_id: '3',
          sender_id: 'user-4',
          content: "Don't forget about the meeting tomorrow at 10 AM",
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 30).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 30).toISOString(),
        },
        {
          id: '7',
          chat_id: '3',
          sender_id: CURRENT_USER_ID,
          content: "Got it! I'll be there.",
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 15).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 15).toISOString(),
          read_by: ['user-4', 'user-5']
        },
        {
          id: '8',
          chat_id: '3',
          sender_id: 'user-4',
          content: 'Perfect! See you all there.',
          message_type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ],
      last_message: {
        id: '8',
        chat_id: '3',
        sender_id: 'user-4',
        content: 'Perfect! See you all there.',
        message_type: 'text',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      unread_count: 1
    }
  ])

  // Summ channel
  const summChannel: SummChannel = {
    id: 'summ',
    name: 'summ',
    avatar: '💡',
    isSumm: true,
  }

  const chatList: ChatListItem[] = [summChannel, ...chats]
  const filteredChats = chatList.filter((chat) => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentChat = chats.find((chat) => chat.id === selectedChat)

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    socket.on('new_message', (message: Message) => {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === message.chat_id
            ? {
                ...chat,
                messages: [...(chat.messages || []), message],
                last_message: message,
                updated_at: message.created_at,
                unread_count: message.sender_id !== CURRENT_USER_ID 
                  ? (chat.unread_count || 0) + 1 
                  : chat.unread_count
              }
            : chat
        )
      )
    })

    socket.on('typing_start', ({ userId, userName, chatId }: { userId: string, userName: string, chatId: string }) => {
      if (userId !== CURRENT_USER_ID && chatId === selectedChat) {
        setTypingUsers(prev => {
          if (!prev.find(user => user.userId === userId)) {
            return [...prev, { userId, userName }]
          }
          return prev
        })
      }
    })

    socket.on('typing_stop', ({ userId, chatId }: { userId: string, chatId: string }) => {
      if (chatId === selectedChat) {
        setTypingUsers(prev => prev.filter(user => user.userId !== userId))
      }
    })

    socket.on('user_online', ({ userId }: { userId: string }) => {
      setChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          participants: chat.participants?.map(participant =>
            participant.id === userId
              ? { ...participant, online: true, last_seen: new Date().toISOString() }
              : participant
          )
        }))
      )
    })

    socket.on('user_offline', ({ userId }: { userId: string }) => {
      setChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          participants: chat.participants?.map(participant =>
            participant.id === userId
              ? { ...participant, online: false, last_seen: new Date().toISOString() }
              : participant
          )
        }))
      )
    })

    return () => {
      socket.off('new_message')
      socket.off('typing_start')
      socket.off('typing_stop')
      socket.off('user_online')
      socket.off('user_offline')
    }
  }, [socket, selectedChat])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages, typingUsers])

  // Handle typing
  const handleTyping = () => {
    if (!socket || !selectedChat || selectedChat === 'summ') return

    if (!isTyping) {
      setIsTyping(true)
      socket.emit('typing_start', selectedChat)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit('typing_stop', selectedChat)
    }, 1000)
  }

  // Handle summ channel interaction
  useEffect(() => {
    if (selectedChat === 'summ' && newMessage.length > 0 && !showSummaryDialog) {
      setShowSummaryDialog(true)
    }
  }, [selectedChat, newMessage, showSummaryDialog])

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId)
    setSummaryContent(null)
    setSummaryError(null)
    setNewMessage('')
    
    if (chatId === 'summ') {
      setShowSummaryDialog(true)
    } else {
      // Mark messages as read and join chat room
      setChats(prevChats => 
        prevChats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages?.map(msg => ({
                  ...msg,
                  read_by: msg.sender_id === CURRENT_USER_ID 
                    ? msg.read_by 
                    : [...(msg.read_by || []), CURRENT_USER_ID]
                })),
                unread_count: 0,
              }
            : chat
        )
      )
      
      if (socket) {
        socket.emit('join_chat', chatId)
      }
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat || selectedChat === 'summ') return

    const message: Message = {
      id: generateId(),
      chat_id: selectedChat,
      sender_id: CURRENT_USER_ID,
      content: newMessage,
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      read_by: []
    }

    // Update local state
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat
          ? {
              ...chat,
              messages: [...(chat.messages || []), message],
              last_message: message,
              updated_at: message.created_at,
            }
          : chat
      )
    )

    // Send via socket
    if (socket) {
      socket.emit('send_message', { chatId: selectedChat, message })
      socket.emit('typing_stop', selectedChat)
    }

    setNewMessage('')
    setIsTyping(false)
  }

  const handleSummarizeChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    setNewMessage('')
    setIsSummarizing(true)
    setShowSummaryDialog(false)
    setSummaryContent(null)
    setSummaryError(null)
    setSummarizedChatName(chat.is_group ? chat.name : chat.participants?.[0]?.full_name || 'Unknown')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chat.messages?.map(msg => ({
            id: msg.id,
            text: msg.content,
            timestamp: new Date(msg.created_at),
            sent: msg.sender_id === CURRENT_USER_ID,
            sender: chat.participants?.find(p => p.id === msg.sender_id)?.full_name
          })) || [],
          chatName: chat.is_group ? chat.name : chat.participants?.[0]?.full_name || 'Unknown'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate summary')
      }

      const data = await response.json()
      setSummaryContent(data.summary)
    } catch (error: any) {
      setSummaryError(error.message || 'Failed to generate summary')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleNewSummary = () => {
    setSummaryContent(null)
    setSummaryError(null)
    setSummarizedChatName(null)
    setShowSummaryDialog(true)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-full max-w-sm flex flex-col border-r border-gray-800 bg-gray-800">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-lg font-bold">Chats</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="bg-gray-700 border-none text-white placeholder-gray-400 pl-10"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <ChatList
          chats={filteredChats}
          selectedChatId={selectedChat}
          onChatSelect={handleChatSelect}
          currentUserId={CURRENT_USER_ID}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <ChatHeader
          chat={currentChat}
          currentUserId={CURRENT_USER_ID}
          isSummChannel={selectedChat === 'summ'}
        />

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
          {selectedChat === 'summ' ? (
            <SummaryDisplay
              isLoading={isSummarizing}
              summary={summaryContent}
              error={summaryError}
              onNewSummary={handleNewSummary}
              summarizedChatName={summarizedChatName || undefined}
            />
          ) : currentChat ? (
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-1">
                {currentChat.messages?.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === CURRENT_USER_ID}
                    showSender={currentChat.is_group}
                    senderName={currentChat.participants?.find(p => p.id === message.sender_id)?.full_name}
                  />
                ))}
                {typingUsers.length > 0 && (
                  <TypingIndicator typingUsers={typingUsers} />
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">WhatsApp Clone</h3>
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedChat && selectedChat !== 'summ' && (
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                className="flex-1 bg-gray-800 border-none text-white placeholder-gray-400"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage()
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Mic className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                className="bg-green-600 hover:bg-green-700"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Dialog */}
      <SummaryDialog
        isOpen={showSummaryDialog}
        onClose={() => {
          setShowSummaryDialog(false)
          setNewMessage('')
        }}
        chats={chats}
        onSummarizeChat={handleSummarizeChat}
        currentUserId={CURRENT_USER_ID}
      />
    </div>
  )
}