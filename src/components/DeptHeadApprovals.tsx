import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  CreditCard, 
  Check, 
  X, 
  FileText,
  Plus,
  Send,
  AlertCircle,
  Inbox,
  ChevronRight,
  Paperclip,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { SpendRequest, UserPersona } from '../types';
import { APPROVERS_DIRECTORY } from '../data/mockData';
import { UserAvatar } from './UserAvatar';
import { EmployeePreSpend } from './EmployeePreSpend';

interface DeptHeadApprovalsProps {
  requests: SpendRequest[];
  onApprove: (requestId: string, note?: string) => void;
  onReject: (requestId: string, reason?: string) => void;
  onAddRequest?: (request: SpendRequest) => void;
  persona?: UserPersona | null;
  activeSection?: 'APPROVALS' | 'REQUESTS';
  onSectionChange?: (section: 'APPROVALS' | 'REQUESTS') => void;
}

export const DeptHeadApprovals: React.FC<DeptHeadApprovalsProps> = ({
  requests,
  onApprove,
  onReject,
  onAddRequest,
  persona,
  activeSection: activeSectionProp,
  onSectionChange
}) => {
  const [internalSection, setInternalSection] = useState<'APPROVALS' | 'REQUESTS'>('APPROVALS');
  const currentSection = activeSectionProp || internalSection;
  const [selectedApproverFilter, setSelectedApproverFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  const currentDept = persona?.department || 'Facilities & Workplace';
  const deptRequests = requests.filter(r => 
    r.department.toLowerCase().includes('office') || 
    r.department.toLowerCase().includes('facilities') ||
    r.department === currentDept
  );

  const filteredApprovals = requests.filter(req => {
    if (req.status !== statusTab) return false;
    if (selectedApproverFilter !== 'ALL') {
      const appr = APPROVERS_DIRECTORY.find(a => a.id === selectedApproverFilter);
      if (appr && !req.approverName.toLowerCase().includes(appr.name.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const handleConfirmReject = (id: string) => {
    onReject(id, rejectReason || 'Declined under department spending guidelines');
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div>
      {/* Editorial Header (Approvals Stream) */}
      {currentSection === 'APPROVALS' && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingBottom: 20,
          marginBottom: 24,
          borderBottom: '1px solid var(--border-subtle)'
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
              Department Lead Portal · {currentDept}
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
              Review Approvals
            </h1>
            <p style={{
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              marginTop: 4,
              lineHeight: 1.4
            }}>
              Inspect purchase clearance requests submitted by employees. Authorize or decline with instant feedback notes.
            </p>
          </div>
        </div>
      )}

      {/* ─── SECTION 1: APPROVALS STREAM ─── */}
      {currentSection === 'APPROVALS' && (
        <div>
          {/* Sub-tabs & Filter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="policy-subtabs" style={{ marginBottom: 0 }}>
              <button 
                className={`subtab-btn ${statusTab === 'PENDING' ? 'active' : ''}`}
                onClick={() => setStatusTab('PENDING')}
              >
                <Clock size={15} />
                Pending ({pendingCount})
              </button>

              <button 
                className={`subtab-btn ${statusTab === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setStatusTab('APPROVED')}
              >
                <CheckCircle2 size={15} color="#16a34a" />
                Approved ({approvedCount})
              </button>

              <button 
                className={`subtab-btn ${statusTab === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setStatusTab('REJECTED')}
              >
                <XCircle size={15} color="#dc2626" />
                Rejected ({rejectedCount})
              </button>
            </div>

            {/* Approver Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Filter Approver:
              </label>
              <select 
                className="form-input" 
                style={{ width: 220, fontSize: '0.8rem', padding: '5px 10px' }}
                value={selectedApproverFilter}
                onChange={e => setSelectedApproverFilter(e.target.value)}
              >
                <option value="ALL">All Approvers</option>
                {APPROVERS_DIRECTORY.filter(a => !a.isDynamic).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approvals List */}
          {filteredApprovals.length === 0 ? (
            <div className="main-table-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                background: 'var(--bg-subtle)', 
                color: 'var(--text-muted)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 12px' 
              }}>
                <Inbox size={22} />
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem', marginBottom: 4 }}>
                No {statusTab.toLowerCase()} requests
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {statusTab === 'PENDING' 
                  ? 'All employee requests have been reviewed and resolved.' 
                  : `There are currently no requests with status: ${statusTab.toLowerCase()}.`}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: 20
            }}>
              {filteredApprovals.map(req => (
                <div 
                  key={req.id}
                  className="main-table-card"
                  style={{
                    padding: '24px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#F5F2EB',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #DFDACF',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                    minHeight: 390,
                    transition: 'box-shadow 150ms ease'
                  }}
                >
                  <div>
                    {/* Top Row: STEP 03 · VERDICT & Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#787774' }}>
                        STEP 03 · VERDICT
                      </span>

                      <span style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        background: req.status === 'APPROVED' 
                          ? '#EBF5EE' 
                          : req.status === 'PENDING' 
                          ? '#FBF3DB' 
                          : '#FDF2F2',
                        color: req.status === 'APPROVED' 
                          ? '#166534' 
                          : req.status === 'PENDING' 
                          ? '#7D5A08' 
                          : '#991B1B',
                        border: `1px solid ${req.status === 'APPROVED' 
                          ? '#C6E7D2' 
                          : req.status === 'PENDING' 
                          ? '#EADBAB' 
                          : '#F8C8C8'}`
                      }}>
                        {req.status === 'APPROVED' ? 'APPROVED' : req.status === 'PENDING' ? 'APPROVAL REQUIRED' : 'REJECTED'}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 style={{
                      fontSize: '1.24rem',
                      fontWeight: 700,
                      color: '#111111',
                      letterSpacing: '-0.02em',
                      margin: '0 0 4px 0'
                    }}>
                      {req.status === 'PENDING' ? 'Requires Approval' : req.status === 'APPROVED' ? 'Approved Spend' : 'Declined Spend'}
                    </h3>

                    {/* Subheadline / Justification */}
                    <p style={{ fontSize: '0.8rem', color: '#5C5B57', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                      {req.description} ({req.category} spend over policy threshold routes directly to you for approval).
                    </p>

                    {/* Stepper Pathway Box */}
                    <div style={{
                      padding: '11px 13px',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #DDD8CC',
                      marginBottom: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        {/* Requester */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                          <UserAvatar name={req.requesterName} avatarUrl={req.requesterAvatar} size={30} shape="circle" />
                          <div>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#111111' }}>{req.requesterName}</div>
                            <div style={{ fontSize: '0.67rem', color: '#787774' }}>{req.requesterRole}</div>
                          </div>
                        </div>

                        <ChevronRight size={13} color="#787774" style={{ flexShrink: 0 }} />

                        {/* Center: Amount & Category */}
                        <div style={{ textAlign: 'center', flex: 1.1 }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#111111' }}>
                            ₹{req.amount.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.67rem', color: '#787774' }}>
                            {req.category}
                          </div>
                        </div>

                        <ChevronRight size={13} color="#787774" style={{ flexShrink: 0 }} />

                        {/* Approver */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1.2, justifyContent: 'flex-end' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#111111' }}>{req.approverName}</div>
                            <div style={{ fontSize: '0.67rem', color: '#787774' }}>{req.approverRole}</div>
                          </div>
                          <UserAvatar name={req.approverName} avatarUrl={req.approverAvatar} size={30} shape="circle" />
                        </div>
                      </div>
                    </div>

                    {/* Policy Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                        <span style={{ color: '#787774' }}>Governing Policy:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#111111' }}>{req.ruleCode || 'POL-002'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                        <span style={{ color: '#787774' }}>Turnaround SLA:</span>
                        <span style={{ fontWeight: 600, color: '#37352F' }}>Expected turnaround &lt; 24 hours</span>
                      </div>
                      {req.attachmentName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', paddingTop: 6, borderTop: '1px dashed #DDD8CC', marginTop: 3 }}>
                          <span style={{ color: '#787774', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Paperclip size={11} /> Attached:
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: '#FFFFFF',
                              border: '1px solid #DDD8CC',
                              fontWeight: 600,
                              color: '#111111',
                              fontSize: '0.72rem',
                              maxWidth: 170,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              {req.attachmentType === 'PRODUCT_LINK' ? <LinkIcon size={11} color="#111111" /> : <FileText size={11} color="#111111" />}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.attachmentName}</span>
                            </span>
                            {req.attachmentUrl && (
                              <a
                                href={req.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  color: 'var(--text-primary)',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  padding: '2px 6px',
                                  borderRadius: 3,
                                  background: '#FFFFFF',
                                  border: '1px solid #DDD8CC'
                                }}
                              >
                                <span>Open</span>
                                <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Actions */}
                  <div>
                    {req.status === 'PENDING' && rejectingId !== req.id && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #DFDACF', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button 
                          type="button"
                          className="btn-outline" 
                          style={{
                            padding: '10px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #DDD8CC',
                            background: '#FFFFFF',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                          onClick={() => setRejectingId(req.id)}
                        >
                          <X size={14} /> Decline
                        </button>
                        <button 
                          type="button"
                          className="btn-create-rule" 
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            padding: '11px 16px',
                            fontSize: '0.86rem',
                            background: 'var(--brand-primary)',
                            color: '#FFFFFF',
                            border: '1px solid var(--brand-primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7
                          }}
                          onClick={() => onApprove(req.id)}
                        >
                          <Check size={14} />
                          <span>Approve Spend Request</span>
                        </button>
                      </div>
                    )}

                    {req.status === 'PENDING' && rejectingId === req.id && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #DFDACF', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="Reason for declining..."
                          style={{ width: '100%', fontSize: '0.8rem', padding: '8px 12px', background: '#FFFFFF', border: '1px solid #DDD8CC' }}
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            type="button"
                            className="btn-outline" 
                            style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', background: '#FFFFFF' }}
                            onClick={() => setRejectingId(null)}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', color: '#FFFFFF', background: '#9F2F2D', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => handleConfirmReject(req.id)}
                          >
                            Confirm Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === 'APPROVED' && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #DFDACF' }}>
                        <div style={{
                          padding: '10px 14px',
                          background: 'var(--status-emerald-bg)',
                          border: '1px solid var(--status-emerald-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--status-emerald-text)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600
                        }}>
                          <CheckCircle2 size={14} /> Approved · {req.decisionNote || 'Authorized'}
                        </div>
                      </div>
                    )}

                    {req.status === 'REJECTED' && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #DFDACF' }}>
                        <div style={{
                          padding: '10px 14px',
                          background: 'var(--status-rose-bg)',
                          border: '1px solid var(--status-rose-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--status-rose-text)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600
                        }}>
                          <XCircle size={14} /> Declined · {req.decisionNote || 'Declined under policy'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 2: DEPARTMENT REQUESTS STREAM (SAME 3 CARDS AS EMPLOYEE) ─── */}
      {currentSection === 'REQUESTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
          {/* Same 3-card requesting UI as employee */}
          <EmployeePreSpend 
            requests={requests}
            persona={persona}
            onAddRequest={onAddRequest}
          />
        </div>
      )}
    </div>
  );
};
