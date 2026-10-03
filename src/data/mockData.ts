import {
  SpendRule,
  RuleConflict,
  BrokenRouteAlert,
  HistoricalTransaction,
  AiExtractedProposal,
  AuditEntry,
  SpendRequest
} from '../types';

// ─── CORE SCENARIO FROM BRIEF ───────────────────────────
// The brief centers on Office Management buying Toiletry Supplies ₹60,000
// with a general rule (>₹50,000 → CEO) and specific exception
// (Office Mgmt + Office Supplies + >₹50,000 → Office Manager)

export const INITIAL_RULES: SpendRule[] = [
  // ── GENERAL RULE: The broad catch-all ──
  {
    id: 'rule-001',
    code: 'POL-001',
    title: 'Purchases above ₹50,000',
    description: 'Any purchase above ₹50,000 across the company requires CEO approval, regardless of department or category.',
    domain: 'GENERAL',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 50000,
      currencies: ['INR'],
      categories: [],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
      spendTypes: ['CARD', 'BILL', 'REIMBURSEMENT']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-1-1', stepNumber: 1, roleType: 'CFO', slaHours: 48, fallbackAction: 'AUTO_ESCALATE_CFO' }
    ],
    status: 'ACTIVE',
    specificityScore: 15,
    specificityFactors: ['All Departments', 'All Categories', 'Amount > ₹50,000'],
    createdAt: '2024-03-01',
    lastUpdated: '2026-01-10',
    updatedBy: 'Rohan (Finance Admin)',
    version: 3,
    versionHistory: [
      { version: 3, date: '2026-01-10', author: 'Rohan', summary: 'Threshold unchanged, CEO approval confirmed' },
      { version: 2, date: '2025-06-15', author: 'Rohan', summary: 'Lowered from ₹75,000 to ₹50,000' },
      { version: 1, date: '2024-03-01', author: 'Rohan', summary: 'Initial creation' }
    ],
    matchedTransactionsCount: 142
  },

  // ── SPECIFIC EXCEPTION: The Office Supplies override ──
  {
    id: 'rule-002',
    code: 'POL-002',
    title: 'Office Supplies Approval',
    description: 'Office Management department purchasing Office Supplies above ₹50,000 requires Office Manager approval instead of CEO.',
    domain: 'OFFICE_SUPPLIES',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 50000,
      currencies: ['INR'],
      categories: ['Office Supplies'],
      merchants: [],
      departments: ['Office Management'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER'],
      spendTypes: ['CARD', 'BILL', 'REIMBURSEMENT']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-2-1', stepNumber: 1, roleType: 'OFFICE_MANAGER', namedUserName: 'Priya Mehta (Office Manager)', slaHours: 24, fallbackAction: 'ESCALATE_TO_SKIP_LEVEL' }
    ],
    status: 'ACTIVE',
    specificityScore: 72,
    specificityFactors: ['Specific Department: Office Management', 'Specific Category: Office Supplies', 'Amount > ₹50,000'],
    overridesRuleIds: ['rule-001'],
    overridesRuleTitles: ['Purchases above ₹50,000'],
    createdAt: '2025-04-12',
    lastUpdated: '2026-06-20',
    updatedBy: 'Rohan (Finance Admin)',
    version: 2,
    versionHistory: [
      { version: 2, date: '2026-06-20', author: 'Rohan', summary: 'Created department-specific exception for Office Management' },
      { version: 1, date: '2025-04-12', author: 'Rohan', summary: 'Initial creation' }
    ],
    matchedTransactionsCount: 18
  },

  // ── CONFLICT PAIR: Same conditions, different outcomes ──
  {
    id: 'rule-003',
    code: 'POL-003',
    title: 'Office Supplies — Office Manager Route',
    description: 'Office Supplies above ₹50,000 routed to Office Manager for approval.',
    domain: 'OFFICE_SUPPLIES',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 50000,
      currencies: ['INR'],
      categories: ['Office Supplies'],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
      spendTypes: ['CARD']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-3-1', stepNumber: 1, roleType: 'OFFICE_MANAGER', namedUserName: 'Priya Mehta', slaHours: 24, fallbackAction: 'ESCALATE_TO_SKIP_LEVEL' }
    ],
    status: 'CONFLICT',
    specificityScore: 55,
    specificityFactors: ['Specific Category: Office Supplies', 'Amount > ₹50,000', 'Card only'],
    conflictIds: ['conf-001'],
    createdAt: '2025-02-10',
    lastUpdated: '2026-03-15',
    updatedBy: 'Rohan (Finance Admin)',
    version: 1,
    matchedTransactionsCount: 12
  },
  {
    id: 'rule-004',
    code: 'POL-004',
    title: 'Office Supplies — Finance Manager Route',
    description: 'Office Supplies above ₹50,000 routed to Finance Manager for approval.',
    domain: 'OFFICE_SUPPLIES',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 50000,
      currencies: ['INR'],
      categories: ['Office Supplies'],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
      spendTypes: ['CARD']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-4-1', stepNumber: 1, roleType: 'FINANCE_MANAGER', namedUserName: 'Anjali Gupta (Finance Manager)', slaHours: 24, fallbackAction: 'ROUTE_TO_FINANCE_POOL' }
    ],
    status: 'CONFLICT',
    specificityScore: 55,
    specificityFactors: ['Specific Category: Office Supplies', 'Amount > ₹50,000', 'Card only'],
    conflictIds: ['conf-001'],
    createdAt: '2025-09-05',
    lastUpdated: '2026-03-15',
    updatedBy: 'Rohan (Finance Admin)',
    version: 1,
    matchedTransactionsCount: 12
  },

  // ── TRAVEL: International travel rule ──
  {
    id: 'rule-005',
    code: 'POL-005',
    title: 'International Travel above ₹75,000',
    description: 'International travel expenses above ₹75,000 require Finance Director approval.',
    domain: 'TRAVEL',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 75000,
      currencies: ['INR'],
      categories: ['International Travel', 'Flights', 'Hotels'],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
      spendTypes: ['CARD', 'BILL', 'REIMBURSEMENT']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-5-1', stepNumber: 1, roleType: 'FINANCE_DIRECTOR', namedUserName: 'Vikram Singh (Finance Director)', slaHours: 48, fallbackAction: 'AUTO_ESCALATE_CFO' }
    ],
    status: 'ACTIVE',
    specificityScore: 60,
    specificityFactors: ['Category: Travel', 'Amount > ₹75,000', 'All Departments'],
    createdAt: '2024-06-01',
    lastUpdated: '2026-05-18',
    updatedBy: 'Rohan (Finance Admin)',
    version: 2,
    matchedTransactionsCount: 34
  },

  // ── MARKETING: Ad spend rule with BROKEN ROUTE ──
  {
    id: 'rule-006',
    code: 'POL-006',
    title: 'Marketing purchases above ₹50,000',
    description: 'Marketing department purchases above ₹50,000 require John Smith approval.',
    domain: 'MARKETING_AND_ADS',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 50000,
      currencies: ['INR'],
      categories: ['Digital Ads', 'Events', 'Sponsorships', 'Marketing Materials'],
      merchants: [],
      departments: ['Marketing'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER'],
      spendTypes: ['CARD', 'BILL']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-6-1', stepNumber: 1, roleType: 'NAMED_USER', namedUserId: 'user-john-smith', namedUserName: 'John Smith', slaHours: 48, fallbackAction: 'ROUTE_TO_FINANCE_POOL' }
    ],
    status: 'BROKEN_ROUTE',
    specificityScore: 65,
    specificityFactors: ['Specific Dept: Marketing', 'Category: Marketing & Ads', 'Amount > ₹50,000'],
    brokenRouteDetails: {
      personName: 'John Smith',
      role: 'Marketing Head (Departed)',
      issue: 'DEPARTED'
    },
    createdAt: '2025-01-15',
    lastUpdated: '2026-04-10',
    updatedBy: 'Rohan (Finance Admin)',
    version: 3,
    matchedTransactionsCount: 23
  },

  // ── SOFTWARE: Small tool purchases auto-approved ──
  {
    id: 'rule-007',
    code: 'POL-007',
    title: 'Software subscriptions below ₹10,000',
    description: 'Software and SaaS subscriptions below ₹10,000 are auto-approved for all departments.',
    domain: 'SOFTWARE_AND_IT',
    conditions: {
      amountOperator: 'LESS_THAN',
      amountMin: 0,
      amountMax: 10000,
      currencies: ['INR'],
      categories: ['SaaS Subscriptions', 'Developer Tools', 'Software Licenses'],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR', 'VP'],
      spendTypes: ['CARD']
    },
    decision: 'AUTO_APPROVE',
    approverChain: [],
    status: 'ACTIVE',
    specificityScore: 50,
    specificityFactors: ['Category: Software', 'Amount < ₹10,000', 'Card only'],
    createdAt: '2025-07-20',
    lastUpdated: '2026-08-01',
    updatedBy: 'Rohan (Finance Admin)',
    version: 2,
    matchedTransactionsCount: 87
  },

  // ── HARDWARE: Laptop purchases ──
  {
    id: 'rule-008',
    code: 'POL-008',
    title: 'Laptop purchases above ₹50,000',
    description: 'Laptop purchases above ₹50,000 require Department Manager approval.',
    domain: 'HARDWARE_AND_OFFICE',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 50000,
      currencies: ['INR'],
      categories: ['Laptops', 'Computer Hardware'],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER'],
      spendTypes: ['CARD', 'BILL']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-8-1', stepNumber: 1, roleType: 'DEPARTMENT_HEAD', slaHours: 24, fallbackAction: 'ESCALATE_TO_SKIP_LEVEL' }
    ],
    status: 'ACTIVE',
    specificityScore: 58,
    specificityFactors: ['Category: Laptops', 'Amount > ₹50,000', 'All Departments'],
    createdAt: '2024-11-05',
    lastUpdated: '2026-02-14',
    updatedBy: 'Rohan (Finance Admin)',
    version: 1,
    matchedTransactionsCount: 41
  },

  // ── DRAFT RULE ──
  {
    id: 'rule-009',
    code: 'POL-009',
    title: 'Client entertainment above ₹25,000',
    description: 'Draft rule: Client entertainment expenses above ₹25,000 will require Finance Manager review.',
    domain: 'MEALS_AND_ENTERTAINMENT',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 25000,
      currencies: ['INR'],
      categories: ['Client Entertainment', 'Business Meals'],
      merchants: [],
      departments: ['Sales', 'Partnerships'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
      spendTypes: ['CARD', 'REIMBURSEMENT']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-9-1', stepNumber: 1, roleType: 'FINANCE_MANAGER', slaHours: 24, fallbackAction: 'ROUTE_TO_FINANCE_POOL' }
    ],
    status: 'DRAFT',
    specificityScore: 62,
    specificityFactors: ['Dept: Sales/Partnerships', 'Category: Entertainment', 'Amount > ₹25,000'],
    createdAt: '2026-09-28',
    lastUpdated: '2026-09-28',
    updatedBy: 'Rohan (Finance Admin)',
    version: 1,
    matchedTransactionsCount: 0
  },

  // ── ANOTHER DRAFT ──
  {
    id: 'rule-010',
    code: 'POL-010',
    title: 'Consulting fees above ₹1,00,000',
    description: 'Draft rule: External consulting engagements above ₹1,00,000 require CFO and Finance Director dual approval.',
    domain: 'CONSULTING_AND_LEGAL',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 100000,
      currencies: ['INR'],
      categories: ['Consulting Services', 'Legal Services'],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['DIRECTOR', 'VP'],
      spendTypes: ['BILL']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-10-1', stepNumber: 1, roleType: 'FINANCE_DIRECTOR', slaHours: 48, fallbackAction: 'AUTO_ESCALATE_CFO' },
      { id: 'step-10-2', stepNumber: 2, roleType: 'CFO', slaHours: 72, fallbackAction: 'AUTO_ESCALATE_CFO' }
    ],
    status: 'DRAFT',
    specificityScore: 68,
    specificityFactors: ['Category: Consulting/Legal', 'Amount > ₹1,00,000', 'Bill only'],
    createdAt: '2026-09-30',
    lastUpdated: '2026-09-30',
    updatedBy: 'Rohan (Finance Admin)',
    version: 1,
    matchedTransactionsCount: 0
  },

  // ── Broken route: Facilities ──
  {
    id: 'rule-011',
    code: 'POL-011',
    title: 'Facility maintenance above ₹30,000',
    description: 'Facility maintenance and repairs above ₹30,000 require Admin Head approval.',
    domain: 'HARDWARE_AND_OFFICE',
    conditions: {
      amountOperator: 'GREATER_THAN',
      amountMin: 30000,
      currencies: ['INR'],
      categories: ['Facilities', 'Maintenance', 'Repairs'],
      merchants: [],
      departments: ['Operations', 'Admin'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER'],
      spendTypes: ['BILL', 'REIMBURSEMENT']
    },
    decision: 'REQUIRE_APPROVAL',
    approverChain: [
      { id: 'step-11-1', stepNumber: 1, roleType: 'NAMED_USER', namedUserId: 'user-sanjay', namedUserName: 'Sanjay Kumar', slaHours: 48, fallbackAction: 'ROUTE_TO_FINANCE_POOL' }
    ],
    status: 'BROKEN_ROUTE',
    specificityScore: 60,
    specificityFactors: ['Dept: Operations', 'Category: Facilities', 'Amount > ₹30,000'],
    brokenRouteDetails: {
      personName: 'Sanjay Kumar',
      role: 'Admin Head (On Leave)',
      issue: 'ON_LEAVE'
    },
    createdAt: '2024-12-01',
    lastUpdated: '2025-11-20',
    updatedBy: 'Rohan (Finance Admin)',
    version: 2,
    matchedTransactionsCount: 8
  },

  // ── NEEDS REVIEW ──
  {
    id: 'rule-012',
    code: 'POL-012',
    title: 'Petty cash reimbursements below ₹5,000',
    description: 'Small petty cash claims below ₹5,000 are auto-approved with receipt upload.',
    domain: 'GENERAL',
    conditions: {
      amountOperator: 'LESS_THAN',
      amountMin: 0,
      amountMax: 5000,
      currencies: ['INR'],
      categories: [],
      merchants: [],
      departments: ['All'],
      entities: ['IN'],
      employeeLevels: ['IC', 'MANAGER', 'DIRECTOR', 'VP', 'C_SUITE'],
      spendTypes: ['REIMBURSEMENT']
    },
    decision: 'AUTO_APPROVE',
    approverChain: [],
    status: 'NEEDS_REVIEW',
    specificityScore: 30,
    specificityFactors: ['Amount < ₹5,000', 'Reimbursement only', 'All Departments'],
    createdAt: '2024-06-01',
    lastUpdated: '2025-08-10',
    updatedBy: 'Rohan (Finance Admin)',
    version: 4,
    matchedTransactionsCount: 312
  }
];

