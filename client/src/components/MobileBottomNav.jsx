import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Sliders, Plus, LogOut } from 'lucide-react';

export const MobileBottomNav = ({ currentView, setCurrentView, onOpenNew }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Contracts List */}
      <button
        onClick={() => setCurrentView('dashboard')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentView === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <FileText size={18} />
        <span>Contracts</span>
      </button>

      {/* 2. Safety Policies */}
      <button
        onClick={() => setCurrentView('policy')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentView === 'policy' ? 'var(--text-main)' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Sliders size={18} />
        <span>Policies</span>
      </button>

      {/* 3. Center Action Button (+) */}
      <button
        onClick={onOpenNew}
        className="mobile-fab-center"
        title="New Agreement"
      >
        <Plus size={22} />
      </button>

      {/* 4. Sign Out */}
      <button
        onClick={logout}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        title="Sign Out"
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </nav>
  );
};
