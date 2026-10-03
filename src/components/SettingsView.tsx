import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  ShieldCheck, 
  Clock, 
  Check, 
  Sliders, 
  Sparkles,
  Save,
  CheckCircle2,
  Mail,
  MessageSquare
} from 'lucide-react';
import { UserRole, UserPersona } from '../types';

interface SettingsViewProps {
  userRole?: UserRole;
  persona?: UserPersona | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userRole, persona }) => {
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [defaultSla, setDefaultSla] = useState('24');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [strictAudit, setStrictAudit] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>
      {/* ─── Header ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 20,
        borderBottom: '1px solid var(--border-subtle)',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: 4
          }}>
            System Preferences · SpendFlow Governance
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Settings
          </h1>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Manage base currencies, SLA escalation limits, notification webhooks, and audit logging.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn-create-rule"
          style={{
            background: saved ? '#166534' : 'var(--brand-primary)',
            color: '#FFFFFF',
            padding: '9px 18px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 2px 6px rgba(15, 76, 58, 0.2)',
            transition: 'background 200ms ease'
          }}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={15} />}
          <span>{saved ? 'Settings Saved' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* ─── Section 1: Currency & Region ─── */}
      <div className="main-table-card" style={{ padding: '22px 24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Globe size={18} color="var(--text-primary)" />
          <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Currency & Entity Defaults</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              Primary Reporting Currency
            </label>
            <select 
              className="form-input" 
              value={baseCurrency} 
              onChange={e => setBaseCurrency(e.target.value)}
              style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%' }}
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              Default Corporate Entity
            </label>
            <input 
              type="text" 
              className="form-input" 
              value="IN - India Operations (Bangalore HQ)" 
              disabled 
              style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%', background: 'var(--bg-subtle)' }}
            />
          </div>
        </div>
      </div>

      {/* ─── Section 2: Approvals & Turnaround SLA ─── */}
      <div className="main-table-card" style={{ padding: '22px 24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Clock size={18} color="var(--text-primary)" />
          <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Approval Routing & SLAs</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              Standard Step SLA (Hours)
            </label>
            <select 
              className="form-input" 
              value={defaultSla} 
              onChange={e => setDefaultSla(e.target.value)}
              style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%' }}
            >
              <option value="12">12 Hours (Fast-track)</option>
              <option value="24">24 Hours (Standard)</option>
              <option value="48">48 Hours (Relaxed)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500 }}>
              <input 
                type="checkbox" 
                checked={autoEscalate} 
                onChange={e => setAutoEscalate(e.target.checked)} 
                style={{ width: 16, height: 16, accentColor: '#111111' }}
              />
              <span>Auto-escalate to Skip-level Manager upon SLA breach</span>
            </label>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: 26, marginTop: 2 }}>
              If approver does not respond in {defaultSla}h, request routes to department head automatically.
            </span>
          </div>
        </div>
      </div>

      {/* ─── Section 3: Notification Alerts ─── */}
      <div className="main-table-card" style={{ padding: '22px 24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Bell size={18} color="var(--text-primary)" />
          <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Notification Channels</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500 }}>
            <input 
              type="checkbox" 
              checked={emailAlerts} 
              onChange={e => setEmailAlerts(e.target.checked)} 
              style={{ width: 16, height: 16, accentColor: '#111111' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={15} color="var(--text-secondary)" />
              <span>Email Alerts for Approvals & Status Updates</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500 }}>
            <input 
              type="checkbox" 
              checked={slackAlerts} 
              onChange={e => setSlackAlerts(e.target.checked)} 
              style={{ width: 16, height: 16, accentColor: '#111111' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={15} color="var(--text-secondary)" />
              <span>Slack & Microsoft Teams Webhook Integrations</span>
            </div>
          </label>
        </div>
      </div>

      {/* ─── Section 4: Audit & Compliance ─── */}
      <div className="main-table-card" style={{ padding: '22px 24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <ShieldCheck size={18} color="var(--text-primary)" />
          <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Compliance & Immutable Ledger</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Strict Audit Trail & Rollback Engine</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Logs all rule alterations, approvals, broken route healings, and simulation passes.
            </div>
          </div>

          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            background: '#EBF5EE',
            color: '#166534',
            border: '1px solid #C6E7D2',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}>
            <Check size={13} /> Active & Compliant
          </span>
        </div>
      </div>

      {/* ─── Section 5: Brand Identity & Design System ─── */}
      <div className="main-table-card" style={{ padding: '22px 24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="var(--brand-primary)" />
            <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Brand Accent & Visual Identity</h2>
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--brand-surface)',
            color: 'var(--brand-text)',
            border: '1px solid var(--brand-border)'
          }}>
            Active Theme: Deep Pine Emerald
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          SpendFlow utilizes an executive fintech aesthetic inspired by modern spend platforms (Ramp &amp; Mercury). The deep pine palette represents financial liquidity, verified approvals, and enterprise trust.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand-border)', background: 'var(--brand-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--brand-text)' }}>Primary Brand (#0F4C3A)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SpendFlow Icon, Primary Buttons, Active Accents</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>Surface Tint (#F0F6F3)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Nav Highlight, Subtle Badges</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--brand-border)' }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hairline Sage (#C8DCD3)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Focus Rings &amp; Subtle Metric Dividers</div>
          </div>
        </div>
      </div>
    </div>
  );
};
