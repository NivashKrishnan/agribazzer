/* Screens 12 Market Prices, 13 AI Price Assistant, 16 Buyer Marketplace, 17 Product Details, 19 Negotiation */
import React, { useMemo, useState } from 'react';
import {
  Btn, Chip, Icon, MobileHeader, SectionTitle, MarketPriceCard, ProductCard, Sheet, Field,
  AIInsightCard, Spark, useApp,
} from '../components.jsx';
import { COMPARE_MARKETS, MARKET, MARKETPLACE, NEGOTIATION } from '../data.js';

/* ---------- 12 Market Prices ---------- */
export function MarketPrices() {
  const app = useApp();
  const [tab, setTab] = useState('Crops');
  const [cmp, setCmp] = useState(false);
  const filtered = useMemo(() => {
    if (tab === 'Crops') return MARKET.filter((m) => ['paddy', 'maize', 'onion', 'groundnut'].includes(m.id));
    if (tab === 'Vegetables') return MARKET.filter((m) => m.id === 'tomato');
    return MARKET;
  }, [tab]);
  return (
    <div className="screen" style={{ paddingBottom: 150 }}>
      <MobileHeader title="Market Prices" sub="Live mandi rates near you" back={false}
        right={<button className="ab-btn" onClick={() => setCmp(true)}><Icon n="map" s={18} w={2.1} /></button>} />
      <div className="tabs">
        {['All', 'Crops', 'Vegetables', 'Fruits'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        {(tab === 'All' ? MARKET : filtered).map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <MarketPriceCard m={m} onClick={() => app.go('priceAssistant', { id: m.id })} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4 }}>
        <AIInsightCard title="AI SMART PRICE ASSISTANT"
          body="Based on current market trends, your location and demand, your expected selling range for Paddy (Samba) is ₹26–₹29/kg. Prices peak around dusk auctions — list before 4 PM for best visibility."
          actions={<>
            <Btn sm variant="primary" icon="cart" onClick={() => app.go('sellForm')}>Sell Now</Btn>
            <Btn sm variant="outline" icon="map" onClick={() => setCmp(true)}>Compare Markets</Btn>
          </>} />
      </div>
      <Sheet open={cmp} onClose={() => setCmp(false)} title="Compare Nearby Markets">
        {COMPARE_MARKETS.map((c) => (
          <div className="card flat" key={c.name} style={{ border: '1px solid var(--line)', marginBottom: 8, padding: 12, position: 'relative' }}>
            <div className="row between">
              <div className="col">
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{c.name}</span>
                <span className="tiny muted">{c.dist} away</span>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                <span className="price" style={{ fontSize: 14 }}>Paddy ₹{c.paddy}</span>
                <span className="tiny muted">Tomato ₹{c.tomato}</span>
              </div>
            </div>
            {c.best && <div style={{ marginTop: 8 }}><Chip tone="amber">⭐ Best price for paddy</Chip></div>}
          </div>
        ))}
        <Btn block variant="ghost" icon="pin" onClick={() => { setCmp(false); app.toast('Route to Kumbakonam Market opened'); }}>Navigate to Best Market</Btn>
      </Sheet>
    </div>
  );
}

/* ---------- 13 AI Price Assistant ---------- */
export function PriceAssistant({ params }) {
  const app = useApp();
  const m = MARKET.find((x) => x.id === params?.id) || MARKET[0];
  const lo = (m.price * 0.93).toFixed(0), hi = (m.price * 1.04).toFixed(0);
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <MobileHeader title="AI Price Assistant" sub={`${m.name} · ${m.market}`} />
      <div style={{ padding: '16px 16px 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: 18 }}>
          <div className="tiny muted" style={{ fontWeight: 700 }}>EXPECTED SELLING RANGE</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--brand-700)', margin: '6px 0' }}>₹{lo} – ₹{hi}<span style={{ fontSize: 14 }}>/kg</span></div>
          <Chip>Current: ₹{m.price}/kg · {m.trend > 0 ? '↑' : '↓'} {Math.abs(m.trend)}%</Chip>
          <div style={{ margin: '16px auto 0', maxWidth: 260 }}><Spark data={m.spark} up={m.trend > 0} /></div>
          <div className="tiny muted" style={{ marginTop: 6 }}>7-day trend · {m.date}</div>
        </div>
      </div>
      <SectionTitle>Why this range?</SectionTitle>
      <div className="card" style={{ margin: '0 16px', padding: 4 }}>
        {[
          ['📈', 'Arrival volume', 'Low arrivals this week at Thanjavur (−12%)'],
          ['', 'Weather', 'Rain Tue–Wed may delay harvest & transport'],
          ['🤝', 'Buyer demand', '5 buyers actively bidding within 30 km'],
          ['🗓', 'Season', 'Samba peak harvest begins mid-October'],
        ].map(([e, t, b], i) => (
          <div className="row" key={t} style={{ padding: 11, gap: 10, borderBottom: i < 3 ? '1px solid var(--line)' : 0 }}>
            <span style={{ fontSize: 17 }}>{e}</span>
            <div className="col">
              <span className="small" style={{ fontWeight: 800 }}>{t}</span>
              <span className="tiny muted">{b}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 10, padding: '16px 16px 0' }}>
        <Btn block icon="cart" onClick={() => app.go('sellForm', { crop: m.name })}>Sell Now</Btn>
        <Btn block variant="ghost" icon="bot" onClick={() => app.go('agribot')}>Ask Agribot</Btn>
      </div>
    </div>
  );
}

/* ---------- 16 Buyer Marketplace ---------- */
export function Marketplace() {
  const app = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [flt, setFlt] = useState(false);
  const [f, setF] = useState({ dist: 25, maxPrice: 100, verified: true, quality: 'Any' });
  const cats = ['All', 'Paddy', 'Rice', 'Vegetables', 'Fruits', 'Pulses', 'Other'];
  const list = MARKETPLACE.filter((p) =>
    (cat === 'All' || p.title.toLowerCase().includes(cat.toLowerCase())) &&
    p.title.toLowerCase().includes(q.toLowerCase()) &&
    parseInt(p.dist) <= f.dist && p.price <= f.maxPrice && (!f.verified || p.verified) &&
    (f.quality === 'Any' || p.quality.includes(f.quality))
  );
  return (
    <div className="screen" style={{ paddingBottom: 150 }}>
      <MobileHeader title="Marketplace" sub="Direct from verified farms"
        right={<button className="ab-btn" onClick={() => setFlt(true)}><Icon n="filter" s={18} w={2.1} /></button>} />
      <div style={{ padding: '12px 16px 0' }}>
        <div className="row" style={{ background: '#fff', borderRadius: 13, padding: '3px 3px 3px 13px', border: '1px solid var(--line)' }}>
          <Icon n="search" s={17} w={2.1} />
          <input className="input" style={{ border: 0, boxShadow: 'none' }} placeholder="Search crops..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="hscroll" style={{ paddingTop: 12 }}>
        {cats.map((c) => (
          <button key={c} className={`chip lg ${cat === c ? 'solid' : ''}`} style={{ border: 0, cursor: 'pointer', padding: '8px 14px' }} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="tiny muted pad" style={{ marginTop: 4 }}>{list.length} listings within {f.dist} km</div>
      <div style={{ padding: '10px 16px 0' }}>
        {list.map((p) => (
          <div key={p.id} style={{ marginBottom: 10 }}>
            <ProductCard p={p} onClick={() => app.go('product', { id: p.id })} />
          </div>
        ))}
        {!list.length && (
          <div className="card center" style={{ padding: 30 }}>
            <div style={{ fontSize: 34 }}>🔍</div>
            <p className="small muted">No listings match your filters.<br />Try widening the distance or price.</p>
            <Btn sm variant="ghost" onClick={() => { setF({ dist: 50, maxPrice: 200, verified: false, quality: 'Any' }); setCat('All'); setQ(''); }}>Clear Filters</Btn>
          </div>
        )}
      </div>
      <Sheet open={flt} onClose={() => setFlt(false)} title="Filters">
        <Field label={`Distance: within ${f.dist} km`}>
          <input type="range" min="5" max="60" step="5" value={f.dist} style={{ width: '100%' }} onChange={(e) => setF({ ...f, dist: +e.target.value })} />
        </Field>
        <Field label={`Max price: ₹${f.maxPrice}/kg`}>
          <input type="range" min="10" max="200" step="5" value={f.maxPrice} style={{ width: '100%' }} onChange={(e) => setF({ ...f, maxPrice: +e.target.value })} />
        </Field>
        <Field label="Quality">
          <div className="select-wrap">
            <select className="select" value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })}>
              {['Any', 'A', 'B', 'C'].map((qy) => <option key={qy}>{qy}</option>)}
            </select>
          </div>
        </Field>
        <div className="row between" style={{ padding: '6px 2px' }}>
          <span className="small" style={{ fontWeight: 700 }}>Verified sellers only</span>
          <button className={`switch ${f.verified ? 'on' : ''}`} onClick={() => setF({ ...f, verified: !f.verified })} />
        </div>
        <Btn block onClick={() => setFlt(false)}>Show {list.length} Results</Btn>
      </Sheet>
    </div>
  );
}

/* ---------- 17 Product Details (buyer view) ---------- */
export function ProductDetails({ params }) {
  const app = useApp();
  const p = MARKETPLACE.find((x) => x.id === params?.id) || MARKETPLACE[0];
  const buy = () => {
    app.go('checkout', { productId: p.id });
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <div className="hero-img" style={{ height: 230 }}>
        <img src={p.img} alt={p.title} />
        <div className="ov" style={{ background: 'linear-gradient(180deg, rgba(6,42,27,.6), transparent 40%, rgba(6,42,27,.5))' }} />
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex' }}>
          <button className="ab-btn" onClick={app.back}><Icon n="back" s={19} w={2.4} /></button>
          <div className="grow" />
          <button className="ab-btn" onClick={() => app.toast('Saved to favourites')}><Icon n="star" s={18} w={2.1} /></button>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, color: '#fff' }} className="row between">
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{p.title}</div>
            <div className="tiny" style={{ opacity: 0.85 }}>{p.qty} · {p.dist} away</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>₹{p.price}<span style={{ fontSize: 13 }}>/kg</span></div>
        </div>
      </div>
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="row">
            <div className="li-icon" style={{ borderRadius: '50%' }}>👨‍🌾</div>
            <div className="col grow">
              <span style={{ fontWeight: 800, fontSize: 14 }}>{p.farmer}</span>
              <span className="tiny muted">Thanjavur, Tamil Nadu · Member since 2024</span>
            </div>
            {p.verified && <Chip><Icon n="shield" s={11} w={2.4} /> Verified</Chip>}
          </div>
        </div>
        <div className="card" style={{ padding: 4, marginTop: 12 }}>
          {[['Quality', p.quality], ['Harvest date', p.harvest], ['Distance', p.dist], ['Available', p.qty]].map(([l, v], i, arr) => (
            <div className="row between" key={l} style={{ padding: '11px 12px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span className="small muted" style={{ fontWeight: 600 }}>{l}</span>
              <span className="small" style={{ fontWeight: 800 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <AIInsightCard title="AI QUALITY SCORE" body="Grade A confidence 91% — grain moisture ~13.5%, uniform colour, low damage. Fair deal at ₹27–₹29/kg based on today's mandi rates." />
        </div>
      </div>
      <div style={{ position: 'sticky', bottom: 0, background: 'rgba(255,255,255,.97)', borderTop: '1px solid var(--line)', padding: '8px 12px calc(8px + env(safe-area-inset-bottom,0px))', display: 'flex', gap: 6, marginTop: 14 }}>
        <Btn sm variant="ghost" icon="chat" onClick={() => app.toast('Chat request sent to farmer')} style={{ padding: '0 8px', flex: '0 0 auto' }}>Contact</Btn>
        <Btn sm variant="outline" icon="cart" onClick={() => app.toast(`${p.title} added to cart 🛒`)} style={{ flex: 1 }}>Add to Cart</Btn>
        <Btn sm icon="chevR" onClick={buy} style={{ flex: 1 }}>Buy Now</Btn>
      </div>
    </div>
  );
}

/* ---------- 19 Negotiation ---------- */
export function Negotiation() {
  const app = useApp();
  const [thread, setThread] = useState(NEGOTIATION.thread);
  const [offer, setOffer] = useState('27');
  const [err, setErr] = useState('');
  const send = async () => {
    const v = parseFloat(offer);
    if (!v || v < 1) { setErr('Enter a valid offer price'); throw new Error('cancel'); }
    setErr('');
    await new Promise((r) => setTimeout(r, 500));
    setThread([...thread, { who: 'farmer', text: `I offer ₹${v}/kg for ${NEGOTIATION.product} (full load, pickup tomorrow).`, time: 'Now' }]);
    app.toast('Offer sent to farmer');
  };
  const accept = async () => {
    const ok = await app.confirm({ title: 'Accept ₹27/kg?', body: 'This locks the deal for 1,000 kg of Paddy (Samba). A procurement token and logistics request will be created automatically.', label: 'Accept Deal' });
    if (ok) { app.toast('Deal confirmed 🤝 Token generated'); app.go('token'); }
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Negotiation" sub={`${NEGOTIATION.product} · with Ramesh Kumar`} />
      <div className="row" style={{ gap: 8, padding: '12px 16px 0' }}>
        <div className="stat-tile"><div className="v" style={{ fontSize: 15 }}>₹{NEGOTIATION.farmerPrice}</div><div className="l">Farmer Price</div></div>
        <div className="stat-tile"><div className="v" style={{ fontSize: 15, color: 'var(--blue)' }}>₹{NEGOTIATION.buyerOffer}</div><div className="l">Buyer Offer</div></div>
        <div className="stat-tile"><div className="v" style={{ fontSize: 15, color: 'var(--brand-700)' }}>₹27</div><div className="l">Latest</div></div>
      </div>
      <div style={{ margin: '10px 16px 0' }}>
        <AIInsightCard title="AI NEGOTIATION TIP" body={`Recommended negotiation range: ₹${NEGOTIATION.aiRange[0]}–₹${NEGOTIATION.aiRange[1]}/kg. Farmer's cost of production is ~₹24/kg — offers below ₹26 are usually rejected.`} />
      </div>
      <SectionTitle>Offer Thread</SectionTitle>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {thread.map((t, i) => (
          <div key={i} className={`chat-bubble ${t.who === 'buyer' ? 'user' : 'bot'}`}>
            {t.text}
            <div className={t.who === 'buyer' ? 'tiny' : 'tiny muted'} style={{ opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{t.time}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 16px 0' }}>
        <Field label="Your offer (₹/kg)" error={err}>
          <div className="row" style={{ gap: 9 }}>
            <input className="input" inputMode="decimal" value={offer} onChange={(e) => setOffer(e.target.value)} />
            <Btn variant="primary" icon="rupee" onClick={send}>Make Offer</Btn>
          </div>
        </Field>
        <Btn block variant="ghost" icon="checkC" onClick={accept}>Accept Farmer's Latest (₹27/kg)</Btn>
      </div>
    </div>
  );
}

/* ---------- Checkout Flow (Product -> Quantity -> Address & Geolocation -> Logistics -> Payment -> Confirm) ---------- */
export function Checkout({ params }) {
  const app = useApp();
  const p = MARKETPLACE.find((x) => x.id === params?.productId) || MARKETPLACE[0];

  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(500);
  const [address, setAddress] = useState({
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    door: '4/12B',
    street: 'Main Road',
    village: 'Thanjavur',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    pincode: '613001',
    coords: '',
  });

  const [locLoading, setLocLoading] = useState(false);
  const [locMsg, setLocMsg] = useState('');
  const [transport, setTransport] = useState('tata_ace');
  const [payMethod, setPayMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const produceAmount = qty * p.price;
  const transportCosts = { tata_ace: 800, pickup: 1200, lorry: 2500 };
  const transportCost = transportCosts[transport] || 800;
  const serviceFee = 50;
  const totalAmount = produceAmount + transportCost + serviceFee;

  const getLocation = () => {
    setLocLoading(true);
    setLocMsg('');
    if (!navigator?.geolocation) {
      setLocLoading(false);
      setLocMsg('Geolocation is not supported by your browser.');
      app.toast('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const locStr = `Lat: ${lat}°, Lng: ${lng}° (Current GPS Location)`;
        setAddress((prev) => ({
          ...prev,
          coords: locStr,
          village: prev.village || 'Detected Village',
        }));
        setLocLoading(false);
        setLocMsg(`GPS location captured: ${lat}°, ${lng}°`);
        app.toast('Live location captured 📍');
      },
      (err) => {
        setLocLoading(false);
        const msg = err.code === 1
          ? 'Location permission denied. Please enter your address manually.'
          : 'Unable to retrieve location. Please enter manually.';
        setLocMsg(msg);
        app.toast(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1600));
    setProcessing(false);
    app.toast('Demo payment successful ✓');
    app.go('orderConfirm', {
      orderId: `AB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      product: p.title,
      qty: `${qty} kg`,
      price: p.price,
      total: totalAmount,
      seller: p.farmer,
      buyer: address.name,
      address: `${address.door}, ${address.street}, ${address.village}, ${address.district}, ${address.state} - ${address.pincode}`,
      pickup: `${p.farmer}, Thanjavur, Tamil Nadu`,
      paymentMethod: payMethod.toUpperCase(),
      transport,
    });
  };

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <MobileHeader
        title={step === 1 ? 'Checkout — Select Quantity' : step === 2 ? 'Checkout — Delivery Address' : step === 3 ? 'Checkout — Transport & Logistics' : 'Checkout — Demo Payment'}
        sub={`${p.title} · Step ${step} of 4`}
      />

      <div style={{ padding: '14px 16px 0' }}>
        {step === 1 && (
          <>
            <div className="card" style={{ padding: 12 }}>
              <div className="row">
                <img src={p.img} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                <div className="col grow">
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{p.title}</span>
                  <span className="tiny muted">{p.quality} · Seller: {p.farmer}</span>
                  <span className="price" style={{ marginTop: 4 }}>₹{p.price}/kg</span>
                </div>
              </div>
            </div>

            <SectionTitle>Select Required Quantity</SectionTitle>
            <div className="card" style={{ padding: 14 }}>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {[100, 250, 500, 1000].map((qVal) => (
                  <button
                    key={qVal}
                    className={`chip lg ${qty === qVal ? 'solid' : ''}`}
                    style={{ flex: 1, minWidth: 70, justifyContent: 'center', cursor: 'pointer', padding: '10px 0' }}
                    onClick={() => setQty(qVal)}
                  >
                    {qVal} kg
                  </button>
                ))}
              </div>
              <Field label="Custom Quantity (kg)" style={{ marginTop: 14 }}>
                <input
                  className="input"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                />
              </Field>
              <div className="row between" style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <span className="small muted" style={{ fontWeight: 700 }}>Produce Total ({qty} kg × ₹{p.price})</span>
                <span className="price" style={{ fontSize: 18 }}>₹{produceAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Btn block icon="chevR" onClick={() => setStep(2)}>Continue to Address</Btn>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="card" style={{ padding: 14 }}>
              <div className="row between" style={{ marginBottom: 10 }}>
                <b className="small">Delivery Address</b>
                <Btn xs variant="ghost" icon="pin" disabled={locLoading} onClick={getLocation}>
                  {locLoading ? 'Locating…' : 'Use Current Location'}
                </Btn>
              </div>

              {locMsg && (
                <div className="tiny" style={{ background: locMsg.includes('denied') || locMsg.includes('Unable') ? '#fee2e2' : '#e0f2fe', color: locMsg.includes('denied') || locMsg.includes('Unable') ? '#991b1b' : '#0369a1', padding: '8px 10px', borderRadius: 8, marginBottom: 12 }}>
                  {locMsg}
                </div>
              )}

              {address.coords && (
                <div className="tiny muted" style={{ marginBottom: 10, background: '#f1f5f9', padding: '6px 10px', borderRadius: 8 }}>
                  📍 {address.coords}
                </div>
              )}

              <div className="grid-2">
                <Field label="Full Name">
                  <input className="input" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                </Field>
                <Field label="Mobile Number">
                  <input className="input" value={address.mobile} onChange={(e) => setAddress({ ...address, mobile: e.target.value })} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="House / Door No.">
                  <input className="input" value={address.door} onChange={(e) => setAddress({ ...address, door: e.target.value })} />
                </Field>
                <Field label="Street / Landmark">
                  <input className="input" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="Village / Town">
                  <input className="input" value={address.village} onChange={(e) => setAddress({ ...address, village: e.target.value })} />
                </Field>
                <Field label="District">
                  <input className="input" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="State">
                  <input className="input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </Field>
                <Field label="PIN Code">
                  <input className="input" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
                </Field>
              </div>
            </div>

            <div className="row" style={{ gap: 10, marginTop: 16 }}>
              <Btn variant="light" onClick={() => setStep(1)}>Back</Btn>
              <Btn block icon="chevR" onClick={() => setStep(3)}>Proceed to Logistics</Btn>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card" style={{ padding: 14 }}>
              <b className="small">Transport & Pickup Details</b>
              <div className="col" style={{ gap: 6, marginTop: 8, fontSize: 13 }}>
                <div>📍 <b>Pickup:</b> {p.farmer}, Thanjavur, Tamil Nadu</div>
                <div>🚛 <b>Delivery:</b> {address.village}, {address.district}, {address.state}</div>
                <div>📏 <b>Estimated Distance:</b> ~24 km</div>
              </div>
            </div>

            <SectionTitle>Select Transport Option</SectionTitle>
            {[
              { id: 'tata_ace', title: 'Tata Ace (Small Load)', cost: 800, time: 'Same day delivery' },
              { id: 'pickup', title: 'Pickup Truck (Medium Load)', cost: 1200, time: '4–6 hours delivery' },
              { id: 'lorry', title: '10-Tonne Lorry (Bulk Load)', cost: 2500, time: 'Next morning delivery' },
            ].map((t) => (
              <div
                key={t.id}
                className="card"
                style={{
                  marginBottom: 10,
                  padding: 12,
                  cursor: 'pointer',
                  border: transport === t.id ? '2px solid var(--brand-600)' : '1px solid var(--line)',
                }}
                onClick={() => setTransport(t.id)}
              >
                <div className="row between">
                  <div className="col">
                    <span style={{ fontWeight: 800 }}>{t.title}</span>
                    <span className="tiny muted">{t.time}</span>
                  </div>
                  <span className="price">₹{t.cost}</span>
                </div>
              </div>
            ))}

            <div className="row" style={{ gap: 10, marginTop: 16 }}>
              <Btn variant="light" onClick={() => setStep(2)}>Back</Btn>
              <Btn block icon="chevR" onClick={() => setStep(4)}>Proceed to Payment</Btn>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="card" style={{ padding: 14 }}>
              <div className="row between">
                <b className="small">Order Summary</b>
                <span className="chip gray" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                  Demo Payment
                </span>
              </div>
              <div className="col" style={{ gap: 6, marginTop: 10, fontSize: 13 }}>
                <div className="row between"><span>Produce Amount ({qty} kg)</span><span>₹{produceAmount.toLocaleString('en-IN')}</span></div>
                <div className="row between"><span>Transport Charges</span><span>₹{transportCost}</span></div>
                <div className="row between"><span>Platform Service Fee</span><span>₹{serviceFee}</span></div>
                <div className="row between" style={{ borderTop: '1px solid var(--line)', paddingTop: 8, fontWeight: 900, fontSize: 16 }}>
                  <span>Total Amount</span>
                  <span className="price" style={{ fontSize: 18 }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <SectionTitle>Payment Options</SectionTitle>
            {[
              { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', sub: 'Instant payment via UPI ID' },
              { id: 'card', label: 'Debit / Credit Card', sub: 'Visa, MasterCard, RuPay' },
              { id: 'netbanking', label: 'Net Banking', sub: 'All major Indian banks' },
              { id: 'cod', label: 'Cash / Pay on Delivery', sub: 'Pay upon produce arrival' },
            ].map((m) => (
              <div
                key={m.id}
                className="card"
                style={{
                  marginBottom: 10,
                  padding: 12,
                  cursor: 'pointer',
                  border: payMethod === m.id ? '2px solid var(--brand-600)' : '1px solid var(--line)',
                }}
                onClick={() => setPayMethod(m.id)}
              >
                <div className="row">
                  <div className="col grow">
                    <span style={{ fontWeight: 800 }}>{m.label}</span>
                    <span className="tiny muted">{m.sub}</span>
                  </div>
                  {payMethod === m.id && <Icon n="check" s={18} w={2.5} />}
                </div>
              </div>
            ))}

            <div className="row" style={{ gap: 10, marginTop: 16 }}>
              <Btn variant="light" onClick={() => setStep(3)}>Back</Btn>
              <Btn block icon="check" disabled={processing} onClick={handlePayment}>
                {processing ? 'Processing Payment…' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Order Confirmation Screen ---------- */
export function OrderConfirmation({ params }) {
  const app = useApp();
  const o = params || {};

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <MobileHeader title="Order Confirmed" sub="Thank you for your order" back={false} />

      <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <Icon n="checkC" s={34} w={2.4} />
        </div>
        <div className="h1" style={{ color: 'var(--brand-800)' }}>✓ ORDER CONFIRMED</div>
        <div className="tiny muted" style={{ marginTop: 4 }}>Order ID: {o.orderId || 'AB-ORD-9842'} · Demo Order</div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 14 }}>
          <b className="small">Order Details</b>
          <div className="col" style={{ gap: 6, marginTop: 8, fontSize: 13 }}>
            <div className="row between"><span>Product</span><b>{o.product || 'Paddy (Samba)'}</b></div>
            <div className="row between"><span>Quantity</span><b>{o.qty || '500 kg'}</b></div>
            <div className="row between"><span>Seller</span><b>{o.seller || 'Ramesh Kumar'}</b></div>
            <div className="row between"><span>Total Amount</span><b className="price">₹{o.total?.toLocaleString?.('en-IN') || '14,850'}</b></div>
            <div className="row between"><span>Payment Status</span><Chip solid>Paid (Demo)</Chip></div>
            <div className="row between"><span>Delivery Status</span><Chip tone="amber">In Progress</Chip></div>
          </div>
        </div>

        <div className="card" style={{ padding: 14, marginTop: 10 }}>
          <b className="small">Delivery & Pickup Address</b>
          <div className="col muted" style={{ gap: 4, marginTop: 6, fontSize: 12.5 }}>
            <div>📍 <b>Pickup:</b> {o.pickup || 'Thanjavur, Tamil Nadu'}</div>
            <div>🏠 <b>Delivery:</b> {o.address || 'Main Road, Thanjavur, Tamil Nadu'}</div>
          </div>
        </div>

        <div className="row" style={{ gap: 10, marginTop: 16 }}>
          <Btn block variant="primary" icon="truck" onClick={() => app.go('tracking', { orderId: o.orderId })}>
            Track Order
          </Btn>
          <Btn block variant="ghost" icon="home" onClick={() => app.setTab('home')}>
            Go to Home
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- Live / Demo Order Tracking Screen ---------- */
export function OrderTracking({ params }) {
  const app = useApp();
  const orderId = params?.orderId || 'AB-ORD-9842';

  const steps = [
    { title: 'Order Placed', time: 'Today, 10:15 AM', done: true },
    { title: 'Payment Confirmed', time: 'Today, 10:16 AM', done: true },
    { title: 'Seller Confirmed', time: 'Today, 10:30 AM', done: true },
    { title: 'Produce Packed & Ready', time: 'Today, 11:45 AM', done: true },
    { title: 'Driver Dispatched for Pickup', time: 'Today, 12:10 PM', active: true },
    { title: 'In Transit to Delivery Address', time: 'Estimated 02:30 PM', pending: true },
    { title: 'Delivered to Buyer', time: 'Estimated 04:00 PM', pending: true },
  ];

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <MobileHeader title="Live Order Tracking" sub={`Order ID: ${orderId} · Demo Tracking`} />

      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="row between">
            <span style={{ fontWeight: 800 }}>Status: In Transit</span>
            <Chip tone="amber">Demo Tracking</Chip>
          </div>
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>ETA: ~2 hours · Driver: Sridhar V (Tata Ace)</p>
        </div>

        <SectionTitle>Tracking History</SectionTitle>
        <div className="card" style={{ margin: '0', padding: 14 }}>
          <div className="col" style={{ gap: 14 }}>
            {steps.map((s, idx) => (
              <div className="row" key={idx} style={{ gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: s.done ? '#15803d' : s.active ? '#3b82f6' : '#e2e8e1',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    flex: 'none',
                  }}
                >
                  {s.done ? '✓' : idx + 1}
                </div>
                <div className="col grow">
                  <span style={{ fontWeight: s.active ? 800 : 700, fontSize: 13.5, color: s.pending ? 'var(--muted)' : 'var(--ink)' }}>
                    {s.title}
                  </span>
                  <span className="tiny muted">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Btn block variant="light" icon="home" onClick={() => app.setTab('home')}>Back to Home</Btn>
        </div>
      </div>
    </div>
  );
}
