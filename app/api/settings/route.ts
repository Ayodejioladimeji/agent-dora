import { type NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings, createDefaultSettings } from "@/lib/db/settings"

export async function GET(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    let settings = await getSettings(userId)

    if (!settings) {
      settings = await createDefaultSettings(userId)
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const updates = await request.json()

    await updateSettings(userId, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
