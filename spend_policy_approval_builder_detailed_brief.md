# Spend Policy & Approval Builder — Detailed Product Brief

## 1. Source of Truth

This document translates the provided take-home assignment into a detailed product brief for an IDE/coding agent.

The original assignment is the source of truth for required functionality. Where the assignment does not specify an exact product behavior, this document marks the behavior as a **proposed design decision** rather than a requirement from the brief.

---

# 2. Product Overview

We are designing a **B2B Spend Policy & Approval Builder** for a fast-growing company with:

- 600 employees
- 4 countries
- Corporate cards
- Bill payments
- Employee reimbursements

The company's spending policy currently lives in a **20-page PDF that nobody effectively reads**.

Over two years, approval rules have accumulated into **140 rules**. These rules:

- overlap
- contradict each other
- route requests to people who have left
- have become difficult for Finance to understand and trust

Because Finance has lost confidence in the configuration, they now manually review everything, which defeats the purpose of the expense-management platform.

---

# 3. Primary Persona

## Rohan — Finance Admin

Rohan is the primary administrative persona.

He:

- configures policies
- configures approval workflows
- is comfortable with logic
- is not a developer
- is afraid of breaking something that could block spending for 600 employees

### Product implication

The product should feel:

- safe
- predictable
- transparent
- explainable
- easy to change
- difficult to break accidentally

Do not design it like a developer-only rule engine.

Rohan should be able to understand what a rule means without knowing how the underlying software implements it.

---

# 4. Other Users

## Employees

Employees want to know what they can spend **before they spend it**, rather than finding out after a rejection.

They should not need to read a 20-page policy document to understand whether a purchase is allowed or requires approval.

### Employee needs

The employee should be able to answer:

1. Can I make this purchase?
2. Does it require approval?
3. Who needs to approve it?
4. What should I do next?

---

## Department Heads

Department Heads are approvers.

Their primary responsibility is to:

- receive spending requests
- review requests
- approve requests
- reject requests

The assignment does **not** state that Department Heads create policies or rules.

Do not make them policy administrators by default.

---

# 5. Role and Permission Model

The assignment explicitly identifies the Finance Admin as the person who configures policies and approvals.

A clean interpretation for the prototype is:

| Role | Raise request | Create/configure rules | Approve requests | Resolve rule conflicts |
|---|---:|---:|---:|---:|
| Employee | Yes | No | No | No |
| Department Head | Not specified | No | Yes | No |
| Finance Admin / Policy Admin | Not specified | Yes | Not specified | Yes |

### Important

The exact permission architecture beyond what the PDF states is a **product-design decision**.

Do not present additional permissions as if they were explicitly defined by the assignment.

---

# 6. Core Problem

The company has 140 rules.

The main difficulty is that multiple rules can apply to the same transaction.

Rules can depend on:

- Amount
- Category
- Merchant
- Department
- Entity
- Currency
- Employee level
- Spend type

Spend types include:

- Card
- Bill
- Reimbursement

The product therefore needs to make rule evaluation understandable.

---

# 7. Multiple Rules Matching the Same Transaction

This is one of the most important problems in the assignment.

Example:

### Rule A

> Amount > ₹50,000 → CEO approval

### Rule B

> Department = Office Management  
> AND Category = Office Supplies  
> AND Amount > ₹50,000  
> → Office Manager approval

An Office Management employee wants to buy:

> Toiletry supplies — ₹60,000

The transaction matches both rules.

The system must determine which rule applies and explain why.

The assignment explicitly requires the product to decide which rule wins when multiple rules match and for admins to understand why.

---

# 8. Proposed Rule Mental Model

The following is a **proposed product design**, not a rule specified by the assignment:

## General rule

> Amount > ₹50,000 → CEO approval

This can act as a default/fallback.

## Specific exception

> Office Management + Office Supplies + Amount > ₹50,000 → Office Manager approval

This can act as an exception to the general rule.

### Example evaluation

```text
Transaction
₹60,000 Office Supplies
        |
        +---- General rule
        |     Amount > ₹50,000
        |     → CEO approval
        |
        +---- Specific rule
              Office Management
              + Office Supplies
              + Amount > ₹50,000
              → Office Manager approval

        |
        v

Specific exception takes precedence
        |
        v

Office Manager approval
```

