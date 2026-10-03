import React from 'react';
import { 
  Compass, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Target,
  FileText,
  Sparkles
} from 'lucide-react';

export const StrategicFraming: React.FC = () => {
  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Hero Framing Banner */}
      <div className="strategy-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
          <Compass size={16} />
          <span>Product Strategy & Design Rationale • Assignment Deliverables</span>
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
          Spend Policy & Approval Builder: Core Architecture
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 6, maxWidth: '840px', lineHeight: 1.6 }}>
          Addressing the systemic failure of 140 accumulated rules, employee friction across 4 countries, 
          and finance team anxiety through mathematical simplification, visual confidence, and zero-fear sandboxing.
        </p>
      </div>

      {/* Deliverable 1: Problem Framing */}
      <div className="card-panel">
        <div className="card-header-bar">
          <div className="panel-title-area">
            <h2>
              <Target size={18} color="#6366f1" />
              <span>Deliverable 1: Problem Framing & Scope Boundaries</span>
            </h2>
            <p>How the problem was decomposed and what was intentionally left out (with explicit rationale).</p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Problem Breakdown */}
          <div style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginBottom: 10 }}>
              The 3 Root Failures of the 140-Rule Sprawl
            </h4>
            <ul style={{ paddingLeft: 18, fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.5 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>1. Undefined Precedence:</strong> When 2 rules match the same spend, 
                the legacy system either randomly picked one or escalated to Finance, destroying predictability.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>2. Tightly Coupled Named Identity:</strong> Rules hardcoded individual people 
                (<em>"Sarah Jenkins"</em>) rather than organizational roles, causing 100% breakage when employees leave or take leave.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>3. "Terror of Breaking Spend":</strong> Rohan had no dry-run capability. 
                Any rule edit had the potential to decline cards for 600 employees in mid-checkout.
              </li>
            </ul>
          </div>

          {/* What We Left Out */}
          <div style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fb7185', marginBottom: 10 }}>
              What We Intentionally Chose NOT to Build (and Why)
            </h4>
            <ul style={{ paddingLeft: 18, fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.5 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Left Out: Custom Code/Python Scripting:</strong> While developers love code, 
                Rohan is comfortable with logic, not syntax. Code snippets cannot be statically analyzed for conflicts, cannot be diffed cleanly for the CFO, and create security vectors.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Left Out: Nested Boolean Formula Builders ((A OR B) AND (C NOT D)):</strong> 
                Academic research proves non-technical admins make catastrophic logic inversion mistakes in nested boolean editors. 
                Replaced with <em>faceted condition tags + Plain English generation</em>.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Left Out: Individual Per-Employee Static Budgets:</strong> Managing 600 personal budgets 
                creates untenable maintenance overhead. Replaced with <em>Role-based caps + Departmental allowances</em>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deliverable 2: Mental Model */}
      <div className="card-panel">
        <div className="card-header-bar">
          <div className="panel-title-area">
            <h2>
              <Layers size={18} color="#10b981" />
              <span>Deliverable 2: The Mental Model (Explainable to a New Hire in 2 Minutes)</span>
            </h2>
            <p>How policies and approvals relate: The Three-Gate Decision Pipeline.</p>
          </div>
        </div>

        <div className="hierarchy-diagram-box">
          <div className="hierarchy-step step-1">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>Gate 1: Condition Matching (Who, What, Where, How Much)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                When a swipe or invoice arrives, the engine evaluates 7 factual dimensions: Amount, Merchant, Category, Department, Entity, Level, and Spend Type.
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '4px 0', color: 'var(--text-muted)' }}>▼</div>

          <div className="hierarchy-step step-2">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>Gate 2: Specificity Hierarchy ("The Most Specific Rule Always Wins")</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                If multiple rules match, precedence is mathematically resolved: 
                <strong> Specific Merchant &gt; Specific Category &gt; Specific Department &gt; Company-Wide Blanket Default</strong>. 
                Rohan never has to guess which rule wins.
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '4px 0', color: 'var(--text-muted)' }}>▼</div>

          <div className="hierarchy-step step-3">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>Gate 3: Resilient Dynamic Dispatch (Action & Fallbacks)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                If verdict is <strong>Auto-Approve</strong>, spend executes immediately. If <strong>Approval Required</strong>, routes dynamically to the employee's active manager via HRIS. 
                If the approver is on leave or SLA expires, auto-escalates to skip-level or Entity Finance Pool.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable 7: Success Measures */}
      <div className="card-panel">
        <div className="card-header-bar">
          <div className="panel-title-area">
            <h2>
              <TrendingUp size={18} color="#f59e0b" />
              <span>Deliverable 7: Success Metrics (How We Know Admins Trust the System Again)</span>
            </h2>
            <p>Quantifiable operational KPIs demonstrating that finance confidence has been completely restored.</p>
          </div>
        </div>

        <div className="grid-3" style={{ gap: 16 }}>
          <div style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Metric 1</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', margin: '6px 0' }}>From 100% ➔ 8%</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Finance Manual Review Queue Rate</div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              The ultimate litmus test: Rohan and his team stop manually inspecting everyday transactions because policies self-execute reliably.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Metric 2</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8', margin: '6px 0' }}>0 Incidents</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Broken Routes / Orphaned Spend</div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Zero spend requests delayed or blocked due to departed employees or inactive managers thanks to dynamic role decoupling.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Metric 3</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', margin: '6px 0' }}>-64% Pings</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Department Head Alert Fatigue</div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Trivial micro-spend (&lt;$25 Uber, coffee) is auto-cleared, while big purchases are never bypassed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
