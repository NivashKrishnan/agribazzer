/* Screens 05 Home Dashboard (Farmer + Buyer) & 11 Weather & Risk */
import React, { useEffect, useState } from 'react';
import {
  Btn, Chip, Icon, MobileHeader, SectionTitle, MarketPriceCard, WeatherCard,
  AIInsightCard, ProductCard, useApp,
} from '../components.jsx';
import { HEALTH_SUMMARY as HS, MARKET, NEARBY, TOKEN, USER, WEATHER } from '../data.js';
import api from '../services/api.js';

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const QA = [
  { icon: 'camera', label: 'Crop Scanner', to: ['scanner'] },
  { icon: 'sun', label: 'Weather', to: ['weather'] },
  { icon: 'chart', label: 'Market Prices', to: ['market'] },
  { icon: 'cart', label: 'Sell Produce', to: ['sellForm'] },
  { icon: 'shield', label: 'Find Buyers', to: ['matching'] },
  { icon: 'ticket', label: 'Procurement', to: ['procurement'] },
  { icon: 'store', label: 'Marketplace', to: ['marketplace'] },
  { icon: 'box', label: 'Orders', to: ['orders'] },
];

export function Home() {
  const app = useApp();
  return app.role === 'buyer' ? <BuyerHome /> : <FarmerHome />;
}

