/* ============================================================
   AGRIBAZZER MOBILE — Root application shell & navigation
   From Crop to Customer — One AI Platform
   ============================================================ */
import React, { useCallback, useState } from 'react';
import {
  NavCtx, BottomNavigation, FabScan, AgribotButton, ConfirmModal, Icon, ErrorBoundary,
} from './components.jsx';

import { Splash, Onboarding, Login, Otp, Signup, RoleSelect, Permissions } from './screens/Auth.jsx';
import { Home, Weather } from './screens/Home.jsx';
import { Farm, CropDetails, Scanner, Diagnosis, History } from './screens/Farm.jsx';
import { MarketPrices, PriceAssistant, Marketplace, ProductDetails, Negotiation, Checkout, OrderConfirmation, OrderTracking } from './screens/Market.jsx';
import { SellForm, Listings, Matching, Waste } from './screens/Sell.jsx';
import { Procurement, Token, QueuePrediction, Logistics } from './screens/Procurement.jsx';
import { Orders, Payment, Notifications, Agribot, Profile, Settings, EditProfileForm, PrivacySecurity, HelpSupport, LanguageScreen, FarmLocationsScreen } from './screens/Account.jsx';
import { t as i18nT } from './i18n.js';

const SCREENS = {
  splash: Splash,
  onboarding: Onboarding,
  login: Login,
  otp: Otp,
  signup: Signup,
  role: RoleSelect,
  permissions: Permissions,
  home: Home,
  weather: Weather,
  farm: Farm,
  crop: CropDetails,
  scanner: Scanner,
  diagnosis: Diagnosis,
  history: History,
  market: MarketPrices,
  priceAssistant: PriceAssistant,
  marketplace: Marketplace,
  product: ProductDetails,
  negotiation: Negotiation,
  checkout: Checkout,
  orderConfirm: OrderConfirmation,
  tracking: OrderTracking,
  sellForm: SellForm,
  listings: Listings,
  matching: Matching,
  waste: Waste,
  procurement: Procurement,
  token: Token,
  queue: QueuePrediction,
  logistics: Logistics,
  orders: Orders,
  payment: Payment,
  notifications: Notifications,
  agribot: Agribot,
  profile: Profile,
  settings: Settings,
  editProfile: EditProfileForm,
  privacy: PrivacySecurity,
  help: HelpSupport,
  language: LanguageScreen,
  farmLocations: FarmLocationsScreen,
};

const TAB_SCREEN = { home: 'home', market: 'market', sell: 'listings', orders: 'orders', profile: 'profile' };
const NO_NAV = new Set(['splash', 'onboarding', 'login', 'otp', 'signup', 'role', 'permissions', 'scanner', 'agribot', 'checkout', 'orderConfirm', 'tracking', 'editProfile']);

export default function App() {
  const [stack, setStack] = useState([{ name: 'splash' }]);
  const [tab, setTabState] = useState('home');
  const [role, setRoleState] = useState('farmer');
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('agribazzer_lang') || 'en'; } catch (e) { return 'en'; }
  });
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  // Persistent User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('agribazzer_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      location: 'Thanjavur, Tamil Nadu',
      role: 'farmer',
      farmSize: '5.2 Acres',
      mainCrop: 'Paddy',
      verified: true,
    };
  });

  const updateProfile = useCallback((updatedData) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updatedData };
      if (updatedData.role) setRoleState(updatedData.role);
      try {
        localStorage.setItem('agribazzer_user_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const setRole = useCallback((r) => {
    setRoleState(r);
    updateProfile({ role: r });
  }, [updateProfile]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('agribazzer_lang', l); } catch(e){}
  }, []);

  const cur = stack[stack.length - 1];
  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    setConfirmState({ ...opts, resolve: (v) => { setConfirmState(null); resolve(v); } });
  }), []);

  const go = useCallback((name, params) => setStack((s) => [...s, { name, params }]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const reset = useCallback((name, params) => setStack([{ name, params }]), []);
  const setTab = useCallback((t) => {
    setTabState(t);
    setStack([{ name: TAB_SCREEN[t] }]);
  }, []);

  const ctx = {
    go, back, reset, setTab, role, setRole, toast: showToast, confirm, tab, lang, setLang,
    darkMode, setDarkMode, toggleDarkMode, t: (k) => i18nT(k, lang),
    userProfile, updateProfile
  };

  const Screen = SCREENS[cur.name] || Home;
  const showNav = !NO_NAV.has(cur.name);
  const sellTabTarget = role === 'buyer' ? 'marketplace' : 'listings';

  return (
    <NavCtx.Provider value={ctx}>
      <div className="shell">
        <div className={`device ${darkMode ? 'dark-theme' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>
          <div className="screen-wrap">
            <ErrorBoundary key={cur.name}>
              <Screen key={cur.name + '-' + lang + '-' + JSON.stringify(cur.params || {})} params={cur.params} />
            </ErrorBoundary>

            {showNav && (
              <>
                <BottomNavigation
                  tab={tab}
                  role={role}
                  onTab={(t) => {
                    if (t === 'sell') { setTabState('sell'); setStack([{ name: sellTabTarget }]); }
                    else setTab(t);
                  }}
                />
                <FabScan />
                <AgribotButton />
              </>
            )}

            {toast && (
              <div className="toast">
                <Icon n="checkC" s={15} w={2.2} /> {toast}
              </div>
            )}
            <ConfirmModal state={confirmState} onClose={() => confirmState?.resolve(false)} />
          </div>
        </div>
      </div>
    </NavCtx.Provider>
  );
}
