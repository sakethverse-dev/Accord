import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Sliders, LogOut, RefreshCw, Briefcase } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout, quickLoginDemo } = useAuth();

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          id="nav-brand-logo"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-primary)',
          }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Pact<span style={{ color: 'var(--primary)' }}>Flow</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '-4px' }}>
              Collaborative Agreement Room
            </div>
          </div>
        </div>

        {/* Right Nav & User Actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Quick Demo Role Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '4px',
              gap: '4px',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', padding: '0 8px', fontWeight: 600 }}>
                Demo Role:
              </span>
              <button
                id="btn-switch-freelancer"
                onClick={() => quickLoginDemo('freelancer')}
                style={{
                  background: user.role === 'freelancer' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: user.role === 'freelancer' ? '#a5b4fc' : 'var(--text-muted)',
                  border: user.role === 'freelancer' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={12} />
                Alex (Freelancer)
              </button>

              <button
                id="btn-switch-client"
                onClick={() => quickLoginDemo('client')}
                style={{
                  background: user.role === 'client' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: user.role === 'client' ? '#c4b5fd' : 'var(--text-muted)',
                  border: user.role === 'client' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Briefcase size={12} />
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
              <Sliders size={14} />
              <span>Policies</span>
            </button>

            {/* User Profile Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: user.role === 'freelancer' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                color: user.role === 'freelancer' ? '#818cf8' : '#a78bfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}>
                {user.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: user.role === 'freelancer' ? '#818cf8' : '#a78bfa',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  {user.role}
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
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
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
