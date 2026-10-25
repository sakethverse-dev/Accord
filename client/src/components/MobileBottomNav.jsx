import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FileText, Sliders, Plus, LogOut, Moon, Sun } from 'lucide-react';

export const MobileBottomNav = ({ currentView, setCurrentView, onOpenNew }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
          color: currentView === 'dashboard' ? 'var(--accent)' : 'var(--text-muted)',
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
          color: currentView === 'policy' ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Sliders size={18} />
        <span>Policies</span>
      </button>

      {/* 3. Center Floating Action Button (+) */}
      <button
        onClick={onOpenNew}
        className="mobile-fab-center"
        title="New Agreement"
      >
        <Plus size={24} />
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

      {/* 5. Theme Toggle */}
      <button
        onClick={toggleTheme}
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
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        <span>Theme</span>
      </button>
    </nav>
  );
};
