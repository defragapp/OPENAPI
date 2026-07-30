// Production release marker for the completed Sovereign.OS Free-plan rollout.
// This module intentionally exports metadata without changing runtime behavior.
export const SOVEREIGN_COHESION_RELEASE = {
  release: '2026-07-30-free-tier-production',
  migration: '0013_workers_ai_free_capacity',
  aiModel: '@cf/zai-org/glm-4.7-flash',
  dailyNeuronReservationBudget: 7_500,
  cloudflarePlanTarget: 'free'
} as const;
