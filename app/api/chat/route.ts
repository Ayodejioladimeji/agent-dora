import { type NextRequest, NextResponse } from "next/server"
import { generateContent } from "@/lib/ai/gemini-client"
import { getUserById } from "@/lib/db/users"
import { postToLinkedIn } from "@/lib/social/linkedin"
import { postToTwitter } from "@/lib/social/twitter"
import { postToFacebook } from "@/lib/social/facebook"
import { createPost } from "@/lib/db/posts"
import { addMessage } from "@/lib/db/chats"
import { generatePost } from "@/lib/ai/content-generator"
import { AgentSettings, getSettings } from "@/lib/db/settings"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatId, userId, action, metadata } = body

    // For authenticated users, use full functionality
    return handleAuthenticatedMode(message, action, metadata, userId, chatId)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}


async function handleDemoMode(message: string, userId: string, action?: string, metadata?: any) {
  let response = ""
  const responseMetadata: any = {}
  let actions: any[] | undefined

  try {
    if (action === "fetch_trends") {
      const { fetchTrendingTopics } = await import("@/lib/ai/trending-topics")
      const settings: any = await getSettings(userId)
      let topics = await fetchTrendingTopics(settings.industry)

      // Fallback to mock if API fails
      if (topics.length === 0) {
        topics = [
          "AI and Machine Learning in 2025",
          "Remote Work Best Practices",
          "Sustainable Business Strategies",
          "Digital Marketing Trends",
          "Productivity Hacks for Entrepreneurs",
          "Cybersecurity for Small Businesses",
          "The Future of E-commerce",
          "Leadership in the Digital Age",
          "Mental Health in the Workplace",
          "Green Technology Innovations",
        ]
      }

      response = "Here are the current trending topics. Click on any topic to create content:"
      responseMetadata.topics = topics

      actions = topics.map((topic, i) => ({
        label: topic,
        value: `topic_${i}`,
        variant: "outline" as const,
      }))
    }
    else if (action === "select_topic") {
      const topic = metadata?.topic || message
      response = `Great choice! Which platform would you like to create content for?`
      responseMetadata.selectedTopic = topic

      actions = [
        { label: "LinkedIn", value: "platform_linkedin", variant: "default" },
        { label: "Twitter", value: "platform_twitter", variant: "outline" },
        { label: "Facebook", value: "platform_facebook", variant: "outline" },
      ]
    }
    else if (action === "generate_post" || action === "generate_from_paste") {
      const platform = metadata?.platform || "linkedin"
      const topic = metadata?.topic || metadata?.userContent

      const userSettings = await getSettings(userId)

      const defaultAgentSettings: any = {
        tone: "professional",
        includeHashtags: true,
        includeEmojis: false,
        maxHashtags: 5,
      }

      // Ensure settings is always AgentSettings (no null)
      const settings: AgentSettings = userSettings ?? defaultAgentSettings

      try {
        const generatedContent = await generatePost({
          platform,
          topic,
          settings,
          additionalContext: metadata?.additionalContext,
        })

        response = `Here's your ${platform} post:\n\n${generatedContent}\n\nWhat would you like to do next?`
        responseMetadata.platform = platform
        responseMetadata.topic = topic
        responseMetadata.generatedContent = generatedContent

        actions = [
          { label: "✅ Looks Good", value: "looks_good", variant: "default" },
          { label: "🔄 Regenerate Post", value: "change_platform", variant: "outline" },
          { label: "🎯 Clear chat", value: "clear_chat", variant: "outline" },
        ]
      } catch (error) {
        console.error("Gemini generation error:", error)
        response = `I'll create a ${platform} post about "${topic}" for you. However, I need the GEMINI_API_KEY to be configured. Please add it to your environment variables.`
      }
    }
    else if (action === "clear_chat") {
      response = `✅ Chat cleared successfully, you can start again!`
      responseMetadata.flowComplete = true
    }
    else {
      // Check if user wants to restart the flow
      if (isRestartIntent(message)) {
        response = "Got it! Let's start fresh 🎉 Please tell me what you'd like to post about."
        responseMetadata.flowComplete = true
        actions = [
          { label: "Fetch Trending Topics", value: "fetch_trends", variant: "default" },
          { label: "Paste My Own Idea", value: "generate_from_paste", variant: "outline" },
        ]
      } else {

        try {
          const conversationPrompt = `
            You are Dora, a warm and friendly social media assistant. 
            Have a natural, human-like conversation with the user based on this message: "${message}".
            Keep your tone engaging and supportive, like chatting with a friend. 
            Always reply in plain text only — do not use markdown, bullet points, or formatting symbols.
            `
          response = await generateContent(conversationPrompt)

        } catch (error) {
          // Fallback response if Gemini is not configured
          response = handleGeneralMessage(message)
        }
      }
    }

    return NextResponse.json({ response, metadata: responseMetadata, actions })
  } catch (error) {
    console.error("Demo mode error:", error)
    return NextResponse.json(
      {
        response:
          "Please open the settings panel to set your default configurations",
        metadata: {},
      },
      { status: 200 },
    )
  }
}