The important UX requirement is that the system should **show this reasoning**.

Do not simply display "Office Manager approval" without explaining why.

---

# 9. True Rule Conflict

There are cases where specificity cannot resolve the conflict.

Example:

### Rule A

> Office Supplies + Amount > ₹50,000 → Office Manager

### Rule B

> Office Supplies + Amount > ₹50,000 → Finance Manager

Both rules have exactly the same conditions but different outcomes.

This is a true conflict.

The system should not silently select the newest rule.

Instead:

```text
CONFLICT DETECTED

2 rules have identical conditions but different approval outcomes.

Rule A
Office Supplies > ₹50,000
→ Office Manager

Rule B
Office Supplies > ₹50,000
→ Finance Manager

No automatic resolution available.

Admin decision required.
```

Possible actions:

- Keep Rule A
- Keep Rule B
- Require both approvals
- Edit the rules

The selected resolution should be recorded in the audit history.

---

# 10. Rule Builder

One of the required high-fidelity screens is creating a rule.

The rule builder should support the conditions listed in the assignment.

## Rule name

Example:

> Office Supplies Approval

## Conditions

Example:

```text
Department
[ Office Management ]

Category
[ Office Supplies ]

Amount
[ Greater than ] [ ₹50,000 ]

Spend type
[ Card ]
```

Conditions should support combinations such as:

- AND
- OR

where appropriate.

## Outcome

Example:

```text
Approval required

Approver:
[ Office Manager ]
```

---

# 11. Rule Validation Before Saving

When Rohan creates or edits a rule, the system should check:

- Does this overlap with an existing rule?
- Does it create a contradiction?
- Does it affect existing transactions?
- Is the selected approver valid?
- Does the workflow contain a broken route?
- Does the rule create a duplicate condition set?
- Does the rule change the outcome of existing scenarios?

The goal is to detect problems **before publishing**.

---

# 12. Conflict Detection

When a new rule overlaps with an existing rule, the product should proactively notify the admin.

Example:

```text
CONFLICT DETECTED

Your new rule overlaps with:

"Purchases above ₹50,000"

Existing outcome:
CEO approval

New outcome:
Manager approval

Affected transactions:
12

[View conflict]
```

The admin should be able to inspect:

- What conflicts?
- Why does it conflict?
- Which rules are involved?
- What transactions are affected?
- What happens if the new rule is published?

---

# 13. Policy Landscape

One required screen is a view of the full policy landscape.

Do not simply create a huge table of 140 rules.

The purpose is to make the complexity understandable.

The policy landscape should help Rohan understand:

- Active rules
- Draft rules
- Conflicting rules
- Overlapping rules
- Broken approval routes
- Rules affected by recent changes
- Approvers
- Rule history
- Rule status

## Useful filters

- Department
- Category
- Spend type
- Status
- Conflict status
- Approver
- Entity
- Amount range

## Useful statuses

- Active
- Draft
- Conflict
- Needs review
- Broken route
- Archived

---

# 14. Rule Detail Screen

Clicking a rule should expose the logic clearly.

Example:

## Office Supplies Approval

### Conditions

```text
Department = Office Management
Category = Office Supplies
Amount > ₹50,000
Spend type = Card
```

### Outcome

> Office Manager approval

### Precedence

> Overrides general rule:
> "Spend above ₹50,000 → CEO approval"

### Usage

Example UI data:

> 18 transactions matched this rule during the selected period.

### History

```text
Created
Modified
Conflict detected
Conflict resolved
Published
```

The UI should make the rule understandable without requiring the admin to inspect raw configuration.

---

# 15. Change Preview

This is a mandatory deliverable.

The Finance Admin must be able to modify a rule without immediately applying the change to the entire company.

Example:

### Current

> Above ₹50,000 → CEO approval

### Proposed

> Above ₹100,000 → CEO approval

Before publishing, show:

```text
CHANGE PREVIEW

Current threshold
₹50,000

New threshold
₹100,000

Potential impact

42 historical transactions would match differently

18 requests would have a different approval path

2 rule conflicts detected

3 approval routes need review
```

The numbers above are illustrative prototype data.

