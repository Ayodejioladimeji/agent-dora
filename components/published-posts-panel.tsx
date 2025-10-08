"use client"

import { X, Linkedin, Twitter, Facebook, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loading } from "./loading"
import { showError, showSuccess } from "@/lib/toast"

interface PublishedPost {
    _id?: string
    userId: string
    draftId?: string
    platform: string
    content: string
    images: string[]
    platformPostId: string
    publishedAt: string
}

interface PublishedPostsPanelProps {
    onClose: () => void
}

export function PublishedPostsPanel({ onClose }: PublishedPostsPanelProps) {
    const { user, connectAccount } = useAuth()
    const [posts, setPosts] = useState<PublishedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPost, setSelectedPost] = useState<PublishedPost | null>(null)
    const [postingPlatform, setPostingPlatform] = useState<string | null>(null)

    useEffect(() => {
        fetchPosts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchPosts() {
        setLoading(true)
        try {
            const res = await fetch("/api/post/published", { credentials: "same-origin" })
            if (!res.ok) throw new Error("Failed to load published posts")
            const data = await res.json()
            setPosts(data.posts || [])
        } catch (err) {
            console.error("Failed to load published posts", err)
        } finally {
            setLoading(false)
        }
    }

    const isConnected = (platform: string) =>
        user?.socialAccounts?.some((acc: any) => acc.platform === platform.toLowerCase())

    // Repost with automatic connect/retry
    const handleRepost = async (post: PublishedPost, targetPlatform: string) => {
        setPostingPlatform(targetPlatform)
        try {
            // if not connected -> open connect flow
            if (!isConnected(targetPlatform)) {
                await connectAccount(targetPlatform)
            }

            // call backend repost endpoint
            const res = await fetch("/api/post/repost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post._id, targetPlatform }),
                credentials: "same-origin",
            })

            const json = await res.json()
            if (!res.ok) {
                throw new Error(json?.error || "Failed to repost")
            }

            // success: refresh list and close modal
            await fetchPosts()
            setSelectedPost(null)
            showSuccess(`✅ Reposted to ${targetPlatform}`)
        } catch (err: any) {
            console.error("Repost failed", err)
            showError(err?.message || "Repost failed")
        } finally {
            setPostingPlatform(null)
        }
    }

    return (
        <div className="w-96 border-l border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-lg font-bold">Published Posts</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="h-[calc(100vh-73px)] overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center p-6">
                        <Loading color="red-900" />
                        <p className="text-sm text-muted">Loading posts</p>
                    </div>
                ) : posts.length === 0 ? (
                    <p className="text-sm text-muted">No published posts yet.</p>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post._id}
                            className="rounded-lg border border-border p-3 hover:bg-accent cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            <p className="text-sm font-medium line-clamp-3 break-words">{post.content}</p>
                            <div className="flex gap-2 mt-2 items-center">
                                <span className="text-xs text-muted">{new Date(post.publishedAt).toLocaleString()}</span>
                                <div className="ml-auto flex gap-1">
                                    <span className="px-2 py-1 text-xs rounded-full bg-muted text-white">{post.platform}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Repost modal */}
            {selectedPost && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
                    <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
                        <div className="flex items-start justify-between border-b pb-3">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Share2 className="h-5 w-5" /> Repost
                                </h3>
                                <p className="text-xs text-muted">Choose a platform to repost this content</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            <div className="mt-4 prose max-w-none">
                                <p className="text-sm break-words">{selectedPost.content}</p>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2">
                                <Button
                                    className="w-full justify-start"
                                    onClick={() => handleRepost(selectedPost, "linkedin")}
                                    disabled={postingPlatform === "linkedin"}
                                >
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    {isConnected("linkedin") ? "Repost to LinkedIn" : "Connect & Post"}
                                </Button>

                                <Button
                                    className="w-full justify-start"
                                    onClick={() => handleRepost(selectedPost, "twitter")}
                                    disabled={postingPlatform === "twitter"}
                                >
                                    <Twitter className="h-4 w-4 mr-2" />
                                    {isConnected("twitter") ? "Repost to Twitter" : "Connect & Post"}
                                </Button>

                                <Button
                                    className="w-full justify-start"
                                    onClick={() => handleRepost(selectedPost, "facebook")}
                                    disabled={postingPlatform === "facebook"}
                                >
                                    <Facebook className="h-4 w-4 mr-2" />
                                    {isConnected("facebook") ? "Repost to Facebook" : "Connect & Post"}
                                </Button>
                            </div>

                        </div>

                        <div className="mt-4 flex justify-end border-t pt-3">
                            <Button variant="outline" onClick={() => setSelectedPost(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
