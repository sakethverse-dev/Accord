import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, ArrowRight } from 'lucide-react';

export const ProposalModal = ({ clause, isOpen, onClose, onSubmitProposal }) => {
  const [proposedText, setProposedText] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clause) {
      // Default to suggested replacement if available, else current text
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Amendment Proposal
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginTop: '2px' }}>
              {clause.sectionNumber}: {clause.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Text Readonly */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              Current Agreement Text:
            </label>
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.875rem',
              color: 'var(--text-dim)',
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
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: '#a5b4fc',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} />
                Auto-Fill Policy Recommendation
              </button>
            </div>
          )}

          {/* Proposed Text Area */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="btn-submit-proposal-confirm"
            >
              <Send size={15} />
              {loading ? 'Submitting...' : 'Submit Amendment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
