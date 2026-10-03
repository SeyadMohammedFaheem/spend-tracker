export type SpendType = 'CARD' | 'BILL' | 'REIMBURSEMENT';

export type EntityCountry = 'US' | 'UK' | 'DE' | 'IN';

export type EmployeeLevel = 'IC' | 'MANAGER' | 'DIRECTOR' | 'VP' | 'C_SUITE';

export type PolicyDomain = 
  | 'SOFTWARE_AND_IT'
  | 'TRAVEL'
  | 'MEALS_AND_ENTERTAINMENT'
  | 'HARDWARE_AND_OFFICE'
  | 'MARKETING_AND_ADS'
  | 'CONSULTING_AND_LEGAL'
  | 'OFFICE_SUPPLIES'
  | 'GENERAL';

export type RuleDecision = 'AUTO_APPROVE' | 'REQUIRE_APPROVAL' | 'BLOCK';

export type RuleStatus = 'ACTIVE' | 'CONFLICT' | 'BROKEN_ROUTE' | 'DRAFT' | 'NEEDS_REVIEW' | 'ARCHIVED';

export interface ApproverStep {
  id: string;
  stepNumber: number;
  roleType: 'DIRECT_MANAGER' | 'DEPARTMENT_HEAD' | 'FINANCE_LEAD' | 'VP' | 'CFO' | 'NAMED_USER' | 'OFFICE_MANAGER' | 'FINANCE_MANAGER' | 'FINANCE_DIRECTOR';
  namedUserId?: string;
  namedUserName?: string;
  slaHours: number;
  fallbackAction: 'ESCALATE_TO_SKIP_LEVEL' | 'ROUTE_TO_FINANCE_POOL' | 'AUTO_ESCALATE_CFO';
}

export interface RuleConditions {
  amountOperator: 'LESS_THAN' | 'GREATER_THAN' | 'BETWEEN' | 'ANY';
  amountMin?: number;
  amountMax?: number;
  currencies: string[];
  categories: string[];
  merchants: string[];
  departments: string[];
  entities: EntityCountry[];
  employeeLevels: EmployeeLevel[];
  spendTypes: SpendType[];
}

export interface SpendRule {
  id: string;
  code: string;
  title: string;
  description: string;
  domain: PolicyDomain;
  conditions: RuleConditions;
  decision: RuleDecision;
  approverChain: ApproverStep[];
  status: RuleStatus;
  specificityScore: number; // 0-100 based on how narrow the conditions are
  specificityFactors: string[];
  conflictIds?: string[];
  brokenRouteDetails?: {
    personName: string;
    issue: 'DEPARTED' | 'ON_LEAVE' | 'TRANSFERRED';
    role: string;
  };
  // Precedence: which general rule(s) this overrides
  overridesRuleIds?: string[];
  overridesRuleTitles?: string[];
  // History
  createdAt: string;
  lastUpdated: string;
  updatedBy: string;
  version: number;
  versionHistory?: {
    version: number;
    date: string;
    author: string;
    summary: string;
  }[];
  // Usage stats
  matchedTransactionsCount?: number;
}

export interface RuleConflict {
  id: string;
  ruleAId: string;
  ruleBId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  conflictType: 'CONTRADICTORY_DECISION' | 'SUBSET_OVERLAP' | 'AMBIGUOUS_SPECIFICITY';
  exampleTransaction: {
    amount: number;
    currency: string;
    merchant: string;
    category: string;
    department: string;
    employeeLevel: EmployeeLevel;
  };
  recommendedResolution: string;
  resolutionOptions: {
    label: string;
    description: string;
    strategy: string;
  }[];
}

export interface BrokenRouteAlert {
  id: string;
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  personName: string;
  personRole: string;
  issue: 'DEPARTED' | 'ON_LEAVE' | 'TRANSFERRED';
  since: string;
  affectedRulesCount: number;
  affectedPendingRequests: number;
  replacementOptions: {
    name: string;
    role: string;
  }[];
  suggestedReplacementName: string;
}

export interface HistoricalTransaction {
  id: string;
  date: string;
  employeeName: string;
  employeeLevel: EmployeeLevel;
  department: string;
  entity: EntityCountry;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  spendType: SpendType;
  
  currentOutcome: 'AUTO_APPROVED' | 'MANAGER_APPROVED' | 'FINANCE_REVIEWED' | 'BLOCKED';
  currentRuleCode: string;
  currentApprover: string;
  
  simulatedOutcome: 'AUTO_APPROVED' | 'MANAGER_APPROVED' | 'FINANCE_REVIEWED' | 'BLOCKED';
  simulatedRuleCode: string;
  simulatedApprover: string;
  
  impactTag: 'DIFFERENT_APPROVER' | 'DIFFERENT_THRESHOLD' | 'NEW_CONFLICT' | 'UNCHANGED';
  diffNotes: string;
}

export interface AiExtractedProposal {
  id: string;
  pdfPage: number;
  sourceSection: string;
  rawPolicyText: string;
  extractedDraft: {
    title: string;
    domain: PolicyDomain;
    conditionsSummary: string;
    decision: RuleDecision;
    suggestedApprovers: string;
    amountLimit?: number;
    currency: string;
  };
  confidence: number;
  ambiguityReason?: string;
  flaggedExceptions?: string[];
  status: 'PROPOSED' | 'ACCEPTED' | 'EDITED' | 'REJECTED';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  author: string;
  action: 'RULE_CREATED' | 'RULE_EDITED' | 'RULE_PUBLISHED' | 'CONFLICT_RESOLVED' | 'ROUTE_HEALED' | 'ROLLBACK' | 'RULE_ARCHIVED';
  ruleId: string;
  ruleTitle: string;
  summary: string;
  reason?: string;
  previousVersion?: number;
  newVersion?: number;
  diffs: {
    field: string;
    before: string;
    after: string;
  }[];
  canRollback: boolean;
}

export interface SpendRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterAvatar?: string;
  department: string;
  category: string;
  amount: number;
  currency: string;
  spendType: SpendType;
  description: string;
  ruleTitle: string;
  ruleCode: string;
  approverName: string;
  approverRole: string;
  approverAvatar?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  decisionDate?: string;
  decisionNote?: string;
  attachmentType?: 'INVOICE' | 'BILL' | 'PRODUCT_LINK';
  attachmentName?: string;
  attachmentUrl?: string;
}

export type UserRole = 'EMPLOYEE' | 'DEPT_HEAD' | 'FINANCE_ADMIN';

export interface UserPersona {
  role: UserRole;
  name: string;
  title: string;
  department: string;
  avatarInitials: string;
  avatarUrl?: string;
}
