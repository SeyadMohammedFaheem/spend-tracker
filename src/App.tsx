import React, { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { PolicyLandscape } from './components/PolicyLandscape';
import { RuleBuilder } from './components/RuleBuilder';
import { ConflictResolver } from './components/ConflictResolver';
import { ChangePreview } from './components/ChangePreview';
import { BrokenRoutes } from './components/BrokenRoutes';
import { EmployeePreSpend } from './components/EmployeePreSpend';
import { EmployeeRequestsList } from './components/EmployeeRequestsList';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { DeptHeadApprovals } from './components/DeptHeadApprovals';
import { SettingsView } from './components/SettingsView';
import { AiIngestionStudio } from './components/AiIngestionStudio';
import { AuditAndRollback } from './components/AuditAndRollback';
import { RoleLogin } from './components/RoleLogin';
import { 
  INITIAL_RULES, 
  INITIAL_CONFLICTS, 
  INITIAL_BROKEN_ROUTES, 
  INITIAL_SPEND_REQUESTS,
  HISTORICAL_TRANSACTIONS 
} from './data/mockData';
import { SpendRule, RuleConflict, BrokenRouteAlert, AiExtractedProposal, SpendRequest, UserRole, UserPersona } from './types';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentPersona, setCurrentPersona] = useState<UserPersona | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [rules, setRules] = useState<SpendRule[]>(INITIAL_RULES);
  const [conflicts, setConflicts] = useState<RuleConflict[]>(INITIAL_CONFLICTS);
  const [brokenRoutes, setBrokenRoutes] = useState<BrokenRouteAlert[]>(INITIAL_BROKEN_ROUTES);
  const [requests, setRequests] = useState<SpendRequest[]>(INITIAL_SPEND_REQUESTS);
  const [editingRule, setEditingRule] = useState<SpendRule | null>(null);

  const draftRules = rules.filter(r => r.status === 'DRAFT');
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  // Handlers
  const handleSelectRuleForEdit = (rule: SpendRule) => {
    setEditingRule(rule);
    setActiveTab('builder');
  };

  const handleSaveRule = (savedRule: SpendRule) => {
    const exists = rules.some(r => r.id === savedRule.id);
    if (exists) {
      setRules(rules.map(r => r.id === savedRule.id ? savedRule : r));
    } else {
      setRules([savedRule, ...rules]);
    }
    setEditingRule(null);
    setActiveTab('landscape');
  };

  const handleSimulateRule = (rule: SpendRule) => {
    setEditingRule(rule);
    setActiveTab('simulation');
  };

  const handleResolveConflict = (conflictId: string, chosenStrategy: string) => {
    setConflicts(conflicts.filter(c => c.id !== conflictId));
    setRules(rules.map(r => {
      if (r.conflictIds && r.conflictIds.includes(conflictId)) {
        return { ...r, status: 'ACTIVE' as const, conflictIds: [] };
      }
      return r;
    }));
  };

  const handleHealRoute = (brokenId: string, replacementName: string) => {
    setBrokenRoutes(brokenRoutes.filter(b => b.id !== brokenId));
    setRules(rules.map(r => {
      if (r.brokenRouteDetails && r.status === 'BROKEN_ROUTE') {
        return {
          ...r,
          status: 'ACTIVE' as const,
          approverChain: [
            {
              id: `step-healed-${Date.now()}`,
              stepNumber: 1,
              roleType: 'NAMED_USER',
              namedUserName: replacementName,
              slaHours: 24,
              fallbackAction: 'ESCALATE_TO_SKIP_LEVEL'
            }
          ]
        };
      }
      return r;
    }));
  };

  // Spend Request Handlers (Employees & Dept Heads)
  const handleAddRequest = (req: SpendRequest) => {
    setRequests([req, ...requests]);
  };

  const handleApproveRequest = (requestId: string, note?: string) => {
    setRequests(requests.map(r => r.id === requestId ? {
      ...r,
      status: 'APPROVED',
      decisionDate: 'Just now',
      decisionNote: note || 'Approved by Department Head'
    } : r));
  };

  const handleRejectRequest = (requestId: string, reason?: string) => {
    setRequests(requests.map(r => r.id === requestId ? {
      ...r,
      status: 'REJECTED',
      decisionDate: 'Just now',
      decisionNote: reason || 'Declined under policy guidelines'
    } : r));
  };

  const handleDeployChanges = () => {
    // Deploy simulated rules
  };

  const handleRollback = (ruleId: string, version: number) => {
    // Execute rollback
  };

  const handleAcceptProposalAsRule = (proposal: AiExtractedProposal) => {
    const newRule: SpendRule = {
      id: `rule-ai-${proposal.id}`,
      code: `POL-AI-${Math.floor(100 + Math.random() * 899)}`,
      title: proposal.extractedDraft.title,
      description: proposal.extractedDraft.conditionsSummary,
      domain: proposal.extractedDraft.domain,
      conditions: {
        amountOperator: proposal.extractedDraft.amountLimit !== undefined ? 'GREATER_THAN' : 'ANY',
        amountMin: proposal.extractedDraft.amountLimit,
        currencies: ['INR'],
        categories: [proposal.extractedDraft.domain === 'TRAVEL' ? 'International Travel' : 'SaaS Subscriptions'],
        merchants: [],
        departments: ['All'],
        entities: ['IN'],
        employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
        spendTypes: ['CARD', 'BILL', 'REIMBURSEMENT']
      },
      decision: proposal.extractedDraft.decision,
      approverChain: proposal.extractedDraft.decision === 'REQUIRE_APPROVAL' ? [
        {
          id: `step-ai-${Date.now()}`,
          stepNumber: 1,
          roleType: 'DEPARTMENT_HEAD',
          slaHours: 24,
          fallbackAction: 'ESCALATE_TO_SKIP_LEVEL'
        }
      ] : [],
      status: 'DRAFT',
      specificityScore: 45,
      specificityFactors: ['AI-Ingested from PDF Page ' + proposal.pdfPage],
      createdAt: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      updatedBy: 'Rohan (Finance Admin)',
      version: 1,
      matchedTransactionsCount: 0
    };

    setRules([newRule, ...rules]);
  };

  const handleEditProposal = (proposal: AiExtractedProposal) => {
    const tempRule: SpendRule = {
      id: `rule-ai-${proposal.id}`,
      code: `POL-AI-${Math.floor(100 + Math.random() * 899)}`,
      title: proposal.extractedDraft.title,
      description: proposal.extractedDraft.conditionsSummary,
      domain: proposal.extractedDraft.domain,
      conditions: {
        amountOperator: proposal.extractedDraft.amountLimit !== undefined ? 'GREATER_THAN' : 'ANY',
        amountMin: proposal.extractedDraft.amountLimit,
        currencies: ['INR'],
        categories: [proposal.extractedDraft.domain === 'TRAVEL' ? 'International Travel' : 'SaaS Subscriptions'],
        merchants: [],
        departments: ['All'],
        entities: ['IN'],
        employeeLevels: ['IC', 'MANAGER', 'DIRECTOR'],
        spendTypes: ['CARD', 'BILL', 'REIMBURSEMENT']
      },
      decision: proposal.extractedDraft.decision,
      approverChain: proposal.extractedDraft.decision === 'REQUIRE_APPROVAL' ? [
        {
          id: `step-ai-${Date.now()}`,
          stepNumber: 1,
          roleType: 'DEPARTMENT_HEAD',
          slaHours: 24,
          fallbackAction: 'ESCALATE_TO_SKIP_LEVEL'
        }
      ] : [],
      status: 'DRAFT',
      specificityScore: 45,
      specificityFactors: ['AI-Ingested from PDF Page ' + proposal.pdfPage],
      createdAt: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      updatedBy: 'Rohan (Finance Admin)',
      version: 1,
      matchedTransactionsCount: 0
    };
    setEditingRule(tempRule);
    setActiveTab('builder');
  };

  const handleSwitchRole = () => {
    setCurrentRole(null);
    setCurrentPersona(null);
  };

  if (!currentRole) {
    return (
      <RoleLogin 
        onSelectRole={(role, persona) => {
          setCurrentRole(role);
          setCurrentPersona(persona || null);
          if (role === 'EMPLOYEE') setActiveTab('employee_dashboard');
          else if (role === 'DEPT_HEAD') setActiveTab('dept_dashboard');
          else setActiveTab('overview');
        }} 
      />
    );
  }

  // 1. Employee: side navbar with Dashboard, Spend Request & Pre-Clearance, My Requests, Company Policies, Settings
  if (currentRole === 'EMPLOYEE') {
    const currentEmployeeName = currentPersona?.name || 'Arun Nair';
    const myRequests = requests.filter(r => 
      r.requesterName.toLowerCase().includes(currentEmployeeName.toLowerCase()) || 
      (currentPersona?.department && r.department === currentPersona.department)
    );
    const myPendingCount = myRequests.filter(r => r.status === 'PENDING').length;

    return (
      <div className="layout-container">
        <Sidebar 
          userRole={currentRole}
          persona={currentPersona}
          activeTab={activeTab === 'settings' ? 'settings' : activeTab === 'my_requests' ? 'my_requests' : activeTab === 'landscape' ? 'landscape' : activeTab === 'employee_view' ? 'employee_view' : 'employee_dashboard'}
          setActiveTab={setActiveTab}
          conflictCount={0}
          brokenCount={0}
          draftCount={0}
          pendingApprovalCount={myPendingCount}
          totalRequestsCount={myRequests.length}
          myRequestsCount={myRequests.length}
          onSwitchRole={handleSwitchRole}
        />

        <div className="main-wrapper">
          <Topbar userRole={currentRole} persona={currentPersona} onSwitchRole={handleSwitchRole} onNavigateTab={setActiveTab} />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="content-viewport" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '24px 24px 48px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {(activeTab === 'employee_dashboard' || activeTab === 'my_requests' || (!['employee_view', 'landscape', 'settings'].includes(activeTab))) && (
                <EmployeeDashboard 
                  persona={currentPersona}
                  requests={requests}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'employee_view' && (
                <EmployeePreSpend 
                  requests={requests}
                  persona={currentPersona}
                  onAddRequest={handleAddRequest}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'landscape' && (
                <PolicyLandscape 
                  rules={rules}
                  onSelectRuleForEdit={handleSelectRuleForEdit}
                  onNavigateTab={setActiveTab}
                  userRole={currentRole}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView userRole={currentRole} persona={currentPersona} />
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 2. Department Head (Manager): side navbar with Dashboard, Review Approvals, Department Requests, Settings
  if (currentRole === 'DEPT_HEAD') {
    const deptHeadRequests = requests.filter(r => 
      r.department.toLowerCase().includes('office') || 
      r.department.toLowerCase().includes('facilities') ||
      r.department === (currentPersona?.department || 'Facilities & Workplace')
    );

    return (
      <div className="layout-container">
        <Sidebar 
          userRole={currentRole}
          persona={currentPersona}
          activeTab={activeTab === 'settings' ? 'settings' : activeTab === 'dept_requests' ? 'dept_requests' : activeTab === 'approvals' ? 'approvals' : 'dept_dashboard'}
          setActiveTab={setActiveTab}
          conflictCount={0}
          brokenCount={0}
          draftCount={0}
          pendingApprovalCount={pendingCount}
          totalRequestsCount={deptHeadRequests.length}
          onSwitchRole={handleSwitchRole}
        />

        <div className="main-wrapper">
          <Topbar userRole={currentRole} persona={currentPersona} onSwitchRole={handleSwitchRole} onNavigateTab={setActiveTab} />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="content-viewport" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {(activeTab === 'dept_dashboard' || (!['approvals', 'dept_requests', 'settings'].includes(activeTab))) && (
                <ManagerDashboard 
                  persona={currentPersona}
                  requests={requests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'approvals' && (
                <DeptHeadApprovals 
                  requests={requests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onAddRequest={handleAddRequest}
                  persona={currentPersona}
                  activeSection="APPROVALS"
                  onSectionChange={(sec) => setActiveTab(sec === 'REQUESTS' ? 'dept_requests' : 'approvals')}
                />
              )}

              {activeTab === 'dept_requests' && (
                <DeptHeadApprovals 
                  requests={requests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onAddRequest={handleAddRequest}
                  persona={currentPersona}
                  activeSection="REQUESTS"
                  onSectionChange={(sec) => setActiveTab(sec === 'REQUESTS' ? 'dept_requests' : 'approvals')}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView userRole={currentRole} persona={currentPersona} />
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 3. Finance Admin: only admin got to have a detailed dashboard & full sidebar
  return (
    <div className="layout-container">
      <Sidebar 
        userRole={currentRole}
        persona={currentPersona}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conflictCount={conflicts.length}
        brokenCount={brokenRoutes.filter(b => rules.some(r => r.id === b.ruleId && r.status === 'BROKEN_ROUTE')).length}
        draftCount={draftRules.length}
        pendingApprovalCount={pendingCount}
        onSwitchRole={handleSwitchRole}
      />

      <div className="main-wrapper">
        <Topbar userRole={currentRole} persona={currentPersona} onSwitchRole={handleSwitchRole} onNavigateTab={setActiveTab} />

        <main>
          {activeTab === 'overview' && (
            <OverviewDashboard 
              rules={rules}
              conflictCount={conflicts.length}
              brokenCount={brokenRoutes.length}
              draftCount={draftRules.length}
              pendingApprovalCount={pendingCount}
              conflicts={conflicts}
              brokenRoutes={brokenRoutes}
              onCreateRule={() => {
                setEditingRule(null);
                setActiveTab('builder');
              }}
              onNavigateTab={setActiveTab}
              onSelectRuleForEdit={handleSelectRuleForEdit}
              onSimulateRule={handleSimulateRule}
            />
          )}

          {activeTab === 'landscape' && (
            <div className="content-viewport">
              <PolicyLandscape 
                rules={rules}
                onSelectRuleForEdit={handleSelectRuleForEdit}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="content-viewport">
              <RuleBuilder 
                initialRule={editingRule}
                existingRules={rules}
                onSaveRule={handleSaveRule}
                onSimulateRule={handleSimulateRule}
                onCancel={() => {
                  setEditingRule(null);
                  setActiveTab('landscape');
                }}
              />
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="content-viewport">
              <PolicyLandscape 
                rules={draftRules}
                onSelectRuleForEdit={handleSelectRuleForEdit}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'conflicts' && (
            <div className="content-viewport">
              <ConflictResolver 
                conflicts={conflicts}
                rules={rules}
                onResolveConflict={handleResolveConflict}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="content-viewport">
              <ChangePreview 
                transactions={HISTORICAL_TRANSACTIONS}
                onDeployChanges={handleDeployChanges}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'broken_routes' && (
            <div className="content-viewport">
              <BrokenRoutes 
                brokenRoutes={brokenRoutes}
                onHealRoute={handleHealRoute}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'ai_studio' && (
            <div className="content-viewport">
              <AiIngestionStudio 
                onAcceptProposalAsRule={handleAcceptProposalAsRule}
                onEditProposal={handleEditProposal}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'audit_trail' && (
            <div className="content-viewport">
              <AuditAndRollback 
                onRollback={handleRollback}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="content-viewport">
              <SettingsView userRole={currentRole} persona={currentPersona} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
