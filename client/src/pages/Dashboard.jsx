import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Lock, 
  Users, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const Dashboard = ({ onSelectAgreement }) => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSample, setCreatingSample] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const data = await api.agreements.getAll();
      setAgreements(data);
    } catch (err) {
      console.error('Failed to load agreements:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const handleCreateSample = async () => {
    setCreatingSample(true);
    try {
      const newAgreement = await api.agreements.create({ useSample: true });
      onSelectAgreement(newAgreement._id);
    } catch (err) {
      alert(`Error loading sample contract: ${err.message}`);
    } finally {
      setCreatingSample(false);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setCreatingCustom(true);
    try {
      const newAgreement = await api.agreements.create({
        title: customTitle.trim(),
        rawText: customText.trim(),
        useSample: false,
      });
      setShowCustomModal(false);
      setCustomTitle('');
      setCustomText('');
      onSelectAgreement(newAgreement._id);
    } catch (err) {
      alert(`Error creating agreement: ${err.message}`);
    } finally {
      setCreatingCustom(false);
    }
  };

  const activeCount = agreements.filter((a) => a.status !== 'FULLY_EXECUTED_LOCKED').length;
  const sealedCount = agreements.filter((a) => a.status === 'FULLY_EXECUTED_LOCKED').length;
  const avgAlignment = agreements.length > 0
    ? Math.round(agreements.reduce((acc, curr) => acc + (curr.alignmentScore || 0), 0) / agreements.length)
    : 100;

  return (
    <div className="container" style={{ padding: '28px 0 60px' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={14} color="#818cf8" />
            <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Legal Execution Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', marginTop: '2px', fontWeight: 800 }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Active role: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{user?.role}</strong> ({user?.companyOrTitle})
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleCreateSample}
            disabled={creatingSample}
            id="btn-load-sample-contract"
          >
            <Sparkles size={15} />
            {creatingSample ? 'Auditing Sample...' : '⚡ 1-Click Load Evaluator Demo Contract'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowCustomModal(true)}
            id="btn-create-custom-contract"
          >
            <Plus size={15} />
            New Agreement
          </button>
        </div>
      </div>

      {/* Metrics Row (Responsive 3 to 1 column) */}
      <div className="app-grid-3" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', marginBottom: '6px' }}>
            <Clock size={16} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Active Rooms</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Agreements currently under mutual negotiation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--risk-safe)', marginBottom: '6px' }}>
            <Lock size={16} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Sealed & Locked</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {sealedCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Cryptographically sealed with SHA-256 hash
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', marginBottom: '6px' }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Avg Alignment</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {avgAlignment}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Deterministic policy compliance index
          </div>
        </div>
      </div>

      {/* Agreements List Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
          My Agreement Rooms ({agreements.length})
        </h3>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchAgreements}
          title="Refresh List"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Agreements Cards Grid (Responsive 1-column on mobile) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Loading agreement rooms...
        </div>
      ) : agreements.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <FileText size={42} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '6px' }}>
            No Agreements Active
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
            Click below to instantly create and audit the pre-configured evaluator demo contract with realistic contract clauses.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleCreateSample}>
            <Sparkles size={14} />
            Load Pre-Configured Demo Contract
          </button>
        </div>
      ) : (
        <div className="app-card-grid">
          {agreements.map((agreement) => {
            const isSealed = agreement.status === 'FULLY_EXECUTED_LOCKED';
            const hasRisks = (agreement.criticalRiskCount || 0) > 0;

            return (
              <div
                key={agreement._id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isSealed
                    ? '4px solid var(--risk-safe)'
                    : hasRisks
                    ? '4px solid var(--risk-critical)'
                    : '4px solid var(--primary)',
                }}
              >
                <div>
                  {/* Status Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className={`badge ${isSealed ? 'badge-safe' : hasRisks ? 'badge-critical' : 'badge-primary'}`}>
                      {isSealed ? '🔒 Sealed & Locked' : agreement.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 800, color: hasRisks ? 'var(--risk-critical)' : 'var(--risk-safe)' }}>
                      {agreement.alignmentScore}% Aligned
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '8px', lineHeight: 1.35 }}>
                    {agreement.title}
                  </h4>

                  {/* Parties */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <Users size={12} color="var(--text-dim)" />
                    <span>Creator: <strong>{agreement.creator?.name || 'You'}</strong></span>
                    <span>•</span>
                    <span>Partner: <strong>{agreement.invitedParty?.name || 'Awaiting'}</strong></span>
                  </div>

                  {/* Risk breakdown chips */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: 'var(--risk-critical-bg)',
                      color: 'var(--risk-critical)',
                      fontWeight: 700,
                    }}>
                      {agreement.criticalRiskCount || 0} Critical
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: 'var(--risk-warning-bg)',
                      color: 'var(--risk-warning)',
                      fontWeight: 700,
                    }}>
                      {agreement.warningRiskCount || 0} Warnings
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-muted)',
                    }}>
                      {agreement.clauses?.length || 0} Clauses
                    </span>
                  </div>
                </div>

                {/* Enter Button */}
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={() => onSelectAgreement(agreement._id)}
                  id={`btn-open-room-${agreement._id}`}
                >
                  <span>Enter Negotiation Room</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Custom Agreement Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '14px' }}>
              Create Custom Agreement Room
            </h3>

            <form onSubmit={handleCreateCustom}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                  Agreement Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Mobile App Development Agreement"
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                  Paste Contract Text (Optional - will auto-segment into clauses)
                </label>
                <textarea
                  className="input-field"
                  rows={5}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste numbered sections or paragraphs. Leave blank to generate standard clauses."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCustomModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creatingCustom}>
                  {creatingCustom ? 'Parsing & Auditing...' : 'Create & Audit Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
