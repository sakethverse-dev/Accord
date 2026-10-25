import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  User, 
  Briefcase, 
  ArrowRight, 
  Lock, 
  Sun, 
  Moon, 
  AlertCircle 
} from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          companyOrTitle: companyOrTitle.trim(),
        });
      } else {
        await login(email.trim(), password);
      }
      onAuthSuccess?.();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'var(--bg-app)',
      padding: '24px 16px',
    }}>
      {/* Top Bar with Brand & Theme Switcher */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
          }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1 }}>
              Pact<span style={{ color: 'var(--accent)' }}>Flow</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
              Legal Trust Engine
            </div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
          <span style={{ textTransform: 'capitalize' }}>{theme} mode</span>
        </button>
      </div>

      {/* Main Center Form */}
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            {isRegister ? 'Create Your Account' : 'Sign in to PactFlow'}
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isRegister 
              ? 'Join as a Freelancer or Client to audit and negotiate mutual agreements.' 
              : 'Collaborative contract risk workbench & cryptographic negotiation room.'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Segmented Tab: Sign In vs Create Account */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            background: 'var(--bg-muted)',
            padding: '3px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              id="tab-sign-in"
              style={{
                padding: '7px',
                borderRadius: '6px',
                border: 'none',
                background: !isRegister ? 'var(--bg-surface)' : 'transparent',
                color: !isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: !isRegister ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              id="tab-create-account"
              style={{
                padding: '7px',
                borderRadius: '6px',
                border: 'none',
                background: isRegister ? 'var(--bg-surface)' : 'transparent',
                color: isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isRegister ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'var(--risk-critical-bg)',
              border: '1px solid var(--risk-critical-border)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--risk-critical-text)',
              fontSize: '0.8rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Registration Specific Fields */}
            {isRegister && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                    id="input-register-name"
                  />
                </div>

                {/* Role Selection Segment */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                    Select Professional Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      id="btn-role-freelancer"
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        background: role === 'freelancer' ? 'var(--accent-bg)' : 'var(--bg-muted)',
                        border: role === 'freelancer' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                        color: role === 'freelancer' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <User size={14} />
                        Freelancer
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Protects payment & IP
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      id="btn-role-client"
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        background: role === 'client' ? 'var(--accent-bg)' : 'var(--bg-muted)',
                        border: role === 'client' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                        color: role === 'client' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <Briefcase size={14} />
                        Client / Enterprise
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Protects delivery & SLA
                      </div>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                    Organization or Title
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={companyOrTitle}
                    onChange={(e) => setCompanyOrTitle(e.target.value)}
                    placeholder={role === 'client' ? 'e.g. Acme Cloud Corp' : 'e.g. Independent Software Consultant'}
                    id="input-register-title"
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
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

            {/* Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
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

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', minHeight: '42px' }}
              disabled={loading}
              id="btn-auth-submit"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account & Continue' : 'Sign In to Workspace'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Security / Compliance Seal */}
        <div style={{
          textAlign: 'center',
          marginTop: '18px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <Lock size={12} color="var(--risk-safe)" />
          <span>256-Bit TLS • Zero-Knowledge Storage • ESIGN Legal Enforceability</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '20px' }}>
        PactFlow Institutional Legal Infrastructure © 2026. All rights reserved.
      </div>
    </div>
  );
};
