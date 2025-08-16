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

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON user_connections(requester_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_connections_receiver ON user_connections(receiver_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status)`

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
      message: "Database tables created successfully" 
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
