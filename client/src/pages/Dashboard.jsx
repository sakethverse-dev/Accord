import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Lock, 
  Users, 
  RefreshCw 
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
    <div className="container" style={{ padding: '36px 0 60px' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Agreement Hub
          </span>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginTop: '2px' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Logged in as <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{user?.role}</strong> ({user?.companyOrTitle})
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={handleCreateSample}
            disabled={creatingSample}
            id="btn-load-sample-contract"
          >
            <Sparkles size={16} />
            {creatingSample ? 'Auditing Sample...' : '⚡ 1-Click Load Evaluator Demo Contract'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowCustomModal(true)}
            id="btn-create-custom-contract"
          >
            <Plus size={16} />
            Create Custom Agreement
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '18px',
        marginBottom: '36px',
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '8px' }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Active Rooms</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Agreements currently in review or negotiation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--risk-safe)', marginBottom: '8px' }}>
            <Lock size={18} />
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Sealed & Locked</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {sealedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Digitally executed with SHA-256 integrity seal
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a5b4fc', marginBottom: '8px' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Avg Alignment</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {avgAlignment}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Average safety compliance across your portfolio
          </div>
        </div>
      </div>

      {/* Agreements List Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
          My Agreement Rooms ({agreements.length})
        </h3>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchAgreements}
          title="Refresh List"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Agreements Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading agreement rooms...
        </div>
      ) : agreements.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FileText size={48} color="var(--text-dim)" style={{ marginBottom: '14px' }} />
          <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '6px' }}>
            No Agreements Found
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
            You haven't created or joined any agreement rooms yet. Click the button below to instantly load the evaluator demo contract!
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleCreateSample}>
            <Sparkles size={14} />
            Load Pre-Configured Demo Contract
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '18px' }}>
          {agreements.map((agreement) => {
            const isSealed = agreement.status === 'FULLY_EXECUTED_LOCKED';
            const hasRisks = (agreement.criticalRiskCount || 0) > 0;

            return (
              <div
                key={agreement._id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '24px',
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge ${isSealed ? 'badge-safe' : hasRisks ? 'badge-critical' : 'badge-primary'}`}>
                      {isSealed ? '🔒 Sealed & Locked' : agreement.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: hasRisks ? 'var(--risk-critical)' : 'var(--risk-safe)' }}>
                      {agreement.alignmentScore}% Aligned
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '8px', lineHeight: 1.35 }}>
                    {agreement.title}
                  </h4>

                  {/* Parties */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    <Users size={13} color="var(--text-dim)" />
                    <span>Creator: <strong>{agreement.creator?.name || 'You'}</strong></span>
                    <span>•</span>
                    <span>Counterparty: <strong>{agreement.invitedParty?.name || 'Awaiting Partner'}</strong></span>
                  </div>

                  {/* Risk breakdown chips */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#f87171',
                      fontWeight: 600,
                    }}>
                      {agreement.criticalRiskCount || 0} Critical Risks
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#fbbf24',
                      fontWeight: 600,
                    }}>
                      {agreement.warningRiskCount || 0} Warnings
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
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
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Custom Agreement Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>
              Create Custom Agreement Room
            </h3>

            <form onSubmit={handleCreateCustom}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Paste Contract Text (Optional - will auto-segment into clauses)
                </label>
                <textarea
                  className="input-field"
                  rows={6}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste numbered sections or paragraphs. Leave blank to generate standard clauses."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
