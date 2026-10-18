/* ============================================================
   AGRIBAZZER MOBILE — Demo data layer (prototype seed data)
   Mirrors the shapes returned by the AGRIBAZZER platform APIs.
   ============================================================ */

export const USER = {
  name: 'Ramesh Kumar',
  role: 'farmer',
  phone: '+91 98765 43210',
  location: 'Thanjavur, Tamil Nadu',
  memberSince: '2024',
  verified: true,
};

export const FARM = {
  name: 'Farm 1 — Thanjavur',
  location: 'Thanjavur, Tamil Nadu',
  area: '3.5 Acres',
  soil: 'Clay Loam Soil',
  season: 'Samba Season (Jun–Dec)',
  crops: ['Paddy', 'Tomato', 'Maize', 'Onion'],
};

export const CROPS = [
  {
    id: 'paddy', name: 'Paddy', variety: 'Samba', img: 'img/paddy.jpg', emoji: '🌾',
    stage: 'Vegetative', health: 'Healthy', lastScan: '02 Sep 2026',
    harvest: '15 Oct 2026', yieldEst: '2.5 t/acre', area: '1.8 acres',
  },
  {
    id: 'tomato', name: 'Tomato', variety: 'PKM-1', img: 'img/tomato.jpg', emoji: '🍅',
    stage: 'Flowering', health: 'Attention', lastScan: '05 Sep 2026',
    harvest: '20 Sep 2026', yieldEst: '1.8 t/acre', area: '0.9 acres',
  },
  {
    id: 'maize', name: 'Maize', variety: 'CO-6', img: 'img/maize.jpg', emoji: '🌽',
    stage: 'Grain Filling', health: 'Healthy', lastScan: '30 Aug 2026',
    harvest: '05 Oct 2026', yieldEst: '2.2 t/acre', area: '0.5 acres',
  },
  {
    id: 'onion', name: 'Onion', variety: 'CO-3', img: 'img/onion.jpg', emoji: '🧅',
    stage: 'Bulb Development', health: 'Healthy', lastScan: '28 Aug 2026',
    harvest: '30 Sep 2026', yieldEst: '3.1 t/acre', area: '0.3 acres',
  },
];

export const HEALTH_SUMMARY = { healthy: 3, attention: 1, critical: 0 };

export const DIAGNOSIS = {
  crop: 'Tomato', disease: 'Early Blight', scientific: 'Alternaria solani',
  confidence: 93, severity: 'Moderate', affected: '18%', farmRisk: 'Medium',
  img: 'img/scan.jpg', date: '05 Sep 2026',
  actions: [
    'Remove heavily infected leaves and destroy them away from the field',
    'Avoid over-irrigation and keep foliage dry (drip in the morning)',
    'Improve plant spacing for better airflow',
    'Monitor nearby plants every 2 days for new spots',
  ],
  chemical: {
    product: 'Mancozeb 75% WP (protectant fungicide category)',
    use: 'Only if spread continues: foliar spray at label rate (approx. 2 g/L), 10–14 day interval, max 3 sprays.',
    safety: 'Wear gloves, mask & cover clothing. Do not enter field for 24h. Observe pre-harvest interval of 7 days.',
    expert: 'Confirm dosage with your local agricultural officer / FPO expert before spraying.',
  },
  followUp: 'If symptoms worsen in 3–5 days, contact a local agricultural officer or FPO expert.',
};

export const HEALTH_HISTORY = [
  { id: 1, date: '05 Sep 2026', crop: 'Tomato', issue: 'Early Blight', severity: 'Moderate', emoji: '🍅' },
  { id: 2, date: '02 Sep 2026', crop: 'Paddy', issue: 'Rice Blast', severity: 'Severe', emoji: '🌾' },
  { id: 3, date: '28 Aug 2026', crop: 'Maize', issue: 'Fall Armyworm', severity: 'High', emoji: '🌽' },
  { id: 4, date: '21 Aug 2026', crop: 'Onion', issue: 'No issues detected', severity: 'Healthy', emoji: '🧅' },
  { id: 5, date: '14 Aug 2026', crop: 'Tomato', issue: 'Leaf Miner', severity: 'Low', emoji: '🍅' },
];

