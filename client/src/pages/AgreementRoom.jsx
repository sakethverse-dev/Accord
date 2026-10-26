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
  Filter,
  Sparkles,
  Columns,
  FileText,
  Zap,
  RefreshCw,
  Send,
  RotateCcw,
  XCircle,
  Download
} from 'lucide-react';
import { downloadAgreementPdf } from '../services/pdfService';

export const AgreementRoom = ({ agreementId, onBack }) => {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tab view: 'doc' (Master Document & Compromises) | 'compare' (Side-by-Side Drafts) | 'input' (Submit Counter-Draft)
  const [activeRoomTab, setActiveRoomTab] = useState('doc');

  // Clause filter: 'all' or 'flagged'
  const [viewFilter, setViewFilter] = useState('all');

  // Counter draft input state
  const [counterDraftInput, setCounterDraftInput] = useState('');

  // Modals state
  const [proposalClause, setProposalClause] = useState(null);
  const [diffClause, setDiffClause] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!agreement) return;
    setDownloadingPdf(true);
    try {
      await downloadAgreementPdf(agreement);
    } catch (err) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const data = await api.agreements.getById(agreementId);
      setAgreement(data);
      if (data.partyBDraft?.text) {
        setCounterDraftInput(data.partyBDraft.text);
      }
    } catch (err) {
      console.error('Failed to load agreement:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgreementSilently = async () => {
    try {
      const data = await api.agreements.getById(agreementId);
      setAgreement(data);
    } catch (err) {
      // silent background sync
    }
  };

  useEffect(() => {
    fetchAgreement();
    // Real-Time Background Synchronization: poll every 3 seconds so both screens stay in sync
    const pollInterval = setInterval(() => {
      if (!proposalClause && !diffClause && !showSignModal && !showCertModal && activeRoomTab !== 'input') {
        fetchAgreementSilently();
      }
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [agreementId, proposalClause, diffClause, showSignModal, showCertModal, activeRoomTab]);

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

  const handleAdoptCompromise = async (clauseId) => {
    setActionLoading(true);
    try {
      await api.proposals.adoptCompromise(agreementId, clauseId);
      await fetchAgreement();
    } catch (err) {
      alert(`Error adopting compromise: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawSignature = async (reason = '') => {
    if (!window.confirm('Are you sure you want to unfreeze this agreement? This will clear active signatures and return the room to negotiation.')) {
      return;
    }
    setActionLoading(true);
    try {
      await api.signatures.withdrawSignature(agreementId, reason);
      await fetchAgreement();
    } catch (err) {
      alert(`Error unfreezing agreement: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompareDrafts = async (draftText) => {
    setActionLoading(true);
    try {
      await api.agreements.compareDrafts(agreementId, { draftText });
      await fetchAgreement();
      setActiveRoomTab('doc');
    } catch (err) {
      alert(`AI Comparison error: ${err.message}`);
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

  // CORE IMMUTABILITY RULES:
  // Once ANY person has signed, the contract terms are FROZEN for both parties!
  const isLocked = agreement.status === 'FULLY_EXECUTED_LOCKED';
  const hasAnySigned = agreement.signatures && agreement.signatures.length > 0;
  const isTermsFrozen = isLocked || hasAnySigned;

  const hasUserSigned = agreement.signatures?.some((s) => s.signedBy?._id === user?._id || s.signedBy === user?._id);
  const pendingProposals = agreement.proposals?.filter((p) => p.status === 'PENDING') || [];
  const criticalCount = agreement.clauses?.filter((c) => c.riskLevel === 'CRITICAL' && c.status !== 'RESOLVED').length || 0;
  const warningCount = agreement.clauses?.filter((c) => c.riskLevel === 'WARNING' && c.status !== 'RESOLVED').length || 0;
  const flaggedCount = criticalCount + warningCount;

  const firstSigner = agreement.signatures?.[0];

  // Filter clauses based on viewFilter toggle
  const visibleClauses = (agreement.clauses || []).filter((clause) => {
    if (viewFilter === 'flagged') {
      return (clause.riskLevel === 'CRITICAL' || clause.riskLevel === 'WARNING') && clause.status !== 'RESOLVED';
    }
    return true;
  });

  const refId = `PF-${agreement._id.slice(-8).toUpperCase()}`;

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Header Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Left: Breadcrumbs & Document Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span 
              onClick={onBack} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              className="hover:underline"
            >
              <ArrowLeft size={13} /> Agreements
            </span>
            <ChevronRight size={13} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{refId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {agreement.title}
            </h1>
            <span className={`badge ${isLocked ? 'badge-safe' : hasAnySigned ? 'badge-warning' : criticalCount > 0 ? 'badge-critical' : 'badge-primary'}`}>
              {isLocked 
                ? 'Executed & Sealed' 
                : hasAnySigned 
                  ? 'Signing in Progress (Terms Frozen)' 
                  : criticalCount > 0 
                    ? `${criticalCount} Policy Conflicts` 
                    : 'Terms Aligned'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyInvite}
            title="Share agreement room link with counterparty"
            id="btn-share-room"
          >
            {copiedLink ? <Check size={13} color="var(--risk-safe)" /> : <Share2 size={13} />}
            {copiedLink ? 'Link Copied to Clipboard' : 'Share Room Link'}
          </button>

          {isLocked ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCertModal(true)}
                id="btn-view-certificate"
              >
                <ShieldCheck size={14} />
                <span>Certificate</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                id="btn-download-pdf-header"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
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

      {/* 2. Collaborative Negotiation Workflow Steps Ribbon */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: agreement.partyBDraft?.text ? 'var(--risk-safe-bg)' : 'var(--accent-bg)',
              color: agreement.partyBDraft?.text ? 'var(--risk-safe-text)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}>
              1
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Two Drafts Submitted</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {agreement.partyBDraft?.text ? 'Party A & Party B versions active' : 'Awaiting Party B counter-draft'}
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-dim)' }}>→</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: criticalCount === 0 ? 'var(--risk-safe-bg)' : 'var(--risk-warning-bg)',
              color: criticalCount === 0 ? 'var(--risk-safe-text)' : 'var(--risk-warning-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}>
              2
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Difference Analysis</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {criticalCount === 0 ? 'All differences reconciled' : `${criticalCount} conflicting terms flagged`}
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-dim)' }}>→</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: isLocked ? 'var(--risk-safe-bg)' : hasAnySigned ? 'var(--accent-bg)' : 'var(--bg-muted)',
              color: isLocked ? 'var(--risk-safe-text)' : hasAnySigned ? 'var(--accent)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}>
              3
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Immutable Signing & Seal</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {isLocked ? 'Cryptographically Sealed' : hasAnySigned ? 'Signed by Party 1 (Terms Frozen)' : 'Awaiting mutual execution'}
              </div>
            </div>
          </div>
        </div>

        {/* Room View Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-muted)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          gap: '3px',
        }}>
          <button
            onClick={() => setActiveRoomTab('doc')}
            style={{
              background: activeRoomTab === 'doc' ? 'var(--bg-surface)' : 'transparent',
              color: activeRoomTab === 'doc' ? 'var(--text-main)' : 'var(--text-muted)',
              border: activeRoomTab === 'doc' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <FileText size={13} />
            <span>Master Agreement</span>
          </button>

          <button
            onClick={() => setActiveRoomTab('compare')}
            style={{
              background: activeRoomTab === 'compare' ? 'var(--bg-surface)' : 'transparent',
              color: activeRoomTab === 'compare' ? 'var(--text-main)' : 'var(--text-muted)',
              border: activeRoomTab === 'compare' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Columns size={13} />
            <span>Side-by-Side Drafts</span>
          </button>

          <button
            onClick={() => setActiveRoomTab('input')}
            style={{
              background: activeRoomTab === 'input' ? 'var(--bg-surface)' : 'transparent',
              color: activeRoomTab === 'input' ? 'var(--text-main)' : 'var(--text-muted)',
              border: activeRoomTab === 'input' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Edit3 size={13} />
            <span>Submit / Edit Draft</span>
          </button>
        </div>
      </div>

      {/* 3. STRICT IMMUTABILITY NOTICE BANNER (If any party has signed) */}
      {isTermsFrozen && (
        <div style={{
          background: isLocked ? 'var(--risk-safe-bg)' : 'rgba(234, 179, 8, 0.1)',
          border: `1px solid ${isLocked ? 'var(--risk-safe-border)' : 'rgba(234, 179, 8, 0.3)'}`,
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <Lock size={20} color={isLocked ? 'var(--risk-safe)' : 'var(--risk-warning)'} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {isLocked 
                ? 'Contract Fully Executed & Cryptographically Locked' 
                : 'Contract Terms Legally Frozen for Execution'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isLocked
                ? 'Both parties have signed with legal declarations. Cryptographic SHA-256 seal is permanently applied.'
                : `A digital signature was recorded by ${firstSigner?.signerName || 'Party A'} (${new Date(firstSigner?.signedAt).toLocaleDateString()}). Under legal immutability rules, terms are frozen and cannot be edited by either party. Awaiting counter-party signature.`}
            </div>
          </div>
          
          {/* Actions for locked vs in-progress */}
          {isLocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCertModal(true)}
              >
                <ShieldCheck size={13} /> View Audit Certificate
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                id="btn-download-pdf-banner"
              >
                <Download size={13} /> {downloadingPdf ? 'Generating PDF...' : 'Download Executed Agreement (PDF)'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {hasUserSigned ? (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleWithdrawSignature('Signer requested term renegotiation')}
                  disabled={actionLoading}
                  title="Unfreeze terms to make modifications"
                >
                  <RotateCcw size={12} /> Withdraw Signature & Re-open
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-safe btn-sm"
                    onClick={() => setShowSignModal(true)}
                  >
                    <FileCheck size={13} /> Counter-Sign Agreement
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleWithdrawSignature('Counterparty requested changes to frozen terms')}
                    disabled={actionLoading}
                    style={{ color: 'var(--risk-critical)' }}
                    title="Decline frozen terms and return room to negotiation"
                  >
                    <XCircle size={12} /> Decline & Request Changes
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 1: MASTER AGREEMENT & ACTIVE COMPROMISES
          ========================================================================= */}
      {activeRoomTab === 'doc' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1.1fr)',
          gap: '28px',
          alignItems: 'start',
        }}>
          {/* LEFT: AUTHENTIC LEGAL DOCUMENT PAPER */}
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
                <span>Party B ({agreement.creator?.role === 'client' ? 'Contractor' : 'Client'}): <strong style={{ color: 'var(--text-main)' }}>{agreement.invitedParty?.name || agreement.invitedEmail || 'Awaiting Counterparty'}</strong></span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Document Reference: <span style={{ fontFamily: 'var(--font-mono)' }}>{refId}</span> • Enforced under ESIGN & UETA Framework
              </div>
            </div>

            {/* Filter banner if showing only flagged clauses */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {visibleClauses.map((clause, index) => {
                const isCritical = clause.riskLevel === 'CRITICAL' && clause.status !== 'RESOLVED';
                const isWarning = clause.riskLevel === 'WARNING' && clause.status !== 'RESOLVED';
                const isResolved = clause.status === 'RESOLVED';
                const isModified = clause.currentText !== clause.originalText;
                const hasConflict = clause.hasDraftConflict || isCritical || isWarning;

                const clauseClass = isCritical ? 'clause-item has-critical' : isWarning ? 'clause-item has-warning' : isResolved ? 'clause-item is-resolved' : 'clause-item';

                return (
                  <div key={clause.clauseId} className={clauseClass}>
                    {/* Clause Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
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
                            <CheckCircle2 size={11} /> Compromise Accepted
                          </span>
                        )}
                        {isCritical && (
                          <span className="badge badge-critical">
                            <ShieldAlert size={11} /> Conflicting Term
                          </span>
                        )}
                        {isWarning && (
                          <span className="badge badge-warning">
                            <AlertTriangle size={11} /> Advisory
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Legal Text */}
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      margin: '6px 0 0 0',
                    }}>
                      {clause.currentText}
                    </p>

                    {/* AI Difference Analysis & Compromise Box */}
                    {hasConflict && !isResolved && (
                      <div style={{
                        marginTop: '12px',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Sparkles size={14} color="var(--accent)" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>
                            AI Difference & Compromise Analysis
                          </span>
                        </div>

                        {clause.riskReason && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '10px', fontWeight: 500 }}>
                            {clause.riskReason}
                          </div>
                        )}

                        {/* AI Suggested Balanced Compromise */}
                        {clause.suggestedReplacement && (
                          <div style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            marginBottom: '12px',
                          }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--risk-safe)', fontWeight: 800, marginBottom: '4px' }}>
                              Recommended Balanced Compromise Wording:
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.5 }}>
                              "{clause.suggestedReplacement}"
                            </div>
                          </div>
                        )}

                        {/* Actions: Adopt AI Compromise vs Propose Custom */}
                        {!isTermsFrozen ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {clause.suggestedReplacement && (
                              clause.status === 'PENDING_CONFIRMATION' ? (
                                clause.compromiseAdoptedBy === user?.name ? (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> You adopted compromise. Awaiting counterparty confirmation.
                                  </span>
                                ) : (
                                  <button
                                    className="btn btn-safe btn-sm"
                                    onClick={() => handleAdoptCompromise(clause.clauseId)}
                                    disabled={actionLoading}
                                    id={`btn-confirm-compromise-${clause.clauseId}`}
                                  >
                                    <Check size={12} /> Confirm & Agree with {clause.compromiseAdoptedBy || 'Counterparty'}
                                  </button>
                                )
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleAdoptCompromise(clause.clauseId)}
                                  disabled={actionLoading}
                                  id={`btn-adopt-compromise-${clause.clauseId}`}
                                >
                                  <Zap size={12} />
                                  {actionLoading ? 'Applying...' : 'Adopt AI Compromise'}
                                </button>
                              )
                            )}

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setProposalClause(clause)}
                              id={`btn-propose-${clause.clauseId}`}
                            >
                              <Sparkles size={11} color="#3b82f6" />
                              AI Rewrite / Propose Term
                            </button>

                            {clause.diffTokens && clause.diffTokens.length > 0 && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setDiffClause(clause)}
                              >
                                <GitCompare size={11} /> View Word Diff
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={12} /> Terms locked for signing. Compromises cannot be modified.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Word-level diff viewer link if clause was modified */}
                    {isModified && isResolved && (
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
                          <GitCompare size={12} /> View Revision Diff
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Execution & Counterpart Digital Signatures Box */}
            <div style={{
              marginTop: '48px',
              paddingTop: '28px',
              borderTop: '2px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Execution & Counterpart Signatures:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
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
                        {agreement.invitedParty?.name || agreement.invitedEmail || 'Pending Counterparty'}
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

          {/* RIGHT: STREAMLINED CONTROL CENTER */}
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Consensus & Alignment Status */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Contract Consensus
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: criticalCount === 0 ? 'var(--risk-safe)' : 'var(--risk-critical)' }}>
                  {agreement.alignmentScore}% Aligned
                </span>
              </div>

              <div style={{ width: '100%', height: '6px', background: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{
                  width: `${agreement.alignmentScore}%`,
                  height: '100%',
                  background: agreement.alignmentScore >= 80 ? 'var(--risk-safe)' : agreement.alignmentScore >= 50 ? 'var(--risk-warning)' : 'var(--risk-critical)',
                  transition: 'width 0.3s ease',
                }} />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {criticalCount > 0 ? (
                  <span><strong style={{ color: 'var(--risk-critical)' }}>{criticalCount} policy conflicts</strong> need compromise resolution before execution.</span>
                ) : (
                  <span><strong style={{ color: 'var(--risk-safe)' }}>All core terms aligned.</strong> Both parties may now execute counterpart signatures.</span>
                )}
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
                <button
                  className={`btn btn-sm ${viewFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewFilter('all')}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  All Terms ({agreement.clauses?.length || 0})
                </button>
                <button
                  className={`btn btn-sm ${viewFilter === 'flagged' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewFilter('flagged')}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  Flagged ({flaggedCount})
                </button>
              </div>
            </div>

            {/* Pending Proposals Box */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Active Proposals ({pendingProposals.length})
                </span>
              </div>

              {pendingProposals.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No active compromise proposals pending. Adopt an AI compromise or submit custom wording on any flagged clause.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingProposals.map((prop) => (
                    <div key={prop.proposalId} style={{
                      background: 'var(--bg-muted)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        Proposed by {prop.proposedByName} ({prop.proposedByRole}):
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{prop.proposedText.slice(0, 80)}..."
                      </div>
                      {!isTermsFrozen && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-safe btn-sm"
                            onClick={() => handleProposalRespond(prop.proposalId, 'ACCEPT')}
                            disabled={actionLoading}
                            style={{ flex: 1, padding: '3px 8px', fontSize: '0.7rem' }}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleProposalRespond(prop.proposalId, 'REJECT')}
                            disabled={actionLoading}
                            style={{ flex: 1, padding: '3px 8px', fontSize: '0.7rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TWO-PARTY VERSION COMPARISON (SIDE-BY-SIDE DRAFTS)
          ========================================================================= */}
      {activeRoomTab === 'compare' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Two-Party Version Comparison & Reconciled Terms
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Side-by-side comparison between Party A's initial terms and Party B's counter-draft.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {agreement.clauses?.map((clause, idx) => {
              const textA = clause.partyAText || clause.originalText;
              const textB = clause.partyBText || clause.currentText;
              const isDiff = clause.hasDraftConflict || clause.riskLevel === 'WARNING' || clause.riskLevel === 'CRITICAL' || (Boolean(textB) && textA !== textB);

              return (
                <div key={clause.clauseId} style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '16px',
                  background: isDiff ? 'var(--bg-muted)' : 'var(--bg-surface)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {clause.sectionNumber}: {clause.title}
                    </div>
                    {isDiff ? (
                      <span className="badge badge-warning">
                        <AlertTriangle size={11} /> Terms Differ
                      </span>
                    ) : (
                      <span className="badge badge-safe">
                        <CheckCircle2 size={11} /> Aligned Terms
                      </span>
                    )}
                  </div>

                  {/* Split Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px' }}>
                        Party A ({agreement.creator?.role || 'Creator'}):
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {textA}
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#c084fc', marginBottom: '6px' }}>
                        Party B ({agreement.invitedParty?.role || 'Counterparty'}):
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {textB || 'No counter-draft text submitted yet.'}
                      </div>
                    </div>
                  </div>

                  {/* AI Compromise Option if terms differ */}
                  {isDiff && clause.suggestedReplacement && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--risk-safe)', textTransform: 'uppercase' }}>
                          AI Balanced Compromise:
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', fontStyle: 'italic', marginTop: '2px' }}>
                          "{clause.suggestedReplacement}"
                        </div>
                      </div>

                      {!isTermsFrozen && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAdoptCompromise(clause.clauseId)}
                          disabled={actionLoading}
                        >
                          <Zap size={12} /> Adopt This Compromise
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SUBMIT / EDIT COUNTER-DRAFT
          ========================================================================= */}
      {activeRoomTab === 'input' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '24px',
          maxWidth: '860px',
          margin: '0 auto',
        }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Input & Compare Counterparty Version
              </h3>
              <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} /> Gemini 2.5 Flash
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Paste your organization or freelancer counter-draft below. Google Gemini AI reads both drafts dynamically—with no rigid fixed rules—detects differences, calculates risks, and writes balanced compromises tailored to your exact terms.
            </p>
          </div>

          {isTermsFrozen ? (
            <div style={{
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <Lock size={24} style={{ margin: '0 auto 8px' }} />
              <div>Contract terms are permanently frozen because signature execution has commenced.</div>
            </div>
          ) : (
            <div>
              <textarea
                className="input-field"
                rows={14}
                value={counterDraftInput}
                onChange={(e) => setCounterDraftInput(e.target.value)}
                placeholder="Paste the full text of your counter-draft here..."
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', lineHeight: 1.6 }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleCompareDrafts(counterDraftInput, false)}
                  disabled={actionLoading || !counterDraftInput.trim()}
                >
                  <Zap size={14} />
                  {actionLoading ? 'Analyzing Differences with Gemini AI...' : 'Analyze & Reconcile with Gemini AI'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {proposalClause && (
        <ProposalModal
          clause={proposalClause}
          isOpen={!!proposalClause}
          onClose={() => setProposalClause(null)}
          onSubmitProposal={handleProposalSubmit}
          agreementId={agreementId}
        />
      )}

      {diffClause && (
        <DiffViewerModal
          clause={diffClause}
          isOpen={!!diffClause}
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
          agreement={agreement}
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
