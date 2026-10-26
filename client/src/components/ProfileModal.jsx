import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Camera, 
  Building,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const ProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [companyOrTitle, setCompanyOrTitle] = useState(user?.companyOrTitle || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Curated minimalist avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full legal name is required.');
      return;
    }

    if (showPasswordFields) {
      if (!currentPassword) {
        setError('Please enter your current password to confirm changes.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        companyOrTitle: companyOrTitle.trim(),
        avatarUrl: avatarUrl.trim(),
      };

      if (showPasswordFields && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setSuccess('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account Settings
            </span>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '2px', fontWeight: 800 }}>
              Profile & Security
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: 'var(--risk-critical-bg)',
            border: '1px solid var(--risk-critical-border)',
            borderRadius: '8px',
            padding: '10px 12px',
            color: 'var(--risk-critical-text)',
            fontSize: '0.8rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'var(--risk-safe-bg)',
            border: '1px solid var(--risk-safe-border)',
            borderRadius: '8px',
            padding: '10px 12px',
            color: 'var(--risk-safe-text)',
            fontSize: '0.8rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar & Role Header Card */}
          <div style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '18px',
          }}>
            {/* Avatar Preview */}
            <div style={{ position: 'relative' }}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ffffff',
                  }}
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                }}>
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name || user?.name}
                </span>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Avatar Presets or URL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Camera size={13} /> Profile Photo / Avatar
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {avatarPresets.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt={`Preset ${idx + 1}`}
                  onClick={() => setAvatarUrl(preset)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    objectFit: 'cover',
                    border: avatarUrl === preset ? '2px solid #ffffff' : '1px solid var(--border-subtle)',
                    opacity: avatarUrl === preset ? 1 : 0.6,
                    transition: 'all 0.15s ease',
                  }}
                  title="Select photo preset"
                />
              ))}
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
            <input
              type="url"
              className="input-field"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            />
          </div>

          {/* Full Legal Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Full Legal Name (For Signatures & Contracts)
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Your Full Legal Name"
              required
              id="input-profile-name"
            />
          </div>

          {/* Company / Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Organization or Professional Title
            </label>
            <input
              type="text"
              className="input-field"
              value={companyOrTitle}
              onChange={(e) => setCompanyOrTitle(e.target.value)}
              placeholder="e.g. Independent Software Consultant / Acme Corp"
              id="input-profile-title"
            />
          </div>

          {/* Password Section Toggle */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '14px',
            marginBottom: '16px',
          }}>
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              style={{
                background: 'transparent',
                border: 'none',
                color: showPasswordFields ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
              }}
              id="btn-toggle-change-password"
            >
              <KeyRound size={14} />
              <span>{showPasswordFields ? 'Cancel Password Change' : 'Change Password'}</span>
            </button>

            {showPasswordFields && (
              <div style={{
                marginTop: '12px',
                padding: '14px',
                borderRadius: '8px',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to verify"
                    id="input-current-password"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    New Password (Min 6 Characters)
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    id="input-new-password"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    id="input-confirm-password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="btn-save-profile"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
