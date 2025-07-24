"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  text: string
  timestamp: Date
  sent: boolean
  read?: boolean
}

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
  online: boolean
  messages: Message[]
}

// Add a special SummChannel type
interface SummChannel {
  id: 'summ';
  name: string;
  avatar: string;
  isSumm: true;
}

// Union type for chat list
type ChatListItem = Chat | SummChannel;

export default function WhatsAppClone() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 2. Add state for summary dialog and summary content
  const [showUnreadDialog, setShowUnreadDialog] = useState(false);
  const [summaryContent, setSummaryContent] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizedChatId, setSummarizedChatId] = useState<string | null>(null);

  // Sample data - in a real app this would come from an API
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      lastMessage: "Hey! How are you doing?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 2,
      online: true,
      messages: [
        {
          id: "1",
          text: "Hey! How are you doing?",
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          sent: false,
        },
        {
          id: "2",
          text: "I'm doing great! Just finished a project at work.",
          timestamp: new Date(Date.now() - 1000 * 60 * 8),
          sent: true,
          read: true,
        },
        {
          id: "3",
          text: "That sounds awesome! What kind of project was it?",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          sent: false,
        },
      ],
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
      lastMessage: "Thanks for the help yesterday!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
      online: false,
      messages: [
        {
          id: "1",
          text: "Thanks for the help yesterday!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          sent: false,
        },
        {
          id: "2",
          text: "No problem at all! Happy to help.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
          sent: true,
          read: true,
        },
      ],
    },
    {
      id: "3",
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
      lastMessage: "See you at the meeting tomorrow",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 1,
      online: true,
      messages: [
        {
          id: "1",
          text: "Don't forget about the meeting tomorrow at 10 AM",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 30),
          sent: false,
        },
        {
          id: "2",
          text: "Got it! I'll be there.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 15),
          sent: true,
          read: true,
        },
        {
          id: "3",
          text: "See you at the meeting tomorrow",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          sent: false,
        },
      ],
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40&text=AR",
      lastMessage: "Let's grab coffee this weekend!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      unreadCount: 0,
      online: false,
      messages: [
        {
          id: "1",
          text: "Let's grab coffee this weekend!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
          sent: false,
        },
      ],
    },
  ])

  // 3. Add 'summ' channel to chat list
  const summChannel: SummChannel = {
    id: 'summ',
    name: 'summ',
    avatar: '💡',
    isSumm: true,
  };

  const chatList: ChatListItem[] = [summChannel, ...chats];

  const filteredChats = chatList.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const currentChat = chats.find((chat) => chat.id === selectedChat)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  // 4. When 'summ' is selected and user types, show unread dialog
  useEffect(() => {
    if (selectedChat === 'summ' && newMessage.length > 0 && !showUnreadDialog) {
      setShowUnreadDialog(true);
    }
  }, [selectedChat, newMessage, showUnreadDialog]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      sent: true,
      read: false,
    }

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === selectedChat
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: newMessage,
              timestamp: new Date(),
            }
          : chat,
      ),
    )

    setNewMessage("")
  }

  // 5. On selecting a chat in the dialog, generate a summary and display it in the summ channel
  const handleSummarizeChat = async (chatId: string) => {
    setNewMessage(""); // Clear input first to prevent dialog from reopening
    setIsSummarizing(true);
    setShowUnreadDialog(false);
    setSummarizedChatId(chatId);
    setSummaryContent(null);
    // Find chat
    const chat = chats.find((c: Chat) => c.id === chatId);
    if (!chat) return;
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chat.messages }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSummaryContent('Error: ' + (err.error || 'Failed to summarize.'));
      } else {
        const data = await res.json();
        setSummaryContent(data.summary);
      }
    } catch (err: any) {
      setSummaryContent('Error: ' + (err.message || 'Unknown error'));
    }
    setIsSummarizing(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatChatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return formatTime(date)
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Chat List Sidebar */}
      <div className="w-full max-w-xs flex flex-col border-r border-gray-800 bg-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-lg font-bold">Chats</span>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-2">
          <Input
            className="bg-gray-700 border-none text-white placeholder-gray-400"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1">
          {filteredChats.map((chat: ChatListItem) => (
            <div
              key={chat.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-700 transition rounded-lg ${selectedChat === chat.id ? 'bg-gray-700' : ''}`}
              onClick={() => {
                setSelectedChat(chat.id)
                setSummaryContent(null)
                setNewMessage("")
                if (chat.id === 'summ') {
                  setShowUnreadDialog(true)
                } else {
                  // Mark all messages as read and set unreadCount to 0
                  setChats(prevChats => prevChats.map(c =>
                    c.id === chat.id
                      ? {
                          ...c,
                          messages: c.messages.map(m => ({ ...m, read: true })),
                          unreadCount: 0,
                        }
                      : c
                  ));
                }
              }}
            >
              {('isSumm' in chat) ? (
                <span className="text-2xl">{chat.avatar}</span>
              ) : (
                <Avatar>
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{chat.name.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{chat.name}</div>
                {('isSumm' in chat) ? (
                  <div className="text-xs text-green-400">AI Summarizer</div>
                ) : (
                  <div className="text-xs text-gray-400 truncate">{chat.lastMessage}</div>
                )}
              </div>
              {('isSumm' in chat) ? null : chat.unreadCount > 0 && (
                <span className="bg-green-500 text-xs px-2 py-0.5 rounded-full font-bold">{chat.unreadCount}</span>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
          {selectedChat === 'summ' ? (
            <span className="text-2xl">💡</span>
          ) : currentChat ? (
            <Avatar>
              <AvatarImage src={currentChat.avatar} />
              <AvatarFallback>{currentChat.name.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">
              {selectedChat === 'summ' ? 'Summarizer' : currentChat?.name || 'Select a chat'}
            </div>
            <div className="text-xs text-gray-400">
              {selectedChat === 'summ' ? 'Get quick summaries of your unread messages.' : currentChat?.online ? 'Online' : ''}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Search className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-900">
          {selectedChat === 'summ' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {isSummarizing ? (
                <div className="flex flex-col items-center gap-4">
                  <span className="animate-spin text-green-400 text-4xl">💡</span>
                  <div className="text-green-400 font-semibold">Generating summary...</div>
                </div>
              ) : summaryContent ? (
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
                  <pre className="whitespace-pre-wrap text-white text-sm">{summaryContent}</pre>
                  <Button className="mt-4 w-full" onClick={() => { setSummaryContent(null); setShowUnreadDialog(true); }}>Summarize another chat</Button>
                </div>
              ) : (
                <div className="text-gray-400 text-center">Type anything below to get started summarizing your unread messages.</div>
              )}
            </div>
          ) : currentChat ? (
            <ScrollArea className="flex-1 px-6 py-4 space-y-2">
              {currentChat.messages.map((msg: Message, idx: number) => (
                <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${msg.sent ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}>{msg.text}
                    <div className="text-xs text-gray-300 mt-1 text-right">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
          )}
        </div>

        {/* Message Input */}
        {selectedChat !== 'summ' && (
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center gap-2">
            <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
            <Input
              className="flex-1 bg-gray-800 border-none text-white placeholder-gray-400"
              placeholder={selectedChat === 'summ' ? 'Type to summarize unread messages...' : 'Type a message...'}
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  if (selectedChat === 'summ') {
                    setShowUnreadDialog(true)
                  } else {
                    sendMessage()
                  }
                }
              }}
              disabled={selectedChat === null}
            />
            <Button variant="ghost" size="icon"><Mic className="w-5 h-5" /></Button>
            <Button variant="default" size="icon" onClick={() => {
              if (selectedChat === 'summ') {
                setShowUnreadDialog(true)
              } else {
                sendMessage()
              }
            }}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Unread Dialog for Summarizer */}
        {showUnreadDialog && selectedChat === 'summ' && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
              <div className="font-bold text-lg mb-4 text-white">Summarize Unread Messages</div>
              <div className="space-y-2">
                {chats.filter((c: Chat) => c.unreadCount > 0).length === 0 ? (
                  <div className="text-gray-400">No chats with unread messages.</div>
                ) : chats.filter((c: Chat) => c.unreadCount > 0).map(chat => (
                  <div
                    key={chat.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition"
                    onClick={() => handleSummarizeChat(chat.id)}
                  >
                    <Avatar>
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{chat.name}</div>
                      <div className="text-xs text-gray-400 truncate">{chat.lastMessage}</div>
                    </div>
                    <span className="bg-green-500 text-xs px-2 py-0.5 rounded-full font-bold">{chat.unreadCount}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => { setShowUnreadDialog(false); setNewMessage(""); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
