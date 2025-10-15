import { type NextRequest, NextResponse } from "next/server"
import { removeSocialAccount } from "@/lib/db/users"

export async function POST(request: NextRequest) {
  try {
    const { platform } = await request.json()
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await removeSocialAccount(userId, platform)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 })
  }
}
