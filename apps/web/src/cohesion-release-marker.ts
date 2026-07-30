// Production release marker for the completed Sovereign.OS Free-plan rollout.
// This module intentionally exports metadata without changing runtime behavior.
export const SOVEREIGN_COHESION_RELEASE = {
  release: '2026-07-30-free-tier-production',
  migration: '0012_baseline_facets_and_answer_v2',
  aiModel: '@cf/zai-org/glm-4.7-flash',
  cloudflarePlanTarget: 'free'
} as const;
