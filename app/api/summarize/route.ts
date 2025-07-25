import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

interface Message {
  id: string
  text: string
  timestamp: Date
  sent: boolean
  sender?: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages, chatName } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // For demo purposes, create a mock summary if no OpenAI key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      const mockSummary = generateMockSummary(messages, chatName)
      return NextResponse.json({ summary: mockSummary })
    }

    // Format messages for OpenAI
    const messageText = messages.map((msg: Message) => {
      const sender = msg.sent ? 'You' : (msg.sender || 'Contact')
      return `${sender}: ${msg.text}`
    }).join('\n')

    const prompt = `Please summarize the following chat conversation. Focus on:
- Key discussion points
- Important decisions or agreements
- Action items or tasks mentioned
- Overall tone and context
- Any urgent matters requiring attention

Chat messages:
${messageText}

Provide a concise but comprehensive summary:`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes chat conversations clearly and concisely."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary'

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

function generateMockSummary(messages: Message[], chatName: string): string {
  const messageCount = messages.length
  const recentMessages = messages.slice(-3)
  
  let summary = `📋 **Chat Summary for ${chatName}**\n\n`
  summary += `💬 **Message Count:** ${messageCount} messages\n\n`
  
  if (messageCount > 0) {
    summary += `🔍 **Key Points:**\n`
    summary += `• Recent conversation activity detected\n`
    
    if (recentMessages.some(m => m.text.toLowerCase().includes('meeting'))) {
      summary += `• Meeting or appointment mentioned\n`
    }
    if (recentMessages.some(m => m.text.toLowerCase().includes('help'))) {
      summary += `• Help or assistance requested\n`
    }
    if (recentMessages.some(m => m.text.toLowerCase().includes('thanks'))) {
      summary += `• Appreciation or gratitude expressed\n`
    }
    
    summary += `\n📝 **Latest Message:**\n`
    const lastMessage = messages[messages.length - 1]
    const sender = lastMessage.sent ? 'You' : 'Contact'
    summary += `"${lastMessage.text}" - ${sender}\n\n`
    
    summary += `⏰ **Conversation Tone:** ${getConversationTone(messages)}\n`
    summary += `🎯 **Action Required:** ${needsResponse(messages) ? 'Response recommended' : 'No immediate action needed'}`
  } else {
    summary += `No messages to summarize.`
  }
  
  return summary
}

function getConversationTone(messages: Message[]): string {
  const text = messages.map(m => m.text.toLowerCase()).join(' ')
  
  if (text.includes('urgent') || text.includes('asap') || text.includes('emergency')) {
    return 'Urgent'
  } else if (text.includes('thanks') || text.includes('great') || text.includes('awesome')) {
    return 'Positive'
  } else if (text.includes('sorry') || text.includes('problem') || text.includes('issue')) {
    return 'Concerned'
  } else {
    return 'Neutral'
  }
}

function needsResponse(messages: Message[]): boolean {
  const lastMessage = messages[messages.length - 1]
  if (!lastMessage || lastMessage.sent) return false
  
  const text = lastMessage.text.toLowerCase()
  return text.includes('?') || text.includes('please') || text.includes('can you') || text.includes('could you')
}