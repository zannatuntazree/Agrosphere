import { NextResponse } from "next/server"
import sql from "@/backend/config/database.js"

// Get messages for a conversation
export async function GET(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID
    const { conversationId } = params

    // Verify user is part of the conversation
    const conversationCheck = await sql`
      SELECT conversation_id FROM conversation_participants 
      WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    `

    if (conversationCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: "You are not part of this conversation" }, 
        { status: 403 }
      )
    }

    // Get messages for the conversation
    const messages = await sql`
      SELECT 
        m.message_id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        m.is_read,
        u.name as sender_name,
        u.profile_pic as sender_profile_image
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `

    // Mark messages as read if they weren't sent by the current user
    await sql`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE conversation_id = ${conversationId} 
      AND sender_id != ${userId} 
      AND is_read = FALSE
    `

    return NextResponse.json({ 
      success: true, 
      messages: messages
    })

  } catch (error) {
    console.error("Get messages API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
