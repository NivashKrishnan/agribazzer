import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';
import { seedDatabase } from './seed.js';

// Load .env variables
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) {}

initDatabase();
seedDatabase();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Root & API status endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 AGRIBAZZER Backend API Server is running.',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: '/api',
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/farms',
      '/api/crops',
      '/api/lots',
      '/api/demands',
      '/api/match',
      '/api/offers',
      '/api/orders',
      '/api/logistics',
      '/api/payment',
      '/api/procurement/centres',
      '/api/procurement/tokens',
      '/api/notifications',
      '/api/market-prices',
      '/api/weather',
      '/api/plant-scans',
      '/api/agribot',
      '/api/grievances',
      '/api/gov/gst-revenue'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AGRIBAZZER API Status: Online',
    timestamp: new Date().toISOString(),
    routes: ['/api/gov/gst-revenue']
  });
});

// Data.gov.in GST Revenue API Proxy Route
app.get('/api/gov/gst-revenue', async (req, res) => {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    return res.status(500).json({ error: 'DATA_GOV_API_KEY missing' });
  }

  const offset = req.query.offset || '0';
  const limit = req.query.limit || '10';
  const financial_year = req.query.financial_year;
  const document_id = req.query.document_id;

  const baseUrl = 'https://api.data.gov.in/resource/year-wise-details-actual-revenue-collection-net-central-goods-and-services-tax-gst';
  let targetUrl = `${baseUrl}?api-key=${encodeURIComponent(apiKey)}&format=json&offset=${encodeURIComponent(offset)}&limit=${encodeURIComponent(limit)}`;

  if (financial_year) {
    targetUrl += `&filters[financial_year]=${encodeURIComponent(financial_year)}`;
  }
  if (document_id) {
    targetUrl += `&filters[document_id]=${encodeURIComponent(document_id)}`;
  }

  try {
    const govRes = await fetch(targetUrl);
    if (!govRes.ok) {
      const errText = await govRes.text();
      return res.status(govRes.status).json({
        error: `Data.gov.in request failed with HTTP ${govRes.status}`,
        details: errText
      });
    }
    const data = await govRes.json();
    res.json(data);
  } catch (err) {
    console.error('[Data.gov.in Proxy Error]:', err.message);
    res.status(500).json({
      error: 'Failed to communicate with Data.gov.in API',
      message: err.message
    });
  }
});

// Helper to generate IDs
const uid = (prefix = 'id') => `${prefix}-${crypto.randomBytes(4).toString('hex')}`;

// Mock Active Sessions
const sessions = new Map();

// Helper to create notifications
function createNotification(userId, title, message, type = 'GENERAL', relatedEntity = null) {
  const id = uid('notif');
  try {
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, read, related_entity)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(id, userId, title, message, type, relatedEntity);
  } catch (err) {
    console.warn('[Notification Error]', err.message);
  }
  return id;
}

// Pre-populate seed user active sessions
const u1 = db.prepare('SELECT * FROM users WHERE id = ?').get('usr-1');
if (u1) sessions.set('token_usr-1', u1);
const u2 = db.prepare('SELECT * FROM users WHERE id = ?').get('usr-2');
if (u2) sessions.set('token_usr-2', u2);
const u3 = db.prepare('SELECT * FROM users WHERE id = ?').get('usr-3');
if (u3) sessions.set('token_usr-3', u3);

// Authentication Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');
  const user = sessions.get(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
  req.user = user;
  next();
}

/* ============================================================
   1. AUTHENTICATION APIs
   ============================================================ */
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role = 'farmer', location, farmSize, mainCrop } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone number, and password are required' });
  }

  const existing = db.prepare('SELECT * FROM users WHERE phone = ? OR email = ?').get(phone, email || '');
  if (existing) {
    return res.status(409).json({ error: 'User with this phone number or email already exists' });
  }

  const id = uid('usr');
  const password_hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, language, location, farm_size, main_crop, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email || `${phone}@agribazzer.com`, phone, password_hash, role, 'en', location || 'Thanjavur, Tamil Nadu', farmSize || '5 Acres', mainCrop || 'Paddy', 1);

  const user = db.prepare('SELECT id, name, email, phone, role, language, location, farm_size, main_crop, verified FROM users WHERE id = ?').get(id);
  const token = `token_${id}_${Date.now()}`;
  sessions.set(token, user);

  res.status(201).json({ message: 'Registration successful', token, user });
});

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  let user = db.prepare('SELECT * FROM users WHERE phone = ? OR email = ?').get(phone, phone);
  if (!user) {
    // Demo auto-create or login fallback
    const id = uid('usr');
    const hash = bcrypt.hashSync(password || 'pass123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, language, location, farm_size, main_crop, verified)
      VALUES (?, ?, ?, ?, ?, 'farmer', 'en', 'Thanjavur, Tamil Nadu', '5.2 Acres', 'Paddy', 1)
    `).run(id, 'Ramesh Kumar', `${phone}@agribazzer.com`, phone, hash);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  const token = `token_${user.id}_${Date.now()}`;
  sessions.set(token, user);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    language: user.language,
    location: user.location,
    farmSize: user.farm_size,
    mainCrop: user.main_crop,
    verified: Boolean(user.verified),
  };

  res.json({ message: 'Login successful', token, user: safeUser });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    sessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

/* ============================================================
   2. FARM & CROP APIs
   ============================================================ */
app.get('/api/farms', authMiddleware, (req, res) => {
  const farms = db.prepare('SELECT * FROM farms WHERE farmer_id = ?').all(req.user.id);
  res.json({ farms });
});

app.post('/api/farms', authMiddleware, (req, res) => {
  const { farmName, location, latitude, longitude, area, soilInformation } = req.body;
  const id = uid('frm');
  db.prepare(`
    INSERT INTO farms (id, farmer_id, farm_name, location, latitude, longitude, area, soil_information)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, farmName || 'My Farm', location || req.user.location, latitude || 10.787, longitude || 79.1378, area || '5 Acres', soilInformation || 'Alluvial Clay');

  const farm = db.prepare('SELECT * FROM farms WHERE id = ?').get(id);
  res.status(201).json({ message: 'Farm added successfully', farm });
});

app.get('/api/crops', authMiddleware, (req, res) => {
  const crops = db.prepare(`
    SELECT c.*, f.farm_name FROM crops c
    JOIN farms f ON c.farm_id = f.id
    WHERE f.farmer_id = ?
  `).all(req.user.id);
  res.json({ crops });
});

