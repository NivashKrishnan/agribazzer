/* Screens 21 Procurement, 22 Token, 23 Queue Prediction, 24 Logistics Tracking */
import React from 'react';
import {
  Btn, Chip, Icon, MobileHeader, SectionTitle, ProcurementTokenCard, QueueCard, useApp,
} from '../components.jsx';
import { LOGISTICS, QUEUE, TOKEN } from '../data.js';

/* ---------- 21 Smart Procurement hub ---------- */
export function Procurement() {
  const app = useApp();
  const cancel = async () => {
    const ok = await app.confirm({ title: 'Cancel token #AB-01-0001?', body: 'You will lose queue position #1. A new token will go to the back of the queue (est. 2.4 h wait at peak).', label: 'Cancel Token', danger: true });
    if (ok) app.toast('Token cancelled. You can re-book anytime.');
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Smart Procurement" sub="Thanjavur Agri Procurement Centre" />
      <div style={{ padding: '14px 16px 0' }}>
        <ProcurementTokenCard t={TOKEN} onLogistics={() => app.go('logistics')} onCancel={cancel} />
      </div>
      <SectionTitle>Centre Live Status</SectionTitle>
      <div className="row" style={{ gap: 8, padding: '0 16px' }}>
        <div className="stat-tile"><div className="v">{TOKEN.vehiclesAhead}</div><div className="l">Vehicle ahead</div></div>
        <div className="stat-tile"><div className="v">{TOKEN.bays}</div><div className="l">Active bays</div></div>
        <div className="stat-tile"><div className="v" style={{ fontSize: 13 }}>{TOKEN.capacity}</div><div className="l">Capacity</div></div>
      </div>
      <div style={{ padding: '12px 16px 0' }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="row between">
            <span className="small" style={{ fontWeight: 700 }}>⏱ Avg unloading</span>
            <span className="small muted">{TOKEN.unloading}</span>
          </div>
          <div className="row between" style={{ marginTop: 8 }}>
            <span className="small" style={{ fontWeight: 700 }}>🕒 Best arrival (AI)</span>
            <Chip solid>{TOKEN.bestArrival}</Chip>
          </div>
        </div>
      </div>
      <div className="row" style={{ gap: 10, padding: '14px 16px 0' }}>
        <Btn block icon="chart" onClick={() => app.go('queue')}>Queue Prediction</Btn>
        <Btn block variant="ghost" icon="truck" onClick={() => app.go('logistics')}>Logistics</Btn>
      </div>
      <div className="insight-card" style={{ margin: '14px 16px 0' }}>
        <div className="ic-head"><Icon n="spark" s={14} w={2} /> HOW TOKENS HELP</div>
        <div className="ic-body">Digital tokens remove physical queuing: you arrive at the AI-suggested time, unload immediately and get paid the same day.</div>
      </div>
    </div>
  );
}

/* ---------- 22 Procurement Token ---------- */
export function Token() {
  const app = useApp();
  const cancel = async () => {
    const ok = await app.confirm({ title: 'Cancel token #AB-01-0001?', body: 'Your queue position #1 will be released to the next farmer. This cannot be undone.', label: 'Cancel Token', danger: true });
    if (ok) app.toast('Token cancelled');
  };
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Procurement Token" sub="Digital queue pass" />
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(140deg, var(--brand-700), var(--brand-950))', color: '#fff', boxShadow: 'var(--shadow-lg)' }}>
          <div className="row between" style={{ padding: '16px 18px 12px' }}>
            <div className="row" style={{ gap: 10 }}><Icon n="ticket" s={22} w={2} /><b style={{ letterSpacing: 0.6 }}>TOKEN #{TOKEN.id}</b></div>
            <Chip>{TOKEN.status}</Chip>
          </div>
          <div style={{ borderTop: '2px dashed rgba(255,255,255,.35)', margin: '0 14px' }} />
          <div style={{ padding: '14px 18px 18px' }}>
            <div className="grid-2" style={{ gap: 12 }}>
              <div><div className="tiny" style={{ opacity: 0.7 }}>QUEUE POSITION</div><div style={{ fontSize: 30, fontWeight: 900 }}>{TOKEN.queue}</div></div>
              <div><div className="tiny" style={{ opacity: 0.7 }}>AI PREDICTED WAIT</div><div style={{ fontSize: 30, fontWeight: 900 }}>{TOKEN.wait}</div></div>
            </div>
            <div className="row" style={{ gap: 14, marginTop: 10, fontSize: 12.5, opacity: 0.92 }}>
              <span>🚛 {TOKEN.vehiclesAhead} vehicle ahead</span>
              <span>🏭 {TOKEN.bays} bays active</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 12, padding: 4 }}>
          {[['Procurement Centre', TOKEN.centre], ['Crop', TOKEN.crop], ['Quantity', TOKEN.qty], ['Avg unloading', TOKEN.unloading], ['Processing capacity', TOKEN.capacity], ['Best arrival (AI)', TOKEN.bestArrival]].map(([l, v], i, a) => (
            <div className="row between" key={l} style={{ padding: '11px 12px', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span className="small muted" style={{ fontWeight: 600 }}>{l}</span>
              <span className="small" style={{ fontWeight: 800, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 10, marginTop: 14 }}>
          <Btn block icon="truck" onClick={() => app.go('logistics')}>Proceed to Logistics</Btn>
          <Btn block variant="danger" onClick={cancel}>Cancel Token</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- 23 AI Queue Prediction ---------- */
export function QueuePrediction() {
  const app = useApp();
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="AI Queue Prediction" sub="Thanjavur Agri Procurement Centre" />
      <div style={{ padding: '14px 16px 0' }}><QueueCard q={QUEUE} /></div>
      <SectionTitle>Factors Considered</SectionTitle>
      <div className="card" style={{ margin: '0 16px', padding: 6 }}>
        {QUEUE.factors.map((fx, i) => (
          <div className="row" key={fx} style={{ gap: 9, padding: '9px 8px', borderBottom: i < QUEUE.factors.length - 1 ? '1px solid var(--line)' : 0 }}>
            <Icon n="check" s={14} w={2.6} className="" />
            <span className="small" style={{ fontWeight: 600 }}>{fx}</span>
          </div>
        ))}
      </div>
      <div className="insight-card" style={{ margin: '14px 16px' }}>
        <div className="ic-body" style={{ margin: 0 }}>💡 Arrive {TOKEN.bestArrival} to skip the 11 AM–2 PM peak. Queue updates live every 5 minutes.</div>
      </div>
      <div style={{ padding: '0 16px' }}>
        <Btn block icon="ticket" onClick={() => app.go('token')}>View My Token</Btn>
      </div>
    </div>
  );
}

/* ---------- 24 Logistics Tracking ---------- */
export function Logistics() {
  const app = useApp();
  return (
    <div className="screen" style={{ padding: 0, paddingBottom: 150 }}>
      <MobileHeader title="Logistics Tracking" sub={`Shipment ${LOGISTICS.id} · ${LOGISTICS.eta}`} />
      <div className="map-box">
        <svg width="100%" height="100%" viewBox="0 0 360 170" preserveAspectRatio="none">
          <rect width="360" height="170" fill="#e6efe2" />
          <g stroke="#cfe0cb" strokeWidth="10">
            <path d="M0 40h360M0 100h360M60 0v170M180 0v170M300 0v170" />
          </g>
          <g stroke="#b9d3b4" strokeWidth="4">
            <path d="M0 70h360M0 140h360M120 0v170M240 0v170" />
          </g>
          <path d="M40 130 C 90 120, 120 70, 180 72 S 280 60, 320 34" fill="none" stroke="#1f8a4c" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" />
          <circle cx="40" cy="130" r="7" fill="#0e5a34" />
          <circle cx="320" cy="34" r="8" fill="#fff" stroke="#0e5a34" strokeWidth="3" />
          <g transform="translate(168,60)"><circle r="12" fill="#0e5a34" /><text y="4.5" textAnchor="middle" fontSize="12" fill="#fff">🚚</text></g>
          <text x="46" y="148" fontSize="10" fill="#5c6b60" fontWeight="700">Farm</text>
          <text x="268" y="24" fontSize="10" fill="#5c6b60" fontWeight="700">Procurement Centre</text>
        </svg>
        <Chip solid className="" style={{ position: 'absolute', right: 12, bottom: 12 }}>{LOGISTICS.eta}</Chip>
      </div>
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="row">
            <div className="li-icon" style={{ borderRadius: '50%' }}>🧑‍✈️</div>
            <div className="col grow">
              <span style={{ fontWeight: 800, fontSize: 14 }}>{LOGISTICS.driver} · ⭐ {LOGISTICS.rating}</span>
              <span className="tiny muted">{LOGISTICS.vehicle}</span>
            </div>
            <Btn xs variant="ghost" icon="phone" onClick={() => app.toast('Calling driver…')}>Call</Btn>
          </div>
        </div>
      </div>
      <SectionTitle>Shipment Journey</SectionTitle>
      <div className="steps">
        {LOGISTICS.steps.map((s, i) => (
          <div key={s.label}>
            <div className={`step ${s.state}`}>
              <div className="st-ic">
                {s.state === 'done' ? <Icon n="check" s={15} w={2.8} /> : s.state === 'active' ? <span className="spin" style={{ width: 13, height: 13 }} /> : <Icon n="clock" s={14} w={2} />}
              </div>
              <div className="col grow">
                <span className="small" style={{ fontWeight: 800, color: s.state === 'pending' ? 'var(--muted)' : 'var(--ink)' }}>{s.label}</span>
                <span className="tiny muted">{s.time}</span>
              </div>
              {s.state === 'active' && <Chip tone="amber">In Progress</Chip>}
              {s.state === 'done' && <Chip>Completed</Chip>}
            </div>
            {i < LOGISTICS.steps.length - 1 && <div className="st-line" style={{ marginLeft: 16 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: '4px 16px 0' }}>
        <Btn block icon="wallet" onClick={() => app.go('payment')}>View Payment Status</Btn>
      </div>
    </div>
  );
}
