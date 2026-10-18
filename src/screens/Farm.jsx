/* Screens 06 Farm, 07 Crop Details, 08 AI Scanner, 09 AI Diagnosis, 10 Health History */
import React, { useEffect, useRef, useState } from 'react';
import {
  Btn, Chip, Icon, MobileHeader, SectionTitle, CropCard, DiseaseResultCard, Sheet, Field,
  useApp, severityTone,
} from '../components.jsx';
import { CROPS, DIAGNOSIS, FARM, HEALTH_HISTORY } from '../data.js';
import { api } from '../services/api.js';

/* ---------- 06 My Farm ---------- */
/* ---------- 06 My Farm (Farmer's Produce Marketplace & Dashboard) ---------- */
export function Farm() {
  const app = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('newest');
  const [favs, setFavs] = useState({});
  const [sheet, setSheet] = useState(false);

  const [produceList, setProduceList] = useState([
    { id: 'P1', name: 'Paddy — Samba', price: 28, origPrice: 34, qty: '1,000 kg', quality: 'Premium Grade', loc: 'Thanjavur, TN', status: 'Available', img: 'img/paddy.jpg', farmer: 'Ramesh Kumar', verified: true, harvest: '05 Sep 2026', matches: 4 },
    { id: 'P2', name: 'Tomato — Hybrid', price: 32, origPrice: 38, qty: '500 kg', quality: 'Grade A', loc: 'Thanjavur, TN', status: 'Available', img: 'img/tomato.jpg', farmer: 'Ramesh Kumar', verified: true, harvest: '06 Sep 2026', matches: 2 },
    { id: 'P3', name: 'Maize — CO-6', price: 24, origPrice: 28, qty: '2,000 kg', quality: 'Premium Grade', loc: 'Thanjavur, TN', status: 'Available', img: 'img/maize.jpg', farmer: 'Ramesh Kumar', verified: true, harvest: '03 Sep 2026', matches: 3 },
    { id: 'P4', name: 'Onion — CO-3', price: 39, origPrice: 45, qty: '750 kg', quality: 'Grade A', loc: 'Thanjavur, TN', status: 'Available', img: 'img/onion.jpg', farmer: 'Ramesh Kumar', verified: true, harvest: '01 Sep 2026', matches: 5 },
    { id: 'P5', name: 'Potato — Fresh', price: 30, origPrice: 35, qty: '1,200 kg', quality: 'Grade A', loc: 'Thanjavur, TN', status: 'Available', img: 'img/basket.jpg', farmer: 'Ramesh Kumar', verified: true, harvest: '28 Aug 2026', matches: 1 },
    { id: 'P6', name: 'Rice Straw (Waste)', price: 4, origPrice: 6, qty: '500 kg', quality: 'Dry Baled', loc: 'Thanjavur, TN', status: 'Available', img: 'img/straw.jpg', farmer: 'Ramesh Kumar', verified: true, harvest: '25 Aug 2026', matches: 4 },
  ]);

  const [newForm, setNewForm] = useState({
    crop: 'Paddy',
    variety: 'Samba',
    qty: '1000',
    quality: 'Premium Grade',
    harvest: '2026-09-10',
    price: '28',
    loc: 'Thanjavur, Tamil Nadu',
    uploadedImg: null,
  });

  const categories = ['All', 'Paddy', 'Rice', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Agri Waste'];

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavs((prev) => ({ ...prev, [id]: !prev[id] }));
    app.toast(favs[id] ? 'Removed from favourites' : 'Added to favourites ♡');
  };

  const publishProduce = async () => {
    if (!newForm.variety || !newForm.qty || !newForm.price) {
      app.toast('Please fill in crop details');
      return;
    }
    await new Promise((r) => setTimeout(r, 600));
    const newItem = {
      id: `P-${Date.now()}`,
      name: `${newForm.crop} — ${newForm.variety}`,
      price: parseFloat(newForm.price) || 25,
      origPrice: Math.round((parseFloat(newForm.price) || 25) * 1.2),
      qty: `${newForm.qty} kg`,
      quality: newForm.quality,
      loc: 'Thanjavur, TN',
      status: 'Available',
      img: newForm.uploadedImg || `img/${newForm.crop.toLowerCase()}.jpg`,
      farmer: 'Ramesh Kumar',
      verified: true,
      harvest: newForm.harvest,
      matches: 3,
    };
    setProduceList([newItem, ...produceList]);
    setSheet(false);
    app.toast('✓ Produce Listed Successfully! AI matching buyers…');
  };

  const filtered = produceList
    .filter((p) => (cat === 'All' || p.name.toLowerCase().includes(cat.toLowerCase()) || (cat === 'Agri Waste' && p.name.includes('Straw'))) &&
      p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'interest') return b.matches - a.matches;
      return 0;
    });

  return (
    <div className="screen" style={{ paddingBottom: 150 }}>
      <MobileHeader
        title="My Farm"
        sub="My Produce Market"
        right={
          <button className="ab-btn" onClick={() => setSheet(true)} title="List New Produce">
            <Icon n="plus" s={19} w={2.4} />
          </button>
        }
      />

      {/* Top Dashboard Statistics */}
      <div style={{ padding: '12px 16px 0' }}>
        <div className="card tinted" style={{ padding: 12 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="small" style={{ fontWeight: 800 }}>Farmer Dashboard</span>
            <Chip solid>Verified Farmer</Chip>
          </div>
          <div className="grid-2" style={{ gap: 8 }}>
            <div className="stat-tile" style={{ background: '#fff' }}>
              <div className="v" style={{ color: 'var(--brand-700)', fontSize: 18 }}>{produceList.length}</div>
              <div className="l">Active Listings</div>
            </div>
            <div className="stat-tile" style={{ background: '#fff' }}>
              <div className="v" style={{ color: 'var(--brand-600)', fontSize: 18 }}>5,950 kg</div>
              <div className="l">Total Produce</div>
            </div>
            <div className="stat-tile" style={{ background: '#fff' }}>
              <div className="v" style={{ color: 'var(--blue)', fontSize: 18 }}>18</div>
              <div className="l">Buyer Interest</div>
            </div>
            <div className="stat-tile" style={{ background: '#fff' }}>
              <div className="v" style={{ color: 'var(--amber)', fontSize: 18 }}>6</div>
              <div className="l">Offers Received</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sell Your Produce Prominent Button */}
      <div style={{ padding: '12px 16px 0' }}>
        <Btn block icon="plus" variant="primary" onClick={() => setSheet(true)}>
          + SELL YOUR PRODUCE
        </Btn>
      </div>

      {/* Search & Categories */}
      <div style={{ padding: '12px 16px 0' }}>
        <div className="row" style={{ background: '#fff', borderRadius: 13, padding: '3px 3px 3px 13px', border: '1px solid var(--line)' }}>
          <Icon n="search" s={17} w={2.1} />
          <input
            className="input"
            style={{ border: 0, boxShadow: 'none' }}
            placeholder="Search produce..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="hscroll" style={{ paddingTop: 10 }}>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip lg ${cat === c ? 'solid' : ''}`}
            style={{ border: 0, cursor: 'pointer', padding: '7px 13px' }}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort Bar */}
      <div className="row between pad" style={{ marginTop: 10 }}>
        <span className="tiny muted">{filtered.length} items available</span>
        <div className="row" style={{ gap: 6 }}>
          <span className="tiny muted">Sort:</span>
          <select
            className="select"
            style={{ padding: '4px 8px', fontSize: 12, height: 'auto', borderRadius: 8 }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
            <option value="interest">Most Buyer Interest</option>
          </select>
        </div>
      </div>

      {/* 2-Column Product Grid (Matching Reference Screenshot Visuals) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          padding: '12px 16px 0',
        }}
      >
        {filtered.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => app.go('checkout', { productId: p.id })}
          >
            <div style={{ position: 'relative', width: '100%', height: 135, background: '#f8faf8' }}>
              <img
                src={p.img}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => (e.target.src = 'img/paddy.jpg')}
              />
              <button
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)',
                  border: 0,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  fontSize: 14,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  color: favs[p.id] ? '#ef4444' : '#64748b',
                }}
                onClick={(e) => toggleFav(p.id, e)}
              >
                {favs[p.id] ? '♥' : '♡'}
              </button>
              {p.matches && (
                <span
                  className="chip"
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    left: 6,
                    fontSize: 10,
                    padding: '2px 6px',
                    background: 'rgba(6,42,27,0.85)',
                    color: '#fff',
                    borderRadius: 6,
                  }}
                >
                  🤝 {p.matches} AI Matches
                </span>
              )}
            </div>

            <div style={{ padding: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.3 }}>{p.name}</div>
                <div className="tiny muted" style={{ marginTop: 2 }}>{p.quality}</div>
                <div className="row" style={{ gap: 6, marginTop: 4, alignItems: 'baseline' }}>
                  <span className="price" style={{ fontSize: 15 }}>₹{p.price}/kg</span>
                  {p.origPrice && <span className="tiny muted" style={{ textDecoration: 'line-through' }}>₹{p.origPrice}</span>}
                </div>
                <div className="tiny" style={{ color: 'var(--brand-700)', fontWeight: 700, marginTop: 2 }}>
                  {p.qty} available
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <Btn xs block variant="primary">
                  VIEW / BUY
                </Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Sheet for Sell Your Produce */}
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Sell Your Produce (List Produce)">
        <div className="col" style={{ gap: 10 }}>
          <Field label="Step 1: Select Crop">
            <div className="select-wrap">
              <select className="select" value={newForm.crop} onChange={(e) => setNewForm({ ...newForm, crop: e.target.value })}>
                {['Paddy', 'Tomato', 'Maize', 'Onion', 'Potato', 'Carrot', 'Green Peas', 'Ginger', 'Agri Waste'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </Field>

          <Field label="Step 2: Upload Produce Photo">
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => setNewForm({ ...newForm, uploadedImg: evt.target?.result });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Field>

          <div className="grid-2">
            <Field label="Step 3: Variety">
              <input className="input" value={newForm.variety} onChange={(e) => setNewForm({ ...newForm, variety: e.target.value })} />
            </Field>
            <Field label="Step 4: Quantity (kg)">
              <input className="input" type="number" value={newForm.qty} onChange={(e) => setNewForm({ ...newForm, qty: e.target.value })} />
            </Field>
          </div>

          <div className="grid-2">
            <Field label="Step 5: Quality / Grade">
              <div className="select-wrap">
                <select className="select" value={newForm.quality} onChange={(e) => setNewForm({ ...newForm, quality: e.target.value })}>
                  {['Premium Grade', 'Grade A', 'Grade B', 'Standard'].map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Step 6: Expected Price (₹/kg)">
              <input className="input" type="number" value={newForm.price} onChange={(e) => setNewForm({ ...newForm, price: e.target.value })} />
            </Field>
          </div>

          <Field label="Step 7: Harvest Date & Location">
            <div className="grid-2">
              <input className="input" type="date" value={newForm.harvest} onChange={(e) => setNewForm({ ...newForm, harvest: e.target.value })} />
              <input className="input" value={newForm.loc} onChange={(e) => setNewForm({ ...newForm, loc: e.target.value })} />
            </div>
          </Field>

          <Btn block icon="check" onClick={publishProduce}>
            Step 8: Publish Produce
          </Btn>
        </div>
      </Sheet>
    </div>
  );
}

/* ---------- 07 Crop Details ---------- */
export function CropDetails({ params }) {
  const app = useApp();
  const crop = CROPS.find((c) => c.id === params?.id) || CROPS[0];
  const rows = [
    ['Growth Stage', crop.stage, '🌿'],
    ['Health Status', crop.health, '💚'],
    ['Last Scan', crop.lastScan, '📷'],
    ['Expected Harvest', crop.harvest, '🗓'],
    ['Estimated Yield', crop.yieldEst, '⚖️'],
    ['Area', crop.area, '📐'],
  ];
  const remove = async () => {
    const ok = await app.confirm({ title: 'Delete crop?', body: `${crop.name} (${crop.variety}) and its scan history will be removed from this farm profile.`, label: 'Delete', danger: true });
    if (ok) { app.toast('Crop removed'); app.back(); }
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <div className="hero-img" style={{ height: 210 }}>
        <img src={crop.img} alt={crop.name} />
        <div className="ov" style={{ background: 'linear-gradient(180deg, rgba(6,42,27,.65), transparent 45%, rgba(6,42,27,.55))' }} />
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="ab-btn" onClick={app.back}><Icon n="back" s={19} w={2.4} /></button>
          <div className="grow" />
          <button className="ab-btn" onClick={remove}><Icon n="dots" s={18} w={3} /></button>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 16, color: '#fff' }}>
          <div style={{ fontSize: 21, fontWeight: 800 }}>{crop.name} <span style={{ opacity: 0.8, fontSize: 14 }}>({crop.variety})</span></div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            <Chip tone={crop.health === 'Healthy' ? '' : 'amber'} solid={crop.health === 'Healthy'}>{crop.health}</Chip>
            <Chip className="" tone="">{crop.stage}</Chip>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 4 }}>
          {rows.map(([l, v, e], i) => (
            <div className="row between" key={l} style={{ padding: '11px 12px', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span className="small" style={{ fontWeight: 600, color: 'var(--muted)' }}>{e} {l}</span>
              <span className="small" style={{ fontWeight: 800 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 10, marginTop: 14 }}>
          <Btn block icon="scan" onClick={() => app.go('scanner', { crop: crop.name })}>Scan Crop</Btn>
          <Btn block variant="ghost" icon="history" onClick={() => app.go('history')}>Health History</Btn>
        </div>
        <div style={{ marginTop: 10, width: '100%' }}>
          <Btn block variant="light" icon="chart" onClick={() => app.setTab('market')}>
            Market Price for {crop.name}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- 08 AI Disease Scanner (Real Camera & File Upload) ---------- */
export function Scanner({ params }) {
  const app = useApp();
  const [crop, setCrop] = useState(params?.crop || 'Tomato');
  const [capturedImg, setCapturedImg] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraErr, setCameraErr] = useState('');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const options = ['Auto Detect', 'Paddy', 'Tomato', 'Maize', 'Onion', 'Groundnut'];

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const openCamera = async (mode = facingMode) => {
    setCameraErr('');
    setCameraLoading(true);
    setCapturedImg(null);
    stopCamera();

    const hasMediaDevices = !!(navigator && navigator.mediaDevices);
    const hasGetUserMedia = !!(hasMediaDevices && navigator.mediaDevices.getUserMedia);
    console.log('[Camera Debug] camera API available:', hasMediaDevices);
    console.log('[Camera Debug] getUserMedia available:', hasGetUserMedia);

    if (!hasMediaDevices || !hasGetUserMedia) {
      setCameraLoading(false);
      setCameraActive(false);
      const isHttpNonLocal = typeof window !== 'undefined' && location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
      const errMsg = isHttpNonLocal
        ? 'Camera access requires HTTPS or localhost.'
        : 'Camera API is unavailable in this browser.';
      setCameraErr(errMsg);
      if (app?.toast) app.toast(errMsg);
      return;
    }

    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        console.log('[Camera Debug] camera devices found:', videoDevices.length);
        if (devices.length > 0 && videoDevices.length === 0) {
          setCameraLoading(false);
          setCameraActive(false);
          const noCamMsg = 'No camera was found on this device.';
          setCameraErr(noCamMsg);
          if (app?.toast) app.toast(noCamMsg);
          return;
        }
      }
    } catch (e) {
      console.warn('[Camera Debug] device enumeration warning:', e.message);
    }

    let stream = null;
    let lastErr = null;

    try {
      console.log(`[Camera Debug] Requesting getUserMedia with facingMode: { ideal: "${mode}" }`);
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      lastErr = err1;
      console.warn('[Camera Debug] Preferred facingMode failed, retrying with generic video constraint:', err1.name, err1.message);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err2) {
        lastErr = err2;
        console.error('[Camera Debug] Generic getUserMedia failed:', err2.name, err2.message);
      }
    }

    if (!stream) {
      setCameraLoading(false);
      setCameraActive(false);

      let formattedMsg = 'Unable to access camera. Please try again or upload a photo.';
      const errName = lastErr?.name || '';
      console.log('[Camera Debug] actual error.name:', errName);
      console.log('[Camera Debug] actual error.message:', lastErr?.message);

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        formattedMsg = 'Camera permission denied. Allow camera access in your browser settings.';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        formattedMsg = 'No camera was found on this device.';
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        formattedMsg = 'Camera is currently being used by another application.';
      } else if (errName === 'OverconstrainedError' || errName === 'ConstraintNotSatisfiedError') {
        formattedMsg = 'Preferred camera is unavailable. Trying another camera...';
      } else if (errName === 'SecurityError') {
        formattedMsg = 'Camera access is blocked by browser security settings.';
      } else if (errName === 'TypeError') {
        formattedMsg = 'Camera API is unavailable in this browser.';
      }

      setCameraErr(formattedMsg);
      if (app?.toast) app.toast(formattedMsg);
      return;
    }

    console.log('[Camera Debug] camera permission result: GRANTED, stream active:', stream.active);
    streamRef.current = stream;
    setCameraActive(true);
    setCameraLoading(false);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((playErr) => {
          console.warn('[Camera Debug] video.play() exception:', playErr.message);
        });
      }
    }, 100);

    if (app?.toast) {
      app.toast(mode === 'user' ? 'Front camera activated' : 'Camera activated 📷');
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraActive) {
      openCamera(newMode);
    } else {
      app.toast(newMode === 'user' ? 'Set to Front Camera' : 'Set to Rear Camera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImg(dataUrl);
      stopCamera();
      app.toast('Photo captured ✓');
    } catch (e) {
      app.toast('Captured fallback photo');
      setCapturedImg('img/scan.jpg');
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImg(null);
    openCamera(facingMode);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCapturedImg(evt.target?.result || 'img/scan.jpg');
      app.toast('Photo uploaded from gallery ✓');
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    const finalImg = capturedImg || 'img/scan.jpg';
    setAnalyzing(true);
    try {
      const res = await api.analyzePlantScan({ crop, image: finalImg });
      setAnalyzing(false);
      if (res.isCropImage === false || res.success === false) {
        if (app?.toast) app.toast(res.message || 'Please upload a clear crop or plant image for analysis.');
        app.go('diagnosis', { capturedImg: finalImg, scanResult: res });
        return;
      }
      app.go('diagnosis', { crop, capturedImg: finalImg, scanResult: res });
    } catch (err) {
      console.warn('[Plant Scan Error]:', err);
      setAnalyzing(false);
      const errRes = {
        success: false,
        isCropImage: false,
        message: err.message?.includes('configured')
          ? 'AI scanner is not configured.'
          : 'Unable to analyze this image right now. Please try again.'
      };
      if (app?.toast) app.toast(errRes.message);
      app.go('diagnosis', { capturedImg: finalImg, scanResult: errRes });
    }
  };

  return (
    <div className="screen no-nav" style={{ padding: 0, background: 'linear-gradient(180deg,#0b3b24,#062a1b 60%)' }}>
      <MobileHeader
        title="Crop Scanner"
        sub="Scan a crop leaf"
        rounded={false}
        right={
          <button
            className="ab-btn"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, padding: '4px 8px', borderRadius: 8 }}
            onClick={switchCamera}
            title="Switch Camera (Front/Back)"
          >
            🔄 {facingMode === 'user' ? 'Front' : 'Back'}
          </button>
        }
      />

      <div className="hscroll" style={{ paddingTop: 10 }}>
        {options.map((o) => (
          <button
            key={o}
            className={`chip lg ${crop === o ? 'solid' : ''}`}
            style={{
              background: crop === o ? 'var(--brand-500)' : 'rgba(255,255,255,.12)',
              color: '#fff',
              border: 0,
              cursor: 'pointer',
              padding: '8px 14px',
            }}
            onClick={() => setCrop(o)}
          >
            {o}
          </button>
        ))}
      </div>

      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />

      {/* Front Camera Warning */}
      {facingMode === 'user' && cameraActive && (
        <div style={{ padding: '6px 16px 0' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.22)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fde68a',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⚠️</span>
            <span>Front camera selected. For better crop detection, use the rear camera.</span>
          </div>
        </div>
      )}

      {/* Camera Viewfinder Container */}
      <div className="viewfinder" style={{ position: 'relative', overflow: 'hidden', background: '#000', margin: '10px 16px 0', borderRadius: 16, height: 320 }}>
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />
        ) : capturedImg ? (
          <img src={capturedImg} alt="Captured crop leaf" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#9fd8b4', textAlign: 'center', padding: 20 }}>
            <div className="col" style={{ alignItems: 'center', gap: 8 }}>
              <Icon n="camera" s={42} w={1.6} />
              <span className="small" style={{ fontWeight: 700 }}>
                {cameraLoading
                  ? 'Opening camera…'
                  : cameraErr
                  ? 'Camera Unavailable'
                  : 'Tap "OPEN CAMERA" or "UPLOAD PHOTO"'}
              </span>
              {cameraErr ? (
                <div className="col" style={{ alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span className="tiny" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: 8, maxWidth: 280 }}>
                    ⚠️ {cameraErr}
                  </span>
                  <div className="row" style={{ gap: 8 }}>
                    <Btn xs variant="on-dark-ghost" onClick={() => openCamera(facingMode)}>
                      Try Again
                    </Btn>
                    <Btn xs variant="primary" onClick={() => fileInputRef.current?.click()}>
                      Upload Photo
                    </Btn>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <span className="vf-corner tl" /><span className="vf-corner tr" /><span className="vf-corner bl" /><span className="vf-corner br" />
        {analyzing && <div className="vf-scanline" />}

        <div className="vf-tag" style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 11 }}>
          {analyzing
            ? 'Analyzing crop with Gemini Vision AI...'
            : cameraActive
            ? `Live Camera (${facingMode === 'user' ? 'Front' : 'Rear'})`
            : capturedImg
            ? `Crop: ${crop} · Photo Preview`
            : 'Ready to Scan'}
        </div>
      </div>

      {/* Camera & Photo Controls */}
      <div style={{ padding: '14px 16px 0' }}>
        {cameraActive ? (
          <div className="row between" style={{ alignItems: 'center', gap: 12 }}>
            <button
              className="chip"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: 12, border: 0, cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              🖼 Gallery
            </button>

            <button
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid var(--brand-500)',
                boxShadow: '0 0 16px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
              onClick={capturePhoto}
              title="Capture Photo"
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-600)' }} />
            </button>

            <button
              className="chip"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: 12, border: 0, cursor: 'pointer' }}
              onClick={switchCamera}
            >
              🔄 Switch
            </button>
          </div>
        ) : capturedImg ? (
          <div className="row" style={{ gap: 8, padding: '0 2px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Btn block variant="on-dark-ghost" icon="camera" onClick={retakePhoto} style={{ fontSize: 13, padding: '10px 4px' }}>
                Retake
              </Btn>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Btn block variant="on-dark-ghost" icon="upload" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 13, padding: '10px 4px' }}>
                Upload Photo
              </Btn>
            </div>
          </div>
        ) : (
          <div className="row" style={{ gap: 8, padding: '0 2px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Btn block variant="primary" icon="camera" disabled={cameraLoading} onClick={() => openCamera(facingMode)} style={{ fontSize: 12, padding: '10px 4px' }}>
                {cameraLoading ? 'Opening…' : 'OPEN CAMERA'}
              </Btn>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Btn block variant="on-dark-ghost" icon="upload" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 12, padding: '10px 4px' }}>
                UPLOAD PHOTO
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Action */}
      <div style={{ padding: '12px 16px 20px' }}>
        <Btn block variant="primary" disabled={analyzing || (!capturedImg && !cameraActive)} onClick={analyze}>
          {analyzing ? 'Analyzing with Gemini Vision...' : 'ANALYZE CROP'}
        </Btn>
        <p className="tiny center" style={{ color: '#8fbfa2', marginTop: 10, lineHeight: 1.5 }}>
          Gemini Vision Multimodal AI Analysis · Direct API Integration
        </p>
      </div>
    </div>
  );
}

