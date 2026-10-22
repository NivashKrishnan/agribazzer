import db, { initDatabase } from './db.js';

export async function seedDatabase() {
  await initDatabase();

  const userCountRow = await db.get('SELECT COUNT(*) as count FROM users');
  const userCount = Number(userCountRow?.count || 0);
  if (userCount > 0) {
    console.log('ℹ️ Database already seeded.');
    return;
  }

  console.log('🌱 Seeding AGRIBAZZER initial database records...');

  const insertUserSql = `
    INSERT INTO users (id, name, email, phone, password_hash, role, language, location, farm_size, main_crop, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.run(insertUserSql, ['usr-1', 'Ramesh Kumar', 'ramesh@agribazzer.com', '+91 98765 43210', 'hashed_pass_123', 'farmer', 'ta', 'Thanjavur, Tamil Nadu', '5.2 Acres', 'Paddy (Samba)', 1]);
  await db.run(insertUserSql, ['usr-2', 'Sri Balaji Rice Mill', 'balaji@ricemill.com', '+91 98400 12345', 'hashed_pass_456', 'buyer', 'en', 'Kumbakonam, Tamil Nadu', null, null, 1]);
  await db.run(insertUserSql, ['usr-3', 'Thanjavur Farmers Producer Co-op', 'fpo@thanjavur.org', '+91 94431 00000', 'hashed_pass_789', 'fpo', 'ta', 'Thanjavur, Tamil Nadu', '120 Acres', 'Paddy & Maize', 1]);

  // Farms & Crops
  const insertFarmSql = `
    INSERT INTO farms (id, farmer_id, farm_name, location, latitude, longitude, area, soil_information)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertFarmSql, ['frm-1', 'usr-1', 'Green Acres Paddy Field', 'Thanjavur, Tamil Nadu', 10.787, 79.1378, '5.2 Acres', 'Alluvial Clay Soil - High Fertility']);

  const insertCropSql = `
    INSERT INTO crops (id, farm_id, crop_name, variety, growth_stage, sowing_date, expected_harvest_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertCropSql, ['crp-1', 'frm-1', 'Paddy', 'Samba (CR-1009)', 'Maturation Stage', '2026-06-15', '2026-10-20', 'Healthy']);
  await db.run(insertCropSql, ['crp-2', 'frm-1', 'Tomato', 'PKM-1', 'Flowering & Fruiting', '2026-07-01', '2026-09-30', 'Requires Attention']);

  // Produce Lots
  const insertLotSql = `
    INSERT INTO produce_lots (id, farmer_id, crop, variety, image, quantity, unit, quality, grade, harvest_date, expected_price, location, latitude, longitude, status, is_waste)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertLotSql, ['lot-1', 'usr-1', 'Paddy', 'Samba (CR-1009)', 'img/paddy.jpg', 5000, 'kg', 'Grade A (Moisture < 13%)', 'A', '2026-10-20', 28.5, 'Thanjavur, Tamil Nadu', 10.787, 79.1378, 'PUBLISHED', 0]);
  await db.run(insertLotSql, ['lot-2', 'usr-1', 'Tomato', 'Hybrid Red', 'img/tomato.jpg', 800, 'kg', 'Grade B (Fresh Pick)', 'B', '2026-09-25', 18.0, 'Thanjavur, Tamil Nadu', 10.787, 79.1378, 'PUBLISHED', 0]);
  await db.run(insertLotSql, ['lot-3', 'usr-1', 'Paddy Rice Straw', 'Dry Residue', 'img/straw.jpg', 2500, 'kg', 'Clean Baled Residue', 'A', '2026-10-22', 4.5, 'Thanjavur, Tamil Nadu', 10.787, 79.1378, 'PUBLISHED', 1]);

  // Buyer Demands
  const insertDemandSql = `
    INSERT INTO buyer_demands (id, buyer_id, crop, required_quantity, quality_requirement, offered_price, location, latitude, longitude, required_date, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertDemandSql, ['dem-1', 'usr-2', 'Paddy', 10000, 'Moisture < 14%, CR-1009', 29.0, 'Kumbakonam, Tamil Nadu', 10.9602, 79.3845, '2026-10-25', 'Urgent requirement for mill processing.', 'ACTIVE']);

  // Procurement Centres
  const insertCentreSql = `
    INSERT INTO procurement_centres (id, name, district, state, location, capacity, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertCentreSql, ['pc-1', 'Thanjavur Direct Procurement Centre', 'Thanjavur', 'Tamil Nadu', 'Medical College Road, Thanjavur', '500 MT / Day', 'OPEN']);
  await db.run(insertCentreSql, ['pc-2', 'Kumbakonam Regulated Market Committee', 'Thanjavur', 'Tamil Nadu', 'Main Road, Kumbakonam', '350 MT / Day', 'OPEN']);

  // Procurement Tokens
  const insertTokenSql = `
    INSERT INTO procurement_tokens (id, farmer_id, centre_id, crop, quantity, token_number, queue_position, estimated_wait, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertTokenSql, ['tok-101', 'usr-1', 'pc-1', 'Paddy (Samba)', 3000, 101, 3, '45 Mins', 'WAITING']);

  // Market Prices
  const insertMarketSql = `
    INSERT INTO market_prices (id, commodity, variety, state, district, market, min_price, max_price, modal_price, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertMarketSql, ['mp-1', 'Paddy (Dhan)', 'Samba', 'Tamil Nadu', 'Thanjavur', 'Thanjavur Mandi', 2600, 2900, 2850, '2026-09-09']);
  await db.run(insertMarketSql, ['mp-2', 'Tomato', 'Hybrid', 'Tamil Nadu', 'Thanjavur', 'Thanjavur Mandi', 1400, 2000, 1800, '2026-09-09']);
  await db.run(insertMarketSql, ['mp-3', 'Maize', 'Yellow', 'Tamil Nadu', 'Thanjavur', 'Kumbakonam Mandi', 2100, 2400, 2250, '2026-09-09']);

  // Notifications
  const insertNotifSql = `
    INSERT INTO notifications (id, user_id, title, message, type, read, related_entity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await db.run(insertNotifSql, ['notif-1', 'usr-1', '🎉 New Buyer Match!', 'Sri Balaji Rice Mill matched 94% with your Paddy lot.', 'MATCH', 0, 'lot-1']);
  await db.run(insertNotifSql, ['notif-2', 'usr-1', '⚡ Price Update Alert', 'Paddy Samba modal price increased by +₹50/quintal in Thanjavur.', 'PRICE', 1, 'mp-1']);

  console.log('✅ AGRIBAZZER initial database seeded successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
}
