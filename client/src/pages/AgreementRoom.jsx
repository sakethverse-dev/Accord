import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProposalModal } from '../components/ProposalModal';
import { DiffViewerModal } from '../components/DiffViewerModal';
import { SignatureModal } from '../components/SignatureModal';
import { AuditCertificateModal } from '../components/AuditCertificateModal';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  Shield,
  Edit3,
  GitCompare,
  AlertTriangle,
  ShieldAlert,
  Lock,
  ChevronRight,
  Filter
} from 'lucide-react';

export const AgreementRoom = ({ agreementId, onBack }) => {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Clause filter: 'all' or 'flagged'
  const [viewFilter, setViewFilter] = useState('all');

  // Modals state
  const [proposalClause, setProposalClause] = useState(null);
  const [diffClause, setDiffClause] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const data = await api.agreements.getById(agreementId);
      setAgreement(data);
    } catch (err) {
      console.error('Failed to load agreement:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreement();
  }, [agreementId]);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/${agreement?.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleProposalSubmit = async (clauseId, payload) => {
    await api.proposals.submit(agreementId, clauseId, payload);
    await fetchAgreement();
  };

  const handleProposalRespond = async (proposalId, action) => {
    setActionLoading(true);
    try {
      await api.proposals.respond(agreementId, proposalId, action);
      await fetchAgreement();
    } catch (err) {
      alert(`Action error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSign = async (signPayload) => {
    await api.signatures.sign(agreementId, signPayload);
    await fetchAgreement();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        Loading agreement workspace...
      </div>
    );
  }

  if (!agreement) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--risk-critical)' }}>Agreement not found or access unauthorized.</p>
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Agreements
        </button>
      </div>
    );
  }

  const isLocked = agreement.status === 'FULLY_EXECUTED_LOCKED';
  const hasUserSigned = agreement.signatures?.some((s) => s.signedBy?._id === user?._id || s.signedBy === user?._id);
  const pendingProposals = agreement.proposals?.filter((p) => p.status === 'PENDING') || [];
  const criticalCount = agreement.clauses?.filter((c) => c.riskLevel === 'CRITICAL' && c.status !== 'RESOLVED').length || 0;
  const warningCount = agreement.clauses?.filter((c) => c.riskLevel === 'WARNING' && c.status !== 'RESOLVED').length || 0;
  const flaggedCount = criticalCount + warningCount;

  // Filter clauses based on viewFilter toggle
  const visibleClauses = (agreement.clauses || []).filter((clause) => {
    if (viewFilter === 'flagged') {
      return (clause.riskLevel === 'CRITICAL' || clause.riskLevel === 'WARNING') && clause.status !== 'RESOLVED';
    }
    return true;
  });

  const refId = `PF-${agreement._id.slice(-8).toUpperCase()}`;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      {/* 1. Clean Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '26px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Left: Breadcrumbs & Document Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <ArrowLeft size={13} /> Agreements
            </span>
            <ChevronRight size={13} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{refId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {agreement.title}
            </h1>
            <span className={`badge ${isLocked ? 'badge-safe' : criticalCount > 0 ? 'badge-critical' : 'badge-primary'}`}>
              {isLocked ? 'Executed & Sealed' : criticalCount > 0 ? `${criticalCount} Policy Conflicts` : 'Terms Aligned'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyInvite}
            title="Share agreement room link"
            id="btn-share-room"
          >
            {copiedLink ? <Check size={13} color="var(--risk-safe)" /> : <Share2 size={13} />}
            {copiedLink ? 'Link Copied' : 'Share Room'}
          </button>

          {isLocked ? (
            <button
              className="btn btn-safe btn-sm"
              onClick={() => setShowCertModal(true)}
              id="btn-view-certificate"
            >
              <ShieldCheck size={14} />
              View Legal Certificate
            </button>
          ) : (
            <button
              className={`btn btn-sm ${hasUserSigned ? 'btn-secondary' : 'btn-safe'}`}
              onClick={() => setShowSignModal(true)}
              disabled={hasUserSigned}
              id="btn-open-sign-modal"
            >
              <FileCheck size={14} />
              {hasUserSigned ? 'Signed (Awaiting Counterparty)' : 'Sign Agreement'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Workspace: Document-First 2-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1.1fr)',
        gap: '28px',
        alignItems: 'start',
      }}>
        {/* =========================================================================
            LEFT COLUMN: AUTHENTIC LEGAL DOCUMENT PAPER
            ========================================================================= */}
        <div className="legal-doc-paper">
          {/* Formal Legal Preamble */}
          <div style={{
            textAlign: 'center',
            paddingBottom: '24px',
            borderBottom: '2px solid var(--border-subtle)',
            marginBottom: '32px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
              Mutual Legal Instrument
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {agreement.title}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>Party A ({agreement.creator?.role === 'client' ? 'Client' : 'Contractor'}): <strong style={{ color: 'var(--text-main)' }}>{agreement.creator?.name}</strong></span>
              <span>•</span>
              <span>Party B ({agreement.creator?.role === 'client' ? 'Contractor' : 'Client'}): <strong style={{ color: 'var(--text-main)' }}>{agreement.invitedParty?.name || (agreement.creator?.role === 'client' ? 'Alex Rivera' : 'Sarah Chen')}</strong></span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Document Reference: <span style={{ fontFamily: 'var(--font-mono)' }}>{refId}</span> • Enforced under ESIGN & UETA Framework
            </div>
          </div>

          {/* If filtering by flagged only */}
          {viewFilter === 'flagged' && (
            <div style={{
              background: 'var(--risk-warning-bg)',
              border: '1px solid var(--risk-warning-border)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--risk-warning-text)',
            }}>
              <span>Filtering: Showing only <strong>{visibleClauses.length} flagged clauses</strong> requiring review.</span>
              <button
                onClick={() => setViewFilter('all')}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Show All Clauses
              </button>
            </div>
          )}

          {/* Clauses Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {visibleClauses.map((clause, index) => {
              const isCritical = clause.riskLevel === 'CRITICAL' && clause.status !== 'RESOLVED';
              const isWarning = clause.riskLevel === 'WARNING' && clause.status !== 'RESOLVED';
              const isResolved = clause.status === 'RESOLVED';
              const isModified = clause.currentText !== clause.originalText;

              const clauseClass = isCritical ? 'clause-item has-critical' : isWarning ? 'clause-item has-warning' : isResolved ? 'clause-item is-resolved' : 'clause-item';

              return (
                <div key={clause.clauseId} className={clauseClass}>
                  {/* Clause Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {clause.sectionNumber || `Section ${index + 1}`}.
                      </span>
                      <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {clause.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isResolved && (
                        <span className="badge badge-safe">
                          <CheckCircle2 size={11} /> Amended & Agreed
                        </span>
                      )}
                      {isCritical && (
                        <span className="badge badge-critical">
                          <ShieldAlert size={11} /> Conflict
                        </span>
                      )}
                      {isWarning && (
                        <span className="badge badge-warning">
                          <AlertTriangle size={11} /> Advisory
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Legal Prose */}
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    margin: '6px 0 0 0',
                  }}>
                    {clause.currentText}
                  </p>

                  {/* Sleek Policy Audit Flag */}
                  {(isCritical || isWarning) && (
                    <div className={`clause-audit-note ${isCritical ? 'critical' : 'warning'}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        {isCritical ? (
                          <ShieldAlert size={14} color="var(--risk-critical)" style={{ flexShrink: 0 }} />
                        ) : (
                          <AlertTriangle size={14} color="var(--risk-warning)" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                          {clause.riskReason}
                        </span>
                      </div>

                      {!isLocked && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setProposalClause(clause)}
                          style={{ padding: '4px 10px', fontSize: '0.72rem', flexShrink: 0 }}
                          id={`btn-propose-${clause.clauseId}`}
                        >
                          <Edit3 size={11} />
                          Propose Compromise
                        </button>
                      )}
                    </div>
                  )}

                  {/* Word-level diff viewer link if clause was modified */}
                  {isModified && (
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setDiffClause(clause)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <GitCompare size={12} />
                        View word-level amendment diff
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formal Legal Execution Block */}
          <div style={{
            marginTop: '44px',
            paddingTop: '28px',
            borderTop: '2px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Execution & Counterpart Signatures:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {/* Party A */}
              {(() => {
                const sigPartyA = agreement.signatures?.find(s => s.signerRole === 'freelancer' || s.signedBy?._id === agreement.creator?._id || s.signedBy === agreement.creator?._id);
                return (
                  <div style={{
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Party A ({agreement.creator?.role === 'client' ? 'Client' : 'Contractor'})
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                      {agreement.creator?.name}
                    </div>

                    {sigPartyA ? (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          marginBottom: '8px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          {sigPartyA.signatureImage ? (
                            <img src={sigPartyA.signatureImage} alt="Digital Signature" style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.6rem', color: '#0f172a' }}>{sigPartyA.signerName}</span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--risk-safe-text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} color="var(--risk-safe)" /> Digitally Signed & Affirmed
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(sigPartyA.signedAt).toLocaleString()} • IP: {sigPartyA.ipAddress || '127.0.0.1'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} />
                        <span>Awaiting Digital Signature</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Party B */}
              {(() => {
                const sigPartyB = agreement.signatures?.find(s => s.signerRole === 'client' || (agreement.invitedParty && (s.signedBy?._id === agreement.invitedParty?._id || s.signedBy === agreement.invitedParty?._id)));
                return (
                  <div style={{
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Party B ({agreement.creator?.role === 'client' ? 'Contractor' : 'Client'})
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                      {agreement.invitedParty?.name || (agreement.creator?.role === 'client' ? 'Alex Rivera' : 'Sarah Chen')}
                    </div>

                    {sigPartyB ? (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          marginBottom: '8px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          {sigPartyB.signatureImage ? (
                            <img src={sigPartyB.signatureImage} alt="Digital Signature" style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.6rem', color: '#0f172a' }}>{sigPartyB.signerName}</span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--risk-safe-text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} color="var(--risk-safe)" /> Digitally Signed & Affirmed
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(sigPartyB.signedAt).toLocaleString()} • IP: {sigPartyB.ipAddress || '127.0.0.1'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} />
                        <span>Awaiting Digital Signature</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* If Fully Executed Seal */}
            {isLocked && agreement.cryptoSeal?.sha256Hash && (
              <div style={{
                marginTop: '18px',
                background: 'var(--risk-safe-bg)',
                border: '1px solid var(--risk-safe-border)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="var(--risk-safe)" />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--risk-safe-text)' }}>
                      Cryptographically Sealed Agreement
                    </div>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--risk-safe-text)' }}>
                      SHA-256: {agreement.cryptoSeal.sha256Hash}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCertModal(true)}
                  style={{ background: '#ffffff', fontSize: '0.72rem' }}
                >
                  View Audit Certificate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: STREAMLINED CONTRACT CONTROL CENTER (STICKY)
            ========================================================================= */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Consensus & Alignment Status */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Contract Consensus
              </span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: isLocked || agreement.alignmentScore >= 80 ? 'var(--risk-safe)' : 'var(--risk-critical)',
              }}>
                {agreement.alignmentScore}% Aligned
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: 'var(--bg-muted)',
              overflow: 'hidden',
              marginBottom: '10px',
            }}>
              <div style={{
                width: `${agreement.alignmentScore || 0}%`,
                height: '100%',
                background: isLocked || agreement.alignmentScore >= 80 
                  ? 'var(--risk-safe)' 
                  : agreement.alignmentScore >= 60 
                    ? 'var(--risk-warning)' 
                    : 'var(--risk-critical)',
                transition: 'width 0.3s ease',
              }} />
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {criticalCount > 0 ? (
                <span><strong style={{ color: 'var(--risk-critical)' }}>{criticalCount} policy conflicts</strong> need compromise resolution before execution.</span>
              ) : (
                <span>All terms meet mutual policy baselines. Contract is ready for legal signing.</span>
              )}
            </div>

            {/* Quick Filter: All Clauses vs Flagged Only */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              marginTop: '14px',
              background: 'var(--bg-muted)',
              padding: '3px',
              borderRadius: '8px',
            }}>
              <button
                onClick={() => setViewFilter('all')}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewFilter === 'all' ? 'var(--bg-surface)' : 'transparent',
                  color: viewFilter === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: viewFilter === 'all' ? 700 : 500,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  boxShadow: viewFilter === 'all' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                All Terms ({agreement.clauses?.length || 8})
              </button>

              <button
                onClick={() => setViewFilter('flagged')}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewFilter === 'flagged' ? 'var(--bg-surface)' : 'transparent',
                  color: viewFilter === 'flagged' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: viewFilter === 'flagged' ? 700 : 500,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  boxShadow: viewFilter === 'flagged' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Flagged ({flaggedCount})
              </button>
            </div>
          </div>

          {/* Card 2: Active Compromise Proposals */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Pending Proposals ({pendingProposals.length})
              </span>
            </div>

            {pendingProposals.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                No active compromise proposals pending. Click <em>Propose Compromise</em> on any flagged clause to submit revised wording.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingProposals.map((proposal) => {
                  const targetClause = agreement.clauses?.find((c) => c.clauseId === proposal.clauseId);
                  const isCreator = proposal.proposedBy?._id === user?._id || proposal.proposedBy === user?._id;

                  return (
                    <div
                      key={proposal._id}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-muted)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {targetClause?.sectionNumber}: {targetClause?.title}
                        </strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700 }}>
                          {isCreator ? 'You proposed' : 'Partner proposed'}
                        </span>
                      </div>

                      <div style={{
                        background: 'var(--bg-surface)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        marginBottom: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        "{proposal.proposedText}"
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setDiffClause({ ...targetClause, currentText: proposal.proposedText })}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          View Diff
                        </button>

                        {!isCreator && !isLocked && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleProposalRespond(proposal._id, 'REJECT')}
                              disabled={actionLoading}
                              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                            >
                              Reject
                            </button>
                            <button
                              className="btn btn-safe btn-sm"
                              onClick={() => handleProposalRespond(proposal._id, 'ACCEPT')}
                              disabled={actionLoading}
                              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                              id={`btn-accept-proposal-${proposal._id}`}
                            >
                              Accept Terms
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Execution & Enforced Policies */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Audited Policy Standards:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Payment Window</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Net-{user?.policyProfile?.maxPaymentDays || 30} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liability Ceiling</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>1x Fees Paid</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>IP Assignment</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Upon Full Payment</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Non-Compete Terms</span>
                <span style={{ color: 'var(--risk-safe-text)', fontWeight: 700 }}>Strictly Prohibited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {proposalClause && (
        <ProposalModal
          clause={proposalClause}
          isOpen={Boolean(proposalClause)}
          onClose={() => setProposalClause(null)}
          onSubmitProposal={handleProposalSubmit}
        />
      )}

      {diffClause && (
        <DiffViewerModal
          clause={diffClause}
          isOpen={Boolean(diffClause)}
          onClose={() => setDiffClause(null)}
        />
      )}

      {showSignModal && (
        <SignatureModal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
          onSign={handleSign}
          agreementTitle={agreement.title}
        />
      )}

      {showCertModal && (
        <AuditCertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          agreement={agreement}
        />
      )}
    </div>
  );
};
