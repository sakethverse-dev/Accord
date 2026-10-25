import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RiskMeter } from '../components/RiskMeter';
import { ClauseCard } from '../components/ClauseCard';
import { ProposalModal } from '../components/ProposalModal';
import { DiffViewerModal } from '../components/DiffViewerModal';
import { SignatureModal } from '../components/SignatureModal';
import { AuditCertificateModal } from '../components/AuditCertificateModal';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Lock, 
  ShieldCheck, 
  FileCheck, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  Users,
  AlertTriangle
} from 'lucide-react';

export const AgreementRoom = ({ agreementId, onBack }) => {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [proposalClause, setProposalClause] = useState(null);
  const [diffClause, setDiffClause] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgreement = async () => {
    try {
      const data = await api.agreements.getById(agreementId);
      setAgreement(data);
    } catch (err) {
      console.error('Failed to load agreement room:', err.message);
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
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        Loading secure agreement room...
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: '#f87171' }}>Agreement room could not be found or access is unauthorized.</p>
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isLocked = agreement.status === 'FULLY_EXECUTED_LOCKED';
  const hasUserSigned = agreement.signatures?.some((s) => s.signedBy?._id === user?._id || s.signedBy === user?._id);
  const pendingProposals = agreement.proposals?.filter((p) => p.status === 'PENDING') || [];

  // Filter clauses
  const filteredClauses = (agreement.clauses || []).filter((clause) => {
    if (filter === 'CRITICAL') return clause.riskLevel === 'CRITICAL' && clause.status !== 'RESOLVED';
    if (filter === 'WARNING') return clause.riskLevel === 'WARNING' && clause.status !== 'RESOLVED';
    if (filter === 'RESOLVED') return clause.status === 'RESOLVED';
    return true;
  });

  const criticalCount = agreement.clauses?.filter((c) => c.riskLevel === 'CRITICAL' && c.status !== 'RESOLVED').length || 0;
  const warningCount = agreement.clauses?.filter((c) => c.riskLevel === 'WARNING' && c.status !== 'RESOLVED').length || 0;
  const resolvedCount = agreement.clauses?.filter((c) => c.status === 'RESOLVED').length || 0;

  return (
    <div className="container" style={{ padding: '24px 0 60px' }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Left: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            id="btn-back-dashboard"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.45rem', color: '#fff' }}>
                {agreement.title}
              </h2>
              <span className={`badge ${isLocked ? 'badge-safe' : 'badge-primary'}`}>
                {isLocked ? '🔒 Fully Executed & Sealed' : agreement.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Creator: <strong style={{ color: '#fff' }}>{agreement.creator?.name}</strong> • Counterparty: <strong style={{ color: '#fff' }}>{agreement.invitedParty?.name || 'Awaiting Partner'}</strong>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Share Invite */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyInvite}
            id="btn-copy-invite"
            title="Copy invitation link for counter-party"
          >
            {copiedLink ? <Check size={14} color="var(--risk-safe)" /> : <Share2 size={14} />}
            {copiedLink ? 'Link Copied!' : 'Share Room Link'}
          </button>

          {/* Certificate Trigger (If locked) */}
          {isLocked ? (
            <button
              className="btn btn-safe btn-sm"
              onClick={() => setShowCertModal(true)}
              id="btn-view-certificate"
            >
              <ShieldCheck size={15} />
              View Cryptographic Certificate
            </button>
          ) : (
            <button
              className={`btn btn-sm ${hasUserSigned ? 'btn-secondary' : 'btn-safe'}`}
              onClick={() => setShowSignModal(true)}
              disabled={hasUserSigned}
              id="btn-sign-agreement-room"
            >
              <FileCheck size={15} />
              {hasUserSigned ? 'Signed (Awaiting Counterparty)' : 'Sign Agreement'}
            </button>
          )}
        </div>
      </div>

      {/* Hero Risk Meter */}
      <div style={{ marginBottom: '24px' }}>
        <RiskMeter
          alignmentScore={agreement.alignmentScore}
          criticalCount={criticalCount}
          warningCount={warningCount}
          totalClauses={agreement.clauses?.length || 0}
        />
      </div>

      {/* Main Split Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Left Column: Clause Review Stream */}
        <div>
          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '6px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={() => setFilter('ALL')}
              style={{
                background: filter === 'ALL' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: filter === 'ALL' ? '#fff' : 'var(--text-muted)',
                border: filter === 'ALL' ? '1px solid var(--primary)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Clauses ({agreement.clauses?.length || 0})
            </button>

            <button
              onClick={() => setFilter('CRITICAL')}
              style={{
                background: filter === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: filter === 'CRITICAL' ? '#f87171' : 'var(--text-muted)',
                border: filter === 'CRITICAL' ? '1px solid var(--risk-critical)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Critical Risks ({criticalCount})
            </button>

            <button
              onClick={() => setFilter('WARNING')}
              style={{
                background: filter === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: filter === 'WARNING' ? '#fbbf24' : 'var(--text-muted)',
                border: filter === 'WARNING' ? '1px solid var(--risk-warning)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Warnings ({warningCount})
            </button>

            <button
              onClick={() => setFilter('RESOLVED')}
              style={{
                background: filter === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: filter === 'RESOLVED' ? '#6ee7b7' : 'var(--text-muted)',
                border: filter === 'RESOLVED' ? '1px solid var(--risk-safe)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          {/* Clauses Stream */}
          <div>
            {filteredClauses.map((clause) => (
              <ClauseCard
                key={clause.clauseId}
                clause={clause}
                isLocked={isLocked}
                onOpenProposal={(c) => setProposalClause(c)}
                onViewDiff={(c) => setDiffClause(c)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Negotiation & Audit Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Proposals Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} color="var(--primary)" />
                <h4 style={{ fontSize: '0.95rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Amendments ({pendingProposals.length})
                </h4>
              </div>
            </div>

            {pendingProposals.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '28px 14px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-dim)',
                fontSize: '0.85rem',
              }}>
                <CheckCircle2 size={24} color="var(--risk-safe)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                No pending amendment proposals.
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click "⚡ Propose Safe Compromise" on any clause to propose terms.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingProposals.map((proposal) => {
                  const targetClause = agreement.clauses?.find((c) => c.clauseId === proposal.clauseId);

                  return (
                    <div
                      key={proposal.proposalId}
                      style={{
                        background: 'rgba(10, 15, 29, 0.8)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '10px',
                        padding: '16px',
                      }}
                      id={`proposal-box-${proposal.proposalId}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc' }}>
                          {targetClause?.title || proposal.clauseId}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          Proposed by {proposal.proposedByName}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                        "{proposal.rationale}"
                      </div>

                      <div style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                        marginBottom: '12px',
                        maxHeight: '100px',
                        overflowY: 'auto',
                      }}>
                        {proposal.proposedText}
                      </div>

                      {/* Consensus Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-safe btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleProposalRespond(proposal.proposalId, 'ACCEPT')}
                          disabled={actionLoading}
                          id={`btn-accept-${proposal.proposalId}`}
                        >
                          <CheckCircle2 size={13} />
                          Accept Amendment
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleProposalRespond(proposal.proposalId, 'REJECT')}
                          disabled={actionLoading}
                          id={`btn-reject-${proposal.proposalId}`}
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Policy Rules Match Matrix */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Users size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Safety Policy Matrix
              </h4>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Comparing active policies between parties:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Payment Terms:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Net-{agreement.creator?.policyProfile?.maxPaymentDays || 30} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Liability Ceiling:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>1x Fees Paid</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-dim)' }}>IP Transfer:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Upon Full Payment</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-dim)' }}>Non-Compete:</span>
                <span style={{ color: 'var(--risk-safe)', fontWeight: 600 }}>Strictly Refused</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Log */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={16} color="var(--text-dim)" />
              <h4 style={{ fontSize: '0.95rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Audit Trail Log ({agreement.auditLogs?.length || 0})
              </h4>
            </div>

            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(agreement.auditLogs || []).slice().reverse().map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a5b4fc', fontWeight: 700, marginBottom: '2px' }}>
                    <span>{log.action.replace(/_/g, ' ')}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProposalModal
        clause={proposalClause}
        isOpen={Boolean(proposalClause)}
        onClose={() => setProposalClause(null)}
        onSubmitProposal={handleProposalSubmit}
      />

      <DiffViewerModal
        clause={diffClause}
        isOpen={Boolean(diffClause)}
        onClose={() => setDiffClause(null)}
      />

      <SignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSign={handleSign}
        agreementTitle={agreement.title}
      />

      <AuditCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        agreement={agreement}
      />
    </div>
  );
};
