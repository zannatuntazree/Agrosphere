-- Create marketplace favorites/wishlist table
CREATE TABLE marketplace_favorites (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id) -- prevent duplicate favorites
);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_favorites_user_id ON marketplace_favorites(user_id);
CREATE INDEX idx_marketplace_favorites_listing_id ON marketplace_favorites(listing_id);
CREATE INDEX idx_marketplace_favorites_created_at ON marketplace_favorites(created_at);