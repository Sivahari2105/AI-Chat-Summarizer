import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, Search, MoreVertical } from "lucide-react"
import { Chat } from '@/types/chat'

interface ChatHeaderProps {
  chat: Chat | null
  currentUserId: string
  isSummChannel?: boolean
}

export function ChatHeader({ chat, currentUserId, isSummChannel }: ChatHeaderProps) {
  if (isSummChannel) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <span className="text-lg">💡</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white">AI Summarizer</div>
          <div className="text-xs text-gray-400">
            Get quick summaries of your unread messages
          </div>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="font-semibold text-white">Select a chat</div>
      </div>
    )
  }

  const getChatName = () => {
    if (chat.is_group) {
      return chat.name || 'Group Chat'
    }
    
    const otherParticipant = chat.participants?.find(p => p.id !== currentUserId)
    return otherParticipant?.full_name || 'Unknown User'
  }

  const getChatAvatar = () => {
    if (chat.is_group) {
      return chat.avatar_url || '/placeholder.svg?height=40&width=40&text=GC'
    }
    
    const otherParticipant = chat.participants?.find(p => p.id !== currentUserId)
    return otherParticipant?.avatar_url || '/placeholder.svg?height=40&width=40&text=U'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getOnlineStatus = () => {
    if (chat.is_group) {
      const onlineCount = chat.participants?.filter(p => p.online && p.id !== currentUserId).length || 0
      return onlineCount > 0 ? `${onlineCount} online` : 'Group'
    }
    
    const otherParticipant = chat.participants?.find(p => p.id !== currentUserId)
    if (otherParticipant?.online) {
      return 'Online'
    } else if (otherParticipant?.last_seen) {
      const lastSeen = new Date(otherParticipant.last_seen)
      const now = new Date()
      const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
      
      if (diffInMinutes < 60) {
        return `Last seen ${Math.floor(diffInMinutes)} minutes ago`
      } else if (diffInMinutes < 1440) {
        return `Last seen ${Math.floor(diffInMinutes / 60)} hours ago`
      } else {
        return `Last seen ${Math.floor(diffInMinutes / 1440)} days ago`
      }
    }
    return 'Offline'
  }

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={getChatAvatar()} />
          <AvatarFallback className="bg-gray-600 text-white">
            {getInitials(getChatName())}
          </AvatarFallback>
        </Avatar>
        {!chat.is_group && chat.participants?.find(p => p.id !== currentUserId)?.online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">
          {getChatName()}
        </div>
        <div className="text-xs text-gray-400">
          {getOnlineStatus()}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}