export const INITIAL_CONFLICTS: RuleConflict[] = [
  {
    id: 'conf-001',
    ruleAId: 'rule-003',
    ruleBId: 'rule-004',
    severity: 'CRITICAL',
    title: 'Office Supplies > ₹50,000 — Two different approvers',
    description: 'Two rules have identical conditions (Office Supplies above ₹50,000 on Card) but route to different approvers. POL-003 routes to the Office Manager while POL-004 routes to the Finance Manager. The system cannot automatically determine which approver should be used.',
    conflictType: 'CONTRADICTORY_DECISION',
    exampleTransaction: {
      amount: 65000,
      currency: 'INR',
      merchant: 'Staples India',
      category: 'Office Supplies',
      department: 'Operations',
      employeeLevel: 'MANAGER'
    },
    recommendedResolution: 'Keep one rule and archive the other, or edit conditions so they no longer overlap.',
    resolutionOptions: [
      { label: 'Keep POL-003 (Office Manager)', description: 'Archive POL-004 and route all Office Supplies approvals to the Office Manager.', strategy: 'KEEP_A' },
      { label: 'Keep POL-004 (Finance Manager)', description: 'Archive POL-003 and route all Office Supplies approvals to the Finance Manager.', strategy: 'KEEP_B' },
      { label: 'Require both approvals', description: 'Combine into a sequential approval: Office Manager first, then Finance Manager.', strategy: 'REQUIRE_BOTH' },
      { label: 'Edit the rules', description: 'Open both rules in the editor to adjust conditions so they no longer overlap.', strategy: 'EDIT_RULES' }
    ]
  }
];

