import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateContent(prompt: string, systemInstruction?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction,
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function streamContent(prompt: string, systemInstruction?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction,
  })

  const result = await model.generateContentStream(prompt)
  return result.stream
}
