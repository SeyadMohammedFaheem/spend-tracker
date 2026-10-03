import React, { useState } from 'react';
import { Link2Off, ArrowRight, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { BrokenRouteAlert } from '../types';

interface BrokenRoutesProps {
  brokenRoutes: BrokenRouteAlert[];
  onHealRoute: (brokenId: string, replacementName: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const BrokenRoutes: React.FC<BrokenRoutesProps> = ({
  brokenRoutes,
  onHealRoute,
  onNavigateTab
}) => {
  const [selectedReplacement, setSelectedReplacement] = useState<Record<string, string>>({});
  const [healedRoutes, setHealedRoutes] = useState<string[]>([]);

  const handleHeal = (routeId: string) => {
    const replacement = selectedReplacement[routeId];
    if (!replacement) return;
    onHealRoute(routeId, replacement);
    setHealedRoutes([...healedRoutes, routeId]);
  };

  const getIssueLabel = (issue: string) => {
    switch (issue) {
      case 'DEPARTED': return 'Left the company';
      case 'ON_LEAVE': return 'On leave';
      case 'TRANSFERRED': return 'Transferred to another team';
      default: return issue;
    }
  };

  if (brokenRoutes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>All approval routes healthy</h2>
        <p style={{ color: 'var(--text-muted)' }}>No approvers are currently unavailable.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Broken Approval Routes</h1>
          <p className="page-subtitle">
            {brokenRoutes.length} approval route{brokenRoutes.length !== 1 ? 's' : ''} need attention. 
            Approvers are no longer available — assign replacements to restore these routes.
          </p>
        </div>
      </div>

      {brokenRoutes.map(route => {
        const isHealed = healedRoutes.includes(route.id);

        return (
          <div 
            key={route.id} 
            className="main-table-card" 
            style={{ 
              marginBottom: 24, 
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    width: 42, 
                    height: 42, 
                    borderRadius: 'var(--radius-sm)', 
                    background: isHealed ? 'var(--status-emerald-bg)' : 'var(--status-rose-bg)', 
                    border: `1px solid ${isHealed ? 'var(--status-emerald-border)' : 'var(--status-rose-border)'}`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isHealed 
                      ? <CheckCircle2 size={20} color="var(--status-emerald-text)" /> 
                      : <Link2Off size={20} color="var(--status-rose-text)" />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                      {isHealed ? 'Route Restored & Auto-Healed' : 'Broken Approval Route'}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{route.personName}</strong> is no longer available. Left the company on {route.since}.
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: isHealed ? 'var(--status-emerald-bg)' : 'var(--status-rose-bg)',
                  color: isHealed ? 'var(--status-emerald-text)' : 'var(--status-rose-text)',
                  border: `1px solid ${isHealed ? 'var(--status-emerald-border)' : 'var(--status-rose-border)'}`,
                  whiteSpace: 'nowrap'
                }}>
                  {getIssueLabel(route.issue)}
                </span>
              </div>
            </div>

            {/* Impact Metric Strip */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14
              }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--status-rose-text)',
                    lineHeight: 1
                  }}>
                    {route.affectedRulesCount}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)'
                  }}>
                    Active rules reference this approver
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--status-amber-text)',
                    lineHeight: 1
                  }}>
                    {route.affectedPendingRequests}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)'
                  }}>
                    Pending requests stuck in queue
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2
                  }}>
                    {route.ruleCode}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)'
                  }}>
                    Primary affected spend policy
                  </div>
                </div>
              </div>
            </div>

            {/* Replacement Options */}
            {!isHealed && (
              <div style={{ padding: '20px 24px', background: '#FFFFFF' }}>
                <div style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Users size={15} color="var(--brand-primary)" />
                  <span>Select Replacement Approver</span>
                </div>

                <div className="resolution-options">
                  {route.replacementOptions.map((opt, i) => {
                    const isSelected = selectedReplacement[route.id] === opt.name;
                    const isDynamic = opt.role.toLowerCase().includes('dynamic');
                    return (
                      <label 
                        key={i} 
                        className={`resolution-option ${isSelected ? 'selected' : ''}`}
                      >
                        <input 
                          type="radio"
                          name={`replacement-${route.id}`}
                          value={opt.name}
                          checked={isSelected}
                          onChange={() => setSelectedReplacement({ ...selectedReplacement, [route.id]: opt.name })}
                        />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {opt.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {opt.role}
                            </div>
                          </div>
                          {isDynamic && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--status-emerald-bg)',
                              color: 'var(--status-emerald-text)',
                              border: '1px solid var(--status-emerald-border)',
                              whiteSpace: 'nowrap'
                            }}>
                              Recommended · Dynamic Role
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
                  <button 
                    className="btn-create-rule"
                    disabled={!selectedReplacement[route.id]}
                    onClick={() => handleHeal(route.id)}
                    style={{
                      padding: '9px 18px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      cursor: !selectedReplacement[route.id] ? 'not-allowed' : 'pointer',
                      opacity: !selectedReplacement[route.id] ? 0.6 : 1
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Assign Replacement</span>
                  </button>
                  <button 
                    className="btn-outline" 
                    onClick={() => onNavigateTab('landscape')}
                    style={{
                      padding: '9px 16px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    Review Affected Rules
                  </button>
                </div>
              </div>
            )}

            {isHealed && (
              <div style={{ padding: '20px 24px', background: 'var(--status-emerald-bg)', borderTop: '1px solid var(--status-emerald-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-emerald-text)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Route healed. <strong>{selectedReplacement[route.id]}</strong> assigned as new approver. Recorded in immutable audit trail.</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
