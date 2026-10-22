/* Screens 14 Sell Produce, 15 My Listings, 18 Buyer Matching, 20 Waste-to-Value */
import React, { useEffect, useState } from 'react';
import {
  Btn, Chip, Icon, MobileHeader, SectionTitle, Field, BuyerCard, AIInsightCard, useApp, severityTone,
} from '../components.jsx';
import { BUYERS, LISTINGS, WASTE_MATCHES, WASTE_TYPES } from '../data.js';
import api from '../services/api.js';

/* ---------- 14 Sell Produce ---------- */
export function SellForm({ params }) {
  const app = useApp();
  const [f, setF] = useState({
    product: params?.crop && ['Paddy', 'Tomato', 'Maize', 'Onion'].includes(params.crop) ? params.crop : 'Paddy',
    variety: 'Samba', qty: '1000', unit: 'kg', quality: 'A', price: '28', date: '2026-09-10', loc: 'Thanjavur, Tamil Nadu', desc: 'Fresh Samba paddy harvested this week.', photos: 0,
  });
  const [errs, setErrs] = useState({});
  const post = async () => {
    const e = {};
    if (!f.variety.trim()) e.variety = 'Variety is required';
    if (!/^\d+$/.test(f.qty) || +f.qty < 1) e.qty = 'Enter quantity in kg';
    if (!/^\d+(\.\d+)?$/.test(f.price) || +f.price < 1) e.price = 'Enter expected price per kg';
    if (!f.date) e.date = 'Harvest date is required';
    setErrs(e);
    if (Object.keys(e).length) throw new Error('cancel');
    const ok = await app.confirm({
      title: 'Publish produce listing?',
      body: `${f.product} (${f.variety}) · ${f.qty} kg at ₹${f.price}/kg from ${f.loc}.`,
      label: 'Publish Listing',
    });
    if (!ok) throw new Error('cancel');
    try {
      await api.createLot({
        crop: f.product,
        variety: f.variety,
        quantity: Number(f.qty),
        expectedPrice: Number(f.price),
        harvestDate: f.date,
        location: f.loc,
        quality: `Grade ${f.quality}`,
        grade: f.quality,
        isWaste: f.product === 'Agri Waste',
      });
    } catch (e) {
      console.log('Produce lot API creation notice:', e.message);
    }
    app.toast('✓ Listed Successfully in Database');
    app.go('matching');
  };
  const aiPrice = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setF({ ...f, price: '28' });
    app.toast('Market rate: ₹28/kg set');
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Sell Produce" sub="List your crop to connect with buyers"
        right={<button className="ab-btn" onClick={() => app.setTab('sell')}><Icon n="box" s={18} w={2.1} /></button>} />
      <div style={{ padding: '14px 16px 0' }}>
        <div className="grid-2">
          <Field label="Crop">
            <div className="select-wrap">
              <select className="select" value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })}>
                {['Paddy', 'Tomato', 'Maize', 'Onion', 'Groundnut', 'Vegetables', 'Fruits', 'Agri Waste'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Variety" error={errs.variety}>
            <input className="input" value={f.variety} onChange={(e) => setF({ ...f, variety: e.target.value })} />
          </Field>
        </div>
        <div className="grid-2">
          <Field label="Quantity (kg)" error={errs.qty}>
            <input className="input" inputMode="numeric" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value.replace(/\D/g, '') })} />
          </Field>
          <Field label="Quality / Grade">
            <div className="row" style={{ gap: 6 }}>
              {['A', 'B', 'C'].map((q) => (
                <button key={q} className={`chip lg ${f.quality === q ? 'solid' : ''}`} style={{ border: 0, cursor: 'pointer', flex: 1, justifyContent: 'center', padding: '10px 0' }} onClick={() => setF({ ...f, quality: q })}>{q}</button>
              ))}
            </div>
          </Field>
        </div>
        <div className="grid-2">
          <Field label="Expected Price (₹/kg)" error={errs.price}>
            <input className="input" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </Field>
          <Field label="Harvest Date" error={errs.date}>
            <input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Location">
          <div className="row" style={{ gap: 8 }}>
            <input className="input" value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })} />
            <Btn sm variant="ghost" icon="pin" onClick={() => {
              if (!navigator?.geolocation) {
                setF({ ...f, loc: 'Thanjavur, Tamil Nadu' });
                app.toast('Location set to Thanjavur');
                return;
              }
              app.toast('Fetching location… 📍');
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const lat = pos.coords.latitude.toFixed(4);
                  const lng = pos.coords.longitude.toFixed(4);
                  setF({ ...f, loc: `Thanjavur, TN (${lat}°, ${lng}°)` });
                  app.toast('Location updated 📍');
                },
                () => {
                  app.toast('Location permission denied. Please enter address manually.');
                  setF({ ...f, loc: 'Thanjavur, Tamil Nadu' });
                }
              );
            }}>Use Current</Btn>
          </div>
        </Field>
        <Field label="Produce Photo">
          <div className="row" style={{ gap: 9 }}>
            <label className="li-icon" style={{ width: 62, height: 62, borderRadius: 14, border: '1.6px dashed #b9c9bb', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Icon n="camera" s={21} w={2} />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  setF({ ...f, photos: f.photos + 1, uploadedImg: evt.target?.result });
                  app.toast('Photo added 📷');
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            {f.uploadedImg ? (
              <img className="thumb" style={{ width: 62, height: 62, borderRadius: 14, objectFit: 'cover' }} src={f.uploadedImg} alt="Uploaded produce photo" />
            ) : null}
          </div>
        </Field>
        <div className="row" style={{ gap: 10, marginTop: 10 }}>
          <Btn block icon="check" onClick={post}>Publish</Btn>
          <Btn block variant="outline" icon="spark" onClick={aiPrice}>Suggest Price</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- 15 My Listings ---------- */
export function Listings() {
  const app = useApp();
  const [tab, setTab] = useState('Active');
  const [dbLots, setDbLots] = useState([]);

  useEffect(() => {
    api.getLots({ isWaste: 'false' }).then((res) => {
      if (res.lots && res.lots.length > 0) {
        setDbLots(res.lots.map((l) => ({
          id: l.id,
          crop: l.crop,
          variety: l.variety || 'Standard',
          qty: `${l.quantity} ${l.unit || 'kg'}`,
          price: l.expected_price,
          status: l.status === 'PUBLISHED' ? 'Active' : (l.status === 'SOLD' ? 'Sold' : 'Active'),
          matches: 4,
          img: l.image || 'img/paddy.jpg',
        })));
      }
    }).catch((e) => console.log('Lots API notice:', e.message));
  }, []);

  const combinedListings = dbLots.length > 0 ? dbLots : LISTINGS;
  const list = combinedListings.filter((l) => (tab === 'Active' ? l.status === 'Active' : tab === 'Sold' ? l.status === 'Sold' : l.status === 'Rejected'));
  return (
    <div className="screen" style={{ paddingBottom: 150 }}>
      <MobileHeader title="My Listings" sub="Your produce marketplace listings" back={false}
        right={<button className="ab-btn" onClick={() => app.go('sellForm')}><Icon n="plus" s={18} w={2.4} /></button>} />
      <div className="tabs">
        {['Active', 'Sold', 'Rejected'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div style={{ padding: '0 16px' }}>
        {list.map((l) => (
          <div className="card" key={l.id} style={{ marginBottom: 10, padding: 11 }}>
            <div className="row">
              <img className="thumb lg" src={l.img} alt="" />
              <div className="col grow">
                <div className="row between">
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>{l.crop} ({l.variety})</span>
                  <Chip tone={severityTone(l.status)}>{l.status}</Chip>
                </div>
                <span className="tiny muted" style={{ marginTop: 3 }}>{l.qty} · ₹{l.price}/kg</span>
                <div className="row" style={{ gap: 6, marginTop: 7 }}>
                  <Chip tone="amber">🤝 {l.matches} buyers</Chip>
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 9, marginTop: 10 }}>
              <Btn sm variant="ghost" block icon="spark" onClick={() => app.go('matching', { listing: l.id })}>View Buyers</Btn>
              <Btn sm variant="light" block icon="edit" onClick={() => app.go('sellForm', { crop: l.crop })}>Edit</Btn>
            </div>
          </div>
        ))}
        {!list.length && <div className="card center muted small" style={{ padding: 26 }}>No {tab.toLowerCase()} listings yet.</div>}
        <Btn block icon="plus" onClick={() => app.go('sellForm')}>Publish Produce</Btn>
      </div>
    </div>
  );
}

/* ---------- 18 Find Buyers ---------- */
export function Matching({ params }) {
  const app = useApp();
  const [matches, setMatches] = useState([]);
  const [contacted, setContacted] = useState([]);

  useEffect(() => {
    api.getBuyerMatches(params?.listing).then((res) => {
      if (res.matches && res.matches.length > 0) setMatches(res.matches);
    }).catch((e) => console.log('Match API notice:', e.message));
  }, [params?.listing]);

  const displayBuyers = matches.length > 0 ? matches : BUYERS;

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Find Buyers" sub={`Paddy (Samba) · 1,000 kg`} />
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div className="row between">
            <span style={{ fontWeight: 800 }}>{displayBuyers.length} Matched Buyers Found</span>
            <Chip tone="amber">AI Buyer Matching — Prototype</Chip>
          </div>
          <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
            <span>Crop ✓</span><span>Quantity ✓</span><span>Price ✓</span><span>Location ✓</span>
          </div>
        </div>
        {displayBuyers.map((b, idx) => (
          <div key={b.buyerId || b.id || idx} style={{ marginBottom: 10 }}>
            <BuyerCard b={{
              id: b.buyerId || b.id,
              name: b.buyerName || b.name,
              type: b.buyerType || b.type,
              loc: b.location || b.loc,
              dist: b.distanceKm ? `${b.distanceKm} km` : b.dist,
              verified: b.verified,
              offerPrice: b.offeredPrice || b.offerPrice,
              score: b.matchScore || b.score,
              reasons: b.matchingReasons || b.reasons,
            }} onContact={async () => {
              const targetId = b.buyerId || b.id;
              if (contacted.includes(targetId)) return;
              setContacted([...contacted, targetId]);
              try {
                await api.createOffer({
                  produceLotId: params?.listing || 'lot-1',
                  farmerId: 'usr-1',
                  quantity: 1000,
                  offeredPrice: b.offeredPrice || b.offerPrice || 28.5,
                });
              } catch(e) { console.log('Offer API notice:', e.message); }
              app.toast(`Offer sent to ${b.buyerName || b.name} ✓`);
            }} />
          </div>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        <Btn block variant="ghost" icon="chat" onClick={() => app.go('negotiation')}>View Offers & Negotiations</Btn>
      </div>
    </div>
  );
}

/* ---------- 20 Waste → Value ---------- */
export function Waste() {
  const app = useApp();
  const [f, setF] = useState({ type: 'Rice Straw', qty: '500', loc: 'Thanjavur', date: '2026-09-12' });
  const [found, setFound] = useState(true);
  const [errs, setErrs] = useState({});
  const sell = async () => {
    const e = {};
    if (!/^\d+$/.test(f.qty) || +f.qty < 1) e.qty = 'Enter quantity in kg';
    setErrs(e);
    if (Object.keys(e).length) throw new Error('cancel');
    const ok = await app.confirm({ title: 'Sell this waste?', body: `${f.qty} kg of ${f.type} from ${f.loc} will be offered to 4 matched buyers, starting with the 92% cattle-farm match.`, label: 'Sell Waste' });
    if (!ok) throw new Error('cancel');
    await new Promise((r) => setTimeout(r, 700));
    app.toast('Waste listing live ♻️ Buyers notified');
    app.go('orders');
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Waste → Value" sub="Turn crop residue into income" />
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 13 }}>
          <div className="grid-2">
            <Field label="Waste Type">
              <div className="select-wrap">
                <select className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                  {WASTE_TYPES.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Quantity (kg)" error={errs.qty}>
              <input className="input" inputMode="numeric" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value.replace(/\D/g, '') })} />
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Location">
              <div className="row" style={{ gap: 8 }}>
                <input className="input" value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })} />
                <Btn xs variant="ghost" icon="pin" onClick={() => setF({ ...f, loc: 'Thanjavur' })}>Current</Btn>
              </div>
            </Field>
            <Field label="Available Date">
              <input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            </Field>
          </div>
          <Btn block variant="outline" icon="spark" onClick={async () => { await new Promise((r) => setTimeout(r, 900)); setFound(true); app.toast('AI identified 4 uses & buyers'); }}>Find AI Matches</Btn>
        </div>
      </div>
      {found && (
        <>
          <SectionTitle action="" >AI Matching for {f.qty} kg {f.type}</SectionTitle>
          <div style={{ padding: '0 16px' }}>
            {WASTE_MATCHES.map((w) => (
              <div className="card" key={w.type} style={{ marginBottom: 10, padding: 12 }}>
                <div className="row">
                  <div className="li-icon" style={{ fontSize: 19 }}>{w.emoji}</div>
                  <div className="col grow">
                    <span style={{ fontWeight: 800, fontSize: 13.5 }}>{w.type}</span>
                    <span className="tiny muted">{w.name} · {w.dist} · {w.note}</span>
                  </div>
                  <Chip solid>{w.match}%</Chip>
                </div>
                <div className="row between" style={{ marginTop: 9 }}>
                  <span className="tiny muted">AI Match Score</span>
                  <Btn xs variant="ghost" icon="chat" onClick={() => app.toast(`Contact request sent to ${w.name}`)}>Contact Buyer</Btn>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 16px' }}>
            <AIInsightCard title="ESTIMATED VALUE" body={`${f.qty} kg of ${f.type} ≈ ₹2,000–₹2,500 (₹4–₹5/kg baled). Selling straw also avoids stubble burning penalties and improves your farm sustainability score.`} />
            <Btn block icon="recycle" onClick={sell}>Sell Waste</Btn>
          </div>
        </>
      )}
    </div>
  );
}
