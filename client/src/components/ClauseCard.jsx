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
  if (isCritical) cardBorder = 'var(--risk-critical-border)';
  else if (isWarning) cardBorder = 'var(--risk-warning-border)';
  else if (isResolved) cardBorder = 'var(--risk-safe-border)';

  return (
    <div
      className="glass-panel"
      id={`clause-card-${clause.clauseId}`}
      style={{
        padding: '20px',
        marginBottom: '16px',
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        background: isCritical
          ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, rgba(15, 23, 42, 0.85) 100%)'
          : isWarning
          ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.03) 0%, rgba(15, 23, 42, 0.85) 100%)'
          : isResolved
          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, rgba(15, 23, 42, 0.85) 100%)'
          : 'var(--bg-card)',
      }}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {clause.sectionNumber || 'Clause'}
          </span>
          <h4 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>
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
            <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
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

      {/* Main Text Content */}
      <div style={{
        background: 'rgba(8, 12, 22, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '14px',
        fontSize: '0.9rem',
        color: '#e2e8f0',
        lineHeight: 1.6,
        position: 'relative',
      }}>
        {showOriginal ? (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              [ Original Unedited Draft ]
            </div>
            {clause.originalText}
          </div>
        ) : (
          <div>
            {hasBeenModified && (
              <div style={{ fontSize: '0.7rem', color: 'var(--risk-safe)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
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
              top: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '5px',
              padding: '3px 7px',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {showOriginal ? 'Show Agreed' : 'Show Original'}
          </button>
        )}
      </div>

      {/* Risk Alert Banner */}
      {(isCritical || isWarning) && !isResolved && (
        <div style={{
          marginTop: '12px',
          padding: '12px 14px',
          borderRadius: '8px',
          background: isCritical ? 'var(--risk-critical-bg)' : 'var(--risk-warning-bg)',
          border: `1px solid ${isCritical ? 'var(--risk-critical-border)' : 'var(--risk-warning-border)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {isCritical ? (
              <ShieldAlert size={16} color="var(--risk-critical)" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={16} color="var(--risk-warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isCritical ? 'var(--risk-critical)' : 'var(--risk-warning)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Policy Conflict Identified
              </div>
              <div style={{ fontSize: '0.825rem', color: '#f1f5f9', marginTop: '2px' }}>
                {clause.riskReason}
              </div>

              {clause.suggestedReplacement && (
                <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(10, 16, 30, 0.8)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} />
                    Recommended Standard Compromise:
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: '2px' }}>
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
        marginTop: '14px',
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
