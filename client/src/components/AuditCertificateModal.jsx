import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Copy, Check, Printer, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const AuditCertificateModal = ({ isOpen, onClose, agreement }) => {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  if (!isOpen || !agreement) return null;

  const cryptoSeal = agreement.cryptoSeal || {};
  const hash = cryptoSeal.sha256Hash || 'No cryptographic seal applied yet';

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifySeal = async () => {
    setVerifying(true);
    try {
      const result = await api.agreements.verifySeal(agreement._id);
      setVerificationResult(result);
    } catch (err) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', padding: '32px' }}>
        {/* Certificate Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-safe)',
            }}>
              <ShieldCheck size={26} color="white" />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--risk-safe)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Execution Record
              </span>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', marginTop: '1px' }}>
                Cryptographic Audit Certificate
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)',
        }}>
          {/* Document Title & Meta */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Document Title
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              {agreement.title}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Agreement ID: <code>{agreement._id}</code></span>
              <span>•</span>
              <span>Executed: {cryptoSeal.sealedAt ? new Date(cryptoSeal.sealedAt).toLocaleString() : 'Pending'}</span>
            </div>
          </div>

          {/* SHA-256 Hash Display */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>
                SHA-256 Tamper-Evident Checksum
              </span>
              <button
                onClick={copyHash}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? 'var(--risk-safe)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Hash'}
              </button>
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#34d399',
              wordBreak: 'break-all',
              letterSpacing: '0.04em',
            }}>
              {hash}
            </div>
          </div>

          {/* Signatures List */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>
              Verified Signatures ({agreement.signatures?.length || 0})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {agreement.signatures?.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(10, 15, 29, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--risk-safe)', marginBottom: '4px' }}>
                    <CheckCircle2 size={15} />
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{sig.signerName}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'capitalize', fontWeight: 600 }}>
                    {sig.signerRole}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {sig.signerEmail}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    Signed: {new Date(sig.signedAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    IP: {sig.ipAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Result Toast/Box */}
        {verificationResult && (
          <div style={{
            background: verificationResult.isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${verificationResult.isVerified ? 'var(--risk-safe-border)' : 'var(--risk-critical-border)'}`,
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <ShieldCheck size={20} color={verificationResult.isVerified ? 'var(--risk-safe)' : 'var(--risk-critical)'} />
            <div style={{ fontSize: '0.85rem', color: '#fff' }}>
              <strong>{verificationResult.isVerified ? 'VERIFICATION PASSED:' : 'VERIFICATION FAILED:'}</strong> {verificationResult.reason}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleVerifySeal}
            disabled={verifying}
            id="btn-verify-tamper"
          >
            <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
            {verifying ? 'Verifying Integrity...' : 'Verify Cryptographic Integrity'}
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={14} />
              Print Certificate
            </button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
