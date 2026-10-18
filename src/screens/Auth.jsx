import React, { useEffect, useRef, useState } from 'react';
import { Btn, Chip, Icon, Logo, MobileHeader, Field, useApp } from '../components.jsx';
import { ONBOARDING, ROLES, USER } from '../data.js';
import api from '../services/api.js';

/* ---------- 01 Splash ---------- */
export function Splash() {
  const app = useApp();
  useEffect(() => {
    const t = setTimeout(() => app.reset('onboarding'), 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="screen no-nav hero-img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, height: '100%', minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <img src="img/hero.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div className="ov" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,35,22,0.35) 0%, rgba(6,35,22,0.65) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="typing" style={{ marginTop: 240 }}><i /><i /><i /></div>
      </div>
    </div>
  );
}

/* ---------- 02 Onboarding (swipeable) ---------- */
export function Onboarding() {
  const app = useApp();
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const onScroll = () => {
    const el = ref.current;
    if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goto = (i) => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' });
  const last = idx === ONBOARDING.length - 1;
  return (
    <div className="screen no-nav" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      <div className="row between" style={{ padding: '14px 16px 0' }}>
        <div className="row" style={{ gap: 8 }}><Logo size={30} /><b style={{ letterSpacing: 0.6 }}>AGRIBAZZER</b></div>
        <button className="btn btn-light xs" onClick={() => app.reset('login')}>Skip</button>
      </div>
      <div className="onb-swiper" ref={ref} onScroll={onScroll} style={{ flex: 1, minHeight: 0 }}>
        {ONBOARDING.map((s, i) => (
          <div className="onb-slide" key={i}>
            <div className="hero-img" style={{ height: '46%', margin: '14px 16px 0', borderRadius: 22 }}>
              <img src={s.img} alt="" />
              <div className="ov" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(6,42,27,.55))' }} />
              <div style={{ position: 'absolute', left: 14, bottom: 14, width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,.94)', display: 'grid', placeItems: 'center', fontSize: 22 }}>{s.emoji}</div>
            </div>
            <div style={{ padding: '20px 26px 0', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="h1">{s.title}</div>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 10 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '6px 24px calc(20px + env(safe-area-inset-bottom,0px))' }}>
        <div className="dots">{ONBOARDING.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} onClick={() => goto(i)} />)}</div>
        <Btn block onClick={() => (last ? app.reset('login') : goto(idx + 1))}>
          {last ? 'Get Started' : 'Next'}
        </Btn>
      </div>
    </div>
  );
}

/* ---------- 03 Login ---------- */
export function Login() {
  const app = useApp();
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const submit = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) { setErr('Enter a valid 10-digit mobile number'); throw new Error('cancel'); }
    setErr('');
    try {
      const res = await api.login({ phone, password: 'password123' });
      if (res.token) {
        localStorage.setItem('agribazzer_token', res.token);
        if (res.user && app.updateProfile) app.updateProfile(res.user);
      }
    } catch (e) {
      console.log('Login API notice:', e.message);
    }
    app.go('otp', { mode: 'login', phone });
  };
  return (
    <div className="screen no-nav hero-img" style={{ padding: 0, height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <img src="img/hero.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div className="ov" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,38,23,0.72) 0%, rgba(6,28,17,0.94) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 20px calc(24px + env(safe-area-inset-bottom,0px))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 16 }}>
          <div style={{ color: '#fff', fontSize: 23, fontWeight: 900, letterSpacing: 1.2 }}>AGRIBAZZER</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 3 }}>From Crop to Customer — One AI Platform</div>
        </div>

        <div className="card" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderRadius: 22, padding: '20px 18px', boxShadow: '0 20px 40px rgba(0,0,0,0.35)', margin: '14px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--brand-950)' }}>Welcome Back 👋</div>
          <p className="muted small" style={{ margin: '4px 0 16px', color: 'var(--muted)' }}>Login with your registered mobile number</p>
          <Field label="Mobile Number" error={err}>
            <div className="row" style={{ gap: 8 }}>
              <span className="chip solid" style={{ background: 'var(--brand-800)', color: '#fff', padding: '9px 12px', fontSize: 13.5, fontWeight: 800, borderRadius: 10 }}>+91</span>
              <input className={`input ${err ? 'invalid' : ''}`} inputMode="numeric" maxLength={10} placeholder="98765 43210" style={{ flex: 1, height: 42, fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
            </div>
          </Field>
          <Btn block icon="chat" onClick={submit} style={{ marginTop: 12 }}>Send OTP</Btn>
          <div className="row between" style={{ marginTop: 14 }}>
            <button className="btn btn-light sm" onClick={() => app.go('signup')} style={{ flex: 1, marginRight: 5 }}>Create Account</button>
            <button className="btn btn-ghost sm" onClick={() => { app.setRole('farmer'); app.reset('home'); }} style={{ flex: 1, marginLeft: 5 }}>Explore as Guest</button>
          </div>
        </div>

        <p className="tiny center" style={{ color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.5 }}>
          By continuing you agree to AGRIBAZZER's <span style={{ textDecoration: 'underline' }}>Terms & Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

/* ---------- OTP ---------- */
export function Otp({ params }) {
  const app = useApp();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [err, setErr] = useState('');
  const [secs, setSecs] = useState(30);
  const refs = useRef([]);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const set = (i, v) => {
    v = v.replace(/\D/g, '');
    const next = [...code];
    if (v.length > 1) {
      v.split('').slice(0, 6).forEach((ch, k) => { if (i + k < 6) next[i + k] = ch; });
      refs.current[Math.min(i + v.length, 5)]?.focus();
    } else {
      next[i] = v;
      if (v && i < 5) refs.current[i + 1]?.focus();
    }
    setCode(next); setErr('');
  };
  const verify = async () => {
    const joined = code.join('');
    if (joined.length < 6) { setErr('Enter the 6-digit OTP'); throw new Error('cancel'); }
    if (joined !== '123456') { setErr('Incorrect OTP. Demo OTP is 123456.'); throw new Error('cancel'); }
    await new Promise((r) => setTimeout(r, 600));
    app.toast('Mobile number verified ✓');
    if (params?.mode === 'signup') app.go('role'); else app.go('role');
  };
  return (
    <div className="screen no-nav" style={{ padding: 0 }}>
      <MobileHeader title="Verify OTP" sub={`Sent to +91 ${params?.phone || '98765 43210'}`} />
      <div style={{ padding: '26px 24px' }}>
        <div className="center li-icon" style={{ width: 62, height: 62, margin: '0 auto 14px', fontSize: 26, borderRadius: 18 }}>🔐</div>
        <div className="h2 center">Enter 6-digit code</div>
        <div className="otp-row">
          {code.map((c, i) => (
            <input key={i} className="otp-box" inputMode="numeric" value={c}
              ref={(el) => (refs.current[i] = el)}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus(); }} />
          ))}
        </div>
        {err && <div className="err center small" style={{ color: 'var(--red)', fontWeight: 700 }}>{err}</div>}
        <div className="center" style={{ margin: '10px 0 18px' }}>
          <Chip tone="amber">Demo OTP: 123456</Chip>
        </div>
        <Btn block icon="shield" onClick={verify}>Verify & Continue</Btn>
        <p className="small muted center" style={{ marginTop: 16 }}>
          {secs > 0 ? <>Resend OTP in 0:{String(secs).padStart(2, '0')}</> : <button className="btn btn-ghost xs" onClick={() => { setSecs(30); app.toast('OTP resent'); }}>Resend OTP</button>}
        </p>
      </div>
    </div>
  );
}

/* ---------- Sign up ---------- */
export function Signup() {
  const app = useApp();
  const [f, setF] = useState({ name: '', phone: '', loc: '' });
  const [errs, setErrs] = useState({});
  const submit = async () => {
    const e = {};
    if (f.name.trim().length < 3) e.name = 'Enter your full name';
    if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (!f.loc) e.loc = 'Add your location so AI can match nearby buyers';
    setErrs(e);
    if (Object.keys(e).length) throw new Error('cancel');
    await new Promise((r) => setTimeout(r, 600));
    app.go('otp', { mode: 'signup', phone: f.phone });
  };
  return (
    <div className="screen no-nav" style={{ padding: 0 }}>
      <MobileHeader title="Create Account" sub="Join AGRIBAZZER in 2 minutes" />
      <div style={{ padding: '20px 20px' }}>
        <Field label="Full Name" error={errs.name}>
          <input className="input" placeholder="e.g. Ramesh Kumar" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Mobile Number" error={errs.phone}>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip gray lg" style={{ background: '#eef1ee' }}>+91</span>
            <input className="input" inputMode="numeric" maxLength={10} placeholder="98765 43210" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} />
          </div>
        </Field>
        <Field label="Location" error={errs.loc}>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" placeholder="Village / District" value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })} />
            <Btn sm variant="ghost" icon="pin" onClick={() => setF({ ...f, loc: 'Thanjavur, Tamil Nadu' })}>Use Current</Btn>
          </div>
        </Field>
        <Btn block icon="chat" onClick={submit}>Send OTP</Btn>
        <p className="tiny muted center" style={{ marginTop: 14, lineHeight: 1.6 }}>By continuing you agree to our Terms & Privacy Policy.</p>
        <button className="btn btn-light xs block" style={{ marginTop: 10 }} onClick={app.back}>Back to Login</button>
      </div>
    </div>
  );
}

