import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FileText, Sliders, Plus, User, Moon, Sun } from 'lucide-react';

export const MobileBottomNav = ({ currentView, setCurrentView, onOpenNew }) => {
  const { user, quickLoginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleTogglePersona = () => {
    if (user?.role === 'freelancer') {
      quickLoginDemo('client');
    } else {
      quickLoginDemo('freelancer');
    }
  };

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

      {/* 3. Center Floating Action Button (+) (Matching Image 2) */}
      <button
        onClick={onOpenNew}
        className="mobile-fab-center"
        title="Add or Load Contract"
      >
        <Plus size={24} />
      </button>

      {/* 4. Switch Persona */}
      <button
        onClick={handleTogglePersona}
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
        title="Switch Role"
      >
        <User size={18} />
        <span>{user?.role === 'freelancer' ? 'Alex' : 'Sarah'}</span>
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
