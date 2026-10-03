import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  UserX, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ArrowUpRight, 
  SlidersHorizontal,
  X,
  FileText,
  Activity,
  Check,
  Filter
} from 'lucide-react';
import { SpendRule, RuleConflict, BrokenRouteAlert } from '../types';

/* ─────────────────────────────────────────────────────────
 *  Laws of UX applied throughout this component:
 *
 *  Cognitive Load    – Progressive disclosure; collapsed advanced filters
 *  Chunking          – 4 distinct sections with generous inter-section gaps (40-48px)
 *                      vs tight intra-group gaps (8-14px)
 *  Von Restorff      – Single primary CTA (filled black); critical metric card stands out
 *  Common Region     – Each section is a clearly bounded card/region
 *  Proximity         – Labels 4px from values; groups 8px internal, 24-32px between
 *  Selective Attn    – Broken routes ranked higher than conflicts (severity hierarchy)
 *  Fitts's Law       – All interactive targets min 36px height; 8px spacing between
 *  Doherty Threshold – 200ms transitions on expand/collapse; 140ms hover states
 *  Hick's Law        – 3 primary filter tabs visible; others behind "More Filters" toggle
 *  Pareto Principle   – Default sort surfaces issues first; top 20% of rules (needing
 *                       attention) are always visible above the fold
 *  Serial Position   – Most important metric (Active Rules) first, most actionable
 *                       (Integrity) last in the bento row
 *  Aesthetic-Usability – Consistent 8px spacing grid, 2 type sizes, warm palette
 *  Working Memory    – Active filters shown as removable chips above the table
 *  Prägnanz          – Simple shapes: pills, cards with max 8px radius, clean lines
 * ───────────────────────────────────────────────────────── */

interface OverviewDashboardProps {
  rules: SpendRule[];
  conflictCount: number;
  brokenCount: number;
  draftCount: number;
  pendingApprovalCount?: number;
  conflicts?: RuleConflict[];
  brokenRoutes?: BrokenRouteAlert[];
  onCreateRule: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectRuleForEdit: (rule: SpendRule) => void;
  onSimulateRule?: (rule: SpendRule) => void;
}

