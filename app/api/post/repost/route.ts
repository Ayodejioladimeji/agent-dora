import { NextResponse } from "next/server"
import { getPostById, createPost } from "@/lib/db/posts"
import { getUserById } from "@/lib/db/users"
import { postToLinkedIn } from "@/lib/social/linkedin"
import { postToTwitter } from "@/lib/social/twitter"
import { postToFacebook } from "@/lib/social/facebook"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { postId, targetPlatform } = body

        if (!postId || !targetPlatform) {
            return NextResponse.json({ error: "postId and targetPlatform are required" }, { status: 400 })
        }

        // get user id from cookie
        const cookieHeader = request.headers.get("cookie") || ""
        const match = cookieHeader.match(/user_id=([^;]+)/)
        const userId = match?.[1]

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const original = await getPostById(postId)
        if (!original) {
            return NextResponse.json({ error: "Original post not found" }, { status: 404 })
        }

        if (original.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const user = await getUserById(userId)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const target = targetPlatform.toLowerCase()
        const socialAccount = user.socialAccounts?.find((s: any) => s.platform === target)
        if (!socialAccount) {
            return NextResponse.json({ error: "not_connected", message: `${target} account not connected` }, { status: 400 })
        }

        // post to the chosen platform
        let platformPostId: string
        try {
            switch (target) {
                case "linkedin":
                    platformPostId = await postToLinkedIn(socialAccount, original.content, original.images || [])
                    break
                case "twitter":
                    platformPostId = await postToTwitter(socialAccount, original.content, original.images || [])
                    break
                case "facebook":
                    platformPostId = await postToFacebook(socialAccount, original.content, original.images || [])
                    break
                default:
                    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
            }
        } catch (err: any) {
            console.error("Repost failed:", err)
            return NextResponse.json({ error: "Failed to post to target platform", details: err.message || err }, { status: 500 })
        }

        const newPost = await createPost({
            userId,
            draftId: original.draftId ?? "",
            platform: target,
            content: original.content,
            images: original.images ?? [],
            platformPostId,
            publishedAt: new Date(),
        })

        return NextResponse.json({ success: true, post: { ...newPost, _id: newPost._id?.toString() } })
    } catch (err) {
        console.error("Repost error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
