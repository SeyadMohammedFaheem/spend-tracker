import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  FileText, 
  Settings, 
  ArrowLeftRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserRole, UserPersona } from '../types';
import { UserAvatar } from './UserAvatar';

interface TopbarProps {
  userRole?: UserRole;
  persona?: UserPersona | null;
  onSwitchRole?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  userRole = 'FINANCE_ADMIN', 
  persona: passedPersona, 
  onSwitchRole,
  onNavigateTab
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  const getPersona = () => {
    if (passedPersona) {
      return {
        name: passedPersona.name,
        role: userRole === 'EMPLOYEE' ? 'EMPLOYEE' : userRole === 'DEPT_HEAD' ? 'DEPT HEAD' : 'FINANCE ADMIN',
        title: passedPersona.title,
        department: passedPersona.department,
        initials: passedPersona.avatarInitials,
        avatarUrl: passedPersona.avatarUrl
      };
    }
    switch (userRole) {
      case 'EMPLOYEE':
        return { name: 'Arun Nair', role: 'EMPLOYEE', title: 'Workplace Coordinator', department: 'Facilities & Workplace', initials: 'AN', avatarUrl: undefined };
      case 'DEPT_HEAD':
        return { name: 'Priya Mehta', role: 'DEPT HEAD', title: 'Office Manager', department: 'Facilities & Workplace', initials: 'PM', avatarUrl: undefined };
      case 'FINANCE_ADMIN':
      default:
        return { name: 'Rohan Sharma', role: 'FINANCE ADMIN', title: 'Finance Administrator', department: 'Finance Operations', initials: 'RO', avatarUrl: undefined };
    }
  };

  const persona = getPersona();

  return (
    <header className="top-navbar" style={{ padding: '0 28px', position: 'relative' }}>
      <div className="search-box-wrapper">
        <Search size={16} />
        <input 
          type="text" 
          className="search-box-input" 
          placeholder={
            userRole === 'EMPLOYEE'
              ? 'Search requests, allowances, company policies...'
              : userRole === 'DEPT_HEAD'
              ? 'Search pending approvals, my requests...'
              : 'Search policies, rules, approvers, requests...'
          } 
        />
        <span className="search-key-badge">/</span>
      </div>

      <div className="topbar-right-controls">
        <button className="icon-bell-btn" title="Notifications">
          <Bell size={18} />
        </button>

        {/* Profile Dropdown Container */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div 
            className="user-chip-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            title="Profile & Quick Links"
            style={{ 
              cursor: 'pointer',
              background: dropdownOpen ? 'var(--bg-subtle)' : undefined,
              borderColor: dropdownOpen ? 'var(--border-subtle)' : undefined
            }}
          >
            <UserAvatar name={persona.name} avatarUrl={persona.avatarUrl} size={28} shape="circle" />
            <div className="chip-info">
              <span className="chip-name">{persona.name}</span>
              <span className="chip-role">{persona.role}</span>
            </div>
            <ChevronDown 
              size={14} 
              color="var(--text-light)" 
              style={{ 
                transform: dropdownOpen ? 'rotate(180deg)' : 'none', 
                transition: 'transform 140ms ease' 
              }} 
            />
          </div>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 250,
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0,0,0,0.06)',
              border: '1px solid var(--border-subtle)',
              padding: '6px',
              zIndex: 1000
            }}>
              {/* Profile Card Header */}
              <div style={{ 
                padding: '10px 12px 12px', 
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                marginBottom: 4
              }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {persona.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {persona.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {persona.department}
                </div>
              </div>

              {/* Navigation Quick Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* ─── Company Policies (Moved under profile dropdown) ─── */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateTab?.('landscape');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 100ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)'
                  }}>
                    <FileText size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Company Policies
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Spend rules & category caps
                    </div>
                  </div>
                </button>

                {/* Settings Link */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateTab?.('settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 100ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)'
                  }}>
                    <Settings size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Settings
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Preferences, currencies & SLAs
                    </div>
                  </div>
                </button>
              </div>

              {/* Switch Role Divider & Button */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 4, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onSwitchRole?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 100ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeftRight size={14} />
                  <span>Switch User Role</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
