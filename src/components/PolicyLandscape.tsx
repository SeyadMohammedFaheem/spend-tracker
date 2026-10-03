import React, { useState, useMemo } from 'react';
import { Eye, Plus, Sparkles, Edit3, X } from 'lucide-react';
import { SpendRule, RuleStatus, UserRole } from '../types';

interface PolicyLandscapeProps {
  rules: SpendRule[];
  onSelectRuleForEdit: (rule: SpendRule) => void;
  onNavigateTab: (tab: string) => void;
  userRole?: UserRole;
}

export const PolicyLandscape: React.FC<PolicyLandscapeProps> = ({
  rules,
  onSelectRuleForEdit,
  onNavigateTab,
  userRole
}) => {
  const [statusFilter, setStatusFilter] = useState<RuleStatus | 'ALL'>('ALL');
  const [selectedRule, setSelectedRule] = useState<SpendRule | null>(null);

  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      return true;
    });
  }, [rules, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: rules.length };
    rules.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [rules]);

  const getStatusBadge = (status: RuleStatus) => {
    const map: Record<RuleStatus, { label: string; cls: string }> = {
      ACTIVE: { label: 'Active', cls: 'badge-clean-approved' },
      DRAFT: { label: 'Draft', cls: 'badge-draft' },
      CONFLICT: { label: 'Conflict', cls: 'badge-danger' },
      BROKEN_ROUTE: { label: 'Broken Route', cls: 'badge-danger' },
      NEEDS_REVIEW: { label: 'Needs Review', cls: 'badge-warn' },
      ARCHIVED: { label: 'Archived', cls: 'badge-muted' },
    };
    const item = map[status];
    return <span className={item.cls}>{item.label}</span>;
  };

  const formatAmount = (rule: SpendRule) => {
    const { amountOperator, amountMin, amountMax } = rule.conditions;
    if (amountOperator === 'GREATER_THAN') return `> ₹${(amountMin || 0).toLocaleString('en-IN')}`;
    if (amountOperator === 'LESS_THAN') return `< ₹${(amountMax || 0).toLocaleString('en-IN')}`;
    if (amountOperator === 'BETWEEN') return `₹${(amountMin || 0).toLocaleString('en-IN')} – ₹${(amountMax || 0).toLocaleString('en-IN')}`;
    return 'Any amount';
  };

  const getRuleInSimpleWords = (rule: SpendRule) => {
    const who = rule.conditions.departments.includes('All') || rule.conditions.departments.length === 0
      ? 'anyone across the company'
      : `an employee in ${rule.conditions.departments.join(' or ')}`;

    let amount = '';
    if (rule.conditions.amountOperator === 'GREATER_THAN') amount = `spends more than ₹${(rule.conditions.amountMin || 0).toLocaleString('en-IN')}`;
    else if (rule.conditions.amountOperator === 'LESS_THAN') amount = `spends less than ₹${(rule.conditions.amountMax || 0).toLocaleString('en-IN')}`;
    else if (rule.conditions.amountOperator === 'BETWEEN') amount = `spends between ₹${(rule.conditions.amountMin || 0).toLocaleString('en-IN')} and ₹${(rule.conditions.amountMax || 0).toLocaleString('en-IN')}`;
    else amount = 'spends any amount';

    const cat = rule.conditions.categories.length === 0 ? 'on any category' : `on ${rule.conditions.categories.join(' or ')}`;
    const pay = rule.conditions.spendTypes.length === 3 ? 'using any payment method' : `via ${rule.conditions.spendTypes.join(', ')}`;

    let outcome = '';
    if (rule.decision === 'AUTO_APPROVE') outcome = 'it is approved automatically without review.';
    else if (rule.decision === 'BLOCK') outcome = 'the purchase is blocked immediately.';
    else {
      const approvers = rule.approverChain.map(s => s.namedUserName || s.roleType.replace(/_/g, ' ')).join(' → ');
      outcome = `it requires approval from ${approvers}.`;
    }

    return `If ${who} ${amount} ${cat} ${pay}, then ${outcome}`;
  };

  return (
    <div>
      {/* Page Title */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{userRole === 'EMPLOYEE' ? 'Company Spend Policies' : 'Policy Landscape'}</h1>
          <p className="page-subtitle">
            {userRole === 'EMPLOYEE' 
              ? `Browse organizational spending guidelines, approval limits, and allowance rules (${rules.length} active policies).`
              : `${rules.length} rules across all departments. ${statusCounts.CONFLICT > 0 ? `${statusCounts.CONFLICT} conflicts.` : ''} ${statusCounts.BROKEN_ROUTE > 0 ? `${statusCounts.BROKEN_ROUTE} broken routes.` : ''}`
            }
          </p>
        </div>
        {userRole !== 'EMPLOYEE' && (
          <button 
            className="btn-create-rule" 
            onClick={() => onNavigateTab('builder')}
          >
            <Plus size={16} />
            Create Rule
          </button>
        )}
      </div>

      {/* Policies Sub-Tabs (Consolidated from sidebar) */}
      <div className="policy-subtabs">
        <button 
          className={`subtab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Policies ({statusCounts.ALL || rules.length})
        </button>
        {userRole !== 'EMPLOYEE' ? (
          <>
            <button 
              className={`subtab-btn ${statusFilter === 'CONFLICT' ? 'active' : ''}`}
              onClick={() => onNavigateTab('conflicts')}
            >
              Conflicts {statusCounts.CONFLICT > 0 && <span className="tab-pill-badge red">{statusCounts.CONFLICT}</span>}
            </button>
            <button 
              className={`subtab-btn ${statusFilter === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DRAFT')}
            >
              Drafts {statusCounts.DRAFT > 0 && <span className="tab-pill-badge amber">{statusCounts.DRAFT}</span>}
            </button>
            <button 
              className={`subtab-btn ${statusFilter === 'BROKEN_ROUTE' ? 'active' : ''}`}
              onClick={() => onNavigateTab('broken_routes')}
            >
              Broken Routes {statusCounts.BROKEN_ROUTE > 0 && <span className="tab-pill-badge red">{statusCounts.BROKEN_ROUTE}</span>}
            </button>
            <button 
              className="subtab-btn"
              onClick={() => onNavigateTab('ai_studio')}
            >
              AI Policy Import
            </button>
            <button 
              className="subtab-btn"
              onClick={() => onNavigateTab('simulation')}
            >
              Simulator
            </button>
            <button 
              className="subtab-btn"
              onClick={() => onNavigateTab('audit_trail')}
            >
              Audit & Rollback
            </button>
          </>
        ) : (
          <button 
            className={`subtab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active & Enforced ({statusCounts.ACTIVE || 0})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="main-table-card" style={{ marginTop: 20 }}>
        <table className="clean-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Policy</th>
              <th style={{ width: '18%' }}>Conditions</th>
              <th style={{ width: '15%' }}>Approver</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '10%' }}>Score</th>
              <th style={{ width: '8%' }}>Matched</th>
              <th style={{ width: '7%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map(rule => (
              <tr key={rule.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {rule.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {rule.code} · v{rule.version} · {rule.domain.replace(/_/g, ' ')}
                  </div>
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <div>{formatAmount(rule)}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {rule.conditions.departments[0] !== 'All' ? rule.conditions.departments[0] : 'All depts'}
                    {rule.conditions.categories.length > 0 && ` · ${rule.conditions.categories[0]}`}
                  </div>
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {rule.approverChain.length > 0 ? (
                    <div>
                      {rule.approverChain.map((s, idx) => (
                        <div key={idx}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {s.namedUserName || s.roleType.replace(/_/g, ' ')}
                          </div>
                          {s.namedUserName && (
                            <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 500 }}>
                              {s.roleType.replace(/_/g, ' ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: rule.decision === 'AUTO_APPROVE' ? '#059669' : 'var(--text-muted)', fontWeight: 600 }}>
                      {rule.decision === 'AUTO_APPROVE' ? 'Auto-approved' : 'Blocked'}
                    </span>
                  )}
                </td>
                <td>{getStatusBadge(rule.status)}</td>
                <td>
                  <div className="specificity-bar">
                    <div className="specificity-fill" style={{ width: `${rule.specificityScore}%`, background: rule.specificityScore >= 60 ? '#22c55e' : rule.specificityScore >= 40 ? '#eab308' : '#ef4444' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rule.specificityScore}/100</span>
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {rule.matchedTransactionsCount ?? 0}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="link-open" onClick={() => setSelectedRule(rule)}>
                    <Eye size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rule Detail Panel (Section 14 of the brief) */}
      {selectedRule && (
        <div className="rule-detail-overlay" onClick={() => setSelectedRule(null)}>
          <div className="rule-detail-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div>
                <h2>{selectedRule.title}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{selectedRule.code} · Version {selectedRule.version}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button 
                  className="btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => {
                    const r = selectedRule;
                    setSelectedRule(null);
                    onSelectRuleForEdit(r);
                  }}
                >
                  <Edit3 size={13} /> Edit Rule
                </button>
                <button onClick={() => setSelectedRule(null)} className="close-panel-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="panel-body">
              {/* In Simple Words Banner */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', 
                border: '1px solid #bfdbfe', 
                borderRadius: 8, 
                padding: '14px 16px', 
                marginBottom: 20 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: 6 }}>
                  <Sparkles size={13} /> In Simple Words
                </div>
                <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
                  "{getRuleInSimpleWords(selectedRule)}"
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Code</div>
                <div className="detail-value">{selectedRule.code} · Version {selectedRule.version}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Conditions</div>
                <div className="condition-block">
                  {selectedRule.conditions.departments[0] !== 'All' && (
                    <div className="condition-row">Department = {selectedRule.conditions.departments.join(', ')}</div>
                  )}
                  {selectedRule.conditions.categories.length > 0 && (
                    <div className="condition-row">Category = {selectedRule.conditions.categories.join(', ')}</div>
                  )}
                  <div className="condition-row">{formatAmount(selectedRule)}</div>
                  <div className="condition-row">Spend type = {selectedRule.conditions.spendTypes.join(', ')}</div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Outcome</div>
                <div className="detail-value" style={{ fontWeight: 700, color: '#2563eb' }}>
                  {selectedRule.decision === 'REQUIRE_APPROVAL' 
                    ? selectedRule.approverChain.map(s => s.namedUserName || s.roleType.replace(/_/g, ' ')).join(' → ') + ' approval'
                    : selectedRule.decision === 'AUTO_APPROVE' ? 'Auto-approved' : 'Blocked'
                  }
                </div>
              </div>

              {/* Precedence (Section 14) */}
              {selectedRule.overridesRuleTitles && selectedRule.overridesRuleTitles.length > 0 && (
                <div className="detail-section">
                  <div className="detail-label">Precedence</div>
                  <div className="precedence-box">
                    <span style={{ fontWeight: 600 }}>Overrides general rule:</span>
                    <br />
                    "{selectedRule.overridesRuleTitles[0]}"
                    <br />
                    <span style={{ fontSize: '0.82rem', color: '#6366f1' }}>
                      Specific exception takes precedence over general policy (specificity: {selectedRule.specificityScore}/100)
                    </span>
                  </div>
                </div>
              )}

              {/* Usage */}
              <div className="detail-section">
                <div className="detail-label">Usage</div>
                <div className="detail-value">
                  {selectedRule.matchedTransactionsCount ?? 0} transactions matched this rule during the current period.
                </div>
              </div>

              {/* History */}
              {selectedRule.versionHistory && selectedRule.versionHistory.length > 0 && (
                <div className="detail-section">
                  <div className="detail-label">History</div>
                  <div className="version-history-list">
                    {selectedRule.versionHistory.map((v, i) => (
                      <div key={i} className={`version-entry ${i === 0 ? 'current' : ''}`}>
                        <div className="version-number">
                          Version {v.version} {i === 0 ? '— Active' : ''}
                        </div>
                        <div className="version-date">{v.date}</div>
                        <div className="version-summary">{v.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-create-rule" onClick={() => { setSelectedRule(null); onSelectRuleForEdit(selectedRule); }}>
                  Edit Rule
                </button>
                <button className="btn-outline" onClick={() => setSelectedRule(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