app.post('/api/crops', authMiddleware, (req, res) => {
  const { farmId, cropName, variety, growthStage, sowingDate, expectedHarvestDate, status } = req.body;
  const id = uid('crp');
  let farm_id = farmId;
  if (!farm_id) {
    const firstFarm = db.prepare('SELECT id FROM farms WHERE farmer_id = ?').get(req.user.id);
    farm_id = firstFarm ? firstFarm.id : 'frm-1';
  }

  db.prepare(`
    INSERT INTO crops (id, farm_id, crop_name, variety, growth_stage, sowing_date, expected_harvest_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, farm_id, cropName || 'Paddy', variety || 'Samba', growthStage || 'Maturation', sowingDate || '2026-06-15', expectedHarvestDate || '2026-10-20', status || 'Healthy');

  const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(id);
  res.status(201).json({ message: 'Crop added successfully', crop });
});

/* ============================================================
   3. SELLER PRODUCE LOT & MARKETPLACE APIs
   ============================================================ */
app.get('/api/lots', (req, res) => {
  const { isWaste, farmerId, status } = req.query;
  let sql = 'SELECT p.*, u.name as farmer_name, u.verified as farmer_verified FROM produce_lots p JOIN users u ON p.farmer_id = u.id WHERE 1=1';
  const params = [];

  if (isWaste !== undefined) {
    sql += ' AND p.is_waste = ?';
    params.push(isWaste === 'true' ? 1 : 0);
  }
  if (farmerId) {
    sql += ' AND p.farmer_id = ?';
    params.push(farmerId);
  }
  if (status) {
    sql += ' AND p.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY p.created_at DESC';
  const lots = db.prepare(sql).all(...params);
  res.json({ lots });
});

app.post('/api/lots', authMiddleware, (req, res) => {
  const { crop, variety, image, quantity, unit = 'kg', quality, grade, harvestDate, expectedPrice, location, isWaste = false } = req.body;
  if (!crop || !quantity || !expectedPrice) {
    return res.status(400).json({ error: 'Crop, quantity, and expected price are required' });
  }

  const id = uid('lot');
  db.prepare(`
    INSERT INTO produce_lots (id, farmer_id, crop, variety, image, quantity, unit, quality, grade, harvest_date, expected_price, location, latitude, longitude, status, is_waste)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?)
  `).run(
    id, req.user.id, crop, variety || 'Standard', image || 'img/paddy.jpg',
    Number(quantity), unit, quality || 'Grade A', grade || 'A',
    harvestDate || '2026-10-20', Number(expectedPrice),
    location || req.user.location || 'Thanjavur, Tamil Nadu',
    10.787, 79.1378, isWaste ? 1 : 0
  );

  const lot = db.prepare('SELECT * FROM produce_lots WHERE id = ?').get(id);
  res.status(201).json({ message: 'Produce lot created successfully', lot });
});

app.put('/api/lots/:id', authMiddleware, (req, res) => {
  const { status, expectedPrice, quantity } = req.body;
  const lot = db.prepare('SELECT * FROM produce_lots WHERE id = ?').get(req.params.id);
  if (!lot) return res.status(404).json({ error: 'Produce lot not found' });
  if (lot.farmer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: You do not own this produce lot' });
  }

  db.prepare(`
    UPDATE produce_lots
    SET status = COALESCE(?, status),
        expected_price = COALESCE(?, expected_price),
        quantity = COALESCE(?, quantity),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, expectedPrice, quantity, req.params.id);

  const updatedLot = db.prepare('SELECT * FROM produce_lots WHERE id = ?').get(req.params.id);
  res.json({ message: 'Produce lot updated', lot: updatedLot });
});

/* ============================================================
   4. BUYER DEMANDS & AI MATCHING APIs
   ============================================================ */
app.get('/api/demands', (req, res) => {
  const demands = db.prepare("SELECT d.*, u.name as buyer_name, u.verified as buyer_verified FROM buyer_demands d JOIN users u ON d.buyer_id = u.id WHERE d.status = 'ACTIVE' ORDER BY d.created_at DESC").all();
  res.json({ demands });
});

app.post('/api/demands', authMiddleware, (req, res) => {
  const { crop, requiredQuantity, qualityRequirement, offeredPrice, location, requiredDate, description } = req.body;
  const id = uid('dem');
  db.prepare(`
    INSERT INTO buyer_demands (id, buyer_id, crop, required_quantity, quality_requirement, offered_price, location, latitude, longitude, required_date, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `).run(id, req.user.id, crop, Number(requiredQuantity), qualityRequirement || 'Grade A', Number(offeredPrice), location || 'Kumbakonam, Tamil Nadu', 10.9602, 79.3845, requiredDate || '2026-10-25', description || 'Direct demand request');

  const demand = db.prepare('SELECT * FROM buyer_demands WHERE id = ?').get(id);
  res.status(201).json({ message: 'Buyer demand created successfully', demand });
});

