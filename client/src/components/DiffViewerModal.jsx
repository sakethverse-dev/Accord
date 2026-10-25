import React, { useState, useEffect } from 'react';
import { X, GitCompare, ArrowRight } from 'lucide-react';
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitCompare size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Word-Level Revision Diff
              </span>
            </div>
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

        {/* Diff Stats Banner */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '18px',
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
        }}>
          <span style={{ color: '#6ee7b7', fontWeight: 600 }}>
            +{addedCount} Additions
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: '#fca5a5', fontWeight: 600 }}>
            -{removedCount} Deletions
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Comparing Original Draft vs. Active Agreed Text
          </span>
        </div>

        {/* Diff Content Box */}
        <div style={{
          background: 'rgba(10, 15, 29, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '20px',
          fontSize: '0.95rem',
          lineHeight: 1.8,
          maxHeight: '350px',
          overflowY: 'auto',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