export const WEATHER = {
  place: 'Thanjavur, Tamil Nadu', crop: 'Paddy',
  temp: 32, condition: 'Partly Cloudy', icon: '⛅',
  humidity: '68%', rainfall: '62% chance · 8–12 mm', wind: '14 km/h SW',
  forecast: [
    { d: 'Mon', icon: '⛅', hi: 32, lo: 26, rain: '20%' },
    { d: 'Tue', icon: '🌧', hi: 30, lo: 25, rain: '75%' },
    { d: 'Wed', icon: '🌧', hi: 29, lo: 25, rain: '80%' },
    { d: 'Thu', icon: '☁️', hi: 31, lo: 26, rain: '40%' },
    { d: 'Fri', icon: '☀️', hi: 33, lo: 27, rain: '10%' },
    { d: 'Sat', icon: '☀️', hi: 34, lo: 27, rain: '5%' },
    { d: 'Sun', icon: '⛅', hi: 32, lo: 26, rain: '25%' },
  ],
  alerts: [
    { icon: '🌧', tone: 'blue', title: 'Heavy Rain Expected', body: 'Tue–Wed. Consider delaying irrigation and sprays.' },
    { icon: '🔥', tone: 'orange', title: 'High Temperature', body: 'Fri–Sat peak 34°C. Monitor crop moisture in the afternoon.' },
  ],
  risk: 'MEDIUM',
};

export const MARKET = [
  { id: 'paddy', name: 'Paddy', emoji: '🌾', price: 28, prev: 26.9, trend: 4.2, market: 'Thanjavur Market', dist: '4 km', date: '07 Sep, 9:15 AM', spark: [3, 4, 4, 5, 6, 6, 7] },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', price: 22, prev: 22.5, trend: -2.1, market: 'Thanjavur Market', dist: '4 km', date: '07 Sep, 9:15 AM', spark: [7, 6, 6, 5, 5, 4, 4] },
  { id: 'maize', name: 'Maize', emoji: '🌽', price: 21, prev: 20.3, trend: 3.5, market: 'Thiruvarur Market', dist: '12 km', date: '07 Sep, 8:40 AM', spark: [4, 4, 5, 5, 6, 6, 6] },
  { id: 'onion', name: 'Onion', emoji: '🧅', price: 20, prev: 20, trend: 0, market: 'Thanjavur Market', dist: '4 km', date: '07 Sep, 9:15 AM', spark: [5, 5, 5, 4, 5, 5, 5] },
  { id: 'groundnut', name: 'Groundnut', emoji: '🥜', price: 62, prev: 60.5, trend: 2.4, market: 'Kumbakonam Market', dist: '22 km', date: '07 Sep, 8:10 AM', spark: [4, 5, 5, 5, 6, 6, 7] },
];

export const COMPARE_MARKETS = [
  { name: 'Thanjavur Market', dist: '4 km', paddy: 28, tomato: 22, best: false },
  { name: 'Kumbakonam Market', dist: '22 km', paddy: 29, tomato: 21, best: true },
  { name: 'Thiruvarur Market', dist: '12 km', paddy: 27.5, tomato: 22.5, best: false },
  { name: 'Pattukkottai Market', dist: '38 km', paddy: 28.5, tomato: 20.5, best: false },
];

export const LISTINGS = [
  { id: 'L-1042', crop: 'Paddy', variety: 'Samba', qty: '1,000 kg', price: 28, status: 'Active', matches: 4, img: 'img/paddy.jpg', posted: '06 Sep 2026' },
  { id: 'L-1039', crop: 'Tomato', variety: 'PKM-1', qty: '500 kg', price: 22, status: 'Active', matches: 2, img: 'img/tomato.jpg', posted: '04 Sep 2026' },
  { id: 'L-1031', crop: 'Maize', variety: 'CO-6', qty: '800 kg', price: 21, status: 'Active', matches: 1, img: 'img/maize.jpg', posted: '01 Sep 2026' },
  { id: 'L-1018', crop: 'Onion', variety: 'CO-3', qty: '300 kg', price: 20, status: 'Sold', matches: 3, img: 'img/onion.jpg', posted: '22 Aug 2026' },
];

