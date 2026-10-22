-- ============================================================
-- AGRIBAZZER PostgreSQL Database Schema
-- Production Schema for Neon / Render PostgreSQL
-- All 17 Core Agricultural Tables + Indexes + Constraints
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'farmer',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  location VARCHAR(255),
  farm_size VARCHAR(50),
  main_crop VARCHAR(100),
  verified INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS farms (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  area VARCHAR(100),
  soil_information TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crops Table
CREATE TABLE IF NOT EXISTS crops (
  id VARCHAR(64) PRIMARY KEY,
  farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  growth_stage VARCHAR(100),
  sowing_date VARCHAR(50),
  expected_harvest_date VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Healthy',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Produce Lots Table
CREATE TABLE IF NOT EXISTS produce_lots (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  image TEXT,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  quality VARCHAR(100) DEFAULT 'Grade A',
  grade VARCHAR(20) DEFAULT 'A',
  harvest_date VARCHAR(50),
  expected_price DOUBLE PRECISION NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status VARCHAR(50) DEFAULT 'PUBLISHED',
  is_waste INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Buyer Demands Table
CREATE TABLE IF NOT EXISTS buyer_demands (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop VARCHAR(100) NOT NULL,
  required_quantity DOUBLE PRECISION NOT NULL,
  quality_requirement TEXT,
  offered_price DOUBLE PRECISION NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  required_date VARCHAR(50),
  description TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Offers Table
CREATE TABLE IF NOT EXISTS offers (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  produce_lot_id VARCHAR(64) NOT NULL REFERENCES produce_lots(id),
  quantity DOUBLE PRECISION NOT NULL,
  offered_price DOUBLE PRECISION NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Negotiations Table
CREATE TABLE IF NOT EXISTS negotiations (
  id VARCHAR(64) PRIMARY KEY,
  offer_id VARCHAR(64) NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  sender_role VARCHAR(50) NOT NULL,
  sender_id VARCHAR(64) NOT NULL,
  message TEXT,
  price_per_unit DOUBLE PRECISION NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  produce_lot_id VARCHAR(64) NOT NULL REFERENCES produce_lots(id),
  offer_id VARCHAR(64),
  quantity DOUBLE PRECISION NOT NULL,
  final_price DOUBLE PRECISION NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  status VARCHAR(50) DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Logistics Table
CREATE TABLE IF NOT EXISTS logistics (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  pickup_location VARCHAR(255) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  distance VARCHAR(50),
  transport_provider VARCHAR(255),
  transport_cost DOUBLE PRECISION,
  estimated_delivery VARCHAR(100),
  tracking_status VARCHAR(50) DEFAULT 'PICKUP_SCHEDULED',
  delivery_status VARCHAR(50) DEFAULT 'IN_TRANSIT',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  payment_method VARCHAR(100) DEFAULT 'ESCROW_BANK_TRANSFER',
  status VARCHAR(50) DEFAULT 'COMPLETED',
  transaction_reference VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Procurement Centres Table
CREATE TABLE IF NOT EXISTS procurement_centres (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
  location VARCHAR(255) NOT NULL,
  capacity VARCHAR(100),
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Procurement Tokens Table
CREATE TABLE IF NOT EXISTS procurement_tokens (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  centre_id VARCHAR(64) NOT NULL REFERENCES procurement_centres(id),
  crop VARCHAR(100) NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  token_number INT NOT NULL,
  queue_position INT NOT NULL,
  estimated_wait VARCHAR(50),
  status VARCHAR(50) DEFAULT 'BOOKED',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  read INTEGER DEFAULT 0,
  related_entity VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Grievances Table
CREATE TABLE IF NOT EXISTS grievances (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  order_id VARCHAR(64),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  proof_image TEXT,
  status VARCHAR(50) DEFAULT 'OPEN',
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Plant Scans Table
CREATE TABLE IF NOT EXISTS plant_scans (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  crop VARCHAR(100) NOT NULL,
  image TEXT,
  disease_or_pest VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  recommended_action TEXT NOT NULL,
  analysis_type VARCHAR(100) DEFAULT 'Demo AI Analysis',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
  id VARCHAR(64) PRIMARY KEY,
  commodity VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  market VARCHAR(100) NOT NULL,
  min_price DOUBLE PRECISION NOT NULL,
  max_price DOUBLE PRECISION NOT NULL,
  modal_price DOUBLE PRECISION NOT NULL,
  date VARCHAR(50) NOT NULL
);

-- 17. Weather Data Table
CREATE TABLE IF NOT EXISTS weather_data (
  id VARCHAR(64) PRIMARY KEY,
  location VARCHAR(255) NOT NULL UNIQUE,
  temperature VARCHAR(50),
  humidity VARCHAR(50),
  rainfall VARCHAR(50),
  wind VARCHAR(50),
  forecast_json TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_farms_farmer ON farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm ON crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_produce_farmer ON produce_lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_produce_status ON produce_lots(status);
CREATE INDEX IF NOT EXISTS idx_demands_buyer ON buyer_demands(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_farmer ON offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_offers_lot ON offers(produce_lot_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_offer ON negotiations(offer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_farmer ON procurement_tokens(farmer_id);
CREATE INDEX IF NOT EXISTS idx_prices_commodity ON market_prices(commodity);
