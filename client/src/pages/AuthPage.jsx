import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  User, 
  Briefcase, 
  ArrowRight, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register } = useAuth();

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
      {/* Top Bar with Brand */}
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
          <img
            src="/logo_accord.jpg"
            alt="Accord Logo"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #27272a',
              objectFit: 'cover',
            }}
          />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Accord
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '3px' }}>
              Contract Consensus
            </div>
          </div>
        </div>
      </div>


      {/* Main Center Form */}
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            {isRegister ? 'Create Your Account' : 'Sign in to Accord'}
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isRegister 
              ? 'Join as a Freelancer or Client to audit and negotiate mutual agreements.' 
              : 'Collaborative contract risk workbench & cryptographic negotiation room.'}
          </p>
        </div>

        {/* Invited Link Notice if present */}
        {localStorage.getItem('pactflow_pending_invite') && (
          <div style={{
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            color: 'var(--text-main)',
          }}>
            <Shield size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Secure Room Invitation Detected:</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                Sign in or register below. You will be connected to the collaborative negotiation room immediately.
              </div>
            </div>
          </div>
        )}

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
                background: !isRegister ? '#ffffff' : 'transparent',
                color: !isRegister ? '#000000' : 'var(--text-muted)',
                fontWeight: !isRegister ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: !isRegister ? '0 1px 3px rgba(255, 255, 255, 0.15)' : 'none',
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
                background: isRegister ? '#ffffff' : 'transparent',
                color: isRegister ? '#000000' : 'var(--text-muted)',
                fontWeight: isRegister ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: isRegister ? '0 1px 3px rgba(255, 255, 255, 0.15)' : 'none',
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
                    placeholder="e.g. Your Full Legal Name"
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
                        background: role === 'freelancer' ? '#ffffff' : 'var(--bg-muted)',
                        border: role === 'freelancer' ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                        color: role === 'freelancer' ? '#000000' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <User size={14} />
                        Freelancer
                      </div>
                      <div style={{ fontSize: '0.68rem', color: role === 'freelancer' ? '#444448' : 'var(--text-muted)', marginTop: '2px' }}>
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
                        background: role === 'client' ? '#ffffff' : 'var(--bg-muted)',
                        border: role === 'client' ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                        color: role === 'client' ? '#000000' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <Briefcase size={14} />
                        Client / Enterprise
                      </div>
                      <div style={{ fontSize: '0.68rem', color: role === 'client' ? '#444448' : 'var(--text-muted)', marginTop: '2px' }}>
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
        Accord Institutional Contract Infrastructure © 2026. All rights reserved.
      </div>
    </div>
  );
};
