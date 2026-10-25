import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Sliders, LogOut, Briefcase, CheckCircle2 } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout, quickLoginDemo } = useAuth();

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 12, 21, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '66px',
        paddingTop: '8px',
        paddingBottom: '8px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Brand & Trust Subtitle */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          id="nav-brand-logo"
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)',
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
              Pact<span style={{ color: '#818cf8' }}>Flow</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--risk-safe)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}>
                <CheckCircle2 size={10} />
                ESIGN & SHA-256 Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Nav & User Actions */}
        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            {/* Quick Demo Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(14, 21, 38, 0.85)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '3px',
              gap: '3px',
            }}>
              <button
                id="btn-switch-freelancer"
                onClick={() => quickLoginDemo('freelancer')}
                style={{
                  background: user.role === 'freelancer' ? 'rgba(79, 70, 229, 0.3)' : 'transparent',
                  color: user.role === 'freelancer' ? '#ffffff' : 'var(--text-muted)',
                  border: user.role === 'freelancer' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={11} />
                Alex (Freelancer)
              </button>

              <button
                id="btn-switch-client"
                onClick={() => quickLoginDemo('client')}
                style={{
                  background: user.role === 'client' ? 'rgba(124, 58, 237, 0.3)' : 'transparent',
                  color: user.role === 'client' ? '#ffffff' : 'var(--text-muted)',
                  border: user.role === 'client' ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Briefcase size={11} />
                Sarah (Client)
              </button>
            </div>

            {/* Policy Profile Trigger */}
            <button
              id="btn-nav-policy"
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentView('policy')}
              title="Configure My Safety Policies"
            >
              <Sliders size={13} />
              <span>Policies</span>
            </button>

            {/* User Profile Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: user.role === 'freelancer' ? 'rgba(79, 70, 229, 0.25)' : 'rgba(124, 58, 237, 0.25)',
                color: user.role === 'freelancer' ? '#a5b4fc' : '#c4b5fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ display: 'none', sm: 'block' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
                  {user.name}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              id="btn-nav-logout"
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="btn-nav-login"
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentView('auth')}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
