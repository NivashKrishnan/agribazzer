const http = require('http');

function fetchWeather(params) {
  return new Promise((resolve) => {
    const url = `http://localhost:5000/api/weather${params ? '?' + params : ''}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

async function runWeatherTests() {
  console.log("==================================================");
  console.log("AGRIBAZZER WEATHER API VALIDATION SUITE");
  console.log("==================================================\n");

  console.log("Test A: Valid Lat/Lon (Chennai 13.0827, 80.2707)");
  const testA = await fetchWeather('lat=13.0827&lon=80.2707');
  console.log(`   Status: ${testA.status}`);
  console.log(`   Place: ${testA.data.place}`);
  console.log(`   Label: ${testA.data.label}`);
  console.log(`   Temp: ${testA.data.temperature}\n`);

  console.log("Test B: Manual City Search (Coimbatore)");
  const testB = await fetchWeather('q=coimbatore');
  console.log(`   Status: ${testB.status}`);
  console.log(`   Place: ${testB.data.place}`);
  console.log(`   Label: ${testB.data.label}`);
  console.log(`   Temp: ${testB.data.temperature}\n`);

  console.log("Test C: Invalid Coordinates (lat=100, lon=200)");
  const testC = await fetchWeather('lat=100&lon=200');
  console.log(`   Status: ${testC.status}`);
  console.log(`   Error Message: ${testC.data.error}\n`);

  console.log("==================================================");
}

runWeatherTests();
