export interface ValidationResult {
  isValid: boolean
  issues: string[]
  warnings: string[]
}

export function validateContent(content: string, platform: "linkedin" | "twitter" | "facebook"): ValidationResult {
  const issues: string[] = []
  const warnings: string[] = []

  // Platform-specific validation
  switch (platform) {
    case "twitter":
      if (content.length > 280) {
        issues.push("Content exceeds Twitter's 280 character limit")
      }
      break

    case "linkedin":
      if (content.length > 3000) {
        issues.push("Content exceeds LinkedIn's 3000 character limit")
      }
      // Check for markdown in LinkedIn posts
      if (/[*_`#]/.test(content)) {
        warnings.push("LinkedIn post contains markdown characters that may not render correctly")
      }
      break

    case "facebook":
      if (content.length > 63206) {
        issues.push("Content exceeds Facebook's character limit")
      }
      break
  }

  // Common validation
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = content.match(urlRegex)
  if (urls && urls.length > 5) {
    warnings.push("Post contains many URLs which may reduce engagement")
  }

  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex)
  if (hashtags && hashtags.length > 10) {
    warnings.push("Too many hashtags may appear spammy")
  }

  // Check for potentially problematic content
  const spamWords = ["click here", "buy now", "limited time", "act now"]
  const lowerContent = content.toLowerCase()
  const foundSpamWords = spamWords.filter((word) => lowerContent.includes(word))
  if (foundSpamWords.length > 0) {
    warnings.push(`Content contains potentially spammy phrases: ${foundSpamWords.join(", ")}`)
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  }
}