function FarmerHome() {
  const app = useApp();
  const [homeW, setHomeW] = useState(WEATHER);

  useEffect(() => {
    api.getWeather()
      .then((res) => {
        if (res && res.success) setHomeW(res);
      })
      .catch(() => {});
  }, []);

  const rainfallText = homeW.rainfall ? (homeW.rainfall.includes('·') ? homeW.rainfall.split('·')[0].trim() : homeW.rainfall) : '30%';

  return (
    <div className="screen" style={{ paddingBottom: 150 }}>
      <div className="appbar rounded" style={{ paddingBottom: 40 }}>
        <div className="grow">
          <div className="ab-title" style={{ fontSize: 18 }}>{greet()}, {USER.name.split(' ')[0]} 👋</div>
          <div className="ab-sub row" style={{ gap: 4, marginTop: 3 }}>
            <Icon n="pin" s={12} w={2.2} /> {USER.location}
          </div>
        </div>
        <button className="ab-btn ab-dot" onClick={() => app.go('notifications')}><Icon n="bell" s={19} w={2.1} /></button>
        <button className="ab-btn" onClick={() => app.setTab('profile')} style={{ borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <Icon n="user" s={19} w={2} style={{ color: 'var(--brand-800)' }} />
        </button>
      </div>

      <div style={{ margin: '-26px 16px 0', position: 'relative', zIndex: 21 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="row">
            <div className="li-icon" style={{ background: 'var(--tint)' }}><Icon n="sun" s={20} w={2} /></div>
            <div className="col grow">
              <span style={{ fontWeight: 800, fontSize: 16 }}>{homeW.temp ?? 31}°C · {homeW.condition || 'Partly Cloudy'}</span>
              <span className="tiny muted">{homeW.place || homeW.location || 'My Location'} · Rain {rainfallText}</span>
            </div>
            <Btn xs variant="ghost" onClick={() => app.go('weather')}>{app?.t ? app.t('details') : 'Details'}</Btn>
          </div>
        </div>
      </div>

      <SectionTitle>{app?.t ? app.t('quickActions') : 'Quick Actions'}</SectionTitle>
      <div className="qa-grid">
        {QA.map((q) => (
          <button className="qa-tile" key={q.label} onClick={() => (q.to[0] === 'farm' || q.to[0] === 'market' ? app.setTab(q.to[0]) : app.go(q.to[0]))}>
            <span className="qa-ic" style={{ display: 'grid', placeItems: 'center' }}><Icon n={q.icon} s={22} w={2} /></span>
            {q.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ margin: '14px 16px 0', padding: 12, background: 'linear-gradient(120deg,#fff8e8,#fff)' }}>
        <div className="row">
          <div className="li-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}><Icon n="ticket" s={18} w={2.1} /></div>
          <div className="col grow">
            <span style={{ fontWeight: 800, fontSize: 13.5 }}>{app?.t ? app.t('token') : 'Token'} #{TOKEN.id}</span>
            <span className="tiny muted">Queue {TOKEN.queue} · Wait {TOKEN.wait}</span>
          </div>
          <Btn xs variant="outline" onClick={() => app.go('token')}>{app?.t ? app.t('details') : 'View'}</Btn>
        </div>
      </div>

      <SectionTitle action={app?.t ? app.t('seeAll') : 'See all'} onAction={() => app.setTab('market')}>{app?.t ? app.t('todaysMarket') : "Today's Market"}</SectionTitle>
      <div className="hscroll">
        {MARKET.slice(0, 4).map((m) => (
          <MarketPriceCard key={m.id} m={m} wide onClick={() => app.setTab('market')} />
        ))}
      </div>

      <SectionTitle action="Open" onAction={() => app.go('waste')}>Waste → Value</SectionTitle>
      <div style={{ padding: '0 16px 8px' }}>
        <AIInsightCard title="WASTE-TO-VALUE"
          body="500 kg rice straw available. 4 nearby buyers found — best match: cattle farm 5 km away."
          actions={<Btn sm variant="primary" icon="recycle" onClick={() => app.go('waste')}>Sell Waste</Btn>} />
      </div>
    </div>
  );
}

function BuyerHome() {
  const app = useApp();
  const cats = [
    { icon: 'leaf', l: 'Paddy', img: 'img/paddy.jpg' },
    { icon: 'sun', l: 'Maize', img: 'img/maize.jpg' },
    { icon: 'drop', l: 'Tomato', img: 'img/tomato.jpg' },
    { icon: 'box', l: 'Onion', img: 'img/onion.jpg' },
    { icon: 'store', l: 'Groundnut', img: 'img/basket.jpg' },
    { icon: 'cart', l: 'Vegetables', img: 'img/tomato.jpg' },
    { icon: 'recycle', l: 'Agri Waste', img: 'img/straw.jpg' },
  ];
  return (
    <div className="screen" style={{ paddingBottom: 150 }}>
      <div className="appbar rounded" style={{ paddingBottom: 46 }}>
        <div className="grow">
          <div className="ab-title" style={{ fontSize: 18 }}>Welcome, Buyer 👋</div>
          <div className="ab-sub row" style={{ gap: 4, marginTop: 3 }}><Icon n="pin" s={12} w={2.2} /> Thanjavur, Tamil Nadu</div>
        </div>
        <button className="ab-btn ab-dot" onClick={() => app.go('notifications')}><Icon n="bell" s={19} w={2.1} /></button>
      </div>
      <div style={{ margin: '-32px 16px 0', position: 'relative', zIndex: 21 }}>
        <div className="row" style={{ background: '#fff', borderRadius: 14, padding: '4px 4px 4px 14px', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>
          <Icon n="search" s={18} w={2.1} />
          <input className="input" style={{ border: 0, boxShadow: 'none', flex: 1 }} placeholder="Search produce..."
            onFocus={() => app.go('marketplace')} />
          <Btn sm variant="ghost" onClick={() => app.go('marketplace')} icon="filter">Filters</Btn>
        </div>
      </div>
      <SectionTitle>Categories</SectionTitle>
      <div className="hscroll">
        {cats.map((c) => (
          <button className="qa-tile" key={c.l} style={{ width: 84, padding: '10px 6px' }} onClick={() => app.go('marketplace')}>
            <img src={c.img} alt={c.l} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', margin: '0 auto 4px' }} />
            {c.l}
          </button>
        ))}
      </div>
      <SectionTitle action="View all" onAction={() => app.go('marketplace')}>Nearby Produce</SectionTitle>
      <div style={{ padding: '0 16px' }}>
        <ProductCard p={{ title: 'Paddy (Samba)', price: 28, qty: '1,000 kg', dist: '8 km', verified: true, img: 'img/paddy.jpg' }} onClick={() => app.go('product', { id: 'P1' })} />
        <ProductCard p={{ title: 'Tomato (Hybrid)', price: 32, qty: '500 kg', dist: '12 km', verified: true, img: 'img/tomato.jpg' }} onClick={() => app.go('product', { id: 'P2' })} />
      </div>
      <SectionTitle>Near You</SectionTitle>
      <div className="row" style={{ gap: 8, padding: '0 16px', flexWrap: 'wrap' }}>
        <Chip>{NEARBY.farmers} farmers</Chip><Chip>{NEARBY.markets} markets</Chip>
        <Chip>{NEARBY.centres} procurement centres</Chip><Chip>{NEARBY.wasteBuyers} waste buyers</Chip>
      </div>
    </div>
  );
}

/* ---------- 11 Weather ---------- */
export function Weather() {
  const app = useApp();
  const [w, setW] = useState(WEATHER);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [manualVisible, setManualVisible] = useState(false);

  useEffect(() => {
    api.getWeather()
      .then((res) => {
        if (res && res.success) setW(res);
      })
      .catch(() => {});
  }, []);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg('Location unavailable');
      setManualVisible(true);
      if (app?.toast) app.toast('Geolocation is not supported by your browser.');
      return;
    }

    setStatusMsg('Getting location...');
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatusMsg('Fetching weather...');
        api.getWeather({ lat: latitude, lon: longitude })
          .then((res) => {
            if (res && res.success) {
              setW(res);
              setStatusMsg('Weather updated');
              if (app?.toast) app.toast(`Live weather updated for ${res.place}`);
            } else {
              setStatusMsg('Weather API unavailable');
            }
          })
          .catch(() => {
            setStatusMsg('Network error');
            if (app?.toast) app.toast('Network error fetching weather.');
          })
          .finally(() => setLoading(false));
      },
      (err) => {
        setLoading(false);
        setManualVisible(true);
        if (err.code === 1) {
          setStatusMsg('Location permission denied');
          if (app?.toast) app.toast('Location permission denied. Search city manually below.');
        } else if (err.code === 2) {
          setStatusMsg('Location unavailable');
          if (app?.toast) app.toast('Position unavailable.');
        } else if (err.code === 3) {
          setStatusMsg('Network error');
          if (app?.toast) app.toast('Location request timed out.');
        } else {
          setStatusMsg('Location unavailable');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleRefresh = () => {
    setStatusMsg('Fetching weather...');
    setLoading(true);
    const params = (w.lat && w.lon) ? { lat: w.lat, lon: w.lon } : { q: w.place || w.location || 'Thanjavur' };
    api.getWeather(params)
      .then((res) => {
        if (res && res.success) {
          setW(res);
          setStatusMsg('Weather updated');
          if (app?.toast) app.toast('Weather refreshed!');
        }
      })
      .catch(() => setStatusMsg('Network error'))
      .finally(() => setLoading(false));
  };

  const handleSearchCity = (cityVal) => {
    const target = (typeof cityVal === 'string' ? cityVal : searchCity).trim();
    if (!target) return;
    setStatusMsg('Fetching weather...');
    setLoading(true);
    api.getWeather({ q: target })
      .then((res) => {
        if (res && res.success) {
          setW(res);
          setStatusMsg('Weather updated');
          if (app?.toast) app.toast(`Weather updated for ${res.place}`);
        }
      })
      .catch(() => setStatusMsg('Weather API unavailable'))
      .finally(() => setLoading(false));
  };

  const riskTone = w.risk === 'HIGH' ? 'red' : (w.risk === 'MEDIUM' ? 'amber' : 'green');
  const riskPos = w.risk === 'HIGH' ? '85%' : (w.risk === 'MEDIUM' ? '50%' : '15%');

  return (
    <div className="screen" style={{ paddingBottom: 140 }}>
      <MobileHeader title="Weather" sub={w.place || w.location || 'My Location'} right={
        <button className="ab-btn" onClick={handleRefresh} disabled={loading} title="Refresh Weather">
          <Icon n="pin" s={17} w={2.1} />
        </button>
      } />

      <div style={{ padding: '14px 16px 0' }}>
        <WeatherCard
          w={w}
          onUseLocation={handleUseLocation}
          onRefresh={handleRefresh}
          loading={loading}
          statusMsg={statusMsg}
          label={w.label || 'LIVE DATA'}
        />
      </div>

      {statusMsg === 'Location permission denied' && (
        <div style={{ padding: '8px 16px 0' }}>
          <div className="card" style={{ padding: 10, border: '1px solid var(--orange)', background: '#fff9f5' }}>
            <span style={{ fontWeight: 700, color: 'var(--orange)', fontSize: 13 }}>⚠️ Location permission denied</span>
            <div className="tiny muted" style={{ marginTop: 2 }}>You can search or pick a location manually below.</div>
          </div>
        </div>
      )}

      {(manualVisible || statusMsg === 'Location permission denied') && (
        <div className="card" style={{ margin: '12px 16px 0', padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Enter Location / Search City</div>
          <div className="row" style={{ gap: 8 }}>
            <input
              type="text"
              className="input"
              placeholder="Enter city (e.g. Chennai, Coimbatore, Delhi)"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchCity()}
              style={{ flex: 1 }}
            />
            <Btn sm variant="primary" onClick={() => handleSearchCity()} disabled={loading}>Search</Btn>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {['Thanjavur', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Delhi', 'Mumbai'].map(c => (
              <Chip key={c} xs tone="gray" onClick={() => { setSearchCity(c); handleSearchCity(c); }}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <SectionTitle>7-Day Forecast</SectionTitle>
      <div className="hscroll">
        {(w.forecast || []).map((f) => (
          <div className="card flat" key={f.d} style={{ width: 74, textAlign: 'center', padding: '12px 6px', border: '1px solid var(--line)' }}>
            <div className="tiny muted" style={{ fontWeight: 700 }}>{f.d}</div>
            <div style={{ fontSize: 22, margin: '6px 0' }}>{f.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{f.hi}°</div>
            <div className="tiny muted">{f.lo}°</div>
            <Chip tone={parseInt(f.rain || '0') > 50 ? 'blue' : 'gray'} className="tiny">{f.rain}</Chip>
          </div>
        ))}
      </div>

      <SectionTitle>Agricultural Alerts</SectionTitle>
      <div style={{ padding: '0 16px' }}>
        {(w.alerts || []).map((a) => (
          <div className="card" key={a.title} style={{ marginBottom: 10, padding: 12 }}>
            <div className="row">
              <div className="li-icon" style={{ background: a.tone === 'blue' ? 'var(--blue-bg)' : 'var(--orange-bg)' }}>{a.icon}</div>
              <div className="col grow">
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{a.title}</span>
                <span className="tiny muted" style={{ marginTop: 2, lineHeight: 1.45 }}>{a.body}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ margin: '6px 16px', padding: 14 }}>
        <div className="row between">
          <div className="col">
            <span style={{ fontWeight: 800 }}>Crop Risk — {w.crop || 'Paddy'}</span>
            <span className="tiny muted">{w.riskLabel || 'RULE-BASED AGRICULTURAL RISK'}</span>
          </div>
          <Chip tone={riskTone} solid className="lg">{w.risk || 'MEDIUM'}</Chip>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'linear-gradient(90deg,#27a05b,#e8b04b,#c03434)', marginTop: 12, position: 'relative' }}>
          <div style={{ position: 'absolute', left: riskPos, top: -4, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '3px solid var(--brand-900)', transition: 'left 0.3s ease' }} />
        </div>
        <div className="row between tiny muted" style={{ marginTop: 6 }}><span>LOW</span><span>MEDIUM</span><span>HIGH</span></div>
      </div>
    </div>
  );
}


