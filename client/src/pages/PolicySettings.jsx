import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sliders, CheckCircle, ArrowLeft, Save, ShieldCheck } from 'lucide-react';

export const PolicySettings = ({ onBack }) => {
  const { user, updatePolicy } = useAuth();
  const currentPolicy = user?.policyProfile || {};

  const [maxPaymentDays, setMaxPaymentDays] = useState(currentPolicy.maxPaymentDays || 30);
  const [maxLiabilityCap, setMaxLiabilityCap] = useState(currentPolicy.maxLiabilityCap || '1x_fees');
  const [ipTransferCondition, setIpTransferCondition] = useState(currentPolicy.ipTransferCondition || 'upon_full_payment');
  const [nonCompeteAllowed, setNonCompeteAllowed] = useState(currentPolicy.nonCompeteAllowed || false);
  const [bugWarrantyDays, setBugWarrantyDays] = useState(currentPolicy.bugWarrantyDays || 14);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updatePolicy({
        maxPaymentDays: Number(maxPaymentDays),
        maxLiabilityCap,
        ipTransferCondition,
        nonCompeteAllowed: Boolean(nonCompeteAllowed),
        bugWarrantyDays: Number(bugWarrantyDays),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save policy: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '28px 0 60px', maxWidth: '780px' }}>
      {/* Back button */}
      <button
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ marginBottom: '18px' }}
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)',
          }}>
            <Sliders size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', color: '#fff', fontWeight: 800 }}>
              Safety Policy Preferences
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deterministic baseline rules used to automatically evaluate incoming contracts and flag deviations.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          background: 'var(--risk-safe-bg)',
          border: '1px solid var(--risk-safe-border)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6ee7b7',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={16} color="var(--risk-safe)" />
          Safety policies successfully saved and applied to your profile!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave}>
        {/* 1. Payment Terms */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', color: '#fff' }}>
                1. Maximum Allowable Payment Window
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Contracts with longer payment windows (e.g. Net-60 or Net-90) will be flagged as critical risks.
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
              Net-{maxPaymentDays} Days
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '8px', marginTop: '12px' }}>
            {[15, 30, 45, 60].map((days) => (
              <button
                type="button"
                key={days}
                onClick={() => setMaxPaymentDays(days)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: maxPaymentDays === days ? 'rgba(79, 70, 229, 0.3)' : 'rgba(10, 16, 30, 0.7)',
                  border: maxPaymentDays === days ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  color: maxPaymentDays === days ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                }}
              >
                Net-{days}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Liability Cap */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '3px' }}>
            2. Limitation of Liability Preference
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Specify the maximum financial damages ceiling you will accept.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: maxLiabilityCap === '1x_fees' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(10, 16, 30, 0.7)',
              border: maxLiabilityCap === '1x_fees' ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="liability"
                checked={maxLiabilityCap === '1x_fees'}
                onChange={() => setMaxLiabilityCap('1x_fees')}
                style={{ accentColor: 'var(--primary-light)' }}
              />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                  Capped at Total Fees Paid (100%)
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Standard industry limit protecting contractor
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: maxLiabilityCap === 'unlimited_never' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(10, 16, 30, 0.7)',
              border: maxLiabilityCap === 'unlimited_never' ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="liability"
                checked={maxLiabilityCap === 'unlimited_never'}
                onChange={() => setMaxLiabilityCap('unlimited_never')}
                style={{ accentColor: 'var(--primary-light)' }}
              />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                  Strict Ban on Unlimited Liability
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Flags any uncapped indemnity as critical block
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 3. Intellectual Property Assignment */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '3px' }}>
            3. Intellectual Property Transfer Condition
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            When does ownership of code and deliverables legally transfer to the client?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: ipTransferCondition === 'upon_full_payment' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(10, 16, 30, 0.7)',
              border: ipTransferCondition === 'upon_full_payment' ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="ipTransfer"
                checked={ipTransferCondition === 'upon_full_payment'}
                onChange={() => setIpTransferCondition('upon_full_payment')}
                style={{ accentColor: 'var(--primary-light)' }}
              />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                  Upon Receipt of Full Payment
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Protects contractor leverage until invoice is cleared
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: ipTransferCondition === 'immediate_on_delivery' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(10, 16, 30, 0.7)',
              border: ipTransferCondition === 'immediate_on_delivery' ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="ipTransfer"
                checked={ipTransferCondition === 'immediate_on_delivery'}
                onChange={() => setIpTransferCondition('immediate_on_delivery')}
                style={{ accentColor: 'var(--primary-light)' }}
              />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                  Immediate Transfer on Inception
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Standard corporate client preference
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 4. Non-Compete Policy */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', color: '#fff' }}>
                4. Refuse Restrictive Non-Compete Clauses
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Automatically flags clauses that prohibit working with other technology or industry clients.
              </p>
            </div>
            <input
              type="checkbox"
              checked={!nonCompeteAllowed}
              onChange={(e) => setNonCompeteAllowed(!e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--primary-light)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
          </div>
        </div>

        {/* 5. Bug Warranty Duration */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', color: '#fff' }}>
                5. Standard Bug-Fix Warranty Support
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Free post-delivery bug remediation window. Contracts asking for 6-12 months will be flagged.
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
              {bugWarrantyDays} Days
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '8px', marginTop: '12px' }}>
            {[7, 14, 30, 60].map((days) => (
              <button
                type="button"
                key={days}
                onClick={() => setBugWarrantyDays(days)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: bugWarrantyDays === days ? 'rgba(79, 70, 229, 0.3)' : 'rgba(10, 16, 30, 0.7)',
                  border: bugWarrantyDays === days ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  color: bugWarrantyDays === days ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                }}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            id="btn-save-policy"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Safety Policies'}
          </button>
        </div>
      </form>
    </div>
  );
};
