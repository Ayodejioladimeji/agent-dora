import { decrypt } from "@/lib/encryption"
import type { SocialAccount } from "@/lib/db/users"

export async function postToFacebook(account: SocialAccount, content: string, images: string[] = []) {
  const accessToken = decrypt(account.accessToken)

  // Get user's pages
  const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`)

  if (!pagesResponse.ok) {
    throw new Error("Failed to get Facebook pages")
  }

  const pagesData = await pagesResponse.json()

  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error("No Facebook pages found. Please create a page to post content.")
  }

  // Use the first page
  const page = pagesData.data[0]
  const pageAccessToken = page.access_token
  const pageId = page.id

  let postId: string

  if (images.length > 0) {
    // Upload images first
    const photoIds = await Promise.all(
      images.map(async (imageUrl) => {
        const photoResponse = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/photos?` +
            new URLSearchParams({
              url: imageUrl,
              published: "false",
              access_token: pageAccessToken,
            }),
          {
            method: "POST",
          },
        )

        if (!photoResponse.ok) {
          throw new Error("Failed to upload photo to Facebook")
        }

        const photoData = await photoResponse.json()
        return photoData.id
      }),
    )

    // Create post with photos
    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed?` +
        new URLSearchParams({
          message: content,
          attached_media: JSON.stringify(photoIds.map((id) => ({ media_fbid: id }))),
          access_token: pageAccessToken,
        }),
      {
        method: "POST",
      },
    )

    if (!postResponse.ok) {
      const error = await postResponse.text()
      console.error("[v0] Facebook post error:", error)
      throw new Error("Failed to post to Facebook")
    }

    const postData = await postResponse.json()
    postId = postData.id
  } else {
    // Create text-only post
    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed?` +
        new URLSearchParams({
          message: content,
          access_token: pageAccessToken,
        }),
      {
        method: "POST",
      },
    )

    if (!postResponse.ok) {
      const error = await postResponse.text()
      console.error("[v0] Facebook post error:", error)
      throw new Error("Failed to post to Facebook")
    }

    const postData = await postResponse.json()
    postId = postData.id
  }

  return postId
}
