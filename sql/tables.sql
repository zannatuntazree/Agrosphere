-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  area TEXT,
  city TEXT,
  country TEXT,
  profile_pic TEXT, -- Cloudinary URL
  age INTEGER,
  preferred_crops TEXT[], -- Array of crops
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- E.g., forum, rental_reminder, welcome, etc.
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);



-- Create expenses_earnings table
CREATE TABLE expenses_earnings (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('expense', 'earning')) NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
  month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM date)) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_earnings_user_id ON expenses_earnings(user_id);
CREATE INDEX idx_expenses_earnings_date ON expenses_earnings(date);
CREATE INDEX idx_expenses_earnings_year_month ON expenses_earnings(year, month);
CREATE INDEX idx_expenses_earnings_type ON expenses_earnings(type);


-- Create lands table
CREATE TABLE lands (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  land_type TEXT NOT NULL,
  area NUMERIC(10,2) NOT NULL, -- E.g., in acres
  soil_quality TEXT,
  location_link TEXT,
  description TEXT, -- short description
  tags TEXT[],
  land_image TEXT, -- Single image URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_lands_user_id ON lands(user_id);
CREATE INDEX idx_lands_created_at ON lands(created_at);
CREATE INDEX idx_lands_land_type ON lands(land_type);



-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admin (username, password, email) VALUES 
('admin', '$2a$12$FmHwXEja.5cw8RisOzw4keox9SMDvEggNMRNVgCeUiH0D407W8PVu', 'admin@agriculture.com');

-- Note: The password hash above is for 'admin123'
-- In production, generate a proper bcrypt hash for your desired password



-- Create marketplace listings table for B2B crop sales
CREATE TABLE marketplace_listings (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  description TEXT,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- e.g., 'kg', 'ton', 'quintal'
  quantity_available NUMERIC(10, 2) NOT NULL,
  location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  images TEXT[], -- Array of image URLs
  status TEXT CHECK (status IN ('active', 'sold', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for marketplace listings
CREATE INDEX idx_marketplace_user_id ON marketplace_listings(user_id);
CREATE INDEX idx_marketplace_crop_name ON marketplace_listings(crop_name);
CREATE INDEX idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_created_at ON marketplace_listings(created_at);

-- Create seasonal crop planning table
CREATE TABLE seasonal_crop_plans (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  land_id TEXT REFERENCES lands(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT NOT NULL, -- e.g., 'Winter', 'Summer', 'Monsoon'
  planting_date DATE,
  expected_harvest_date DATE,
  estimated_yield NUMERIC(10, 2),
  yield_unit TEXT, -- e.g., 'kg', 'ton'
  notes TEXT,
  status TEXT CHECK (status IN ('planned', 'planted', 'harvested', 'cancelled')) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for seasonal crop plans
CREATE INDEX idx_seasonal_crop_plans_user_id ON seasonal_crop_plans(user_id);
CREATE INDEX idx_seasonal_crop_plans_land_id ON seasonal_crop_plans(land_id);
CREATE INDEX idx_seasonal_crop_plans_season ON seasonal_crop_plans(season);
CREATE INDEX idx_seasonal_crop_plans_status ON seasonal_crop_plans(status);

--- Not used yet ------------------------------------------------------------
CREATE TABLE crop_records (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  land_id TEXT NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL, 
  season TEXT NOT NULL, 
  year INTEGER NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE,
  total_yield NUMERIC(10,2),
  total_expenses NUMERIC(10,2), 
  total_revenue NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
------------------------------------------------------------------------------