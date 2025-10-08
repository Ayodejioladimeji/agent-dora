"use client"

import type React from "react"

import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { CheckCircle2, Edit3, RefreshCw, Upload, X } from "lucide-react"
import { useState } from "react"
import { Textarea } from "./ui/textarea"

interface DraftPreviewProps {
    content: string
    platform: string
    hashtags?: string[]
    validation?: {
        charCount: number
        withinLimit: boolean
        issues: string[]
    }
    onConfirm: (content: string, image?: string) => void
    onRegenerate: (instruction: string) => void
    onEdit: (content: string) => void
}

export function DraftPreview({
    content,
    platform,
    hashtags = [],
    validation,
    onConfirm,
    onRegenerate,
    onEdit,
}: DraftPreviewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(content)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [showRegenerateOptions, setShowRegenerateOptions] = useState(false)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be less than 5MB")
            return
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file")
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
            setUploadedImage(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSaveEdit = () => {
        onEdit(editedContent)
        setIsEditing(false)
    }

    const regenerateOptions = [
        { label: "Shorter", instruction: "Make this post shorter while keeping the key message" },
        { label: "Longer", instruction: "Expand this post with more details and examples" },
        { label: "Change tone", instruction: "Rewrite this with a different tone" },
        { label: "More data-driven", instruction: "Add more statistics and data points" },
        { label: "More personal", instruction: "Make this more personal and relatable" },
        { label: "Change hook", instruction: "Rewrite with a different opening hook" },
    ]

    return (
        <Card className="p-4 space-y-4 bg-accent/50">
            {/* Platform Badge */}
            <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted uppercase">{platform} Draft</div>
                {validation && (
                    <div className="text-xs text-muted">
                        {validation.charCount} characters
                        {!validation.withinLimit && <span className="text-red-500 ml-1">⚠ Over limit</span>}
                    </div>
                )}
            </div>

            {/* Content Preview/Edit */}
            {isEditing ? (
                <div className="space-y-2">
                    <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[200px] font-sans"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg bg-background p-4 whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
            )}

            {/* Hashtags */}
            {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                        <span key={tag} className="text-xs text-primary">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Image Upload */}
            {uploadedImage ? (
                <div className="relative">
                    <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Upload preview"
                        className="rounded-lg w-full max-h-64 object-cover"
                    />
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setUploadedImage(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div>
                    <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => document.getElementById("image-upload")?.click()}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image (Max 5MB)
                    </Button>
                </div>
            )}

            {/* Validation Issues */}
            {validation && validation.issues.length > 0 && (
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 space-y-1">
                    <p className="text-xs font-medium text-yellow-600">Validation Issues:</p>
                    {validation.issues.map((issue, i) => (
                        <p key={i} className="text-xs text-yellow-600">
                            • {issue}
                        </p>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => onConfirm(isEditing ? editedContent : content, uploadedImage || undefined)}
                >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm & Post
                </Button>

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsEditing(true)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>
                </div>

                {/* Regenerate Options */}
                {showRegenerateOptions && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        {regenerateOptions.map((option) => (
                            <Button
                                key={option.label}
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={() => {
                                    onRegenerate(option.instruction)
                                    setShowRegenerateOptions(false)
                                }}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    )
}