export const INITIAL_BROKEN_ROUTES: BrokenRouteAlert[] = [
  {
    id: 'brk-001',
    ruleId: 'rule-006',
    ruleCode: 'POL-006',
    ruleTitle: 'Marketing purchases above ₹50,000',
    personName: 'John Smith',
    personRole: 'Marketing Head',
    issue: 'DEPARTED',
    since: 'Left the company on Sep 15, 2026',
    affectedRulesCount: 23,
    affectedPendingRequests: 5,
    replacementOptions: [
      { name: "John's replacement (Rahul Joshi)", role: 'New Marketing Head' },
      { name: 'Marketing Department Head', role: 'Department Head (Dynamic)' },
      { name: 'Anjali Gupta', role: 'Finance Manager' },
    ],
    suggestedReplacementName: "Rahul Joshi (John's replacement)"
  },
  {
    id: 'brk-002',
    ruleId: 'rule-011',
    ruleCode: 'POL-011',
    ruleTitle: 'Facility maintenance above ₹30,000',
    personName: 'Sanjay Kumar',
    personRole: 'Admin Head',
    issue: 'ON_LEAVE',
    since: 'On medical leave since Sep 20, 2026 (expected return: Nov 2026)',
    affectedRulesCount: 8,
    affectedPendingRequests: 3,
    replacementOptions: [
      { name: 'Deepak Verma', role: 'Deputy Admin Head' },
      { name: 'Operations Department Head', role: 'Department Head (Dynamic)' },
      { name: 'Anjali Gupta', role: 'Finance Manager' },
    ],
    suggestedReplacementName: 'Deepak Verma (Deputy Admin Head)'
  }
];

