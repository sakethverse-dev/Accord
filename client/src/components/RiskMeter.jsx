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
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        borderLeft: `4px solid ${statusColor}`,
        borderColor: statusBorder,
        borderLeftColor: statusColor,
      }}
    >
      {/* Score & Health Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '260px', flex: '1 1 auto' }}>
        {/* Radial Badge */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '14px',
          background: 'rgba(10, 16, 30, 0.95)',
          border: `2px solid ${statusColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 16px -2px ${statusColor}33`,
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: statusColor, lineHeight: 1 }}>
            {alignmentScore}%
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '3px', fontWeight: 600 }}>
            Alignment
          </span>
        </div>

        {/* Text Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {criticalCount > 0 ? (
              <ShieldAlert size={17} color={statusColor} />
            ) : warningCount > 0 ? (
              <AlertTriangle size={17} color={statusColor} />
            ) : (
              <ShieldCheck size={17} color={statusColor} />
            )}
            <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
              {statusTitle}
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.45 }}>
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
          padding: '6px 12px',
          textAlign: 'center',
          minWidth: '72px',
        }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--risk-critical)', lineHeight: 1 }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#fca5a5', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>
            Critical
          </div>
        </div>

        <div style={{
          background: 'var(--risk-warning-bg)',
          border: '1px solid var(--risk-warning-border)',
          borderRadius: '8px',
          padding: '6px 12px',
          textAlign: 'center',
          minWidth: '72px',
        }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--risk-warning)', lineHeight: 1 }}>
            {warningCount}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#fde68a', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>
            Warnings
          </div>
        </div>

        <div style={{
          background: 'var(--risk-safe-bg)',
          border: '1px solid var(--risk-safe-border)',
          borderRadius: '8px',
          padding: '6px 12px',
          textAlign: 'center',
          minWidth: '72px',
        }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--risk-safe)', lineHeight: 1 }}>
            {safeCount}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#6ee7b7', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>
            Compliant
          </div>
        </div>
      </div>
    </div>
  );
};
