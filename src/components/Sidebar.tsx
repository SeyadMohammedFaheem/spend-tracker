import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  CreditCard, 
  UserCheck, 
  Layers,
  Clock,
  ListOrdered,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { UserRole, UserPersona } from '../types';

interface SidebarProps {
  userRole: UserRole;
  persona?: UserPersona | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  conflictCount: number;
  brokenCount: number;
  draftCount: number;
  pendingApprovalCount?: number;
  totalRequestsCount?: number;
  myRequestsCount?: number;
  onSwitchRole: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeTab,
  setActiveTab,
  conflictCount,
  brokenCount,
  draftCount,
  pendingApprovalCount = 0,
  totalRequestsCount = 0,
  myRequestsCount = 0,
  onSwitchRole
}) => {
  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-badge-group">
          <div className="brand-icon-circle">
            <Layers size={17} strokeWidth={2.5} />
          </div>
          <span className="brand-title">SpendFlow</span>
        </div>
      </div>

      {/* Role-Adaptive Navigation */}
      <div className="sidebar-nav">
        {userRole === 'FINANCE_ADMIN' && (
          <>
            <button 
              className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="nav-left">
                <LayoutDashboard size={18} strokeWidth={2} />
                <span>Dashboard</span>
              </div>
            </button>

            <button 
              className={`nav-item-btn ${['landscape', 'builder', 'conflicts', 'drafts', 'broken_routes', 'ai_studio', 'audit_trail', 'simulation'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => setActiveTab('landscape')}
            >
              <div className="nav-left">
                <FileText size={18} strokeWidth={2} />
                <span>Policy Landscape</span>
              </div>
              {conflictCount > 0 && (
                <span className="nav-badge-count" style={{ background: 'var(--status-rose-bg)', color: 'var(--status-rose-text)', border: '1px solid var(--status-rose-border)' }}>
                  {conflictCount}
                </span>
              )}
            </button>
          </>
        )}

        {userRole === 'DEPT_HEAD' && (
          <>
            <button 
              className={`nav-item-btn ${activeTab === 'dept_dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dept_dashboard')}
            >
              <div className="nav-left">
                <LayoutDashboard size={18} strokeWidth={2} />
                <span>Dashboard</span>
              </div>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'dept_requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('dept_requests')}
            >
              <div className="nav-left">
                <Clock size={18} strokeWidth={2} />
                <span>My Requests</span>
              </div>
              {totalRequestsCount !== undefined && totalRequestsCount > 0 && (
                <span className="nav-badge-count" style={{ background: 'var(--status-blue-bg)', color: 'var(--status-blue-text)', border: '1px solid var(--status-blue-border)' }}>
                  {totalRequestsCount}
                </span>
              )}
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <div className="nav-left">
                <CheckCircle2 size={18} strokeWidth={2} />
                <span>Review Approvals</span>
              </div>
              {pendingApprovalCount > 0 && (
                <span className="nav-badge-count" style={{ background: 'var(--status-amber-bg)', color: 'var(--status-amber-text)', border: '1px solid var(--status-amber-border)' }}>
                  {pendingApprovalCount}
                </span>
              )}
            </button>
          </>
        )}

        {userRole === 'EMPLOYEE' && (
          <>
            <button 
              className={`nav-item-btn ${activeTab === 'employee_dashboard' || activeTab === 'my_requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('employee_dashboard')}
            >
              <div className="nav-left">
                <LayoutDashboard size={18} strokeWidth={2} />
                <span>Dashboard</span>
              </div>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'employee_view' ? 'active' : ''}`}
              onClick={() => setActiveTab('employee_view')}
            >
              <div className="nav-left">
                <Clock size={18} strokeWidth={2} />
                <span>My Requests</span>
              </div>
              {myRequestsCount !== undefined && myRequestsCount > 0 && (
                <span className="nav-badge-count" style={{ background: 'var(--status-blue-bg)', color: 'var(--status-blue-text)', border: '1px solid var(--status-blue-border)' }}>
                  {myRequestsCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Settings at Bottom of Side Nav */}
      <div className="sidebar-footer" style={{ padding: '10px 10px', borderTop: '1px solid var(--border-subtle)' }}>
        <button 
          className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{ width: '100%' }}
        >
          <div className="nav-left">
            <Settings size={18} strokeWidth={2} />
            <span>Settings</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
