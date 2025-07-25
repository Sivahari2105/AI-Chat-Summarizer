export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  online: boolean
  last_seen: string
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  created_at: string
  updated_at: string
  sender?: User
  read_by?: string[]
}

export interface Chat {
  id: string
  name: string | null
  is_group: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
  participants?: User[]
  last_message?: Message
  unread_count?: number
  messages?: Message[]
}

export interface ChatParticipant {
  id: string
  chat_id: string
  user_id: string
  joined_at: string
  role: 'admin' | 'member'
  user?: User
}

export interface MessageRead {
  id: string
  message_id: string
  user_id: string
  read_at: string
}

export interface SummChannel {
  id: 'summ'
  name: string
  avatar: string
  isSumm: true
}

export type ChatListItem = Chat | SummChannel

export interface TypingUser {
  userId: string
  userName: string
}