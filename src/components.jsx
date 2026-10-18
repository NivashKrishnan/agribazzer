/* ============================================================
   AGRIBAZZER MOBILE — Reusable component library
   ============================================================ */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LANGUAGES, t } from './i18n.js';

export const NavCtx = createContext(null);
export const useApp = () => useContext(NavCtx);

/* ---------------- Icons (inline SVG, offline-safe) ---------------- */
const P = {
  home: ['M3 10.75 12 3.5l9 7.25', 'M5.5 9.5V20h13V9.5'],
  leaf: ['M4.5 19.5c8 0 15-6 15-15-9.5 0-15 6-15 15Z', 'M4.5 19.5c2-6 6-10 11.5-12'],
  chart: ['M3 20h18', 'M6 20v-6', 'M12 20V8', 'M18 20V4.5'],
  cart: ['M3 4h2l2.5 11.5h11L21 8H7', 'M9.5 20a1.4 1.4 0 1 0 0-.1', 'M17 20a1.4 1.4 0 1 0 0-.1'],
  user: ['M12 8.2a3.6 3.6 0 1 0 0 .1', 'M4.5 20c1.5-4 4.2-5.6 7.5-5.6s6 1.6 7.5 5.6'],
  scan: ['M4 8V6a2 2 0 0 1 2-2h2', 'M16 4h2a2 2 0 0 1 2 2v2', 'M20 16v2a2 2 0 0 1-2 2h-2', 'M8 20H6a2 2 0 0 1-2-2v-2', 'M7 12h10'],
  bot: ['M5 9h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z', 'M12 9V6', 'M12 4.6a1.4 1.4 0 1 0 0 .1', 'M9.3 13.5v1.6', 'M14.7 13.5v1.6', 'M2 13h2', 'M20 13h2'],
  bell: ['M6.2 9.5a5.8 5.8 0 0 1 11.6 0c0 4.6 1.9 5.8 1.9 5.8H4.3s1.9-1.2 1.9-5.8', 'M10 18.8a2.4 2.4 0 0 0 4 0'],
  back: ['M14.5 5 8 12l6.5 7'],
  chevR: ['M9.5 5 16 12l-6.5 7'],
  chevD: ['M5 9.5l7 6.5 7-6.5'],
  chevU: ['M5 16.5l7-6.5 7 6.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  camera: ['M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z', 'M12 17a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z'],
  upload: ['M12 15.5V4', 'M7 8.5 12 3.5l5 5', 'M4 20h16'],
  pin: ['M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z', 'M12 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 2.5v2', 'M12 19.5v2', 'M2.5 12h2', 'M19.5 12h2', 'M5 5l1.4 1.4', 'M17.6 17.6 19 19', 'M19 5l-1.4 1.4', 'M6.4 17.6 5 19'],
  rain: ['M6.5 14.5h10.6a3.7 3.7 0 0 0-.4-7.4A5.6 5.6 0 0 0 6 8.6a3 3 0 0 0 .5 5.9Z', 'M8.5 18v2.4', 'M12 17.4v2.4', 'M15.5 18v2.4'],
  wind: ['M3 8h10a2.5 2.5 0 1 0-2.5-2.6', 'M3 12h15a2.5 2.5 0 1 1-2.5 2.6', 'M3 16h8'],
  drop: ['M12 3s6 6.6 6 10.6a6 6 0 0 1-12 0C6 9.6 12 3 12 3Z'],
  search: ['M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z', 'M20 20l-4.2-4.2'],
  filter: ['M4 6h16', 'M7 12h10', 'M10 18h4'],
  check: ['M5 12.5 10 17.5 19 7'],
  checkC: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M8.2 12.4l2.7 2.7 5.4-6'],
  alert: ['M12 4 2.8 19h18.4Z', 'M12 10v4', 'M12 16.6v.4'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  truck: ['M2 7h11v9.5H2Z', 'M13 10.5h4.4l3.1 3v3H13Z', 'M6.5 18.6a1.6 1.6 0 1 0 0-.1', 'M16.5 18.6a1.6 1.6 0 1 0 0-.1'],
  ticket: ['M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2.6 2.6 0 0 0 0 6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2.6 2.6 0 0 0 0-6Z', 'M14.5 6.5v11'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.5V12l3.4 2'],
  wallet: ['M3.5 7.5a2 2 0 0 1 2-2h12v3', 'M3.5 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-14a2 2 0 0 1-2-1.5Z', 'M16.6 13.6a1.1 1.1 0 1 0 0-.1'],
  gear: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M12 2.8v2.6', 'M12 18.6v2.6', 'M2.8 12h2.6', 'M18.6 12h2.6', 'M5.4 5.4l1.9 1.9', 'M16.7 16.7l1.9 1.9', 'M18.6 5.4l-1.9 1.9', 'M7.3 16.7l-1.9 1.9'],
  logout: ['M9.5 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4.5', 'M15 8l4 4-4 4', 'M19 12H9.5'],
  edit: ['M4 20h4L20 8l-4-4L4 16Z', 'M13.5 6.5l4 4'],
  phone: ['M5 3.5h3.6l1.8 4.6-2.3 1.4a12.5 12.5 0 0 0 5.4 5.4l1.4-2.3 4.6 1.8v3.6a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z'],
  cal: ['M4.5 5.5h15a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z', 'M3.5 10h17', 'M8 3.5v4', 'M16 3.5v4'],
  box: ['M12 3 3 7.5v9L12 21l9-4.5v-9Z', 'M3 7.5 12 12l9-4.5', 'M12 12v9'],
  store: ['M4.5 10.5V20h15v-9.5', 'M2.5 10.5 4.5 4h15l2 6.5Z', 'M9.5 20v-5.5h5V20'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z', 'M9 12l2.2 2.2L15.5 10'],
  star: ['M12 4l2.4 5 5.6.7-4 3.9 1 5.4-5-2.8-5 2.8 1-5.4-4-3.9 5.6-.7Z'],
  up: ['M12 19V5', 'M6 11l6-6 6 6'],
  down: ['M12 5v14', 'M6 13l6 6 6-6'],
  dots: ['M12 6.2v.1', 'M12 12v.1', 'M12 17.8v.1'],
  map: ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2Z', 'M9 4v14', 'M15 6v14'],
  spark: ['M11 3l1.7 4.8L17.5 9.5l-4.8 1.7L11 16l-1.7-4.8L4.5 9.5l4.8-1.7Z', 'M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z'],
  chat: ['M4 5h16v11H9.5L4 20Z'],
  eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z', 'M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z'],
  lock: ['M5.5 11h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  history: ['M3.6 12a8.4 8.4 0 1 0 2.5-6L3 8.6', 'M3 4v4.6h4.6', 'M12 8v4.5l3 1.8'],
  rupee: ['M7 4.5h10', 'M7 9h10', 'M9.5 4.5c5.5 0 5.5 8.5-.5 8.5H7.5L16 20.5'],
  recycle: ['M7 19h10l-2.5-3', 'M17 19 13.5 8.5 11 11', 'M13.5 8.5 10 5 5.5 12l3 .5', 'M5.5 12 7 19l3.5-1.5'],
};

export function Icon({ n, s = 20, w = 1.9, className = '' }) {
  const d = P[n] || P.dots;
  return (
    <svg className={className} width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

/* ---------------- Logo ---------------- */
export function Logo({ size = 44, className = '' }) {
  return (
    <div
      className={`logo-mark ${className}`}
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src="img/logo.png"
        alt="AGRIBAZZER Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

/* ---------------- Button with idle / loading / success / error states ---------------- */
export function Btn({ children, variant = 'primary', block, sm, xs, icon, onClick, disabled, className = '', type = 'button' }) {
  const [st, setSt] = useState('idle');
  const run = async () => {
    if (st === 'loading' || disabled) return;
    setSt('loading');
    try {
      await onClick?.();
      setSt('success');
      setTimeout(() => setSt('idle'), 1150);
    } catch (e) {
      if (e?.message === 'cancel') { setSt('idle'); return; }
      setSt('error');
      setTimeout(() => setSt('idle'), 1300);
    }
  };
  const cls = `btn btn-${variant} ${block ? 'block' : ''} ${sm ? 'sm' : ''} ${xs ? 'xs' : ''} ${st === 'success' ? 'is-success' : ''} ${st === 'error' ? 'is-error' : ''} ${className}`;
  return (
    <button type={type} className={cls} disabled={disabled || st === 'loading'} onClick={run}>
      {st === 'loading' && <span className="spin" />}
      {st === 'success' && <Icon n="check" s={sm || xs ? 14 : 17} w={2.6} />}
      {st === 'error' && <Icon n="alert" s={sm || xs ? 14 : 17} w={2.2} />}
      {st === 'idle' && icon && <Icon n={icon} s={sm || xs ? 14 : 17} w={2.1} />}
      <span>{st === 'success' ? 'Done' : st === 'error' ? 'Failed — retry' : children}</span>
    </button>
  );
}

export const Chip = ({ children, tone = '', className = '', solid }) => (
  <span className={`chip ${tone} ${solid ? 'solid' : ''} ${className}`}>{children}</span>
);

export const severityTone = (s) =>
  ({ Moderate: 'orange', Severe: 'red', High: 'red', Low: 'amber', Healthy: '', Active: '', Paid: '', Processing: 'amber', 'In Queue': 'amber', Delivered: '', Sold: 'gray' }[s] ?? 'gray');

/* ---------------- Header ---------------- */
export function MobileHeader({ title, sub, back = true, right, rounded = true, children }) {
  const app = useApp();
  return (
    <div className={`appbar ${rounded ? 'rounded' : ''}`}>
      {back && (
        <button className="ab-btn" onClick={app.back} aria-label="Back">
          <Icon n="back" s={19} w={2.4} />
        </button>
      )}
      <div className="grow">
        <div className="ab-title">{title}</div>
        {sub && <div className="ab-sub">{sub}</div>}
      </div>
      {right}
      {children}
    </div>
  );
}

/* ---------------- Bottom navigation ---------------- */
export function BottomNavigation({ tab, onTab, role }) {
  const app = useApp();
  const tabs = [
    { id: 'home', icon: 'home', label: app?.t ? app.t('home') : 'Home' },
    { id: 'market', icon: 'chart', label: app?.t ? app.t('market') : 'Market' },
    { id: 'sell', icon: 'cart', label: role === 'buyer' ? (app?.t ? app.t('buy') : 'Buy') : (app?.t ? app.t('sell') : 'Sell') },
    { id: 'orders', icon: 'box', label: app?.t ? app.t('orders') : 'Orders' },
    { id: 'profile', icon: 'user', label: app?.t ? app.t('profile') : 'Profile' },
  ];
  return (
    <nav className="bottom-nav safe-b">
      {tabs.map((t) => (
        <button key={t.id} className={`bn-item ${tab === t.id ? 'on' : ''}`} onClick={() => onTab(t.id)}>
          <span className="bn-ic"><Icon n={t.icon} s={21} w={2} /></span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export function FabScan() {
  const app = useApp();
  return (
    <button className="fab-scan" onClick={() => app.go('scanner')} aria-label="AI crop scan">
      <span className="fab-ring" />
      <Icon n="scan" s={26} w={2.2} />
    </button>
  );
}

export function AgribotButton() {
  const app = useApp();
  return (
    <button className="fab-bot" onClick={() => app.go('agribot')} aria-label="Ask Agribot">
      <Icon n="bot" s={23} w={2} />
    </button>
  );
}

/* ---------------- Sheet & Confirm ---------------- */
export function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div className="sh-title">
          {title}
          <button className="ab-btn" style={{ background: '#eef1ee', color: '#33473b' }} onClick={onClose}>
            <Icon n="x" s={16} w={2.4} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

export function ConfirmModal({ state, onClose }) {
  if (!state) return null;
  const { title, body, label = 'Confirm', danger } = state;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="modal">
        <div className="row" style={{ gap: 12, marginBottom: 10 }}>
          <div className="li-icon" style={{ background: danger ? 'var(--red-bg)' : 'var(--tint)', color: danger ? 'var(--red)' : 'var(--brand-700)' }}>
            <Icon n={danger ? 'alert' : 'checkC'} s={20} w={2.1} />
          </div>
          <div className="h2" style={{ flex: 1 }}>{title}</div>
        </div>
        <p className="small muted" style={{ margin: '0 0 16px', lineHeight: 1.55 }}>{body}</p>
        <div className="row" style={{ gap: 10 }}>
          <Btn variant="light" block onClick={onClose}>Cancel</Btn>
          <Btn variant={danger ? 'danger' : 'primary'} className={danger ? 'solid' : ''} block onClick={() => state.resolve(true)}>
            {label}
          </Btn>
        </div>
      </div>
    </>
  );
}

export function VoiceModal({ open, onClose, lang, onSend }) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState('');
  const langObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    if (!open) { setActive(false); setText(''); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec;
    try {
      if (SpeechRecognition) {
        rec = new SpeechRecognition();
        rec.lang = langObj.locale || 'en-IN';
        rec.interimResults = true;
        rec.onresult = (e) => {
          const res = Array.from(e.results).map((r) => r[0].transcript).join('');
          setText(res);
          if (e.results[0].isFinal) {
            setActive(false);
            setTimeout(() => {
              onSend?.(res);
              onClose();
            }, 400);
          }
        };
        rec.onerror = () => setActive(false);
        rec.onend = () => setActive(false);
        rec.start();
        setActive(true);
      } else {
        setActive(true);
      }
    } catch (e) {
      setActive(false);
    }

    return () => { try { rec?.stop(); } catch (e) {} };
  }, [open, lang]);

  if (!open) return null;

  const handleSimulate = (sample) => {
    setText(sample);
    setTimeout(() => {
      onSend?.(sample);
      onClose();
    }, 500);
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="modal voice-modal" style={{ textAlign: 'center', padding: '24px 20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-700)', letterSpacing: 0.8, marginBottom: 4 }}>
          🎙️ {langObj.flag} {langObj.label} ({langObj.name})
        </div>
        <div className="h2" style={{ marginBottom: 12 }}>
          {active ? t('voiceListening', lang) : t('speakNow', lang)}
        </div>
        <div className={`voice-mic-ring ${active ? 'voice-mic-active' : ''}`} style={{ margin: '16px auto', width: 78, height: 78, borderRadius: '50%', background: active ? 'linear-gradient(135deg, #1f8a4c, #0e5a34)' : 'var(--tint)', display: 'grid', placeItems: 'center', color: active ? '#fff' : 'var(--brand-700)', fontSize: 34, transition: 'all 0.3s ease' }}>
          🎙️
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, minHeight: 40, color: 'var(--ink)', padding: '0 10px', lineHeight: 1.45 }}>
          {text || t('listeningHelp', lang)}
        </div>
        <div className="hscroll" style={{ marginTop: 14, paddingBottom: 4 }}>
          {['Today paddy price', 'Tomato disease scan', 'Nearest paddy buyer', 'Rice straw buyers', 'Maize 500 kg sell'].map((sample) => (
            <button key={sample} className="chip" style={{ background: 'var(--tint)', border: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => handleSimulate(sample)}>
              {sample}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 10, marginTop: 18 }}>
          <Btn block variant="light" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </>
  );
}

/* ---------------- Sparkline ---------------- */
export function Spark({ data = [], up }) {
  const w = 52, h = 22;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={up ? '#1f8a4c' : up === false ? '#c03434' : '#93a29a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Domain cards (spec §33) ---------------- */

export function CropCard({ crop, onClick }) {
  return (
    <button className="crop-card" onClick={onClick}>
      <div className="cc-img">
        <img src={crop.img} alt={crop.name} loading="lazy" />
      </div>
      <div className="cc-body">
        <div className="row between">
          <span className="cc-name">{crop.name}</span>
          <Chip tone={crop.health === 'Healthy' ? '' : 'amber'}>{crop.health}</Chip>
        </div>
        <div className="cc-meta">
          Harvest: {crop.harvest}<br />Yield: {crop.yieldEst}
        </div>
      </div>
    </button>
  );
}

export function MarketPriceCard({ m, wide, onClick }) {
  const up = m.trend > 0 ? true : m.trend < 0 ? false : null;
  const cropImgMap = {
    paddy: 'img/paddy.jpg',
    tomato: 'img/tomato.jpg',
    maize: 'img/maize.jpg',
    onion: 'img/onion.jpg',
    groundnut: 'img/basket.jpg',
  };
  const imgSrc = m.img || cropImgMap[m.id] || 'img/paddy.jpg';
  return (
    <button className="card flat" onClick={onClick}
      style={{ width: wide ? 250 : '100%', textAlign: 'left', cursor: 'pointer', display: 'block', padding: 12 }}>
      <div className="row">
        <img className="thumb" src={imgSrc} alt={m.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
        <div className="col grow">
          <span style={{ fontWeight: 800, fontSize: 14 }}>{m.name}</span>
          <span className="tiny muted">{m.market} · {m.dist}</span>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
          <span className="price">₹{m.price}/kg</span>
          <span className={`trend ${up === null ? 'flat' : up ? 'up' : 'down'}`}>
            {up === null ? '—' : up ? '↑' : '↓'} {Math.abs(m.trend)}%
          </span>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 8 }}>
        <span className="tiny muted">Prev ₹{m.prev}/kg · {m.date}</span>
        <Spark data={m.spark} up={up} />
      </div>
    </button>
  );
}

export function ProductCard({ p, onClick, cta = 'View Details' }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="row" style={{ alignItems: 'stretch' }}>
        <img className="thumb lg" src={p.img} alt={p.title} loading="lazy" style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover' }} />
        <div className="col grow" style={{ justifyContent: 'space-between', padding: '2px 0' }}>
          <div>
            <div className="row between">
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{p.title}</span>
              <span className="price">₹{p.price}/kg</span>
            </div>
            <div className="tiny muted" style={{ marginTop: 3 }}>{p.qty} · {p.dist} away</div>
          </div>
          <div className="row between" style={{ marginTop: 6 }}>
            {p.verified ? <Chip><Icon n="shield" s={11} w={2.4} /> Verified Seller</Chip> : <Chip tone="gray">Unverified</Chip>}
            <Btn xs variant="ghost" onClick={onClick}>{cta}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuyerCard({ b, onContact }) {
  const buyerImgMap = {
    B1: 'img/paddy.jpg',
    B2: 'img/basket.jpg',
    B3: 'img/handshake.jpg',
    B4: 'img/hero.jpg',
    B5: 'img/tomato.jpg',
  };
  const imgSrc = b.img || buyerImgMap[b.id] || 'img/handshake.jpg';
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="row">
        <img className="thumb" src={imgSrc} alt={b.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
        <div className="col grow">
          <span style={{ fontWeight: 800, fontSize: 14 }}>{b.name}</span>
          <span className="tiny muted">{b.type} · {b.dist} away · {b.need}</span>
        </div>
        <div className="col" style={{ alignItems: 'flex-end' }}>
          <Chip solid>{b.match}% match</Chip>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 10 }}>
        <div className="row" style={{ gap: 6 }}>
          {b.verified && <Chip><Icon n="shield" s={11} w={2.4} /> Verified</Chip>}
          <span className="tiny muted">{b.price}</span>
        </div>
        <Btn xs variant="primary" icon="chat" onClick={onContact}>Contact Buyer</Btn>
      </div>
    </div>
  );
}

export function DiseaseResultCard({ d }) {
  const R = 20, C = 2 * Math.PI * R;
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row">
        <img className="thumb" src={d.img} alt="scan" />
        <div className="col grow">
          <span style={{ fontWeight: 800, fontSize: 15 }}>{d.crop} · {d.disease}</span>
          <span className="tiny muted" style={{ fontStyle: 'italic' }}>{d.scientific}</span>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            <Chip solid>{d.confidence}% confidence</Chip>
            <Chip tone={severityTone(d.severity)}>{d.severity}</Chip>
          </div>
        </div>
        <svg className="ring" width="52" height="52">
          <circle cx="26" cy="26" r={R} stroke="#e2e8e1" strokeWidth="5" />
          <circle cx="26" cy="26" r={R} stroke="#1f8a4c" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${(d.confidence / 100) * C} ${C}`} />
          <text x="26" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill="#14291d" transform="rotate(90 26 26)">{d.confidence}%</text>
        </svg>
      </div>
      <div className="grid-2" style={{ marginTop: 12 }}>
        <div className="stat-tile"><div className="v">{d.affected}</div><div className="l">Affected Area</div></div>
        <div className="stat-tile"><div className="v" style={{ color: 'var(--amber)' }}>{d.farmRisk}</div><div className="l">Overall Farm Risk</div></div>
      </div>
    </div>
  );
}

export function WeatherCard({ w, onUseLocation, onRefresh, loading, statusMsg, label, onSearchCity }) {
  const rainfallVal = w?.rainfall ? (w.rainfall.includes('·') ? w.rainfall.split('·')[0].trim() : w.rainfall) : '40%';
  const windVal = w?.wind ? w.wind.split(' ')[0] : '14';
  const sourceLabel = label || w?.label || 'LIVE DATA';
  const placeName = w?.place || w?.location || 'My Location';

  return (
    <div className="card tinted" style={{ padding: 14 }}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <Chip tone={sourceLabel === 'LIVE DATA' ? 'green' : 'amber'} sm solid>
          {sourceLabel}
        </Chip>
        {statusMsg && <span className="tiny muted" style={{ fontWeight: 700, fontSize: 11 }}>{statusMsg}</span>}
      </div>

      <div className="row between">
        <div className="col">
          <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{w?.temp ?? 31}°C</span>
          <span className="tiny muted" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon n="pin" s={12} w={2} /> {placeName}
          </span>
        </div>
        <div className="col" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: 34 }}>{w?.icon || '⛅'}</span>
          <span className="tiny" style={{ fontWeight: 700 }}>{w?.condition || 'Partly Cloudy'}</span>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginTop: 12 }}>
        <div className="stat-tile">
          <div className="v" style={{ fontSize: 13 }}>
            <Icon n="drop" s={13} w={2.2} /> {w?.humidity || '72%'}
          </div>
          <div className="l">Humidity</div>
        </div>
        <div className="stat-tile">
          <div className="v" style={{ fontSize: 13 }}>
            <Icon n="rain" s={13} w={2.2} /> {rainfallVal}
          </div>
          <div className="l">Rainfall</div>
        </div>
        <div className="stat-tile">
          <div className="v" style={{ fontSize: 13 }}>
            <Icon n="wind" s={13} w={2.2} /> {windVal}
          </div>
          <div className="l">Wind</div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {onUseLocation && (
          <Btn sm variant="primary" block icon="pin" onClick={onUseLocation} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Getting location...' : 'Use My Location'}
          </Btn>
        )}
        {onRefresh && (
          <Btn sm variant="ghost" onClick={onRefresh} disabled={loading} style={{ width: 'auto', padding: '0 12px' }}>
            <Icon n="pin" s={15} w={2} /> Refresh
          </Btn>
        )}
      </div>
    </div>
  );
}

export function ProcurementTokenCard({ t, onLogistics, onCancel }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--brand-800), var(--brand-950))', color: '#fff', padding: '12px 14px' }} className="row between">
        <div className="row" style={{ gap: 10 }}>
          <Icon n="ticket" s={20} w={2} />
          <span style={{ fontWeight: 800, letterSpacing: 0.4 }}>TOKEN #{t.id}</span>
        </div>
        <Chip className="" tone="">{t.status}</Chip>
      </div>
      <div style={{ padding: 14 }}>
        <div className="tiny muted">{t.centre}</div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div className="stat-tile"><div className="v" style={{ fontSize: 14 }}>{t.crop}</div><div className="l">{t.qty}</div></div>
          <div className="stat-tile"><div className="v" style={{ color: 'var(--brand-700)' }}>{t.queue}</div><div className="l">Queue Position</div></div>
        </div>
        <div className="row between" style={{ marginTop: 10 }}>
          <span className="tiny muted">AI predicted wait</span>
          <Chip solid>{t.wait}</Chip>
        </div>
        {(onLogistics || onCancel) && (
          <div className="row" style={{ gap: 10, marginTop: 12 }}>
            {onLogistics && <Btn sm variant="primary" block icon="truck" onClick={onLogistics}>Proceed to Logistics</Btn>}
            {onCancel && <Btn sm variant="danger" block onClick={onCancel}>Cancel Token</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}

export function QueueCard({ q }) {
  const max = Math.max(...q.hours.map((h) => h.v));
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="grid-2">
        <div className="stat-tile"><div className="v">{q.wait.replace(' minutes', ' min')}</div><div className="l">Estimated Wait</div></div>
        <div className="stat-tile"><div className="v">{q.best}</div><div className="l">Best Arrival Time</div></div>
      </div>
      <div className="row between" style={{ marginTop: 12 }}>
        <span className="small" style={{ fontWeight: 700 }}>Queue Level</span>
        <Chip tone={q.level === 'LOW' ? '' : q.level === 'MEDIUM' ? 'amber' : 'red'} solid={q.level === 'LOW'}>{q.level}</Chip>
      </div>
      <div className="row" style={{ gap: 4, alignItems: 'flex-end', height: 64, marginTop: 12 }}>
        {q.hours.map((h) => (
          <div key={h.h} className="col" style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', borderRadius: 4, background: h.v > 65 ? '#e8b04b' : '#bcd9c3', height: `${(h.v / max) * 48 + 6}px` }} />
            <span className="tiny" style={{ fontSize: 8.5, color: 'var(--muted)' }}>{h.h.replace(' ', '')}</span>
          </div>
        ))}
      </div>
      <div className="tiny muted center" style={{ marginTop: 6 }}>Crowding by hour — avoid the amber peak</div>
    </div>
  );
}

export function OrderCard({ o, onTrack }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="row">
        <img className="thumb" src={o.img} alt="" loading="lazy" />
        <div className="col grow">
          <span style={{ fontWeight: 800, fontSize: 14 }}>{o.crop}</span>
          <span className="tiny muted">{o.qty} · {o.buyer}</span>
          <span className="tiny muted">{o.id}</span>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 5 }}>
          <span className="price">{o.total}</span>
          <Chip tone={severityTone(o.status)}>{o.status}</Chip>
        </div>
      </div>
      {onTrack && (
        <div style={{ marginTop: 10 }}>
          <Btn sm variant="ghost" block icon="truck" onClick={onTrack}>Track Order</Btn>
        </div>
      )}
    </div>
  );
}

export function NotificationCard({ n, onClick }) {
  const tones = { green: 'var(--tint)', blue: 'var(--blue-bg)', amber: 'var(--amber-bg)', red: 'var(--red-bg)' };
  return (
    <button className="list-row" onClick={onClick} style={{ position: 'relative' }}>
      <div className="li-icon" style={{ background: tones[n.tone] }}>{n.icon}</div>
      <div className="col grow">
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</span>
        <span className="tiny muted" style={{ lineHeight: 1.45, marginTop: 2 }}>{n.body}</span>
      </div>
      <div className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
        <span className="tiny muted">{n.time}</span>
        {n.unread && <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-600)' }} />}
      </div>
    </button>
  );
}

export function AIInsightCard({ title = 'AI INSIGHT', body, children, actions }) {
  return (
    <div className="insight-card">
      <div className="ic-head"><Icon n="spark" s={15} w={2} /> {title}</div>
      {body && <div className="ic-body">{body}</div>}
      {children}
      {actions && <div className="row" style={{ gap: 10, marginTop: 12 }}>{actions}</div>}
    </div>
  );
}

/* ---------------- Misc helpers ---------------- */
export function SectionTitle({ children, action, onAction }) {
  return (
    <div className="sec-title">
      {children}
      {action && <button className="link" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <div className="err">{error}</div>}
    </div>
  );
}

export function useRefs(n) {
  const refs = useRef(Array.from({ length: n }, () => null));
  return refs;
}

/* ---------------- Error Boundary Component ---------------- */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="screen" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', background: '#0b3b24', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <h3 style={{ color: '#8fbfa2', margin: '0 0 8px 0', fontSize: 18, fontWeight: 800 }}>Scanner temporarily unavailable</h3>
          <p style={{ color: '#d1fae5', fontSize: 13, margin: '0 0 20px 0', maxWidth: 300, lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering issue occurred. You can retry or upload a photo.'}
          </p>
          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 280 }}>
            <button
              className="ab-btn btn-primary"
              style={{ flex: 1, padding: '12px 16px', fontSize: 13, fontWeight: 700 }}
              onClick={() => { this.setState({ hasError: false, error: null }); }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

