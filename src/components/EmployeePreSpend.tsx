import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Send, 
  Clock, 
  Ban, 
  ChevronRight,
  Receipt,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  Layers,
  History,
  X,
  Paperclip,
  Link as LinkIcon,
  ExternalLink,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { SpendRequest, UserPersona } from '../types';
import { EMPLOYEES_MOCK } from '../data/mockData';
import { UserAvatar, getAvatarForName } from './UserAvatar';

interface EmployeePreSpendProps {
  requests?: SpendRequest[];
  onAddRequest?: (request: SpendRequest) => void;
  onNavigateTab?: (tab: string) => void;
  persona?: UserPersona | null;
}

interface SpendCheckResult {
  status: 'PRE_APPROVED' | 'REQUIRES_APPROVAL' | 'BLOCKED';
  headline: string;
  subheadline: string;
  approverName?: string;
  approverRole?: string;
  policyName: string;
  ruleCode: string;
  reasoning: string;
  slaText: string;
  thresholdLimit?: number;
}

const CATEGORY_OPTIONS = [
  { id: 'Office Supplies', label: 'Office Supplies' },
  { id: 'SaaS Subscriptions', label: 'Software / SaaS' },
  { id: 'Laptops', label: 'Hardware & IT' },
  { id: 'Business Meals', label: 'Meals & Food' },
  { id: 'International Travel', label: 'Travel & Flights' },
  { id: 'Consulting Services', label: 'Consulting' },
  { id: 'Other', label: 'Other' },
];

interface AiClassificationResult {
  category: string;
  customCategory?: string;
  spendType: 'CARD' | 'BILL' | 'REIMBURSEMENT';
  estimatedAmount?: number;
  confidence: number;
  reasoning: string;
}

const detectSpendClassification = (text: string): AiClassificationResult | null => {
  if (!text || text.trim().length < 4) return null;
  const lower = text.toLowerCase();

  let detectedCategory = 'Other';
  let customCat = '';
  let detectedType: 'CARD' | 'BILL' | 'REIMBURSEMENT' = 'CARD';
  let confidence = 0.86;
  let reason = '';

  // 1. Detect Spend / Channel Type
  if (lower.includes('reimburs') || lower.includes('pocket') || lower.includes('personal') || lower.includes('claim')) {
    detectedType = 'REIMBURSEMENT';
    reason = 'Employee out-of-pocket reimbursement';
    confidence += 0.08;
  } else if (lower.includes('invoice') || lower.includes('bill') || lower.includes('vendor') || lower.includes('po ') || lower.includes('purchase order') || lower.includes('wire') || lower.includes('contractor') || lower.includes('net 30')) {
    detectedType = 'BILL';
    reason = 'Accounts payable / vendor invoice channel';
    confidence += 0.09;
  } else {
    detectedType = 'CARD';
    reason = 'Corporate card purchase';
  }

  // 2. Detect Category
  if (lower.includes('figma') || lower.includes('saas') || lower.includes('software') || lower.includes('license') || lower.includes('aws') || lower.includes('github') || lower.includes('datadog') || lower.includes('zoom') || lower.includes('slack') || lower.includes('cloud') || lower.includes('subscription')) {
    detectedCategory = 'SaaS Subscriptions';
    reason += ' · Software subscription detected';
    confidence += 0.05;
  } else if (lower.includes('flight') || lower.includes('airline') || lower.includes('travel') || lower.includes('hotel') || lower.includes('trip') || lower.includes('indigo') || lower.includes('air india') || lower.includes('offsite')) {
    detectedCategory = 'International Travel';
    reason += ' · Travel logistics matched';
    confidence += 0.05;
  } else if (lower.includes('meal') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('food') || lower.includes('restaurant') || lower.includes('coffee') || lower.includes('bastian') || lower.includes('pantry') && lower.includes('snack')) {
    detectedCategory = 'Business Meals';
    reason += ' · Meal & entertainment matched';
    confidence += 0.05;
  } else if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('monitor') || lower.includes('keyboard') || lower.includes('mouse') || lower.includes('hardware') || lower.includes('dell') || lower.includes('headphone')) {
    detectedCategory = 'Laptops';
    reason += ' · IT hardware matched';
    confidence += 0.05;
  } else if (lower.includes('office supply') || lower.includes('supplies') || lower.includes('stationery') || lower.includes('paper') || lower.includes('desk') || lower.includes('chair') || lower.includes('pantry')) {
    detectedCategory = 'Office Supplies';
    reason += ' · Office facilities & restocking';
    confidence += 0.05;
  } else if (lower.includes('consult') || lower.includes('legal') || lower.includes('advisor') || lower.includes('audit') || lower.includes('lawyer') || lower.includes('retainer')) {
    detectedCategory = 'Consulting Services';
    reason += ' · Professional advisory matched';
    confidence += 0.05;
  } else {
    detectedCategory = 'Other';
    customCat = text.slice(0, 30);
  }

  // 3. Amount extraction (e.g. ₹50,000, 1,20,000, $500, 15000)
  const amountMatch = text.match(/(?:₹|rs\.?|inr|\$)\s*([\d,]+)/i) || text.match(/\b([\d,]{4,})\b/);
  let parsedAmt: number | undefined;
  if (amountMatch && amountMatch[1]) {
    const cleanNum = parseInt(amountMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      parsedAmt = cleanNum;
    }
  }

  return {
    category: detectedCategory,
    customCategory: customCat,
    spendType: detectedType,
    estimatedAmount: parsedAmt,
    confidence: Math.min(0.99, Math.round(confidence * 100) / 100),
    reasoning: reason
  };
};

