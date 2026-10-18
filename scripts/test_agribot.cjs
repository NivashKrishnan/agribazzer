const http = require('http');

const testCases = [
  { message: "HI", language: "en" },
  { message: "HELLO", language: "en" },
  { message: "What is today's paddy price?", language: "en" },
  { message: "What is tomato price?", language: "en" },
  { message: "Find buyers for paddy", language: "en" },
  { message: "What is today's weather?", language: "en" },
  { message: "Will it rain?", language: "en" },
  { message: "Paddy disease", language: "en" },
  { message: "How can I sell my crop?", language: "en" },
  { message: "Procurement token status", language: "en" },
  { message: "TAMIL", language: "en" },
  { message: "தமிழ்", language: "ta" },
  { message: "வணக்கம்", language: "ta" },
  { message: "நெல் விலை என்ன?", language: "ta" },
  { message: "பச்சை இலை நோய் பற்றி சொல்லுங்கள்", language: "ta" },
  { message: "नमस्ते", language: "hi" },
  { message: "गेहूं का भाव क्या है?", language: "hi" }
];

async function runTests() {
  console.log("==================================================");
  console.log("AGRIBAZZER AGRIBOT API TEST SUITE");
  console.log("==================================================\n");

  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const postData = JSON.stringify({ message: tc.message, language: tc.language });

    const result = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/agribot',
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
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ error: body });
          }
        });
      });
      req.on('error', (err) => resolve({ error: err.message }));
      req.write(postData);
      req.end();
    });

    console.log(`Test #${i + 1}: Input: "${tc.message}" (Lang: ${tc.language})`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Intent:  ${result.intent}`);
    console.log(`   Lang:    ${result.language}`);
    console.log(`   Source:  ${result.dataSource}`);
    console.log(`   Reply:   "${result.reply}"\n`);

    if (result.success && result.intent && result.reply && !result.reply.includes("Sorry, I did not get that")) {
      passCount++;
    } else {
      failCount++;
      console.log(`   ⚠️ WARNING: Question resulted in fallback or error!`);
    }
  }

  console.log("==================================================");
  console.log(`SUMMARY: ${passCount}/${testCases.length} Passed, ${failCount} Fallbacks/Errors.`);
  console.log("==================================================");
}

runTests();
