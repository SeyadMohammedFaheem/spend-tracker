import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  UserX, 
  Layers, 
  PlusCircle, 
  PlayCircle, 
  UserCheck, 
  Bot, 
  History, 
  Compass, 
  Sliders
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePersona: 'ROHAN' | 'APPROVER' | 'EMPLOYEE';
  setActivePersona: (persona: 'ROHAN' | 'APPROVER' | 'EMPLOYEE') => void;
  conflictCount: number;
  brokenRouteCount: number;
  totalRulesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activePersona,
  setActivePersona,
  conflictCount,
  brokenRouteCount,
  totalRulesCount
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        {/* Brand */}
        <div className="brand-wrapper">
          <div className="brand-logo">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>SpendFlow Engine</h1>
            <span>Spend Policy & Approval Builder • B2B SaaS</span>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="header-status-pills">
          <div className="health-pill active">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
            <span>{totalRulesCount} Rules Active</span>
          </div>

          <button 
            className={`health-pill ${conflictCount > 0 ? 'conflict' : 'active'}`}
            onClick={() => setActiveTab('conflicts')}
            title="Click to inspect conflicts"
            style={{ cursor: 'pointer' }}
          >
            <AlertTriangle size={14} />
            <span>{conflictCount} Overlaps / Conflicts</span>
          </button>

          <button 
            className={`health-pill ${brokenRouteCount > 0 ? 'broken' : 'active'}`}
            onClick={() => setActiveTab('broken_routes')}
            title="Click to inspect broken routes"
            style={{ cursor: 'pointer' }}
          >
            <UserX size={14} />
            <span>{brokenRouteCount} Broken Approvers</span>
          </button>
        </div>

        {/* Persona Switcher */}
        <div className="persona-switch-bar">
          <button 
            className={`persona-btn ${activePersona === 'ROHAN' ? 'active' : ''}`}
            onClick={() => {
              setActivePersona('ROHAN');
              setActiveTab('landscape');
            }}
          >
            <Sliders size={14} />
            <span>Rohan (Admin)</span>
          </button>

          <button 
            className={`persona-btn ${activePersona === 'APPROVER' ? 'active' : ''}`}
            onClick={() => {
              setActivePersona('APPROVER');
              setActiveTab('simulation');
            }}
          >
            <UserCheck size={14} />
            <span>Dept Head</span>
          </button>

          <button 
            className={`persona-btn ${activePersona === 'EMPLOYEE' ? 'active' : ''}`}
            onClick={() => {
              setActivePersona('EMPLOYEE');
              setActiveTab('employee_view');
            }}
          >
            <ShieldCheck size={14} />
            <span>Employee View</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="nav-tab-strip">
        <button 
          className={`tab-btn ${activeTab === 'landscape' ? 'active' : ''}`}
          onClick={() => setActiveTab('landscape')}
        >
          <Layers size={16} />
          <span>Policy Landscape</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          <PlusCircle size={16} />
          <span>Rule Studio</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveTab('conflicts')}
        >
          <AlertTriangle size={16} />
          <span>Conflict Resolver</span>
          {conflictCount > 0 && <span className="tab-badge badge-amber">{conflictCount}</span>}
        </button>

        <button 
          className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          <PlayCircle size={16} />
          <span>Change Preview & Sandbox</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'broken_routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('broken_routes')}
        >
          <UserX size={16} />
          <span>Broken Routes</span>
          {brokenRouteCount > 0 && <span className="tab-badge badge-rose">{brokenRouteCount}</span>}
        </button>

        <button 
          className={`tab-btn ${activeTab === 'employee_view' ? 'active' : ''}`}
          onClick={() => setActiveTab('employee_view')}
        >
          <UserCheck size={16} />
          <span>Employee Pre-Spend</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'ai_studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai_studio')}
        >
          <Bot size={16} />
          <span>AI PDF Ingestion</span>
          <span className="tab-badge badge-purple">4 Propose</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'audit_trail' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit_trail')}
        >
          <History size={16} />
          <span>CFO Audit & Rollback</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'framing' ? 'active' : ''}`}
          onClick={() => setActiveTab('framing')}
        >
          <Compass size={16} />
          <span>Strategy & Mental Model</span>
        </button>
      </nav>
    </header>
  );
};
