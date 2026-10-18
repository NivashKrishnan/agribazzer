/* Smoke test: SSR-render every screen to catch runtime errors */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { NavCtx } from '../src/components.jsx';
import { Splash, Onboarding, Login, Otp, Signup, RoleSelect, Permissions } from '../src/screens/Auth.jsx';
import { Home, Weather } from '../src/screens/Home.jsx';
import { Farm, CropDetails, Scanner, Diagnosis, History } from '../src/screens/Farm.jsx';
import { MarketPrices, PriceAssistant, Marketplace, ProductDetails, Negotiation } from '../src/screens/Market.jsx';
import { SellForm, Listings, Matching, Waste } from '../src/screens/Sell.jsx';
import { Procurement, Token, QueuePrediction, Logistics } from '../src/screens/Procurement.jsx';
import { Orders, Payment, Notifications, Agribot, Profile, Settings } from '../src/screens/Account.jsx';

const SCREENS = {
  Splash, Onboarding, Login, Otp, Signup, RoleSelect, Permissions, Home, Weather, Farm,
  CropDetails, Scanner, Diagnosis, History, MarketPrices, PriceAssistant, Marketplace,
  ProductDetails, Negotiation, SellForm, Listings, Matching, Waste, Procurement, Token,
  QueuePrediction, Logistics, Orders, Payment, Notifications, Agribot, Profile, Settings,
};

const ctx = {
  go: () => {}, back: () => {}, reset: () => {}, setTab: () => {},
  role: 'farmer', setRole: () => {}, toast: () => {}, tab: 'home',
  confirm: () => Promise.resolve(false),
};

let fail = 0;
for (const [name, C] of Object.entries(SCREENS)) {
  for (const role of ['farmer', 'buyer']) {
    try {
      const html = renderToString(
        React.createElement(NavCtx.Provider, { value: { ...ctx, role } },
          React.createElement(C, { params: { id: 'paddy', crop: 'Paddy' } }))
      );
      if (html.length < 200) throw new Error('suspiciously small output');
      console.log(`OK   ${name.padEnd(16)} [${role}] ${html.length} bytes`);
    } catch (e) {
      fail++;
      console.log(`FAIL ${name} [${role}]: ${e.message}`);
    }
  }
}
console.log(fail ? `\n${fail} FAILURES` : '\nALL SCREENS RENDER ✓');
process.exit(fail ? 1 : 0);
