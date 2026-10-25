import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send } from 'lucide-react';

export const ProposalModal = ({ clause, isOpen, onClose, onSubmitProposal }) => {
  const [proposedText, setProposedText] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clause) {
      setProposedText(clause.suggestedReplacement || clause.currentText || '');
      setRationale(
        clause.riskReason
          ? `Amended to comply with professional policy standards: ${clause.riskReason}`
          : 'Proposed balanced term adjustment for mutual agreement.'
      );
    }
  }, [clause]);

  if (!isOpen || !clause) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposedText.trim()) return;

    setLoading(true);
    try {
      await onSubmitProposal(clause.clauseId, {
        proposedText: proposedText.trim(),
        rationale: rationale.trim(),
      });
      onClose();
    } catch (err) {
      alert(`Error submitting proposal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const useStandardCompromise = () => {
    if (clause.suggestedReplacement) {
      setProposedText(clause.suggestedReplacement);
      setRationale('Applied standard compliance policy compromise language.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
              Amendment Proposal
            </span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginTop: '2px', fontWeight: 800 }}>
              {clause.sectionNumber}: {clause.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Text Readonly */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Current Agreement Text:
            </label>
            <div style={{
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              maxHeight: '100px',
              overflowY: 'auto',
            }}>
              {clause.currentText}
            </div>
          </div>

          {/* Quick Fill Button if Recommended Compromise exists */}
          {clause.suggestedReplacement && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={useStandardCompromise}
                style={{
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Sparkles size={12} />
                Auto-Fill Policy Recommendation
              </button>
            </div>
          )}

          {/* Proposed Text Area */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Proposed Amendment Text:
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={proposedText}
              onChange={(e) => setProposedText(e.target.value)}
              placeholder="Enter the amended clause language..."
              required
              id="input-proposed-text"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Rationale / Explanation */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Rationale / Reason for Counter-Party:
            </label>
            <input
              type="text"
              className="input-field"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="e.g. Standard Net-30 term per contractor billing policy"
              id="input-proposed-rationale"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="btn-submit-proposal-confirm"
            >
              <Send size={14} />
              {loading ? 'Submitting...' : 'Submit Amendment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