export const BUYERS = [
  { id: 'B1', name: 'Sri Balaji Rice Mill', type: 'Rice Processor', emoji: '🏭', dist: '12 km', need: 'Needs 5 tonnes', verified: true, match: 94, price: '₹28/kg offered' },
  { id: 'B2', name: 'Kaveri Wholesale Traders', type: 'Wholesale Buyer', emoji: '🧺', dist: '24 km', need: 'Needs 2 tonnes', verified: true, match: 88, price: '₹27/kg offered' },
  { id: 'B3', name: 'TN Food Processing Unit', type: 'Institutional Buyer', emoji: '🏢', dist: '31 km', need: 'Needs 1.5 tonnes', verified: false, match: 79, price: '₹26.5/kg offered' },
  { id: 'B4', name: 'Delta FPO Collective', type: 'FPO', emoji: '🤝', dist: '9 km', need: 'Needs 3 tonnes', verified: true, match: 76, price: '₹27.5/kg offered' },
  { id: 'B5', name: 'Green Valley Retail', type: 'Retail Buyer', emoji: '🛒', dist: '18 km', need: 'Needs 500 kg', verified: true, match: 68, price: '₹26/kg offered' },
];

export const MARKETPLACE = [
  { id: 'P1', title: 'Paddy (Samba)', price: 28, qty: '1,000 kg available', dist: '8 km', verified: true, img: 'img/paddy.jpg', farmer: 'Ramesh Kumar', quality: 'A Grade', harvest: '05 Sep 2026' },
  { id: 'P2', title: 'Tomato (PKM-1)', price: 22, qty: '500 kg available', dist: '12 km', verified: true, img: 'img/tomato.jpg', farmer: 'Selvi Murugan', quality: 'A Grade', harvest: '06 Sep 2026' },
  { id: 'P3', title: 'Maize (CO-6)', price: 21, qty: '800 kg available', dist: '15 km', verified: true, img: 'img/maize.jpg', farmer: 'Karthik Raja', quality: 'B Grade', harvest: '03 Sep 2026' },
  { id: 'P4', title: 'Onion (CO-3)', price: 20, qty: '300 kg available', dist: '21 km', verified: false, img: 'img/onion.jpg', farmer: 'Anita Selvam', quality: 'A Grade', harvest: '01 Sep 2026' },
  { id: 'P5', title: 'Rice Straw (Waste)', price: 4, qty: '500 kg available', dist: '5 km', verified: true, img: 'img/straw.jpg', farmer: 'Ramesh Kumar', quality: 'Dry baled', harvest: '28 Aug 2026' },
];

export const NEGOTIATION = {
  product: 'Paddy (Samba)', farmerPrice: 28, buyerOffer: 26, aiRange: [27, 29],
  thread: [
    { who: 'buyer', text: 'Hi, I need 1 tonne of Samba paddy. Can you do ₹26/kg for full load pickup?', time: '10:12 AM' },
    { who: 'farmer', text: 'Market rate is ₹28 today. I can consider ₹27.5 for immediate pickup.', time: '10:20 AM' },
    { who: 'buyer', text: 'Let us meet at ₹27 with pickup tomorrow morning?', time: '10:26 AM' },
  ],
};

export const WASTE_TYPES = ['Rice Straw', 'Coconut Waste', 'Maize Stalk', 'Sugarcane Bagasse', 'Vegetable Waste', 'Fruit Waste', 'Farm Organic Waste'];

export const WASTE_MATCHES = [
  { emoji: '🐄', type: 'Cattle Farmer', name: 'Lakshmi Cattle Farm', dist: '5 km', match: 92, note: 'Needs dry fodder weekly' },
  { emoji: '♻️', type: 'Compost Unit', name: 'Delta Organic Compost', dist: '8 km', match: 87, note: 'Accepts mixed crop residue' },
  { emoji: '🍄', type: 'Mushroom Cultivation', name: 'GreenSpore Mushrooms', dist: '12 km', match: 74, note: 'Needs paddy straw substrate' },
  { emoji: '🏭', type: 'Biomass Buyer', name: 'Cauvery Bio-Energy', dist: '18 km', match: 69, note: 'Buys baled straw by tonne' },
];

