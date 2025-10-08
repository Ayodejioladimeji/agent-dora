"use client"

import { Settings, FileText } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

interface ChatHeaderProps {
  onSettingsClick: () => void
  onPublishedClick: () => void
}

export function ChatHeader({ onSettingsClick, onPublishedClick }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-red-900">
          <Image src="/logo.png" alt="logo" width={10} height={10} className="min-h-10 min-w-10" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Dora</h1>
          <p className="text-sm text-muted">AI Social Media Agent</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPublishedClick()}
          title="Published posts"
          className="hover:bg-accent"
        >
          <FileText className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onSettingsClick} className="hover:bg-accent">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
