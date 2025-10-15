import { decrypt } from "@/lib/encryption"
import type { SocialAccount } from "@/lib/db/users"

export async function postToLinkedIn(account: SocialAccount, content: string, images: string[] = []) {
  const accessToken = decrypt(account.accessToken)

  // Get user URN
  const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!userInfoResponse.ok) {
    throw new Error("Failed to get LinkedIn user info")
  }

  const userInfo = await userInfoResponse.json()
  const authorUrn = `urn:li:person:${userInfo.sub}`

  // Prepare post payload
  const payload: any = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: images.length > 0 ? "IMAGE" : "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  }

  // Add images if provided
  if (images.length > 0) {
    const mediaAssets = await Promise.all(
      images.map(async (imageUrl) => {
        // Register upload
        const registerResponse = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          }),
        })

        const registerData = await registerResponse.json()
        const uploadUrl =
          registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl
        const asset = registerData.value.asset

        // Upload image
        const imageResponse = await fetch(imageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()

        await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: imageBuffer,
        })

        return {
          status: "READY",
          description: {
            text: "",
          },
          media: asset,
          title: {
            text: "",
          },
        }
      }),
    )

    payload.specificContent["com.linkedin.ugc.ShareContent"].media = mediaAssets
  }

  // Create post
  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("LinkedIn post error:", error)
    throw new Error("Failed to post to LinkedIn")
  }

  const result = await response.json()
  return result.id
}
