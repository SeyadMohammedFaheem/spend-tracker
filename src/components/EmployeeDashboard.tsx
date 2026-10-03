import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Plus, 
  Paperclip, 
  ExternalLink, 
  FileText, 
  Receipt, 
  AlertCircle,
  ChevronRight,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SpendRequest, UserPersona } from '../types';
import { UserAvatar } from './UserAvatar';

interface EmployeeDashboardProps {
  persona?: UserPersona | null;
  requests: SpendRequest[];
  onNavigateTab: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  persona,
  requests,
  onNavigateTab
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick checker state
  const [quickAmount, setQuickAmount] = useState<number>(12000);
  const [quickCategory, setQuickCategory] = useState<string>('Office Supplies');

  const employeeName = persona?.name || 'Arun Nair';
  const employeeRole = persona?.title || 'Workplace Coordinator';
  const employeeDept = persona?.department || 'Office Management';

  // Filter requests for current employee
  const myRequests = useMemo(() => {
    return requests.filter(r => 
      r.requesterName.toLowerCase().includes(employeeName.toLowerCase()) || 
      r.department === employeeDept ||
      (persona?.department && r.department === persona.department)
    );
  }, [requests, employeeName, employeeDept, persona]);

  // Summary statistics
  const totalCount = myRequests.length;
  const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = myRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = myRequests.filter(r => r.status === 'REJECTED').length;

