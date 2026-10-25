import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FileText, 
  Sliders, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Briefcase, 
  Shield, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, onOpenSample }) => {
  const { user, logout, quickLoginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="app-sidebar">
      {/* Top Branding & Nav */}
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '24px' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
          }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1 }}>
              Pact<span style={{ color: 'var(--accent)' }}>Flow</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '3px' }}>
              Legal Trust Engine
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
            id="nav-my-contracts"
          >
            <FileText size={16} />
            <span>Agreements</span>
          </div>

          <div 
            className={`nav-item ${currentView === 'policy' ? 'active' : ''}`}
            onClick={() => setCurrentView('policy')}
            id="nav-safety-policies"
          >
            <Sliders size={16} />
            <span>Policy Rules</span>
          </div>

          <div 
            className="nav-item"
            onClick={onOpenSample}
            id="nav-demo-contract"
            style={{ color: 'var(--accent)' }}
          >
            <Sparkles size={16} />
            <span>Demo Contract</span>
          </div>
        </nav>

        {/* Sleek Segmented Persona Switcher */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          borderRadius: '10px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
            Testing Persona:
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            background: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={() => quickLoginDemo('freelancer')}
              id="btn-switch-freelancer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 4px',
                borderRadius: '6px',
                border: 'none',
                background: user?.role === 'freelancer' ? 'var(--primary)' : 'transparent',
                color: user?.role === 'freelancer' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={12} />
              <span>Freelancer</span>
            </button>

            <button
              onClick={() => quickLoginDemo('client')}
              id="btn-switch-client"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 4px',
                borderRadius: '6px',
                border: 'none',
                background: user?.role === 'client' ? 'var(--primary)' : 'transparent',
                color: user?.role === 'client' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Briefcase size={12} />
              <span>Client</span>
            </button>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
            Switch roles to test dual consensus
          </div>
        </div>
      </div>

      {/* Bottom Area: Security Badge, Profile, Dark Mode */}
      <div>
        {/* Verification Badge */}
        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <ShieldCheck size={16} color="var(--risk-safe)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.25 }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 700, display: 'block' }}>ESIGN & SHA-256</span>
            Tamper-Evident Seal
          </div>
        </div>

        {/* User Profile Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderTop: '1px solid var(--border-subtle)',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            <LogOut size={15} />
          </button>
        </div>

        {/* Dark Mode Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: '8px',
          background: 'var(--bg-muted)',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
        }}>
          <span>Theme</span>
          <button
            onClick={toggleTheme}
            id="btn-toggle-theme"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontSize: '0.68rem',
            }}
          >
            {theme === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
            <span style={{ textTransform: 'capitalize' }}>{theme}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
