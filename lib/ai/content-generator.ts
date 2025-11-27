
import { generateContent } from "./gemini-client"
import type { AgentSettings } from "@/lib/db/settings"

export interface GeneratePostOptions {
  platform: "linkedin" | "twitter" | "facebook"
  topic: string
  settings: AgentSettings
  additionalContext?: string
}

export async function generatePost(options: GeneratePostOptions): Promise<string> {
  const { platform, topic, settings, additionalContext } = options

  const platformGuidelines = {
    linkedin: `
      - Professional tone
      - No markdown formatting (plain text only)
      - Use line breaks for readability
      - Include relevant hashtags at the end
      - Aim for 150-300 words
      - Focus on insights, lessons, or professional value
    `,
    twitter: `
      - Concise and punchy
      - Maximum 280 characters
      - Use hashtags strategically (2-3 max)
      - Can include emojis if appropriate
      - Hook readers in the first line
    `,
    facebook: `
      - Conversational and engaging
      - Can be longer (200-400 words)
      - Use emojis to add personality
      - Include a call-to-action
      - Break into short paragraphs for readability
    `,
  }

  const systemInstruction = `You are Dora, an expert social media content creator. You create engaging, platform-native content that drives engagement.`

  // Build instructions from settings
  let hashtagInstruction = ""
  if (settings.hashtagMode === "Manual" && settings.manualHashtags?.trim()) {
    const manualTags = settings.manualHashtags
      .split(",")
      .map((tag: any) => `#${tag.trim()}`)
      .slice(0, settings.maxHashtags)
      .join(" ")
    hashtagInstruction = `Use ONLY these hashtags at the end: ${manualTags}`
  } else if (settings.hashtagMode?.startsWith("Preset")) {
    hashtagInstruction = `Use up to ${settings.maxHashtags} hashtags relevant to the preset category "${settings.hashtagMode.replace("Preset: ", "")}". Place them at the end.`
  } else if (settings.hashtagMode === "Auto") {
    hashtagInstruction = settings.maxHashtags
      ? `Include up to ${settings.maxHashtags} trending hashtags at the end of the post.`
      : "Include relevant hashtags at the end."
  } else {
    hashtagInstruction = "Do not include any hashtags."
  }

  const emojiInstruction =
    settings.includeEmojis === "None"
      ? "Do not include any emojis."
      : settings.includeEmojis === "Subtle"
        ? "Use emojis sparingly, only where it enhances clarity or tone."
        : "Use emojis moderately and naturally throughout the post."

  const toneInstruction = Array.isArray(settings.tone)
    ? `Tone(s): ${settings.tone.join(", ")}`
    : `Tone: ${settings.tone}`

  const formatInstruction = settings.format
    ? `Preferred structure/format: ${settings.format}`
    : ""

  const ctaInstruction = settings.cta === "default" ? "Don't add the cta" : settings.cta

  const languageInstruction = settings.language
    ? `Write the post in ${settings.language}.`
    : ""

  const industryInstruction = settings.industry
    ? `Tailor content for the ${settings.industry} industry.`
    : ""

  const tagInstruction =
    settings.tagEntities && settings.tagEntities.trim()
      ? `Tag these people/companies in the content where natural: ${settings.tagEntities}`
      : ""

  const prompt = `
Create a ${platform} post about: ${topic}

${toneInstruction}
${formatInstruction}
${languageInstruction}
${industryInstruction}
${emojiInstruction}
${hashtagInstruction}
${ctaInstruction}
${tagInstruction}

Platform Guidelines:
${platformGuidelines[platform]}

${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Generate ONLY the post content, no explanations or meta-commentary.
${platform === "linkedin" ? "IMPORTANT: Use plain text only, NO markdown formatting." : ""}
  `.trim()

  try {
    const content = await generateContent(prompt, systemInstruction)
    return content.trim()
  } catch (error) {
    console.error("Failed to generate content:", error)
    throw new Error("Failed to generate content")
  }
}