  const totalAmount = myRequests.reduce((sum, r) => sum + r.amount, 0);
  const approvedAmount = myRequests.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = myRequests.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return myRequests.filter(req => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDesc = req.description.toLowerCase().includes(query);
        const matchId = req.id.toLowerCase().includes(query);
        const matchCat = req.category.toLowerCase().includes(query);
        const matchApprover = req.approverName.toLowerCase().includes(query);
        const matchRule = req.ruleTitle?.toLowerCase().includes(query) || req.ruleCode?.toLowerCase().includes(query);
        if (!matchDesc && !matchId && !matchCat && !matchApprover && !matchRule) return false;
      }
      return true;
    });
  }, [myRequests, statusFilter, searchQuery]);

  const getQuickVerdict = () => {
    if (quickCategory === 'Office Supplies' && quickAmount > 10000) {
      return {
        status: 'REQUIRES_APPROVAL',
        text: 'Requires Approval: Office Manager (Priya Mehta)',
        bg: '#FBF3DB',
        color: '#7D5A08',
        border: '#EBD59B'
      };
    }
    if (quickCategory === 'SaaS Subscriptions' && quickAmount > 50000) {
      return {
        status: 'REQUIRES_APPROVAL',
        text: 'Requires Approval: Engineering Head & IT Lead',
        bg: '#FBF3DB',
        color: '#7D5A08',
        border: '#EBD59B'
      };
    }
    if (quickAmount > 50000) {
      return {
        status: 'REQUIRES_APPROVAL',
        text: 'Requires Approval: Department Head Review',
        bg: '#FBF3DB',
        color: '#7D5A08',
        border: '#EBD59B'
      };
    }
    return {
      status: 'AUTO_APPROVE',
      text: 'Pre-Approved: Charge directly to Corporate Card',
      bg: '#EBF5EE',
      color: '#166534',
      border: '#C6E7D2'
    };
  };

  const quickVerdict = getQuickVerdict();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ─── Header ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 18,
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
            Employee Portal · {employeeDept}
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
            My Spend Requests
          </h1>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Track live manager clearance, turnaround SLAs, and attached invoices for your expenditures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('employee_view')}
          className="btn-create-rule"
          style={{
            background: 'var(--brand-primary)',
            border: '1px solid var(--brand-primary)',
            color: '#FFFFFF',
            padding: '9px 18px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={15} />
          <span>New Spend Request</span>
        </button>
      </div>

      {/* ─── Metric Pills (Exact match to screenshot) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14
      }}>
        <div style={{
          padding: '16px 18px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Total Requests
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {totalCount}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              ₹{totalAmount.toLocaleString('en-IN')} cumulative
            </span>
          </div>
        </div>

        <div style={{
          padding: '16px 18px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            In Review / Pending
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {pendingCount}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              ₹{pendingAmount.toLocaleString('en-IN')} awaiting sign-off
            </span>
          </div>
        </div>

        <div style={{
          padding: '16px 18px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Approved & Cleared
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {approvedCount}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              ₹{approvedAmount.toLocaleString('en-IN')} ready to charge
            </span>
          </div>
        </div>

        <div style={{
          padding: '16px 18px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Active Allowance
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              ₹50,000
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Discretionary threshold
            </span>
          </div>
        </div>
      </div>

      {/* ─── Instant Pre-Clearance Mini-Calculator Widget ─── */}
      <div className="main-table-card" style={{
        padding: '20px 22px',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#111111" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700 }}>Quick Pre-Clearance Check</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>— Test a purchase before submitting</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('employee_view')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Open Full Request Builder</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Estimated Amount (₹)
            </label>
            <input 
              type="number" 
              className="form-input" 
              value={quickAmount} 
              onChange={e => setQuickAmount(Number(e.target.value))}
              style={{ fontSize: '0.84rem', padding: '7px 10px', width: '100%', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Category
            </label>
            <select 
              className="form-input"
              value={quickCategory}
              onChange={e => setQuickCategory(e.target.value)}
              style={{ fontSize: '0.84rem', padding: '7px 10px', width: '100%' }}
            >
              <option value="Office Supplies">Office Supplies</option>
              <option value="SaaS Subscriptions">Software & SaaS</option>
              <option value="Hardware & IT">Hardware & IT</option>
              <option value="Business Meals">Meals & Food</option>
              <option value="International Travel">Travel & Flights</option>
            </select>
          </div>

          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: quickVerdict.bg,
            border: `1px solid ${quickVerdict.border}`,
            color: quickVerdict.color,
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 'fit-content',
            alignSelf: 'flex-end'
          }}>
            {quickVerdict.status === 'AUTO_APPROVE' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{quickVerdict.text}</span>
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs & Search Bar ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 4
      }}>
        {/* Status Tabs */}
        <div style={{
          display: 'inline-flex',
          background: '#F0ECE1',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          gap: 2
        }}>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: statusFilter === 'ALL' ? 600 : 500,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: statusFilter === 'ALL' ? '#FFFFFF' : 'transparent',
              color: statusFilter === 'ALL' ? '#111111' : 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: statusFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: statusFilter === 'PENDING' ? 600 : 500,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: statusFilter === 'PENDING' ? '#FFFFFF' : 'transparent',
              color: statusFilter === 'PENDING' ? '#926004' : 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: statusFilter === 'PENDING' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Pending ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: statusFilter === 'APPROVED' ? 600 : 500,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: statusFilter === 'APPROVED' ? '#FFFFFF' : 'transparent',
              color: statusFilter === 'APPROVED' ? '#166534' : 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: statusFilter === 'APPROVED' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Approved ({approvedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: statusFilter === 'REJECTED' ? 600 : 500,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: statusFilter === 'REJECTED' ? '#FFFFFF' : 'transparent',
              color: statusFilter === 'REJECTED' ? '#991B1B' : 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: statusFilter === 'REJECTED' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Declined ({rejectedCount})
          </button>
        </div>

        {/* Search Input */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 300
        }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by purpose, category, rule..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* ─── Requests Cards Stream (Exact design from screenshot) ─── */}
      {filteredRequests.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}>
          <Receipt size={36} strokeWidth={1.5} color="var(--text-muted)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
              No spend requests found
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {searchQuery ? `No requests match "${searchQuery}"` : 'You have not submitted any spend requests under this filter.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('employee_view')}
            className="btn-create-rule"
            style={{
              background: 'var(--brand-primary)',
              border: '1px solid var(--brand-primary)',
              color: '#FFFFFF',
              padding: '7px 16px',
              fontSize: '0.8rem',
              marginTop: 4
            }}
          >
            + Create Spend Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRequests.map(req => {
            const isApproved = req.status === 'APPROVED';
            const isPending = req.status === 'PENDING';
            const isRejected = req.status === 'REJECTED';

            return (
              <div 
                key={req.id}
                className="main-table-card"
                style={{
                  padding: '18px 20px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  transition: 'box-shadow 120ms ease'
                }}
              >
                {/* Header row: ID, category pill, spend type, submitted date, status, amount */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'var(--bg-subtle)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {req.id}
                    </span>

                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      background: '#F0ECE1',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)'
                    }}>
                      {req.category}
                    </span>

                    <span style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)'
                    }}>
                      {req.spendType === 'CARD' ? 'Corporate Card' : req.spendType === 'BILL' ? 'Invoice / Bill' : 'Reimbursement'}
                    </span>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Submitted {req.createdAt}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="mono-amount" style={{ fontSize: '1.14rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{req.amount.toLocaleString('en-IN')}
                    </span>

                    {isPending && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: '#FBF3DB',
                        color: '#7D5A08',
                        border: '1px solid #EBD59B'
                      }}>
                        <Clock size={12} /> Awaiting Approval
                      </span>
                    )}

                    {isApproved && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: '#EBF5EE',
                        color: '#166534',
                        border: '1px solid #C6E7D2'
                      }}>
                        <CheckCircle2 size={12} /> Approved & Cleared
                      </span>
                    )}

                    {isRejected && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: '#FDF2F2',
                        color: '#991B1B',
                        border: '1px solid #F8B4B4'
                      }}>
                        <XCircle size={12} /> Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Description / Purpose */}
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {req.description}
                </div>

                {/* Footer bar: Approver with avatar, Rule code, and Attached file */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserAvatar name={req.approverName} avatarUrl={req.approverAvatar} size={22} shape="circle" />
                      <span>
                        Approver: <strong>{req.approverName}</strong> ({req.approverRole})
                      </span>
                    </div>

                    {req.ruleTitle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <span>•</span>
                        <span>Policy: <strong>{req.ruleTitle}</strong></span>
                        {req.ruleCode && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>({req.ruleCode})</span>}
                      </div>
                    )}
                  </div>

                  {req.attachmentName && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 8px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {req.attachmentType === 'PRODUCT_LINK' ? (
                        <>
                          <ExternalLink size={12} color="#111111" />
                          <a 
                            href={req.attachmentUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {req.attachmentName}
                          </a>
                        </>
                      ) : (
                        <>
                          <Paperclip size={12} color="#111111" />
                          <span>{req.attachmentName}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Decision Note Banner if Approved or Rejected */}
                {req.decisionNote && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: isApproved ? '#F0F9F4' : '#FEF2F2',
                    border: `1px solid ${isApproved ? '#D1FAE5' : '#FEE2E2'}`,
                    fontSize: '0.78rem',
                    color: isApproved ? '#065F46' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    {isApproved ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span><strong>Manager Note:</strong> {req.decisionNote}</span>
                    {req.decisionDate && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: 'auto' }}>({req.decisionDate})</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
