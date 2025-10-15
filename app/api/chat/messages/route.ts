import { type NextRequest, NextResponse } from "next/server"
import { getOrCreateLatestChat, updateMessages, deleteMessage } from "@/lib/db/chats"


export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        const chat = await getOrCreateLatestChat(userId)

        return NextResponse.json({
            chatId: chat._id?.toString(),
            messages: chat.messages,
        })
    } catch (error) {
        console.error("Failed to load messages:", error)
        return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { chatId, messages, userId } = await request.json()

        if (!chatId || !messages) {
            return NextResponse.json({ error: "Chat ID and messages are required" }, { status: 400 })
        }

        await updateMessages(chatId, messages)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to save messages:", error)
        return NextResponse.json({ error: "Failed to save messages" }, { status: 500 })
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const { chatId, messageId } = await request.json()

        if (!chatId || !messageId) {
            return NextResponse.json({ error: "Chat ID and message ID are required" }, { status: 400 })
        }

        const success = await deleteMessage(chatId, messageId)

        if (!success) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete message:", error)
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }
}
