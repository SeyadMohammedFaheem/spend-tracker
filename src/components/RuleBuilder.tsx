import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Save, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { SpendRule, RuleConditions, ApproverStep, RuleDecision, PolicyDomain } from '../types';
import { APPROVERS_DIRECTORY, ApproverDirectoryItem, INITIAL_RULES } from '../data/mockData';

interface RuleBuilderProps {
  initialRule: SpendRule | null;
  existingRules?: SpendRule[];
  onSaveRule: (rule: SpendRule) => void;
  onSimulateRule: (rule: SpendRule) => void;
  onCancel: () => void;
}

interface DetectedConflict {
  conflictingRule: SpendRule;
  reason: string;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  initialRule,
  existingRules,
  onSaveRule,
  onSimulateRule,
  onCancel
}) => {
  // Primary Natural Language Sentence input
  const defaultSentence = 'If anyone in Engineering spends more than ₹50,000 on Software & Tools using Corporate Card, require approval from Rajesh Sen (VP Engineering).';
  const [sentence, setSentence] = useState<string>(defaultSentence);

  // Extracted / Configured Rule Parameters
  const [ruleTitle, setRuleTitle] = useState<string>('Engineering Software Purchases > ₹50,000');
  const [isEditingTitle] = useState<boolean>(false);
  const [ruleDescription, setRuleDescription] = useState<string>('');
  const [domain, setDomain] = useState<PolicyDomain>('SOFTWARE_AND_IT');

  const [departments, setDepartments] = useState<string[]>(['Engineering']);
  const [amountOperator, setAmountOperator] = useState<RuleConditions['amountOperator']>('GREATER_THAN');
  const [amountMin, setAmountMin] = useState<number>(50000);
  const [amountMax, setAmountMax] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>(['SaaS Subscriptions', 'Developer Tools']);
  const [spendTypes, setSpendTypes] = useState<string[]>(['CARD']);
  const [decision, setDecision] = useState<RuleDecision>('REQUIRE_APPROVAL');

  // Approver
  const [selectedApproverId, setSelectedApproverId] = useState<string>('appr-3'); // Rajesh Sen
  const [approverName, setApproverName] = useState<string>('Rajesh Sen');
  const [approverRole, setApproverRole] = useState<string>('Engineering Head & VP');

  // AI Detection State
  const [aiDetectionConfidence, setAiDetectionConfidence] = useState<number>(98);
  const [detectedCount, setDetectedCount] = useState<number>(5);
  const [, setIsAiProcessing] = useState<boolean>(false);

  // Approver lookup
  const currentApprover = useMemo(() => {
    return APPROVERS_DIRECTORY.find(a => a.id === selectedApproverId) || APPROVERS_DIRECTORY[0];
  }, [selectedApproverId]);

  // AI Natural Language Sentence Detection Engine
  const detectRuleFromSentence = useCallback((rawText: string) => {
    setIsAiProcessing(true);
    const text = rawText.toLowerCase();

    let matchedCount = 0;

    // 1. Detect Decision
    let detectedDecision: RuleDecision = 'REQUIRE_APPROVAL';
    if (
      text.includes('block') || 
      text.includes('deny') || 
      text.includes('prohibit') || 
      text.includes('disallow') || 
      text.includes('reject') ||
      text.includes('forbidden')
    ) {
      detectedDecision = 'BLOCK';
      matchedCount++;
    } else if (
      text.includes('auto-approve') || 
      text.includes('auto approve') || 
      text.includes('automatically approve') || 
      text.includes('automatic approval') || 
      text.includes('no approval needed') || 
      text.includes('without review') || 
      text.includes('pre-approved')
    ) {
      detectedDecision = 'AUTO_APPROVE';
      matchedCount++;
    } else {
      detectedDecision = 'REQUIRE_APPROVAL';
      matchedCount++;
    }

    // 2. Detect Departments
    let detectedDepts: string[] = ['All'];
    if (
      text.includes('all departments') || 
      text.includes('across the company') || 
      text.includes('company-wide') || 
      text.includes('all employees') || 
      text.includes('anyone') || 
      text.includes('everyone')
    ) {
      detectedDepts = ['All'];
      matchedCount++;
    } else {
      const foundDepts: string[] = [];
      if (text.includes('engineering') || text.includes('tech') || text.includes('dev')) foundDepts.push('Engineering');
      if (text.includes('sales') || text.includes('revenue')) foundDepts.push('Sales');
      if (text.includes('marketing') || text.includes('growth')) foundDepts.push('Marketing');
      if (text.includes('office management') || text.includes('facilities') || text.includes('admin')) foundDepts.push('Office Management');
      if (text.includes('hr') || text.includes('human resources') || text.includes('people team')) foundDepts.push('HR');
      if (text.includes('finance') || text.includes('accounts')) foundDepts.push('Finance');
      if (text.includes('operations') || text.includes('ops')) foundDepts.push('Operations');

      if (foundDepts.length > 0) {
        detectedDepts = foundDepts;
        matchedCount++;
      } else {
        detectedDepts = ['All'];
      }
    }

    // 3. Detect Amount & Operator
    let detectedOp: RuleConditions['amountOperator'] = 'GREATER_THAN';
    let detectedMin = 0;
    let detectedMax = 0;

    // Helper to parse numbers like 50,000, 50k, 1 lakh, 2.5 lakh, etc.
    const extractNumber = (str: string): number => {
      const clean = str.replace(/[₹,\s]/g, '').trim();
      if (clean.includes('lakh') || clean.includes('lac')) {
        const val = parseFloat(clean.replace(/(lakh|lac)/g, ''));
        return isNaN(val) ? 0 : val * 100000;
      }
      if (clean.endsWith('k')) {
        const val = parseFloat(clean.replace('k', ''));
        return isNaN(val) ? 0 : val * 1000;
      }
      const val = parseFloat(clean);
      return isNaN(val) ? 0 : val;
    };

    // Check for "between X and Y"
    const betweenRegex = /between\s*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]+)?k?|\d+(?:\.\d+)?\s*(?:lakh|lac|k)?)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]+)?k?|\d+(?:\.\d+)?\s*(?:lakh|lac|k)?)/i;
    const betweenMatch = rawText.match(betweenRegex);

    if (betweenMatch) {
      detectedOp = 'BETWEEN';
      detectedMin = extractNumber(betweenMatch[1]);
      detectedMax = extractNumber(betweenMatch[2]);
      matchedCount++;
    } else {
      // Find single amount
      const amountRegex = /(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]+)?k?|\d+(?:\.\d+)?\s*(?:lakh|lac|k)?)/gi;
      const matches = Array.from(rawText.matchAll(amountRegex))
        .map(m => m[1])
        .filter(m => m && /\d/.test(m) && extractNumber(m) > 0);

      if (matches.length > 0) {
        const parsedVal = extractNumber(matches[0]);
        if (
          text.includes('under') || 
          text.includes('less than') || 
          text.includes('below') || 
          text.includes('<') || 
          text.includes('within') || 
          text.includes('up to')
        ) {
          detectedOp = 'LESS_THAN';
          detectedMin = 0;
          detectedMax = parsedVal;
        } else {
          detectedOp = 'GREATER_THAN';
          detectedMin = parsedVal;
          detectedMax = 0;
        }
        matchedCount++;
      } else if (text.includes('any amount') || text.includes('any value')) {
        detectedOp = 'ANY';
        detectedMin = 0;
        detectedMax = 0;
        matchedCount++;
      } else {
        detectedOp = 'GREATER_THAN';
        detectedMin = 50000;
      }
    }

    // 4. Detect Categories
    let detectedCategories: string[] = [];
    if (
      text.includes('software') || 
      text.includes('saas') || 
      text.includes('cloud') || 
      text.includes('tools') || 
      text.includes('developer') || 
      text.includes('licenses')
    ) {
      detectedCategories = ['SaaS Subscriptions', 'Developer Tools'];
      matchedCount++;
    } else if (
      text.includes('office supplies') || 
      text.includes('stationery') || 
      text.includes('office equipment')
    ) {
      detectedCategories = ['Office Supplies'];
      matchedCount++;
    } else if (
      text.includes('meal') || 
      text.includes('food') || 
      text.includes('dining') || 
      text.includes('lunch') || 
      text.includes('dinner')
    ) {
      detectedCategories = ['Business Meals'];
      matchedCount++;
    } else if (
      text.includes('travel') || 
      text.includes('flight') || 
      text.includes('flights') || 
      text.includes('hotel') || 
      text.includes('lodging')
    ) {
      detectedCategories = ['Travel', 'Flights'];
      matchedCount++;
    } else if (
      text.includes('crypto') || 
      text.includes('entertainment') || 
      text.includes('personal')
    ) {
      detectedCategories = ['Client Entertainment'];
      matchedCount++;
    } else if (
      text.includes('any category') || 
      text.includes('all categories') || 
      text.includes('all spend')
    ) {
      detectedCategories = [];
      matchedCount++;
    }

    // 5. Detect Spend Types (Payment Method)
    let detectedSpendTypes: string[] = ['CARD'];
    if (text.includes('card') || text.includes('corporate card') || text.includes('credit card')) {
      detectedSpendTypes = ['CARD'];
      matchedCount++;
    } else if (text.includes('bill') || text.includes('invoice') || text.includes('vendor bill')) {
      detectedSpendTypes = ['BILL'];
      matchedCount++;
    } else if (text.includes('reimbursement') || text.includes('out of pocket') || text.includes('claim')) {
      detectedSpendTypes = ['REIMBURSEMENT'];
      matchedCount++;
    } else if (text.includes('any payment') || text.includes('all methods')) {
      detectedSpendTypes = ['CARD', 'BILL', 'REIMBURSEMENT'];
      matchedCount++;
    } else {
      detectedSpendTypes = ['CARD'];
    }

    // 6. Detect Approver
    let matchedApprover = APPROVERS_DIRECTORY[0];
    if (detectedDecision === 'REQUIRE_APPROVAL') {
      const found = APPROVERS_DIRECTORY.find(appr => {
        const namePart = appr.name.toLowerCase().split(' ')[0];
        const fullName = appr.name.toLowerCase();
        const role = appr.role.toLowerCase();
        return text.includes(fullName) || text.includes(namePart) || text.includes(role);
      });

      if (found) {
        matchedApprover = found;
        matchedCount++;
      } else if (text.includes('department head') || text.includes('dept head')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-dh') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else if (text.includes('manager') || text.includes('direct manager')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-dm') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else if (text.includes('cfo') || text.includes('finance head') || text.includes('vikram')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-2') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else if (text.includes('priya') || text.includes('office manager')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-1') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else if (text.includes('rajesh') || text.includes('engineering head')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-3') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else if (text.includes('ravi') || text.includes('sales director')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-7') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else if (text.includes('karthik') || text.includes('finance manager')) {
        matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-5') || APPROVERS_DIRECTORY[0];
        matchedCount++;
      } else {
        // Fallback based on department
        if (detectedDepts.includes('Engineering')) {
          matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-3') || APPROVERS_DIRECTORY[0];
        } else if (detectedCategories.includes('Office Supplies')) {
          matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-1') || APPROVERS_DIRECTORY[0];
        } else {
          matchedApprover = APPROVERS_DIRECTORY.find(a => a.id === 'appr-dh') || APPROVERS_DIRECTORY[0];
        }
      }
    }

    // Determine domain
    let detectedDomain: PolicyDomain = 'GENERAL';
    if (detectedCategories.some(c => c.includes('Software') || c.includes('SaaS') || c.includes('Developer'))) {
      detectedDomain = 'SOFTWARE_AND_IT';
    } else if (detectedCategories.some(c => c.includes('Office'))) {
      detectedDomain = 'OFFICE_SUPPLIES';
    } else if (detectedCategories.some(c => c.includes('Travel') || c.includes('Flight'))) {
      detectedDomain = 'TRAVEL';
    } else if (detectedCategories.some(c => c.includes('Meals'))) {
      detectedDomain = 'MEALS_AND_ENTERTAINMENT';
    }

    // Auto-generate clean title
    const whoLabel = detectedDepts.includes('All') ? 'Company-wide' : detectedDepts.join(', ');
    const catLabel = detectedCategories.length > 0 ? detectedCategories[0] : 'All Purchases';
    const amountLabel = detectedOp === 'GREATER_THAN' ? `> ₹${detectedMin.toLocaleString('en-IN')}` :
                        detectedOp === 'LESS_THAN' ? `< ₹${detectedMax.toLocaleString('en-IN')}` :
                        detectedOp === 'BETWEEN' ? `₹${detectedMin.toLocaleString('en-IN')}–₹${detectedMax.toLocaleString('en-IN')}` : 'Any Spend';
    const newTitle = `${whoLabel} ${catLabel} ${amountLabel}`.replace('All Purchases Any Spend', 'General Spending Policy');

    // Update state
    setDecision(detectedDecision);
    setDepartments(detectedDepts);
    setAmountOperator(detectedOp);
    setAmountMin(detectedMin);
    setAmountMax(detectedMax);
    setCategories(detectedCategories);
    setSpendTypes(detectedSpendTypes);
    setSelectedApproverId(matchedApprover.id);
    setApproverName(matchedApprover.name);
    setApproverRole(matchedApprover.role);
    setDomain(detectedDomain);
    if (!isEditingTitle) {
      setRuleTitle(newTitle);
    }
    setDetectedCount(Math.min(5, Math.max(3, matchedCount)));
    setAiDetectionConfidence(Math.min(99, 85 + matchedCount * 3));
    setIsAiProcessing(false);
  }, [isEditingTitle]);

  // Handle sentence input changes
  const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSentence(val);
    detectRuleFromSentence(val);
  };

  // Specificity Score calculation
  const specificityScore = useMemo(() => {
    let score = 20;
    if (!departments.includes('All')) score += 25;
    if (categories.length > 0) score += 25;
    if (amountOperator !== 'ANY') score += 15;
    if (spendTypes.length < 3) score += 15;
    return Math.min(score, 100);
  }, [departments, categories, amountOperator, spendTypes]);

  // Build SpendRule object
  const buildCurrentRule = (status: 'DRAFT' | 'ACTIVE'): SpendRule => {
    return {
      id: initialRule?.id || `rule-${Date.now()}`,
      code: initialRule?.code || `POL-${Math.floor(100 + Math.random() * 899)}`,
      title: ruleTitle.trim() || 'Custom Spending Rule',
      description: sentence,
      domain,
      conditions: {
        amountOperator,
        amountMin: amountOperator === 'GREATER_THAN' || amountOperator === 'BETWEEN' ? amountMin : undefined,
        amountMax: amountOperator === 'LESS_THAN' || amountOperator === 'BETWEEN' ? amountMax : undefined,
        currencies: ['INR'],
        categories,
        merchants: [],
        departments,
        entities: ['IN'],
        employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
        spendTypes: spendTypes as any[]
      },
      decision,
      approverChain: decision === 'REQUIRE_APPROVAL' ? [
        {
          id: `step-${Date.now()}`,
          stepNumber: 1,
          roleType: currentApprover.roleType as any,
          namedUserName: currentApprover.isDynamic ? undefined : `${currentApprover.name} (${currentApprover.role})`,
          slaHours: 24,
          fallbackAction: 'ESCALATE_TO_SKIP_LEVEL'
        }
      ] : [],
      status,
      specificityScore,
      specificityFactors: [
        departments.includes('All') ? 'All Departments' : `Dept: ${departments.join(', ')}`,
        categories.length > 0 ? `Category: ${categories.join(', ')}` : 'All Categories',
        amountOperator === 'GREATER_THAN' ? `Amount > ₹${amountMin.toLocaleString('en-IN')}` : 'Any Amount'
      ],
      createdAt: initialRule?.createdAt || new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      updatedBy: 'Rohan Sharma (Finance Admin)',
      version: (initialRule?.version || 0) + 1,
      matchedTransactionsCount: 0
    };
  };

  // Active conflict state if detected during save
  const [activeConflict, setActiveConflict] = useState<DetectedConflict | null>(null);

  // Human-readable approver label helper
  const getHumanApproverName = (step?: ApproverStep): string => {
    if (!step) return 'Designated Approver';
    if (step.namedUserName) return step.namedUserName;
    const roleMap: Record<string, string> = {
      DEPARTMENT_HEAD: "Employee's Department Head",
      DIRECT_MANAGER: "Employee's Direct Manager",
      FINANCE_LEAD: "Finance Lead",
      FINANCE_MANAGER: "Finance Manager",
      FINANCE_DIRECTOR: "Finance Director",
      OFFICE_MANAGER: "Office Manager",
      VP: "Vice President",
      CFO: "Chief Financial Officer (CFO)"
    };
    return roleMap[step.roleType] || step.roleType.replace(/_/g, ' ');
  };

  // Check if current rule conflicts with any active rule in the company
  const checkRuleConflict = (ruleToSave: SpendRule, pool: SpendRule[]): DetectedConflict | null => {
    for (const existing of pool) {
      if (existing.id === ruleToSave.id) continue;
      if (existing.status === 'ARCHIVED' || existing.status === 'DRAFT') continue;

      // Check Department Overlap
      const ruleDepts = ruleToSave.conditions.departments || ['All'];
      const existDepts = existing.conditions.departments || ['All'];
      const isDeptOverlap = 
        ruleDepts.includes('All') || 
        existDepts.includes('All') || 
        ruleDepts.some(d => existDepts.includes(d));

      if (!isDeptOverlap) continue;

      // Check Category Overlap
      const ruleCats = ruleToSave.conditions.categories || [];
      const existCats = existing.conditions.categories || [];
      const isCatOverlap = 
        ruleCats.length === 0 || 
        existCats.length === 0 || 
        ruleCats.some(c => existCats.includes(c));

      if (!isCatOverlap) continue;

      // Check Spend Method Overlap
      const ruleSpend = ruleToSave.conditions.spendTypes || ['CARD'];
      const existSpend = existing.conditions.spendTypes || ['CARD'];
      const isSpendOverlap = ruleSpend.some(s => existSpend.includes(s));

      if (!isSpendOverlap) continue;

      // Check Amount Overlap
      const ruleMin = ruleToSave.conditions.amountMin || 0;
      const ruleMax = ruleToSave.conditions.amountMax || 0;
      const ruleOp = ruleToSave.conditions.amountOperator;

      const existMin = existing.conditions.amountMin || 0;
      const existMax = existing.conditions.amountMax || 0;
      const existOp = existing.conditions.amountOperator;

      let isAmountOverlap = false;
      if (ruleOp === 'GREATER_THAN' && existOp === 'GREATER_THAN') {
        isAmountOverlap = true;
      } else if (ruleOp === 'LESS_THAN' && existOp === 'LESS_THAN') {
        isAmountOverlap = true;
      } else if (ruleOp === 'ANY' || existOp === 'ANY') {
        isAmountOverlap = true;
      } else if (ruleOp === 'GREATER_THAN' && existOp === 'LESS_THAN') {
        isAmountOverlap = ruleMin < existMax;
      } else if (ruleOp === 'LESS_THAN' && existOp === 'GREATER_THAN') {
        isAmountOverlap = ruleMax > existMin;
      } else {
        isAmountOverlap = true;
      }

      if (!isAmountOverlap) continue;

      // 1. Different decision conflict
      if (ruleToSave.decision !== existing.decision) {
        const decLabel = (d: RuleDecision) => d === 'AUTO_APPROVE' ? 'Auto-Approve' : d === 'BLOCK' ? 'Block' : 'Require Approval';
        return {
          conflictingRule: existing,
          reason: `Your rule sets decision to "${decLabel(ruleToSave.decision)}", but ${existing.code} sets "${decLabel(existing.decision)}" for the same purchase criteria.`
        };
      }

      // 2. Both require approval, but assign different approvers!
      if (ruleToSave.decision === 'REQUIRE_APPROVAL' && existing.decision === 'REQUIRE_APPROVAL') {
        const newApprover = getHumanApproverName(ruleToSave.approverChain[0]);
        const existApprover = getHumanApproverName(existing.approverChain[0]);

        if (newApprover.toLowerCase().trim() !== existApprover.toLowerCase().trim()) {
          return {
            conflictingRule: existing,
            reason: `Both rules trigger on the same purchases, but designate different approvers: "${newApprover}" vs "${existApprover}".`
          };
        }
      }
    }

    return null;
  };

  const handleDeploy = () => {
    const rule = buildCurrentRule('ACTIVE');
    const pool = existingRules && existingRules.length > 0 ? existingRules : INITIAL_RULES;
    const conflict = checkRuleConflict(rule, pool);
    
    if (conflict) {
      setActiveConflict(conflict);
      return;
    }

    onSaveRule(rule);
  };

  const handleSaveAsException = () => {
    if (!activeConflict) return;
    const rule = buildCurrentRule('ACTIVE');
    rule.overridesRuleIds = [activeConflict.conflictingRule.id];
    rule.overridesRuleTitles = [activeConflict.conflictingRule.title];
    onSaveRule(rule);
  };

  const handleSaveWithConflict = () => {
    if (!activeConflict) return;
    const rule = buildCurrentRule('ACTIVE');
    rule.status = 'CONFLICT';
    rule.conflictIds = [activeConflict.conflictingRule.id];
    onSaveRule(rule);
  };

  // Initialize from initialRule if editing
  useEffect(() => {
    if (initialRule) {
      setRuleTitle(initialRule.title);
      setRuleDescription(initialRule.description);
      setDomain(initialRule.domain);
      setAmountOperator(initialRule.conditions.amountOperator);
      setAmountMin(initialRule.conditions.amountMin || 0);
      setAmountMax(initialRule.conditions.amountMax || 0);
      setDepartments(initialRule.conditions.departments);
      setCategories(initialRule.conditions.categories);
      setSpendTypes(initialRule.conditions.spendTypes);
      setDecision(initialRule.decision);

      if (initialRule.approverChain.length > 0) {
        const chainFirst = initialRule.approverChain[0];
        const match = APPROVERS_DIRECTORY.find(a => 
          (chainFirst.namedUserName && a.name.toLowerCase() === chainFirst.namedUserName.toLowerCase()) || 
          a.roleType === chainFirst.roleType
        );
        if (match) {
          setSelectedApproverId(match.id);
          setApproverName(match.name);
          setApproverRole(match.role);
        }
      }

      if (initialRule.description) {
        setSentence(initialRule.description);
      }
    }
  }, [initialRule]);

  return (
    <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div className="page-header-row" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="ai-sparkle-pill">
              <Sparkles size={13} /> AI Rule Studio
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Natural Language Policy Engine
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {initialRule ? 'Edit Spend Rule' : 'Create Rule with AI'}
          </h1>
          <p className="page-subtitle">
            Write or pick a simple sentence. The AI automatically detects spend conditions, departments, and approvers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn-create-rule" 
            onClick={handleDeploy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', color: '#FFFFFF' }}
          >
            <Save size={15} />
            Save Rule
          </button>
        </div>
      </div>

      {/* Conflict Warning Inline Banner */}
      {activeConflict && (
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--status-rose-text)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--status-rose-bg)',
              color: 'var(--status-rose-text)',
              border: '1px solid var(--status-rose-border)',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <AlertTriangle size={12} /> Conflict Detected
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              This rule conflicts with <kbd style={{ fontFamily: 'var(--font-mono)', background: '#FFFFFF', padding: '1px 6px', border: '1px solid var(--border-subtle)', borderRadius: 3, fontSize: '0.78rem' }}>{activeConflict.conflictingRule.code}</kbd> ({activeConflict.conflictingRule.title})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button 
              type="button"
              className="btn-outline"
              style={{ fontSize: '0.78rem', padding: '5px 12px', background: '#FFFFFF', borderRadius: 'var(--radius-sm)' }}
              onClick={() => setActiveConflict(null)}
            >
              Adjust Rule
            </button>
            <button 
              type="button"
              className="btn-create-rule"
              style={{ fontSize: '0.78rem', padding: '5px 14px', background: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', color: '#FFFFFF', borderRadius: 'var(--radius-sm)' }}
              onClick={handleSaveAsException}
            >
              Save as Exception
            </button>
          </div>
        </div>
      )}

      {/* Hero: Sentence Input Studio */}
      <div className="ai-sentence-studio">
        <div className="ai-studio-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="ai-sparkle-pill">
              <Sparkles size={13} /> Live Sentence Input
            </span>
            <span className="ai-confidence-pill">
              <ShieldCheck size={13} /> AI Confidence: {aiDetectionConfidence}%
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({detectedCount} parameters extracted in real-time)
            </span>
          </div>

          <button 
            className="btn-link" 
            onClick={() => {
              setSentence('');
              setActiveConflict(null);
            }}
            style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <RotateCcw size={12} /> Clear text
          </button>
        </div>

        {/* Text Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            className="ai-sentence-input"
            rows={3}
            placeholder="Type your rule here, e.g.: If someone in Sales spends more than ₹30,000 on Travel, require approval from Ravi Kumar..."
            value={sentence}
            onChange={handleSentenceChange}
          />
        </div>
      </div>

      {/* Live Plain English Sentence Highlighting Banner */}
      <div className="simple-words-banner" style={{ marginBottom: 22 }}>
        <div className="simple-words-banner-header">
          <div className="simple-words-tag">
            <Sparkles size={13} />
            Detected Rule Sentence Preview
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Tokens highlight detected parameters automatically
          </span>
        </div>
        <div className="simple-words-sentence">
          "If{' '}
          <span className="keyword-pill keyword-pill-blue">
            {departments.includes('All') ? 'anyone across the company' : `anyone in ${departments.join(', ')}`}
          </span>{' '}
          <span className="keyword-pill keyword-pill-amber">
            {amountOperator === 'GREATER_THAN' ? `spends more than ₹${amountMin.toLocaleString('en-IN')}` :
             amountOperator === 'LESS_THAN' ? `spends less than ₹${amountMax.toLocaleString('en-IN')}` :
             amountOperator === 'BETWEEN' ? `spends between ₹${amountMin.toLocaleString('en-IN')} and ₹${amountMax.toLocaleString('en-IN')}` : 'spends any amount'}
          </span>{' '}
          <span className="keyword-pill keyword-pill-purple">
            {categories.length === 0 ? 'on any category' : `on ${categories.join(', ')}`}
          </span>{' '}
          <span className="keyword-pill keyword-pill-indigo">
            {spendTypes.length === 3 ? 'using any payment method' : `using ${spendTypes.join(', ')}`}
          </span>
          , then{' '}
          <span className={`keyword-pill ${decision === 'BLOCK' ? 'keyword-pill-red' : 'keyword-pill-green'}`}>
            {decision === 'AUTO_APPROVE' 
              ? 'approve purchase automatically without review' 
              : decision === 'BLOCK' 
              ? 'block purchase immediately under company policy' 
              : `ask ${currentApprover.name} (${currentApprover.role}) to review and approve it`}
          </span>
          ."
        </div>
      </div>

      {/* Redesigned Policy Conflict Review Modal (Minimalist-UI Protocol) */}
      {activeConflict && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 17, 17, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 24
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            maxWidth: 640,
            width: '100%',
            padding: '32px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            boxSizing: 'border-box'
          }}>
            {/* Top Tag & Close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'var(--status-rose-bg)',
                  color: 'var(--status-rose-text)',
                  border: '1px solid var(--status-rose-border)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  <AlertTriangle size={12} /> Policy Conflict Detected
                </span>
                <kbd style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2px 7px',
                  color: 'var(--text-secondary)'
                }}>
                  {activeConflict.conflictingRule.code}
                </kbd>
              </div>

              <button 
                type="button" 
                onClick={() => setActiveConflict(null)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                  borderRadius: 'var(--radius-xs)',
                  transition: 'color 100ms ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#111111')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Editorial Title */}
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              marginBottom: 8, 
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              This rule has a conflict with {activeConflict.conflictingRule.code}: {activeConflict.conflictingRule.title}
            </h3>

            {/* Friction Explanation */}
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {activeConflict.reason}
            </p>

            {/* Side-by-side Comparative Bento Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 16
            }}>
              {/* Existing Policy Card */}
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Existing Baseline Policy
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {activeConflict.conflictingRule.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 10 }}>
                  "{activeConflict.conflictingRule.description || activeConflict.conflictingRule.title}"
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <strong>Route:</strong> {getHumanApproverName(activeConflict.conflictingRule.approverChain[0])}
                </div>
              </div>

              {/* Proposed Policy Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #111111',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--status-blue-text)', marginBottom: 6 }}>
                  Proposed New Rule
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {ruleTitle}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 10 }}>
                  "{sentence}"
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <strong>Route:</strong> {currentApprover.name} ({currentApprover.role})
                </div>
              </div>
            </div>

            {/* Informational Guidance Callout */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: 24
            }}>
              Saving as an <strong>Exception</strong> assigns higher evaluation priority to your rule for matching purchases without modifying the baseline policy.
            </div>

            {/* Clean Horizontal Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <button 
                type="button" 
                className="btn-outline"
                style={{ 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.82rem', 
                  padding: '8px 16px',
                  fontWeight: 600
                }}
                onClick={() => setActiveConflict(null)}
              >
                Adjust Sentence
              </button>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn-outline"
                  style={{ 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.82rem', 
                    padding: '8px 14px', 
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border-subtle)'
                  }}
                  onClick={handleSaveWithConflict}
                  title="Flag for administrator review in the conflict center"
                >
                  Save with Conflict Flag
                </button>
                <button 
                  type="button" 
                  className="btn-create-rule"
                  style={{ 
                    background: 'var(--brand-primary)', 
                    border: '1px solid var(--brand-primary)',
                    color: '#FFFFFF', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.82rem', 
                    padding: '8px 18px',
                    fontWeight: 700
                  }}
                  onClick={handleSaveAsException}
                >
                  Save as Exception
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