export const TOKEN = {
  id: 'AB-01-0001', centre: 'Thanjavur Agri Procurement Centre',
  crop: 'Paddy (Samba)', qty: '1,000 kg', queue: '#1',
  wait: '38 mins', vehiclesAhead: 1, unloading: '35 mins / 10-tonne truck',
  bays: 2, capacity: '80 tonnes/day', status: 'Active', bestArrival: '10:30 AM',
};

export const QUEUE = {
  wait: '38 minutes', best: '10:30 AM', level: 'LOW',
  factors: ['Current queue: 1 vehicle ahead', 'Active bays: 2 unloading bays', 'Unloading rate: 35 mins / 10-tonne truck', 'Centre capacity: 80 tonnes/day', 'Historical wait & peak hours (11 AM–2 PM)'],
  hours: [
    { h: '8 AM', v: 25 }, { h: '9 AM', v: 40 }, { h: '10 AM', v: 35 }, { h: '11 AM', v: 75 },
    { h: '12 PM', v: 90 }, { h: '1 PM', v: 80 }, { h: '2 PM', v: 60 }, { h: '3 PM', v: 35 }, { h: '4 PM', v: 20 },
  ],
};

export const LOGISTICS = {
  id: 'SH-2201', eta: 'ETA 18 mins', vehicle: 'TN 45 BK 1234 · Tata Ace',
  driver: 'Sridhar V', driverPhone: '+91 90000 11234', rating: '4.8',
  steps: [
    { label: 'Produce Pickup', state: 'done', time: '08:40 AM' },
    { label: 'Vehicle Assigned', state: 'done', time: '08:52 AM' },
    { label: 'Driver Confirmed', state: 'done', time: '09:05 AM' },
    { label: 'Pickup Completed', state: 'done', time: '09:31 AM' },
    { label: 'Procurement Centre', state: 'active', time: 'In progress' },
    { label: 'Delivery', state: 'pending', time: 'Pending' },
    { label: 'Payment', state: 'pending', time: 'Pending' },
  ],
};

export const ORDERS = {
  selling: [
    { id: 'SO-881', crop: 'Paddy (Samba)', qty: '1,000 kg', total: '₹28,000', status: 'Processing', img: 'img/paddy.jpg', buyer: 'Sri Balaji Rice Mill' },
    { id: 'SO-874', crop: 'Onion (CO-3)', qty: '300 kg', total: '₹6,000', status: 'Paid', img: 'img/onion.jpg', buyer: 'Green Valley Retail' },
  ],
  buying: [
    { id: 'BO-311', crop: 'Rice Straw', qty: '200 kg', total: '₹800', status: 'Delivered', img: 'img/straw.jpg', buyer: 'From: Lakshmi Cattle Farm' },
  ],
  procurement: [
    { id: 'TOKEN AB-01-0001', crop: 'Paddy (Samba)', qty: '1,000 kg', total: '₹28,000', status: 'In Queue', img: 'img/paddy.jpg', buyer: 'Thanjavur Agri Procurement Centre' },
  ],
};

export const PAYMENT = {
  product: 'Paddy (Samba)', qty: '1,000 kg', price: '₹28/kg', total: '₹28,000',
  status: 'Processing', method: 'UPI · ramesh@okbank',
  history: [
    { id: 'TX-9921', title: 'Onion (CO-3) — 300 kg', amount: '+₹6,000', date: '24 Aug 2026', status: 'Paid' },
    { id: 'TX-9887', title: 'Maize (CO-6) — 400 kg', amount: '+₹8,400', date: '18 Aug 2026', status: 'Paid' },
    { id: 'TX-9810', title: 'Rice Straw — 250 kg', amount: '+₹1,000', date: '09 Aug 2026', status: 'Paid' },
  ],
};