async function handleAuthenticatedMode(
  message: string,
  action: string | undefined,
  metadata: any,
  userId: string,
  chatId: string,
) {
  let response = ""
  const responseMetadata: any = {}
  let actions: any[] | undefined

  try {
    if (action === "confirm_post") {
      const user = await getUserById(userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const platform = metadata?.platform
      const content = metadata?.generatedContent || metadata?.content
      const draftId = metadata?.draftId
      const images = metadata?.images || []

      if (!platform || !content) {
        return NextResponse.json({ error: "Missing platform or content" }, { status: 400 })
      }

      // get user's connected social account
      const socialAccount = user.socialAccounts?.find((acc) => acc.platform === platform)
      if (!socialAccount) {
        return NextResponse.json({ error: `${platform} account not connected` }, { status: 400 })
      }

      let platformPostId: string

      // post to correct platform
      switch (platform) {
        case "linkedin":
          platformPostId = await postToLinkedIn(socialAccount, content, images)
          break
        case "twitter":
          platformPostId = await postToTwitter(socialAccount, content, images)
          break
        case "facebook":
          platformPostId = await postToFacebook(socialAccount, content, images)
          break
        default:
          throw new Error("Unsupported platform")
      }

      // save post in DB
      await createPost({
        userId,
        draftId,
        platform,
        content,
        images,
        platformPostId,
        publishedAt: new Date(),
      })

      response = `✅ Your post has been published on ${platform}!`
      responseMetadata.posted = true
      responseMetadata.flowComplete = true

      // also push into chat history
      await addMessage(chatId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      })

      return NextResponse.json({ response, metadata: responseMetadata, actions })
    }

    // fall back to demo for other actions for now
    return handleDemoMode(message, userId, action, metadata)
  } catch (error) {
    console.error("Authenticated mode error:", error)
    return NextResponse.json({ error: "Failed to process authenticated action" }, { status: 500 })
  }
}

function handleGeneralMessage(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you create amazing social media content today?"
  }

  if (lowerMessage.includes("trend") || lowerMessage.includes("topic")) {
    return "I can fetch the latest trending topics for you! Just click the 'Fetch Trending Topics' button."
  }

  if (lowerMessage.includes("help")) {
    return "I can help you:\n\n1. Fetch trending topics to inspire your content\n2. Generate posts for LinkedIn, Twitter, and Facebook\n3. Optimize your existing content for different platforms\n\nWhat would you like to do?"
  }

  return "I'm here to help you create engaging social media content! You can ask me to fetch trending topics, generate posts, or just chat about your content ideas."
}


function isRestartIntent(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes("start again") ||
    lower.includes("restart") ||
    lower.includes("new post") ||
    lower.includes("create new post") ||
    lower.includes("begin again")
  )
}
