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
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Info
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
  
  // Filter state (Matching Image 1 & 2)
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ACTION' | 'NEGOTIATION' | 'SEALED'
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter agreements
  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch = agreement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agreement.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'ACTION') return (agreement.criticalRiskCount || 0) > 0 && agreement.status !== 'FULLY_EXECUTED_LOCKED';
    if (activeFilter === 'NEGOTIATION') return agreement.status === 'IN_NEGOTIATION';
    if (activeFilter === 'SEALED') return agreement.status === 'FULLY_EXECUTED_LOCKED';
    return true;
  });

  const activeAgreements = filteredAgreements.filter((a) => a.status !== 'FULLY_EXECUTED_LOCKED');
  const sealedAgreements = agreements.filter((a) => a.status === 'FULLY_EXECUTED_LOCKED');

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header Banner (Matching Image 1) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '26px',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-main)', fontWeight: 800 }}>
            My contracts
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Here you can find all your negotiated and executed legal contracts
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
            {creatingSample ? 'Auditing Demo...' : '⚡ 1-Click Load Demo Contract'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowCustomModal(true)}
            id="btn-create-custom-contract"
          >
            <Plus size={15} />
            Add contract
          </button>
        </div>
      </div>

      {/* Actual Contracts Sub-header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
          Actual contracts
        </h3>
      </div>

      {/* Filter Tabs & Search Bar Row (Matching Image 1 & 2) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '22px',
      }}>
        {/* Filter Pills */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All ({agreements.length})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'ACTION' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ACTION')}
          >
            Require action ({agreements.filter((a) => (a.criticalRiskCount || 0) > 0 && a.status !== 'FULLY_EXECUTED_LOCKED').length})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'NEGOTIATION' ? 'active' : ''}`}
            onClick={() => setActiveFilter('NEGOTIATION')}
          >
            In negotiation ({agreements.filter((a) => a.status === 'IN_NEGOTIATION').length})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'SEALED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SEALED')}
          >
            Signed & Sealed ({sealedAgreements.length})
          </button>
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '180px',
              }}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchAgreements}
            title="Refresh"
            style={{ padding: '7px 10px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2x2 Grid of Contract Cards (Matching Image 1) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading your active contracts...
        </div>
      ) : activeAgreements.length === 0 ? (
        <div className="contract-card" style={{ textAlign: 'center', padding: '48px 20px', marginBottom: '32px' }}>
          <FileText size={42} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            No Active Contracts
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
            Click below to instantly create and audit the pre-configured demo contract with realistic clauses.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleCreateSample} style={{ margin: '0 auto' }}>
            <Sparkles size={14} />
            Load Pre-Configured Demo Contract
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '18px',
          marginBottom: '36px',
        }}>
          {activeAgreements.map((agreement) => {
            const hasRisks = (agreement.criticalRiskCount || 0) > 0;
            const refNumber = `№PF-${agreement._id.slice(-8).toUpperCase()}`;

            return (
              <div key={agreement._id} className="contract-card">
                <div>
                  {/* Card Header (Matching Image 1) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>📄</span>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        {agreement.title}
                      </h4>
                    </div>

                    <span className={`badge ${hasRisks ? 'badge-critical' : 'badge-safe'}`}>
                      {hasRisks ? `${agreement.criticalRiskCount} Conflicts` : 'Compliant'}
                    </span>
                  </div>

                  {/* Spec Data Grid (Matching Image 1) */}
                  <div className="spec-grid">
                    <div className="spec-item">
                      <span className="spec-label">Counterparty</span>
                      <span className="spec-value">{agreement.invitedParty?.name || 'Awaiting Partner'}</span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-label">Contract Number</span>
                      <span className="spec-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{refNumber}</span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-label">Status</span>
                      <span className="spec-value">
                        <span className={`badge ${hasRisks ? 'badge-critical' : 'badge-safe'}`} style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                          {hasRisks ? 'Action Required' : 'Ready to Sign'}
                        </span>
                      </span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-label">Alignment Score</span>
                      <span className="spec-value" style={{ color: hasRisks ? 'var(--risk-critical)' : 'var(--risk-safe)' }}>
                        {agreement.alignmentScore}% Aligned
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer (Matching Image 1: "More info" and "Open") */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectAgreement(agreement._id)}
                    style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                  >
                    <Info size={13} />
                    <span>More info</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectAgreement(agreement._id)}
                    id={`btn-open-contract-${agreement._id}`}
                    style={{ padding: '7px 16px' }}
                  >
                    <ExternalLink size={13} />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lower Section: Deleted & Sealed Archive (Matching Image 1) */}
      <div>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '14px' }}>
          Executed and sealed contracts ({sealedAgreements.length})
        </h3>

        {sealedAgreements.length === 0 ? (
          <div className="contract-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            No executed contracts yet. Once both parties digitally sign, agreements are cryptographically sealed and archived here.
          </div>
        ) : (
          <div className="contract-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Type / Title</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Counterparty</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Contract Number</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>SHA-256 Seal</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sealedAgreements.map((agreement) => (
                  <tr key={agreement._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {agreement.title}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {agreement.invitedParty?.name || 'Partner'}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      №PF-{agreement._id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--risk-safe)' }}>
                      {agreement.cryptoSeal?.sha256Hash?.slice(0, 16)}...
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-safe">
                        <CheckCircle2 size={11} /> Done
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectAgreement(agreement._id)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Custom Agreement Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '14px' }}>
              Add new contract
            </h3>

            <form onSubmit={handleCreateCustom}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                  Contract Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Master Software Development Agreement"
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
                  {creatingCustom ? 'Parsing & Auditing...' : 'Create & Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
