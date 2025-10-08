import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db/users"
import { createDefaultSettings } from "@/lib/db/settings"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Check if user exists
    let user = await getUserByEmail(email)

    if (!user) {
      // Create new user
      user = await createUser(email, name)
      // Create default settings
      await createDefaultSettings(user._id!.toString())
    }

    // Set user session cookie
    const response = NextResponse.json({ user: { id: user._id?.toString(), email: user.email, name: user.name } })

    response.cookies.set("user_id", user._id!.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("[v0] User creation error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
