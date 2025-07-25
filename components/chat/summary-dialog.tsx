import React from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Chat } from '@/types/chat'
import { X } from 'lucide-react'

interface SummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  chats: Chat[]
  onSummarizeChat: (chatId: string) => void
  currentUserId: string
}

export function SummaryDialog({ 
  isOpen, 
  onClose, 
  chats, 
  onSummarizeChat, 
  currentUserId 
}: SummaryDialogProps) {
  if (!isOpen) return null

  const unreadChats = chats.filter(chat => (chat.unread_count || 0) > 0)

  const getChatName = (chat: Chat) => {
    if (chat.is_group) {
      return chat.name || 'Group Chat'
    }
    
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-white">Summarize Unread Messages</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {unreadChats.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p>No chats with unread messages.</p>
            </div>
          ) : (
            unreadChats.map(chat => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                onClick={() => onSummarizeChat(chat.id)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={getChatAvatar(chat)} />
                  <AvatarFallback className="bg-gray-600 text-white">
                    {getInitials(getChatName(chat))}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {getChatName(chat)}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {chat.last_message?.content || 'No messages yet'}
                  </div>
                </div>
                
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {chat.unread_count && chat.unread_count > 99 ? '99+' : chat.unread_count}
                </div>
              </div>
            ))
          )}
        </div>
        
        <Button 
          className="mt-4 w-full" 
          variant="secondary" 
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}