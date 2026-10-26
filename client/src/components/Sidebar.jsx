import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { 
  FileText, 
  Sliders, 
  ShieldCheck, 
  LogOut, 
  Shield, 
  FileCheck,
  UserCheck,
  Settings
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, onOpenSample }) => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <aside className="app-sidebar">
      {/* Top Branding & Nav */}
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '28px' }}
        >
          <img
            src="/logo_accord.jpg"
            alt="Accord Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #27272a',
              objectFit: 'cover',
            }}
          />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Accord
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
              Contract Consensus
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
            id="nav-standard-template"
            style={{ color: 'var(--text-secondary)' }}
          >
            <FileCheck size={16} />
            <span>Standard Template</span>
          </div>
        </nav>
      </div>

      {/* Bottom Area: Security Badge, Profile */}
      <div>
        {/* Institutional Verification Badge */}
        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <ShieldCheck size={16} color="var(--text-main)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.25 }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 700, display: 'block' }}>ESIGN & SHA-256</span>
            Tamper-Evident Seal
          </div>
        </div>

        {/* User Profile Card (Clickable to Edit Profile & Password) */}
        <div 
          onClick={() => setShowProfileModal(true)}
          id="btn-sidebar-profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 8px',
            borderRadius: '8px',
            borderTop: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Click to manage profile, avatar & change password"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '1px 6px', textTransform: 'capitalize' }}>
                  {user?.role}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.companyOrTitle || user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileModal(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
              }}
              title="Profile & Password Settings"
            >
              <Settings size={15} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              id="btn-sidebar-logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
              }}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile & Security Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </aside>
  );
};
