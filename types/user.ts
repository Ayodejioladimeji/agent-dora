export interface ClientSocialAccount {
    platform: "linkedin" | "twitter" | "facebook"
    profileId: string
    profileName: string
    hasToken: boolean // Indicates if the account has an access token (without exposing it)
}

export interface ClientUser {
    id: string
    email: string
    name: string
    socialAccounts: ClientSocialAccount[]
}

export interface Settings {
    _id: string
    userId: string
    updatedAt: string
    language: string
    industry: string
    tone: string[],
    format: string
    cta: string
    includeEmojis: string
    hashtagMode: string
    manualHashtags: string
    maxHashtags: number
    tagEntities: string

}