The important behavior is:

> Show the consequences before the change becomes active.

---

# 16. Draft → Preview → Publish

Use a safe change workflow:

```text
Create / Edit Rule
        |
        v
Save as Draft
        |
        v
Conflict & Validation Checks
        |
        v
Impact Preview
        |
        v
Admin Review
        |
        v
Publish
        |
        v
Active Rule
```

Rule editing should not feel like an irreversible action.

---

# 17. Rollback

Every important published rule should have a version history.

Example:

```text
Version 3 — Active
Oct 1, 2026

Version 2
Sep 20, 2026

Version 1
Sep 1, 2026
```

The admin can choose:

> Restore Version 2

Before restoring:

```text
ROLLBACK PREVIEW

You are about to restore:

Office Supplies Approval — Version 2

Potential impact:
12 active policy relationships
7 approval routes

[Cancel]
[Restore version]
```

The assignment explicitly says the CFO wants rule changes to be audited and reversible.

---

# 18. Audit Trail

Every important policy action should be recorded.

Example:

```text
Oct 1, 7:14 PM

Rohan changed:
Office Supplies Approval

From:
CEO approval

To:
Office Manager approval

Reason:
Created department-specific exception

Status:
Published
```

The audit trail should answer:

- Who changed it?
- What changed?
- When?
- What was the previous version?
- What is the new version?
- Why was it changed?
- Was it published?
- Can it be rolled back?

---

# 19. Broken Approval Routes

This is a required scenario.

Approvers can:

- go on leave
- change teams
- leave the company

The workflow must not break when this happens.

Example:

A rule currently says:

> Marketing purchases > ₹50,000 → John Smith

John leaves the company.

The system should detect:

```text
BROKEN APPROVAL ROUTE

John Smith is no longer an active employee.

23 active rules currently reference this approver.

[Assign replacement]
[Review affected rules]
```

The admin should be able to select a replacement.

Possible options:

```text
Replace with:

○ John's replacement
○ Marketing Department Head
○ Finance Manager
○ Select another person
```

The exact replacement logic is a product-design decision.

The key requirement is that the system identifies and safely handles broken routes.

---

# 20. AI Policy Import

The company has a 20-page policy PDF.

The assignment states that an AI system can read the PDF and propose rules.

However:

> The AI misreads nuance and exceptions regularly.

Therefore AI must not automatically publish rules.

## Recommended flow

```text
Upload Policy PDF
        |
        v
AI extracts possible rules
        |
        v
AI-generated rule proposals
        |
        v
Finance Admin reviews
        |
        v
Admin edits/corrects
        |
        v
Conflict detection
        |
        v
Impact preview
        |
        v
Admin publishes
```

The core principle is:

> AI proposes. Human admin approves.

---

# 21. AI Review Screen

Example:

```text
AI PROPOSED RULE

Source:
Company Travel Policy — Page 8

AI interpretation:

Category
International Travel

Amount
> ₹75,000

Approval
Finance Director

Status
Review required
```

Show the source policy content alongside the structured interpretation.

The admin should be able to:

- accept
- edit
- reject
- compare with source
- flag an incorrect interpretation

The system should make it clear that the AI output is a **proposal**, not an authoritative policy.

---

# 22. Employee Experience

The assignment requires one employee-facing screen showing how an employee experiences the policy at the moment of spending.

Example:

Employee wants to purchase:

> Laptop — ₹60,000

Employee screen:

```text
CAN I SPEND ₹60,000?

Category
Laptop

Amount
₹60,000

Approval required

Your purchase requires:
Department Manager approval

Policy:
Laptop purchases above ₹50,000

[Request approval]
```

The employee should not see:

- rule IDs
- conflict-resolution logic
- policy-engine terminology
- audit logs
- admin-only controls

The employee needs a simple answer:

> Can I spend this?

> If approval is required, who approves it?

> What do I do next?

---

# 23. End-to-End Example

Use the following as the main prototype story.

## Scenario

An employee from Office Management wants to buy:

- Item: Toiletry supplies
- Amount: ₹60,000
- Spend type: Corporate card

There is a general rule:

> Purchases above ₹50,000 → CEO approval

There is also a specific rule:

> Office Management + Office Supplies + above ₹50,000 → Office Manager approval

The system identifies that both rules match.

The specific rule is designed as an exception to the general rule.

The employee sees:

> **Office Manager approval required**

The Finance Admin can inspect the decision:

```text
MATCHED RULES: 2

General rule
Amount > ₹50,000
→ CEO approval

Specific rule
Office Management
+ Office Supplies
+ Amount > ₹50,000
→ Office Manager approval

APPLIED:
Specific rule

REASON:
Specific exception takes precedence over general policy.
```

Again, this precedence model is a proposed product decision, not something explicitly specified by the assignment.

---

# 24. True Conflict Example

Another scenario:

### Rule A

> Office Supplies > ₹50,000 → Office Manager

### Rule B

> Office Supplies > ₹50,000 → Finance Manager

Same conditions.

Different outcomes.

The system should show:

```text
CONFLICT

2 rules match exactly the same conditions.

Rule A
→ Office Manager

Rule B
→ Finance Manager

No automatic resolution available.

Admin decision required.
```

The authorized Finance Admin resolves the conflict.

---

# 25. What the Product Should NOT Do

## Do not silently select the newest rule

This creates unpredictable behavior.

## Do not automatically combine every matching rule

This can create unnecessary approval chains.

## Do not hide conflicts

Admins need to understand why the system behaves differently.

## Do not allow AI to automatically publish policies

The assignment explicitly warns that AI can misunderstand nuance and exceptions.

## Do not make employees understand the rule engine

Employees need a simple spending decision.

## Do not make policy changes immediately irreversible

The assignment requires auditability and reversibility.

---

# 26. Suggested Application Navigation

## Admin application

```text
SPEND ADMIN

Dashboard

Policies
├── All Policies
├── Conflicts
├── Drafts
└── Broken Routes

Approvals
├── Approval Workflows
└── Approvers

Policy Builder
└── Create Rule

Change Preview

AI Import

Audit Log
```

## Employee application

```text
EMPLOYEE

Spend
├── Check Spending
├── New Request
└── My Requests
```

## Department Head application

```text
APPROVALS

Pending Requests
Approved
Rejected
```

---

# 27. Required High-Fidelity Screens

The assignment specifically asks for high-fidelity screens covering:

## Screen 1 — Create Rule

Include:

- Rule name
- Conditions
- Outcome
- Approver
- Conflict detection
- Save as draft

## Screen 2 — Policy Landscape

Include:

- All policies
- Status
- Conflicts
- Overlaps
- Approvers
- Filters
- Search

## Screen 3 — Conflict Resolution

Include:

- Conflicting rules
- Conditions
- Different outcomes
- Affected transaction example
- Why conflict exists
- Resolution options
- Admin decision

## Screen 4 — Change Preview

Include:

- Before
- After
- Affected transactions
- Approval changes
- New conflicts
- Broken routes
- Publish action

## Screen 5 — Broken Route

Include:

- Inactive approver
- Policies affected
- Replacement approver
- Impact

## Screen 6 — Employee Spending

Include:

- Amount
- Category
- Whether spending is allowed
- Required approval
- Approver
- Request action

---

# 28. Core Design Principle

The product should communicate:

> **"You are always in control, and the system will tell you what your change will do before it affects the company."**

The Finance Admin should never have to guess:

- Which rule applies?
- Why did this rule win?
- Who will approve this?
- What happens if I change this?
- How many employees are affected?
- Is the approver still valid?
- Can I undo the change?

The product should answer these questions directly.

---

# 29. Success Measures

The assignment asks for a short note describing how we know admins trust the system again.

Possible success metrics:

- Reduction in manual Finance reviews
- Reduction in unresolved rule conflicts
- Reduction in broken approval routes
- Time required to create or change a policy
- Percentage of changes tested through preview before publishing
- Number of successful rollbacks
- Reduction in employee questions to Finance about spending rules
- Admin confidence/trust rating after completing policy changes

The core outcome is:

> Finance no longer needs to manually inspect every transaction because they trust the policy engine.

---

# 30. Overall Product Flow

