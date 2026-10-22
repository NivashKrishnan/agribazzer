# AGRIBAZZER — Full-Stack Agriculture Marketplace & AI Platform

**From Crop to Customer — One Unified Agricultural Platform**  
*Grow Smart. Monitor Smart. Sell Smart.*

AGRIBAZZER is a full-stack, AI-powered agricultural marketplace and farm intelligence platform. It bridges farmers, verified buyers, procurement centres, and agricultural logistics through a mobile-first interface, resilient Express backend, dual-mode PostgreSQL/SQLite database architecture, and a cross-platform Android application powered by Capacitor.

---

## System Architecture

```mermaid
graph TD
    ClientWeb["Vercel Frontend (https://agribazzer.vercel.app)"] -->|HTTPS / REST API| Backend["Render Backend (Node.js / Express)"]
    ClientApp["Android APK (Capacitor Mobile App)"] -->|HTTPS / REST API| Backend
    Backend -->|Connection Pool / SSL| DB[("Production PostgreSQL (Neon / Render)")]
    Backend -.->|Local Dev Fallback| SQLite[("Local SQLite Database")]
    Backend -->|Vision & Diagnostics| GeminiAI["Google Gemini AI API"]
    Backend -->|Agri Weather Alerts| WeatherAPI["WeatherAPI & Open-Meteo"]
    Backend -->|Mandi Rates| GovData["Agmarknet & data.gov.in"]
```

---

## Key Features & Connected Modules

1. **Farmer & Buyer Portals**: Role-based access, JWT session management, farm and crop profiles.
2. **Produce Marketplace**: Real-time listings, multi-filter search, seller verification, and direct buyer matching.
3. **Price Assistant & Mandi Rates**: Live market prices across crops and districts with AI price predictions.
4. **Crop Health & Disease Scanner**: Multimodal crop disease scanner with domain-backed diagnostic fallbacks and Gemini Vision integration.
5. **Smart Procurement & Digital Tokens**: Government procurement center slot booking, digital tokens, and queue tracking.
6. **Logistics & Orders**: Order lifecycle tracking, transport selection, and verifiable UPI/COD transactions.
7. **AgriBot**: Multilingual conversational AI assistant supporting English, Tamil, and Tanglish.
8. **Automated CI/CD**: GitHub Actions workflow running frontend builds and 17-point backend/database test suites.

---

## Project Structure

```
agribazzer/
├── .github/workflows/ci.yml       # Automated CI test and build workflow
├── android/                       # Capacitor native Android project
├── capacitor.config.json          # Android app configuration
├── render.yaml                    # Render Blueprint infrastructure-as-code
├── vercel.json                    # Vercel deployment & SPA routing rules
├── package.json                   # Root dependencies & scripts
├── public/                        # Static images & branding assets
├── server/
│   ├── app.js                     # Express API server with JWT & CORS
│   ├── audit_test.js              # 17-point automated full-stack test suite
│   ├── db.js                      # Dual-mode PostgreSQL / SQLite database adapter
│   ├── migrate.js                 # PostgreSQL schema applicator & SQLite migration tool
│   ├── schema.sql                 # 17 agricultural database tables & 16 indexes
│   └── seed.js                    # Database seed scripts
├── src/
│   ├── App.jsx                    # Root client router & state provider
│   ├── app.css                    # Design system (390x844 mobile frame, tokens, motion)
│   ├── components.jsx             # UI component library
│   ├── data.js                    # Agricultural reference data
│   ├── i18n.js                    # Multilingual translation dictionary & TTS
│   ├── screens/                   # 33 application screens
│   │   ├── Account.jsx            # Orders, Payment, Notifications, AgriBot, Profile
│   │   ├── Auth.jsx               # Login, Signup, Role Selection, Permissions
│   │   ├── Farm.jsx               # Farm management, Scanner, Diagnosis
│   │   ├── Home.jsx               # Farmer & Buyer dashboards, Weather alerts
│   │   ├── Market.jsx             # Marketplace, Price Assistant, Checkout
│   │   ├── Procurement.jsx        # Token generation, Queue status, Logistics
│   │   └── Sell.jsx               # Produce listing, Buyer matching, Waste-to-value
│   └── services/
│       └── api.js                 # Frontend API client with JWT storage
```