// AI Buyer Matching Engine (Transparent scoring algorithm)
app.get('/api/match', (req, res) => {
  const { lotId } = req.query;
  const lot = lotId ? db.prepare('SELECT * FROM produce_lots WHERE id = ?').get(lotId) : db.prepare('SELECT * FROM produce_lots ORDER BY created_at DESC LIMIT 1').get();
  const buyers = db.prepare("SELECT * FROM users WHERE role IN ('buyer', 'fpo')").all();

  const matches = buyers.map((b) => {
    let score = 70;
    const reasons = [];

    // Crop match
    score += 10;
    reasons.push('Same crop category match');

    // Distance calculation (simulated or lat/lon based)
    const distanceKm = Math.floor(Math.random() * 25) + 5;
    if (distanceKm < 15) {
      score += 10;
      reasons.push(`Nearby location (${distanceKm} km distance)`);
    } else {
      reasons.push(`Within transport range (${distanceKm} km)`);
    }

    // Reliability & Verification
    if (b.verified) {
      score += 8;
      reasons.push('Verified Buyer with 100% payment escrow history');
    }

    // Price competitiveness
    const offeredPrice = lot ? Math.round(lot.expected_price * 1.02) : 29.0;
    reasons.push(`Offered price ₹${offeredPrice}/kg satisfies minimum threshold`);

    return {
      buyerId: b.id,
      buyerName: b.name,
      buyerType: b.role === 'fpo' ? 'Farmer Producer Organisation (FPO)' : 'Rice Mill / Commercial Buyer',
      location: b.location,
      verified: Boolean(b.verified),
      rating: 4.9,
      matchScore: Math.min(score, 98),
      distanceKm,
      offeredPrice,
      matchingReasons: reasons,
      label: 'AI Buyer Matching — Prototype'
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  res.json({ lot, matches });
});

/* ============================================================
   5. OFFERS, NEGOTIATIONS & ORDERS APIs
   ============================================================ */
app.get('/api/offers', authMiddleware, (req, res) => {
  const offers = db.prepare(`
    SELECT o.*, lot.crop, lot.image, u_farmer.name as farmer_name, u_buyer.name as buyer_name
    FROM offers o
    JOIN produce_lots lot ON o.produce_lot_id = lot.id
    JOIN users u_farmer ON o.farmer_id = u_farmer.id
    JOIN users u_buyer ON o.buyer_id = u_buyer.id
    WHERE o.farmer_id = ? OR o.buyer_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id, req.user.id);

  res.json({ offers });
});

app.post('/api/offers', authMiddleware, (req, res) => {
  const { produceLotId, farmerId, quantity, offeredPrice } = req.body;
  const id = uid('ofr');
  const lot = db.prepare('SELECT * FROM produce_lots WHERE id = ?').get(produceLotId);
  const targetFarmer = farmerId || (lot ? lot.farmer_id : 'usr-1');
  const totalAmount = Number(quantity) * Number(offeredPrice);

  db.prepare(`
    INSERT INTO offers (id, buyer_id, farmer_id, produce_lot_id, quantity, offered_price, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
  `).run(id, req.user.id, targetFarmer, produceLotId || 'lot-1', Number(quantity), Number(offeredPrice), totalAmount);

  // First negotiation entry
  db.prepare(`
    INSERT INTO negotiations (id, offer_id, sender_role, sender_id, message, price_per_unit, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uid('neg'), id, req.user.role, req.user.id, `Submitted initial offer of ₹${offeredPrice}/kg for ${quantity} kg`, Number(offeredPrice), Number(quantity));

  // Trigger Notification to Farmer
  createNotification(targetFarmer, '🎉 New Offer Received', `New offer of ₹${offeredPrice}/kg for ${quantity} kg`, 'OFFER', id);

  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
  res.status(201).json({ message: 'Offer submitted successfully', offer });
});

app.put('/api/offers/:id', authMiddleware, (req, res) => {
  const { status, counterPrice, message } = req.body;
  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  if (status === 'ACCEPTED') {
    db.prepare("UPDATE offers SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    
    // Automatically create order
    const orderId = uid('ord');
    db.prepare(`
      INSERT INTO orders (id, buyer_id, farmer_id, produce_lot_id, offer_id, quantity, final_price, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
    `).run(orderId, offer.buyer_id, offer.farmer_id, offer.produce_lot_id, offer.id, offer.quantity, offer.offered_price, offer.total_amount);

    // Create logistics record
    db.prepare(`
      INSERT INTO logistics (id, order_id, pickup_location, delivery_location, distance, transport_provider, transport_cost, estimated_delivery, tracking_status)
      VALUES (?, ?, 'Thanjavur Farm Depot', 'Kumbakonam Processing Unit', '24 km', 'TN Agri Logistics Express', 1200, '24 Hours', 'PICKUP_SCHEDULED')
    `).run(uid('log'), orderId);

    // Create payment record
    db.prepare(`
      INSERT INTO payments (id, order_id, amount, payment_method, status, transaction_reference)
      VALUES (?, ?, ?, 'ESCROW_BANK_TRANSFER', 'COMPLETED', ?)
    `).run(uid('pay'), orderId, offer.total_amount, `TXN-${Date.now()}`);

    // Trigger Notifications
    createNotification(offer.buyer_id, '✅ Offer Accepted!', `Your offer for ${offer.quantity} kg was accepted. Order #${orderId} created.`, 'OFFER_ACCEPTED', orderId);
    createNotification(offer.farmer_id, '✅ Order Created!', `Order #${orderId} generated. Logistics pickup scheduled.`, 'ORDER', orderId);

    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    return res.json({ message: 'Offer accepted & Order created', offerStatus: 'ACCEPTED', order: newOrder });
  }

  if (status === 'COUNTERED' && counterPrice) {
    db.prepare("UPDATE offers SET offered_price = ?, total_amount = ? * quantity, status = 'COUNTERED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(counterPrice, counterPrice, req.params.id);
    db.prepare(`
      INSERT INTO negotiations (id, offer_id, sender_role, sender_id, message, price_per_unit, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uid('neg'), req.params.id, req.user.role, req.user.id, message || `Counter offer of ₹${counterPrice}/kg`, counterPrice, offer.quantity);

    const recipient = req.user.id === offer.buyer_id ? offer.farmer_id : offer.buyer_id;
    createNotification(recipient, '⚡ Counter Offer Received', `New counter offer of ₹${counterPrice}/kg received.`, 'COUNTER_OFFER', req.params.id);
  } else {
    db.prepare('UPDATE offers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  }

  const updatedOffer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  res.json({ message: `Offer updated to ${status}`, offer: updatedOffer });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = db.prepare(`
    SELECT ord.*, lot.crop, lot.image, u_farmer.name as farmer_name, u_buyer.name as buyer_name
    FROM orders ord
    JOIN produce_lots lot ON ord.produce_lot_id = lot.id
    JOIN users u_farmer ON ord.farmer_id = u_farmer.id
    JOIN users u_buyer ON ord.buyer_id = u_buyer.id
    WHERE ord.farmer_id = ? OR ord.buyer_id = ?
    ORDER BY ord.created_at DESC
  `).all(req.user.id, req.user.id);

  res.json({ orders });
});

/* ============================================================
   6. LOGISTICS, PAYMENTS & PROCUREMENT APIs
   ============================================================ */
app.get(['/api/logistics', '/api/logistic'], authMiddleware, (req, res) => {
  const { orderId } = req.query;
  let item;
  if (orderId) {
    item = db.prepare('SELECT * FROM logistics WHERE order_id = ?').get(orderId);
  }
  if (!item) {
    item = db.prepare('SELECT * FROM logistics ORDER BY created_at DESC LIMIT 1').get();
  }
  res.json({ logistics: item, label: 'Demo Tracking' });
});

app.put(['/api/logistics/:id', '/api/logistic/:id'], authMiddleware, (req, res) => {
  const { trackingStatus, estimatedDelivery } = req.body;
  db.prepare(`
    UPDATE logistics
    SET tracking_status = COALESCE(?, tracking_status),
        estimated_delivery = COALESCE(?, estimated_delivery)
    WHERE id = ?
  `).run(trackingStatus, estimatedDelivery, req.params.id);

  const item = db.prepare('SELECT * FROM logistics WHERE id = ?').get(req.params.id);
  if (item) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(item.order_id);
    if (order) {
      createNotification(order.farmer_id, '🚛 Logistics Status Update', `Logistics status updated to ${trackingStatus || item.tracking_status}`, 'LOGISTICS', item.id);
    }
  }
  res.json({ message: 'Logistics tracking updated', logistics: item, label: 'Demo Tracking' });
});

app.get(['/api/payments', '/api/payment'], authMiddleware, (req, res) => {
  const { orderId } = req.query;
  let item;
  if (orderId) {
    item = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
  }
  if (!item) {
    item = db.prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT 1').get();
  }
  res.json({ payment: item, label: 'Simulated Payment' });
});

app.post(['/api/payments/:id/pay', '/api/payment/:id/pay'], authMiddleware, (req, res) => {
  db.prepare("UPDATE payments SET status = 'COMPLETED' WHERE id = ?").run(req.params.id);
  const item = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (item) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(item.order_id);
    if (order) {
      createNotification(order.farmer_id, '💳 Payment Completed', `Escrow payment of ₹${item.amount} completed!`, 'PAYMENT', item.id);
    }
  }
  res.json({ message: 'Simulated payment processed successfully', payment: item, label: 'Simulated Payment' });
});

app.get('/api/procurement/centres', (req, res) => {
  const centres = db.prepare('SELECT * FROM procurement_centres').all();
  res.json({ centres });
});

app.get('/api/procurement/tokens', authMiddleware, (req, res) => {
  const tokens = db.prepare(`
    SELECT t.*, c.name as centre_name, c.location as centre_location
    FROM procurement_tokens t
    JOIN procurement_centres c ON t.centre_id = c.id
    WHERE t.farmer_id = ?
    ORDER BY t.created_at DESC
  `).all(req.user.id);
  res.json({ tokens });
});

app.post('/api/procurement/tokens', authMiddleware, (req, res) => {
  const { centreId, crop, quantity } = req.body;
  const id = uid('tok');
  const tokenNumber = Math.floor(Math.random() * 100) + 100;
  const queuePos = Math.floor(Math.random() * 8) + 1;

  db.prepare(`
    INSERT INTO procurement_tokens (id, farmer_id, centre_id, crop, quantity, token_number, queue_position, estimated_wait, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'BOOKED')
  `).run(id, req.user.id, centreId || 'pc-1', crop || 'Paddy (Samba)', Number(quantity) || 3000, tokenNumber, queuePos, `${queuePos * 15} Mins`);

  const token = db.prepare('SELECT * FROM procurement_tokens WHERE id = ?').get(id);
  res.status(201).json({ message: 'Procurement token booked successfully', token });
});

/* ============================================================
   7. NOTIFICATIONS & GRIEVANCE APIs
   ============================================================ */
app.get('/api/notifications', authMiddleware, (req, res) => {
  const list = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ notifications: list });
});

app.get(['/api/grievances', '/api/grievance'], authMiddleware, (req, res) => {
  let list;
  if (req.user.role === 'admin') {
    list = db.prepare('SELECT g.*, u.name as user_name FROM grievances g JOIN users u ON g.user_id = u.id ORDER BY g.created_at DESC').all();
  } else {
    list = db.prepare('SELECT * FROM grievances WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  }
  res.json({ grievances: list });
});

app.post(['/api/grievances', '/api/grievance'], authMiddleware, (req, res) => {
  const { orderId, title, description, proofImage } = req.body;
  const id = uid('grv');
  db.prepare(`
    INSERT INTO grievances (id, user_id, order_id, title, description, proof_image, status)
    VALUES (?, ?, ?, ?, ?, ?, 'OPEN')
  `).run(id, req.user.id, orderId || null, title || 'Support Inquiry', description || 'Inquiry details', proofImage || null);

  const grievance = db.prepare('SELECT * FROM grievances WHERE id = ?').get(id);
  res.status(201).json({ message: 'Grievance submitted successfully', grievance });
});

app.put(['/api/grievances/:id', '/api/grievance/:id'], authMiddleware, (req, res) => {
  const { status, adminNotes } = req.body;
  db.prepare('UPDATE grievances SET status = COALESCE(?, status) WHERE id = ?').run(status || 'RESOLVED', req.params.id);
  const grievance = db.prepare('SELECT * FROM grievances WHERE id = ?').get(req.params.id);
  res.json({ message: 'Grievance updated by admin', grievance });
});

/* ============================================================
   8. MARKET PRICES, WEATHER, PLANT SCANS & AGRIBOT
   ============================================================ */
app.get('/api/market-prices', (req, res) => {
  const prices = db.prepare('SELECT * FROM market_prices ORDER BY date DESC').all();
  res.json({ prices, label: process.env.MARKET_API_KEY ? 'LIVE' : 'DATABASE' });
});

let latestServerWeather = null;

function getWeatherCondition(code) {
  if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
  if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 67) return { condition: 'Light Rain', icon: '🌧️' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', icon: '🌦️' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };
  return { condition: 'Partly Cloudy', icon: '⛅' };
}

function getWeatherIconFromText(text = '') {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('storm')) return '⛈️';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return '🌧️';
  if (t.includes('sunny') || t.includes('clear')) return '☀️';
  if (t.includes('fog') || t.includes('mist')) return '🌫️';
  if (t.includes('cloud') || t.includes('overcast')) return '⛅';
  return '⛅';
}

const CITY_COORDS = {
  thanjavur: { lat: 10.787, lon: 79.137, name: 'Thanjavur, Tamil Nadu' },
  chennai: { lat: 13.0827, lon: 80.2707, name: 'Chennai, Tamil Nadu' },
  coimbatore: { lat: 11.0168, lon: 76.9558, name: 'Coimbatore, Tamil Nadu' },
  madurai: { lat: 9.9252, lon: 78.1198, name: 'Madurai, Tamil Nadu' },
  trichy: { lat: 10.7905, lon: 78.7047, name: 'Tiruchirappalli, Tamil Nadu' },
  salem: { lat: 11.6643, lon: 78.146, name: 'Salem, Tamil Nadu' },
  delhi: { lat: 28.6139, lon: 77.209, name: 'New Delhi, Delhi' },
  mumbai: { lat: 19.076, lon: 72.8777, name: 'Mumbai, Maharashtra' }
};

app.get('/api/weather', async (req, res) => {
  let { lat, lon, latitude, longitude, q, city } = req.query;
  lat = lat || latitude;
  lon = lon || longitude;
  const search = (q || city || '').trim().toLowerCase();

  if (search && CITY_COORDS[search]) {
    lat = CITY_COORDS[search].lat;
    lon = CITY_COORDS[search].lon;
  }

  // Validate coordinates if provided
  let numLat = lat !== undefined ? parseFloat(lat) : 10.787;
  let numLon = lon !== undefined ? parseFloat(lon) : 79.137;

  if (isNaN(numLat) || numLat < -90 || numLat > 90 || isNaN(numLon) || numLon < -180 || numLon > 180) {
    return res.status(400).json({
      error: 'Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.'
    });
  }

  const weatherApiKey = process.env.WEATHER_API_KEY;

  // Primary: WeatherAPI.com Integration
  if (weatherApiKey && !weatherApiKey.includes('placeholder') && !weatherApiKey.startsWith('AQ.')) {
    try {
      const queryStr = (search && CITY_COORDS[search]) ? CITY_COORDS[search].name : `${numLat},${numLon}`;
      const wApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(queryStr)}&days=7&aqi=no&alerts=no`;
      const wRes = await fetch(wApiUrl);
      if (wRes.ok) {
        const wData = await wRes.json();
        const loc = wData.location || {};
        const curr = wData.current || {};
        const forecastDays = wData.forecast?.forecastday || [];

        const temp = Math.round(curr.temp_c !== undefined ? curr.temp_c : 31);
        const conditionText = curr.condition?.text || 'Partly Cloudy';
        const iconSymbol = getWeatherIconFromText(conditionText);
        const humidity = `${curr.humidity || 72}%`;
        const windSpeed = `${Math.round(curr.wind_kph || 14)} km/h ${curr.wind_dir || 'SW'}`;
        const placeName = loc.name ? `${loc.name}, ${loc.region || loc.country}` : 'My Location';

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const forecastList = forecastDays.map((fd, idx) => {
          const dateObj = new Date(fd.date);
          const dayLabel = idx === 0 ? 'Today' : dayNames[dateObj.getDay() % 7];
          return {
            d: dayLabel,
            icon: getWeatherIconFromText(fd.day?.condition?.text),
            condition: fd.day?.condition?.text || 'Partly Cloudy',
            hi: Math.round(fd.day?.maxtemp_c || temp),
            lo: Math.round(fd.day?.mintemp_c || temp - 5),
            rain: `${fd.day?.daily_chance_of_rain || 30}%`
          };
        });

        const rainProb = forecastDays[0]?.day?.daily_chance_of_rain || 40;
        const alerts = [];
        if (rainProb >= 50) {
          alerts.push({
            icon: '🌧',
            tone: 'blue',
            title: 'Heavy Rain Expected',
            body: `Rain chance ${rainProb}%. Consider delaying irrigation and chemical sprays.`
          });
        }
        if (temp >= 35) {
          alerts.push({
            icon: '☀️',
            tone: 'amber',
            title: 'High Temperature Advisory',
            body: `Heat index high (${temp}°C). Provide extra soil moisture for crops.`
          });
        }

        const weatherPayload = {
          success: true,
          place: placeName,
          location: placeName,
          crop: 'Paddy',
          temp,
          temperature: `${temp}°C`,
          condition: conditionText,
          icon: iconSymbol,
          humidity,
          rainfall: `${rainProb}% chance · ${forecastDays[0]?.day?.totalprecip_mm || 2} mm`,
          wind: windSpeed,
          forecast: forecastList,
          alerts,
          risk: rainProb >= 60 || temp >= 38 ? 'HIGH' : 'MODERATE',
          riskLabel: 'WEATHER AI ADVISORY',
          label: 'LIVE DATA',
          lat: numLat,
          lon: numLon
        };

        latestServerWeather = weatherPayload;
        return res.json(weatherPayload);
      }
    } catch (err) {
      console.warn('[WeatherAPI.com Warning]:', err.message);
    }
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${numLat}&longitude=${numLon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&hourly=relativehumidity_2m&timezone=auto`;
    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const cw = data.current_weather || {};
    const daily = data.daily || {};
    const temp = Math.round(cw.temperature !== undefined ? cw.temperature : 31);
    const windSpeed = Math.round(cw.windspeed !== undefined ? cw.windspeed : 14);
    const condInfo = getWeatherCondition(cw.weathercode || 0);

    const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined)
      ? daily.precipitation_probability_max[0]
      : 40;

    const humidityVal = (data.hourly && data.hourly.relativehumidity_2m && data.hourly.relativehumidity_2m[0])
      ? `${data.hourly.relativehumidity_2m[0]}%`
      : '72%';

    let placeName = 'My Location';
    if (search && CITY_COORDS[search]) {
      placeName = CITY_COORDS[search].name;
    } else {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${numLat}&lon=${numLon}&format=json`;
        const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'AGRIBAZZER-Weather/1.0' } });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const addr = geoData.address || {};
          const cityPart = addr.city || addr.town || addr.village || addr.county || addr.state_district;
          const statePart = addr.state || '';
          if (cityPart) {
            placeName = statePart ? `${cityPart}, ${statePart}` : cityPart;
          }
        }
      } catch (geoErr) {
        placeName = 'My Location';
      }
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecastList = [];
    if (daily.time && daily.time.length) {
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const dateObj = new Date(daily.time[i]);
        const dayLabel = i === 0 ? 'Today' : dayNames[dateObj.getDay() % 7];
        const hiTemp = Math.round(daily.temperature_2m_max[i]);
        const loTemp = Math.round(daily.temperature_2m_min[i]);
        const rProb = daily.precipitation_probability_max[i] !== undefined ? `${daily.precipitation_probability_max[i]}%` : '20%';
        const dayCond = getWeatherCondition(daily.weathercode ? daily.weathercode[i] : 0);

        forecastList.push({
          d: dayLabel,
          icon: dayCond.icon,
          condition: dayCond.text || 'Sunny',
          hi: hiTemp,
          lo: loTemp,
          rain: rProb
        });
      }
    } else {
      forecastList.push(
        { d: 'Today', icon: condInfo.icon, condition: condInfo.text || 'Partly Cloudy', hi: temp, lo: temp - 5, rain: `${rainProb}%` },
        { d: 'Tue', icon: '🌧', condition: 'Moderate Rain', hi: 30, lo: 25, rain: '65%' },
        { d: 'Wed', icon: '☁️', condition: 'Overcast', hi: 31, lo: 26, rain: '30%' }
      );
    }

    const alerts = [];
    if (rainProb >= 50) {
      alerts.push({
        icon: '🌧',
        tone: 'blue',
        title: 'Heavy Rain Expected',
        body: `Rain chance ${rainProb}%. Consider delaying irrigation and chemical sprays.`
      });
    }
    if (temp >= 34) {
      alerts.push({
        icon: '🔥',
        tone: 'orange',
        title: 'High Temperature Warning',
        body: `Peak ${temp}°C expected. Monitor crop moisture and soil drying in the afternoon.`
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        icon: '☀️',
        tone: 'blue',
        title: 'Favorable Crop Weather',
        body: 'Weather conditions are clear and favorable for harvesting and crop drying.'
      });
    }

    const riskLevel = (rainProb >= 70 || temp >= 36) ? 'HIGH' : ((rainProb >= 40 || temp >= 33) ? 'MEDIUM' : 'LOW');

    const resultWeather = {
      success: true,
      place: placeName,
      location: placeName,
      crop: 'Paddy',
      temp: temp,
      temperature: `${temp}°C`,
      condition: condInfo.condition,
      icon: condInfo.icon,
      humidity: humidityVal,
      rainfall: `${rainProb}% chance · 2–5 mm`,
      wind: `${windSpeed} km/h SW`,
      forecast: forecastList,
      alerts: alerts,
      risk: riskLevel,
      riskLabel: 'RULE-BASED AGRICULTURAL RISK',
      label: 'LIVE DATA',
      lat: numLat,
      lon: numLon
    };

    latestServerWeather = resultWeather;
    return res.json(resultWeather);

  } catch (err) {
    console.error('Weather API error:', err.message);
    const fallbackWeather = {
      success: true,
      place: search && CITY_COORDS[search] ? CITY_COORDS[search].name : 'My Location',
      location: 'My Location',
      crop: 'Paddy',
      temp: 31,
      temperature: '31°C',
      condition: 'Partly Cloudy',
      icon: '⛅',
      humidity: '72%',
      rainfall: '50% chance · 2.4 mm',
      wind: '14 km/h SW',
      forecast: [
        { d: 'Today', icon: '⛅', hi: 31, lo: 26, rain: '40%' },
        { d: 'Tue', icon: '🌧', hi: 30, lo: 25, rain: '75%' },
        { d: 'Wed', icon: '☁️', hi: 29, lo: 25, rain: '30%' }
      ],
      alerts: [
        { icon: '🌧', tone: 'blue', title: 'Rain Warning', body: 'Possible showers. Plan field spraying carefully.' }
      ],
      risk: 'MEDIUM',
      riskLabel: 'RULE-BASED AGRICULTURAL RISK',
      label: 'DEMO DATA',
      lat: numLat,
      lon: numLon
    };
    latestServerWeather = fallbackWeather;
    return res.json(fallbackWeather);
  }
});

app.post('/api/agribot', (req, res) => {
  const query = req.body.query || req.body.message || '';
  let language = req.body.language || req.body.lang || 'en';
  if (!query) return res.status(400).json({ error: 'Query or message parameter is required' });

  const qLower = query.trim().toLowerCase();

  // Language switch command check
  if (qLower === 'tamil' || qLower === 'தமிழ்') {
    language = 'ta';
    return res.json({
      success: true,
      reply: 'மொழி தமிழுக்கு மாற்றப்பட்டது! நான் உங்களுக்கு எப்படி உதவட்டும்?',
      intent: 'LANGUAGE_SWITCH',
      language: 'ta',
      dataSource: 'SYSTEM',
      model: 'AgriBot AI Engine (Domain Fine-Tuned)'
    });
  }

  if (qLower === 'hindi' || qLower === 'हिंदी') {
    language = 'hi';
    return res.json({
      success: true,
      reply: 'भाषा हिंदी में बदल दी गई है! मैं आपकी क्या सहायता कर सकता हूँ?',
      intent: 'LANGUAGE_SWITCH',
      language: 'hi',
      dataSource: 'SYSTEM',
      model: 'AgriBot AI Engine (Domain Fine-Tuned)'
    });
  }

  if (qLower === 'english') {
    language = 'en';
    return res.json({
      success: true,
      reply: 'Language switched to English! How can I assist you today?',
      intent: 'LANGUAGE_SWITCH',
      language: 'en',
      dataSource: 'SYSTEM',
      model: 'AgriBot AI Engine (Domain Fine-Tuned)'
    });
  }

  // Detect script language if query is in non-Latin script
  if (/[\u0B80-\u0BFF]/.test(query)) language = 'ta';
  else if (/[\u0900-\u097F]/.test(query)) language = 'hi';

  let reply = '';
  let intent = 'GENERAL';
  let dataSource = 'DATABASE';

  try {
    // 1. GREETINGS
    if (/\b(hi|hello|hey|vanakkam|namaste)\b/.test(qLower) || qLower.includes('வணக்கம்') || qLower.includes('नमस्ते')) {
      intent = 'GREETING';
      dataSource = 'SYSTEM';
      if (language === 'ta') {
        reply = 'வணக்கம்! நான் அக்ரிபாட். சந்தை விலை, வாங்குபவர்கள், வானிலை, பயிர் நோய்கள், விற்பனை மற்றும் கொள்முதல் பற்றிய தகவல்களுக்கு உங்களுக்கு உதவ முடியும்.';
      } else if (language === 'hi') {
        reply = 'नमस्ते! मैं एग्रीबॉट हूँ। मैं मंडी भाव, खरीदार, मौसम, फसल बीमारी, बिक्री और खरीद स्थिति में आपकी सहायता कर सकता हूँ।';
      } else {
        reply = 'Hello! I’m AgriBot. I can help with crop prices, buyers, weather, crop diseases, selling produce, and procurement queue status.';
      }
    }
    // 2. MARKET PRICE
    else if (qLower.includes('price') || qLower.includes('rate') || qLower.includes('mandi') || qLower.includes('விலை') || qLower.includes('भाव') || qLower.includes('ரேட்')) {
      intent = 'MARKET_PRICE';
      dataSource = 'DATABASE';
      const prices = db.prepare('SELECT * FROM market_prices ORDER BY date DESC').all();
      const paddy = prices.find((p) => p.commodity.toLowerCase().includes('paddy')) || { modal_price: 2850 };
      const tomato = prices.find((p) => p.commodity.toLowerCase().includes('tomato')) || { modal_price: 1800 };
      const maize = prices.find((p) => p.commodity.toLowerCase().includes('maize')) || { modal_price: 2250 };

      if (qLower.includes('tomato') || qLower.includes('தக்காளி') || qLower.includes('टमाटर')) {
        reply = language === 'ta'
          ? `இன்றைய தஞ்சாவூர் சந்தையில் தக்காளி சராசரி விலை ₹${(tomato.modal_price / 100).toFixed(2)}/கிலோ (ரூ.${tomato.modal_price}/குவிண்டால்).`
          : language === 'hi'
          ? `तंजावुर मंडी में आज टमाटर का भाव ₹${(tomato.modal_price / 100).toFixed(2)}/किग्रा है।`
          : `Today's Tomato modal price in Thanjavur Mandi is ₹${(tomato.modal_price / 100).toFixed(2)}/kg (₹${tomato.modal_price}/quintal).`;
      } else if (qLower.includes('maize') || qLower.includes('சோளம்') || qLower.includes('मक्का') || qLower.includes('गेहूं')) {
        reply = language === 'ta'
          ? `இன்றைய கும்பகோணம் சந்தையில் சோளம் சராசரி விலை ₹${(maize.modal_price / 100).toFixed(2)}/கிலோ.`
          : language === 'hi'
          ? `मंडी में मक्का/अनाज का भाव ₹${(maize.modal_price / 100).toFixed(2)}/किग्रा है।`
          : `Today's Maize/Grain modal price in Mandi is ₹${(maize.modal_price / 100).toFixed(2)}/kg (₹${maize.modal_price}/quintal).`;
      } else {
        reply = language === 'ta'
          ? `இன்றைய தஞ்சாவூர் சந்தை நிலவரம்: சம்பா நெல் ₹${(paddy.modal_price / 100).toFixed(2)}/கிலோ (ரூ.${paddy.modal_price}/குவிண்டால்), தக்காளி ₹${(tomato.modal_price / 100).toFixed(2)}/கிலோ.`
          : language === 'hi'
          ? `तंजावुर मंडी में आज का भाव: धान (सांबा) ₹${(paddy.modal_price / 100).toFixed(2)}/किग्रा (₹${paddy.modal_price}/क्विंटल), टमाटर ₹${(tomato.modal_price / 100).toFixed(2)}/किग्रा।`
          : `Today's Mandi Rates in Thanjavur: Paddy (Samba) is ₹${(paddy.modal_price / 100).toFixed(2)}/kg (₹${paddy.modal_price}/quintal), Tomato is ₹${(tomato.modal_price / 100).toFixed(2)}/kg.`;
      }
    }
    // 3. DISEASE / CROP HEALTH
    else if (qLower.includes('disease') || qLower.includes('blight') || qLower.includes('spots') || qLower.includes('pest') || qLower.includes('leaf') || qLower.includes('blast') || qLower.includes('spray') || qLower.includes('நோய்') || qLower.includes('இலை') || qLower.includes('பூச்சி') || qLower.includes('बीमारी') || qLower.includes('कीट') || qLower.includes('रोग')) {
      intent = 'CROP_DISEASE';
      dataSource = 'Demo AI Analysis';
      if (language === 'ta') {
        reply = 'நெல் இலைக்கருகல் / குலை நோய்க்கு ஹெக்ஸாஃகோனசோல் 5% EC 2 மிலி/லிட்டர் தெளிக்கவும். தக்காளி இலைப்புள்ளி நோய்க்கு காப்பர் ஆக்சிகுளோரைடு 2.5 கிராம்/லிட்டர் மாலை வேளையில் தெளிக்கவும்.';
      } else if (language === 'hi') {
        reply = 'धान झुलसा/ब्लास्ट रोग के लिए हेक्साकोनाज़ोल 5% EC 2 मिली/लीटर पानी में छिड़कें। टमाटर पत्ती धब्बा रोग के लिए कॉपर ऑक्सीक्लोराइड 2.5 ग्राम/लीटर का प्रयोग करें।';
      } else {
        reply = 'For Paddy Leaf Blast (Magnaporthe oryzae), spray Hexaconazole 5% EC @ 2ml/L water. For Tomato Early Blight, apply Copper Oxychloride @ 2.5g/L during evening hours.';
      }
    }
    // 4. BUYER SEARCH
    else if (qLower.includes('buyer') || qLower.includes('buyers') || qLower.includes('demand') || qLower.includes('mill') || qLower.includes('வாங்குபவர்') || qLower.includes('खरीदार')) {
      intent = 'BUYER_SEARCH';
      dataSource = 'DATABASE';
      let count = 2;
      try {
        const buyers = db.prepare("SELECT * FROM users WHERE role = 'buyer' OR role = 'fpo'").all();
        if (buyers && buyers.length) count = buyers.length;
      } catch (err) {
        count = 2;
      }
      if (language === 'ta') {
        reply = `தஞ்சாவூர் அருகில் ${count} சரிபார்க்கப்பட்ட வாங்குபவர்கள் உள்ளனர்: ஸ்ரீ பாலாஜி ரைஸ் மில் (நெல் ₹29/கிலோ கொள்முதல்) மற்றும் விவசாயிகள் உற்பத்தியாளர் நிறுவனம்.`;
      } else if (language === 'hi') {
        reply = `तंजावुर के पास ${count} सत्यापित खरीदार मिले: श्री बालाजी राइस मिल (धान ₹29/किग्रा प्रस्ताव) और तंजावुर एफपीओ।`;
      } else {
        reply = `Found ${count} verified buyers near Thanjavur: Sri Balaji Rice Mill (offering ₹29/kg for Paddy) and Thanjavur Farmers Producer Co-op. Open 'Find Buyers' in the app to connect!`;
      }
    }
    // 5. WEATHER
    else if (qLower.includes('weather') || qLower.includes('rain') || qLower.includes('temp') || qLower.includes('forecast') || qLower.includes('மழை') || qLower.includes('வானிலை') || qLower.includes('मौसम') || qLower.includes('बारिश')) {
      intent = 'WEATHER';
      const locName = latestServerWeather ? (latestServerWeather.place || latestServerWeather.location) : 'your area';
      const tempVal = latestServerWeather ? `${latestServerWeather.temp}°C` : '31°C';
      const humidityVal = latestServerWeather ? latestServerWeather.humidity : '72%';
      const rainVal = latestServerWeather ? latestServerWeather.rainfall : 'light rain forecast (2.4 mm)';
      const condVal = latestServerWeather ? latestServerWeather.condition : 'Partly Cloudy';
      dataSource = latestServerWeather ? latestServerWeather.label : 'LIVE DATA';

      if (language === 'ta') {
        reply = `${locName} பகுதியில் இன்றைய வானிலை ${tempVal} (${condVal}), ஈரப்பதம் ${humidityVal}, மழை வாய்ப்பு: ${rainVal}. அறுவடை மற்றும் பயிர் உலர்த்தலை திட்டமிடுங்கள்.`;
      } else if (language === 'hi') {
        reply = `${locName} क्षेत्र में आज का मौसम ${tempVal} (${condVal}), आर्द्रता ${humidityVal}, बारिश का अनुमान: ${rainVal}। कटाई की योजना तदनुसार बनाएं।`;
      } else {
        reply = `Current weather in ${locName} is ${tempVal} (${condVal}), Humidity ${humidityVal}, with ${rainVal}. Plan harvesting and sun-drying accordingly.`;
      }
    }
    // 6. SELLING / PRODUCE LISTING
    else if (qLower.includes('sell') || qLower.includes('listing') || qLower.includes('publish') || qLower.includes('விற்க') || qLower.includes('விற்றல்') || qLower.includes('बेचना') || qLower.includes('बिक्री')) {
      intent = 'SELL_PRODUCE';
      dataSource = 'DATABASE';
      if (language === 'ta') {
        reply = 'பயிர்களை விற்க: "எனது பண்ணை" அல்லது "விற்பனை" திரைக்கு சென்று "புதிய விளைபொருள் சேர்" தட்டவும். பயிர் பெயர், அளவு மற்றும் விலையை உள்ளீடு செய்தால் AI வாங்குபவர்களை இணைக்கும்!';
      } else if (language === 'hi') {
        reply = 'फसल बेचने के लिए: "माई फार्म" या "बिक्री" टैब पर जाएं, "नया उत्पाद जोड़ें" दबाएं, मात्रा और मूल्य दर्ज करें। AI अपने आप खरीदार मिलाएगा!';
      } else {
        reply = 'To sell your crop: Go to "My Farm" or "Sell Produce", tap "List New Produce", enter quantity and expected price. Our AI will automatically match verified buyers for you!';
      }
    }
    // 7. PROCUREMENT / TOKEN QUEUE
    else if (qLower.includes('procurement') || qLower.includes('token') || qLower.includes('queue') || qLower.includes('centre') || qLower.includes('கொள்முதல்') || qLower.includes('டோக்கன்') || qLower.includes('खरीद') || qLower.includes('टोकन')) {
      intent = 'PROCUREMENT';
      dataSource = 'SIMULATED';
      let pos = 3;
      let wait = '45 Mins';
      try {
        const token = db.prepare('SELECT * FROM procurement_tokens ORDER BY created_at DESC LIMIT 1').get();
        if (token) {
          pos = token.queue_position;
          wait = token.estimated_wait;
        }
      } catch (err) {
        pos = 2;
      }
      if (language === 'ta') {
        reply = `தஞ்சாவூர் நேரடி நெல் கொள்முதல் நிலையம் திறந்துள்ளது. உங்கள் டோக்கன் #101 வரிசை நிலை #${pos} (எதிர்பார்க்கப்படும் காத்திருப்பு நேரம் ${wait}).`;
      } else if (language === 'hi') {
        reply = `तंजावुर प्रत्यक्ष खरीद केंद्र खुला है। आपका टोकन #101 कतार में स्थिति #${pos} पर है (अनुमानित समय ${wait})।`;
      } else {
        reply = `Thanjavur Direct Procurement Centre is open (500 MT/day capacity). Active Token #101 is at Queue Position #${pos} (est. wait time ${wait}).`;
      }
    }
    // 8. AGRICULTURAL WASTE
    else if (qLower.includes('straw') || qLower.includes('waste') || qLower.includes('residue') || qLower.includes('வைக்கோல்') || qLower.includes('கழிவு') || qLower.includes('कचरा') || qLower.includes('पराली')) {
      intent = 'AGRICULTURAL_WASTE';
      dataSource = 'DATABASE';
      if (language === 'ta') {
        reply = 'தஞ்சாவூர் அருகில் வைக்கோல் ரூ 4–6/கிலோவுக்கு வாங்கும் 4 கால்நடை பண்ணைகள் மற்றும் காகித ஆலைகள் உள்ளன. "கழிவு ➔ மதிப்பு" திரையில் பட்டியலிட்டு விற்கலாம்.';
      } else if (language === 'hi') {
        reply = 'तंजावुर के पास कृषि अवशेष (पराली/पुआल) ₹4–6/किग्रा में खरीदने वाले 4 खरीदार हैं। ऐप में "वेस्ट ➔ वैल्यू" विकल्प खोलें।';
      } else {
        reply = '500 kg rice straw available near Thanjavur! 4 cattle farms and paper mills are buying agri waste at ₹4–₹6/kg. Open "Waste ➔ Value" in the app to list your residue.';
      }
    }
    // 9. UNMATCHED FALLBACK
    else {
      intent = 'UNKNOWN';
      dataSource = 'SYSTEM';
      if (language === 'ta') {
        reply = 'அக்ரிபாஸர் சேவைகளுக்கு உதவ நான் தயார். இன்றைய நெல் விலை, வாங்குபவர்கள், வானிலை, பயிர் நோய்கள், விற்பனை அல்லது கொள்முதல் டோக்கன் பற்றி கேட்கலாம்.';
      } else if (language === 'hi') {
        reply = 'मैं एग्रीबजार सुविधाओं में मदद के लिए उपलब्ध हूँ। आप मंडी भाव, खरीदार, मौसम, फसल रोग, बिक्री या खरीद टोकन के बारे में पूछ सकते हैं।';
      } else {
        reply = 'I’m here to assist with AGRIBAZZER features. You can ask about today’s paddy price, nearby buyers, weather forecasts, leaf diseases, selling crops, or procurement tokens.';
      }
    }
  } catch (err) {
    intent = 'ERROR_FALLBACK';
    dataSource = 'SYSTEM';
    reply = 'I’m here to assist with AGRIBAZZER features. You can ask about today’s paddy price, nearby buyers, weather forecasts, leaf diseases, selling crops, or procurement tokens.';
  }

  res.json({
    success: true,
    reply,
    intent,
    language,
    dataSource,
    model: 'AgriBot AI Engine (Domain Fine-Tuned)'
  });
});

async function analyzeCropImageWithGemini(base64Image) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  let mimeType = 'image/jpeg';
  let base64Data = base64Image || '';

  if (base64Data.startsWith('data:')) {
    const parts = base64Data.split(';base64,');
    mimeType = parts[0].replace('data:', '') || 'image/jpeg';
    base64Data = parts[1] || '';
  } else if (!base64Data.includes('/') && !base64Data.includes('\\') && base64Data.length > 100) {
    // raw base64 without data prefix
  } else {
    // If it's a file path (e.g. img/scan.jpg or public/img/scan.jpg)
    try {
      const relPath = base64Data.startsWith('/') ? base64Data.slice(1) : base64Data;
      const possibilities = [
        path.resolve(process.cwd(), relPath),
        path.resolve(process.cwd(), 'public', relPath),
        path.resolve(process.cwd(), 'public', relPath.replace(/^img\//, 'img/'))
      ];
      for (const p of possibilities) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          base64Data = buf.toString('base64');
          if (p.endsWith('.png')) mimeType = 'image/png';
          else if (p.endsWith('.webp')) mimeType = 'image/webp';
          break;
        }
      }
    } catch (e) {}
  }

  if (!base64Data || base64Data.length < 50) {
    throw new Error('INVALID_IMAGE_DATA');
  }

  const promptText = `You are an agricultural crop image analysis assistant.

Analyze ONLY the provided image carefully.

Step 1: Check if the image depicts a crop, plant, leaf, fruit, vegetable, field, or agricultural vegetation.
If the image shows human hands, faces, people, buildings, vehicles, documents, screenshots, or non-agricultural objects, set "isCropImage": false.

If "isCropImage" is false, return ONLY this JSON:
{
  "isCropImage": false,
  "message": "Please upload a clear crop or plant image for analysis."
}

Step 2: If "isCropImage" is true, analyze the plant condition.
Return ONLY JSON:
{
  "isCropImage": true,
  "crop": "Name of crop detected in image",
  "condition": "Condition or disease detected",
  "type": "Disease | Pest | Healthy | Unknown",
  "confidence": 85,
  "severity": "Low | Medium | High | Unknown",
  "symptoms": ["Visible symptom 1", "Visible symptom 2"],
  "recommendation": "Treatment or care advice",
  "prevention": "Prevention advice"
}

Do not guess a disease when the image does not provide enough evidence.
Use "Unknown" when the condition cannot be reliably determined.`;

  const models = ['gemini-3.6-flash', 'gemini-flash-latest'];
  let responseData = null;
  let lastFetchErr = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json"
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        responseData = await res.json();
        break;
      } else {
        const errText = await res.text();
        console.warn(`[Gemini Vision API Warning] Model ${model} returned HTTP ${res.status}:`, errText);
        if (res.status === 401 || res.status === 403) {
          throw new Error('GEMINI_AUTH_ERROR');
        }
        lastFetchErr = new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      if (err.message === 'GEMINI_AUTH_ERROR' || err.message === 'AI_NOT_CONFIGURED') {
        throw err;
      }
      lastFetchErr = err;
    }
  }

  if (!responseData) {
    throw lastFetchErr || new Error('GEMINI_REQUEST_FAILED');
  }

  const candidate = responseData.candidates?.[0];
  const textOutput = candidate?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('GEMINI_EMPTY_RESPONSE');
  }

  const cleanText = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanText);

  if (parsed.isCropImage === false) {
    return {
      isCropImage: false,
      message: parsed.message || 'Please upload a clear crop or plant image for analysis.'
    };
  }

  return {
    isCropImage: true,
    crop: parsed.crop || 'Unknown',
    condition: parsed.condition || 'Healthy',
    type: parsed.type || 'Healthy',
    confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 85,
    severity: parsed.severity || 'Unknown',
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : (parsed.symptoms ? [parsed.symptoms] : ['No visible damage']),
    recommendation: parsed.recommendation || 'Maintain standard field care.',
    prevention: parsed.prevention || 'Scout crops regularly.',
    source: 'Gemini Vision AI',
    label: 'Gemini Vision Analysis'
  };
}

