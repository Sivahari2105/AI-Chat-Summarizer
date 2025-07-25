import React from 'react'
import { formatTime } from '@/lib/utils'
import { Message } from '@/types/chat'
import { Check, CheckCheck } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showSender?: boolean
  senderName?: string
}

export function MessageBubble({ message, isOwn, showSender, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-700 text-white'
      }`}>
        {showSender && !isOwn && (
          <div className="text-xs text-green-400 font-semibold mb-1">
            {senderName}
          </div>
        )}
        
        <div className="break-words">
          {message.content}
        </div>
        
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
          isOwn ? 'text-green-100' : 'text-gray-400'
        }`}>
          <span>{formatTime(new Date(message.created_at))}</span>
          {isOwn && (
            <div className="flex">
              {message.read_by && message.read_by.length > 0 ? (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}