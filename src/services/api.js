/* ============================================================
   AGRIBAZZER — Full-Stack API Integration Service
   Provides seamless HTTP API communication with backend server.
   ============================================================ */

function getAuthHeader() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('agribazzer_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

  const candidates = [
    `/api${endpoint}`,
    `${protocol}//${hostname}:5000/api${endpoint}`,
    `http://localhost:5000/api${endpoint}`
  ];

  // Remove duplicates
  const uniqueUrls = Array.from(new Set(candidates));
  let lastErr = null;

  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return data;
    } catch (err) {
      lastErr = err;
      // If server returned HTTP 4xx or 5xx with specific error message, don't try other hosts
      if (err.message.startsWith('HTTP 4') || err.message.startsWith('HTTP 5') || err.message.includes('Unauthorized') || err.message.includes('already exists')) {
        throw err;
      }
    }
  }

  console.warn(`[API Connection Warning] ${endpoint}:`, lastErr ? lastErr.message : 'Fetch failed');
  throw lastErr || new Error(`API Request to ${endpoint} failed`);
}

export const api = {
  // Auth APIs
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Farms & Crops
  getFarms: () => request('/farms'),
  addFarm: (farmData) => request('/farms', { method: 'POST', body: JSON.stringify(farmData) }),
  getCrops: () => request('/crops'),
  addCrop: (cropData) => request('/crops', { method: 'POST', body: JSON.stringify(cropData) }),

  // Produce Lots
  getLots: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lots${query ? `?${query}` : ''}`);
  },
  createLot: (lotData) => request('/lots', { method: 'POST', body: JSON.stringify(lotData) }),
  updateLot: (id, updates) => request(`/lots/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Buyer Demands
  getDemands: () => request('/demands'),
  createDemand: (demandData) => request('/demands', { method: 'POST', body: JSON.stringify(demandData) }),

  // AI Buyer Matching
  getBuyerMatches: (lotId) => request(`/match${lotId ? `?lotId=${lotId}` : ''}`),

  // Offers & Negotiations
  getOffers: () => request('/offers'),
  createOffer: (offerData) => request('/offers', { method: 'POST', body: JSON.stringify(offerData) }),
  updateOffer: (id, payload) => request(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Orders
  getOrders: () => request('/orders'),

  // Logistics & Payments
  getLogistics: (orderId) => request(`/logistics${orderId ? `?orderId=${orderId}` : ''}`),
  getPayment: (orderId) => request(`/payment${orderId ? `?orderId=${orderId}` : ''}`),

  // Procurement
  getProcurementCentres: () => request('/procurement/centres'),
  getProcurementTokens: () => request('/procurement/tokens'),
  bookProcurementToken: (tokenData) => request('/procurement/tokens', { method: 'POST', body: JSON.stringify(tokenData) }),

  // Notifications & Grievances
  getNotifications: () => request('/notifications'),
  submitGrievance: (grievanceData) => request('/grievances', { method: 'POST', body: JSON.stringify(grievanceData) }),

  // Market Prices, Weather, Plant Scan
  getMarketPrices: () => request('/market-prices'),
  getWeather: (params) => request('/weather' + (params ? (typeof params === 'string' ? '?' + params : '?' + new URLSearchParams(params).toString()) : '')),
  analyzePlantScan: (scanData) => request('/plant-scans', { method: 'POST', body: JSON.stringify(scanData) }),
};

export default api;
