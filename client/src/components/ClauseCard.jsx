import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Edit3, GitCompare, ShieldAlert, Sparkles, History } from 'lucide-react';

export const ClauseCard = ({
  clause,
  onOpenProposal,
  onViewDiff,
  isLocked = false,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const isCritical = clause.riskLevel === 'CRITICAL';
  const isWarning = clause.riskLevel === 'WARNING';
  const isSafe = clause.riskLevel === 'SAFE';
  const isResolved = clause.status === 'RESOLVED';
  const isPendingProposal = clause.status === 'PROPOSED';
  const hasBeenModified = clause.currentText !== clause.originalText;

  let cardBorder = 'var(--border-subtle)';
  if (isCritical && !isResolved) cardBorder = 'var(--risk-critical-border)';
  else if (isWarning && !isResolved) cardBorder = 'var(--risk-warning-border)';
  else if (isResolved) cardBorder = 'var(--risk-safe-border)';

  return (
    <div
      className="contract-card"
      id={`clause-card-${clause.clauseId}`}
      style={{
        padding: '22px',
        marginBottom: '16px',
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        background: 'var(--bg-surface)',
      }}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {clause.sectionNumber || 'Clause'}
          </span>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {clause.title}
          </h4>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">
            {clause.category}
          </span>

          {isResolved && (
            <span className="badge badge-safe">
              <CheckCircle size={11} />
              Amended & Resolved
            </span>
          )}

          {isPendingProposal && (
            <span className="badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
              <History size={11} />
              Proposal Pending
            </span>
          )}

          {isCritical && !isResolved && (
            <span className="badge badge-critical">
              <ShieldAlert size={11} />
              Critical Risk
            </span>
          )}

          {isWarning && !isResolved && (
            <span className="badge badge-warning">
              <AlertTriangle size={11} />
              Warning
            </span>
          )}

          {isSafe && !isResolved && (
            <span className="badge badge-safe">
              <CheckCircle size={11} />
              Compliant
            </span>
          )}
        </div>
      </div>

      {/* Main Text Content (Pristine High Contrast Box) */}
      <div style={{
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '0.925rem',
        color: 'var(--text-main)',
        lineHeight: 1.65,
        position: 'relative',
      }}>
        {showOriginal ? (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--risk-critical-text)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              [ Original Unedited Draft ]
            </div>
            {clause.originalText}
          </div>
        ) : (
          <div>
            {hasBeenModified && (
              <div style={{ fontSize: '0.72rem', color: 'var(--risk-safe-text)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                [ Active Agreed Text ]
              </div>
            )}
            {clause.currentText}
          </div>
        )}

        {/* Toggle between original and modified text */}
        {hasBeenModified && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {showOriginal ? 'Show Agreed' : 'Show Original'}
          </button>
        )}
      </div>

      {/* Risk Alert Banner */}
      {(isCritical || isWarning) && !isResolved && (
        <div style={{
          marginTop: '14px',
          padding: '14px',
          borderRadius: '8px',
          background: isCritical ? 'var(--risk-critical-bg)' : 'var(--risk-warning-bg)',
          border: `1px solid ${isCritical ? 'var(--risk-critical-border)' : 'var(--risk-warning-border)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {isCritical ? (
              <ShieldAlert size={18} color="var(--risk-critical)" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={18} color="var(--risk-warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: isCritical ? 'var(--risk-critical-text)' : 'var(--risk-warning-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Policy Conflict Identified
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '3px', fontWeight: 500 }}>
                {clause.riskReason}
              </div>

              {clause.suggestedReplacement && (
                <div style={{ marginTop: '10px', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} />
                    Recommended Standard Compromise:
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '3px', lineHeight: 1.5 }}>
                    "{clause.suggestedReplacement}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '16px',
        flexWrap: 'wrap',
      }}>
        {hasBeenModified && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onViewDiff(clause)}
            title="Inspect Word-Level Diff"
          >
            <GitCompare size={13} />
            Inspect Diff
          </button>
        )}

        {!isLocked && (
          <button
            className={`btn btn-sm ${isCritical ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onOpenProposal(clause)}
            id={`btn-propose-${clause.clauseId}`}
          >
            <Edit3 size={13} />
            {clause.suggestedReplacement ? '⚡ Propose Safe Compromise' : 'Propose Amendment'}
          </button>
        )}
      </div>
    </div>
  );
};
