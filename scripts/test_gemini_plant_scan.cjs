const http = require('http');

// Small 1x1 base64 GIF image for testing
const testBase64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function testPlantScan() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      crop: "Paddy",
      image: testBase64Image
    });

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/plant-scans',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.write(postData);
    req.end();
  });
}

async function runGeminiTest() {
  console.log("==================================================");
  console.log("AGRIBAZZER GEMINI PLANT SCAN API TEST SUITE");
  console.log("==================================================\n");

  const res = await testPlantScan();
  console.log("Status Code:", res.status);
  console.log("Response Body:\n", JSON.stringify(res.body || res.raw, null, 2));

  console.log("\n==================================================");
}

runGeminiTest();