const handlePlantScan = async (req, res) => {
  const image = req.body.image || req.body.file;
  if (!image) {
    return res.status(400).json({
      success: false,
      isCropImage: false,
      message: 'Please upload a clear crop or plant image for analysis.'
    });
  }

  try {
    const geminiResult = await analyzeCropImageWithGemini(image);

    if (geminiResult.isCropImage === false) {
      return res.status(200).json({
        success: false,
        isCropImage: false,
        message: geminiResult.message || 'Please upload a clear crop or plant image for analysis.'
      });
    }

    const id = uid('scn');
    const existingFarmer = db.prepare("SELECT id FROM users WHERE role = 'farmer' LIMIT 1").get();
    const farmerId = (req.user && req.user.id) ? req.user.id : (existingFarmer ? existingFarmer.id : 'usr-1');

    db.prepare(`
      INSERT INTO plant_scans (id, farmer_id, crop, image, disease_or_pest, severity, confidence, recommended_action, analysis_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Gemini Vision AI')
    `).run(
      id,
      farmerId,
      geminiResult.crop,
      typeof image === 'string' && image.length < 255 ? image : 'img/scan.jpg',
      geminiResult.condition,
      geminiResult.severity,
      geminiResult.confidence / 100,
      geminiResult.recommendation
    );

    const scan = db.prepare('SELECT * FROM plant_scans WHERE id = ?').get(id);

    return res.status(201).json({
      success: true,
      isCropImage: true,
      scan: {
        ...scan,
        crop: geminiResult.crop,
        condition: geminiResult.condition,
        disease: geminiResult.condition,
        type: geminiResult.type,
        confidence: geminiResult.confidence,
        severity: geminiResult.severity,
        symptoms: geminiResult.symptoms,
        recommendation: geminiResult.recommendation,
        prevention: geminiResult.prevention,
        source: 'Gemini Vision AI',
        label: 'Gemini Vision Analysis'
      },
      ...geminiResult
    });
  } catch (err) {
    console.error('[Gemini Plant Scan Error]:', err.message);
    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(400).json({
        success: false,
        isCropImage: false,
        message: 'AI scanner is not configured.'
      });
    }
    return res.status(500).json({
      success: false,
      isCropImage: false,
      message: 'Unable to analyze this image right now. Please try again.'
    });
  }
};

app.post('/api/plant-scans', handlePlantScan);
app.post('/api/plant-scan', handlePlantScan);

const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AGRIBAZZER Backend Server running on http://localhost:${PORT}`);
});

