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
          <div key={route.id} className="main-table-card" style={{ marginBottom: 24 }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: '50%', 
                  background: isHealed ? '#f0fdf4' : '#fef2f2', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {isHealed 
                    ? <CheckCircle2 size={22} color="#22c55e" /> 
                    : <Link2Off size={22} color="#dc2626" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                    {isHealed ? 'ROUTE HEALED' : 'BROKEN APPROVAL ROUTE'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>{route.personName}</strong> is no longer an active employee. 
                    {' '}{route.since}
                  </div>
                </div>
                <span className={isHealed ? 'badge-clean-approved' : 'badge-danger'}>
                  {getIssueLabel(route.issue)}
                </span>
              </div>
            </div>

            {/* Impact */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="impact-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="impact-stat">
                  <div className="impact-stat-number" style={{ color: '#dc2626' }}>{route.affectedRulesCount}</div>
                  <div className="impact-stat-label">Active rules reference this approver</div>
                </div>
                <div className="impact-stat">
                  <div className="impact-stat-number" style={{ color: '#f59e0b' }}>{route.affectedPendingRequests}</div>
                  <div className="impact-stat-label">Pending requests stuck</div>
                </div>
                <div className="impact-stat">
                  <div className="impact-stat-number">{route.ruleCode}</div>
                  <div className="impact-stat-label">Primary affected policy</div>
                </div>
              </div>
            </div>

            {/* Replacement Options (Section 19) */}
            {!isHealed && (
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} color="var(--brand-primary)" />
                  <span>Replace with:</span>
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

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button 
                    className="btn-create-rule"
                    disabled={!selectedReplacement[route.id]}
                    onClick={() => handleHeal(route.id)}
                  >
                    Assign Replacement
                  </button>
                  <button className="btn-outline" onClick={() => onNavigateTab('landscape')}>
                    Review Affected Rules
                  </button>
                </div>
              </div>
            )}

            {isHealed && (
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  Route healed. {selectedReplacement[route.id]} assigned as new approver. Change recorded in audit trail.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
