import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FileText, 
  Sliders, 
  ShieldCheck, 
  History, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Briefcase, 
  Shield, 
  QrCode,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, onOpenSample }) => {
  const { user, logout, quickLoginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="app-sidebar">
      {/* Top Branding & Search */}
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '22px' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.35)',
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Pact<span style={{ color: 'var(--accent)' }}>Flow</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', marginTop: '3px' }}>
              Contract Infrastructure
            </div>
          </div>
        </div>

        {/* Search Input (Matching Image 1) */}
        <div style={{
          position: 'relative',
          marginBottom: '20px',
        }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search contracts..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-muted)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
          <span style={{
            position: 'absolute',
            right: '10px',
            top: '8px',
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '2px 5px',
          }}>
            /
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <FileText size={16} />
            <span>My contracts</span>
          </div>

          <div 
            className={`nav-item ${currentView === 'policy' ? 'active' : ''}`}
            onClick={() => setCurrentView('policy')}
          >
            <Sliders size={16} />
            <span>Safety policies</span>
          </div>

          <div 
            className="nav-item"
            onClick={onOpenSample}
            style={{ color: 'var(--accent)' }}
          >
            <Sparkles size={16} />
            <span>Demo Contract</span>
          </div>
        </nav>

        {/* Evaluator Demo Role Switcher */}
        <div style={{
          marginTop: '22px',
          padding: '12px',
          borderRadius: '10px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
            Switch Persona:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button
              onClick={() => quickLoginDemo('freelancer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: user?.role === 'freelancer' ? '1px solid var(--accent)' : '1px solid transparent',
                background: user?.role === 'freelancer' ? 'var(--bg-surface)' : 'transparent',
                color: user?.role === 'freelancer' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <User size={13} />
              <span>Alex (Freelancer)</span>
            </button>

            <button
              onClick={() => quickLoginDemo('client')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: user?.role === 'client' ? '1px solid var(--accent)' : '1px solid transparent',
                background: user?.role === 'client' ? 'var(--bg-surface)' : 'transparent',
                color: user?.role === 'client' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Briefcase size={13} />
              <span>Sarah (Client)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: Security Badge, User Profile & Dark Mode Toggle (Matching Image 1) */}
      <div>
        {/* Institutional Verification Badge */}
        <div style={{
          padding: '10px',
          borderRadius: '8px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <ShieldCheck size={16} color="var(--risk-safe)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>
            <strong style={{ color: 'var(--text-main)', display: 'block' }}>ESIGN & SHA-256</strong>
            Tamper-Evident Security
          </div>
        </div>

        {/* User Profile Card (Matching Image 1) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px',
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Dark Mode Switcher (Matching Image 1) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '8px',
          background: 'var(--bg-muted)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
        }}>
          <span>Dark mode</span>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontSize: '0.7rem',
            }}
          >
            {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
            <span style={{ textTransform: 'capitalize' }}>{theme}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
