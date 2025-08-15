-- Chnage shcema as needed
-- Enable this once per DB
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------
-- USERS (Farmer Profile)
-- ----------------------------
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  profile_pic TEXT, -- Cloudinary URL
  age INTEGER,
  preferred_crops TEXT[], -- Array of crops
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- LANDS (Land Information)
-- ----------------------------
CREATE TABLE lands (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  land_type TEXT NOT NULL,
  area NUMERIC(10,2) NOT NULL, -- E.g., in acres
  soil_quality TEXT,
  location_link TEXT,
  description TEXT,
  tags  TEXT[],
  land_image TEXT, -- Single image URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- CROP RECORDS (Per Land)
-- ----------------------------
CREATE TABLE crop_records (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  land_id TEXT NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE,
  total_yield NUMERIC(10, 2), -- In kg or maund
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- EXPENSES & EARNINGS
-- ----------------------------
CREATE TABLE expenses_earnings (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('expense', 'earning')) NOT NULL,
  category TEXT NOT NULL, 
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
  month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM date)) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- NOTIFICATIONS
-- ----------------------------
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- E.g., forum, rental_reminder, etc.
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- CROPS FOR SALE (amar kora)
-- ----------------------------
CREATE TABLE crops_for_sale (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  quantity NUMERIC(10,2) NOT NULL, -- In kg or maund
  unit TEXT NOT NULL DEFAULT 'kg', -- kg, maund, ton
  price_per_unit NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  harvest_date DATE,
  quality_grade TEXT, -- A, B, C grade
  description TEXT,
  location TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  crop_images TEXT[], -- Array of Cloudinary URLs
  is_sold BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX idx_crops_for_sale_user_id ON crops_for_sale(user_id);
CREATE INDEX idx_crops_for_sale_crop_type ON crops_for_sale(crop_type);
CREATE INDEX idx_crops_for_sale_is_sold ON crops_for_sale(is_sold);
