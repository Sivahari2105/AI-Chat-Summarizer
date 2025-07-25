import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from 'date-fns'
import { Chat, ChatListItem, SummChannel } from '@/types/chat'

interface ChatListProps {
  chats: ChatListItem[]
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
  currentUserId: string
}

export function ChatList({ chats, selectedChatId, onChatSelect, currentUserId }: ChatListProps) {
  const formatChatTime = (date: string) => {
    const chatDate = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - chatDate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return chatDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return formatDistanceToNow(chatDate, { addSuffix: true })
    }
  }

  const getChatName = (chat: Chat) => {
    if (chat.is_group) {
      return chat.name || 'Group Chat'
    }
    
    // For direct messages, show the other participant's name
    const otherParticipant = chat.participants?.find(p => p.id !== currentUserId)
    return otherParticipant?.full_name || 'Unknown User'
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.is_group) {
      return chat.avatar_url || '/placeholder.svg?height=40&width=40&text=GC'
    }
    
    const otherParticipant = chat.participants?.find(p => p.id !== currentUserId)
    return otherParticipant?.avatar_url || '/placeholder.svg?height=40&width=40&text=U'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <ScrollArea className="flex-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors duration-200 ${
            selectedChatId === chat.id ? 'bg-gray-700' : ''
          }`}
          onClick={() => onChatSelect(chat.id)}
        >
          {('isSumm' in chat) ? (
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
          ) : (
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={getChatAvatar(chat)} />
                <AvatarFallback className="bg-gray-600 text-white">
                  {getInitials(getChatName(chat))}
                </AvatarFallback>
              </Avatar>
              {!chat.is_group && chat.participants?.find(p => p.id !== currentUserId)?.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-medium truncate text-white">
                {('isSumm' in chat) ? chat.name : getChatName(chat)}
              </div>
              {('isSumm' in chat) ? null : chat.last_message && (
                <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                  {formatChatTime(chat.last_message.created_at)}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400 truncate">
                {('isSumm' in chat) ? (
                  'AI Message Summarizer'
                ) : chat.last_message ? (
                  <>
                    {chat.last_message.sender_id === currentUserId && (
                      <span className="text-green-400 mr-1">You: </span>
                    )}
                    {chat.last_message.content}
                  </>
                ) : (
                  'No messages yet'
                )}
              </div>
              
              {('isSumm' in chat) ? null : chat.unread_count && chat.unread_count > 0 && (
                <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0">
                  {chat.unread_count > 99 ? '99+' : chat.unread_count}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </ScrollArea>
  )
}