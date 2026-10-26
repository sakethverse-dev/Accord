import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './pages/Dashboard';
import { AgreementRoom } from './pages/AgreementRoom';
import { PolicySettings } from './pages/PolicySettings';
import { AuthPage } from './pages/AuthPage';
import { TemplateModal } from './components/TemplateModal';
import { api } from './services/api';
import { Shield, Menu } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'room' | 'policy'
  const [activeAgreementId, setActiveAgreementId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Check URL pathname for /invite/:token or pending invite from storage
  useEffect(() => {
    const path = window.location.pathname;
    let token = null;
    if (path.startsWith('/invite/')) {
      token = path.split('/invite/')[1];
      if (token) {
        localStorage.setItem('pactflow_pending_invite', token);
      }
    } else {
      token = localStorage.getItem('pactflow_pending_invite');
    }

    if (token && user) {
      api.agreements.joinByToken(token)
        .then((agreement) => {
          localStorage.removeItem('pactflow_pending_invite');
          setActiveAgreementId(agreement._id);
          setCurrentView('room');
          window.history.pushState({}, '', '/');
        })
        .catch((err) => {
          console.error('Invite join error:', err);
          localStorage.removeItem('pactflow_pending_invite');
        });
    }
  }, [user]);

  const handleOpenSample = () => {
    setShowTemplateModal(true);
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
        Initializing Accord Consensus Infrastructure...
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
            <img
              src="/logo_accord.jpg"
              alt="Accord Logo"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #27272a',
                objectFit: 'cover',
              }}
            />
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              Accord
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {user?.name} ({user?.role})
          </div>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard
            onSelectAgreement={(id) => {
              setActiveAgreementId(id);
              setCurrentView('room');
            }}
            onOpenTemplate={() => setShowTemplateModal(true)}
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
        onOpenNew={() => setShowTemplateModal(true)}
      />

      {/* Standard Legal Template Picker & Preview Modal */}
      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={async ({ title, rawText }) => {
            const newAgreement = await api.agreements.create({ title, rawText });
            setActiveAgreementId(newAgreement._id);
            setCurrentView('room');
          }}
        />
      )}

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
