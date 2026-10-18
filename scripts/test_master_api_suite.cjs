const fs = require('fs');
const path = require('path');
const { testGeminiDirect } = require('./test_gemini_direct.cjs');
const { testDataGovDirect } = require('./test_data_gov_direct.cjs');

// Parse .env manually & safely
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

const BASE = 'http://localhost:5000';

async function runMasterSuite() {
  console.log('================================================================');
  console.log('       AGRIBAZZER COMPLETE API SUITE TEST & VERIFICATION        ');
  console.log('================================================================');
  console.log('--- ENVIRONMENT CONFIGURATION DIAGNOSTICS ---');
  console.log(`GEMINI_API_KEY:   ${process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING'}`);
  console.log(`DATA_GOV_API_KEY: ${process.env.DATA_GOV_API_KEY ? 'PRESENT' : 'MISSING'}`);
  console.log(`WEATHER_API_KEY:  ${process.env.WEATHER_API_KEY ? 'PRESENT' : 'MISSING'}`);
  console.log('================================================================\n');

  const auditReport = [];

  function record(category, endpoint, status, pass, details) {
    const symbol = pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} [${category}] ${endpoint} (HTTP ${status}): ${details}`);
    auditReport.push({ category, endpoint, status, pass, details });
  }

  // ----------------------------------------------------------------
  // 1. EXTERNAL APIS DIRECT TEST
  // ----------------------------------------------------------------
  console.log('--- 1. DIRECT EXTERNAL API INTEGRATION TESTS ---');
  
  // 1a. WeatherAPI.com Direct Test
  const weatherKey = process.env.WEATHER_API_KEY;
  const t0_weather = Date.now();
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weatherKey}&q=Thanjavur&days=1`, { signal: AbortSignal.timeout(15000) });
    const elapsed = Date.now() - t0_weather;
    if (res.ok) {
      const data = await res.json();
      record('EXTERNAL', 'WeatherAPI.com', res.status, true, `Connected in ${elapsed}ms! Location: ${data.location?.name || 'Thanjavur'}, Temp: ${data.current?.temp_c}°C`);
    } else {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || `HTTP ${res.status}`;
      record('EXTERNAL', 'WeatherAPI.com', res.status, false, `Response in ${elapsed}ms: ${msg}`);
    }
  } catch (err) {
    const elapsed = Date.now() - t0_weather;
    record('EXTERNAL', 'WeatherAPI.com', 0, false, `Failed in ${elapsed}ms: ${err.message}`);
  }

  // 1b. Open-Meteo Weather Direct Fallback Test
  const t0_openmeteo = Date.now();
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=10.787&longitude=79.137&current_weather=true', { signal: AbortSignal.timeout(15000) });
    const elapsed = Date.now() - t0_openmeteo;
    if (res.ok) {
      const data = await res.json();
      const temp = data.current_weather?.temperature;
      const wind = data.current_weather?.windspeed;
      record('EXTERNAL', 'Open-Meteo Weather API', res.status, true, `Connected in ${elapsed}ms! Temp: ${temp}°C, Wind: ${wind} km/h`);
    } else {
      record('EXTERNAL', 'Open-Meteo Weather API', res.status, false, `Response in ${elapsed}ms: HTTP ${res.status}`);
    }
  } catch (err) {
    const elapsed = Date.now() - t0_openmeteo;
    record('EXTERNAL', 'Open-Meteo Weather API', 0, false, `Failed in ${elapsed}ms: ${err.message}`);
  }

  // 1c. Gemini AI API Direct Test
  console.log('\nTesting Gemini AI API...');
  const geminiResult = await testGeminiDirect();
  if (geminiResult.ok) {
    record('EXTERNAL', 'Gemini AI API', geminiResult.status, true, `Connected in ${geminiResult.responseTimeMs}ms! Model: ${geminiResult.model}, Output: "${geminiResult.output}"`);
  } else {
    record('EXTERNAL', 'Gemini AI API', geminiResult.status, false, `Failed in ${geminiResult.responseTimeMs}ms (Model: ${geminiResult.model || 'N/A'}): ${geminiResult.error}`);
  }

  // 1d. Data.gov.in Agricultural Market Price API Direct Test
  console.log('\nTesting Data.gov.in Agricultural Market Price API...');
  const dataGovResult = await testDataGovDirect();
  if (dataGovResult.ok) {
    record('EXTERNAL', 'Data.gov.in Agricultural Market Price API', dataGovResult.status, true, `Connected in ${dataGovResult.responseTimeMs}ms! Total Records: ${dataGovResult.totalRecords}`);
  } else {
    record('EXTERNAL', 'Data.gov.in Agricultural Market Price API', dataGovResult.status, false, dataGovResult.error);
  }

  console.log('\n--- 2. INTERNAL EXPRESS REST BACKEND ENDPOINTS ---');

  // 2a. System Root
  try {
    const res = await fetch(`${BASE}/`);
    const data = await res.json();
    record('REST', 'GET /', res.status, res.ok && data.success, `Server status: ${data.status}`);
  } catch (err) {
    record('REST', 'GET /', 0, false, err.message);
  }

  // 2b. API Status
  try {
    const res = await fetch(`${BASE}/api`);
    const data = await res.json();
    record('REST', 'GET /api', res.status, res.ok && data.success, `API status: ${data.message}`);
  } catch (err) {
    record('REST', 'GET /api', 0, false, err.message);
  }

  // 2c. Auth Flow (Register, Login, Me, Logout)
  let farmerToken = '';
  let farmerUser = null;
  const testPhone = `+9196${Date.now().toString().slice(-8)}`;

  try {
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Suite Test Farmer', phone: testPhone, password: 'testPassword123', role: 'farmer', location: 'Thanjavur' })
    });
    const regData = await regRes.json();
    if (regRes.status === 201) {
      farmerToken = regData.token;
      farmerUser = regData.user;
      record('REST', 'POST /api/auth/register', regRes.status, true, `User ID: ${farmerUser.id}`);
    } else {
      record('REST', 'POST /api/auth/register', regRes.status, false, regData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/auth/register', 0, false, err.message);
  }

  try {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, password: 'testPassword123' })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      farmerToken = loginData.token;
      record('REST', 'POST /api/auth/login', loginRes.status, true, 'Logged in successfully');
    } else {
      record('REST', 'POST /api/auth/login', loginRes.status, false, loginData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/auth/login', 0, false, err.message);
  }

  try {
    const meRes = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const meData = await meRes.json();
    if (meRes.ok && meData.user?.id === farmerUser?.id) {
      record('REST', 'GET /api/auth/me', meRes.status, true, `Authenticated as ${meData.user.name}`);
    } else {
      record('REST', 'GET /api/auth/me', meRes.status, false, meData.error || 'User mismatch');
    }
  } catch (err) {
    record('REST', 'GET /api/auth/me', 0, false, err.message);
  }

  // 2d. Farms API
  let farmId = '';
  try {
    const farmPostRes = await fetch(`${BASE}/api/farms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ farmName: 'Green Valley Organic Farm', area: '10 Acres', soilInformation: 'Delta Clay' })
    });
    const farmPostData = await farmPostRes.json();
    if (farmPostRes.status === 201) {
      farmId = farmPostData.farm.id;
      record('REST', 'POST /api/farms', farmPostRes.status, true, `Farm ID: ${farmId}`);
    } else {
      record('REST', 'POST /api/farms', farmPostRes.status, false, farmPostData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/farms', 0, false, err.message);
  }

  try {
    const farmGetRes = await fetch(`${BASE}/api/farms`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const farmGetData = await farmGetRes.json();
    if (farmGetRes.ok && Array.isArray(farmGetData.farms)) {
      record('REST', 'GET /api/farms', farmGetRes.status, true, `Retrieved ${farmGetData.farms.length} farm(s)`);
    } else {
      record('REST', 'GET /api/farms', farmGetRes.status, false, farmGetData.error || 'Invalid response format');
    }
  } catch (err) {
    record('REST', 'GET /api/farms', 0, false, err.message);
  }

  // 2e. Crops API
  let cropId = '';
  try {
    const cropPostRes = await fetch(`${BASE}/api/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ farmId, cropName: 'Paddy', variety: 'ADT-45', growthStage: 'Flowering' })
    });
    const cropPostData = await cropPostRes.json();
    if (cropPostRes.status === 201) {
      cropId = cropPostData.crop.id;
      record('REST', 'POST /api/crops', cropPostRes.status, true, `Crop ID: ${cropId}`);
    } else {
      record('REST', 'POST /api/crops', cropPostRes.status, false, cropPostData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/crops', 0, false, err.message);
  }

  try {
    const cropGetRes = await fetch(`${BASE}/api/crops`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const cropGetData = await cropGetRes.json();
    if (cropGetRes.ok && Array.isArray(cropGetData.crops)) {
      record('REST', 'GET /api/crops', cropGetRes.status, true, `Retrieved ${cropGetData.crops.length} crop(s)`);
    } else {
      record('REST', 'GET /api/crops', cropGetRes.status, false, cropGetData.error || 'Invalid response format');
    }
  } catch (err) {
    record('REST', 'GET /api/crops', 0, false, err.message);
  }

  // 2f. Produce Lots API
  let lotId = '';
  try {
    const lotPostRes = await fetch(`${BASE}/api/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ crop: 'Paddy', variety: 'ADT-45', quantity: 3000, expectedPrice: 30.0, location: 'Thanjavur, TN' })
    });
    const lotPostData = await lotPostRes.json();
    if (lotPostRes.status === 201) {
      lotId = lotPostData.lot.id;
      record('REST', 'POST /api/lots', lotPostRes.status, true, `Lot ID: ${lotId}`);
    } else {
      record('REST', 'POST /api/lots', lotPostRes.status, false, lotPostData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/lots', 0, false, err.message);
  }

  try {
    const lotGetRes = await fetch(`${BASE}/api/lots`);
    const lotGetData = await lotGetRes.json();
    if (lotGetRes.ok && Array.isArray(lotGetData.lots)) {
      record('REST', 'GET /api/lots', lotGetRes.status, true, `Retrieved ${lotGetData.lots.length} lot(s)`);
    } else {
      record('REST', 'GET /api/lots', lotGetRes.status, false, lotGetData.error || 'Invalid response format');
    }
  } catch (err) {
    record('REST', 'GET /api/lots', 0, false, err.message);
  }

  // 2g. Buyer Demands & AI Match API
  let buyerToken = '';
  let buyerUser = null;
  const buyerPhone = `+9195${Date.now().toString().slice(-8)}`;

  try {
    const bRegRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Delta Processing Mill', phone: buyerPhone, password: 'buyerPassword123', role: 'buyer', location: 'Kumbakonam' })
    });
    const bRegData = await bRegRes.json();
    buyerToken = bRegData.token;
    buyerUser = bRegData.user;
  } catch (e) {}

  try {
    const demPostRes = await fetch(`${BASE}/api/demands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ crop: 'Paddy', requiredQuantity: 6000, offeredPrice: 31.0, location: 'Kumbakonam' })
    });
    const demPostData = await demPostRes.json();
    if (demPostRes.status === 201) {
      record('REST', 'POST /api/demands', demPostRes.status, true, `Demand ID: ${demPostData.demand.id}`);
    } else {
      record('REST', 'POST /api/demands', demPostRes.status, false, demPostData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/demands', 0, false, err.message);
  }

  try {
    const matchRes = await fetch(`${BASE}/api/match?lotId=${lotId}`);
    const matchData = await matchRes.json();
    if (matchRes.ok && Array.isArray(matchData.matches)) {
      record('REST', 'GET /api/match', matchRes.status, true, `Matched ${matchData.matches.length} buyers. Top Match: ${matchData.matches[0]?.buyerName}`);
    } else {
      record('REST', 'GET /api/match', matchRes.status, false, matchData.error || 'Matching failed');
    }
  } catch (err) {
    record('REST', 'GET /api/match', 0, false, err.message);
  }

  // 2h. Offers & Order Lifecycle
  let offerId = '';
  let orderId = '';
  try {
    const offerRes = await fetch(`${BASE}/api/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ produceLotId: lotId, farmerId: farmerUser.id, quantity: 1500, offeredPrice: 29.5 })
    });
    const offerData = await offerRes.json();
    if (offerRes.status === 201) {
      offerId = offerData.offer.id;
      record('REST', 'POST /api/offers', offerRes.status, true, `Offer ID: ${offerId}`);
    } else {
      record('REST', 'POST /api/offers', offerRes.status, false, offerData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/offers', 0, false, err.message);
  }

  try {
    const acceptRes = await fetch(`${BASE}/api/offers/${offerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });
    const acceptData = await acceptRes.json();
    if (acceptRes.ok && acceptData.order) {
      orderId = acceptData.order.id;
      record('REST', 'PUT /api/offers/:id (Accept)', acceptRes.status, true, `Offer Accepted! Auto Order ID: ${orderId}`);
    } else {
      record('REST', 'PUT /api/offers/:id (Accept)', acceptRes.status, false, acceptData.error || 'Failed to accept');
    }
  } catch (err) {
    record('REST', 'PUT /api/offers/:id (Accept)', 0, false, err.message);
  }

  try {
    const ordersRes = await fetch(`${BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const ordersData = await ordersRes.json();
    if (ordersRes.ok && Array.isArray(ordersData.orders)) {
      record('REST', 'GET /api/orders', ordersRes.status, true, `Retrieved ${ordersData.orders.length} order(s)`);
    } else {
      record('REST', 'GET /api/orders', ordersRes.status, false, ordersData.error);
    }
  } catch (err) {
    record('REST', 'GET /api/orders', 0, false, err.message);
  }

  // 2i. Logistics API
  try {
    const logRes = await fetch(`${BASE}/api/logistics?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const logData = await logRes.json();
    if (logRes.ok && logData.logistics) {
      record('REST', 'GET /api/logistics', logRes.status, true, `Tracking Status: ${logData.logistics.tracking_status}`);
    } else {
      record('REST', 'GET /api/logistics', logRes.status, false, logData.error);
    }
  } catch (err) {
    record('REST', 'GET /api/logistics', 0, false, err.message);
  }

  // 2j. Payment API
  try {
    const payRes = await fetch(`${BASE}/api/payments?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const payData = await payRes.json();
    if (payRes.ok && payData.payment) {
      record('REST', 'GET /api/payments', payRes.status, true, `Payment Status: ${payData.payment.status}, Amount: ₹${payData.payment.amount}`);
    } else {
      record('REST', 'GET /api/payments', payRes.status, false, payData.error);
    }
  } catch (err) {
    record('REST', 'GET /api/payments', 0, false, err.message);
  }

  // 2k. Procurement API
  try {
    const cRes = await fetch(`${BASE}/api/procurement/centres`);
    const cData = await cRes.json();
    if (cRes.ok && Array.isArray(cData.centres)) {
      record('REST', 'GET /api/procurement/centres', cRes.status, true, `Found ${cData.centres.length} procurement centres`);
    } else {
      record('REST', 'GET /api/procurement/centres', cRes.status, false, cData.error);
    }
  } catch (err) {
    record('REST', 'GET /api/procurement/centres', 0, false, err.message);
  }

  try {
    const tokRes = await fetch(`${BASE}/api/procurement/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ centreId: 'pc-1', crop: 'Paddy Samba', quantity: 2000 })
    });
    const tokData = await tokRes.json();
    if (tokRes.status === 201) {
      record('REST', 'POST /api/procurement/tokens', tokRes.status, true, `Token #${tokData.token.token_number} Booked (Queue #${tokData.token.queue_position})`);
    } else {
      record('REST', 'POST /api/procurement/tokens', tokRes.status, false, tokData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/procurement/tokens', 0, false, err.message);
  }

  // 2l. Market Prices API
  try {
    const mRes = await fetch(`${BASE}/api/market-prices`);
    const mData = await mRes.json();
    if (mRes.ok && Array.isArray(mData.prices)) {
      record('REST', 'GET /api/market-prices', mRes.status, true, `${mData.prices.length} commodities listed. Data Source: ${mData.label}`);
    } else {
      record('REST', 'GET /api/market-prices', mRes.status, false, mData.error);
    }
  } catch (err) {
    record('REST', 'GET /api/market-prices', 0, false, err.message);
  }

  // 2m. Weather API (Server Route)
  try {
    const wRes = await fetch(`${BASE}/api/weather?q=coimbatore`);
    const wData = await wRes.json();
    if (wRes.ok && wData.success) {
      record('REST', 'GET /api/weather', wRes.status, true, `Place: ${wData.place}, Temp: ${wData.temperature}, Data Source: ${wData.label}`);
    } else {
      record('REST', 'GET /api/weather', wRes.status, false, wData.error);
    }
  } catch (err) {
    record('REST', 'GET /api/weather', 0, false, err.message);
  }

  // 2n. Plant Scan AI API
  try {
    const scanRes = await fetch(`${BASE}/api/plant-scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ crop: 'Paddy' })
    });
    const scanData = await scanRes.json();
    if (scanRes.ok && scanData.success) {
      record('REST', 'POST /api/plant-scans', scanRes.status, true, `Diagnosis: "${scanData.disease}", Confidence: ${scanData.confidence}%, Source: ${scanData.label}`);
    } else {
      record('REST', 'POST /api/plant-scans', scanRes.status, false, scanData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/plant-scans', 0, false, err.message);
  }

  // 2o. AgriBot AI API
  try {
    const botRes = await fetch(`${BASE}/api/agribot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Paddy rate in Thanjavur', language: 'ta' })
    });
    const botData = await botRes.json();
    if (botRes.ok && botData.success) {
      record('REST', 'POST /api/agribot', botRes.status, true, `Intent: ${botData.intent}, Reply: "${botData.reply.slice(0, 50)}..."`);
    } else {
      record('REST', 'POST /api/agribot', botRes.status, false, botData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/agribot', 0, false, err.message);
  }

  // 2p. Grievances API
  try {
    const gRes = await fetch(`${BASE}/api/grievances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ orderId, title: 'Delay Inquiry', description: 'Logistics vehicle arrived 30 mins late' })
    });
    const gData = await gRes.json();
    if (gRes.status === 201) {
      record('REST', 'POST /api/grievances', gRes.status, true, `Grievance ID: ${gData.grievance.id}`);
    } else {
      record('REST', 'POST /api/grievances', gRes.status, false, gData.error);
    }
  } catch (err) {
    record('REST', 'POST /api/grievances', 0, false, err.message);
  }

  // 2q. Security 401 Unauthorized Check
  try {
    const secRes = await fetch(`${BASE}/api/farms`);
    if (secRes.status === 401) {
      record('SECURITY', 'Auth Middleware (Missing Token)', 401, true, 'Correctly blocked unauthorized request with HTTP 401');
    } else {
      record('SECURITY', 'Auth Middleware (Missing Token)', secRes.status, false, 'Security flaw: Request was not blocked');
    }
  } catch (err) {
    record('SECURITY', 'Auth Middleware', 0, false, err.message);
  }

  // SUMMARY & SCORE CARD
  const total = auditReport.length;
  const passed = auditReport.filter(r => r.pass).length;
  const failed = auditReport.filter(r => !r.pass).length;

  console.log('\n================================================================');
  console.log(`  FINAL API VERIFICATION RESULT: ${passed}/${total} PASSED`);
  console.log(`  OVERALL EVALUATION: ${failed === 0 ? '🟢 ALL PASS' : '🔴 FAIL'}`);
  console.log('================================================================\n');
}

runMasterSuite();
