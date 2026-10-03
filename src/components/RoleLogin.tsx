import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { UserRole, UserPersona } from '../types';

interface RoleLoginProps {
  onSelectRole: (role: UserRole, persona?: UserPersona) => void;
}

interface DemoPersona {
  role: UserRole;
  name: string;
  title: string;
  department: string;
  email: string;
  initials: string;
  roleBadge: string;
  displayLabel: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'FINANCE_ADMIN',
    name: 'Rohan Sharma',
    title: 'Finance Administrator',
    department: 'Central Finance',
    email: 'rohan.sharma@spendflow.corp',
    initials: 'RS',
    roleBadge: 'Finance Admin',
    displayLabel: 'Admin'
  },
  {
    role: 'DEPT_HEAD',
    name: 'Priya Mehta',
    title: 'Office Manager',
    department: 'Facilities & Workplace',
    email: 'priya.mehta@spendflow.corp',
    initials: 'PM',
    roleBadge: 'Dept Head',
    displayLabel: 'Dep Head'
  },
  {
    role: 'EMPLOYEE',
    name: 'Arun Nair',
    title: 'Workplace Coordinator',
    department: 'Office Management',
    email: 'arun.nair@spendflow.corp',
    initials: 'AN',
    roleBadge: 'Employee',
    displayLabel: 'Employee'
  }
];

const GoogleIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

export const RoleLogin: React.FC<RoleLoginProps> = ({ onSelectRole }) => {
  const [selectedPersona, setSelectedPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]);
  const [email, setEmail] = useState<string>(DEMO_PERSONAS[0].email);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectDemo = (persona: DemoPersona) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
    setPassword('••••••••••••');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const persona: UserPersona = {
        role: selectedPersona.role,
        name: selectedPersona.name,
        title: selectedPersona.title,
        department: selectedPersona.department,
        avatarInitials: selectedPersona.initials
      };
      onSelectRole(selectedPersona.role, persona);
    }, 220);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      backgroundColor: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {/* ─── LEFT 50%: Clean Editorial Visual ─── */}
      <div style={{
        flex: '0 0 50%',
        width: '50%',
        height: '100%',
        position: 'relative',
        backgroundImage: 'url(/login-hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '64px 72px',
        boxSizing: 'border-box'
      }}>
        {/* Subtle, desaturated dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(17, 17, 17, 0.85) 0%, rgba(17, 17, 17, 0.4) 45%, rgba(17, 17, 17, 0.05) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Editorial Heading & Subtitle */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
          <h2 style={{
            fontSize: '2.6rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            margin: '0 0 16px 0'
          }}>
            Bring your policies to life.
          </h2>

          <p style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.88)',
            margin: 0,
            fontWeight: 300,
            letterSpacing: '-0.01em'
          }}>
            Evaluate multi-variable rules in milliseconds, resolve routing bottlenecks proactively, and keep teams moving with absolute governance.
          </p>
        </div>
      </div>

      {/* ─── RIGHT 50%: Minimalist Editorial Form ─── */}
      <div style={{
        flex: '0 0 50%',
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 64px',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {/* Form Body: Constrained to 380px */}
        <div style={{
          width: '100%',
          maxWidth: 380,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header with Editorial Serif */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              margin: '0 0 6px 0',
              lineHeight: 1.15
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.5
            }}>
              Sign in to your spend management workspace
            </p>
          </div>

          {/* Continue with Google button */}
          <button
            type="button"
            onClick={handleLoginSubmit}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              height: 42,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background-color 140ms ease, border-color 140ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Hairline Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            margin: '22px 0'
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              OR SIGN IN WITH EMAIL
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Address */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 6
              }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 12px',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 140ms ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--text-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle)';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 6
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 36px 0 12px',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 140ms ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--text-primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-subtle)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 14,
                    height: 14,
                    accentColor: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>Remember sign in details</span>
              </label>

              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Forgot password?
              </a>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 42,
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: 'var(--brand-primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                transition: 'background-color 140ms ease, transform 100ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.99)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>{loading ? 'Authenticating...' : `Sign in as ${selectedPersona.displayLabel}`}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Minimalist Demo Quick-Fill Box */}
          <div style={{
            marginTop: 22,
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)'
            }}>
              <span>Demo Quick-Fill</span>
              <span style={{ textTransform: 'none', color: 'var(--text-light)', fontWeight: 400 }}>1-click test</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {DEMO_PERSONAS.map(p => {
                const isSelected = selectedPersona.role === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectDemo(p)}
                    style={{
                      padding: '6px 4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      backgroundColor: isSelected ? 'var(--text-primary)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                      textAlign: 'center'
                    }}
                  >
                    {p.displayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Link */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: 20
          }}>
            Don't have an account?{' '}
            <span 
              onClick={() => handleSelectDemo(DEMO_PERSONAS[0])}
              style={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              Create an account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;
