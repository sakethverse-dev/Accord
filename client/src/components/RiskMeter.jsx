import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export const RiskMeter = ({ alignmentScore = 100, criticalCount = 0, warningCount = 0, totalClauses = 0 }) => {
  let statusColor = 'var(--risk-safe)';
  let statusBorder = 'var(--risk-safe-border)';
  let statusTitle = 'Terms Compliant & Aligned';
  let statusSubtitle = 'All clauses satisfy safety policies. Document is cleared for legal execution.';

  if (criticalCount > 0) {
    statusColor = 'var(--risk-critical)';
    statusBorder = 'var(--risk-critical-border)';
    statusTitle = `${criticalCount} Critical Policy Conflict${criticalCount > 1 ? 's' : ''}`;
    statusSubtitle = 'Predatory or high-liability terms detected. Amendment required before execution.';
  } else if (warningCount > 0) {
    statusColor = 'var(--risk-warning)';
    statusBorder = 'var(--risk-warning-border)';
    statusTitle = `${warningCount} Advisory Warning${warningCount > 1 ? 's' : ''}`;
    statusSubtitle = 'Non-standard clause terms detected. Mutual review recommended.';
  }

  const safeCount = Math.max(0, totalClauses - criticalCount - warningCount);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid var(--border-subtle)`,
        borderLeft: `5px solid ${statusColor}`,
        borderRadius: '12px',
        boxShadow: 'var(--shadow-card)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      {/* Score & Health Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '260px', flex: '1 1 auto' }}>
        {/* Radial Badge */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '12px',
          background: 'var(--bg-muted)',
          border: `2px solid ${statusColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: statusColor, lineHeight: 1 }}>
            {alignmentScore}%
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '3px', fontWeight: 700 }}>
            Alignment
          </span>
        </div>

        {/* Text Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {criticalCount > 0 ? (
              <ShieldAlert size={18} color={statusColor} />
            ) : warningCount > 0 ? (
              <AlertTriangle size={18} color={statusColor} />
            ) : (
              <ShieldCheck size={18} color={statusColor} />
            )}
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {statusTitle}
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
            {statusSubtitle}
          </p>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{
          background: 'var(--risk-critical-bg)',
          border: '1px solid var(--risk-critical-border)',
          borderRadius: '8px',
          padding: '8px 14px',
          textAlign: 'center',
          minWidth: '76px',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--risk-critical-text)', lineHeight: 1 }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--risk-critical-text)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>
            Critical
          </div>
        </div>

        <div style={{
          background: 'var(--risk-warning-bg)',
          border: '1px solid var(--risk-warning-border)',
          borderRadius: '8px',
          padding: '8px 14px',
          textAlign: 'center',
          minWidth: '76px',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--risk-warning-text)', lineHeight: 1 }}>
            {warningCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--risk-warning-text)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>
            Warnings
          </div>
        </div>

        <div style={{
          background: 'var(--risk-safe-bg)',
          border: '1px solid var(--risk-safe-border)',
          borderRadius: '8px',
          padding: '8px 14px',
          textAlign: 'center',
          minWidth: '76px',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--risk-safe-text)', lineHeight: 1 }}>
            {safeCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--risk-safe-text)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>
            Compliant
          </div>
        </div>
      </div>
    </div>
  );
};
