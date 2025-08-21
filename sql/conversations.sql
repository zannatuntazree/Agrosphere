-- Create conversations table
CREATE TABLE conversations (
  conversation_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  message_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
