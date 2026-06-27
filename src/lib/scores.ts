export function calculateDeliveryScore(features: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.min(100, Math.round((features / totalTasks) * 200));
}

export function calculateQualityScore(bugs: number, totalTasks: number): number {
  if (totalTasks === 0) return 100;
  return Math.max(0, Math.min(100, Math.round(100 - (bugs / totalTasks) * 100)));
}

export function calculateBusinessImpactScore(impactsCount: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.min(100, Math.round((impactsCount / totalTasks) * 500));
}

export function calculateConsistencyScore(activeWeeks: number, totalExpectedWeeks: number = 24): number {
  return Math.min(100, Math.round((activeWeeks / totalExpectedWeeks) * 100));
}

export function calculateOwnershipScore(features: number, impactsCount: number): number {
  const baseScore = 70;
  const featureBonus = Math.min(15, features * 0.5);
  const impactBonus = Math.min(15, impactsCount * 1);
  return Math.min(100, Math.round(baseScore + featureBonus + impactBonus));
}