// ─── CHANGE PREVIEW TRANSACTIONS ───────────────────────────
// These show what would happen if the threshold in POL-001 changes from ₹50,000 to ₹100,000
export const HISTORICAL_TRANSACTIONS: HistoricalTransaction[] = [
  {
    id: 'tx-001',
    date: '2026-09-28',
    employeeName: 'Arun Nair',
    employeeLevel: 'IC',
    department: 'Office Management',
    entity: 'IN',
    merchant: 'Staples India',
    category: 'Office Supplies',
    amount: 60000,
    currency: 'INR',
    spendType: 'CARD',
    currentOutcome: 'MANAGER_APPROVED',
    currentRuleCode: 'POL-002 (Office Supplies Approval)',
    currentApprover: 'Priya Mehta (Office Manager)',
    simulatedOutcome: 'MANAGER_APPROVED',
    simulatedRuleCode: 'POL-002 (Unchanged)',
    simulatedApprover: 'Priya Mehta (Office Manager)',
    impactTag: 'UNCHANGED',
    diffNotes: 'Specific exception still applies. No change in approval path.'
  },
  {
    id: 'tx-002',
    date: '2026-09-27',
    employeeName: 'Meera Patel',
    employeeLevel: 'MANAGER',
    department: 'Engineering',
    entity: 'IN',
    merchant: 'Dell India',
    category: 'Laptops',
    amount: 85000,
    currency: 'INR',
    spendType: 'CARD',
    currentOutcome: 'MANAGER_APPROVED',
    currentRuleCode: 'POL-001 (General > ₹50,000)',
    currentApprover: 'CEO',
    simulatedOutcome: 'AUTO_APPROVED',
    simulatedRuleCode: 'Below new threshold (₹1,00,000)',
    simulatedApprover: 'None (auto-approved)',
    impactTag: 'DIFFERENT_THRESHOLD',
    diffNotes: '₹85,000 is below proposed ₹1,00,000 threshold. Would bypass CEO approval entirely.'
  },
  {
    id: 'tx-003',
    date: '2026-09-26',
    employeeName: 'Ravi Kumar',
    employeeLevel: 'DIRECTOR',
    department: 'Sales',
    entity: 'IN',
    merchant: 'Travel Corp',
    category: 'International Travel',
    amount: 92000,
    currency: 'INR',
    spendType: 'CARD',
    currentOutcome: 'MANAGER_APPROVED',
    currentRuleCode: 'POL-005 (Travel > ₹75,000)',
    currentApprover: 'Vikram Singh (Finance Director)',
    simulatedOutcome: 'MANAGER_APPROVED',
    simulatedRuleCode: 'POL-005 (Unchanged)',
    simulatedApprover: 'Vikram Singh (Finance Director)',
    impactTag: 'UNCHANGED',
    diffNotes: 'Travel-specific rule still applies independently.'
  },
  {
    id: 'tx-004',
    date: '2026-09-25',
    employeeName: 'Sneha Desai',
    employeeLevel: 'IC',
    department: 'HR',
    entity: 'IN',
    merchant: 'Amazon Business',
    category: 'Office Supplies',
    amount: 55000,
    currency: 'INR',
    spendType: 'CARD',
    currentOutcome: 'MANAGER_APPROVED',
    currentRuleCode: 'POL-001 (General > ₹50,000)',
    currentApprover: 'CEO',
    simulatedOutcome: 'AUTO_APPROVED',
    simulatedRuleCode: 'Below new threshold (₹1,00,000)',
    simulatedApprover: 'None (auto-approved)',
    impactTag: 'DIFFERENT_THRESHOLD',
    diffNotes: '₹55,000 would no longer require CEO. No specific rule covers HR + Office Supplies.'
  },
  {
    id: 'tx-005',
    date: '2026-09-24',
    employeeName: 'Karthik Reddy',
    employeeLevel: 'MANAGER',
    department: 'Finance',
    entity: 'IN',
    merchant: 'Microsoft India',
    category: 'Software Licenses',
    amount: 72000,
    currency: 'INR',
    spendType: 'BILL',
    currentOutcome: 'MANAGER_APPROVED',
    currentRuleCode: 'POL-001 (General > ₹50,000)',
    currentApprover: 'CEO',
    simulatedOutcome: 'AUTO_APPROVED',
    simulatedRuleCode: 'Below new threshold (₹1,00,000)',
    simulatedApprover: 'None (auto-approved)',
    impactTag: 'DIFFERENT_THRESHOLD',
    diffNotes: '₹72,000 software license would skip CEO review under new threshold.'
  },
  {
    id: 'tx-006',
    date: '2026-09-23',
    employeeName: 'Neha Sharma',
    employeeLevel: 'IC',
    department: 'Engineering',
    entity: 'IN',
    merchant: 'Figma',
    category: 'SaaS Subscriptions',
    amount: 8500,
    currency: 'INR',
    spendType: 'CARD',
    currentOutcome: 'AUTO_APPROVED',
    currentRuleCode: 'POL-007 (Software < ₹10,000)',
    currentApprover: 'None (auto-approved)',
    simulatedOutcome: 'AUTO_APPROVED',
    simulatedRuleCode: 'POL-007 (Unchanged)',
    simulatedApprover: 'None (auto-approved)',
    impactTag: 'UNCHANGED',
    diffNotes: 'Below ₹10,000 software auto-approve threshold. Unaffected.'
  },
  {
    id: 'tx-007',
    date: '2026-09-22',
    employeeName: 'Amit Patel',
    employeeLevel: 'IC',
    department: 'Marketing',
    entity: 'IN',
    merchant: 'Google Ads',
    category: 'Digital Ads',
    amount: 120000,
    currency: 'INR',
    spendType: 'BILL',
    currentOutcome: 'FINANCE_REVIEWED',
    currentRuleCode: 'POL-006 (Marketing > ₹50,000 — Broken)',
    currentApprover: 'John Smith (DEPARTED)',
    simulatedOutcome: 'FINANCE_REVIEWED',
    simulatedRuleCode: 'POL-006 (Still broken)',
    simulatedApprover: 'John Smith (DEPARTED)',
    impactTag: 'UNCHANGED',
    diffNotes: 'Broken approval route. John Smith has departed. Needs route healing.'
  }
];

