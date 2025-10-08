import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Post {
  _id?: ObjectId
  userId: string
  draftId: string
  platform: "linkedin" | "twitter" | "facebook"
  content: string
  images: string[]
  platformPostId: string
  publishedAt: Date
  metadata?: {
    likes?: number
    comments?: number
    shares?: number
  }
}

export async function createPost(post: Omit<Post, "_id">): Promise<Post> {
  const db = await getDb()
  const result = await db.collection("posts").insertOne(post)
  return { ...post, _id: result.insertedId }
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const db = await getDb()
  return (await db.collection("posts").find({ userId }).sort({ publishedAt: -1 }).toArray()) as Post[]
}

export async function getPostById(postId: string): Promise<Post | null> {
  const db = await getDb()
  return (await db.collection("posts").findOne({ _id: new ObjectId(postId) })) as Post | null
}