export const NOTIFICATIONS = [
  { id: 1, icon: '🌧', tone: 'blue', title: 'Weather Alert', body: 'Heavy rain expected Tue–Wed. Consider delaying irrigation.', time: '12 min ago', unread: true },
  { id: 2, icon: '📈', tone: 'green', title: 'Paddy price increased', body: 'Paddy up 4.2% to ₹28/kg at Thanjavur Market.', time: '1 h ago', unread: true },
  { id: 3, icon: '🤝', tone: 'green', title: 'New buyer matched', body: 'Sri Balaji Rice Mill (94% match) wants your Paddy (Samba).', time: '2 h ago', unread: true },
  { id: 4, icon: '💰', tone: 'green', title: 'Buyer accepted your offer', body: 'Kaveri Wholesale accepted ₹27.5/kg for Tomato.', time: '5 h ago', unread: false },
  { id: 5, icon: '🎟', tone: 'amber', title: 'Procurement token generated', body: 'TOKEN #AB-01-0001 · Queue #1 at Thanjavur Centre.', time: 'Yesterday', unread: false },
  { id: 6, icon: '🚚', tone: 'blue', title: 'Vehicle assigned', body: 'TN 45 BK 1234 · Driver Sridhar V will arrive by 9:00 AM.', time: 'Yesterday', unread: false },
  { id: 7, icon: '💳', tone: 'green', title: 'Payment received', body: '₹6,000 credited for Onion (CO-3) 300 kg via UPI.', time: '24 Aug', unread: false },
  { id: 8, icon: '🌱', tone: 'red', title: 'Crop disease detected', body: 'Tomato — Early Blight (Moderate). View AI action plan.', time: '05 Sep', unread: false },
];

export const NEARBY = {
  buyers: 12, markets: 4, centres: 2, wasteBuyers: 6, farmers: 38, logistics: 5,
};

export const AGRIBOT_SUGGESTIONS = [
  'What is today’s paddy price?',
  'What to do for Tomato Early Blight?',
  'Where can I sell my rice straw?',
  'Which buyer is near me?',
  'Can I sell 500 kg maize?',
  'Procurement centre queue status?',
];

