import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Users, 
  RefreshCw,
  ShieldCheck,
  Search,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  FileCheck,
  Download
} from 'lucide-react';
import { downloadAgreementPdf } from '../services/pdfService';

export const Dashboard = ({ onSelectAgreement, onOpenTemplate }) => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);
  
  // Filter state
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

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setCreatingCustom(true);
    try {
      const newAgreement = await api.agreements.create({
        title: customTitle.trim(),
        rawText: customText.trim(),
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

  // Metrics
  const totalCount = agreements.length;
  const actionCount = agreements.filter((a) => (a.criticalRiskCount || 0) > 0 && a.status !== 'FULLY_EXECUTED_LOCKED').length;
  const negotiationCount = agreements.filter((a) => a.status === 'IN_NEGOTIATION' && (a.criticalRiskCount || 0) === 0).length;
  const sealedCount = agreements.filter((a) => a.status === 'FULLY_EXECUTED_LOCKED').length;

  // Filtered agreements
  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch = agreement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agreement.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agreement.invitedParty?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'ACTION') return (agreement.criticalRiskCount || 0) > 0 && agreement.status !== 'FULLY_EXECUTED_LOCKED';
    if (activeFilter === 'NEGOTIATION') return agreement.status === 'IN_NEGOTIATION';
    if (activeFilter === 'SEALED') return agreement.status === 'FULLY_EXECUTED_LOCKED';
    return true;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Agreements
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Review, negotiate, and cryptographically execute mutual legal contracts
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={onOpenTemplate}
            id="btn-open-templates-header"
          >
            <FileCheck size={15} />
            <span>Standard Templates</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowCustomModal(true)}
            id="btn-create-custom-contract"
          >
            <Plus size={15} />
            <span>New Agreement</span>
          </button>
        </div>
      </div>


      {/* 2. Institutional Executive Metrics Bar */}
      <div className="metrics-row">
        <div className="metric-tile" onClick={() => setActiveFilter('ALL')} style={{ cursor: 'pointer' }}>
          <div className="metric-tile-header">
            <span className="metric-tile-label">Total Contracts</span>
            <FileText size={16} color="var(--text-muted)" />
          </div>
          <div className="metric-tile-val">{totalCount}</div>
          <div className="metric-tile-sub">Active in workspace</div>
        </div>

        <div className="metric-tile" onClick={() => setActiveFilter('ACTION')} style={{ cursor: 'pointer' }}>
          <div className="metric-tile-header">
            <span className="metric-tile-label">Requires Action</span>
            <AlertTriangle size={16} color={actionCount > 0 ? "var(--risk-critical)" : "var(--text-muted)"} />
          </div>
          <div className="metric-tile-val" style={{ color: actionCount > 0 ? 'var(--risk-critical)' : 'var(--text-main)' }}>
            {actionCount}
          </div>
          <div className="metric-tile-sub">Policy deviations flagged</div>
        </div>

        <div className="metric-tile" onClick={() => setActiveFilter('NEGOTIATION')} style={{ cursor: 'pointer' }}>
          <div className="metric-tile-header">
            <span className="metric-tile-label">In Negotiation</span>
            <Clock size={16} color="var(--accent)" />
          </div>
          <div className="metric-tile-val">{negotiationCount}</div>
          <div className="metric-tile-sub">Active compromise discussions</div>
        </div>

        <div className="metric-tile" onClick={() => setActiveFilter('SEALED')} style={{ cursor: 'pointer' }}>
          <div className="metric-tile-header">
            <span className="metric-tile-label">Executed & Sealed</span>
            <ShieldCheck size={16} color="var(--risk-safe)" />
          </div>
          <div className="metric-tile-val" style={{ color: 'var(--risk-safe)' }}>
            {sealedCount}
          </div>
          <div className="metric-tile-sub">Cryptographically verified</div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* Filter Pills */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'ACTION' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ACTION')}
          >
            Needs Review ({actionCount})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'NEGOTIATION' ? 'active' : ''}`}
            onClick={() => setActiveFilter('NEGOTIATION')}
          >
            In Negotiation ({negotiationCount})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'SEALED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SEALED')}
          >
            Signed & Sealed ({sealedCount})
          </button>
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search contracts..."
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
                width: '190px',
              }}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchAgreements}
            title="Refresh list"
            style={{ padding: '7px 10px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4. Unified Institutional Contracts Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading agreement repository...
        </div>
      ) : filteredAgreements.length === 0 ? (
        <div className="contracts-table-container" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <FileText size={38} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            No Agreements Found
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 16px' }}>
            {activeFilter !== 'ALL' 
              ? 'No contracts match the selected filter criteria.' 
              : 'Create a new agreement or load a standard agreement template to get started.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={onOpenTemplate}>
              <FileCheck size={13} />
              Standard Templates
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCustomModal(true)}>
              <Plus size={13} />
              Custom Agreement
            </button>
          </div>
        </div>
      ) : (
        <div className="contracts-table-container">
          <table className="contracts-table">
            <thead>
              <tr>
                <th>Document Name & Ref</th>
                <th>Counterparty</th>
                <th>Status</th>
                <th>Policy Alignment</th>
                <th>Security & Seal</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgreements.map((agreement) => {
                const isSealed = agreement.status === 'FULLY_EXECUTED_LOCKED';
                const hasRisks = (agreement.criticalRiskCount || 0) > 0 && !isSealed;
                const refId = `PF-${agreement._id.slice(-8).toUpperCase()}`;
                const partnerName = agreement.invitedParty?.name || 'Awaiting Counterparty';

                return (
                  <tr 
                    key={agreement._id}
                    onClick={() => onSelectAgreement(agreement._id)}
                  >
                    {/* Document Name & Ref */}
                    <td style={{ minWidth: '320px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSealed ? 'var(--risk-safe-bg)' : hasRisks ? 'var(--risk-critical-bg)' : 'var(--accent-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}>
                          {isSealed ? (
                            <ShieldCheck size={16} color="var(--risk-safe)" />
                          ) : hasRisks ? (
                            <AlertTriangle size={16} color="var(--risk-critical)" />
                          ) : (
                            <FileText size={16} color="var(--accent)" />
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {agreement.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{refId}</span>
                            <span>•</span>
                            <span>{agreement.clauses?.length || 8} Clauses</span>
                            <span>•</span>
                            <span>By {agreement.creator?.name || 'User'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Counterparty */}
                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--bg-muted)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}>
                          {partnerName.charAt(0)}
                        </div>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {partnerName}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ minWidth: '130px' }}>
                      {isSealed ? (
                        <span className="badge badge-safe">
                          <CheckCircle2 size={11} /> Executed & Sealed
                        </span>
                      ) : hasRisks ? (
                        <span className="badge badge-critical">
                          <ShieldAlert size={11} /> {agreement.criticalRiskCount} Conflicts
                        </span>
                      ) : agreement.status === 'IN_NEGOTIATION' ? (
                        <span className="badge badge-primary">
                          <Clock size={11} /> In Negotiation
                        </span>
                      ) : (
                        <span className="badge badge-primary">
                          <FileCheck size={11} /> Ready to Sign
                        </span>
                      )}
                    </td>

                    {/* Policy Alignment */}
                    <td style={{ minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          borderRadius: '3px',
                          background: 'var(--bg-muted)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${agreement.alignmentScore || 0}%`,
                            height: '100%',
                            background: isSealed || agreement.alignmentScore >= 80 
                              ? 'var(--risk-safe)' 
                              : agreement.alignmentScore >= 60 
                                ? 'var(--risk-warning)' 
                                : 'var(--risk-critical)',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isSealed || agreement.alignmentScore >= 80 
                            ? 'var(--risk-safe)' 
                            : agreement.alignmentScore >= 60 
                              ? 'var(--risk-warning)' 
                              : 'var(--risk-critical)',
                        }}>
                          {agreement.alignmentScore}%
                        </span>
                      </div>
                    </td>

                    {/* Security & Seal */}
                    <td style={{ minWidth: '150px' }}>
                      {isSealed ? (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--risk-safe)', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                          <Lock size={11} />
                          <span>SHA-256:{agreement.cryptoSeal?.sha256Hash?.slice(0, 10)}...</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          ESIGN Protected Draft
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right', minWidth: '180px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {isSealed && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const fullAgr = await api.agreements.getById(agreement._id);
                                await downloadAgreementPdf(fullAgr);
                              } catch (err) {
                                alert('Failed to download PDF: ' + err.message);
                              }
                            }}
                            title="Download Executed Agreement PDF"
                            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>
                        )}
                        <button
                          className={`btn btn-sm ${hasRisks ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAgreement(agreement._id);
                          }}
                          id={`btn-open-contract-${agreement._id}`}
                          style={{ padding: '6px 14px', whiteSpace: 'nowrap' }}
                        >
                          <span>{isSealed ? 'Inspect' : hasRisks ? 'Review & Resolve' : 'Open Room'}</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Custom Agreement Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '14px' }}>
              Add New Legal Agreement
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
