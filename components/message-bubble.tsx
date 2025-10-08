"use client"

import { Bot, Trash2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionButtons } from "./action-buttons"
import { Loading } from "./loading"

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

interface MessageBubbleProps {
  message: Message
  onAction?: (value: string, metadata?: any) => void
  onDelete: (id: string) => void
}

export function MessageBubble({ message, onAction, onDelete }: MessageBubbleProps) {
  const isUser = message.role === "user"

  const handleAction = (value: string) => {
    if (onAction) {
      onAction(value, message.metadata)
    }
  }

  return (
    <div className={cn("group flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-accent" : "bg-primary",
        )}
      >
        {isUser ? <User className="h-5 w-5 text-foreground" /> :
          <>
            {message?.metadata?.loading ? <Loading /> : <Bot className="h-5 w-5 text-white" />}
          </>
        }
      </div>

      {/* Message Content */}
      <div className={cn("flex max-w-[70%] flex-col gap-2", isUser && "items-end")}>
        <div className={cn("relative rounded-lg px-4 py-3", isUser ? "bg-primary text-white" : "bg-accent text-foreground")}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {!isUser && message.actions && onAction && (
            <ActionButtons actions={message.actions} onAction={handleAction} />
          )}

          {/* {onDelete && ( */}
          <button
            onClick={() => onDelete(message.id)}
            className="absolute -top-2 -right-2 hidden group-hover:block text-muted hover:text-red-500"
          >
            <Trash2 className="h-4 w-4 cursor-pointer" />
          </button>
          {/* )} */}

        </div>
        <span className="text-xs text-muted">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}
