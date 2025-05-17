"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Sparkles, Send, User, Bot } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateChatResponse } from "@/lib/ai"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type Chat = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

type ChatInterfaceProps = {
  chatId: string | null
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chat, setChat] = useState<Chat | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load chat from local storage when chatId changes
  useEffect(() => {
    if (!chatId) return

    const savedChats = localStorage.getItem("ideaSparkChats")
    if (savedChats) {
      try {
        const parsedChats: Chat[] = JSON.parse(savedChats)
        const currentChat = parsedChats.find((c) => c.id === chatId)

        if (currentChat) {
          // Convert string dates back to Date objects
          const formattedChat = {
            ...currentChat,
            createdAt: new Date(currentChat.createdAt),
            messages:
              currentChat.messages?.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })) || [],
          }
          setChat(formattedChat)
        } else {
          // Initialize a new chat if not found
          const newChat: Chat = {
            id: chatId,
            title: "New Chat",
            messages: [],
            createdAt: new Date(),
          }
          setChat(newChat)

          // Save the new chat to local storage
          const updatedChats = [...parsedChats, newChat]
          localStorage.setItem("ideaSparkChats", JSON.stringify(updatedChats))
        }
      } catch (error) {
        console.error("Failed to load chat from local storage:", error)
      }
    }
  }, [chatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages])

  const updateChatInStorage = (updatedChat: Chat) => {
    const savedChats = localStorage.getItem("ideaSparkChats")
    if (savedChats) {
      try {
        const parsedChats: Chat[] = JSON.parse(savedChats)
        const updatedChats = parsedChats.map((c) => (c.id === updatedChat.id ? updatedChat : c))
        localStorage.setItem("ideaSparkChats", JSON.stringify(updatedChats))
      } catch (error) {
        console.error("Failed to update chat in local storage:", error)
      }
    }
  }

  const updateChatTitle = (firstMessage: string) => {
    if (!chat) return

    // Generate a title from the first message (truncate if too long)
    const title = firstMessage.length > 30 ? `${firstMessage.substring(0, 30)}...` : firstMessage

    const updatedChat = { ...chat, title }
    setChat(updatedChat)

    // Update the chat title in local storage
    const savedChats = localStorage.getItem("ideaSparkChats")
    if (savedChats) {
      try {
        const parsedChats: Chat[] = JSON.parse(savedChats)
        const updatedChats = parsedChats.map((c) => (c.id === chat.id ? { ...c, title } : c))
        localStorage.setItem("ideaSparkChats", JSON.stringify(updatedChats))
      } catch (error) {
        console.error("Failed to update chat title in local storage:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !chat) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    // Update chat with user message
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, userMessage],
    }
    setChat(updatedChat)
    updateChatInStorage(updatedChat)

    // If this is the first message, update the chat title
    if (chat.messages.length === 0) {
      updateChatTitle(input)
    }

    setInput("")
    setIsLoading(true)

    try {
      const response = await generateChatResponse(input)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      // Update chat with assistant message
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
      }
      setChat(finalChat)
      updateChatInStorage(finalChat)
    } catch (error) {
      console.error("Failed to generate response:", error)
      toast({
        title: "Error generating response",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!chatId || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a chat or create a new one to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {chat.messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Welcome to IdeaSpark Chat</h2>
              <p className="text-gray-600 mb-6">
                Ask any question or describe a problem, and IdeaSpark will generate ideas and solutions for you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setInput("Why am I procrastinating?")}
                >
                  <p className="font-medium">Why am I procrastinating?</p>
                  <p className="text-sm text-gray-500 mt-1">Understand the reasons behind procrastination</p>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setInput("How can I improve my productivity?")}
                >
                  <p className="font-medium">How can I improve my productivity?</p>
                  <p className="text-sm text-gray-500 mt-1">Get tips to boost your productivity</p>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setInput("Generate creative marketing ideas for a small business")}
                >
                  <p className="font-medium">Marketing ideas for small business</p>
                  <p className="text-sm text-gray-500 mt-1">Creative marketing strategies on a budget</p>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setInput("What are some ways to reduce stress?")}
                >
                  <p className="font-medium">Ways to reduce stress</p>
                  <p className="text-sm text-gray-500 mt-1">Techniques for managing stress and anxiety</p>
                </Card>
              </div>
            </div>
          ) : (
            chat.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question or idea..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-[60px] w-[60px]">
              {isLoading ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            IdeaSpark may produce inaccurate information. Consider verifying important information.
          </p>
        </form>
      </div>
    </div>
  )
}
