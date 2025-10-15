import { NextResponse } from "next/server"
import { getPostsByUser } from "@/lib/db/posts"

export async function GET(request: Request) {
    try {
        // user id from cookie (server-side)
        // adapt to NextRequest if using it — Request is fine in app router + cookies via headers
        const cookieHeader = request.headers.get("cookie") || ""
        const match = cookieHeader.match(/user_id=([^;]+)/)
        const userId = match?.[1]

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const posts = await getPostsByUser(userId)

        // sanitize/format
        const out = posts.map((p) => ({
            _id: p._id?.toString(),
            userId: p.userId,
            draftId: p.draftId,
            platform: p.platform,
            content: p.content,
            images: p.images,
            platformPostId: p.platformPostId,
            publishedAt: p.publishedAt,
        }))

        return NextResponse.json({ posts: out })
    } catch (err) {
        console.error("Failed to fetch published posts:", err)
        return NextResponse.json({ error: "Failed to fetch published posts" }, { status: 500 })
    }
}