export const EmployeePreSpend: React.FC<EmployeePreSpendProps> = ({
  requests = [],
  onAddRequest,
  onNavigateTab,
  persona
}) => {
  const [amount, setAmount] = useState<number>(60000);
  const [category, setCategory] = useState<string>('Office Supplies');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [spendType, setSpendType] = useState<'CARD' | 'BILL' | 'REIMBURSEMENT'>('CARD');
  const [description, setDescription] = useState<string>('Quarterly pantry & office supplies restocking');
  const [aiClassified, setAiClassified] = useState<AiClassificationResult | null>(null);
  const [aiAutoSync, setAiAutoSync] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [attachmentType, setAttachmentType] = useState<'INVOICE' | 'BILL' | 'PRODUCT_LINK' | undefined>();
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDescriptionChange = (newDesc: string, autoApply = aiAutoSync) => {
    setDescription(newDesc);
    setSubmitted(false);

    const detected = detectSpendClassification(newDesc);
    setAiClassified(detected);

    if (autoApply && detected) {
      if (detected.category) setCategory(detected.category);
      if (detected.customCategory && detected.category === 'Other') setCustomCategory(detected.customCategory);
      if (detected.spendType) setSpendType(detected.spendType);
      if (detected.estimatedAmount && detected.estimatedAmount > 0) {
        setAmount(detected.estimatedAmount);
      }
    }
  };

  const isDeptHead = persona?.role === 'DEPT_HEAD';
  const currentEmployee = persona ? {
    id: 'emp-logged-in',
    name: persona.name,
    email: `${persona.name.toLowerCase().replace(' ', '.')}@company.com`,
    department: persona.department,
    role: persona.title,
    allowanceLimit: isDeptHead ? 100000 : 50000,
    directManager: isDeptHead ? 'Vikram Malhotra' : 'Priya Mehta'
  } : EMPLOYEES_MOCK[0];

  // Evaluate spend live against policies
  const evaluateSpend = (): SpendCheckResult => {
    if (isDeptHead) {
      if (amount > 100000) {
        return {
          status: 'REQUIRES_APPROVAL',
          headline: 'Requires CFO Clearance',
          subheadline: `Department purchases over ₹1,00,000 route directly to CFO Vikram Malhotra.`,
          approverName: 'Vikram Malhotra',
          approverRole: 'Chief Financial Officer (CFO)',
          policyName: 'Executive Spend Policy (POL-001)',
          ruleCode: 'POL-001',
          reasoning: 'Under POL-001, large departmental expenditures exceeding ₹1,00,000 must be cleared by CFO Vikram Malhotra.',
          slaText: 'Expected turnaround < 12 hours',
          thresholdLimit: 100000
        };
      }
      return {
        status: 'PRE_APPROVED',
        headline: 'Authorized for Department Lead',
        subheadline: `Within your ₹1,00,000 monthly ${currentEmployee.department} operational allowance cap.`,
        policyName: 'Department Head Operational Budget (POL-003)',
        ruleCode: 'POL-003',
        reasoning: 'Department heads have pre-cleared purchasing authority for team operational requirements under ₹1,00,000.',
        slaText: 'Immediate swipe access',
        thresholdLimit: 100000
      };
    }

    if (category === 'Office Supplies' && amount > 10000) {
      return {
        status: 'REQUIRES_APPROVAL',
        headline: 'Requires Approval',
        subheadline: 'Office Supplies over ₹10,000 route directly to your Office Manager.',
        approverName: 'Priya Mehta',
        approverRole: 'Office Manager',
        policyName: 'Office Supplies Approval Policy',
        ruleCode: 'POL-002',
        reasoning: 'Under POL-002, Office Supplies exceeding ₹10,000 must be approved by Priya Mehta prior to swiping.',
        slaText: 'Expected turnaround < 24 hours',
        thresholdLimit: 10000
      };
    }

    if (category === 'International Travel' && amount > 150000) {
      return {
        status: 'REQUIRES_APPROVAL',
        headline: 'CFO Approval Required',
        subheadline: 'Travel exceeding ₹1,50,000 requires central finance clearance.',
        approverName: 'Vikram Malhotra',
        approverRole: 'CFO',
        policyName: 'Executive Travel Policy',
        ruleCode: 'POL-001',
        reasoning: 'Under POL-001, large travel commitments must be authorized by Vikram Malhotra.',
        slaText: 'Expected turnaround < 12 hours',
        thresholdLimit: 150000
      };
    }

    if (category === 'SaaS Subscriptions' && amount <= 50000) {
      return {
        status: 'PRE_APPROVED',
        headline: 'Instant Pass: Cleared',
        subheadline: 'Software subscriptions under ₹50,000 are pre-approved.',
        policyName: 'Developer Tooling Allowance',
        ruleCode: 'POL-004',
        reasoning: 'Standard SaaS under ₹50,000 does not require manual review. You may use your card directly.',
        slaText: 'Immediate swipe access',
        thresholdLimit: 50000
      };
    }

    if (category === 'Other') {
      if (amount > 15000) {
        return {
          status: 'REQUIRES_APPROVAL',
          headline: 'Manager Approval Required',
          subheadline: 'Non-cataloged or other expenses over ₹15,000 require manager approval.',
          approverName: isDeptHead ? 'Vikram Malhotra' : (currentEmployee.directManager || 'Priya Mehta'),
          approverRole: isDeptHead ? 'CFO' : 'Department Lead',
          policyName: 'General Discretionary Spend Policy',
          ruleCode: 'POL-006',
          reasoning: 'Under POL-006, miscellaneous and custom category purchases exceeding ₹15,000 route to your manager for review.',
          slaText: 'Expected turnaround < 24 hours',
          thresholdLimit: 15000
        };
      }
      return {
        status: 'PRE_APPROVED',
        headline: 'Discretionary Clearance',
        subheadline: 'Miscellaneous spend within ₹15,000 discretionary allowance.',
        policyName: 'Standard Discretionary Allowance',
        ruleCode: 'POL-007',
        reasoning: 'Spend under ₹15,000 is authorized for immediate purchase. Retain receipt for reconciliation.',
        slaText: 'Immediate swipe access',
        thresholdLimit: 15000
      };
    }

    if (amount > 100000) {
      return {
        status: 'REQUIRES_APPROVAL',
        headline: 'Department Head Review',
        subheadline: 'Major expenditure exceeding standard allowance cap.',
        approverName: 'Priya Mehta',
        approverRole: 'Office Manager',
        policyName: 'Company Spend Escalation',
        ruleCode: 'POL-005',
        reasoning: 'General purchases over ₹1,00,000 route to your Department Lead for budget authorization.',
        slaText: 'Expected turnaround < 24 hours',
        thresholdLimit: 100000
      };
    }

    return {
      status: 'PRE_APPROVED',
      headline: 'Pre-Approved Under Limit',
      subheadline: 'Within standard discretionary allowance.',
      policyName: 'Standard Discretionary Allowance',
      ruleCode: 'POL-007',
      reasoning: 'Spend under ₹10,000 is authorized for immediate purchase. Retain receipt for reconciliation.',
      slaText: 'Immediate clearance'
    };
  };

  const decision = evaluateSpend();

  const handleSubmitRequest = () => {
    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: SpendRequest = {
      id: newId,
      requesterName: currentEmployee.name,
      requesterRole: currentEmployee.role,
      requesterAvatar: getAvatarForName(currentEmployee.name),
      department: currentEmployee.department,
      amount: amount,
      currency: 'INR',
      category: category === 'Other' && customCategory.trim() ? `Other (${customCategory.trim()})` : category,
      spendType: spendType,
      description: description,
      status: 'PENDING',
      createdAt: 'Just now',
      ruleCode: decision.ruleCode,
      ruleTitle: decision.policyName,
      approverName: decision.approverName || 'Department Head',
      approverRole: decision.approverRole || 'Manager',
      approverAvatar: getAvatarForName(decision.approverName || ''),
      attachmentType,
      attachmentName: attachmentName || undefined,
      attachmentUrl: attachmentUrl || undefined
    };

    if (onAddRequest) {
      onAddRequest(newRequest);
    }

    setSubmitted(true);
    setLastSubmittedId(newId);
  };

  const handleReset = () => {
    setSubmitted(false);
    setAttachmentName('');
    setAttachmentUrl('');
    setAttachmentType(undefined);
    setCustomCategory('');
  };

  // Filter requests for current employee
  const myRequests = requests.filter(r => 
    r.requesterName.toLowerCase().includes(currentEmployee.name.toLowerCase()) || 
    r.department === currentEmployee.department
  );

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      height: '100%',
      minHeight: 0
    }}>
      
      {/* ─── Compact Header ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        flexShrink: 0
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Spend Request & Pre-Clearance
          </h1>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            margin: '2px 0 0 0'
          }}>
            Check rules and raise requests before committing funds. Zero post-purchase rejections.
          </p>
        </div>

        {/* History Quick Trigger */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab('my_requests');
            } else {
              setShowHistoryModal(true);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            background: '#FFFFFF',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <History size={14} />
          <span>My Past Requests</span>
          <span style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            background: 'var(--bg-subtle)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)'
          }}>
            {myRequests.length}
          </span>
        </button>
      </div>

      {/* ─── THREE CARD REQUESTING UI (Full Height, Equal Stretch) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1.05fr',
        gap: 16,
        alignItems: 'stretch',
        flex: 1,
        height: '100%',
        minHeight: 520
      }}>
        
        {/* ─── CARD 1: 01 · Expense Category & Purpose ─── */}
        <div className="main-table-card" style={{
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          height: '100%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Step 01 · Select Category
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Required
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: category === 'Other' ? 12 : 18 }}>
              {CATEGORY_OPTIONS.map(cat => {
                const isSelected = category === cat.id;
                const isOther = cat.id === 'Other';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setSubmitted(false);
                    }}
                    style={{
                      padding: '10px 10px',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isSelected ? '#111111' : 'var(--border-subtle)'}`,
                      background: isSelected ? '#111111' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 120ms ease',
                      gridColumn: isOther ? '1 / -1' : undefined
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {category === 'Other' && (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                  Specify Category (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Team Offsite, Training, Books, Subscriptions..."
                  value={customCategory}
                  onChange={e => {
                    setCustomCategory(e.target.value);
                    setSubmitted(false);
                  }}
                  style={{
                    fontSize: '0.82rem',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: '#FAF9F6',
                    width: '100%'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>Business Purpose</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.68rem', color: aiAutoSync ? '#15803D' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                    <Sparkles size={11} /> AI Auto-Classifier
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiAutoSync(!aiAutoSync)}
                    style={{
                      fontSize: '0.66rem',
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: aiAutoSync ? '#E8F5E9' : 'var(--bg-subtle)',
                      color: aiAutoSync ? '#1E3A1E' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {aiAutoSync ? 'AUTO ON' : 'MANUAL'}
                  </button>
                </div>
              </div>

              <textarea
                className="form-input"
                style={{ fontSize: '0.82rem', resize: 'none', lineHeight: 1.4, padding: '9px 11px', width: '100%', minHeight: 68 }}
                placeholder="Describe your purchase (e.g. Datadog annual SaaS renewal invoice for ₹1,20,000)..."
                value={description}
                onChange={e => handleDescriptionChange(e.target.value)}
              />

              {/* AI Detection Pill / Classification Output */}
              {aiClassified && (
                <div style={{
                  marginTop: 6,
                  padding: '7px 10px',
                  background: '#F9F9F6',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: '0.73rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Sparkles size={12} color="#111111" />
                    <span>
                      AI Segregated: <strong>{CATEGORY_OPTIONS.find(c => c.id === aiClassified.category)?.label || aiClassified.category}</strong> · <strong>{aiClassified.spendType === 'CARD' ? 'Corporate Card' : aiClassified.spendType === 'BILL' ? 'Vendor Invoice (Bill)' : 'Employee Reimbursement'}</strong>
                    </span>
                    <span style={{ fontSize: '0.65rem', background: '#E8F5E9', color: '#1B5E20', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>
                      {Math.round(aiClassified.confidence * 100)}% match
                    </span>
                  </div>
                  {!aiAutoSync && (
                    <button
                      type="button"
                      onClick={() => handleDescriptionChange(description, true)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        background: 'var(--brand-primary)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Apply
                    </button>
                  )}
                </div>
              )}

              {/* Quick AI Test Prompts */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7, alignItems: 'center' }}>
                <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Try AI test:</span>
                {[
                  { text: 'Datadog annual SaaS renewal invoice ₹1,20,000', label: 'SaaS Invoice' },
                  { text: 'Reimbursement for client team dinner at Bastian ₹14,500', label: 'Dinner Claim' },
                  { text: 'Indigo flight to Bangalore for offsite ₹45,000', label: 'Flight Card' }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleDescriptionChange(p.text, true)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.68rem',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Sparkles size={9} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Attach Bill, Invoice or Product Link ─── */}
            <div style={{ marginTop: 2, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Paperclip size={12} />
                  <span>Attach Bill, Invoice or Product Link</span>
                </label>
                {attachmentName && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName('');
                      setAttachmentUrl('');
                      setAttachmentType(undefined);
                    }}
                    style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#9F2F2D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <X size={11} /> Clear
                  </button>
                )}
              </div>

              {/* Mode Selector Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '7px 4px',
                    fontSize: '0.72rem',
                    fontWeight: attachmentType === 'INVOICE' || attachmentType === 'BILL' ? 600 : 500,
                    borderRadius: 'var(--radius-xs)',
                    border: `1px solid ${attachmentType === 'INVOICE' || attachmentType === 'BILL' ? '#111111' : 'var(--border-subtle)'}`,
                    background: attachmentType === 'INVOICE' || attachmentType === 'BILL' ? '#111111' : 'var(--bg-subtle)',
                    color: attachmentType === 'INVOICE' || attachmentType === 'BILL' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <FileText size={11} />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttachmentType('PRODUCT_LINK');
                    if (!attachmentUrl) setAttachmentUrl('https://');
                  }}
                  style={{
                    padding: '7px 4px',
                    fontSize: '0.72rem',
                    fontWeight: attachmentType === 'PRODUCT_LINK' ? 600 : 500,
                    borderRadius: 'var(--radius-xs)',
                    border: `1px solid ${attachmentType === 'PRODUCT_LINK' ? '#111111' : 'var(--border-subtle)'}`,
                    background: attachmentType === 'PRODUCT_LINK' ? '#111111' : 'var(--bg-subtle)',
                    color: attachmentType === 'PRODUCT_LINK' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <LinkIcon size={11} />
                  <span>Product Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttachmentType('INVOICE');
                    setAttachmentName('Dell_Enterprise_ProQuote_2026.pdf (320 KB)');
                    setAttachmentUrl('https://example.com/invoices/quote_2026.pdf');
                  }}
                  style={{
                    padding: '7px 4px',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-xs)',
                    border: '1px dashed var(--border-subtle)',
                    background: '#FFFFFF',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3
                  }}
                >
                  <span>+ Sample Quote</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const isInv = file.name.toLowerCase().includes('inv') || file.name.toLowerCase().includes('quote');
                    setAttachmentType(isInv ? 'INVOICE' : 'BILL');
                    setAttachmentName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
                    setAttachmentUrl(URL.createObjectURL(file));
                  }
                }}
              />

              {/* Product Link Input */}
              {attachmentType === 'PRODUCT_LINK' && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://amazon.in/dp/... or https://dell.com/item"
                    style={{ fontSize: '0.76rem', padding: '6px 10px', flex: 1 }}
                    value={attachmentUrl}
                    onChange={e => {
                      setAttachmentUrl(e.target.value);
                      setAttachmentName(e.target.value ? e.target.value.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24) + '...' : '');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentUrl('https://amazon.in/dp/B09G9FPG95');
                      setAttachmentName('Amazon Item (Office Supplies)');
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.7rem',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Use Amazon
                  </button>
                </div>
              )}

              {/* Active Attachment Chip */}
              {attachmentName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                    {attachmentType === 'PRODUCT_LINK' ? <LinkIcon size={12} color="#111111" /> : <FileText size={12} color="#111111" />}
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {attachmentName}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: '#FFFFFF', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>
                      {attachmentType === 'INVOICE' ? 'Invoice' : attachmentType === 'BILL' ? 'Bill' : 'Product Link'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName('');
                      setAttachmentUrl('');
                      setAttachmentType(undefined);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            Logged in as: <strong>{currentEmployee.name}</strong> ({currentEmployee.department})
          </div>
        </div>

        {/* ─── CARD 2: 02 · Amount & Payment Method ─── */}
        <div className="main-table-card" style={{
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          height: '100%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Step 02 · Cost & Channel
              </span>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                INR (₹)
              </span>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Estimated Amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)'
                }}>
                  ₹
                </span>
                <input
                  type="number"
                  className="form-input"
                  style={{
                    paddingLeft: 30,
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    height: 44
                  }}
                  value={amount}
                  onChange={e => {
                    setAmount(Math.max(0, Number(e.target.value)));
                    setSubmitted(false);
                  }}
                />
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8 }}>
                {[5000, 25000, 60000, 160000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setSubmitted(false);
                    }}
                    style={{
                      padding: '7px 4px',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: 'var(--radius-xs)',
                      border: amount === val ? '1px solid #111111' : '1px solid var(--border-subtle)',
                      background: amount === val ? '#111111' : 'var(--bg-subtle)',
                      color: amount === val ? '#FFFFFF' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    ₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Channel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Payment Channel
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                {[
                  { id: 'CARD', label: 'Corporate Card' },
                  { id: 'BILL', label: 'Vendor Invoice (Bill)' },
                  { id: 'REIMBURSEMENT', label: 'Employee Reimbursement' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSpendType(type.id as any)}
                    style={{
                      padding: '10px 12px',
                      fontSize: '0.8rem',
                      fontWeight: spendType === type.id ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${spendType === type.id ? '#111111' : 'var(--border-subtle)'}`,
                      background: spendType === type.id ? '#111111' : '#FFFFFF',
                      color: spendType === type.id ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 120ms ease'
                    }}
                  >
                    <span>{type.label}</span>
                    {spendType === type.id && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            Allowance: ₹{currentEmployee.allowanceLimit.toLocaleString('en-IN')} / month {isDeptHead ? 'departmental' : 'standard'} discretionary
          </div>
        </div>

        {/* ─── CARD 3: 03 · Policy Clearance & 1-Click Request (Warm Linen) ─── */}
        <div className="main-table-card" style={{
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F5F2EB',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #DFDACF',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          height: '100%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#787774' }}>
                Step 03 · Verdict
              </span>

              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                background: decision.status === 'PRE_APPROVED' 
                  ? '#EBF5EE' 
                  : decision.status === 'REQUIRES_APPROVAL' 
                  ? '#FBF3DB' 
                  : '#FDF2F2',
                color: decision.status === 'PRE_APPROVED' 
                  ? '#166534' 
                  : decision.status === 'REQUIRES_APPROVAL' 
                  ? '#7D5A08' 
                  : '#991B1B',
                border: `1px solid ${decision.status === 'PRE_APPROVED' 
                  ? '#C6E7D2' 
                  : decision.status === 'REQUIRES_APPROVAL' 
                  ? '#EADBAB' 
                  : '#F8C8C8'}`
              }}>
                {decision.status === 'PRE_APPROVED' ? 'INSTANT PASS' : decision.status === 'REQUIRES_APPROVAL' ? 'APPROVAL REQUIRED' : 'RESTRICTED'}
              </span>
            </div>

            <h3 style={{
              fontSize: '1.22rem',
              fontWeight: 700,
              color: '#111111',
              letterSpacing: '-0.02em',
              margin: '0 0 4px 0'
            }}>
              {decision.headline}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#5C5B57', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              {decision.subheadline}
            </p>

            {/* Stepper Pathway */}
            <div style={{
              padding: '10px 12px',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #DDD8CC',
              marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
                  <UserAvatar name={currentEmployee.name} size={28} shape="circle" />
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111111' }}>You</div>
                    <div style={{ fontSize: '0.66rem', color: '#787774' }}>{currentEmployee.name}</div>
                  </div>
                </div>

                <ChevronRight size={13} color="#787774" style={{ flexShrink: 0 }} />

                <div style={{ textAlign: 'center', flex: 1.1 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#111111' }}>₹{amount.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.66rem', color: '#787774' }}>{category}</div>
                </div>

                <ChevronRight size={13} color="#787774" style={{ flexShrink: 0 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1.2, justifyContent: 'flex-end' }}>
                  {decision.status === 'PRE_APPROVED' ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>Auto-Cleared</div>
                      <div style={{ fontSize: '0.66rem', color: '#787774' }}>Zero Delay</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111111' }}>
                          {decision.approverName}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#787774' }}>
                          {decision.approverRole}
                        </div>
                      </div>
                      <UserAvatar name={decision.approverName || 'Approver'} size={28} shape="circle" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: '#787774' }}>Governing Policy:</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#111111' }}>{decision.ruleCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: '#787774' }}>Turnaround SLA:</span>
                <span style={{ fontWeight: 600, color: '#37352F' }}>{decision.slaText}</span>
              </div>
              {attachmentName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                  <span style={{ color: '#787774' }}>Attached:</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: '#FFFFFF',
                    border: '1px solid #DDD8CC',
                    fontWeight: 600,
                    color: '#111111',
                    fontSize: '0.72rem',
                    maxWidth: 190,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {attachmentType === 'PRODUCT_LINK' ? <LinkIcon size={11} color="#111111" /> : <FileText size={11} color="#111111" />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachmentName}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ paddingTop: 12, borderTop: '1px solid #DFDACF', flexShrink: 0 }}>
            {decision.status === 'REQUIRES_APPROVAL' && !submitted && (
              <button
                type="button"
                onClick={handleSubmitRequest}
                className="btn-create-rule"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px 16px',
                  fontSize: '0.86rem',
                  background: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  border: '1px solid var(--brand-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700
                }}
              >
                <Send size={14} />
                <span>Submit Spend Request</span>
              </button>
            )}

            {decision.status === 'REQUIRES_APPROVAL' && submitted && (
              <div style={{
                padding: '12px 14px',
                background: 'var(--status-emerald-bg)',
                border: '1px solid var(--status-emerald-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-emerald-text)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, marginBottom: 5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={15} /> Request {lastSubmittedId} Dispatched
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('my_requests')}
                        style={{ background: 'none', border: 'none', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'underline', color: 'var(--status-emerald-text)', cursor: 'pointer' }}
                      >
                        Track Status →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      style={{ background: 'none', border: 'none', fontSize: '0.72rem', textDecoration: 'underline', color: 'var(--status-emerald-text)', cursor: 'pointer' }}
                    >
                      New Request
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.76rem' }}>
                  <UserAvatar name={decision.approverName || 'Approver'} size={20} shape="circle" />
                  <span>Submitted to <strong>{decision.approverName}</strong> for approval.</span>
                </div>
              </div>
            )}

            {decision.status === 'PRE_APPROVED' && (
              <div style={{
                padding: '12px 14px',
                background: 'var(--status-emerald-bg)',
                border: '1px solid var(--status-emerald-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-emerald-text)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
                  <CheckCircle2 size={15} /> Cleared: No Approval Needed
                </div>
                <div>You can charge this directly to your corporate card.</div>
              </div>
            )}

            {decision.status === 'BLOCKED' && (
              <div style={{
                padding: '12px 14px',
                background: 'var(--status-rose-bg)',
                border: '1px solid var(--status-rose-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-rose-text)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Ban size={15} /> Restricted Under Company Policy
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ─── MODAL: My Past Requests History ─── */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: 640,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>My Spend Requests</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>All requests submitted under your name</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  No past requests found.
                </div>
              ) : (
                myRequests.map(req => (
                  <div key={req.id} style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <UserAvatar name={req.requesterName} avatarUrl={req.requesterAvatar} size={36} shape="circle" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {req.description}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, flexWrap: 'wrap' }}>
                          <span>{req.category}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            Approver: <UserAvatar name={req.approverName} avatarUrl={req.approverAvatar} size={15} shape="circle" /> {req.approverName}
                          </span>
                          <span>•</span>
                          <span>{req.createdAt}</span>
                          {req.attachmentName && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--text-primary)', fontWeight: 600, background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>
                                <Paperclip size={10} /> {req.attachmentName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span className="mono-amount" style={{ fontWeight: 700, fontSize: '0.96rem' }}>
                        ₹{req.amount.toLocaleString('en-IN')}
                      </span>
                      {req.status === 'PENDING' && (
                        <span className="tab-pill-badge amber" style={{ fontSize: '0.7rem' }}>Pending</span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="badge-clean-approved" style={{ fontSize: '0.7rem' }}>Approved</span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="badge-danger" style={{ fontSize: '0.7rem' }}>Rejected</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button
                type="button"
                className="btn-create-rule"
                style={{ background: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', color: '#FFFFFF', padding: '6px 16px', fontSize: '0.82rem' }}
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
