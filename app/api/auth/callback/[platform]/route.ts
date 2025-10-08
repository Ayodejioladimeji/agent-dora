import { type NextRequest, NextResponse } from "next/server"
import { oauthConfig, getRedirectUri } from "@/lib/auth/oauth-config"
import { addSocialAccount } from "@/lib/db/users"
import { encrypt } from "@/lib/encryption"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`/?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect("/?error=missing_params")
  }

  // Verify state for CSRF protection
  const storedState = request.cookies.get(`oauth_state_${platform}`)?.value
  if (state !== storedState) {
    return NextResponse.redirect("/?error=invalid_state")
  }

  try {
    const config = oauthConfig[platform as keyof typeof oauthConfig]
    const redirectUri = getRedirectUri(platform)

    // Exchange code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    // Fetch user profile
    const profile = await fetchUserProfile(platform, tokenData.access_token)

    // Get userId from session (you'll need to implement session management)
    const userId = request.cookies.get("user_id")?.value
    if (!userId) {
      return NextResponse.redirect("/?error=no_user_session")
    }

    console.log("My token", tokenData)

    // Encrypt and store tokens
    await addSocialAccount(userId, {
      platform: platform as "linkedin" | "twitter" | "facebook",
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : undefined,
      expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      profileId: profile.id,
      profileName: profile.name,
    })

    // Redirect back to app with success
    const response = NextResponse.redirect(`http://localhost:3000/?platform=${platform}&success=true`)
    response.cookies.delete(`oauth_state_${platform}`)
    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    // return NextResponse.json({ error: "my auth error" }, { status: 500 })
    return NextResponse.redirect("http://localhost:3000/?platform=${platform}&success=false")
  }
}

async function fetchUserProfile(platform: string, accessToken: string) {
  let profileUrl = ""
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  switch (platform) {
    case "linkedin":
      profileUrl = "https://api.linkedin.com/v2/userinfo"
      break
    case "twitter":
      profileUrl = "https://api.twitter.com/2/users/me"
      break
    case "facebook":
      profileUrl = "https://graph.facebook.com/me?fields=id,name"
      break
  }

  const response = await fetch(profileUrl, { headers })
  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }

  const data = await response.json()

  // Normalize profile data
  return {
    id: data.id || data.sub,
    name: data.name || data.given_name + " " + data.family_name,
  }
}
