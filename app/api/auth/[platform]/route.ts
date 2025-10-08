import { type NextRequest, NextResponse } from "next/server"
import { oauthConfig, getRedirectUri } from "@/lib/auth/oauth-config"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params

  if (!["linkedin", "twitter", "facebook"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
  }

  const config = oauthConfig[platform as keyof typeof oauthConfig]
  const redirectUri = getRedirectUri(platform)
  const state = crypto.randomUUID()

  // Store state in session/cookie for CSRF protection
  const response = NextResponse.redirect(
    `${config.authUrl}?` +
    new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      response_type: "code",
      state,
    }),
  )

  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  })

  return response
}
