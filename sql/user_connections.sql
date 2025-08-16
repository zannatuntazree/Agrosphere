-- Add user connections table for friend requests
CREATE TABLE user_connections (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_connections_requester ON user_connections(requester_id);
CREATE INDEX idx_user_connections_receiver ON user_connections(receiver_id);
CREATE INDEX idx_user_connections_status ON user_connections(status);

-- Add latitude and longitude to users table for location-based queries
ALTER TABLE users ADD COLUMN latitude NUMERIC(10, 7);
ALTER TABLE users ADD COLUMN longitude NUMERIC(10, 7);

-- Create spatial index for location queries
CREATE INDEX idx_users_location ON users(latitude, longitude);
