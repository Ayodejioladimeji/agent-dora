import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Draft {
  _id?: ObjectId
  userId: string
  chatId: string
  platform: "linkedin" | "twitter" | "facebook"
  content: string
  images: string[]
  status: "pending" | "approved" | "rejected" | "posted"
  createdAt: Date
  updatedAt: Date
  metadata?: {
    topic?: string
    tone?: string
  }
}

export async function createDraft(draft: Omit<Draft, "_id" | "createdAt" | "updatedAt">): Promise<Draft> {
  const db = await getDb()
  const newDraft: Draft = {
    ...draft,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.collection("drafts").insertOne(newDraft)
  return { ...newDraft, _id: result.insertedId }
}

export async function getDraftsByUser(userId: string): Promise<Draft[]> {
  const db = await getDb()
  return (await db.collection("drafts").find({ userId }).sort({ createdAt: -1 }).toArray()) as Draft[]
}

export async function getDraftById(draftId: string): Promise<Draft | null> {
  const db = await getDb()
  return (await db.collection("drafts").findOne({ _id: new ObjectId(draftId) })) as Draft | null
}

export async function updateDraftStatus(draftId: string, status: Draft["status"]): Promise<void> {
  const db = await getDb()
  await db.collection("drafts").updateOne(
    { _id: new ObjectId(draftId) },
    {
      $set: { status, updatedAt: new Date() },
    },
  )
}

export async function updateDraft(draftId: string, updates: Partial<Draft>): Promise<void> {
  const db = await getDb()
  await db.collection("drafts").updateOne(
    { _id: new ObjectId(draftId) },
    {
      $set: { ...updates, updatedAt: new Date() },
    },
  )
}
