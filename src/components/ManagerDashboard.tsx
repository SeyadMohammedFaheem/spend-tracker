import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserCheck, 
  Building, 
  TrendingUp, 
  Plus, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  Paperclip,
  ExternalLink,
  Users
} from 'lucide-react';
import { SpendRequest, UserPersona } from '../types';
import { UserAvatar } from './UserAvatar';

interface ManagerDashboardProps {
  persona?: UserPersona | null;
  requests: SpendRequest[];
  onApprove: (requestId: string, note?: string) => void;
  onReject: (requestId: string, reason?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  persona,
  requests,
  onApprove,
  onReject,
  onNavigateTab
}) => {
  const managerName = persona?.name || 'Priya Mehta';
  const managerRole = persona?.title || 'Office Manager';
  const departmentName = persona?.department || 'Facilities & Workplace';

  const pendingApprovals = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const pendingAmount = pendingApprovals.reduce((sum, r) => sum + r.amount, 0);

  // Department Budget math
  const budgetCap = 1500000;
  const budgetSpent = 640000;
  const budgetRemaining = budgetCap - budgetSpent;
  const budgetPct = Math.round((budgetSpent / budgetCap) * 100);

  const [approvedActionIds, setApprovedActionIds] = useState<string[]>([]);

  const handleQuickApprove = (id: string) => {
    onApprove(id, 'Approved via Department Dashboard');
    setApprovedActionIds([...approvedActionIds, id]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Editorial Header ─── */}
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
            Department Leadership · {departmentName}
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
            Department Dashboard
          </h1>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Overview of team clearance requests, approval velocity, operational budgets, and spending governance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => onNavigateTab('approvals')}
            className="btn-create-rule"
            style={{
              background: 'var(--brand-primary)',
              border: '1px solid var(--brand-primary)',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <CheckCircle2 size={15} />
            <span>Review Approvals ({pendingApprovals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('dept_requests')}
            className="btn-outline"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Clock size={14} />
            <span>My Requests</span>
          </button>
        </div>
      </div>

      {/* ─── 4-Card Bento Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16
      }}>
        {/* Card 1: Pending Queue */}
        <div className="main-table-card" style={{
          padding: '20px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Pending Review Queue
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'var(--status-amber-bg)',
                color: 'var(--status-amber-text)',
                border: '1px solid var(--status-amber-border)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)'
              }}>
                Needs Action
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {pendingApprovals.length}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                requests · ₹{pendingAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Oldest request submitted today at 2:15 PM · Turnaround SLA on track.
          </div>
        </div>

        {/* Card 2: Department Budget */}
        <div className="main-table-card" style={{
          padding: '20px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Monthly Department Budget
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)'
              }}>
                {budgetPct}% Spent
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                ₹{budgetRemaining.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                remaining
              </span>
            </div>

            <div style={{ width: '100%', height: 6, background: '#EAE6DF', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${budgetPct}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: 999 }} />
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            ₹{budgetSpent.toLocaleString('en-IN')} allocated of ₹{budgetCap.toLocaleString('en-IN')} team allocation cap.
          </div>
        </div>

        {/* Card 3: SLA Turnaround */}
        <div className="main-table-card" style={{
          padding: '20px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Approval Velocity
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'var(--status-emerald-bg)',
                color: 'var(--status-emerald-text)',
                border: '1px solid var(--status-emerald-border)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)'
              }}>
                96% on-time
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                4.2 hrs
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                median decision time
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Average decision turnaround well within 24-hour skip-level SLA.
          </div>
        </div>

        {/* Card 4: Team Requesters */}
        <div className="main-table-card" style={{
          padding: '20px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Active Team Members
              </span>
              <Users size={15} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                4
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                staff requesters
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Arun Nair, Neha Sharma, Ravi Kumar, Meera Patel
          </div>
        </div>
      </div>

      {/* ─── Urgent Approvals Inbox (Direct 1-Click Action) ─── */}
      <div className="main-table-card" style={{
        padding: '22px 24px',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Pending Approval Stream</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Authorize expenditures or inspect details</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('approvals')}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600 }}
          >
            Open Full Inbox ({pendingApprovals.length})
          </button>
        </div>

        {pendingApprovals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            <CheckCircle2 size={32} color="#166534" style={{ margin: '0 auto 8px', display: 'block' }} />
            All department requests have been cleared. Zero pending approvals.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingApprovals.slice(0, 3).map(req => {
              const justApproved = approvedActionIds.includes(req.id);

              return (
                <div 
                  key={req.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: justApproved ? '#F0FDF4' : 'var(--bg-app)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    transition: 'all 200ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserAvatar name={req.requesterName} avatarUrl={req.requesterAvatar} size={36} shape="circle" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {req.requesterName}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({req.requesterRole} · {req.department})
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: '#F0ECE1',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          color: 'var(--text-primary)'
                        }}>
                          {req.category}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                        {req.description}
                      </div>

                      {req.attachmentName && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          <Paperclip size={11} />
                          <span>{req.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span className="mono-amount" style={{ fontSize: '1.08rem', fontWeight: 700 }}>
                      ₹{req.amount.toLocaleString('en-IN')}
                    </span>

                    {justApproved ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#166534',
                        background: '#EBF5EE',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        <Check size={13} /> Approved
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleQuickApprove(req.id)}
                          style={{
                            background: 'var(--brand-primary)',
                            color: '#FFFFFF',
                            border: '1px solid var(--brand-primary)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Check size={12} /> Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigateTab('approvals')}
                          style={{
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.76rem',
                            cursor: 'pointer'
                          }}
                        >
                          Review →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Two-Column: Category Distribution + Department Spend Rules ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18,
        alignItems: 'stretch'
      }}>
        {/* Category Breakdown */}
        <div className="main-table-card" style={{
          padding: '22px 24px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 14px 0' }}>Department Spend Breakdown</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Office Supplies & Pantry Restock</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹2,88,000 (45%)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0ECE1', borderRadius: 999 }}>
                <div style={{ width: '45%', height: '100%', background: '#111111', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Hardware & Workplace IT</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹1,92,000 (30%)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0ECE1', borderRadius: 999 }}>
                <div style={{ width: '30%', height: '100%', background: '#111111', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Software & SaaS Subscriptions</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹96,000 (15%)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0ECE1', borderRadius: 999 }}>
                <div style={{ width: '15%', height: '100%', background: '#111111', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Meals & Miscellaneous</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹64,000 (10%)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0ECE1', borderRadius: 999 }}>
                <div style={{ width: '10%', height: '100%', background: '#111111', borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Governing Rules */}
        <div className="main-table-card" style={{
          padding: '22px 24px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 14px 0' }}>Enforced Department Policies</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>POL-002: Office Supplies Exception</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Office Management staff spend &gt; ₹10,000 routes directly to Office Manager (Priya Mehta) instead of CFO.</div>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>POL-003: Operational Allowance</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Department heads have pre-cleared purchasing authority for team operational requirements under ₹1,00,000.</div>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>SLA Escalation Policy</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Any request pending &gt; 24 hours automatically alerts skip-level CFO Vikram Malhotra.</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 14 }}>
            Maintained by Finance Admin <strong>Rohan Sharma</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
