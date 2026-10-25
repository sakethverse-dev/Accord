import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './pages/Dashboard';
import { AgreementRoom } from './pages/AgreementRoom';
import { PolicySettings } from './pages/PolicySettings';
import { AuthPage } from './pages/AuthPage';
import { api } from './services/api';
import { Shield, Menu } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'room' | 'policy'
  const [activeAgreementId, setActiveAgreementId] = useState(null);

  // Check URL pathname for /invite/:token
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
      const token = path.split('/invite/')[1];
      if (token && user) {
        api.agreements.joinByToken(token)
          .then((agreement) => {
            setActiveAgreementId(agreement._id);
            setCurrentView('room');
            window.history.pushState({}, '', '/');
          })
          .catch((err) => console.error('Invite join error:', err));
      }
    }
  }, [user]);

  const handleOpenSample = async () => {
    try {
      const newAgreement = await api.agreements.create({ useSample: true });
      setActiveAgreementId(newAgreement._id);
      setCurrentView('room');
    } catch (err) {
      alert(`Error loading standard template: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}>
        Initializing PactFlow Enterprise Infrastructure...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="app-layout">
      {/* 1. Desktop Left Sidebar (Matching Image 1) */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSample={handleOpenSample}
      />

      {/* 2. Main Content Area */}
      <main className="app-main-content">
        {/* Mobile Header (Only visible on screens <= 1024px) */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <Shield size={16} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Pact<span style={{ color: 'var(--accent)' }}>Flow</span>
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
            {user?.name} ({user?.role})
          </div>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard
            onSelectAgreement={(id) => {
              setActiveAgreementId(id);
              setCurrentView('room');
            }}
          />
        )}

        {currentView === 'room' && activeAgreementId && (
          <AgreementRoom
            agreementId={activeAgreementId}
            onBack={() => {
              setActiveAgreementId(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'policy' && (
          <PolicySettings onBack={() => setCurrentView('dashboard')} />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation (Matching Image 2) */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNew={handleOpenSample}
      />

      {/* Responsive Style helper for mobile header */}
      <style>{`
        @media (max-width: 1024px) {
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
