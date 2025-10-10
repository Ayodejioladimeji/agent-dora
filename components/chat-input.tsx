"use client"

import { useRef, useState } from "react"
import { Send, Paperclip, X } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  images: string[]
  setImages: any
}

export function ChatInput({ onSendMessage, disabled, images, setImages }: ChatInputProps) {
  const [input, setInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || images.length > 0) && !disabled) {
      onSendMessage(input.trim())
      setInput("")
      setImages([]) // clear images after send
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev: string[]) => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-border bg-background px-6 py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">


        <div className="relative flex items-end gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-accent"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="w-full">
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img
                      src={img}
                      alt={`Preview ${idx}`}
                      className="h-20 w-20 rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="min-h-[44px] max-h-32 resize-none"
              rows={2}
              disabled={disabled}
            />
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="shrink-0 bg-(--color-primary) hover:bg-(--color-primary-hover)"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

      </form>
    </div>
  )
}