---

## Database Architecture (17 Tables)

The production database is fully specified in [`server/schema.sql`](server/schema.sql) and runs on PostgreSQL (with local SQLite fallback in [`server/db.js`](server/db.js)):

| Table | Description |
|---|---|
| `users` | Multi-role user accounts (Farmer, Buyer, Agent, Admin) with password hashing |
| `farms` | Farm land parcels, soil types, irrigation sources, GPS coordinates |
| `crops` | Active plantings, acreage, sowing dates, expected harvest dates |
| `produce_lots` | Produce listed for sale (quantity, price, grade, storage location) |
| `buyer_demands` | Purchase requirements posted by commercial buyers |
| `offers` | Price offers and bids between buyers and farmers |
| `negotiations` | Counter-offers and conversation threads |
| `orders` | Confirmed trade contracts and fulfillment states |
| `logistics` | Vehicle bookings, driver details, tracking states |
| `payments` | UPI/Escrow payment records and status tracking |
| `procurement_centres`| MSP procurement hubs with daily capacity metrics |
| `procurement_tokens` | Time slots and queue positions for MSP crop delivery |
| `notifications` | Weather alerts, price changes, and system alerts |
| `grievances` | Farmer support requests and dispute resolutions |
| `plant_scans` | Crop leaf photos, AI diagnosis, treatment advice |
| `market_prices` | Daily mandi modal, minimum, and maximum prices |
| `weather_data` | Weather observations, precipitation, humidity, advisory |

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Java**: JDK 17 or JDK 21 (for Android builds)

### 2. Installation
```bash
git clone https://github.com/NivashKrishnan/agribazzer.git
cd agribazzer
npm install
```

### 3. Start Backend & Database
```bash
# Starts Express on http://localhost:5000 (uses local SQLite or PostgreSQL if DATABASE_URL is set)
node server/app.js
```

### 4. Start Frontend
```bash
# Starts Vite on http://localhost:5173
npm run dev
```

### 5. Run Full-Stack Audit Test Suite
```bash
# Executes all 17 integration tests against the database & API endpoints
node server/audit_test.js
```

---

## Production Deployment

### 1. Database Setup (Neon or Render Postgres)
1. Create a PostgreSQL database on [Neon](https://neon.tech) or [Render](https://render.com).
2. Obtain the connection string (e.g. `postgres://user:pass@ep-xyz.neon.tech/agribazzer?sslmode=require`).
3. Run the schema migration script:
   ```bash
   DATABASE_URL="your-postgres-connection-string" node server/migrate.js
   ```

### 2. Backend Deployment (Render)
1. In Render, create a **Web Service** pointing to this repository.
2. Select Root Directory as `.` (or use the included `render.yaml` Blueprint).
3. Set Build Command: `npm install`
4. Set Start Command: `node server/app.js`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Secure 32+ character random secret
   - `CORS_ORIGIN`: `https://agribazzer.vercel.app,capacitor://localhost`
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API Key

### 3. Frontend Deployment (Vercel)
1. Connect the repository to [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com`
6. `vercel.json` will automatically handle SPA rewrites and client asset caching.

---

## Android Mobile Application (Capacitor)

The Android project is pre-configured with camera, geolocation, audio, and network permissions.

### Build and Run:
```bash
# 1. Build the production web bundle
npm run build

# 2. Sync web assets with native Android project
npx cap sync android

# 3. Open in Android Studio or compile debug APK
# Ensure JDK 17 or JDK 21 is set as your JAVA_HOME
cd android
./gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## License & Attribution

AGRIBAZZER is built for agricultural empowerment, fair prices, and direct farm-to-buyer market transparency.
