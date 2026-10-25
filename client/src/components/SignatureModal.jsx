import React, { useState } from 'react';
import { X, Lock, FileCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignatureModal = ({ isOpen, onClose, onSign, agreementTitle }) => {
  const { user } = useAuth();
  const [signerName, setSignerName] = useState(user?.name || '');
  const [affirmationChecked, setAffirmationChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!affirmationChecked || !signerName.trim()) return;

    setLoading(true);
    try {
      await onSign({
        signerName: signerName.trim(),
        affirmationChecked,
      });
      onClose();
    } catch (err) {
      alert(`Signature execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '26px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'var(--risk-safe-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--risk-safe-border)',
            }}>
              <FileCheck size={20} color="var(--risk-safe)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
                Digital Contract Execution
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ESIGN & eIDAS legally binding electronic signature
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          background: 'rgba(10, 16, 30, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '16px',
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          Executing: <strong style={{ color: '#fff' }}>"{agreementTitle}"</strong>.
          Upon signature by both parties, this agreement is sealed with an immutable SHA-256 hash.
        </div>

        <form onSubmit={handleSubmit}>
          {/* Signer Legal Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Full Legal Signer Name
            </label>
            <input
              type="text"
              className="input-field"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
              id="input-signer-name"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600 }}
            />
          </div>

          {/* Signer Meta Details (Responsive wrap) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px',
            marginBottom: '16px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            background: 'rgba(8, 12, 22, 0.6)',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Signer Role: </span>
              <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{user?.role}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Verified ID: </span>
              <strong style={{ color: '#fff' }}>{user?.email}</strong>
            </div>
          </div>

          {/* Mandatory Affirmation Checkbox */}
          <div style={{
            background: 'var(--risk-safe-bg)',
            border: '1px solid var(--risk-safe-border)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="checkbox-legal-affirmation"
                checked={affirmationChecked}
                onChange={(e) => setAffirmationChecked(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--risk-safe)' }}
                required
              />
              <span style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                I hereby declare under penalty of perjury that I have reviewed the terms of this agreement and intend this electronic signature to be legally binding and effective.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-safe"
              disabled={loading || !affirmationChecked || !signerName.trim()}
              id="btn-confirm-sign"
            >
              <Lock size={14} />
              {loading ? 'Affixing Seal...' : 'Sign & Execute Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
