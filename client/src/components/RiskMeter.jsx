import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export const RiskMeter = ({ alignmentScore = 100, criticalCount = 0, warningCount = 0, totalClauses = 0 }) => {
  // Determine color theme based on score
  let statusColor = 'var(--risk-safe)';
  let statusBg = 'var(--risk-safe-bg)';
  let statusBorder = 'var(--risk-safe-border)';
  let statusGlow = 'var(--glow-safe)';
  let statusTitle = 'Terms Fully Aligned';
  let statusSubtitle = 'All clauses satisfy safety policies. Ready for signature.';

  if (criticalCount > 0) {
    statusColor = 'var(--risk-critical)';
    statusBg = 'var(--risk-critical-bg)';
    statusBorder = 'var(--risk-critical-border)';
    statusGlow = 'var(--glow-critical)';
    statusTitle = `${criticalCount} Critical Conflict${criticalCount > 1 ? 's' : ''}`;
    statusSubtitle = 'Predatory or high-liability terms require amendment.';
  } else if (warningCount > 0) {
    statusColor = 'var(--risk-warning)';
    statusBg = 'var(--risk-warning-bg)';
    statusBorder = 'var(--risk-warning-border)';
    statusGlow = '0 0 25px rgba(245, 158, 11, 0.25)';
    statusTitle = `${warningCount} Advisory Warning${warningCount > 1 ? 's' : ''}`;
    statusSubtitle = 'Minor term deviations detected. Review recommended.';
  }

  const safeCount = Math.max(0, totalClauses - criticalCount - warningCount);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        borderLeft: `4px solid ${statusColor}`,
        boxShadow: statusGlow,
      }}
    >
      {/* Score Number & Radial Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          position: 'relative',
          width: '78px',
          height: '78px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.9)',
          border: `3px solid ${statusColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `inset 0 0 15px ${statusBg}`,
        }}>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: statusColor, lineHeight: 1 }}>
            {alignmentScore}%
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
            Alignment
          </span>
        </div>

        {/* Text Status */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {criticalCount > 0 ? (
              <ShieldAlert size={18} color={statusColor} />
            ) : warningCount > 0 ? (
              <AlertTriangle size={18} color={statusColor} />
            ) : (
              <CheckCircle size={18} color={statusColor} />
            )}
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>
              {statusTitle}
            </h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {statusSubtitle}
          </p>
        </div>
      </div>

      {/* Pill Counters */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          padding: '8px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--risk-critical)', lineHeight: 1 }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#fca5a5', textTransform: 'uppercase', marginTop: '3px', fontWeight: 600 }}>
            Critical
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '10px',
          padding: '8px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--risk-warning)', lineHeight: 1 }}>
            {warningCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#fde68a', textTransform: 'uppercase', marginTop: '3px', fontWeight: 600 }}>
            Warnings
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '8px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--risk-safe)', lineHeight: 1 }}>
            {safeCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#6ee7b7', textTransform: 'uppercase', marginTop: '3px', fontWeight: 600 }}>
            Compliant
          </div>
        </div>
      </div>
    </div>
  );
};