// ─── AI POLICY PDF PROPOSALS ───────────────────────────
export const AI_PROPOSALS: AiExtractedProposal[] = [
  {
    id: 'ai-01',
    pdfPage: 8,
    sourceSection: 'Company Travel Policy — Page 8',
    rawPolicyText: '"International travel exceeding ₹75,000 per trip must be pre-approved by the Finance Director. Employees should book through the corporate travel portal where available. Economy class is mandatory for domestic flights; premium economy is permitted for international flights exceeding 6 hours."',
    extractedDraft: {
      title: 'International Travel Pre-Approval',
      domain: 'TRAVEL',
      conditionsSummary: 'International Travel > ₹75,000 → Finance Director approval',
      decision: 'REQUIRE_APPROVAL',
      suggestedApprovers: 'Finance Director',
      amountLimit: 75000,
      currency: 'INR'
    },
    confidence: 91,
    ambiguityReason: undefined,
    flaggedExceptions: ['Flight class rules (economy vs premium) cannot be enforced via spend amount alone — requires booking system integration.'],
    status: 'PROPOSED'
  },
  {
    id: 'ai-02',
    pdfPage: 12,
    sourceSection: 'Entertainment & Hospitality Policy — Page 12',
    rawPolicyText: '"Client entertainment expenses should be reasonable and commensurate with the business relationship. Alcohol may be included when accompanying meals with external business contacts. Standalone bar tabs are not reimbursable."',
    extractedDraft: {
      title: 'Client Entertainment Guardrail',
      domain: 'MEALS_AND_ENTERTAINMENT',
      conditionsSummary: 'Client entertainment → Manager approval if amount exceeds ₹15,000',
      decision: 'REQUIRE_APPROVAL',
      suggestedApprovers: 'Direct Manager',
      amountLimit: 15000,
      currency: 'INR'
    },
    confidence: 48,
    ambiguityReason: 'Policy uses subjective language: "reasonable and commensurate" cannot be converted into a specific monetary threshold. The ₹15,000 limit is an AI estimate, not stated in the policy.',
    flaggedExceptions: ['Standalone bar tabs not reimbursable — needs merchant category enforcement.', '"Reasonable" has no defined amount — admin should set explicit threshold.'],
    status: 'PROPOSED'
  },
  {
    id: 'ai-03',
    pdfPage: 15,
    sourceSection: 'IT & Software Procurement — Page 15',
    rawPolicyText: '"Any software subscription, cloud service, or digital tool that processes customer data or integrates with production systems must receive IT Security review, regardless of cost. Standard business tools below ₹10,000/month do not require approval."',
    extractedDraft: {
      title: 'IT Security Review for Data-Processing Tools',
      domain: 'SOFTWARE_AND_IT',
      conditionsSummary: 'Any software that handles customer data → IT Security review (₹0 threshold)',
      decision: 'REQUIRE_APPROVAL',
      suggestedApprovers: 'IT Security Lead',
      amountLimit: 0,
      currency: 'INR'
    },
    confidence: 86,
    ambiguityReason: 'High confidence for the review requirement. However, determining whether a tool "processes customer data" requires metadata beyond transaction amount — may need vendor questionnaire integration.',
    flaggedExceptions: [],
    status: 'PROPOSED'
  }
];

