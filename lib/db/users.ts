import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface SocialAccount {
  platform: "linkedin" | "twitter" | "facebook"
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  profileId: string
  profileName: string
}

export interface User {
  _id?: ObjectId
  email: string
  name: string
  createdAt: Date
  socialAccounts: SocialAccount[]
}

export async function createUser(email: string, name: string): Promise<User> {
  const db = await getDb()
  const user: User = {
    email,
    name,
    createdAt: new Date(),
    socialAccounts: [],
  }
  const result = await db.collection<User>("users").insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  return await db.collection<User>("users").findOne({ email })
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb()
  return await db.collection<User>("users").findOne({ _id: new ObjectId(id) })
}

export async function addSocialAccount(userId: string, account: SocialAccount): Promise<void> {
  const db = await getDb()
  await db.collection<User>("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $pull: { socialAccounts: { platform: account.platform } as any },
    },
  )
  await db.collection<User>("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $push: { socialAccounts: account },
    },
  )
}

export async function removeSocialAccount(userId: string, platform: string): Promise<void> {
  const db = await getDb()
  await db.collection<User>("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $pull: { socialAccounts: { platform } as any },
    },
  )
}
