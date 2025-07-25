export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          online: boolean
          last_seen: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string | null
          online?: boolean
          last_seen?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          online?: boolean
          last_seen?: string
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string | null
          is_group: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          is_group?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          is_group?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          joined_at: string
          role: 'admin' | 'member'
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          joined_at?: string
          role?: 'admin' | 'member'
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          joined_at?: string
          role?: 'admin' | 'member'
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'file'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'file'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file'
          created_at?: string
          updated_at?: string
        }
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
    }
    Functions: {
      find_direct_chat: {
        Args: { user1: string; user2: string }
        Returns: { chat_id: string }[]
      }
      get_unread_counts: {
        Args: { user_id: string; chat_ids: string[] }
        Returns: { chat_id: string; unread_count: number }[]
      }
    }
  }
}