```text
                    FINANCE ADMIN
                         |
                         v
                Create / Import Policy
                         |
                         v
                   Define Rules
                         |
                         v
              +---------------------+
              | Conflict Detection  |
              +---------------------+
                         |
                  No conflict?
                    /       \
                  Yes        No
                   |          |
                   |          v
                   |    Resolve Conflict
                   |          |
                   +----+-----+
                        |
                        v
                 Change Preview
                        |
                        v
                    Publish
                        |
                        v
                 Active Policy
                        |
          +-------------+-------------+
          |                           |
          v                           v
      Employee                  Department Head
          |                           |
   Raises request               Approve/Reject
          |                           |
          +-------------+-------------+
                        |
                        v
                  Spend completed
                        |
                        v
                   Audit history
```

---

# 31. Prototype Story for the Review Call

The prototype should tell one connected story rather than looking like a collection of unrelated screens.

Recommended narrative:

### Step 1

Rohan opens the policy landscape.

He sees that the company has many rules and that some need attention.

### Step 2

Rohan creates or edits a spending rule.

### Step 3

The system detects an overlap/conflict.

### Step 4

Rohan sees exactly which existing rule conflicts and which transactions could be affected.

### Step 5

Rohan resolves the conflict.

### Step 6

The system generates a change preview.

Rohan sees the impact before publishing.

### Step 7

Rohan publishes the rule.

The change is added to the audit history.

### Step 8

Later, an approver leaves the company.

The system detects a broken approval route and asks Rohan to assign a replacement.

### Step 9

An employee wants to spend ₹60,000.

The employee sees the correct approval requirement before spending.

This demonstrates the complete relationship between:

**Admin configuration → Policy evaluation → Approval workflow → Employee experience → Auditability**

---

# 32. Design Priorities

Prioritize these in order:

## 1. Safety

Prevent accidental policy changes.

Use:

- drafts
- previews
- conflict detection
- validation
- confirmation
- rollback
- audit trail

## 2. Explainability

Always answer:

> Why did this rule apply?

## 3. Simplicity

Hide unnecessary technical complexity without hiding important information.

## 4. AI Trust

AI should accelerate policy creation but never bypass human review.

## 5. End-to-End Experience

Connect admin configuration to the actual employee spending experience.

---

# 33. Assignment Evaluation Alignment

The assignment evaluates:

### Simplification

Make a complex logic system understandable without hiding important details.

### Safety

Include:

- previews
- conflict detection
- rollback
- audit trails

### Trust in AI

Allow admins to:

- review AI-generated rules
- correct them
- understand their source
- decide whether to use them

### End-to-End Thinking

Connect:

> Admin policy configuration

to:

> Employee spending experience

### Communication

The product should make design decisions easy to explain during the review call.

---

# 34. Important Implementation Note for the IDE Agent

When implementing the prototype:

### Treat these as assignment requirements

- Finance Admin configures policies and approvals
- Department Heads approve requests
- Employees need spending visibility
- Rules can depend on amount/category/merchant/department/entity/currency/employee level/spend type
- Multiple rules can match a transaction
- The system must determine and explain which rule wins
- Approvers can become unavailable
- Changes must be auditable and reversible
- AI can propose rules but can misunderstand nuance
- Need policy landscape
- Need rule creation
- Need conflict resolution
- Need change preview
- Need broken-route handling
- Need employee view
- Need success measure

### Treat these as proposed product decisions

- Exact role/permission architecture beyond the named personas
- Exact rule precedence algorithm
- Whether specific rules always override general rules
- Whether both matching approvals can be required
- Exact conflict resolution behavior
- Exact approval replacement logic
- Exact UI structure
- Exact metrics and sample data

Do not present proposed decisions as requirements from the PDF.

---

# 35. Final Product Definition

The product is a **safe policy-management system for corporate spending**.

Its job is not simply to let Finance create rules.

Its job is to make sure Finance can confidently answer:

> **What are our spending rules?**

> **Which rule applies to this transaction?**

> **Why did that rule apply?**

> **What happens if I change it?**

> **Who will be affected?**

> **Who will approve the request?**

> **What happens if an approver leaves?**

> **Can I undo the change?**

If the prototype consistently answers these questions, it addresses the central problem in the assignment: restoring Finance's confidence in the company's spend policy and approval system.
