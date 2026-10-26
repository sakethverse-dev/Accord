import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Zap, Wand2 } from 'lucide-react';
import { api } from '../services/api';

export const ProposalModal = ({ clause, isOpen, onClose, onSubmitProposal, agreementId }) => {
  const [proposedText, setProposedText] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (clause) {
      setProposedText(clause.suggestedReplacement || clause.currentText || '');
      setRationale(
        clause.riskReason
          ? `Amended to balance mutual interests: ${clause.riskReason}`
          : 'Proposed balanced term adjustment for mutual agreement.'
      );
      setAiInstruction('');
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
      setRationale(clause.riskReason || 'Applied AI balanced compromise language.');
    }
  };

  const handleAiImprove = async (customInst = '') => {
    const instructionToUse = customInst || aiInstruction.trim() || 'Make this clause fair, balanced, and clear for both parties.';
    if (!agreementId) return;

    setAiLoading(true);
    try {
      const data = await api.proposals.improveWithAI(agreementId, clause.clauseId, { instruction: instructionToUse });
      if (data?.improvedText) {
        setProposedText(data.improvedText);
      }
      if (data?.rationale) {
        setRationale(data.rationale);
      }
    } catch (err) {
      alert(`AI Rewrite failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const quickChips = [
    'Make Mutual & Balanced',
    'Net-30 Milestone Payment',
    'Cap Liability at Project Fees',
    'Protect IP Ownership until Paid',
    'Mutual Non-Disclosure',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '640px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>
                Amendment Proposal
              </span>
              <span style={{ fontSize: '0.7rem', background: '#1c1c20', color: '#ffffff', border: '1px solid #333338', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Zap size={10} /> Gemini 2.5 Flash
              </span>
            </div>
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

        {/* Current Text Readonly */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
            Current Agreement Text:
          </label>
          <div style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            maxHeight: '90px',
            overflowY: 'auto',
          }}>
            {clause.currentText}
          </div>
        </div>

        {/* Gemini AI Assistant Box */}
        <div style={{
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <Sparkles size={14} color="#ffffff" />
              <span>Ask Gemini AI to Improve or Rewrite</span>
            </div>
            {clause.suggestedReplacement && (
              <button
                type="button"
                onClick={useStandardCompromise}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Use Recommended Compromise
              </button>
            )}
          </div>

          {/* Quick chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setAiInstruction(chip);
                  handleAiImprove(chip);
                }}
                disabled={aiLoading}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
              >
                + {chip}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="input-field"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="e.g. Cap liability at ₹5 Lakhs (or 1x fees) and make warranties 60 days..."
              style={{ fontSize: '0.8rem', padding: '6px 10px', flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAiImprove();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleAiImprove()}
              disabled={aiLoading}
              style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              <Wand2 size={12} />
              {aiLoading ? 'Rewriting...' : 'Rewrite'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Proposed Text Area */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Proposed Amendment Text:
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={proposedText}
              onChange={(e) => setProposedText(e.target.value)}
              placeholder="Enter or refine the amended clause language..."
              required
              id="input-proposed-text"
              style={{ resize: 'vertical', fontSize: '0.85rem', lineHeight: 1.5 }}
            />
          </div>

          {/* Rationale / Explanation */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Rationale / Explanation for Counterparty:
            </label>
            <input
              type="text"
              className="input-field"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="e.g. Standard Net-30 term balancing contractor cash flow with client accounting"
              id="input-proposed-rationale"
              style={{ fontSize: '0.82rem' }}
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

