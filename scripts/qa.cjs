/* Visual QA walk-through of the AGRIBAZZER mobile app */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  const shot = (n) => page.screenshot({ path: `qa/${n}.png` });
  const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 8000 }); await page.click(sel); await page.waitForTimeout(450); };

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await shot('01-splash');
  await page.waitForTimeout(1800); // splash auto-advance
  await shot('02-onboarding');
  await tap('text=Skip');
  await shot('03-login');
  await page.fill('input[inputmode="numeric"]', '9876543210');
  await tap('text=Send OTP');
  await page.waitForSelector('.otp-box', { timeout: 8000 });
  await shot('04-otp');
  const boxes = await page.$$('.otp-box');
  for (let i = 0; i < 6; i++) await boxes[i].type('123456'[i]);
  await tap('text=Verify & Continue');
  await shot('05-role');
  await tap('text="Continue"');
  await shot('06-permissions');
  await tap('text=Allow & Continue');
  await page.waitForTimeout(600);
  await shot('07-home');

  // Farm tab
  await tap('.bn-item:nth-child(2)');
  await shot('08-farm');
  // Market tab
  await tap('.bn-item:nth-child(3)');
  await shot('09-market');
  // Sell tab (listings)
  await tap('.bn-item:nth-child(4)');
  await shot('10-listings');
  // Sell form
  await tap('text=Post New Produce');
  await shot('11-sellform');
  // AI scan FAB
  await tap('.fab-scan');
  await shot('12-scanner');
  await tap('text=Upload Photo');
  await page.waitForTimeout(900);
  await tap('text=Analyze Crop');
  await page.waitForTimeout(2800);
  await shot('13-diagnosis');
  await tap('.ab-btn'); // back to scanner (no nav there)
  await tap('.ab-btn'); // back to listings
  // Weather via home quick action: go home first
  await tap('.bn-item:nth-child(1)');
  await tap('text="Details"');
  await shot('14-weather');
  await tap('.ab-btn');
  // Waste
  await tap('text=Waste-to-Value');
  await shot('15-waste');
  await tap('.ab-btn');
  // Procurement via profile
  await tap('.bn-item:nth-child(5)');
  await shot('16-profile');
  await tap('text=Procurement & Tokens');
  await shot('17-procurement');
  await tap('text=Queue Prediction');
  await shot('18-queue');
  await tap('.ab-btn');
  await tap('text=Proceed to Logistics');
  await shot('19-logistics');
  await tap('.ab-btn');
  await tap('.ab-btn');
  // Agribot
  await tap('.fab-bot');
  await shot('20-agribot');
  await page.fill('.screen input.input', 'What is today’s paddy price?');
  await tap('text=Send');
  await page.waitForTimeout(1400);
  await shot('21-agribot-reply');
  // Buyer marketplace
  await tap('.ab-btn');
  await tap('.bn-item:nth-child(3)');
  await shot('22-market-prices');

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO RUNTIME ERRORS ✓');
  await browser.close();
})();
