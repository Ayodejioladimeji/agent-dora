# Dora - AI Social Media Agent

A Slack-like interactive chat interface for managing social media content across LinkedIn, Twitter, and Facebook.

## Features

- **AI-Powered Content Generation**: Uses Gemini 2.0 to create platform-native posts
- **Multi-Platform Support**: LinkedIn, Twitter, and Facebook integration
- **OAuth Authentication**: Secure social account connections with encrypted token storage
- **Trending Topics**: Fetch current trending topics for content inspiration
- **Content Validation**: Platform-specific validation and warnings
- **Draft Management**: Create, edit, and manage post drafts
- **Settings Panel**: Customize tone, hashtags, emojis, and preferred topics
- **MongoDB Backend**: Persistent storage for users, settings, chats, drafts, and posts

## Setup

1. Install dependencies:
\`\`\`bash
npm install mongodb @google/generative-ai
\`\`\`

2. Create a `.env.local` file with the following variables:
\`\`\`env
MONGODB_URI=your-mongodb-connection-string
ENCRYPTION_KEY=your-32-byte-hex-key
GEMINI_API_KEY=your-gemini-api-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
\`\`\`

3. Generate an encryption key:
\`\`\`bash
openssl rand -hex 32
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Usage

1. **Login**: Enter your name and email to get started
2. **Connect Accounts**: Open settings (gear icon) and connect your social media accounts
3. **Generate Content**: Ask Dora to create posts for specific platforms
4. **Fetch Trends**: Get current trending topics for inspiration
5. **Publish**: Review drafts and publish directly to your connected accounts

## Architecture

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Next.js API routes with MongoDB
- **AI**: Google Gemini 2.0 for content generation
- **Authentication**: Custom OAuth implementation with encrypted token storage
- **Database**: MongoDB for persistent storage

## Security

- OAuth tokens are encrypted using AES-256-CBC
- HTTP-only cookies for session management
- CSRF protection with state validation
- Secure token storage in MongoDB
