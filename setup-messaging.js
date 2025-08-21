import sql from './src/backend/config/database.js'

async function runMigration() {
  try {
    console.log('Setting up messaging tables...')

    // Create conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ Conversations table created')

    // Create conversation participants table
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      )
    `
    console.log('✓ Conversation participants table created')

    // Create messages table
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
    console.log('✓ Messages table created')

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read)`
    console.log('✓ Database indexes created')

    console.log('✅ Messaging system migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration()
