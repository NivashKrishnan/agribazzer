const fs = require('fs');
const path = require('path');

// Safe .env loader
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

const dataGovKey = process.env.DATA_GOV_API_KEY;

console.log('====================================================');
console.log('  DATA.GOV.IN AGRICULTURAL MARKET PRICE API TEST   ');
console.log('====================================================');
console.log(`DATA_GOV_API_KEY: ${dataGovKey ? 'PRESENT' : 'MISSING'}\n`);

async function testDataGovDirect() {
  if (!dataGovKey) {
    console.error('❌ FAIL: DATA_GOV_API_KEY is missing from environment.');
    return { ok: false, status: 0, error: 'DATA_GOV_API_KEY missing' };
  }

  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(dataGovKey)}&format=json&limit=1`;
  const t0 = Date.now();

  try {
    console.log(`Connecting to Data.gov.in Agricultural Market Price API (Resource: ${resourceId})...`);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000)
    });
    const elapsed = Date.now() - t0;

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log(`✅ PASS: Connected to Data.gov.in Agricultural Market Price API in ${elapsed}ms!`);
      console.log(`   HTTP Status: ${response.status}`);
      console.log(`   Total Commodity Records Available: ${data.total || 0}`);
      return {
        ok: true,
        status: response.status,
        responseTimeMs: elapsed,
        totalRecords: data.total || 0
      };
    } else {
      const errText = await response.text().catch(() => '');
      let diag = `Response in ${elapsed}ms: HTTP ${response.status}`;
      if (response.status === 403 || errText.includes('Key not authorised')) {
        diag = `Data.gov.in reached successfully in ${elapsed}ms, but the supplied API key is not authorized for this resource. (HTTP 403)`;
      } else {
        diag += ` - ${errText.slice(0, 100)}`;
      }
      console.error(`❌ FAIL: ${diag}`);
      return {
        ok: false,
        status: response.status,
        responseTimeMs: elapsed,
        error: diag
      };
    }
  } catch (err) {
    const elapsed = Date.now() - t0;
    console.error(`❌ Request Error (${elapsed}ms): ${err.message}`);
    return {
      ok: false,
      status: 0,
      responseTimeMs: elapsed,
      error: err.message
    };
  }
}

if (require.main === module) {
  testDataGovDirect();
}

module.exports = { testDataGovDirect };