// ─── AUDIT LOG ───────────────────────────
export const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'audit-001',
    timestamp: 'Oct 1, 2026 — 7:14 PM',
    author: 'Rohan (Finance Admin)',
    action: 'RULE_EDITED',
    ruleId: 'rule-002',
    ruleTitle: 'Office Supplies Approval',
    summary: 'Changed approval from CEO to Office Manager for Office Management department.',
    reason: 'Created department-specific exception for Office Management.',
    previousVersion: 1,
    newVersion: 2,
    diffs: [
      { field: 'Approver', before: 'CEO', after: 'Priya Mehta (Office Manager)' },
      { field: 'Department', before: 'All', after: 'Office Management' }
    ],
    canRollback: true
  },
  {
    id: 'audit-002',
    timestamp: 'Sep 30, 2026 — 3:22 PM',
    author: 'Rohan (Finance Admin)',
    action: 'RULE_CREATED',
    ruleId: 'rule-010',
    ruleTitle: 'Consulting fees above ₹1,00,000',
    summary: 'Created new draft rule for consulting and legal fees.',
    reason: 'CFO requested stricter controls on external consulting engagements.',
    newVersion: 1,
    diffs: [
      { field: 'Rule', before: '(none)', after: 'POL-010 created as Draft' }
    ],
    canRollback: true
  },
  {
    id: 'audit-003',
    timestamp: 'Sep 28, 2026 — 11:05 AM',
    author: 'Rohan (Finance Admin)',
    action: 'RULE_CREATED',
    ruleId: 'rule-009',
    ruleTitle: 'Client entertainment above ₹25,000',
    summary: 'Created draft rule for client entertainment spending.',
    newVersion: 1,
    diffs: [
      { field: 'Rule', before: '(none)', after: 'POL-009 created as Draft' }
    ],
    canRollback: true
  },
  {
    id: 'audit-004',
    timestamp: 'Sep 15, 2026 — 9:30 AM',
    author: 'System (HRIS Sync)',
    action: 'ROUTE_HEALED',
    ruleId: 'rule-006',
    ruleTitle: 'Marketing purchases above ₹50,000',
    summary: 'Detected broken route: John Smith has departed the company. 23 active rules reference this approver.',
    diffs: [
      { field: 'Approver status', before: 'Active', after: 'Departed (Sep 15)' }
    ],
    canRollback: false
  },
  {
    id: 'audit-005',
    timestamp: 'Aug 1, 2026 — 2:15 PM',
    author: 'Rohan (Finance Admin)',
    action: 'RULE_PUBLISHED',
    ruleId: 'rule-007',
    ruleTitle: 'Software subscriptions below ₹10,000',
    summary: 'Published auto-approval rule for small software subscriptions.',
    reason: 'Reduce unnecessary approvals for standard SaaS tools.',
    previousVersion: 1,
    newVersion: 2,
    diffs: [
      { field: 'Status', before: 'Draft', after: 'Active' },
      { field: 'Threshold', before: '₹5,000', after: '₹10,000' }
    ],
    canRollback: true
  }
];

