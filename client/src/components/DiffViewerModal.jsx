import React, { useState, useEffect } from 'react';
import { X, GitCompare } from 'lucide-react';
import { api } from '../services/api';

export const DiffViewerModal = ({ clause, isOpen, onClose }) => {
  const [diffTokens, setDiffTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clause && isOpen) {
      setLoading(true);
      api.proposals.getDiff(clause.originalText, clause.currentText)
        .then((tokens) => setDiffTokens(tokens))
        .catch((err) => console.error('Diff calculation error:', err))
        .finally(() => setLoading(false));
    }
  }, [clause, isOpen]);

  if (!isOpen || !clause) return null;

  const addedCount = diffTokens.filter((t) => t.type === 'added').length;
  const removedCount = diffTokens.filter((t) => t.type === 'removed').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitCompare size={16} color="var(--accent)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                Word-Level Revision Diff
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

        {/* Diff Stats Banner */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
          padding: '10px 14px',
          background: 'var(--bg-muted)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--risk-safe-text)', fontWeight: 700 }}>
            +{addedCount} Additions
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--risk-critical-text)', fontWeight: 700 }}>
            -{removedCount} Deletions
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Comparing Original Draft vs. Active Agreed Text
          </span>
        </div>

        {/* Diff Content Box */}
        <div style={{
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '18px',
          fontSize: '0.925rem',
          lineHeight: 1.8,
          maxHeight: '340px',
          overflowY: 'auto',
          color: 'var(--text-main)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
              Computing LCS word tokens...
            </div>
          ) : (
            <div>
              {diffTokens.map((token, index) => {
                if (token.type === 'added') {
                  return (
                    <span key={index} className="diff-added">
                      {token.value}
                    </span>
                  );
                }
                if (token.type === 'removed') {
                  return (
                    <span key={index} className="diff-removed">
                      {token.value}
                    </span>
                  );
                }
                return (
                  <span key={index} className="diff-unchanged">
                    {token.value}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
