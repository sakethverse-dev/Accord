import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Briefcase, ArrowRight, Sparkles, Lock } from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register, quickLoginDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('freelancer');
  const [companyOrTitle, setCompanyOrTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          companyOrTitle,
        });
      } else {
        await login(email, password);
      }
      onAuthSuccess?.();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError('');
    try {
      await quickLoginDemo(demoRole);
      onAuthSuccess?.();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 14px',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(79, 70, 229, 0.4)',
            marginBottom: '10px',
            color: '#ffffff',
          }}>
            <Shield size={26} />
          </div>
          <h2 style={{ fontSize: '1.55rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {isRegister ? 'Create Your Account' : 'Welcome to PactFlow'}
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Collaborative Contract Risk Auditing & Negotiation Room
          </p>
        </div>

        {/* 1-Click Evaluator Demo Accounts Banner */}
        <div className="contract-card" style={{ padding: '14px 16px', marginBottom: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
            <Sparkles size={12} />
            Evaluator Fast Access (1-Click Demo Login)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              id="btn-evaluator-freelancer"
              onClick={() => handleQuickDemo('freelancer')}
              style={{
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={13} color="var(--accent)" />
                Alex Rivera
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Role: Freelancer
              </div>
            </button>

            <button
              type="button"
              id="btn-evaluator-client"
              onClick={() => handleQuickDemo('client')}
              style={{
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={13} color="var(--accent)" />
                Sarah Chen
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Role: Enterprise Client
              </div>
            </button>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="contract-card" style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'var(--risk-critical-bg)',
              border: '1px solid var(--risk-critical-border)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'var(--risk-critical-text)',
              fontSize: '0.8rem',
              marginBottom: '14px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                    Account Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: role === 'freelancer' ? 'var(--primary)' : 'var(--bg-muted)',
                        border: role === 'freelancer' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        color: role === 'freelancer' ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      👨‍💻 Freelancer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: role === 'client' ? 'var(--primary)' : 'var(--bg-muted)',
                        border: role === 'client' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        color: role === 'client' ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      🏢 Client / Vendor
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                    Title or Organization
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={companyOrTitle}
                    onChange={(e) => setCompanyOrTitle(e.target.value)}
                    placeholder={role === 'client' ? 'e.g. CloudScale Labs Inc.' : 'e.g. Independent Software Consultant'}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                id="input-auth-email"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                id="input-auth-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', minHeight: '42px' }}
              disabled={loading}
              id="btn-auth-submit"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Trust & Compliance Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <Lock size={12} color="var(--risk-safe)" />
          <span>256-Bit TLS • Zero-Knowledge Storage • ESIGN Legal Enforceability</span>
        </div>
      </div>
    </div>
  );
};
