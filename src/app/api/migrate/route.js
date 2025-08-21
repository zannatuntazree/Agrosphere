import sql from "@/backend/config/database.js"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    // Create user_connections table
    await sql`
      CREATE TABLE IF NOT EXISTS user_connections (
        id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
        requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, receiver_id)
      )
    `

    // Create indexes for user connections
    await sql`CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON user_connections(requester_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_connections_receiver ON user_connections(receiver_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status)`

    // Create messaging tables
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
        conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for messaging
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read)`

    // Add latitude and longitude columns to users table if they don't exist
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7)`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7)`
    } catch (error) {
      // Ignore if columns already exist
      console.log("Location columns might already exist:", error.message)
    }

    // Create spatial index for location queries
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude)`
    } catch (error) {
      console.log("Location index might already exist:", error.message)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully (including messaging system)" 
    }, { status: 200 })

  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create database tables",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
