import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const chatService = {
  // Get user's chats with participants and last message
  async getUserChats(userId: string) {
    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats!inner (
          id,
          name,
          is_group,
          avatar_url,
          created_at,
          updated_at,
          chat_participants!inner (
            user_id,
            role,
            users!inner (
              id,
              full_name,
              avatar_url,
              online,
              last_seen
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Get last messages for each chat
    const chatIds = data.map(item => item.chat_id)
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('*')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: false })

    // Get unread counts
    const { data: unreadCounts } = await supabase
      .rpc('get_unread_counts', { user_id: userId, chat_ids: chatIds })

    return { data, lastMessages, unreadCounts, error }
  },

  // Get messages for a specific chat
  async getChatMessages(chatId: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id (
          id,
          full_name,
          avatar_url
        ),
        message_reads (
          user_id,
          read_at
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit)

    return { data, error }
  },

  // Create a new direct message chat
  async createDirectChat(userId1: string, userId2: string) {
    // Check if chat already exists
    const { data: existingChat } = await supabase
      .rpc('find_direct_chat', { user1: userId1, user2: userId2 })

    if (existingChat && existingChat.length > 0) {
      return { data: existingChat[0], error: null }
    }

    // Create new chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({ is_group: false })
      .select()
      .single()

    if (chatError) return { data: null, error: chatError }

    // Add participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: chat.id, user_id: userId1, role: 'member' },
        { chat_id: chat.id, user_id: userId2, role: 'member' }
      ])

    if (participantsError) return { data: null, error: participantsError }

    return { data: chat, error: null }
  },

  // Create a group chat
  async createGroupChat(name: string, creatorId: string, participantIds: string[]) {
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({ 
        name, 
        is_group: true 
      })
      .select()
      .single()

    if (chatError) return { data: null, error: chatError }

    // Add creator as admin
    const participants = [
      { chat_id: chat.id, user_id: creatorId, role: 'admin' },
      ...participantIds.map(userId => ({
        chat_id: chat.id,
        user_id: userId,
        role: 'member'
      }))
    ]

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participants)

    if (participantsError) return { data: null, error: participantsError }

    return { data: chat, error: null }
  }
}

// SQL functions to be created in Supabase
export const sqlFunctions = `
-- Function to find existing direct chat between two users
CREATE OR REPLACE FUNCTION find_direct_chat(user1 uuid, user2 uuid)
RETURNS TABLE(chat_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id
  FROM chats c
  WHERE c.is_group = false
    AND c.id IN (
      SELECT cp1.chat_id
      FROM chat_participants cp1
      WHERE cp1.user_id = user1
      INTERSECT
      SELECT cp2.chat_id
      FROM chat_participants cp2
      WHERE cp2.user_id = user2
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get unread message counts
CREATE OR REPLACE FUNCTION get_unread_counts(user_id uuid, chat_ids uuid[])
RETURNS TABLE(chat_id uuid, unread_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.chat_id,
    COUNT(*) as unread_count
  FROM messages m
  WHERE m.chat_id = ANY(chat_ids)
    AND m.sender_id != user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr 
      WHERE mr.message_id = m.id AND mr.user_id = user_id
    )
  GROUP BY m.chat_id;
END;
$$ LANGUAGE plpgsql;
`