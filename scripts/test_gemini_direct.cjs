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

const geminiKey = process.env.GEMINI_API_KEY;

console.log('====================================================');
console.log('       GEMINI AI API DIRECT INTEGRATION TEST        ');
console.log('====================================================');
console.log(`GEMINI_API_KEY: ${geminiKey ? 'PRESENT' : 'MISSING'}\n`);

async function testGeminiDirect() {
  if (!geminiKey) {
    console.error('❌ FAIL: GEMINI_API_KEY is missing from environment.');
    return { ok: false, status: 0, error: 'GEMINI_API_KEY missing' };
  }

  const models = ['gemini-3.6-flash', 'gemini-3.5-flash'];
  let lastResult = null;

  for (const model of models) {
    const t0 = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;

    try {
      console.log(`Connecting to Gemini API (Model: ${model})...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Return only the word OK.' }] }]
        }),
        signal: AbortSignal.timeout(15000)
      });

      const elapsed = Date.now() - t0;
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
        console.log(`✅ PASS: Connected to Gemini AI API in ${elapsed}ms!`);
        console.log(`   Model Used: ${model}`);
        console.log(`   HTTP Status: ${response.status}`);
        console.log(`   Response Output: "${text}"`);
        return {
          ok: true,
          status: response.status,
          responseTimeMs: elapsed,
          model,
          output: text
        };
      } else {
        const errMsg = data.error?.message || `HTTP ${response.status}`;
        console.warn(`⚠️ Model ${model} returned HTTP ${response.status} (${elapsed}ms): ${errMsg}`);
        lastResult = {
          ok: false,
          status: response.status,
          responseTimeMs: elapsed,
          model,
          error: errMsg
        };
      }
    } catch (err) {
      const elapsed = Date.now() - t0;
      console.error(`❌ Request Error on model ${model} (${elapsed}ms): ${err.message}`);
      lastResult = {
        ok: false,
        status: 0,
        responseTimeMs: elapsed,
        model,
        error: err.message
      };
    }
  }

  console.error(`❌ FAIL: All Gemini models failed. Last Error: ${lastResult?.error}`);
  return lastResult;
}

if (require.main === module) {
  testGeminiDirect();
}

module.exports = { testGeminiDirect };
