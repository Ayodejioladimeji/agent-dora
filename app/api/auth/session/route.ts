import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/db/users"
import { ClientUser } from "@/types/user"


export async function GET(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value

  if (!userId) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ user: null })
    }

    const sanitizedUser: ClientUser = {
      id: user._id?.toString() || "",
      email: user.email,
      name: user.name,
      socialAccounts: user.socialAccounts.map((account) => ({
        platform: account.platform,
        profileId: account.profileId,
        profileName: account.profileName,
        hasToken: !!account.accessToken, // Boolean flag indicating token exists
      })),
    }

    return NextResponse.json({ user: sanitizedUser })
  } catch (error) {
    console.error("[v0] Session error:", error)
    return NextResponse.json({ user: null })
  }
}
