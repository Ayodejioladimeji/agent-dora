import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/db/users"
import { getDraftById, updateDraftStatus } from "@/lib/db/drafts"
import { createPost } from "@/lib/db/posts"
import { postToLinkedIn } from "@/lib/social/linkedin"
import { postToTwitter } from "@/lib/social/twitter"
import { postToFacebook } from "@/lib/social/facebook"

export async function POST(request: NextRequest) {
  try {
    const { draftId, userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get draft
    const draft = await getDraftById(draftId)
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    if (draft.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get user with social accounts
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the social account for the platform
    const socialAccount = user.socialAccounts.find((acc) => acc.platform === draft.platform)
    if (!socialAccount) {
      return NextResponse.json({ error: `${draft.platform} account not connected` }, { status: 400 })
    }

    // Post to the platform
    let platformPostId: string

    try {
      switch (draft.platform) {
        case "linkedin":
          platformPostId = await postToLinkedIn(socialAccount, draft.content, draft.images)
          break
        case "twitter":
          platformPostId = await postToTwitter(socialAccount, draft.content, draft.images)
          break
        case "facebook":
          platformPostId = await postToFacebook(socialAccount, draft.content, draft.images)
          break
        default:
          throw new Error("Unsupported platform")
      }
    } catch (error) {
      console.error("[v0] Failed to post to platform:", error)
      return NextResponse.json({ error: `Failed to post to ${draft.platform}` }, { status: 500 })
    }

    // Update draft status
    await updateDraftStatus(draftId, "posted")

    // Create post record
    await createPost({
      userId,
      draftId,
      platform: draft.platform,
      content: draft.content,
      images: draft.images,
      platformPostId,
      publishedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      platformPostId,
      message: `Successfully posted to ${draft.platform}`,
    })
  } catch (error) {
    console.error("[v0] Publish API error:", error)
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 })
  }
}
