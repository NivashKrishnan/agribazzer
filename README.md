# AGRIBAZZER — Mobile Application

**From Crop to Customer — One AI Platform**
*Grow Smart. Monitor Smart. Sell Smart.*

A complete mobile-first redesign of the AGRIBAZZER web platform as a true
Android/iOS-style application (React + Vite, 390×844 design frame). It is not a
responsive website — every screen is rebuilt around touch interaction, bottom
navigation, bottom sheets, swipeable cards and a floating AI assistant, while
preserving the AGRIBAZZER green agricultural identity from the reference design.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
node scripts/qa.cjs  # headless visual QA walk-through (screenshots → qa/)
```

Demo login: any 10-digit mobile (e.g. `9876543210`) · OTP `123456`.

## The 6 core capabilities surfaced immediately

1. 🛰 **Monitor crops with AI** — camera scanner, diagnosis, action plans, history
2. 📈 **Understand market prices** — live mandi rates, trends, AI price range
3. 🛒 **Sell your own produce** — 2-minute listing form → AI buyer matching
4. 🤝 **Find the right buyer** — match scores, verified buyers, negotiation
5. 🎟 **Manage procurement & logistics** — digital token, AI queue prediction, tracking
6. ♻️ **Turn agricultural waste into value** — waste listing → AI use/buyer matching

## Screens (33)

Splash · Onboarding (5 swipeable) · Login · OTP · Sign-up · Role Selection ·
Permissions · Home Dashboard (Farmer **and** Buyer variants) · My Farm ·
Crop Details · AI Disease Scanner · AI Diagnosis · Crop Health History ·
Weather & Risk · Market Prices · AI Price Assistant · Buyer Marketplace ·
Product Details · Negotiation · Sell Produce · My Listings · AI Buyer Matching ·
Waste-to-Value · Smart Procurement · Procurement Token · AI Queue Prediction ·
Logistics Tracking · Orders · Payment · Notifications · Agribot (EN/தமிழ்/Thanglish) ·
Profile · Settings

## Reusable components (`src/components.jsx`)

`MobileHeader`, `BottomNavigation`, `CropCard`, `MarketPriceCard`,
`ProductCard`, `BuyerCard`, `DiseaseResultCard`, `WeatherCard`,
`ProcurementTokenCard`, `QueueCard`, `OrderCard`, `NotificationCard`,
`AgribotButton`, `AIInsightCard`, plus `Btn` (idle/loading/success/error/disabled
states), `Sheet`, `ConfirmModal`, `Chip`, `Field`, `Spark`, `Icon` (offline SVG set).

## Architecture

```
src/
  App.jsx            stack router, role switch, toasts, confirmations
  app.css            design system (tokens, cards, sheets, nav, motion)
  data.js            demo data layer (mirrors platform API shapes)
  components.jsx     reusable mobile component library
  screens/
    Auth.jsx         01 splash → permissions
    Home.jsx         dashboard + weather/risk
    Farm.jsx         farm, crop, scanner, diagnosis, history
    Market.jsx       prices, AI price assistant, marketplace, product, negotiation
    Sell.jsx         sell form, listings, buyer matching, waste-to-value
    Procurement.jsx  procurement, token, queue AI, logistics
    Account.jsx      orders, payment, notifications, agribot, profile, settings
public/img/          photographic assets
scripts/qa.cjs       headless walk-through capturing qa/*.png
```

## UX rules honoured

- Mobile-first 390×844 frame; no desktop tables — cards, sheets, tabs, timelines
- Bottom nav: Home · Farm · Market · Sell/Buy · Profile + central **AI Scan FAB** + floating **Agribot**
- Progressive disclosure; every key action ≤ 2 taps
- Confirmation dialogs before: posting produce, cancelling token, confirming
  purchase, accepting negotiation, completing payment
- Form validation with inline errors; button loading/success/error states
- Red/orange reserved for disease severity, alerts and warnings only
- Responsible AI: chemical control shown with label-following use, safety
  warning, expert confirmation and a 3–5 day follow-up advisory
- Role switch (Farmer ↔ Buyer) without disconnecting the account