export const AGRIBOT_KB = [
  {
    keys: ['paddy price', 'today’s paddy', 'today paddy', 'price'],
    en: 'Today’s paddy (Samba) price at Thanjavur Market is ₹28/kg, up 4.2% from yesterday. Kumbakonam (22 km) pays ₹29/kg. Good day to sell if your moisture is below 14%.',
    ta: 'இன்று தஞ்சாவூர் சந்தையில் நெல் (சம்பா) விலை கிலோ ₹28. நேற்றைய விட 4.2% அதிகம். விற்பதற்கு நல்ல நாள்.',
    hi: 'आज तंजावुर मंडी में धान (सांभा) का भाव ₹28/किग्रा (↑4.2%) है। कुंभकोणम (22 किमी) में ₹29/किग्रा मिल रहा है। बेचने के लिए उत्तम दिन।',
    te: 'ఈరోజు తంజావూరు మార్కెట్‌లో వరి (సాంబ) ధర కిలోకు ₹28 (↑4.2%). కుంభకోణంలో (22 కిమీ) ₹29/కిలో లభిస్తోంది. అమ్మకానికి అనుకూలమైన రోజు.',
    kn: 'ಇಂದು ತಂಜಾವೂರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಭತ್ತದ ಬೆಲೆ ₹28/ಕೆಜಿ (↑4.2%). ಕುಂಭಕೋಣಂನಲ್ಲಿ ₹29/ಕೆಜಿ ಇದೆ. ಮಾರಾಟ ಮಾಡಲು ಉತ್ತಮ ದಿನ.',
    ml: 'இன்று தஞ்சாவூர் சந்தயில் நெல்லு வில கிலோ ₹28. விற்பதற்கு நல்ல தினம்.',
    mr: 'आज तंजावर बाजारात धानाचा भाव ₹28/किग्रॅ (↑4.2%) आहे. विकण्यासाठी उत्तम दिवस.',
    gu: 'આજે તંજાવુર માર્કેટમાં ડાંગરનો ભાવ ₹28/કિલો (↑4.2%) છે. વેચવા માટે ઉત્તમ દિવસ.',
  },
  {
    keys: ['tomato', 'disease', 'blight'],
    en: 'Your last Tomato scan (05 Sep) shows Early Blight — Moderate, 18% area. Remove infected leaves, avoid over-irrigation. If spots spread in 3–5 days, meet your local agricultural officer.',
    ta: 'உங்கள் தக்காளி ஸ்கேனில் Early Blight (மிதமான) தெரியவந்துள்ளது. பாதிக்கப்பட்ட இலைகளை அகற்றுங்கள்; அதிக நீர் தவிர்க்கவும்.',
    hi: 'आपकी टमाटर की फसल में अगेती झुलसा (Early Blight) रोग पाया गया है। संक्रमित पत्तियों को हटाएं और अत्यधिक सिंचाई से बचें।',
    te: 'మీ టమాటా పంటలో అర్లీ బ్లైట్ (తెగులు) కనుగొనబడింది. సోకిన ఆకులను తొలగించి, నీరు ఎక్కువగా పెట్టకండి.',
    kn: 'ನಿಮ್ಮ ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಅರ್ಲಿ ಬ್ಲೈಟ್ ರೋಗ ಕಂಡುಬಂದಿದೆ. ಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಹೆಚ್ಚಿನ ನೀರನ್ನು ഒഴിവാಕಿ.',
    ml: 'தக்காளியில் அர்லி பிளைட் நோய் கண்டறியப்பட்டுள்ளது. பாதிக்கப்பட்ட இலைகளை அகற்றவும்.',
    mr: 'तुमच्या टोमॅटो पिकावर अर्ली ब्लाईट रोग आढळला आहे. बाधित पाने काढून टाका आणि जास्त पाणी देणे टाळा.',
    gu: 'તમારા ટામેટાના પાકમાં અગેતી સુકારો (Early Blight) જોવા મળ્યો છે. ચેપગ્રસ્ત પાંદડા દૂર કરો અને વધુ પડતું પાણી ન આપો.',
  },
  {
    keys: ['straw', 'waste'],
    en: 'For rice straw near Thanjavur I found 4 buyers: cattle farm 5 km (92% match), compost unit 8 km, mushroom unit 12 km, biomass buyer 18 km. Expected rate ₹3–₹5/kg baled.',
    ta: 'வைக்கோலுக்கு அருகில் 4 வாங்குபவர்கள்: கால்நடை பண்ணை 5 கி.மீ, உர ஆலை 8 கி.மீ, காளான் அலகு 12 கி.மீ. எதிர்பார்க்கும் விலை கிலோ ₹3–₹5.',
    hi: 'पराली/पुआल के लिए आपके पास 4 खरीदार हैं: डेयरी फार्म 5 किमी (92% मैच), कंपोस्ट यूनिट 8 किमी, बायोमास खरीदार 18 किमी। अपेक्षित दर ₹3–₹5/किग्रा।',
    te: 'వరి గడ్డి కొనుగోలుకు 4 కొనుగోలుదారులు అందుబాటులో ఉన్నారు: పశువుల ఫారమ్ 5 కిమీ, కంపోస్ట్ యూనిట్ 8 కిమీ. ఆశించే ధర కిలోకు ₹3–₹5.',
    kn: 'ಭತ್ತದ ಹುಲ್ಲಿಗೆ 4 ಖರೀದಿದಾರರು ಲಭ್ಯವಿದ್ದಾರೆ: ಹೈನುಗಾರಿಕೆ ಫಾರ್ಮ್ 5 ಕಿಮೀ, ಕಂಪೋಸ್ಟ್ ಘಟಕ 8 ಕಿಮೀ. ನಿರೀಕ್ಷಿತ ದರ ₹3–₹5/ಕೆಜಿ.',
    ml: 'வைக்கோலுக்கு அருகில் 4 வாங்குபவர்கள் உள்ளனர்: பண்ணை 5 கி.மீ, உர ஆலை 8 கி.மீ. எதிர்பார்க்கும் விலை கிலோ ₹3–₹5.',
    mr: 'पिकाच्या उर्वरित कचऱ्यासाठी (पेंढा) ४ खरेदीदार उपलब्ध आहेत: डेअरी फार्म ५ किमी, सेंद्रிய खत युनिट ८ किमी. अपेक्षित दर ₹३–₹५/किग्रॅ.',
    gu: 'ઘાસ/પરાળ માટે ૪ ખરીદદારો ઉપલબ્ધ છે: ડેરી ફાર્મ ૫ કિમી, કમ્પોસ્ટ યુનિટ ૮ કિમી. અપેક્ષિત દર ₹૩–₹૫/કિલો.',
  },
  {
    keys: ['buyer', 'near me'],
    en: 'Nearest verified buyers for your paddy: Sri Balaji Rice Mill 12 km (94% match), Delta FPO 9 km (76%), Kaveri Wholesale 24 km (88%). Shall I open buyer matching?',
    ta: 'உங்கள் நெல்லுக்கு அருகிலுள்ள வாங்குபவர்கள்: ஸ்ரீ பாலாஜி ரைஸ் மில் 12 கி.மீ (94%), டெல்டா FPO 9 கி.மீ.',
    hi: 'धान के पास के सत्यापित खरीदार: श्री बालाजी राइस मिल 12 किमी (94% मैच), डेल्टा FPO 9 किमी (76%)। क्या मैं खरीदार मैचिंग खोलूँ?',
    te: 'మీ వరి కొనుగోలుకు సమీప కొనుగోలుదారులు: శ్రీ బాలాజీ రైస్ మిల్ 12 కిమీ (94% మ్యాచ్), డెల్టా FPO 9 కిమీ.',
    kn: 'ಭತ್ತದ ಸಮೀಪದ ಸತ್ಯಾಪಿತ ಖರೀದಿದಾರರು: ಶ್ರೀ ಬಾಲಾಜಿ ರೈಸ್ ಮಿಲ್ 12 ಕಿಮೀ (94%), ಡೆಲ್ಟಾ FPO 9 ಕಿಮೀ.',
    ml: 'உங்கள் நெல்லுக்கு அருகிலுள்ள வாங்குபவர்கள்: ஸ்ரீ பாலாஜி ரைஸ் மில் 12 கி.மீ (94%), டெல்டா FPO 9 கி.மீ.',
    mr: 'तुमच्या धानासाठी जवळचे पडताळलेले खरेदीदार: श्री बालाजी राईस मिल १२ किमी (९४% मॅच), डेल्टा एफपीओ ९ किमी.',
    gu: 'તમારા ડાંગર માટે નજીકના ખરીદદારો: શ્રી બાલાજી રાઇસ મિલ ૧૨ કિમી (૯૪%), ડેલ્ટા FPO ૯ કિમી.',
  },
  {
    keys: ['maize', '500 kg', 'sell'],
    en: 'Yes! Maize is at ₹21/kg (↑3.5%) today. For 500 kg you can post a listing in 2 minutes and I will match buyers — currently 1 buyer needs maize within 15 km.',
    ta: 'ஆம்! மக்காச்சோளம் இன்று கிலோ ₹21. 500 கிலோ விற்பதற்கு லிஸ்டிங் போடுங்கள்; நான் வாங்குபவர்களை இணைக்கிறேன்.',
    hi: 'जी हां! मक्का आज ₹21/किग्रा (↑3.5%) पर है। 500 किग्रा बेचने के लिए 2 मिनट में लिस्टिंग पोस्ट करें, मैं खरीदार से जोड़ दूंगा।',
    te: 'అవును! ఈరోజు జొన్నలు/మొక్కజొన్న కిలోకు ₹21. 500 కిలోల అమ్మకానికి 2 నిమిషాల్లో లిస్టింగ్ చేయండి.',
    kn: 'ಹೌದು! ಮೆಕ್ಕೆಜೋಳ ಇಂದು ₹21/ಕೆಜಿ ಇದೆ. 500 ಕೆಜಿ ಮಾರಾಟ ಮಾಡಲು ಲಿಸ್ಟಿಂಗ್ ಮಾಡಿ.',
    ml: 'ஆம்! மக்காச்சோளம் இன்று கிலோ ₹21. 500 கிலோ விற்பதற்கு லிஸ்டிங் போடுங்கள்.',
    mr: 'होय! मका आज ₹२१/किग्रॅ आहे. ५०० किग्रॅ विक्रीसाठी लिस्टिंग पोस्ट करा.',
    gu: 'હા! મકાઈ આજે ₹૨૧/કિલો છે. ૫૦૦ કિલો વેચવા માટે લિસ્ટિંગ મૂકો.',
  },
  {
    keys: ['queue', 'procurement', 'token'],
    en: 'Thanjavur procurement centre queue is LOW right now — 1 vehicle ahead, AI predicted wait 38 mins. Best arrival window: 10:30 AM. Avoid 11 AM–2 PM peak.',
    ta: 'தஞ்சாவூர் கொள்முதல் மையத்தில் கூட்டம் குறைவு — AI காத்திருப்பு 38 நிமிடம். சிறந்த நேரம் 10:30 AM.',
    hi: 'तंजावुर खरीद केंद्र पर अभी कतार छोटी है — 1 वाहन आगे है, AI अनुमानित प्रतीक्षा समय 38 मिनट है। सबसे अच्छा समय: 10:30 AM।',
    te: 'తంజావూరు కొనుగోలు కేంద్రంలో రద్దీ తక్కువగా ఉంది — AI అంచనా ప్రకారం వేచి ఉండే సమయం 38 నిమిషాలు.',
    kn: 'ತಂಜಾವೂರು ಖರೀದಿ ಕೇಂದ್ರದಲ್ಲಿ ಪ್ರಸ್ತುತ ಸರದಿ ಕನಿಷ್ಠವಾಗಿದೆ — AI ಕಾಯುವ ಸಮಯ 38 ನಿಮಿಷ.',
    ml: 'தஞ்சாவூர் கொள்முதல் மையத்தில் கூட்டம் குறைவு — காத்திருப்பு 38 நிமிடம்.',
    mr: 'तंजावर खरेदी केंद्रावर सध्या गर्दी कमी आहे — १ वाहन पुढे आहे, एआय अंदाजित वेळ ३८ मिनिटे.',
    gu: 'તંજાવુર ખરીદ કેન્દ્ર પર હાલ લાઇન ઓછી છે — ૧ વાહન આગળ છે, AI અંદાજિત સમય ૩૮ મિનિટ.',
  },
];

