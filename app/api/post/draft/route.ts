import { type NextRequest, NextResponse } from "next/server"
import { getDraftsByUser, updateDraft } from "@/lib/db/drafts"

export async function GET(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const drafts = await getDraftsByUser(userId)
    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("[v0] Failed to fetch drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { draftId, updates } = await request.json()
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await updateDraft(draftId, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to update draft:", error)
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
  }
}
