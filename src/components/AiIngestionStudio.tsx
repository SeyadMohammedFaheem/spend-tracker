import React, { useState } from 'react';
import { Bot, FileText, CheckCircle2, XCircle, AlertTriangle, Edit3, ArrowRight } from 'lucide-react';
import { AiExtractedProposal } from '../types';

interface AiIngestionStudioProps {
  onAcceptProposalAsRule: (proposal: AiExtractedProposal) => void;
  onNavigateTab: (tab: string) => void;
  onEditProposal?: (proposal: AiExtractedProposal) => void;
}

// AI proposals from mockData
import { AI_PROPOSALS } from '../data/mockData';

export const AiIngestionStudio: React.FC<AiIngestionStudioProps> = ({
  onAcceptProposalAsRule,
  onNavigateTab,
  onEditProposal
}) => {
  const [proposals, setProposals] = useState<AiExtractedProposal[]>(AI_PROPOSALS);
  const [uploaded, setUploaded] = useState(true);

  const handleAccept = (id: string) => {
    const proposal = proposals.find(p => p.id === id);
    if (!proposal) return;
    onAcceptProposalAsRule(proposal);
    setProposals(proposals.map(p => p.id === id ? { ...p, status: 'ACCEPTED' } : p));
  };

  const handleReject = (id: string) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#22c55e';
    if (confidence >= 60) return '#eab308';
    return '#ef4444';
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">AI Policy Import</h1>
          <p className="page-subtitle">
            AI reads your policy PDF and proposes structured rules. 
            <strong style={{ color: '#f59e0b' }}> AI proposes. You decide.</strong>
          </p>
        </div>
      </div>

      {/* Upload / Status */}
      <div className="main-table-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#2563eb" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Company Spend Policy.pdf</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>20 pages · Uploaded Oct 1, 2026 · {proposals.length} rules extracted</div>
          </div>
          <span className="badge-clean-approved">Processed</span>
        </div>
      </div>

      {/* AI Proposals (Section 21) */}
      {proposals.map(proposal => (
        <div key={proposal.id} className="main-table-card" style={{ marginBottom: 20 }}>
          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: '50%', 
              background: proposal.status === 'ACCEPTED' ? '#f0fdf4' : proposal.status === 'REJECTED' ? '#fef2f2' : '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {proposal.status === 'ACCEPTED' 
                ? <CheckCircle2 size={18} color="#22c55e" />
                : proposal.status === 'REJECTED' 
                  ? <XCircle size={18} color="#ef4444" />
                  : <Bot size={18} color="#2563eb" />
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {proposal.status === 'PROPOSED' ? 'AI PROPOSED RULE' : proposal.status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Source: {proposal.sourceSection}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 10, height: 10, borderRadius: '50%', 
                background: getConfidenceColor(proposal.confidence) 
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: getConfidenceColor(proposal.confidence) }}>
                {proposal.confidence}% confidence
              </span>
            </div>
          </div>

          {/* Two columns: Source text + AI interpretation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1, padding: '18px 24px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                POLICY SOURCE TEXT
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                "{proposal.rawPolicyText}"
              </div>
            </div>
            <div style={{ flex: 1, padding: '18px 24px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                AI INTERPRETATION
              </div>
              <div className="condition-block">
                <div className="condition-row" style={{ fontWeight: 600 }}>{proposal.extractedDraft.title}</div>
                <div className="condition-row">{proposal.extractedDraft.conditionsSummary}</div>
                <div className="condition-row">Decision: {proposal.extractedDraft.decision.replace(/_/g, ' ')}</div>
                <div className="condition-row">Approver: {proposal.extractedDraft.suggestedApprovers}</div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(proposal.ambiguityReason || (proposal.flaggedExceptions && proposal.flaggedExceptions.length > 0)) && (
            <div style={{ padding: '14px 24px', background: '#fffbeb', borderBottom: '1px solid var(--border)' }}>
              {proposal.ambiguityReason && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <AlertTriangle size={15} color="#d97706" style={{ marginTop: 2 }} />
                  <span style={{ fontSize: '0.84rem', color: '#92400e' }}>{proposal.ambiguityReason}</span>
                </div>
              )}
              {proposal.flaggedExceptions?.map((ex, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <AlertTriangle size={15} color="#d97706" style={{ marginTop: 2 }} />
                  <span style={{ fontSize: '0.84rem', color: '#92400e' }}>{ex}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {proposal.status === 'PROPOSED' && (
            <div style={{ padding: '16px 24px', display: 'flex', gap: 10 }}>
              <button className="btn-create-rule" onClick={() => handleAccept(proposal.id)} style={{ fontSize: '0.88rem' }}>
                <CheckCircle2 size={15} />
                Accept as Draft Rule
              </button>
              <button 
                className="btn-outline" 
                style={{ fontSize: '0.88rem' }}
                onClick={() => {
                  if (onEditProposal) {
                    onEditProposal(proposal);
                  } else {
                    onAcceptProposalAsRule(proposal);
                    onNavigateTab('builder');
                  }
                }}
              >
                <Edit3 size={15} />
                Edit Before Accepting
              </button>
              <button 
                className="btn-outline" 
                style={{ fontSize: '0.88rem', color: '#ef4444', borderColor: '#fecaca' }}
                onClick={() => handleReject(proposal.id)}
              >
                <XCircle size={15} />
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      <div style={{ padding: '12px 0', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        AI proposals are suggestions only. They are never automatically published. All accepted rules start as Drafts and go through conflict detection and change preview before publishing.
      </div>
    </div>
  );
};