/* ---------- 04 Role selection ---------- */
export function RoleSelect() {
  const app = useApp();
  const [role, setRole] = useState('farmer');
  return (
    <div className="screen no-nav" style={{ padding: 0 }}>
      <MobileHeader title="Who are you?" sub="Choose your role to continue" back={false} />
      <div style={{ padding: '18px 16px' }}>
        {ROLES.map((r) => (
          <button key={r.id} className="card" onClick={() => setRole(r.id)}
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 10, display: 'block',
              boxShadow: role === r.id ? '0 0 0 2px var(--brand-600), var(--shadow)' : 'var(--shadow)' }}>
            <div className="row">
              <div className="li-icon" style={{ fontSize: 19 }}>{r.emoji}</div>
              <div className="col grow">
                <span style={{ fontWeight: 800 }}>{r.title}</span>
                <span className="tiny muted">{r.body}</span>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${role === r.id ? 'var(--brand-600)' : '#cfd9cf'}`, display: 'grid', placeItems: 'center' }}>
                {role === r.id && <Icon n="check" s={13} w={3} />}
              </div>
            </div>
          </button>
        ))}
        <Btn block onClick={() => { app.setRole(role); app.go('permissions'); }}>Continue</Btn>
      </div>
    </div>
  );
}

/* ---------- 10 Permissions ---------- */
export function Permissions() {
  const app = useApp();
  const [st, setSt] = useState({ cam: null, loc: null, noti: null });
  const rows = [
    { k: 'cam', icon: '📷', t: 'Camera', b: 'For crop scanning, disease detection & produce photos' },
    { k: 'loc', icon: '📍', t: 'Location', b: 'For nearby buyers, markets, procurement centres & weather' },
    { k: 'noti', icon: '🔔', t: 'Notifications', b: 'For price alerts, buyer matches & weather warnings' },
  ];
  return (
    <div className="screen no-nav" style={{ padding: 0 }}>
      <MobileHeader title="Allow AGRIBAZZER to access" sub="These make the AI accurate for your farm" back={false} />
      <div style={{ padding: '18px 16px' }}>
        {rows.map((r) => (
          <div className="card" key={r.k} style={{ marginBottom: 10 }}>
            <div className="row">
              <div className="li-icon" style={{ fontSize: 18 }}>{r.icon}</div>
              <div className="col grow">
                <span style={{ fontWeight: 800, fontSize: 14 }}>{r.t}</span>
                <span className="tiny muted" style={{ lineHeight: 1.45, marginTop: 2 }}>{r.b}</span>
              </div>
              <Btn xs variant={st[r.k] === true ? 'ghost' : st[r.k] === false ? 'light' : 'primary'}
                onClick={() => setSt({ ...st, [r.k]: st[r.k] === true ? false : true })}>
                {st[r.k] === true ? 'Allowed ✓' : st[r.k] === false ? 'Denied' : 'Allow'}
              </Btn>
            </div>
          </div>
        ))}
        <div className="insight-card" style={{ margin: '4px 0 14px' }}>
          <div className="ic-body" style={{ margin: 0 }}>
            🛈 Location is only used to show nearby buyers, markets and weather. You can change this anytime in Settings.
          </div>
        </div>
        <Btn block onClick={() => { app.setTab('home'); app.reset('home'); app.toast(`Welcome to AGRIBAZZER, ${USER.name.split(' ')[0]}! 🌱`); }}>
          Allow & Continue
        </Btn>
        <button className="btn btn-light xs block" style={{ marginTop: 10 }} onClick={() => { app.setTab('home'); app.reset('home'); }}>
          Not now
        </button>
      </div>
    </div>
  );
}