export const EMPLOYEES_MOCK = [
  { id: 'emp-1', name: 'Arun Nair', role: 'Office Coordinator', department: 'Office Management', entity: 'IN', level: 'IC' },
  { id: 'emp-2', name: 'Meera Patel', role: 'Engineering Manager', department: 'Engineering', entity: 'IN', level: 'MANAGER' },
  { id: 'emp-3', name: 'Ravi Kumar', role: 'Sales Director', department: 'Sales', entity: 'IN', level: 'DIRECTOR' },
  { id: 'emp-4', name: 'Sneha Desai', role: 'HR Executive', department: 'HR', entity: 'IN', level: 'IC' },
  { id: 'emp-5', name: 'Karthik Reddy', role: 'Finance Analyst', department: 'Finance', entity: 'IN', level: 'MANAGER' },
  { id: 'emp-6', name: 'Neha Sharma', role: 'Frontend Developer', department: 'Engineering', entity: 'IN', level: 'IC' },
];

export const CATEGORIES_LIST = [
  'Office Supplies',
  'Laptops',
  'Computer Hardware',
  'SaaS Subscriptions',
  'Developer Tools',
  'Software Licenses',
  'International Travel',
  'Domestic Travel',
  'Flights',
  'Hotels',
  'Client Entertainment',
  'Business Meals',
  'Digital Ads',
  'Marketing Materials',
  'Consulting Services',
  'Legal Services',
  'Facilities',
  'Maintenance',
];

export const DEPARTMENTS_LIST = [
  'All',
  'Office Management',
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Admin',
  'Partnerships',
];

export interface ApproverDirectoryItem {
  id: string;
  name: string;
  role: string;
  roleType: 'DIRECT_MANAGER' | 'DEPARTMENT_HEAD' | 'FINANCE_LEAD' | 'VP' | 'CFO' | 'NAMED_USER' | 'OFFICE_MANAGER' | 'FINANCE_MANAGER' | 'FINANCE_DIRECTOR';
  department: string;
  email: string;
  initials: string;
  avatarBg: string;
  isDynamic?: boolean;
}

export const APPROVERS_DIRECTORY: ApproverDirectoryItem[] = [
  {
    id: 'appr-dh',
    name: "Employee's Department Head",
    role: 'Department Head (Dynamic)',
    roleType: 'DEPARTMENT_HEAD',
    department: 'Requester Department',
    email: 'dept-head@company.com',
    initials: 'DH',
    avatarBg: '#dbeafe',
    isDynamic: true
  },
  {
    id: 'appr-dm',
    name: "Employee's Direct Manager",
    role: 'Direct Line Manager (Dynamic)',
    roleType: 'DIRECT_MANAGER',
    department: 'Requester Team',
    email: 'direct-manager@company.com',
    initials: 'DM',
    avatarBg: '#fef3c7',
    isDynamic: true
  },
  {
    id: 'appr-1',
    name: 'Priya Mehta',
    role: 'Office Manager',
    roleType: 'OFFICE_MANAGER',
    department: 'Office Management & Facilities',
    email: 'priya.mehta@company.com',
    initials: 'PM',
    avatarBg: '#f3e8ff'
  },
  {
    id: 'appr-2',
    name: 'Vikram Malhotra',
    role: 'Chief Financial Officer (CFO)',
    roleType: 'CFO',
    department: 'Executive / Finance',
    email: 'vikram.malhotra@company.com',
    initials: 'VM',
    avatarBg: '#fee2e2'
  },
  {
    id: 'appr-3',
    name: 'Rajesh Sen',
    role: 'Engineering Head & VP',
    roleType: 'DEPARTMENT_HEAD',
    department: 'Engineering',
    email: 'rajesh.sen@company.com',
    initials: 'RS',
    avatarBg: '#e0e7ff'
  },
  {
    id: 'appr-4',
    name: 'Ananya Roy',
    role: 'Finance Director',
    roleType: 'FINANCE_DIRECTOR',
    department: 'Finance Leadership',
    email: 'ananya.roy@company.com',
    initials: 'AR',
    avatarBg: '#ccfbf1'
  },
  {
    id: 'appr-5',
    name: 'Karthik Reddy',
    role: 'Finance Manager & Lead',
    roleType: 'FINANCE_MANAGER',
    department: 'Finance & Accounts',
    email: 'karthik.reddy@company.com',
    initials: 'KR',
    avatarBg: '#ffedd5'
  },
  {
    id: 'appr-6',
    name: 'Sanjay Gupta',
    role: 'VP of Operations',
    roleType: 'VP',
    department: 'Operations',
    email: 'sanjay.gupta@company.com',
    initials: 'SG',
    avatarBg: '#e0f2fe'
  },
  {
    id: 'appr-7',
    name: 'Ravi Kumar',
    role: 'Sales Director & Head',
    roleType: 'DEPARTMENT_HEAD',
    department: 'Sales & Revenue',
    email: 'ravi.kumar@company.com',
    initials: 'RK',
    avatarBg: '#fae8ff'
  },
  {
    id: 'appr-8',
    name: 'Sneha Desai',
    role: 'HR Director & People Lead',
    roleType: 'DEPARTMENT_HEAD',
    department: 'Human Resources',
    email: 'sneha.desai@company.com',
    initials: 'SD',
    avatarBg: '#fce7f3'
  },
  {
    id: 'appr-9',
    name: 'Meera Patel',
    role: 'Engineering Manager',
    roleType: 'DIRECT_MANAGER',
    department: 'Engineering (Platform)',
    email: 'meera.patel@company.com',
    initials: 'MP',
    avatarBg: '#dcfce7'
  },
  {
    id: 'appr-10',
    name: 'Rohan Sharma',
    role: 'Finance Admin & Policy Lead',
    roleType: 'FINANCE_LEAD',
    department: 'Finance Operations',
    email: 'rohan.sharma@company.com',
    initials: 'RS',
    avatarBg: '#ede9fe'
  }
];

