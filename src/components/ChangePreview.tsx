import React, { useState } from 'react';
import { ArrowRight, ArrowDown, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { HistoricalTransaction } from '../types';

interface ChangePreviewProps {
  transactions: HistoricalTransaction[];
  onDeployChanges: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ChangePreview: React.FC<ChangePreviewProps> = ({
  transactions,
  onDeployChanges,
  onNavigateTab
}) => {
  const [published, setPublished] = useState(false);

  const changedTransactions = transactions.filter(t => t.impactTag !== 'UNCHANGED');
  const unchangedTransactions = transactions.filter(t => t.impactTag === 'UNCHANGED');
  const differentThreshold = transactions.filter(t => t.impactTag === 'DIFFERENT_THRESHOLD');
  const differentApprover = transactions.filter(t => t.impactTag === 'DIFFERENT_APPROVER');
  const newConflicts = transactions.filter(t => t.impactTag === 'NEW_CONFLICT');

  const handlePublish = () => {
    setPublished(true);
    onDeployChanges();
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Change Preview</h1>
          <p className="page-subtitle">
            Review the impact of your proposed rule change before publishing.
          </p>
        </div>
      </div>

      {/* The proposed change */}
      <div className="main-table-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: 8 }}>
            PROPOSED CHANGE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div className="change-side">
              <div className="change-label">Current threshold</div>
              <div className="change-value">₹50,000</div>
              <div className="change-detail">CEO approval</div>
            </div>

            <ArrowRight size={24} color="var(--text-light)" />

            <div className="change-side">
              <div className="change-label">New threshold</div>
              <div className="change-value" style={{ color: '#2563eb' }}>₹1,00,000</div>
              <div className="change-detail">CEO approval</div>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: 14 }}>
            POTENTIAL IMPACT
          </div>
          <div className="impact-stats-grid">
            <div className="impact-stat">
              <div className="impact-stat-number">{transactions.length}</div>
              <div className="impact-stat-label">Historical transactions analyzed</div>
            </div>
            <div className="impact-stat">
              <div className="impact-stat-number" style={{ color: '#f59e0b' }}>{changedTransactions.length}</div>
              <div className="impact-stat-label">Would match differently</div>
            </div>
            <div className="impact-stat">
              <div className="impact-stat-number" style={{ color: '#ef4444' }}>{differentThreshold.length}</div>
              <div className="impact-stat-label">Different approval path</div>
            </div>
            <div className="impact-stat">
              <div className="impact-stat-number" style={{ color: '#dc2626' }}>{newConflicts.length}</div>
              <div className="impact-stat-label">New conflicts detected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Affected Transactions Detail */}
      {changedTransactions.length > 0 && (
        <div className="main-table-card" style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Affected Transactions ({changedTransactions.length})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              These transactions would have a different outcome under the new rule.
            </div>
          </div>
          <table className="clean-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Current Approver</th>
                <th>New Approver</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {changedTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.employeeName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx.department}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                  <td>{tx.category}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{tx.currentApprover}</td>
                  <td style={{ color: '#2563eb', fontWeight: 600 }}>{tx.simulatedApprover}</td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{tx.diffNotes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Unchanged Transactions */}
      {unchangedTransactions.length > 0 && (
        <div className="main-table-card" style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Unchanged Transactions ({unchangedTransactions.length})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              These transactions are unaffected by the proposed change.
            </div>
          </div>
          <table className="clean-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Current Rule</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {unchangedTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.employeeName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx.department}</div>
                  </td>
                  <td>₹{tx.amount.toLocaleString('en-IN')}</td>
                  <td>{tx.category}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{tx.currentRuleCode}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{tx.diffNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Publish Action */}
      <div className="main-table-card">
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!published ? (
            <>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Ready to publish?</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  This change will affect {changedTransactions.length} transaction{changedTransactions.length !== 1 ? 's' : ''}. 
                  {' '}The change can be rolled back from the Audit Log.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-outline" onClick={() => onNavigateTab('landscape')}>Cancel</button>
                <button className="btn-create-rule" onClick={handlePublish}>
                  Publish Change
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#22c55e' }}>
              <CheckCircle2 size={20} />
              <div>
                <div style={{ fontWeight: 700 }}>Change published successfully</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Recorded in audit trail. Version incremented. Rollback available.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
