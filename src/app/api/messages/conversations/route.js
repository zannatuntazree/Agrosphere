import { NextResponse } from "next/server"
import sql from "@/backend/config/database.js"

// Get user conversations
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID

    // Get conversations with participants and last message info
    const conversations = await sql`
      SELECT DISTINCT
        c.conversation_id,
        c.created_at,
        c.last_message_at,
        (
          SELECT content 
          FROM messages m 
          WHERE m.conversation_id = c.conversation_id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = c.conversation_id
          AND m.sender_id != ${userId}
          AND m.is_read = FALSE
        ) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id
      WHERE cp.user_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
    `

    // Get participants for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conversation) => {
        const participants = await sql`
          SELECT u.id as user_id, u.name as full_name, u.email, u.profile_pic as profile_image
          FROM conversation_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.conversation_id = ${conversation.conversation_id}
        `

        return {
          ...conversation,
          participants
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      conversations: conversationsWithParticipants
    })

  } catch (error) {
    console.error("Get conversations API error:", error)
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

// Create a new conversation
export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID

    const body = await request.json()
    const { participantId } = body

    if (!participantId) {
      return NextResponse.json(
        { success: false, message: "Participant ID is required" }, 
        { status: 400 }
      )
    }

    // Check if conversation already exists between these users
    const existingConversation = await sql`
      SELECT c.conversation_id
      FROM conversations c
      JOIN conversation_participants cp1 ON c.conversation_id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = ${userId} AND cp2.user_id = ${participantId}
      AND c.conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        GROUP BY conversation_id 
        HAVING COUNT(*) = 2
      )
      LIMIT 1
    `

    if (existingConversation.length > 0) {
      // Return existing conversation with participants
      const participants = await sql`
        SELECT u.id as user_id, u.name as full_name, u.email, u.profile_pic as profile_image
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = ${existingConversation[0].conversation_id}
      `

      return NextResponse.json({ 
        success: true, 
        conversation: {
          conversation_id: existingConversation[0].conversation_id,
          participants
        }
      })
    }

    // Create new conversation
    const conversationResult = await sql`
      INSERT INTO conversations (created_at, last_message_at) 
      VALUES (NOW(), NOW())
      RETURNING conversation_id
    `

    const conversationId = conversationResult[0].conversation_id

    // Add participants
    await sql`
      INSERT INTO conversation_participants (conversation_id, user_id) 
      VALUES (${conversationId}, ${userId}), (${conversationId}, ${participantId})
    `

    // Get participants info
    const participants = await sql`
      SELECT u.id as user_id, u.name as full_name, u.email, u.profile_pic as profile_image
      FROM conversation_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = ${conversationId}
    `

    return NextResponse.json({ 
      success: true, 
      conversation: {
        conversation_id: conversationId,
        participants
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Create conversation API error:", error)
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
