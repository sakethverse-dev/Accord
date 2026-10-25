import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Edit3, GitCompare, ShieldAlert, Sparkles, History } from 'lucide-react';

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
        padding: '24px',
        marginBottom: '16px',
        border: `1px solid ${cardBorder}`,
        borderRadius: '14px',
        background: isCritical
          ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(17, 24, 39, 0.8) 100%)'
          : isWarning
          ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, rgba(17, 24, 39, 0.8) 100%)'
          : isResolved
          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(17, 24, 39, 0.8) 100%)'
          : 'var(--bg-card)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            {clause.sectionNumber || 'Clause'}
          </span>
          <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
            {clause.title}
          </h4>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-primary">
            {clause.category}
          </span>

          {isResolved && (
            <span className="badge badge-safe">
              <CheckCircle size={12} />
              Amended & Resolved
            </span>
          )}

          {isPendingProposal && (
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
              <History size={12} />
              Proposal Pending
            </span>
          )}

          {isCritical && !isResolved && (
            <span className="badge badge-critical">
              <ShieldAlert size={12} />
              Critical Risk
            </span>
          )}

          {isWarning && !isResolved && (
            <span className="badge badge-warning">
              <AlertTriangle size={12} />
              Warning
            </span>
          )}

          {isSafe && !isResolved && (
            <span className="badge badge-safe">
              <CheckCircle size={12} />
              Compliant
            </span>
          )}
        </div>
      </div>

      {/* Main Text Content */}
      <div style={{
        background: 'rgba(10, 15, 29, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '0.925rem',
        color: '#e2e8f0',
        lineHeight: 1.65,
        position: 'relative',
      }}>
        {showOriginal ? (
          <div>
            <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              [ Original Unedited Draft ]
            </div>
            {clause.originalText}
          </div>
        ) : (
          <div>
            {hasBeenModified && (
              <div style={{ fontSize: '0.72rem', color: 'var(--risk-safe)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
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
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
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
          marginTop: '14px',
          padding: '14px 18px',
          borderRadius: '10px',
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
                fontSize: '0.8rem',
                fontWeight: 700,
                color: isCritical ? 'var(--risk-critical)' : 'var(--risk-warning)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Policy Conflict Identified
              </div>
              <div style={{ fontSize: '0.85rem', color: '#f1f5f9', marginTop: '2px' }}>
                {clause.riskReason}
              </div>

              {clause.suggestedReplacement && (
                <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={12} />
                    Recommended Compromise:
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: '3px' }}>
                    "{clause.suggestedReplacement}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
        {hasBeenModified && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onViewDiff(clause)}
            title="Inspect Word-Level Diff"
          >
            <GitCompare size={14} />
            Inspect Diff
          </button>
        )}

        {!isLocked && (
          <button
            className={`btn btn-sm ${isCritical ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onOpenProposal(clause)}
            id={`btn-propose-${clause.clauseId}`}
          >
            <Edit3 size={14} />
            {clause.suggestedReplacement ? '⚡ Propose Safe Compromise' : 'Propose Amendment'}
          </button>
        )}
      </div>
    </div>
  );
};
