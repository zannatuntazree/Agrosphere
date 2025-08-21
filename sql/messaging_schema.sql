-- Create messaging system tables

-- Create conversations table
CREATE TABLE conversations (
  conversation_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversation participants table (many-to-many relationship)
CREATE TABLE conversation_participants (
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  message_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Update user_connection_requests table name to match what we're using in the API
-- This assumes the existing table is called 'user_connections' but we need 'user_connection_requests'
-- If the table doesn't exist yet, create it
CREATE TABLE IF NOT EXISTS user_connection_requests (
  request_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sender_id, receiver_id)
);

-- Create indexes for user connection requests
CREATE INDEX IF NOT EXISTS idx_user_connection_requests_sender ON user_connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_connection_requests_receiver ON user_connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_connection_requests_status ON user_connection_requests(status);
