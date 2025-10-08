"use client"

import { useState } from "react"
import { Linkedin, Twitter, Facebook, Send, Edit, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface Draft {
  _id: string
  platform: "linkedin" | "twitter" | "facebook"
  content: string
  images: string[]
  status: "pending" | "approved" | "rejected" | "posted"
  createdAt: Date
}

interface DraftCardProps {
  draft: Draft
  onPublish: (draftId: string) => void
  onEdit: (draftId: string) => void
  onDelete: (draftId: string) => void
}

export function DraftCard({ draft, onPublish, onEdit, onDelete }: DraftCardProps) {
  const [isPublishing, setIsPublishing] = useState(false)

  const platformIcons = {
    linkedin: <Linkedin className="h-4 w-4" />,
    twitter: <Twitter className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish(draft._id)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary)">
            {platformIcons[draft.platform]}
          </div>
          <div>
            <p className="text-sm font-medium capitalize">{draft.platform}</p>
            <p className="text-xs text-muted">{new Date(draft.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(draft._id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(draft._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm leading-relaxed text-foreground line-clamp-4">{draft.content}</p>
      </div>

      {draft.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {draft.images.map((img, idx) => (
            <img key={idx} src={img || "/placeholder.svg"} alt="" className="h-16 w-16 rounded object-cover" />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={handlePublish}
          disabled={isPublishing || draft.status === "posted"}
          className="bg-(--color-primary) hover:bg-(--color-primary-hover)"
        >
          <Send className="mr-2 h-4 w-4" />
          {draft.status === "posted" ? "Posted" : isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </Card>
  )
}
