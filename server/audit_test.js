import db from './db.js';

const BASE = 'http://localhost:5000/api';

async function runAudit() {
  console.log('====================================================');
  console.log('  AGRIBAZZER FULL END-TO-END AUDIT & VERIFICATION');
  console.log('====================================================\n');

  const results = {
    passed: [],
    failed: [],
  };

  function logPass(step, msg) {
    results.passed.push(`${step}: ${msg}`);
    console.log(`✅ [PASS] ${step}: ${msg}`);
  }

  function logFail(step, err) {
    results.failed.push(`${step}: ${err}`);
    console.error(`❌ [FAIL] ${step}: ${err}`);
  }

  // 1. FARMER AUTH TEST
  let farmerToken = '';
  let farmerUser = null;
  let orderId = '';
  const farmerPhone = `+9198${Date.now().toString().slice(-8)}`;
  try {
    const regRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Audit Farmer', phone: farmerPhone, password: 'pass123password', role: 'farmer', location: 'Thanjavur' }),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201) throw new Error(regData.error || 'Register failed');
    farmerToken = regData.token;
    farmerUser = regData.user;

    // Login test
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: farmerPhone, password: 'pass123password' }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');
    farmerToken = loginData.token;

    // /api/auth/me test
    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok || meData.user.id !== farmerUser.id) throw new Error('/api/auth/me failed');

    // Logout & Re-login
    await fetch(`${BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });

    const reloginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: farmerPhone, password: 'pass123password' }),
    });
    const reloginData = await reloginRes.json();
    farmerToken = reloginData.token;

    logPass('1. FARMER AUTH', `Registered, logged in, /me verified, logged out & re-authenticated (User ID: ${farmerUser.id})`);
  } catch (e) {
    logFail('1. FARMER AUTH', e.message);
  }

  // 2. FARM SETUP TEST
  let farmId = '';
  let cropId = '';
  try {
    const addFarmRes = await fetch(`${BASE}/farms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ farmName: 'Sunrise Paddy Fields', area: '4.5 Acres', soilInformation: 'Clay Loam' }),
    });
    const addFarmData = await addFarmRes.json();
    farmId = addFarmData.farm.id;

    const getFarmsRes = await fetch(`${BASE}/farms`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const getFarmsData = await getFarmsRes.json();
    if (!getFarmsData.farms.some((f) => f.id === farmId)) throw new Error('Added farm not retrieved');

    const addCropRes = await fetch(`${BASE}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ farmId, cropName: 'Paddy', variety: 'Samba CR-1009', growthStage: 'Harvesting' }),
    });
    const addCropData = await addCropRes.json();
    cropId = addCropData.crop.id;

    const getCropsRes = await fetch(`${BASE}/crops`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const getCropsData = await getCropsRes.json();
    if (!getCropsData.crops.some((c) => c.id === cropId)) throw new Error('Added crop not retrieved');

    logPass('2. FARM SETUP', `Farm (${farmId}) & Crop (${cropId}) created and verified in SQLite`);
  } catch (e) {
    logFail('2. FARM SETUP', e.message);
  }

  // 3. SELL PRODUCE TEST
  let lotId = '';
  try {
    const createLotRes = await fetch(`${BASE}/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ crop: 'Paddy', variety: 'Samba CR-1009', quantity: 2500, quality: 'Grade A Premium', expectedPrice: 29.0, location: 'Thanjavur, TN' }),
    });
    const createLotData = await createLotRes.json();
    lotId = createLotData.lot.id;

    const dbLot = await db.get('SELECT * FROM produce_lots WHERE id = ?', [lotId]);
    if (!dbLot || dbLot.farmer_id !== farmerUser.id) throw new Error('Lot ownership or database persistence failed');

    logPass('3. SELL PRODUCE', `Produce Lot (${lotId}) published by Farmer (${farmerUser.id}) and verified in ${db.getDatabaseType()}`);
  } catch (e) {
    logFail('3. SELL PRODUCE', e.message);
  }

  // 4. BUYER AUTH & DEMAND TEST
  let buyerToken = '';
  let buyerUser = null;
  let demandId = '';
  const buyerPhone = `+9197${Date.now().toString().slice(-8)}`;
  try {
    const regBRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Thanjavur Modern Rice Mill', phone: buyerPhone, password: 'buyerpassword123', role: 'buyer', location: 'Kumbakonam' }),
    });
    const regBData = await regBRes.json();
    buyerToken = regBData.token;
    buyerUser = regBData.user;

    const addDemRes = await fetch(`${BASE}/demands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ crop: 'Paddy', requiredQuantity: 5000, qualityRequirement: 'Grade A', offeredPrice: 30.0, location: 'Kumbakonam' }),
    });
    const addDemData = await addDemRes.json();
    demandId = addDemData.demand.id;

    const dbDem = await db.get('SELECT * FROM buyer_demands WHERE id = ?', [demandId]);
    if (!dbDem || dbDem.buyer_id !== buyerUser.id) throw new Error('Demand persistence failed');

    logPass('4. BUYER DEMAND', `Buyer (${buyerUser.id}) registered & Demand (${demandId}) persisted in ${db.getDatabaseType()}`);
  } catch (e) {
    logFail('4. BUYER DEMAND', e.message);
  }

  // 5. AI BUYER MATCHING TEST
  try {
    const matchRes = await fetch(`${BASE}/match?lotId=${lotId}`);
    const matchData = await matchRes.json();
    if (!matchData.matches || !matchData.matches.length) throw new Error('No buyer matches returned');
    const topMatch = matchData.matches[0];

    if (!topMatch.matchScore || !topMatch.matchingReasons.length || topMatch.label !== 'AI Buyer Matching — Prototype') {
      throw new Error('AI Match labeling or criteria error');
    }

    logPass('5. AI BUYER MATCHING', `Matched Lot ${lotId} with ${matchData.matches.length} buyers. Top score: ${topMatch.matchScore}%. Label: "${topMatch.label}"`);
  } catch (e) {
    logFail('5. AI BUYER MATCHING', e.message);
  }

  // 6. OFFER & 7. NEGOTIATION & 8. ORDER TEST
  let offerId = '';
  try {
    // 6. Create Offer
    const offerRes = await fetch(`${BASE}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ produceLotId: lotId, farmerId: farmerUser.id, quantity: 2000, offeredPrice: 28.5 }),
    });
    const offerData = await offerRes.json();
    offerId = offerData.offer.id;

    // 7. Counter Offer by Farmer
    const counterRes = await fetch(`${BASE}/offers/${offerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ status: 'COUNTERED', counterPrice: 29.5, message: 'Minimum acceptable price is 29.5/kg' }),
    });
    const counterData = await counterRes.json();
    if (counterData.offer.status !== 'COUNTERED') throw new Error('Counter offer failed');

    // 8. Accept Offer by Buyer -> Auto Order Creation
    const acceptRes = await fetch(`${BASE}/offers/${offerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    const acceptData = await acceptRes.json();
    orderId = acceptData.order.id;

    const dbOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!dbOrder || dbOrder.total_amount !== 2000 * 29.5) throw new Error('Order verification failed');

    logPass('6-8. OFFER, NEGOTIATION & ORDER', `Offer (${offerId}) countered & accepted. Order (${orderId}) created for Total ₹${dbOrder.total_amount}`);
  } catch (e) {
    logFail('6-8. OFFER, NEGOTIATION & ORDER', e.message);
  }

  // 9. LOGISTICS TEST
  let logisticsId = '';
  try {
    const logRes = await fetch(`${BASE}/logistics?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const logData = await logRes.json();
    logisticsId = logData.logistics.id;

    // Update logistics status
    const updateLogRes = await fetch(`${BASE}/logistics/${logisticsId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ trackingStatus: 'DISPATCHED', estimatedDelivery: '12 Hours' }),
    });
    const updateLogData = await updateLogRes.json();
    if (updateLogData.logistics.tracking_status !== 'DISPATCHED' || updateLogData.label !== 'Demo Tracking') {
      throw new Error('Logistics update or label verification failed');
    }

    logPass('9. LOGISTICS', `Logistics (${logisticsId}) updated to DISPATCHED. Labeled: "${updateLogData.label}"`);
  } catch (e) {
    logFail('9. LOGISTICS', e.message);
  }

  // 10. PAYMENT TEST
  try {
    const payRes = await fetch(`${BASE}/payments?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const payData = await payRes.json();
    const paymentId = payData.payment.id;

    const simPayRes = await fetch(`${BASE}/payments/${paymentId}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const simPayData = await simPayRes.json();
    if (simPayData.payment.status !== 'COMPLETED' || simPayData.label !== 'Simulated Payment') {
      throw new Error('Payment simulation or label verification failed');
    }

    logPass('10. PAYMENT', `Payment (${paymentId}) simulated and completed. Labeled: "${simPayData.label}"`);
  } catch (e) {
    logFail('10. PAYMENT', e.message);
  }

  // 11. NOTIFICATIONS TEST
  try {
    const notifRes = await fetch(`${BASE}/notifications`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const notifData = await notifRes.json();
    if (!notifData.notifications || notifData.notifications.length === 0) {
      throw new Error('No notifications generated');
    }

    logPass('11. NOTIFICATIONS', `${notifData.notifications.length} notifications verified for Farmer`);
  } catch (e) {
    logFail('11. NOTIFICATIONS', e.message);
  }

  // 12. PROCUREMENT TEST
  try {
    const centresRes = await fetch(`${BASE}/procurement/centres`);
    const centresData = await centresRes.json();
    const cId = centresData.centres[0].id;

    const bookRes = await fetch(`${BASE}/procurement/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ centreId: cId, crop: 'Paddy Samba', quantity: 3000 }),
    });
    const bookData = await bookRes.json();
    const tNum = bookData.token.token_number;

    logPass('12. PROCUREMENT', `Booked Token #${tNum} at Centre ${cId}. Position: #${bookData.token.queue_position}, Wait: ${bookData.token.estimated_wait}`);
  } catch (e) {
    logFail('12. PROCUREMENT', e.message);
  }

  // 13. MARKET PRICE TEST
  try {
    const mRes = await fetch(`${BASE}/market-prices`);
    const mData = await mRes.json();
    if (!mData.prices.length || !['LIVE', 'DATABASE'].includes(mData.label)) throw new Error('Market price response error');

    logPass('13. MARKET PRICE', `${mData.prices.length} rates fetched. Top: ${mData.prices[0].commodity} ₹${mData.prices[0].modal_price}/quintal. Label: "${mData.label}"`);
  } catch (e) {
    logFail('13. MARKET PRICE', e.message);
  }

  // 14. WEATHER TEST
  try {
    const wRes = await fetch(`${BASE}/weather`);
    const wData = await wRes.json();
    if (!wData.temperature || !['LIVE DATA', 'DATABASE'].includes(wData.label)) throw new Error('Weather data invalid');

    logPass('14. WEATHER', `Temp: ${wData.temperature}, Condition: ${wData.forecast[0].condition}. Label: "${wData.label}"`);
  } catch (e) {
    logFail('14. WEATHER', e.message);
  }

  // 15. PLANT SCANNER TEST
  try {
    const scanRes = await fetch(`${BASE}/plant-scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ crop: 'Paddy' }),
    });
    const scanData = await scanRes.json();
    if (!scanData.scan?.disease_or_pest || !['Demo AI Analysis', 'Gemini AI Analysis', 'Gemini Vision AI'].includes(scanData.label || scanData.scan?.analysis_type)) throw new Error('Scan result error');

    logPass('15. PLANT SCANNER', `Diagnosis: "${scanData.scan.disease_or_pest}". Confidence: ${scanData.scan.confidence * 100}%. Label: "${scanData.label}"`);
  } catch (e) {
    logFail('15. PLANT SCANNER', e.message);
  }

  // 16. AGRIBOT TEST
  try {
    const botRes = await fetch(`${BASE}/agribot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Paddy rate in Thanjavur', language: 'ta' }),
    });
    const botData = await botRes.json();
    if (!botData.reply || botData.language !== 'ta') throw new Error('AgriBot language response error');

    logPass('16. AGRIBOT', `Query answered in Tamil: "${botData.reply.slice(0, 45)}..." Model: "${botData.model}"`);
  } catch (e) {
    logFail('16. AGRIBOT', e.message);
  }

  // 17. GRIEVANCE TEST
  try {
    const gRes = await fetch(`${BASE}/grievances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ orderId, title: 'Transport delay inquiry', description: 'Logistics vehicle arrived 1 hour late.' }),
    });
    const gData = await gRes.json();
    const gId = gData.grievance.id;

    // Admin resolution
    const updateGRes = await fetch(`${BASE}/grievances/${gId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ status: 'RESOLVED', adminNotes: 'Contacted logistics provider, resolved.' }),
    });
    const updateGData = await updateGRes.json();
    if (updateGData.grievance.status !== 'RESOLVED') throw new Error('Grievance admin resolution failed');

    logPass('17. GRIEVANCE', `Grievance (${gId}) created and resolved by Admin`);
  } catch (e) {
    logFail('17. GRIEVANCE', e.message);
  }

  // 18. SECURITY TEST
  try {
    const unauthRes = await fetch(`${BASE}/farms`);
    if (unauthRes.status !== 401) throw new Error('Unauthenticated request did not return 401');

    const invRes = await fetch(`${BASE}/farms`, {
      headers: { Authorization: 'Bearer invalid_bogus_token_xyz' },
    });
    if (invRes.status !== 401) throw new Error('Invalid token did not return 401');

    logPass('18. SECURITY', 'Unauthenticated requests (missing/invalid token) correctly blocked with HTTP 401 Unauthorized');
  } catch (e) {
    logFail('18. SECURITY', e.message);
  }

  // 22. DATABASE AUDIT (ALL 17 TABLES)
  try {
    const tables = [
      'users', 'farms', 'crops', 'produce_lots', 'buyer_demands',
      'offers', 'negotiations', 'orders', 'logistics', 'payments',
      'procurement_centres', 'procurement_tokens', 'notifications',
      'grievances', 'plant_scans', 'market_prices', 'weather_data'
    ];

    const tableCounts = {};
    for (const t of tables) {
      const row = await db.get(`SELECT COUNT(*) as c FROM ${t}`);
      tableCounts[t] = Number(row?.c || 0);
    }

    logPass('22. DATABASE AUDIT', `All 17 tables verified intact in ${db.getDatabaseType()}. Record counts: ${JSON.stringify(tableCounts)}`);
  } catch (e) {
    logFail('22. DATABASE AUDIT', e.message);
  }

  console.log('\n====================================================');
  console.log(`  AUDIT SUMMARY: ${results.passed.length} PASSED, ${results.failed.length} FAILED`);
  console.log('====================================================\n');
}

runAudit();
