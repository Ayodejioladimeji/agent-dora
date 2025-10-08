import { getDb } from "@/lib/mongodb"
import type { ObjectId } from "mongodb"
import { agentConfiguration } from "@/lib/agent-config"

export interface AgentSettings {
  _id?: ObjectId
  userId: string
  [key: string]: any
  updatedAt: Date
}

export async function getSettings(userId: string): Promise<AgentSettings | null> {
  const db = await getDb()
  return (await db.collection("settings").findOne({ userId })) as AgentSettings | null
}

export async function createDefaultSettings(userId: string): Promise<AgentSettings> {
  const db = await getDb()

  const defaultSettings: any = {
    userId,
    updatedAt: new Date(),
  }

  for (const field of agentConfiguration) {
    defaultSettings[field.label] = field.default
  }

  const result = await db.collection("settings").insertOne(defaultSettings)
  return { ...defaultSettings, _id: result.insertedId }
}

export async function updateSettings(userId: string, updates: Partial<AgentSettings>): Promise<void> {
  const db = await getDb()
  await db.collection("settings").updateOne(
    { userId },
    {
      $set: { ...updates, updatedAt: new Date() },
    },
    { upsert: true },
  )
}