/* ---------- 09 AI Diagnosis ---------- */
export function Diagnosis({ params }) {
  const app = useApp();
  const scan = params?.scanResult?.scan || params?.scanResult || {};

  const isCropImage = scan.isCropImage !== false && scan.success !== false;
  const sourceLabel = scan.label || scan.source || 'Gemini Vision AI Analysis';

  if (!isCropImage) {
    return (
      <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
        <MobileHeader title="Analysis Result" sub="Image Rejected" />
        <div style={{ padding: '16px 16px 0' }}>
          <div className="card" style={{ padding: 20, textAlign: 'center', background: '#fff' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#dc2626' }}>Not a Valid Crop Image</h3>
            <p className="small muted" style={{ margin: '0 0 16px', lineHeight: 1.6 }}>
              {scan.message || 'Please upload a clear crop or plant image for analysis.'}
            </p>
            <Btn block variant="primary" icon="scan" onClick={() => app.go('scanner')}>
              Try Another Photo
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  const displayImg = params?.capturedImg || scan.image || 'img/scan.jpg';
  const displayCrop = scan.crop || 'Unknown Crop';
  const displayCondition = scan.condition || scan.disease || scan.disease_or_pest || 'Healthy';
  const displayType = scan.type || 'Healthy';
  const displaySeverity = scan.severity || 'Low';
  const displayConfidence = typeof scan.confidence === 'number'
    ? (scan.confidence <= 1 ? Math.round(scan.confidence * 100) : Math.round(scan.confidence))
    : 85;

  const displayRecommendation = scan.recommendation || scan.recommended_action || 'Maintain proper irrigation and field sanitation.';
  const displayPrevention = scan.prevention || 'Ensure proper drainage and conduct routine scouting.';

  let displaySymptoms = ['No visible symptoms reported by AI.'];
  if (scan.symptoms) {
    displaySymptoms = Array.isArray(scan.symptoms) ? scan.symptoms : [scan.symptoms];
  }

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <MobileHeader title="Gemini AI Diagnosis" sub={`${displayCrop} · ${sourceLabel}`} />
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="row">
            <img className="thumb" src={displayImg} alt="scanned leaf" style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover' }} />
            <div className="col grow">
              <span style={{ fontWeight: 800, fontSize: 15 }}>Crop: {displayCrop}</span>
              <span className="small" style={{ fontWeight: 700, color: 'var(--brand-700)', marginTop: 2 }}>Condition: {displayCondition}</span>
              <span className="tiny muted" style={{ fontStyle: 'italic', marginTop: 2 }}>Type: {displayType}</span>
              <div className="row" style={{ gap: 6, marginTop: 6 }}>
                <Chip solid>Confidence: {displayConfidence}%</Chip>
                <Chip tone={severityTone(displaySeverity)}>Severity: {displaySeverity}</Chip>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="chip gray" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
              🔬 {sourceLabel}
            </span>
          </div>
        </div>
      </div>

      <SectionTitle>Visible Symptoms</SectionTitle>
      <div className="card" style={{ margin: '0 16px', padding: 12 }}>
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          {displaySymptoms.map((sym, idx) => (
            <li key={idx}>{sym}</li>
          ))}
        </ul>
      </div>

      <SectionTitle>Recommended Action Plan</SectionTitle>
      <div className="card" style={{ margin: '0 16px', padding: 12 }}>
        <div className="row" style={{ gap: 10, padding: '8px 0', alignItems: 'flex-start' }}>
          <span className="chip solid" style={{ flex: 'none', width: 22, height: 22, padding: 0, display: 'grid', placeItems: 'center', fontSize: 11 }}>1</span>
          <span className="small" style={{ lineHeight: 1.5, fontWeight: 600 }}>{displayRecommendation}</span>
        </div>
      </div>

      <SectionTitle>Prevention Advice</SectionTitle>
      <div className="card" style={{ margin: '0 16px', padding: 12 }}>
        <div className="row" style={{ gap: 10, padding: '8px 0', alignItems: 'flex-start' }}>
          <span className="chip solid" style={{ flex: 'none', width: 22, height: 22, padding: 0, display: 'grid', placeItems: 'center', fontSize: 11, background: 'var(--brand-600)' }}>🛡</span>
          <span className="small" style={{ lineHeight: 1.5, fontWeight: 600 }}>{displayPrevention}</span>
        </div>
      </div>

      <div className="row" style={{ gap: 10, padding: '16px 16px 0' }}>
        <Btn block icon="check" onClick={async () => { await new Promise((r) => setTimeout(r, 400)); app.toast('Scan saved to crop history ✓'); }}>Save Scan</Btn>
        <Btn block variant="ghost" icon="scan" onClick={() => app.go('scanner')}>Scan Again</Btn>
      </div>
    </div>
  );
}

/* ---------- 10 Crop Health History ---------- */
export function History() {
  const app = useApp();
  const color = { Moderate: 'var(--orange)', Severe: 'var(--red)', High: 'var(--red)', Low: 'var(--amber)', Healthy: 'var(--brand-600)' };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 140 }}>
      <MobileHeader title="Crop Health History" sub="All AI scans across your farm" />
      <div className="timeline" style={{ marginTop: 16 }}>
        {HEALTH_HISTORY.map((h) => (
          <div className="tl-item" key={h.id}>
            <span className="tl-dot" style={{ background: color[h.severity] }} />
            <div className="card" style={{ padding: 12, marginTop: 0 }}>
              <div className="row between">
                <span className="tiny muted" style={{ fontWeight: 700 }}>{h.date}</span>
                <Chip tone={severityTone(h.severity)}>{h.severity}</Chip>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 18 }}>{h.emoji}</span>
                <span className="small" style={{ fontWeight: 800 }}>{h.crop} — {h.issue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        <Btn block variant="ghost" icon="history" onClick={() => app.toast('Full history exported to PDF')}>View Full History</Btn>
      </div>
    </div>
  );
}
