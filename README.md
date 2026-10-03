# SpendFlow — Spend Policy & Approval Workflow Engine

A modern B2B FinTech web application built with **React 19 + TypeScript + Vite**, designed to solve the challenges of managing corporate card spend, bill payments, and reimbursements across 600 employees in 4 countries (US, UK, DE, IN).

## 🚀 Live Local URL
Dev server runs locally at: `http://localhost:5174/` (or run `npm run dev`)

---

## 🎯 Design Problem & Context
Over 2 years, a fast-growing company accumulated **140 spend policies** that:
- Contradict and overlap each other (e.g. general SaaS rules vs team allowances).
- Route requests to departed or on-leave personnel.
- Cause Finance to review everything manually out of fear of breaking spend.
- Ping department heads for trivial amounts while big purchases slip past.
- Blindside employees with post-swipe rejections.

---

## 🛠️ Key Architectural Solutions & Deliverables

### 1. Problem Framing & Scope Boundaries (`Strategy & Mental Model` Tab)
- **3-Pillar Decomposition**:
  1. *Condition Matching Engine* (Amount, Merchant, Category, Dept, Entity, Level, Spend Type).
  2. *Specificity Precedence Resolver* (Deterministic mathematical arbitration).
  3. *Dynamic Route Dispatcher* (Decoupled from named individuals).
- **Explicit Exclusions**:
  - *Left out custom code/Python scripting* to protect non-technical admins (Rohan), ensure auditability, and prevent security vulnerabilities.
  - *Left out nested boolean formulas* (`(A OR B) AND (C NOT D)`) in favor of faceted tags and Plain English generation.
  - *Left out 600 individual static budgets* in favor of dynamic role + department allowances.

### 2. The Mental Model (2-Minute Explanation)
- **The Three-Gate Decision Pipeline**:
  - **Gate 1**: Match factual attributes (Who, What, Where, How much).
  - **Gate 2**: Specificity Hierarchy (**Specific Merchant > Specific Category > Specific Department > Blanket Default**).
  - **Gate 3**: Resilient Dispatch (Instant Auto-Approve or dynamic role routing with SLA and automated skip-level fallbacks).

### 3. Core Screens & Conflict Resolution
- **Policy Landscape**: 140 rules organized by domain, filterable by country entity, spend type, and health status, complete with calculated Priority Weight scores (0-100).
- **Rule Studio**: Intuitive If/Then builder featuring a **real-time Natural Language sentence generator** and multi-tier approver chain with fallback actions.
- **Conflict Resolver**: Visual side-by-side comparison of clashing rules with concrete simulated transactions (e.g. AWS $650 invoice matching both Rule #14 and Rule #48) and 1-click resolution strategies.

### 4. Zero-Fear Change Preview & Sandbox Simulation
- Test rule drafts across **1,420 historical transactions** (past 90 days) before publishing.
- Visual impact telemetry: Unaffected stability %, approvals streamlined, manager alert reductions, and averted false-positive blocks.
- Granular transaction diff table showing before/after route changes.

### 5. Resilient Approver Routing & HRIS Auto-Healing
- Real-time detection of departed approvers (e.g. *Sarah Jenkins*), on-leave personnel (*Marcus Vance*), and cross-border transfers (*Priya Patel*).
- 1-click auto-healing using **Dynamic HRIS Roles** (e.g. "Current VP of Engineering", "Entity Financial Controller") and out-of-office coverage delegates.

### 6. Employee "Spend Confident" Pre-Spend Simulator
- Real-time pre-swipe clearance engine: employees input vendor, category, and amount to get instant green/yellow/red status.
- Prevents awkward rejections before swiping.
- Generates pre-approved single-use **SpendFlow Virtual Cards** with locked merchant and dollar thresholds.

### 7. AI Policy PDF Ingestion Studio
- Human-in-the-Loop review cockpit parsing 20-page legal policies.
- AI confidence meters and explicit flags for subjective nuance (*"reasonable expenses"*, *"in moderation"*).
- Admins can verify, adjust thresholds, or reject interpretations before converting into active rules.

### 8. CFO Audit Trail & 1-Click Rollback
- Immutable Git-style version lineage (v4.2, v4.1, v4.0).
- Visual diffs of modified fields.
- 1-click emergency rollback with required audit justification notes.

---

## 💻 Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Vanilla CSS Design Tokens (Dark-mode slate, glassmorphism, responsive grid)
- **Icons**: Lucide React
- **Typography**: Google Fonts (Plus Jakarta Sans & JetBrains Mono)
