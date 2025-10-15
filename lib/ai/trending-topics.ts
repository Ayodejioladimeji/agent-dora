
import { generateContent } from "./gemini-client"

const variations = [
  "emerging",
  "viral",
  "controversial",
  "innovative",
  "inspirational",
  "breaking",
  "popular",
]

export async function fetchTrendingTopics(industry?: string): Promise<string[]> {
  const randomAngle = variations[Math.floor(Math.random() * variations.length)]
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  console.log("selected", industry)

  const prompt = industry
    ? `List 40 ${randomAngle} trending topics in the ${industry} industry as of ${today}.  
       Return only short, catchy titles (max 6 words each).  
       Output strictly as a JSON array of strings.`
    : `List 40 ${randomAngle} trending topics across business, technology, software, fintech, startups, marketing, relationships, and social media as of ${today}.  
       Return only short, catchy titles (max 6 words each).  
       Output strictly as a JSON array of strings.`

  try {
    const response = await generateContent(prompt)

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return []
  } catch (error) {
    console.error("Failed to fetch trending topics:", error)
    return []
  }
}

