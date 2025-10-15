import { decrypt } from "@/lib/encryption"
import type { SocialAccount } from "@/lib/db/users"

export async function postToTwitter(account: SocialAccount, content: string, images: string[] = []) {
  const accessToken = decrypt(account.accessToken)

  let mediaIds: string[] = []

  // Upload images if provided
  if (images.length > 0) {
    mediaIds = await Promise.all(
      images.map(async (imageUrl) => {
        // Download image
        const imageResponse = await fetch(imageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString("base64")

        // Upload to Twitter
        const uploadResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            media_data: base64Image,
          }),
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image to Twitter")
        }

        const uploadData = await uploadResponse.json()
        return uploadData.media_id_string
      }),
    )
  }

  // Create tweet
  const payload: any = {
    text: content,
  }

  if (mediaIds.length > 0) {
    payload.media = {
      media_ids: mediaIds,
    }
  }

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Twitter post error:", error)
    throw new Error("Failed to post to Twitter")
  }

  const result = await response.json()
  return result.data.id
}
