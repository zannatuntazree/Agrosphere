import { NextResponse } from "next/server"
import sql from "@/backend/config/database.js"

// Send a message
export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const senderId = authToken // Auth token is just the user ID

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: "Conversation ID and content are required" }, 
        { status: 400 }
      )
    }

    // Verify user is part of the conversation
    const conversationCheck = await sql`
      SELECT conversation_id FROM conversation_participants 
      WHERE conversation_id = ${conversationId} AND user_id = ${senderId}
    `

    if (conversationCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: "You are not part of this conversation" }, 
        { status: 403 }
      )
    }

    // Insert the message
    const messageResult = await sql`
      INSERT INTO messages (conversation_id, sender_id, content, created_at) 
      VALUES (${conversationId}, ${senderId}, ${content.trim()}, NOW())
      RETURNING message_id
    `

    // Update conversation last_message_at
    await sql`
      UPDATE conversations SET last_message_at = NOW() WHERE conversation_id = ${conversationId}
    `

    // Get the created message with sender info
    const messageQuery = await sql`
      SELECT m.*, u.name as full_name, u.profile_pic as profile_image 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.message_id = ${messageResult[0].message_id}
    `

    const message = messageQuery[0]

    return NextResponse.json({ 
      success: true, 
      message: {
        message_id: message.message_id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at,
        sender: {
          full_name: message.full_name,
          profile_image: message.profile_image
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Send message API error:", error)
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
