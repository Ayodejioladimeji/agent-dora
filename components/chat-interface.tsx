"use client"

import { useState, useEffect } from "react"
import { ChatHeader } from "./chat-header"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { SettingsPanel } from "./settings-panel"
import { useAuth } from "@/lib/hooks/use-auth"
import { PublishedPostsPanel } from "./published-posts-panel"
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer"
import { useMediaQuery } from "@/lib/media-query"

export function ChatInterface() {
  const [showSettings, setShowSettings] = useState(false)
  const [showPublished, setShowPublished] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const { user } = useAuth()
  const [callback, setCallback] = useState(false)
  const [images, setImages] = useState<string[]>([])


  useEffect(() => {
    if (user?.id) {
      loadMessages()
    }
  }, [user?.id, callback])

  useEffect(() => {
    if (messages.length > 0 && chatId) {
      saveMessages()
    }
  }, [messages, chatId])

  const loadMessages = async () => {
    try {
      const userId = user?.id || "demo"
      const response = await fetch(`/api/chat/messages?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to load messages")
      }

      const data = await response.json()
      setChatId(data.chatId)
      setMessages(data.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
    } catch (error) {
      console.error("[v0] Failed to load messages:", error)
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Hi! I'm Dora, your AI social media assistant. I can help you create engaging content for LinkedIn, Twitter, and Facebook. What would you like to do today?",
          timestamp: new Date(),
          actions: [
            { label: "📋 Paste My Content", value: "paste_content", variant: "default" },
            { label: "🔥 Fetch Trending Topics", value: "fetch_trends", variant: "outline" },
          ],
        },
      ])
    }
  }

  const saveMessages = async () => {
    try {
      const userId = user?.id || "demo"
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messages, userId }),
      })
    } catch (error) {
      console.error("Failed to save messages:", error)
    }
  }

  const handleAction = async (action: string, messageMetadata?: any) => {
    console.log(action)

    if (action === "fetch_trends") {
      await handleSendMessage("", "fetch_trends")
    } else if (action === "paste_content") {
      const promptMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Great! Which platform would you like to create content for?",
        timestamp: new Date(),
        actions: [
          { label: "LinkedIn", value: "platform_paste_linkedin", variant: "default" },
          { label: "Twitter", value: "platform_paste_twitter", variant: "outline" },
          { label: "Facebook", value: "platform_paste_facebook", variant: "outline" },
        ],
      }
      setMessages((prev) => [...prev, promptMessage])
    } else if (action.startsWith("platform_paste_")) {
      const platform = action.replace("platform_paste_", "")
      const promptMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Perfect! Please paste your content below and I'll optimize it for ${platform}.`,
        timestamp: new Date(),
        metadata: { awaitingContent: true, platform },
      }
      setMessages((prev) => [...prev, promptMessage])
    } else if (action.startsWith("topic_")) {
      const topicIndex = Number.parseInt(action.split("_")[1])
      const topic = messageMetadata?.topics?.[topicIndex]
      if (topic) {
        await handleSendMessage(`I want to create content about: ${topic}`, "select_topic", { topic })
      }
    } else if (action.startsWith("platform_")) {
      const platform = action.split("_")[1]
      const topic = messageMetadata?.selectedTopic

      await handleSendMessage(`Create a ${platform} post`, "generate_post", { platform, topic })
    } else if (action === "approve_post" || action === "looks_good") {
      const platform = messageMetadata?.platform
      const connectedAccount = user?.socialAccounts?.find((acc) => acc.platform === platform)
      const hasAuth = connectedAccount?.hasToken

      if (!hasAuth) {
        const authMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `To post to ${platform}, you need to connect your ${platform} account first. Please click the settings icon (⚙️) in the top right, go to the "Connected Accounts" section, and authenticate with ${platform}. Then come back and we can proceed!`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, authMessage])
        return
      }

      await handleSendMessage("", "confirm_post", messageMetadata)
    } else if (action === "change_platform" || action === "try_another_platform") {
      const platformMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Please select preferred platform?",
        timestamp: new Date(),
        actions: [
          { label: "LinkedIn", value: "platform_linkedin", variant: "default" },
          { label: "Twitter", value: "platform_twitter", variant: "outline" },
          { label: "Facebook", value: "platform_facebook", variant: "outline" },
        ],
        metadata: messageMetadata,
      }
      setMessages((prev) => [...prev, platformMessage])
    } else if (action === "regenerate") {
      await handleSendMessage("", "regenerate_post", messageMetadata)
    }
    else if (action === "clear_chat") {
      await handleSendMessage("", "clear_chat", messageMetadata)
    }

  }

  const handleSendMessage = async (content: string, action?: string, metadata?: any) => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.metadata?.awaitingContent && content) {
      action = "generate_from_paste"
      metadata = { ...metadata, platform: lastMessage.metadata.platform, userContent: content }
    }

    if (content) {
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        images
      }
      setMessages((prev) => [...prev, userMessage])
    }

    setIsLoading(true)

    // 👇 add a temporary loader bubble
    const loadingId = "loading-" + Date.now().toString()
    const loadingMsg = {
      id: loadingId,
      role: "assistant",
      content: "Processing...",
      timestamp: new Date(),
      metadata: { loading: true },
    }
    setMessages((prev) => [...prev, loadingMsg])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          action,
          metadata,
          chatId,
          userId: user?.id || "demo",
          images,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const data = await response.json()
      setImages([])
      if (data.metadata?.flowComplete) {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `${data.response}\n\nWhat would you like to do next?`,
            timestamp: new Date(),
            actions: [
              { label: "📋 Paste My Content", value: "paste_content", variant: "default" },
              { label: "🔥 Fetch Trending Topics", value: "fetch_trends", variant: "outline" },
            ],
          },
        ])
        return
      }

      // 👇 replace the loader bubble with actual assistant message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
              ...m,
              content: data.response,
              metadata: data.metadata,
              actions: data.actions,
              loading: false,
            }
            : m
        )
      )

    } catch (error) {
      console.error("[v0] Failed to send message:", error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
              ...m,
              content: "Sorry, I encountered an error. Please try again or check your settings.",
              metadata: {},
            }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className="flex h-[90vh] lg:h-screen bg-surface">
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader
          onSettingsClick={() => setShowSettings(!showSettings)}
          onPublishedClick={() => setShowPublished(true)}
        />
        <ChatMessages messages={messages} onAction={handleAction} chatId={chatId} callback={() => setCallback(!callback)} />
        <ChatInput onSendMessage={(content) => handleSendMessage(content)} disabled={isLoading} images={images} setImages={setImages} />
      </div>

      {isDesktop && (
        <>
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          {showPublished && <PublishedPostsPanel onClose={() => setShowPublished(false)} />}
        </>
      )}


      {!isDesktop && (
        <>
          <Drawer open={showSettings} onOpenChange={setShowSettings} direction="right">
            <DrawerContent className="w-full ml-auto h-full rounded-none">
              <DrawerTitle></DrawerTitle>
              <SettingsPanel onClose={() => setShowSettings(false)} />
            </DrawerContent>
          </Drawer>

          <Drawer open={showPublished} onOpenChange={setShowPublished} direction="right">
            <DrawerContent className="w-full ml-auto h-full rounded-none">
              <DrawerTitle></DrawerTitle>
              <PublishedPostsPanel onClose={() => setShowPublished(false)} />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  )
}