export const INITIAL_SPEND_REQUESTS: SpendRequest[] = [
  {
    id: 'req-1',
    requesterName: 'Arun Nair',
    requesterRole: 'Office Coordinator',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    department: 'Office Management',
    category: 'Office Supplies',
    amount: 60000,
    currency: 'INR',
    spendType: 'CARD',
    description: 'Quarterly toiletry supplies, pantry restock, and cleaning materials for the office.',
    ruleTitle: 'Office Supplies Approval (POL-002)',
    ruleCode: 'POL-002',
    approverName: 'Priya Mehta',
    approverRole: 'Office Manager',
    approverAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    status: 'PENDING',
    createdAt: 'Today, 2:15 PM',
    attachmentType: 'INVOICE',
    attachmentName: 'OfficeSupplies_RestockQuote_Oct26.pdf (184 KB)',
    attachmentUrl: 'https://example.com/invoices/restock_quote_oct26.pdf'
  },
  {
    id: 'req-2',
    requesterName: 'Neha Sharma',
    requesterRole: 'Frontend Developer',
    requesterAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    department: 'Engineering',
    category: 'SaaS Subscriptions',
    amount: 35000,
    currency: 'INR',
    spendType: 'CARD',
    description: 'JetBrains IntelliJ Ultimate team licenses & GitHub Copilot developer seats.',
    ruleTitle: 'Software & SaaS Approval (POL-005)',
    ruleCode: 'POL-005',
    approverName: 'Rajesh Sen',
    approverRole: 'Engineering Head & VP',
    approverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    status: 'PENDING',
    createdAt: 'Today, 11:30 AM',
    attachmentType: 'PRODUCT_LINK',
    attachmentName: 'jetbrains.com/idea/buy',
    attachmentUrl: 'https://www.jetbrains.com/idea/buy/'
  },
  {
    id: 'req-3',
    requesterName: 'Ravi Kumar',
    requesterRole: 'Sales Director',
    requesterAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
    department: 'Sales',
    category: 'Client Entertainment',
    amount: 28000,
    currency: 'INR',
    spendType: 'REIMBURSEMENT',
    description: 'Dinner with prospective enterprise client leadership team at Bangalore.',
    ruleTitle: 'Purchases above ₹50,000 (POL-001)',
    ruleCode: 'POL-001',
    approverName: 'Vikram Malhotra',
    approverRole: 'Chief Financial Officer (CFO)',
    approverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    status: 'PENDING',
    createdAt: 'Yesterday, 6:10 PM'
  },
  {
    id: 'req-4',
    requesterName: 'Karthik Reddy',
    requesterRole: 'Finance Analyst',
    requesterAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    department: 'Finance',
    category: 'Consulting Services',
    amount: 75000,
    currency: 'INR',
    spendType: 'BILL',
    description: 'External statutory compliance advisory and fiscal year tax preparation.',
    ruleTitle: 'Purchases above ₹50,000 (POL-001)',
    ruleCode: 'POL-001',
    approverName: 'Vikram Malhotra',
    approverRole: 'Chief Financial Officer (CFO)',
    approverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    createdAt: 'Yesterday, 4:45 PM',
    decisionDate: 'Yesterday, 5:20 PM',
    decisionNote: 'Approved. Vendor verified.'
  },
  {
    id: 'req-5',
    requesterName: 'Meera Patel',
    requesterRole: 'Engineering Manager',
    requesterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    department: 'Engineering',
    category: 'Hardware & IT',
    amount: 92000,
    currency: 'INR',
    spendType: 'CARD',
    description: 'Apple M3 Pro MacBook for incoming senior distributed systems engineer.',
    ruleTitle: 'Hardware & IT Clearance (POL-008)',
    ruleCode: 'POL-008',
    approverName: 'Rajesh Sen',
    approverRole: 'Engineering Head & VP',
    approverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    status: 'PENDING',
    createdAt: 'Yesterday, 10:15 AM'
  }
];

