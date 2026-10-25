/**
 * PactFlow Risk Scoring Algorithm
 * Calculates deterministic alignment score (0-100%) based on weighted risk penalties
 */

function calculateAgreementRisk(clauses) {
  if (!clauses || clauses.length === 0) {
    return {
      alignmentScore: 100,
      criticalRiskCount: 0,
      warningRiskCount: 0,
      safeCount: 0,
      healthLabel: 'PERFECT_ALIGNMENT',
    };
  }

  let criticalRiskCount = 0;
  let warningRiskCount = 0;
  let safeCount = 0;

  clauses.forEach((clause) => {
    if (clause.riskLevel === 'CRITICAL') {
      criticalRiskCount += 1;
    } else if (clause.riskLevel === 'WARNING') {
      warningRiskCount += 1;
    } else {
      safeCount += 1;
    }
  });

  // Mathematical formula: Weighted deduction
  // Base 100 pts. Critical = -20 pts, Warning = -8 pts.
  const penalty = (criticalRiskCount * 20) + (warningRiskCount * 8);
  const alignmentScore = Math.max(10, Math.min(100, 100 - penalty));

  let healthLabel = 'EXCELLENT';
  if (criticalRiskCount > 0) {
    healthLabel = criticalRiskCount >= 2 ? 'HIGH_RISK_BLOCKED' : 'ACTION_REQUIRED';
  } else if (warningRiskCount > 0) {
    healthLabel = 'MODERATE_REVIEW_RECOMMENDED';
  }

  return {
    alignmentScore,
    criticalRiskCount,
    warningRiskCount,
    safeCount,
    healthLabel,
  };
}

module.exports = { calculateAgreementRisk };
