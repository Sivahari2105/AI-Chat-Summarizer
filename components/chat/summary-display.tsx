import React from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { RefreshCw, MessageSquare } from 'lucide-react'

interface SummaryDisplayProps {
  isLoading: boolean
  summary: string | null
  error: string | null
  onNewSummary: () => void
  summarizedChatName?: string
}

export function SummaryDisplay({ 
  isLoading, 
  summary, 
  error, 
  onNewSummary,
  summarizedChatName 
}: SummaryDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <LoadingSpinner className="absolute -top-2 -right-2 w-6 h-6" />
          </div>
          <div className="text-green-400 font-semibold text-center">
            <div>Analyzing messages...</div>
            <div className="text-sm text-gray-400 mt-1">
              Generating intelligent summary
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div className="font-semibold text-red-400">Summary Error</div>
          </div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <Button 
            onClick={onNewSummary}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <div className="font-semibold text-white">Summary Generated</div>
              {summarizedChatName && (
                <div className="text-sm text-gray-400">for {summarizedChatName}</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed font-sans">
              {summary}
            </pre>
          </div>
          
          <Button 
            onClick={onNewSummary}
            className="w-full"
            variant="outline"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Summarize Another Chat
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💡</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          AI Message Summarizer
        </h3>
        <p className="text-gray-400 mb-6">
          Get quick, intelligent summaries of your unread messages. 
          Type anything below to get started.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-300">
            ✨ <strong>Features:</strong>
            <ul className="mt-2 text-left space-y-1">
              <li>• Key discussion points</li>
              <li>• Action items & tasks</li>
              <li>• Conversation tone analysis</li>
              <li>• Response recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}