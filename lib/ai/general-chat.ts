import { generateContent } from "./gemini-client"
import type { AgentSettings } from "@/lib/db/settings"

export interface GeneratePostOptions {
    topic: string
    settings: AgentSettings
}

export async function generalChats(options: GeneratePostOptions): Promise<string> {
    const { topic, settings } = options

    const systemDirectives = [
        "You are a friendly conversational assistant.",
        "Write naturally, as if chatting with a friend.",
        "Keep sentences short and clear.",
        "Sound warm, approachable, and engaging.",
        "Avoid sounding like a lecture or formal essay.",
        "Do not provide multiple variations — just one clear response.",
        settings.includeEmojis === "None"
            ? "Do not use emojis."
            : settings.includeEmojis === "Subtle"
                ? "Use emojis sparingly where they add friendliness."
                : "Use emojis moderately to keep the tone casual.",
    ]
        .filter(Boolean)
        .join(" ")

    const prompt = `
${systemDirectives}

Use the provided configurations exactly as given.
Follow the specified tone, audience, format, and other parameters without deviation.
Do not create variations. Deliver one final, natural, and friendly chat-style response.

Language: ${settings.language}
Tone(s): ${Array.isArray(settings.tone) ? settings.tone.join(", ") : settings.tone}
Target Audience: ${Array.isArray(settings.targetAudience) ? settings.targetAudience.join(", ") : settings.targetAudience}
Primary Goal: ${settings.goal}
Format: ${settings.format}
Reading Level: ${settings.readingLevel}
Include Story: ${settings.includeStory ? "Yes" : "No"}
Keywords (use casually and naturally): ${settings.keywords || "N/A"}
Entities to Mention: ${settings.tagEntities || "None"}
Desired CTA: ${settings.cta || "N/A"}

Topic:
${topic}
`.trim()

    try {
        const content = await generateContent(prompt, systemDirectives)
        return content.trim()
    } catch (error) {
        console.error("Failed to generate content:", error)
        throw new Error("Failed to generate content")
    }
}
