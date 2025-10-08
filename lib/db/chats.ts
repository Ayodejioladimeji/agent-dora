import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    label: string
    value: string
    variant?: "default" | "outline" | "ghost"
  }>
  metadata?: {
    platform?: string
    action?: string
    draftId?: string
    postId?: string
    selectedTopic?: string
    topics?: string[]
    awaitingContent?: boolean
    awaitingModification?: boolean
    [key: string]: any
  }
}

export interface Chat {
  _id?: ObjectId
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export async function createChat(userId: string): Promise<Chat> {
  const db = await getDb()
  const chat: Chat = {
    userId,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.collection<Chat>("chats").insertOne(chat)
  return { ...chat, _id: result.insertedId }
}

export async function getChatsByUser(userId: string): Promise<Chat[]> {
  const db = await getDb()
  return (await db.collection<Chat>("chats").find({ userId }).sort({ updatedAt: -1 }).toArray()) as Chat[]
}

export async function getChatById(chatId: string): Promise<Chat | null> {
  const db = await getDb()
  return (await db.collection<Chat>("chats").findOne({ _id: new ObjectId(chatId) })) as Chat | null
}

export async function addMessage(chatId: string, message: Message): Promise<void> {
  const db = await getDb()
  await db.collection<Chat>("chats").updateOne(
    { _id: new ObjectId(chatId) },
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() },
    },
  )
}

export async function deleteMessage(chatId: string, messageId: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<Chat>("chats").updateOne(
    { _id: new ObjectId(chatId) },
    { $pull: { messages: { id: messageId } }, $set: { updatedAt: new Date() } }
  )
  return result.matchedCount > 0
}

export async function updateMessages(chatId: string, messages: Message[]): Promise<void> {
  const db = await getDb()
  await db.collection<Chat>("chats").updateOne(
    { _id: new ObjectId(chatId) },
    {
      $set: { messages, updatedAt: new Date() },
    },
  )
}

export async function getOrCreateLatestChat(userId: string): Promise<Chat> {
  const db = await getDb()
  const existingChat = await db.collection<Chat>("chats").findOne({ userId }, { sort: { updatedAt: -1 } })

  if (existingChat) {
    return existingChat
  }

  const chat: Chat = {
    userId,
    messages: [
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
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.collection<Chat>("chats").insertOne(chat)
  return { ...chat, _id: result.insertedId }
}
