import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'agribazzer.sqlite');
const db = new Database(dbPath);

// Enable WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'farmer',
      language TEXT NOT NULL DEFAULT 'en',
      location TEXT,
      farm_size TEXT,
      main_crop TEXT,
      verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS farms (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      farm_name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      area TEXT,
      soil_information TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      farm_id TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      variety TEXT,
      growth_stage TEXT,
      sowing_date TEXT,
      expected_harvest_date TEXT,
      status TEXT DEFAULT 'Healthy',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS produce_lots (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      variety TEXT,
      image TEXT,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      quality TEXT DEFAULT 'Grade A',
      grade TEXT DEFAULT 'A',
      harvest_date TEXT,
      expected_price REAL NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'PUBLISHED',
      is_waste INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS buyer_demands (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      required_quantity REAL NOT NULL,
      quality_requirement TEXT,
      offered_price REAL NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      required_date TEXT,
      description TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      produce_lot_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      offered_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (produce_lot_id) REFERENCES produce_lots(id)
    );

    CREATE TABLE IF NOT EXISTS negotiations (
      id TEXT PRIMARY KEY,
      offer_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT,
      price_per_unit REAL NOT NULL,
      quantity REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      produce_lot_id TEXT NOT NULL,
      offer_id TEXT,
      quantity REAL NOT NULL,
      final_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (produce_lot_id) REFERENCES produce_lots(id)
    );

    CREATE TABLE IF NOT EXISTS logistics (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL UNIQUE,
      pickup_location TEXT NOT NULL,
      delivery_location TEXT NOT NULL,
      distance TEXT,
      transport_provider TEXT,
      transport_cost REAL,
      estimated_delivery TEXT,
      tracking_status TEXT DEFAULT 'PICKUP_SCHEDULED',
      delivery_status TEXT DEFAULT 'IN_TRANSIT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'ESCROW_BANK_TRANSFER',
      status TEXT DEFAULT 'COMPLETED',
      transaction_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS procurement_centres (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT DEFAULT 'Tamil Nadu',
      location TEXT NOT NULL,
      capacity TEXT,
      status TEXT DEFAULT 'OPEN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS procurement_tokens (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      centre_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      quantity REAL NOT NULL,
      token_number INT NOT NULL,
      queue_position INT NOT NULL,
      estimated_wait TEXT,
      status TEXT DEFAULT 'BOOKED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (centre_id) REFERENCES procurement_centres(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO',
      read INTEGER DEFAULT 0,
      related_entity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grievances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      proof_image TEXT,
      status TEXT DEFAULT 'OPEN',
      resolution TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS plant_scans (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      image TEXT,
      disease_or_pest TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      recommended_action TEXT NOT NULL,
      analysis_type TEXT DEFAULT 'Demo AI Analysis',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS market_prices (
      id TEXT PRIMARY KEY,
      commodity TEXT NOT NULL,
      variety TEXT,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      market TEXT NOT NULL,
      min_price REAL NOT NULL,
      max_price REAL NOT NULL,
      modal_price REAL NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weather_data (
      id TEXT PRIMARY KEY,
      location TEXT NOT NULL UNIQUE,
      temperature TEXT,
      humidity TEXT,
      rainfall TEXT,
      wind TEXT,
      forecast_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ AGRIBAZZER SQLite Database schema initialized.');
}

export default db;
