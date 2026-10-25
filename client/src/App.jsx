import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AgreementRoom } from './pages/AgreementRoom';
import { PolicySettings } from './pages/PolicySettings';
import { AuthPage } from './pages/AuthPage';
import { api } from './services/api';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'room' | 'policy' | 'auth'
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: 'var(--text-muted)',
      }}>
        Initializing PactFlow Security System...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => setCurrentView('dashboard')} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main style={{ flex: 1 }}>
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
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
