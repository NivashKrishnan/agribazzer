/* Screens 25 Orders, 26 Payment, 27 Notifications, 28 Agribot, 29 Profile, 30 Settings */
import React, { useEffect, useRef, useState } from 'react';
import {
  Btn, Chip, Icon, Logo, MobileHeader, SectionTitle, OrderCard, NotificationCard, AIInsightCard,
  Field, useApp, severityTone, VoiceModal,
} from '../components.jsx';
import { AGRIBOT_KB, AGRIBOT_SUGGESTIONS, LOGISTICS, NOTIFICATIONS, ORDERS, PAYMENT, USER } from '../data.js';
import { LANGUAGES, t, speakText } from '../i18n.js';

/* ---------- 25 Orders ---------- */
export function Orders() {
  const app = useApp();
  const [tab, setTab] = useState('Selling');
  const list = ORDERS[tab.toLowerCase()] || [];
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="My Orders" sub="Buying · Selling · Procurement" />
      <div className="tabs">
        {['Buying', 'Selling', 'Procurement'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div style={{ padding: '0 16px' }}>
        {list.map((o) => (
          <div key={o.id} style={{ marginBottom: 10 }}>
            <OrderCard o={o} onTrack={() => app.go(o.status === 'In Queue' ? 'token' : 'logistics')} />
          </div>
        ))}
        {!list.length && <div className="card center muted small" style={{ padding: 26 }}>No {tab.toLowerCase()} orders yet.</div>}
      </div>
    </div>
  );
}

/* ---------- 26 Payment ---------- */
export function Payment() {
  const app = useApp();
  const [paid, setPaid] = useState(false);
  const complete = async () => {
    const ok = await app.confirm({ title: 'Complete payment?', body: `₹28,000 for ${PAYMENT.product} will be released to the seller's UPI after your confirmation.`, label: 'Confirm & Pay' });
    if (ok) { setPaid(true); app.toast('Payment initiated 💳'); }
  };
  const status = paid ? 'Paid' : PAYMENT.status;
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Payment Status" sub="Sale SO-881 · Sri Balaji Rice Mill" />
      <div style={{ padding: '16px 16px 0' }}>
        <div className="card center" style={{ padding: 20 }}>
          <div className="li-icon" style={{ width: 62, height: 62, margin: '0 auto', borderRadius: 18, fontSize: 26, background: paid ? 'var(--tint)' : 'var(--amber-bg)' }}>
            {paid ? '✅' : '⏳'}
          </div>
          <div className="h2" style={{ marginTop: 10 }}>{status === 'Paid' ? 'Payment Completed' : 'Payment Processing'}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--brand-700)', margin: '8px 0' }}>{PAYMENT.total}</div>
          <Chip tone={paid ? '' : 'amber'}>{status}</Chip>
        </div>
        <div className="card" style={{ marginTop: 12, padding: 4 }}>
          {[['Product', PAYMENT.product], ['Quantity', PAYMENT.qty], ['Price', PAYMENT.price], ['Method', PAYMENT.method]].map(([l, v], i, a) => (
            <div className="row between" key={l} style={{ padding: '11px 12px', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span className="small muted" style={{ fontWeight: 600 }}>{l}</span>
              <span className="small" style={{ fontWeight: 800 }}>{v}</span>
            </div>
          ))}
        </div>
        <SectionTitle>Payment Methods</SectionTitle>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', padding: '0 16px' }}>
          <Chip solid>UPI</Chip><Chip>Bank Transfer</Chip><Chip>Wallet</Chip><Chip tone="gray">Cash on Delivery*</Chip>
        </div>
        <p className="tiny muted pad" style={{ marginTop: 6 }}>*where applicable, for verified local buyers</p>
        <SectionTitle>Transaction History</SectionTitle>
        <div className="list-card" style={{ margin: '0 16px' }}>
          {PAYMENT.history.map((h) => (
            <div className="list-row" key={h.id} style={{ cursor: 'default' }}>
              <div className="li-icon">💳</div>
              <div className="col grow">
                <span className="small" style={{ fontWeight: 700 }}>{h.title}</span>
                <span className="tiny muted">{h.date} · {h.id}</span>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                <span className="small" style={{ fontWeight: 800, color: 'var(--brand-700)' }}>{h.amount}</span>
                <Chip tone={severityTone(h.status)}>{h.status}</Chip>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 16px 0' }}>
          {!paid && <Btn block icon="wallet" onClick={complete}>Confirm & Complete Payment</Btn>}
          {paid && <Btn block variant="ghost" icon="box" onClick={() => app.go('orders')}>Back to Orders</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ---------- 27 Notifications ---------- */
export function Notifications() {
  const app = useApp();
  const [list, setList] = useState(NOTIFICATIONS);
  const unread = list.filter((n) => n.unread).length;
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Notifications" sub={unread ? `${unread} unread` : 'All caught up 🎉'}
        right={<button className="ab-btn" onClick={() => { setList(list.map((n) => ({ ...n, unread: false }))); app.toast('All marked as read'); }}><Icon n="check" s={17} w={2.4} /></button>} />
      <div className="list-card" style={{ marginTop: 14 }}>
        {list.map((n) => (
          <NotificationCard key={n.id} n={n} onClick={() => {
            setList(list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
            const map = { 'Weather Alert': 'weather', 'price': 'market', 'buyer matched': 'matching', 'token': 'token', 'Vehicle': 'logistics', 'Payment': 'payment', 'disease': 'diagnosis' };
            const key = Object.keys(map).find((k) => n.title.includes(k));
            app.go(key ? map[key] : 'home');
          }} />
        ))}
      </div>
    </div>
  );
}

/* ---------- 28 Agribot ---------- */
function botReply(q, lang) {
  const s = q.toLowerCase();
  const hit = AGRIBOT_KB.find((k) => k.keys.some((key) => s.includes(key)));
  if (!hit) return t('notFoundMsg', lang);
  return hit[lang] || hit.en;
}

export function Agribot() {
  const app = useApp();
  const lang = app?.lang || 'en';
  const setLang = (l) => app?.setLang && app.setLang(l);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [msgs, setMsgs] = useState([
    { who: 'bot', text: t('agribotWelcome', lang) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  useEffect(() => {
    setMsgs((m) => {
      if (m.length > 0 && m[0].who === 'bot') {
        const copy = [...m];
        copy[0] = { ...copy[0], text: t('agribotWelcome', lang) };
        return copy;
      }
      return m;
    });
  }, [lang]);

  const suggestions = t('agribotSuggestions', lang) || AGRIBOT_SUGGESTIONS;

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');
    setMsgs((m) => [...m, { who: 'user', text: q }]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 650));
    setTyping(false);
    const reply = botReply(q, lang);
    setMsgs((m) => [...m, { who: 'bot', text: reply }]);
    if (audioEnabled) {
      speakText(reply, lang);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(180deg, var(--brand-800), var(--brand-900))', color: '#fff', padding: '12px 14px 10px', flexShrink: 0 }}>
        <div className="row between" style={{ alignItems: 'center', gap: 8 }}>
          <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
            <button className="ab-btn" onClick={app.back} aria-label="Back" style={{ width: 34, height: 34, flexShrink: 0 }}>
              <Icon n="back" s={18} w={2.4} />
            </button>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t('agribotTitle', lang)}
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                {t('agribotSub', lang)}
              </div>
            </div>
          </div>
          <button className="ab-btn" style={{ fontSize: 16, width: 34, height: 34, flexShrink: 0 }} onClick={() => setAudioEnabled(!audioEnabled)} aria-label="Toggle Voice Audio">
            {audioEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        <div className="hscroll" style={{ gap: 6, padding: '8px 0 2px', scrollbarWidth: 'none' }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className="chip"
              style={{
                background: lang === l.code ? '#fff' : 'rgba(255,255,255,.18)',
                color: lang === l.code ? 'var(--brand-800)' : '#fff',
                border: 0,
                cursor: 'pointer',
                padding: '4px 10px',
                fontSize: 11.5,
                fontWeight: 800,
                flex: 'none',
                borderRadius: 12,
              }}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.who === 'user' ? 'user' : 'bot'}`}>
            {m.text}
            {m.who === 'bot' && (
              <button style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: 13, marginLeft: 6, opacity: 0.7 }} onClick={() => speakText(m.text, lang)} title="Listen again">
                🔊
              </button>
            )}
          </div>
        ))}
        {typing && <div className="chat-bubble bot typing"><i /><i /><i /></div>}
        <div ref={endRef} />
      </div>
      <div className="hscroll" style={{ paddingBottom: 6 }}>
        {suggestions.map((s) => (
          <button key={s} className="chip lg" style={{ border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', color: 'var(--ink-2)' }} onClick={() => send(s)}>{s}</button>
        ))}
      </div>
      <div style={{ padding: '8px 14px calc(12px + env(safe-area-inset-bottom,0px))', background: '#fff', borderTop: '1px solid var(--line)', display: 'flex', gap: 7, alignItems: 'center' }}>
        <button className="ab-btn" style={{ background: 'var(--tint)', color: 'var(--brand-700)', width: 40, height: 40, borderRadius: 12, fontSize: 19 }} onClick={() => setVoiceOpen(true)} title="Voice Assistant">
          🎙️
        </button>
        <input className="input" style={{ flex: 1 }} placeholder={t('askPlaceholder', lang)} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <Btn icon="chevR" onClick={() => send()} style={{ flex: 'none' }}>{t('sendBtn', lang)}</Btn>
      </div>

      <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} lang={lang} onSend={(text) => send(text)} />
    </div>
  );
}

/* ---------- 29 Profile ---------- */
/* ---------- 29 Profile ---------- */
export function Profile() {
  const app = useApp();
  const lang = app?.lang || 'en';
  const user = app.userProfile || USER;

  const businessLinks = [
    ['leaf', `🌾 ${t('myFarms', lang)}`, t('myFarmsSub', lang), () => app.go('farm')],
    ['store', `🏪 ${t('myBusiness', lang)}`, t('myBusinessSub', lang), () => app.go('listings')],
    ['pin', `📍 ${t('farmLocations', lang)}`, t('farmLocationsSub', lang), () => app.go('farmLocations')],
    ['box', `📦 ${t('myProducts', lang)}`, t('myProductsSub', lang), () => app.go('orders')],
  ];

  const accountLinks = [
    ['bell', `🔔 ${t('notifications', lang)}`, t('notificationsSub', lang), () => app.go('notifications')],
    ['globe', `🌐 ${t('language', lang)}`, t('languageSub', lang), () => app.go('language')],
    ['shield', `🔒 ${t('privacySecurity', lang)}`, t('privacySecuritySub', lang), () => app.go('privacy')],
    ['help', `❓ ${t('helpSupport', lang)}`, t('helpSupportSub', lang), () => app.go('help')],
    ['gear', `⚙️ ${t('appSettings', lang)}`, t('appSettingsSub', lang), () => app.go('settings')],
  ];

  const switchRole = async () => {
    const next = user.role === 'farmer' ? 'buyer' : 'farmer';
    const ok = await app.confirm({
      title: `${t('switchMode', lang)}?`,
      body: next === 'buyer' ? 'Browse the marketplace as a buyer.' : 'Return to your farmer dashboard.',
      label: t('switchMode', lang),
    });
    if (ok) {
      if (app.updateProfile) app.updateProfile({ role: next });
      app.setRole(next);
      app.setTab('home');
      app.reset('home');
      app.toast(`Switched to ${next} mode`);
    }
  };

  const deleteAccount = async () => {
    const ok = await app.confirm({
      title: `${t('deleteAccount', lang)}?`,
      body: 'Are you sure you want to permanently delete your AGRIBAZZER account and stored data? This action cannot be undone.',
      label: t('deleteAccount', lang),
      danger: true,
    });
    if (ok) {
      app.toast('Account deleted successfully');
      app.reset('splash');
    }
  };

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 220 }}>
      <MobileHeader title={t('profile', lang)} back={false}
        right={
          <button className="ab-btn" onClick={app?.toggleDarkMode} aria-label="Toggle dark mode" style={{ fontSize: 16 }}>
            {app?.darkMode ? '☀️' : '🌙'}
          </button>
        } />
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 16, borderRadius: 20 }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="li-icon" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--tint)', flexShrink: 0 }}>
              <Icon n="user" s={28} w={2} style={{ color: 'var(--brand-800)' }} />
            </div>
            <div className="col grow">
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--brand-900)' }}>{user.name}</span>
              <div className="row" style={{ gap: 4, marginTop: 2 }}>
                <span className="chip" style={{ background: 'var(--tint)', color: 'var(--brand-700)', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
                  ✓ {t('verifiedFarmer', lang)}
                </span>
              </div>
              <span className="tiny muted" style={{ marginTop: 4, fontWeight: 500 }}>{user.phone} · {user.location}</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Chip solid style={{ fontSize: 11.5, padding: '4px 10px' }}>
              {user.role === 'farmer' ? `🌾 ${t('farmerMode', lang)} — Active` : `🏪 ${t('buyerMode', lang)} — Active`}
            </Chip>
            <Chip tone="amber" style={{ fontSize: 11.5, padding: '4px 10px' }}>⭐ 4.8 Rating</Chip>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <div className="chip" style={{ background: 'var(--tint-2)', border: '1px solid var(--line)', color: 'var(--brand-800)', fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 8 }}>
              🌱 {user.farmSize || '5.2 Acres'}
            </div>
            <div className="chip" style={{ background: 'var(--tint-2)', border: '1px solid var(--line)', color: 'var(--brand-800)', fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 8 }}>
              🌾 Main Crop: {user.mainCrop || 'Paddy'}
            </div>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 16 }}>
            <Btn sm variant="primary" icon="edit" onClick={() => app.go('editProfile')} style={{ flex: 1, padding: '11px 0', fontSize: 13, borderRadius: 12 }}>{t('editProfile', lang)}</Btn>
            <Btn sm variant="outline" icon="logout" onClick={switchRole} style={{ flex: 1, padding: '11px 0', fontSize: 13, borderRadius: 12 }}>{t('switchMode', lang)}</Btn>
          </div>
        </div>
      </div>

      <div className="list-card" style={{ borderRadius: 18, margin: '16px 16px 0' }}>
        {businessLinks.map(([icon, l, sub, fn]) => (
          <button className="list-row" key={l} onClick={fn} style={{ padding: '12px 14px', width: '100%', cursor: 'pointer' }}>
            <div className="li-icon" style={{ background: 'var(--tint-2)', borderRadius: 12, width: 40, height: 40 }}>
              <Icon n={icon} s={20} w={2} />
            </div>
            <div className="col grow" style={{ textAlign: 'left' }}>
              <span className="small" style={{ fontWeight: 800, color: 'var(--brand-900)' }}>{l}</span>
              <span className="tiny muted">{sub}</span>
            </div>
            <Icon n="chevR" s={18} w={2.2} />
          </button>
        ))}
      </div>

      <div className="list-card" style={{ borderRadius: 18, margin: '14px 16px 0' }}>
        {accountLinks.map(([icon, l, sub, fn]) => (
          <button className="list-row" key={l} onClick={fn} style={{ padding: '12px 14px', width: '100%', cursor: 'pointer' }}>
            <div className="li-icon" style={{ background: 'var(--tint-2)', borderRadius: 12, width: 40, height: 40 }}>
              <Icon n={icon} s={20} w={2} />
            </div>
            <div className="col grow" style={{ textAlign: 'left' }}>
              <span className="small" style={{ fontWeight: 800, color: 'var(--brand-900)' }}>{l}</span>
              <span className="tiny muted">{sub}</span>
            </div>
            <Icon n="chevR" s={18} w={2.2} />
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <Btn block variant="light" icon="logout" onClick={async () => { app.reset('splash'); }} style={{ height: 48, borderRadius: 14, fontWeight: 700 }}>{t('logout', lang)}</Btn>
        <Btn block variant="danger" icon="x" onClick={deleteAccount} style={{ height: 48, borderRadius: 14, fontWeight: 700, background: '#FFEBEE', color: '#D32F2F', border: 0 }}>{t('deleteAccount', lang)}</Btn>
        <p className="tiny muted center" style={{ marginTop: 12, fontWeight: 500 }}>AGRIBAZZER Mobile • v1.0.0</p>
      </div>
    </div>
  );
}

/* ---------- 29b Edit Profile Form ---------- */
export function EditProfileForm() {
  const app = useApp();
  const u = app.userProfile || {};
  const [name, setName] = useState(u.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(u.phone || '+91 98765 43210');
  const [location, setLocation] = useState(u.location || 'Thanjavur, Tamil Nadu');
  const [role, setRole] = useState(u.role || 'farmer');
  const [farmSize, setFarmSize] = useState(u.farmSize || '5.2 Acres');
  const [mainCrop, setMainCrop] = useState(u.mainCrop || 'Paddy');
  const [error, setError] = useState('');

  const save = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Full name cannot be empty'); return; }
    if (!phone.trim()) { setError('Phone number cannot be empty'); return; }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
    if (!location.trim()) { setError('Location cannot be empty'); return; }

    if (app.updateProfile) {
      app.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        role,
        farmSize: farmSize.trim() || '5.2 Acres',
        mainCrop: mainCrop.trim() || 'Paddy',
      });
    }
    app.toast('Profile updated successfully.');
    app.back();
  };

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Edit Profile" sub="Update your personal & farm information" onBack={app.back} />
      <form onSubmit={save} style={{ padding: '16px' }}>
        {error && (
          <div className="card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 14px', marginBottom: 14, fontWeight: 700, fontSize: 13, borderRadius: 12, border: '1px solid #FFCDD2' }}>
            ⚠️ {error}
          </div>
        )}
        <div className="card" style={{ padding: 16, borderRadius: 18, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name *">
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Enter full name" />
          </Field>
          <Field label="Phone Number *">
            <input className="input" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} placeholder="+91 XXXXX XXXXX" />
          </Field>
          <Field label="Location *">
            <input className="input" value={location} onChange={(e) => { setLocation(e.target.value); setError(''); }} placeholder="District, State" />
          </Field>
          <Field label="Account Mode">
            <div className="select-wrap">
              <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="farmer">🌾 Farmer Mode</option>
                <option value="buyer">🏪 Buyer Mode</option>
              </select>
            </div>
          </Field>
          <Field label="Farm Size">
            <input className="input" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} placeholder="e.g. 5.2 Acres" />
          </Field>
          <Field label="Main Crop">
            <input className="input" value={mainCrop} onChange={(e) => setMainCrop(e.target.value)} placeholder="e.g. Paddy" />
          </Field>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <Btn block variant="outline" type="button" onClick={app.back} style={{ flex: 1, height: 48, borderRadius: 14, fontWeight: 700 }}>Cancel</Btn>
          <Btn block variant="primary" type="submit" style={{ flex: 1, height: 48, borderRadius: 14, fontWeight: 700 }}>Save Changes</Btn>
        </div>
      </form>
    </div>
  );
}

/* ---------- 29c Privacy & Security ---------- */
export function PrivacySecurity() {
  const app = useApp();
  const [opts, setOpts] = useState(() => {
    try {
      const saved = localStorage.getItem('agribazzer_privacy_opts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { dataSharing: true, twoFactor: false, publicProfile: true, locAccess: true };
  });

  const toggle = (key) => {
    setOpts((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem('agribazzer_privacy_opts', JSON.stringify(next)); } catch (e) {}
      app.toast('Privacy settings updated');
      return next;
    });
  };

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Privacy & Security" sub="Manage account privacy and data sharing" onBack={app.back} />
      <div className="card" style={{ margin: '16px 16px 14px', padding: '6px 14px', borderRadius: 18 }}>
        <div className="row between" style={{ padding: '14px 2px', borderBottom: '1px solid var(--line)' }}>
          <div className="col">
            <span className="small" style={{ fontWeight: 800 }}>Public Profile</span>
            <span className="tiny muted">Allow buyers to find your profile</span>
          </div>
          <button className={`switch ${opts.publicProfile ? 'on' : ''}`} onClick={() => toggle('publicProfile')} />
        </div>
        <div className="row between" style={{ padding: '14px 2px', borderBottom: '1px solid var(--line)' }}>
          <div className="col">
            <span className="small" style={{ fontWeight: 800 }}>Data Sharing with Agri-Partners</span>
            <span className="tiny muted">Share crop insights with certified buyers</span>
          </div>
          <button className={`switch ${opts.dataSharing ? 'on' : ''}`} onClick={() => toggle('dataSharing')} />
        </div>
        <div className="row between" style={{ padding: '14px 2px', borderBottom: '1px solid var(--line)' }}>
          <div className="col">
            <span className="small" style={{ fontWeight: 800 }}>Two-Factor Authentication</span>
            <span className="tiny muted">Extra layer of SMS login security</span>
          </div>
          <button className={`switch ${opts.twoFactor ? 'on' : ''}`} onClick={() => toggle('twoFactor')} />
        </div>
        <div className="row between" style={{ padding: '14px 2px' }}>
          <div className="col">
            <span className="small" style={{ fontWeight: 800 }}>Precise Location Sharing</span>
            <span className="tiny muted">Required for local logistics matching</span>
          </div>
          <button className={`switch ${opts.locAccess ? 'on' : ''}`} onClick={() => toggle('locAccess')} />
        </div>
      </div>
      <div style={{ padding: '0 16px' }}>
        <Btn block variant="light" icon="shield" onClick={() => app.toast('Data audit report downloaded')}>Download My Data</Btn>
      </div>
    </div>
  );
}

/* ---------- 29d Help & Support ---------- */
export function HelpSupport() {
  const app = useApp();
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    { q: 'How do I sell my produce on AGRIBAZZER?', a: 'Go to the Sell tab, click Publish Produce, enter your crop details and quantity, and AI will automatically match you with buyers!' },
    { q: 'How do I track my procurement token?', a: 'Open My Orders under Farm & Business, or navigate to Procurement Tokens to view live token status and queue predictions.' },
    { q: 'Is payment guaranteed for farmers?', a: 'Yes! All buyer payments are held safely in escrow until you confirm delivery at the procurement center.' },
    { q: 'How does AI Crop Scanning work?', a: 'Tap the green Scan Crop button at the bottom, take a photo of your leaf or crop, and our AI model diagnoses diseases instantly.' },
  ];

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Help & Support" sub="FAQ, Customer Care & Support Center" onBack={app.back} />
      <div style={{ padding: '16px' }}>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <div className="list-card" style={{ borderRadius: 18, marginBottom: 20 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--line)' : 0 }}>
              <button className="list-row" onClick={() => setOpenIdx(openIdx === i ? -1 : i)} style={{ padding: '12px 14px' }}>
                <span className="grow small" style={{ fontWeight: 800, textAlign: 'left', color: 'var(--brand-900)' }}>{f.q}</span>
                <Icon n={openIdx === i ? 'chevD' : 'chevR'} s={18} w={2.2} />
              </button>
              {openIdx === i && (
                <div style={{ padding: '0 14px 14px', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <SectionTitle>Direct Support</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn block variant="primary" icon="chat" onClick={() => app.go('agribot')}>🤖 Chat with AgriBot Support</Btn>
          <Btn block variant="light" icon="phone" onClick={() => app.toast('Calling Toll-Free Support: 1800-AGRI-HELP')}>📞 Call Toll-Free (1800-AGRI-HELP)</Btn>
          <Btn block variant="outline" icon="mail" onClick={() => app.toast('Email support: support@agribazzer.com')}>✉️ Email Support (24x7)</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- 30 Settings ---------- */
export function Settings() {
  const app = useApp();
  const [s, setS] = useState(() => {
    try {
      const saved = localStorage.getItem('agribazzer_app_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { noti: true, weather: true, price: true, buyer: true, loc: true };
  });

  const toggle = (k) => {
    setS((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      try { localStorage.setItem('agribazzer_app_settings', JSON.stringify(next)); } catch (e) {}
      app.toast('Preference updated');
      return next;
    });
  };

  const Toggle = ({ k, icon, t, b }) => (
    <div className="row between" style={{ padding: '12px 2px', borderBottom: '1px solid var(--line)' }}>
      <div className="row" style={{ gap: 10 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <div className="col">
          <span className="small" style={{ fontWeight: 800 }}>{t}</span>
          <span className="tiny muted">{b}</span>
        </div>
      </div>
      <button className={`switch ${s[k] ? 'on' : ''}`} onClick={() => toggle(k)} />
    </div>
  );

  const deleteAccount = async () => {
    const ok = await app.confirm({
      title: 'Delete Account?',
      body: 'Are you sure you want to permanently delete your AGRIBAZZER account and stored data? This action cannot be undone.',
      label: 'Delete Permanently',
      danger: true,
    });
    if (ok) {
      app.toast('Account deleted successfully');
      app.reset('splash');
    }
  };

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 180 }}>
      <MobileHeader title={t('settingsTitle', app?.lang)} sub={t('languageDesc', app?.lang)} onBack={app.back} />
      <div className="card" style={{ margin: '14px 16px', padding: '4px 14px', borderRadius: 18 }}>
        <Toggle k="noti" icon="🔔" t="Push Notifications" b="Orders, payments & matches" />
        <Toggle k="weather" icon="🌧" t="Weather Alerts" b="Rain, heat & spray warnings" />
        <Toggle k="price" icon="📈" t="Price Alerts" b="When your crop price moves ±2%" />
        <Toggle k="buyer" icon="🤝" t="Buyer Match Alerts" b="New AI-matched buyers" />
        <Toggle k="loc" icon="📍" t="Location Access" b="Nearby buyers, markets & weather" />
      </div>
      <div className="card" style={{ margin: '0 16px', padding: 14, borderRadius: 18 }}>
        <Field label={t('prefLanguage', app?.lang)}>
          <div className="select-wrap">
            <select className="select" value={app?.lang || 'en'} onChange={(e) => {
              if (app?.setLang) app.setLang(e.target.value);
              app.toast('Language updated');
            }}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label} ({l.name})</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Units">
          <div className="row" style={{ gap: 8 }}>
            <Chip solid>Metric (kg, acre, °C)</Chip>
            <Chip tone="gray">Imperial</Chip>
          </div>
        </Field>
        <div className="row between" style={{ marginTop: 8 }}>
          <div className="col">
            <span className="small" style={{ fontWeight: 800 }}>Dark Mode</span>
            <span className="tiny muted">Toggle sleek dark theme</span>
          </div>
          <button className={`switch ${app?.darkMode ? 'on' : ''}`} onClick={app?.toggleDarkMode} />
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn block variant="light" icon="shield" onClick={() => app.go('privacy')}>Privacy & Data Sharing</Btn>
        <Btn block variant="light" icon="bot" onClick={() => app.go('agribot')}>Agribot Multi-Language Practice</Btn>
        <Btn block variant="danger" icon="x" onClick={deleteAccount}>Delete Account</Btn>
      </div>
    </div>
  );
}

/* ---------- 31 Language Screen ---------- */
export function LanguageScreen() {
  const app = useApp();
  const currentLang = app?.lang || 'en';
  const [selectedLang, setSelectedLang] = useState(currentLang);

  const saveLanguage = () => {
    if (app?.setLang) {
      app.setLang(selectedLang);
    }
    app.toast(t('langSavedMsg', selectedLang));
    app.back();
  };

  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader
        title={`🌐 ${t('language', selectedLang)}`}
        sub={t('languageDesc', selectedLang)}
        onBack={app.back}
      />
      <div style={{ padding: '16px' }}>
        <div className="card" style={{ padding: '8px 16px', borderRadius: 20, marginBottom: 20 }}>
          <div style={{ padding: '14px 4px 10px', fontWeight: 800, fontSize: 17, color: 'var(--brand-900)', borderBottom: '1px solid var(--line)' }} className="row">
            <span style={{ marginRight: 8, fontSize: 20 }}>🌐</span>
            <span>{t('language', selectedLang)}</span>
          </div>
          {LANGUAGES.map((l) => {
            const isSelected = selectedLang === l.code;
            return (
              <button
                key={l.code}
                className="row between"
                onClick={() => setSelectedLang(l.code)}
                style={{
                  width: '100%',
                  padding: '14px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--line)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div className="row" style={{ gap: 12 }}>
                  <span style={{ fontSize: 18, color: isSelected ? 'var(--brand-700)' : 'var(--muted)' }}>
                    {isSelected ? '🔘' : '○'}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--brand-900)' : 'var(--ink)' }}>
                    {l.label}
                  </span>
                </div>
                {isSelected && (
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--brand-700)' }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Btn block variant="primary" onClick={saveLanguage} style={{ height: 50, borderRadius: 14, fontSize: 16, fontWeight: 800 }}>
          [ {t('saveLanguage', selectedLang)} ]
        </Btn>
      </div>
    </div>
  );
}

/* ---------- 32 Farm Locations Screen ---------- */
export function FarmLocationsScreen() {
  const app = useApp();
  const lang = app?.lang || 'en';
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title={`📍 ${t('farmLocations', lang)}`} sub={t('farmLocationsSub', lang)} onBack={app.back} />
      <div style={{ padding: '16px' }}>
        <div className="card" style={{ padding: 16, borderRadius: 18, marginBottom: 14 }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand-900)' }}>📍 Main Paddy Farm</span>
            <Chip solid>Primary</Chip>
          </div>
          <p className="small muted" style={{ margin: '0 0 8px' }}>Survey No. 44/2, Thanjavur Main Road, Tamil Nadu</p>
          <span className="tiny chip" style={{ background: 'var(--tint-2)', color: 'var(--brand-800)', fontWeight: 700 }}>Size: 5.2 Acres · Soil: Clay Loam</span>
        </div>

        <div className="card" style={{ padding: 16, borderRadius: 18 }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand-900)' }}>📍 Organic Vegetable Plot</span>
            <Chip tone="gray">Secondary</Chip>
          </div>
          <p className="small muted" style={{ margin: '0 0 8px' }}>Plot 12B, Green Valley Agro Belt, Thanjavur</p>
          <span className="tiny chip" style={{ background: 'var(--tint-2)', color: 'var(--brand-800)', fontWeight: 700 }}>Size: 1.8 Acres · Organic Certified</span>
        </div>
      </div>
    </div>
  );
}


