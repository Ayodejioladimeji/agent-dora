"use client"

import { useEffect, useRef } from "react"
import { MessageBubble } from "./message-bubble"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: any
  actions?: Array<{
    label: string
    value: string
    variant?: "default" | "outline"
  }>
}

interface ChatMessagesProps {
  messages: Message[]
  onAction?: (value: string, metadata?: any) => void
  chatId?: string | null
  callback: () => void
}

export function ChatMessages({ messages, onAction, chatId, callback }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleDelete = async (messageId: string) => {
    if (!chatId) return

    try {
      await fetch("/api/chat/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messageId }),
      })

      callback()
    } catch (err) {
      console.error("Failed to delete message:", err)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 ">
      <div className="mx-auto max-w-4xl space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onAction={onAction} onDelete={handleDelete} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