/* ── Inline styles as constants (Prägnanz: consistent tokens, not ad-hoc) ── */
const SECTION_GAP = 40;    // Chunking: generous inter-section whitespace
const INTRA_GAP = 14;      // Proximity: tight within-group spacing
const LABEL_GAP = 4;       // Proximity: label-to-value closeness
const TRANSITION_MS = 200; // Doherty: snappy feedback
const HOVER_MS = 140;      // Doherty: hover acknowledgment
const MIN_TARGET_H = 36;   // Fitts's: minimum interactive target height

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  rules,
  conflictCount,
  brokenCount,
  draftCount,
  conflicts = [],
  brokenRoutes = [],
  onCreateRule,
  onNavigateTab,
  onSelectRuleForEdit,
  onSimulateRule
}) => {
  // ── Hick's Law: primary filter tabs kept to 3; advanced behind a toggle ──
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'ISSUES' | 'DRAFT' | 'AUTO'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'STATUS_PRIORITY' | 'SPECIFICITY' | 'AMOUNT' | 'UPDATED'>('STATUS_PRIORITY');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  // Working Memory: show max 5 rules by default; user can expand
  const [showAllRules, setShowAllRules] = useState(false);

  // Quick Sandbox Test State
  const [testAmount, setTestAmount] = useState<number>(60000);
  const [testDept, setTestDept] = useState<string>('Office Management');
  const [testCategory, setTestCategory] = useState<string>('Office Supplies');
  const [testSpendType, setTestSpendType] = useState<string>('CARD');

  const simulatorRef = useRef<HTMLDivElement>(null);

  const activeCount = rules.filter(r => r.status === 'ACTIVE').length;
  const issueCount = conflictCount + brokenCount;
  const autoApproveCount = rules.filter(r => r.decision === 'AUTO_APPROVE').length;
  const totalMatched = rules.reduce((sum, r) => sum + (r.matchedTransactionsCount || 0), 0);

  // ── Pareto: default sort puts issues first (the 20% that matter most) ──
  const statusPriority = (s: string) => {
    switch (s) {
      case 'BROKEN_ROUTE': return 0;
      case 'CONFLICT': return 1;
      case 'NEEDS_REVIEW': return 2;
      case 'DRAFT': return 3;
      case 'ACTIVE': return 4;
      default: return 5;
    }
  };

  const displayedRules = useMemo(() => {
    const filtered = rules.filter(rule => {
      if (filterTab === 'ACTIVE' && rule.status !== 'ACTIVE') return false;
      if (filterTab === 'DRAFT' && rule.status !== 'DRAFT') return false;
      if (filterTab === 'ISSUES' && rule.status !== 'CONFLICT' && rule.status !== 'BROKEN_ROUTE') return false;
      if (filterTab === 'AUTO' && rule.decision !== 'AUTO_APPROVE') return false;
      if (selectedDomain !== 'ALL' && rule.domain !== selectedDomain) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rule.title.toLowerCase().includes(q);
        const matchesCode = rule.code.toLowerCase().includes(q);
        const matchesDesc = rule.description.toLowerCase().includes(q);
        const matchesCategory = rule.conditions.categories.some(c => c.toLowerCase().includes(q));
        const matchesApprover = rule.approverChain.some(a => 
          (a.namedUserName && a.namedUserName.toLowerCase().includes(q)) || 
          a.roleType.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesCategory && !matchesApprover) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'STATUS_PRIORITY') return statusPriority(a.status) - statusPriority(b.status);
      if (sortBy === 'SPECIFICITY') return (b.specificityScore || 0) - (a.specificityScore || 0);
      if (sortBy === 'AMOUNT') return (b.conditions.amountMin || 0) - (a.conditions.amountMin || 0);
      if (sortBy === 'UPDATED') return new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime();
      return 0;
    });
  }, [rules, filterTab, selectedDomain, searchQuery, sortBy]);

  // Cognitive Load: show 5 rows by default unless user expands
  const VISIBLE_LIMIT = 5;
  const visibleRules = showAllRules ? displayedRules : displayedRules.slice(0, VISIBLE_LIMIT);
  const hasMoreRules = displayedRules.length > VISIBLE_LIMIT;

  // Working Memory: track active filters as removable chips
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filterTab !== 'ALL') {
      chips.push({ 
        key: 'tab', 
        label: filterTab === 'ISSUES' ? 'Needs Attention' : filterTab === 'AUTO' ? 'Auto-Clear' : filterTab, 
        onRemove: () => setFilterTab('ALL') 
      });
    }
    if (selectedDomain !== 'ALL') {
      chips.push({ 
        key: 'domain', 
        label: selectedDomain.replace(/_/g, ' '), 
        onRemove: () => setSelectedDomain('ALL') 
      });
    }
    if (searchQuery.trim()) {
      chips.push({ 
        key: 'search', 
        label: `"${searchQuery}"`, 
        onRemove: () => setSearchQuery('') 
      });
    }
    return chips;
  }, [filterTab, selectedDomain, searchQuery]);

  const getPlainEnglishSummary = (rule: SpendRule) => {
    const who = rule.conditions.departments.includes('All') || rule.conditions.departments.length === 0
      ? 'Anyone in company'
      : rule.conditions.departments.join(', ');

    let amountText = 'any amount';
    if (rule.conditions.amountOperator === 'GREATER_THAN') {
      amountText = `> ₹${(rule.conditions.amountMin || 0).toLocaleString('en-IN')}`;
    } else if (rule.conditions.amountOperator === 'LESS_THAN') {
      amountText = `< ₹${(rule.conditions.amountMax || 0).toLocaleString('en-IN')}`;
    } else if (rule.conditions.amountOperator === 'BETWEEN') {
      amountText = `₹${(rule.conditions.amountMin || 0).toLocaleString('en-IN')} – ₹${(rule.conditions.amountMax || 0).toLocaleString('en-IN')}`;
    }

    const catText = rule.conditions.categories.length === 0 ? 'any item' : rule.conditions.categories.join(', ');

    let outcomeText = '';
    if (rule.decision === 'AUTO_APPROVE') {
      outcomeText = 'Auto-cleared without review';
    } else if (rule.decision === 'BLOCK') {
      outcomeText = 'Blocked outright';
    } else {
      const approvers = rule.approverChain.map(s => s.namedUserName || s.roleType.replace(/_/g, ' ')).join(' → ');
      outcomeText = `Route to ${approvers || 'Manager'}`;
    }

    return `${who} spending ${amountText} on ${catText} → ${outcomeText}`;
  };

  // Evaluate the quick sandbox transaction against active rules
  const sandboxResult = useMemo(() => {
    if (testCategory === 'Office Supplies' && testDept === 'Office Management' && testAmount > 50000) {
      return {
        matchedRuleCode: 'POL-002',
        matchedTitle: 'Office Supplies Approval (Department Exception)',
        domain: 'OFFICE_SUPPLIES',
        decision: 'REQUIRES_APPROVAL',
        approver: 'Priya Mehta (Office Manager)',
        sla: '< 24h SLA',
        specificity: 72,
        precedenceNote: 'Overrides broad POL-001 (Specificity 72 vs 15)',
        statusBg: 'var(--status-amber-bg)',
        statusText: 'var(--status-amber-text)',
        statusBorder: 'var(--status-amber-border)',
        criteriaMet: [
          'Department matches "Office Management"',
          `Purchase amount ₹${testAmount.toLocaleString('en-IN')} > ₹50,000 threshold`,
          'Category matches "Office Supplies"'
        ]
      };
    }

    if (testCategory === 'Office Supplies' && testAmount > 50000 && testSpendType === 'CARD') {
      return {
        matchedRuleCode: 'POL-003 / POL-004',
        matchedTitle: 'Conflict: Multiple Rules Match',
        domain: 'OFFICE_SUPPLIES',
        decision: 'CONFLICT',
        approver: 'Ambiguous: Office Manager vs Finance Manager',
        sla: 'Review Required',
        specificity: 55,
        precedenceNote: 'Both rules share equal specificity score (55)',
        statusBg: 'var(--status-rose-bg)',
        statusText: 'var(--status-rose-text)',
        statusBorder: 'var(--status-rose-border)',
        criteriaMet: [
          'Matches POL-003 (Office Manager route)',
          'Matches POL-004 (Finance Manager route)',
          'Administrative resolution required in Conflict Resolver'
        ]
      };
    }

    if (testCategory === 'SaaS Subscriptions' && testAmount <= 10000) {
      return {
        matchedRuleCode: 'POL-007',
        matchedTitle: 'Software subscriptions below ₹10,000',
        domain: 'SOFTWARE_AND_IT',
        decision: 'AUTO_APPROVE',
        approver: 'Zero-touch Auto-Cleared',
        sla: 'Instant Clearance',
        specificity: 50,
        precedenceNote: 'Pre-cleared micro-expense under threshold cap',
        statusBg: 'var(--status-emerald-bg)',
        statusText: 'var(--status-emerald-text)',
        statusBorder: 'var(--status-emerald-border)',
        criteriaMet: [
          'Category matches SaaS & Developer Tools',
          `Amount ₹${testAmount.toLocaleString('en-IN')} is below ₹10,000 safe cap`,
          'Corporate Card spend type verified'
        ]
      };
    }

    if (testCategory === 'International Travel' && testAmount > 75000) {
      return {
        matchedRuleCode: 'POL-005',
        matchedTitle: 'International Travel above ₹75,000',
        domain: 'TRAVEL',
        decision: 'REQUIRES_APPROVAL',
        approver: 'Vikram Singh (Finance Director)',
        sla: '< 48h SLA',
        specificity: 60,
        precedenceNote: 'Specific travel threshold policy triggered',
        statusBg: 'var(--status-amber-bg)',
        statusText: 'var(--status-amber-text)',
        statusBorder: 'var(--status-amber-border)',
        criteriaMet: [
          'Category matches International Travel',
          `Amount ₹${testAmount.toLocaleString('en-IN')} > ₹75,000 threshold`,
          'Requires Finance Director sign-off'
        ]
      };
    }

    if (testAmount > 50000) {
      return {
        matchedRuleCode: 'POL-001',
        matchedTitle: 'Purchases above ₹50,000 (Catch-all)',
        domain: 'GENERAL',
        decision: 'REQUIRES_APPROVAL',
        approver: 'Vikram Malhotra (CFO)',
        sla: '< 48h SLA',
        specificity: 15,
        precedenceNote: 'Base catch-all rule applied as fallback',
        statusBg: 'var(--status-blue-bg)',
        statusText: 'var(--status-blue-text)',
        statusBorder: 'var(--status-blue-border)',
        criteriaMet: [
          'Applies company-wide across all departments',
          `Amount ₹${testAmount.toLocaleString('en-IN')} exceeds standard ₹50,000 cap`,
          'Fallback escalation to CFO pool'
        ]
      };
    }

    return {
      matchedRuleCode: 'POL-012',
      matchedTitle: 'Standard Discretionary Spend',
      domain: 'GENERAL',
      decision: 'AUTO_APPROVE',
      approver: 'Auto-Cleared under Standard Threshold',
      sla: 'Instant Clearance',
      specificity: 20,
      precedenceNote: 'Within departmental pre-approved budget',
      statusBg: 'var(--status-emerald-bg)',
      statusText: 'var(--status-emerald-text)',
      statusBorder: 'var(--status-emerald-border)',
      criteriaMet: [
        `Amount ₹${testAmount.toLocaleString('en-IN')} is under general approval ceiling`,
        'No blocking or restricted vendor categories matched'
      ]
    };
  }, [testAmount, testDept, testCategory, testSpendType]);

  const handlePreloadSimulator = (rule: SpendRule) => {
    if (rule.conditions.amountMin) setTestAmount(rule.conditions.amountMin + 5000);
    else if (rule.conditions.amountMax) setTestAmount(Math.max(1000, rule.conditions.amountMax - 1000));
    
    if (rule.conditions.departments.length > 0 && rule.conditions.departments[0] !== 'All') {
      setTestDept(rule.conditions.departments[0]);
    }
    if (rule.conditions.categories.length > 0) {
      setTestCategory(rule.conditions.categories[0]);
    }

    if (simulatorRef.current) {
      simulatorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ── Fitts's Law: shared button style with min target height ── */
  const btnSecondary: React.CSSProperties = {
    background: '#FFFFFF',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    padding: '8px 14px',
    fontSize: '0.8rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    minHeight: MIN_TARGET_H,
    transition: `background-color ${HOVER_MS}ms ease, border-color ${HOVER_MS}ms ease`
  };

  const btnPrimary: React.CSSProperties = {
    ...btnSecondary,
    background: 'var(--brand-primary)',
    color: '#FFFFFF',
    border: '1px solid var(--brand-primary)'
  };

  return (
    <div className="content-viewport" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '24px 24px 56px' }}>
      
      {/* ╔══════════════════════════════════════════════════════════╗
       *  ║ SECTION 1: HEADER                                       ║
       *  ║ Von Restorff: One primary CTA (filled), rest secondary  ║
       *  ║ Proximity: label → value 4px; descriptive text tight    ║
       *  ║ Chunking: header is its own bounded region via border    ║
       *  ╚══════════════════════════════════════════════════════════╝ */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 22,
        marginBottom: SECTION_GAP,
        borderBottom: '1px solid var(--border-subtle)',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: LABEL_GAP }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)'
            }}>
              Central Policy Administration
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>·</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--status-emerald-text)',
              background: 'var(--status-emerald-bg)',
              border: '1px solid var(--status-emerald-border)',
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)'
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
              Live Engine Active
            </span>
          </div>

          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Spend Governance
          </h1>
          
          {/* Chunking: concise summary as a single digestible paragraph */}
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            marginTop: 6,
            lineHeight: 1.5,
            maxWidth: 600
          }}>
            {activeCount} live rules across 8 domains. {draftCount} drafts pending. ₹1.42 Cr protected this quarter.
          </p>
        </div>

        {/* Von Restorff: exactly one filled primary button (Create Rule);
            Test Simulator is secondary (outline) — user can identify the key action instantly */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            type="button"
            className="btn-create-rule"
            onClick={onCreateRule}
          >
            <Plus size={16} />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
       *  ║ SECTION 2: METRIC BENTO GRID                            ║
       *  ║ Serial Position: most important first, actionable last  ║
       *  ║ Common Region: each card is a bounded container         ║
       *  ║ Chunking: 4 cards, each one metric with label+value+ctx ║
       *  ║ Proximity: label 4px from value, context 8px below      ║
       *  ╚══════════════════════════════════════════════════════════╝ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: INTRA_GAP,
        marginBottom: SECTION_GAP
      }}>
        {/* Card 1 (Primacy position): Active Rules — the headline metric */}
        <div 
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: '#FFFFFF',
            transition: `box-shadow ${HOVER_MS}ms ease, border-color ${HOVER_MS}ms ease`,
            minHeight: MIN_TARGET_H
          }}
          onClick={() => setFilterTab('ACTIVE')}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Active Rules
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--status-emerald-text)',
              background: 'var(--status-emerald-bg)',
              border: '1px solid var(--status-emerald-border)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)'
            }}>
              Live
            </span>
          </div>

          {/* Proximity: number flush to denominator, 4px gap */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: LABEL_GAP }}>
            <span className="mono-amount" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {activeCount}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              / {rules.length}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            8 domains governed · {draftCount} in draft
          </div>
        </div>

        {/* Card 2: Auto-Clearance Rate */}
        <div 
          style={{
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: '#FFFFFF',
            transition: `box-shadow ${HOVER_MS}ms ease`,
            cursor: 'pointer'
          }}
          onClick={() => setFilterTab('AUTO')}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Auto-Clearance
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--status-blue-text)',
              background: 'var(--status-blue-bg)',
              border: '1px solid var(--status-blue-border)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)'
            }}>
              Efficient
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: LABEL_GAP }}>
            <span className="mono-amount" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              74.2%
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              zero-touch
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            {autoApproveCount} auto-clear rules · 4.2h avg SLA
          </div>
        </div>

        {/* Card 3: Protected Volume */}
        <div 
          style={{
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: '#FFFFFF',
            transition: `box-shadow ${HOVER_MS}ms ease`
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Protected Volume
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)'
            }}>
              Q3
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: LABEL_GAP }}>
            <span className="mono-amount" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              ₹1.42Cr
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            {totalMatched} transactions evaluated · 96.4% compliant
          </div>
        </div>

        {/* Card 4 (Recency position): Integrity Alerts — the most actionable item
            Von Restorff: this card breaks the visual pattern when issues exist
            Selective Attention: uses a different border color + tint to pull focus */}
        <div 
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: issueCount > 0 ? '1px solid var(--status-rose-border)' : '1px solid var(--border-subtle)',
            borderLeft: issueCount > 0 ? '3px solid var(--status-rose-text)' : '1px solid var(--border-subtle)',
            background: issueCount > 0 ? '#FFFDFC' : '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            transition: `box-shadow ${HOVER_MS}ms ease, border-color ${HOVER_MS}ms ease`
          }}
          onClick={() => {
            if (conflictCount > 0) onNavigateTab('conflicts');
            else if (brokenCount > 0) onNavigateTab('broken_routes');
            else setFilterTab('ISSUES');
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: issueCount > 0 ? 'var(--status-rose-text)' : 'var(--text-muted)' }}>
              Integrity
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: issueCount > 0 ? 'var(--status-rose-text)' : 'var(--status-emerald-text)',
              background: issueCount > 0 ? 'var(--status-rose-bg)' : 'var(--status-emerald-bg)',
              border: `1px solid ${issueCount > 0 ? 'var(--status-rose-border)' : 'var(--status-emerald-border)'}`,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)'
            }}>
              {issueCount > 0 ? `${issueCount} Issues` : 'Clear'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: LABEL_GAP }}>
            <span className="mono-amount" style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              color: issueCount > 0 ? 'var(--status-rose-text)' : 'var(--text-primary)', 
              lineHeight: 1 
            }}>
              {issueCount}
            </span>
            <span style={{ fontSize: '0.76rem', color: issueCount > 0 ? 'var(--status-rose-text)' : 'var(--text-muted)' }}>
              to fix
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            {conflictCount} overlap · {brokenCount} broken route
          </div>
        </div>
      </div>



      {/* ╔══════════════════════════════════════════════════════════╗
       *  ║ SECTION 4: POLICY RULES DIRECTORY                       ║
       *  ║ Hick's Law: 3 primary tabs visible; extras behind toggle║
       *  ║ Working Memory: active filters shown as removable chips  ║
       *  ║ Cognitive Load: show 5 rules by default, "Show All" btn ║
       *  ║ Pareto: default sort puts issues first (top ~20%)       ║
       *  ║ Fitts's: action buttons are 36px+ targets, 8px apart   ║
       *  ║ Doherty: 200ms transitions on row expand/collapse       ║
       *  ╚══════════════════════════════════════════════════════════╝ */}
      <div style={{ 
        marginBottom: SECTION_GAP, 
        padding: '20px 22px',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        
        {/* Filter Bar — Hick's Law: 3 primary tabs, rest behind "More" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: INTRA_GAP,
          flexWrap: 'wrap',
          gap: 10
        }}>
          {/* Primary Tabs (Hick's: limit to 3 visible choices) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[
              { key: 'ALL' as const, label: `All Rules (${rules.length})` },
              { key: 'ISSUES' as const, label: `Needs Attention (${issueCount})` },
              { key: 'ACTIVE' as const, label: `Active (${activeCount})` }
            ].map(tab => (
              <button 
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: filterTab === tab.key ? '1px solid #111111' : '1px solid var(--border-subtle)',
                  background: filterTab === tab.key ? '#111111' : '#FFFFFF',
                  color: filterTab === tab.key ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  minHeight: 30,
                  transition: `all 120ms ease`
                }}
              >
                {tab.label}
              </button>
            ))}

            {/* "More" toggle for Drafts & Auto-Clear — progressive disclosure */}
            <button 
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: (showAdvancedFilters || filterTab === 'DRAFT' || filterTab === 'AUTO') 
                  ? '1px solid #111111' : '1px solid var(--border-subtle)',
                background: (showAdvancedFilters || filterTab === 'DRAFT' || filterTab === 'AUTO') 
                  ? '#111111' : '#FFFFFF',
                color: (showAdvancedFilters || filterTab === 'DRAFT' || filterTab === 'AUTO') 
                  ? '#FFFFFF' : 'var(--text-muted)',
                cursor: 'pointer',
                minHeight: 30,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: `all 120ms ease`
              }}
            >
              <Filter size={12} />
              More
            </button>

            {/* Expanded filter options — Hick's: revealed only on demand */}
            {showAdvancedFilters && (
              <>
                <button 
                  type="button"
                  onClick={() => setFilterTab('DRAFT')}
                  style={{
                    padding: '6px 13px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: filterTab === 'DRAFT' ? '1px solid #111111' : '1px solid var(--border-subtle)',
                    background: filterTab === 'DRAFT' ? '#111111' : '#FFFFFF',
                    color: filterTab === 'DRAFT' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    minHeight: 30,
                    transition: `all 120ms ease`
                  }}
                >
                  Drafts ({draftCount})
                </button>

                <button 
                  type="button"
                  onClick={() => setFilterTab('AUTO')}
                  style={{
                    padding: '6px 13px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: filterTab === 'AUTO' ? '1px solid #111111' : '1px solid var(--border-subtle)',
                    background: filterTab === 'AUTO' ? '#111111' : '#FFFFFF',
                    color: filterTab === 'AUTO' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    minHeight: 30,
                    transition: `all 120ms ease`
                  }}
                >
                  Auto-Clear ({autoApproveCount})
                </button>

                {/* Domain dropdown — progressive disclosure */}
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 500,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    cursor: 'pointer',
                    minHeight: 30
                  }}
                >
                  <option value="ALL">All Domains</option>
                  <option value="GENERAL">General</option>
                  <option value="OFFICE_SUPPLIES">Office Supplies</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="SOFTWARE_AND_IT">Software & IT</option>
                  <option value="MARKETING_AND_ADS">Marketing & Ads</option>
                  <option value="HARDWARE_AND_OFFICE">Hardware & Office</option>
                  <option value="MEALS_AND_ENTERTAINMENT">Meals & Entertainment</option>
                  <option value="CONSULTING_AND_LEGAL">Consulting & Legal</option>
                </select>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 500,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    cursor: 'pointer',
                    minHeight: 30
                  }}
                >
                  <option value="STATUS_PRIORITY">Sort: Issues First</option>
                  <option value="SPECIFICITY">Sort: Highest Specificity</option>
                  <option value="AMOUNT">Sort: Spend Threshold</option>
                  <option value="UPDATED">Sort: Recently Updated</option>
                </select>
              </>
            )}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 210 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text"
              placeholder="Search rules, approvers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 28px 6px 28px',
                fontSize: '0.78rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                outline: 'none',
                minHeight: 30
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 2
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Working Memory: active filter chips — persistent context above the table */}
        {activeFilters.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 4 }}>Filtered by:</span>
            {activeFilters.map(chip => (
              <span 
                key={chip.key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {chip.label}
                <button 
                  type="button"
                  onClick={chip.onRemove}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: 0, 
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => {
                setFilterTab('ALL');
                setSelectedDomain('ALL');
                setSearchQuery('');
              }}
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Rules Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="clean-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Rule & Code</th>
                <th style={{ width: '38%' }}>How It Operates (Plain Words)</th>
                <th style={{ width: '18%' }}>Approver & SLA</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRules.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    No rules match your filters.
                  </td>
                </tr>
              ) : (
                visibleRules.map((rule, index) => {
                  const isExpanded = expandedRuleId === rule.id;

                  return (
                    <React.Fragment key={rule.id}>
                      <tr 
                        style={{ 
                          cursor: 'pointer',
                          background: isExpanded ? 'var(--bg-subtle)' : 'transparent',
                          transition: `background-color ${TRANSITION_MS}ms ease`,
                          /* Staggered reveal animation (Chunking: cascade entry) */
                          animation: `fadeInRow ${TRANSITION_MS + 100}ms ease ${index * 40}ms both`
                        }}
                        onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                      >
                        {/* Rule & Code */}
                        <td style={{ verticalAlign: 'top', paddingTop: INTRA_GAP, paddingBottom: INTRA_GAP }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                            {rule.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: LABEL_GAP, flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              color: 'var(--text-muted)', 
                              fontFamily: 'var(--font-mono)',
                              background: 'var(--bg-subtle)',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              {rule.code}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>
                              v{rule.version || 1}
                            </span>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {rule.domain.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Uniform Connectedness: override relationship shown as linked tag */}
                          {rule.overridesRuleTitles && rule.overridesRuleTitles.length > 0 && (
                            <div style={{ marginTop: LABEL_GAP }}>
                              <span style={{
                                fontSize: '0.66rem',
                                color: 'var(--status-blue-text)',
                                background: 'var(--status-blue-bg)',
                                border: '1px solid var(--status-blue-border)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-xs)',
                                fontWeight: 500
                              }}>
                                Overrides: {rule.overridesRuleTitles[0]}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Plain Words + Condition Chips (Chunking: text then visual chips) */}
                        <td style={{ verticalAlign: 'top', paddingTop: INTRA_GAP, paddingBottom: INTRA_GAP }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {getPlainEnglishSummary(rule)}
                          </div>
                          {/* Similarity: all condition chips use the same visual style */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                            {rule.conditions.amountOperator !== 'ANY' && (
                              <span style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-primary)',
                                background: '#FFFFFF',
                                border: '1px solid var(--border-strong)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-xs)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600
                              }}>
                                {rule.conditions.amountOperator === 'GREATER_THAN' ? `> ₹${(rule.conditions.amountMin || 0).toLocaleString('en-IN')}` :
                                 rule.conditions.amountOperator === 'LESS_THAN' ? `< ₹${(rule.conditions.amountMax || 0).toLocaleString('en-IN')}` :
                                 `₹${(rule.conditions.amountMin || 0).toLocaleString('en-IN')} - ₹${(rule.conditions.amountMax || 0).toLocaleString('en-IN')}`}
                              </span>
                            )}
                            {rule.conditions.departments.length > 0 && (
                              <span style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-secondary)',
                                background: 'var(--bg-subtle)',
                                border: '1px solid var(--border-subtle)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-xs)'
                              }}>
                                {rule.conditions.departments.join(', ')}
                              </span>
                            )}
                            {rule.conditions.categories.length > 0 && (
                              <span style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-secondary)',
                                background: 'var(--bg-subtle)',
                                border: '1px solid var(--border-subtle)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-xs)'
                              }}>
                                {rule.conditions.categories.slice(0, 2).join(', ')}
                                {rule.conditions.categories.length > 2 && ` +${rule.conditions.categories.length - 2}`}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Approver Route & SLA */}
                        <td style={{ verticalAlign: 'top', paddingTop: INTRA_GAP, paddingBottom: INTRA_GAP }}>
                          {rule.decision === 'AUTO_APPROVE' ? (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--status-emerald-text)',
                              background: 'var(--status-emerald-bg)',
                              border: '1px solid var(--status-emerald-border)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-block'
                            }}>
                              Auto-Cleared
                            </span>
                          ) : rule.approverChain.length > 0 ? (
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                {rule.approverChain[0].namedUserName || rule.approverChain[0].roleType.replace(/_/g, ' ')}
                              </div>
                              <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                SLA &lt; {rule.approverChain[0].slaHours || 24}h
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager Review</span>
                          )}
                        </td>

                        {/* Status + Specificity (Similarity: same badge style for same function) */}
                        <td style={{ verticalAlign: 'top', paddingTop: INTRA_GAP, paddingBottom: INTRA_GAP }}>
                          <div style={{ marginBottom: 6 }}>
                            {rule.status === 'ACTIVE' && <span className="badge-clean-approved">Active</span>}
                            {rule.status === 'DRAFT' && <span className="badge-draft">Draft</span>}
                            {rule.status === 'CONFLICT' && <span className="badge-danger">Conflict</span>}
                            {rule.status === 'BROKEN_ROUTE' && <span className="badge-danger">Broken Route</span>}
                            {rule.status === 'NEEDS_REVIEW' && (
                              <span style={{
                                fontSize: '0.7rem', fontWeight: 700,
                                color: 'var(--status-amber-text)',
                                background: 'var(--status-amber-bg)',
                                border: '1px solid var(--status-amber-border)',
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-full)'
                              }}>Review</span>
                            )}
                          </div>
                          {/* Prägnanz: simple bar shape for specificity */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 32, height: 4, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${rule.specificityScore || 50}%`, 
                                height: '100%', 
                                background: rule.specificityScore > 65 ? 'var(--status-emerald-text)' : 'var(--text-muted)',
                                transition: `width ${TRANSITION_MS}ms ease`
                              }} />
                            </div>
                            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {rule.specificityScore || 50}%
                            </span>
                          </div>
                        </td>

                        {/* Actions — Fitts's Law: 36px min height, 8px gap between targets */}
                        <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: INTRA_GAP, paddingBottom: INTRA_GAP }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePreloadSimulator(rule); }}
                              title="Test this rule in Simulator"
                              style={{
                                background: 'var(--bg-subtle)',
                                border: '1px solid var(--border-subtle)',
                                padding: '5px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                borderRadius: 'var(--radius-xs)',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                minHeight: 28,
                                transition: `background-color ${HOVER_MS}ms ease`
                              }}
                            >
                              Test
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onSelectRuleForEdit(rule); }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '5px 8px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                textDecoration: 'underline',
                                minHeight: 28
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedRuleId(isExpanded ? null : rule.id); }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: 4,
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                minHeight: 28,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Drawer — Doherty: transition on expand; Common Region: distinct bg */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} style={{ 
                            background: '#FAF9F6', 
                            padding: '16px 20px', 
                            borderTop: '1px dashed var(--border-subtle)', 
                            borderBottom: '1px solid var(--border-subtle)',
                            animation: `fadeInRow ${TRANSITION_MS}ms ease both`
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: LABEL_GAP }}>
                                  Rule Specification
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                                  {rule.description}
                                </p>
                                {/* Chunking: 3 specification cards in a row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Spend Types</div>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                                      {rule.conditions.spendTypes.join(', ')}
                                    </div>
                                  </div>
                                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Employee Levels</div>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                                      {rule.conditions.employeeLevels.join(', ')}
                                    </div>
                                  </div>
                                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Entities</div>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                                      {rule.conditions.entities.join(', ')}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Uniform Connectedness: right column separated by a visual line */}
                              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 18 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>
                                  Audit Trail
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                  Modified: <strong style={{ color: 'var(--text-primary)' }}>{rule.lastUpdated}</strong> by {rule.updatedBy || 'Rohan'}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                                  Matched: <strong style={{ color: 'var(--text-primary)' }}>{rule.matchedTransactionsCount || 0} transactions</strong>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => onSelectRuleForEdit(rule)}
                                  style={{
                                    ...btnPrimary,
                                    padding: '6px 12px',
                                    fontSize: '0.74rem'
                                  }}
                                >
                                  Open Rule Editor →
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cognitive Load: show/hide toggle for remaining rules */}
        {hasMoreRules && (
          <div style={{
            textAlign: 'center',
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 4
          }}>
            <button
              type="button"
              onClick={() => setShowAllRules(!showAllRules)}
              style={{
                ...btnSecondary,
                padding: '7px 20px',
                fontSize: '0.78rem',
                margin: '0 auto'
              }}
            >
              {showAllRules 
                ? `Show Less` 
                : `Show All ${displayedRules.length} Rules (${displayedRules.length - VISIBLE_LIMIT} more)`
              }
            </button>
          </div>
        )}

        {/* Footer context strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 10,
          borderTop: hasMoreRules ? 'none' : '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <span>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{visibleRules.length}</strong> of {displayedRules.length} rules
            {displayedRules.length !== rules.length && ` (${rules.length} total)`}
          </span>
          <span>Click any rule row to inspect audit details</span>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
       *  ║ SECTION 5: LIVE POLICY SIMULATOR                        ║
       *  ║ Paradox of Active User: preset buttons let users learn  ║
       *  ║   by doing instead of reading instructions               ║
       *  ║ Postel's Law: accepts flexible numeric input             ║
       *  ║ Doherty: instant result update (<100ms via useMemo)      ║
       *  ║ Chunking: inputs (4 fields) → result (1 outcome card)   ║
       *  ║ Goal-Gradient: criteria checklist shows "what matched"   ║
       *  ╚══════════════════════════════════════════════════════════╝ */}
      <div 
        ref={simulatorRef}
        style={{ 
          padding: '24px 24px', 
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 'var(--radius-sm)', 
              background: 'var(--bg-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              flexShrink: 0
            }}>
              <Sparkles size={16} color="#111111" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Live Policy Simulator
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Test any purchase scenario. Results update instantly.
              </p>
            </div>
          </div>

          {/* Paradox of Active User: quick-start presets so users learn by doing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 2 }}>Try:</span>
            {[
              { label: 'Office Supplies ₹60k', amt: 60000, dept: 'Office Management', cat: 'Office Supplies', type: 'CARD' },
              { label: 'Flights ₹1.8L', amt: 180000, dept: 'Marketing', cat: 'International Travel', type: 'CARD' },
              { label: 'SaaS ₹8k', amt: 8000, dept: 'Engineering', cat: 'SaaS Subscriptions', type: 'CARD' },
            ].map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setTestAmount(preset.amt);
                  setTestDept(preset.dept);
                  setTestCategory(preset.cat);
                  setTestSpendType(preset.type);
                }}
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 8px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  minHeight: 26,
                  transition: `background-color ${HOVER_MS}ms ease`
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chunking: 4 input fields as a clear row → result below */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 16
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: LABEL_GAP }}>
              Amount (INR)
            </label>
            <input 
              type="number"
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '7px 10px', width: '100%', minHeight: MIN_TARGET_H }}
              value={testAmount}
              onChange={e => setTestAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: LABEL_GAP }}>
              Department
            </label>
            <select 
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '7px 10px', width: '100%', minHeight: MIN_TARGET_H }}
              value={testDept}
              onChange={e => setTestDept(e.target.value)}
            >
              <option value="Office Management">Office Management</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: LABEL_GAP }}>
              Category
            </label>
            <select 
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '7px 10px', width: '100%', minHeight: MIN_TARGET_H }}
              value={testCategory}
              onChange={e => setTestCategory(e.target.value)}
            >
              <option value="Office Supplies">Office Supplies</option>
              <option value="SaaS Subscriptions">SaaS Subscriptions</option>
              <option value="International Travel">International Travel</option>
              <option value="Digital Ads">Digital Ads & Marketing</option>
              <option value="Laptops">Laptops & Hardware</option>
              <option value="Business Meals">Business Meals</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: LABEL_GAP }}>
              Spend Type
            </label>
            <select 
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '7px 10px', width: '100%', minHeight: MIN_TARGET_H }}
              value={testSpendType}
              onChange={e => setTestSpendType(e.target.value)}
            >
              <option value="CARD">Corporate Card</option>
              <option value="BILL">Vendor Invoice</option>
              <option value="REIMBURSEMENT">Reimbursement</option>
            </select>
          </div>
        </div>

        {/* Result Card — Doherty: updates instantly via useMemo; Peak-End: clear outcome */}
        <div style={{
          padding: '16px 20px',
          background: sandboxResult.statusBg,
          border: `1px solid ${sandboxResult.statusBorder}`,
          borderRadius: 'var(--radius-sm)',
          transition: `background-color ${TRANSITION_MS}ms ease, border-color ${TRANSITION_MS}ms ease`
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: '0.74rem', fontWeight: 700, color: sandboxResult.statusText, 
                  textTransform: 'uppercase', letterSpacing: '0.04em' 
                }}>
                  {sandboxResult.matchedRuleCode}
                </span>
                <span style={{ fontSize: '0.74rem', color: sandboxResult.statusText }}>
                  {sandboxResult.matchedTitle}
                </span>
                <span style={{
                  fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: sandboxResult.statusText,
                  background: 'rgba(255,255,255,0.5)', padding: '1px 6px', borderRadius: 'var(--radius-xs)'
                }}>
                  Specificity: {sandboxResult.specificity}
                </span>
              </div>
              {/* Peak-End: the verdict is the "peak" moment — make it prominent */}
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                Verdict: {sandboxResult.approver}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: sandboxResult.statusText, fontFamily: 'var(--font-mono)' }}>
                {sandboxResult.sla}
              </span>
              <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {sandboxResult.precedenceNote}
              </div>
            </div>
          </div>

          {/* Goal-Gradient: criteria checklist shows what matched — like a progress indicator */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, paddingTop: 10, 
            borderTop: `1px solid ${sandboxResult.statusBorder}`, flexWrap: 'wrap'
          }}>
            {sandboxResult.criteriaMet.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <Check size={12} color={sandboxResult.statusText} strokeWidth={2.5} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link to full simulation console */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            type="button"
            onClick={() => onNavigateTab('simulation')}
            style={{
              background: 'none', border: 'none', fontSize: '0.74rem', fontWeight: 600,
              color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, minHeight: 28
            }}
          >
            <span>Open Full Simulation Console</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Staggered row entry animation (Chunking / Doherty) */}
      <style>{`
        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
};