export const ROLES = [
  { id: 'farmer', emoji: '🌱', title: 'Farmer', body: 'Grow & sell your produce' },
  { id: 'buyer', emoji: '🧺', title: 'Buyer', body: 'Buy directly from farms' },
  { id: 'business', emoji: '🏢', title: 'Business', body: 'Processors & traders' },
  { id: 'centre', emoji: '🏭', title: 'Procurement Centre', body: 'Manage procurement' },
];

export const ONBOARDING = [
  { img: 'img/paddy.jpg', emoji: '🛰', title: 'Monitor Your Crops with AI', body: 'Detect diseases, pests and get personalised treatment advice from a single photo.' },
  { img: 'img/tomato.jpg', emoji: '📈', title: 'Know the Right Market Price', body: 'Get real-time market prices and AI price predictions for every crop you grow.' },
  { img: 'img/handshake.jpg', emoji: '🤝', title: 'Find the Right Buyer', body: 'Connect with verified buyers, processors and FPOs near you — matched by AI.' },
  { img: 'img/basket.jpg', emoji: '💰', title: 'Sell Directly & Get Paid', body: 'List your produce, negotiate securely and get paid through UPI or bank transfer.' },
  { img: 'img/straw.jpg', emoji: '♻️', title: 'Turn Agricultural Waste into Value', body: 'Sell straw, stalks and organic waste to cattle farms, compost and biomass buyers.' },
];
