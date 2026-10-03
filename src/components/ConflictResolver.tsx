import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { RuleConflict, SpendRule } from '../types';

interface ConflictResolverProps {
  conflicts: RuleConflict[];
  rules: SpendRule[];
  onResolveConflict: (conflictId: string, strategy: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  conflicts,
  rules,
  onResolveConflict,
  onNavigateTab
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<Record<string, string>>({});
  const [resolvedConflicts, setResolvedConflicts] = useState<string[]>([]);

  const getRuleById = (id: string) => rules.find(r => r.id === id);

  const handleResolve = (conflictId: string) => {
    const strategy = selectedStrategy[conflictId];
    if (!strategy) return;
    onResolveConflict(conflictId, strategy);
    setResolvedConflicts([...resolvedConflicts, conflictId]);
  };

  if (conflicts.length === 0 && resolvedConflicts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No rule conflicts</h2>
        <p style={{ color: 'var(--text-muted)' }}>All policies have unique conditions. No admin decision required.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Conflict Resolution</h1>
          <p className="page-subtitle">
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected. Rules with identical conditions but different outcomes need admin decision.
          </p>
        </div>
      </div>

      {conflicts.map(conflict => {
        const ruleA = getRuleById(conflict.ruleAId);
        const ruleB = getRuleById(conflict.ruleBId);
        if (!ruleA || !ruleB) return null;

        const isResolved = resolvedConflicts.includes(conflict.id);

        return (
          <div key={conflict.id} className="main-table-card" style={{ marginBottom: 24 }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: '50%', 
                  background: isResolved ? '#f0fdf4' : '#fef2f2', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {isResolved 
                    ? <CheckCircle2 size={20} color="#22c55e" /> 
                    : <AlertTriangle size={20} color="#dc2626" />
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                    {isResolved ? 'CONFLICT RESOLVED' : 'CONFLICT DETECTED'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {conflict.description}
                  </div>
                </div>
                <span className={isResolved ? 'badge-clean-approved' : 'badge-danger'} style={{ marginLeft: 'auto' }}>
                  {conflict.severity}
                </span>
              </div>
            </div>

            {/* Two conflicting rules side by side */}
            <div style={{ padding: '20px 24px', display: 'flex', gap: 24 }}>
              {/* Rule A */}
              <div className="conflict-rule-card">
                <div className="conflict-rule-label">Rule A</div>
                <div className="conflict-rule-title">{ruleA.title}</div>
                <div className="conflict-rule-code">{ruleA.code}</div>
                <div className="condition-block" style={{ marginTop: 12 }}>
                  {ruleA.conditions.categories.length > 0 && (
                    <div className="condition-row">Category = {ruleA.conditions.categories.join(', ')}</div>
                  )}
                  <div className="condition-row">
                    Amount {'>'} ₹{(ruleA.conditions.amountMin || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="condition-row">Spend = {ruleA.conditions.spendTypes.join(', ')}</div>
                </div>
                <div className="conflict-outcome">
                  → {ruleA.approverChain.map(s => s.namedUserName || s.roleType.replace(/_/g, ' ')).join(', ')}
                </div>
              </div>

              {/* VS Divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="vs-badge">VS</div>
              </div>

              {/* Rule B */}
              <div className="conflict-rule-card">
                <div className="conflict-rule-label">Rule B</div>
                <div className="conflict-rule-title">{ruleB.title}</div>
                <div className="conflict-rule-code">{ruleB.code}</div>
                <div className="condition-block" style={{ marginTop: 12 }}>
                  {ruleB.conditions.categories.length > 0 && (
                    <div className="condition-row">Category = {ruleB.conditions.categories.join(', ')}</div>
                  )}
                  <div className="condition-row">
                    Amount {'>'} ₹{(ruleB.conditions.amountMin || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="condition-row">Spend = {ruleB.conditions.spendTypes.join(', ')}</div>
                </div>
                <div className="conflict-outcome">
                  → {ruleB.approverChain.map(s => s.namedUserName || s.roleType.replace(/_/g, ' ')).join(', ')}
                </div>
              </div>
            </div>

            {/* Affected Transaction Example */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                AFFECTED TRANSACTION EXAMPLE
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {conflict.exampleTransaction.department} employee purchasing {conflict.exampleTransaction.category} for ₹{conflict.exampleTransaction.amount.toLocaleString('en-IN')} ({conflict.exampleTransaction.currency}) from {conflict.exampleTransaction.merchant}.
                Both rules match this transaction — the system cannot determine which approver should be used.
              </div>
            </div>

            {/* Resolution Options (Section 9) */}
            {!isResolved && (
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  ADMIN DECISION REQUIRED
                </div>
                <div className="resolution-options">
                  {conflict.resolutionOptions.map((opt, i) => (
                    <label key={i} className={`resolution-option ${selectedStrategy[conflict.id] === opt.strategy ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name={`resolution-${conflict.id}`}
                        value={opt.strategy}
                        checked={selectedStrategy[conflict.id] === opt.strategy}
                        onChange={() => setSelectedStrategy({ ...selectedStrategy, [conflict.id]: opt.strategy })}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{opt.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button 
                    className="btn-create-rule"
                    disabled={!selectedStrategy[conflict.id]}
                    onClick={() => handleResolve(conflict.id)}
                  >
                    Resolve Conflict
                  </button>
                  <button className="btn-outline" onClick={() => onNavigateTab('builder')}>
                    Edit the Rules
                  </button>
                </div>
              </div>
            )}

            {isResolved && (
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  Conflict resolved. Decision recorded in audit trail.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
