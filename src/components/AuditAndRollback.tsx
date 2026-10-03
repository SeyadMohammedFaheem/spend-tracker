import React, { useState } from 'react';
import { ScrollText, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { AUDIT_LOG } from '../data/mockData';
import { AuditEntry } from '../types';

interface AuditAndRollbackProps {
  onRollback: (ruleId: string, version: number) => void;
}

export const AuditAndRollback: React.FC<AuditAndRollbackProps> = ({
  onRollback
}) => {
  const [entries] = useState<AuditEntry[]>(AUDIT_LOG);
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);
  const [rolledBack, setRolledBack] = useState<string[]>([]);

  const getActionColor = (action: AuditEntry['action']) => {
    switch (action) {
      case 'RULE_CREATED': return '#2563eb';
      case 'RULE_EDITED': return '#f59e0b';
      case 'RULE_PUBLISHED': return '#22c55e';
      case 'CONFLICT_RESOLVED': return '#8b5cf6';
      case 'ROUTE_HEALED': return '#dc2626';
      case 'ROLLBACK': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getActionLabel = (action: AuditEntry['action']) => {
    switch (action) {
      case 'RULE_CREATED': return 'Created';
      case 'RULE_EDITED': return 'Edited';
      case 'RULE_PUBLISHED': return 'Published';
      case 'CONFLICT_RESOLVED': return 'Conflict Resolved';
      case 'ROUTE_HEALED': return 'Route Alert';
      case 'ROLLBACK': return 'Rollback';
      default: return action;
    }
  };

  const handleRollback = (entry: AuditEntry) => {
    if (!entry.previousVersion) return;
    onRollback(entry.ruleId, entry.previousVersion);
    setRolledBack([...rolledBack, entry.id]);
    setRollbackTarget(null);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">
            Every policy action is recorded. Changes are auditable and reversible.
          </p>
        </div>
      </div>

      <div className="main-table-card">
        <div className="audit-timeline">
          {entries.map((entry, i) => (
            <div key={entry.id} className="audit-entry">
              {/* Timeline dot */}
              <div className="audit-timeline-dot" style={{ borderColor: getActionColor(entry.action) }} />
              
              {/* Content */}
              <div className="audit-entry-content">
                <div className="audit-header-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {entry.timestamp}
                      </span>
                      <span 
                        className="badge-clean-outline" 
                        style={{ 
                          borderColor: getActionColor(entry.action), 
                          color: getActionColor(entry.action),
                          fontSize: '0.72rem'
                        }}
                      >
                        {getActionLabel(entry.action)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <strong>{entry.author}</strong> changed: <strong>{entry.ruleTitle}</strong>
                    </div>
                  </div>

                  {entry.canRollback && entry.previousVersion && !rolledBack.includes(entry.id) && (
                    <button 
                      className="btn-outline" 
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => setRollbackTarget(rollbackTarget === entry.id ? null : entry.id)}
                    >
                      <RotateCcw size={13} />
                      Restore v{entry.previousVersion}
                    </button>
                  )}

                  {rolledBack.includes(entry.id) && (
                    <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={15} /> Rolled back
                    </span>
                  )}
                </div>

                {/* Summary */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  {entry.summary}
                </div>

                {/* Reason */}
                {entry.reason && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                    Reason: {entry.reason}
                  </div>
                )}

                {/* Diffs */}
                {entry.diffs.length > 0 && (
                  <div className="audit-diffs" style={{ marginTop: 10 }}>
                    {entry.diffs.map((diff, j) => (
                      <div key={j} className="audit-diff-row">
                        <span className="diff-field">{diff.field}</span>
                        <span className="diff-before">{diff.before}</span>
                        <ArrowRight size={12} color="var(--text-light)" />
                        <span className="diff-after">{diff.after}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rollback Confirmation (Section 17) */}
                {rollbackTarget === entry.id && (
                  <div className="rollback-confirm-box" style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      ROLLBACK PREVIEW
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      You are about to restore: <strong>{entry.ruleTitle} — Version {entry.previousVersion}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-outline" onClick={() => setRollbackTarget(null)}>Cancel</button>
                      <button className="btn-create-rule" style={{ background: '#ef4444' }} onClick={() => handleRollback(entry)}>
                        Restore Version {entry.previousVersion}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
