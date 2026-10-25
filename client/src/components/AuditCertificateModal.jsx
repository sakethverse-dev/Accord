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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '26px' }}>
        {/* Certificate Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--risk-safe-text)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Legal Record of Execution
              </span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '1px', fontWeight: 800 }}>
                Cryptographic Audit Certificate
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Card */}
        <div style={{
          background: 'var(--bg-muted)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '18px',
        }}>
          {/* Document Title & Meta */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Document Title
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {agreement.title}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>Agreement ID: <code>{agreement._id}</code></span>
              <span>•</span>
              <span>Executed: {cryptoSeal.sealedAt ? new Date(cryptoSeal.sealedAt).toLocaleString() : 'Pending'}</span>
            </div>
          </div>

          {/* SHA-256 Hash Display */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 800 }}>
                SHA-256 Tamper-Evident Checksum
              </span>
              <button
                onClick={copyHash}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? 'var(--risk-safe-text)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy Hash'}
              </button>
            </div>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--risk-safe-text)',
              wordBreak: 'break-all',
              letterSpacing: '0.03em',
              fontWeight: 700,
            }}>
              {hash}
            </div>
          </div>

          {/* Signatures List (Responsive Grid) */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
              Verified Signatures ({agreement.signatures?.length || 0})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {agreement.signatures?.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--risk-safe-text)', marginBottom: '3px' }}>
                    <CheckCircle2 size={13} />
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{sig.signerName}</strong>
                  </div>

                  {/* Signature visual stamp */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    margin: '6px 0',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {sig.signatureImage ? (
                      <img src={sig.signatureImage} alt="Signature Stamp" style={{ maxHeight: '32px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', color: '#0f172a' }}>{sig.signerName}</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'capitalize', fontWeight: 700 }}>
                    {sig.signerRole}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {sig.signerEmail}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {new Date(sig.signedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Result Toast/Box */}
        {verificationResult && (
          <div style={{
            background: verificationResult.isVerified ? 'var(--risk-safe-bg)' : 'var(--risk-critical-bg)',
            border: `1px solid ${verificationResult.isVerified ? 'var(--risk-safe-border)' : 'var(--risk-critical-border)'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldCheck size={18} color={verificationResult.isVerified ? 'var(--risk-safe-text)' : 'var(--risk-critical-text)'} />
            <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
              <strong>{verificationResult.isVerified ? 'VERIFICATION PASSED:' : 'VERIFICATION FAILED:'}</strong> {verificationResult.reason}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleVerifySeal}
            disabled={verifying}
            id="btn-verify-tamper"
          >
            <RefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
            {verifying ? 'Verifying Integrity...' : 'Verify Cryptographic Integrity'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={13} />
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
