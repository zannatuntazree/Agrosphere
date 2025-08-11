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
