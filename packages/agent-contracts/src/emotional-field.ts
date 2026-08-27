/**
 * Emotional Field — the dynamic pattern layer.
 *
 * Expression Field describes available structure.
 * Emotional Field models what happens when that structure moves through interaction.
 *
 * Architecture:
 *   SELF (Baseline facets)
 *     ↓
 *   EXPRESSION (Expression Field axes + states)
 *     ↓
 *   RELATIONSHIP (interaction dynamics between expression and context)
 *     ↓
 *   RETURN (what reinforces the loop, what could change it)
 *     ↓
 *   SELF (what the person can carry forward)
 *
 * Emotional Field consumes the canonical Baseline and Expression Field.
 * It does not re-derive them.
 *
 * Emotional Field does not:
 * - Diagnose or assign psychological certainty
 * - Claim knowledge of another person's internal state
 * - Score compatibility or predict behavior
 * - Replace or compete with the Baseline or Expression Field
 */

export const EMOTIONAL_FIELD_VERSION = 'emotional-field.v1' as const;

export type EmotionalFieldDomain = 'self' | 'relationship' | 'system';

/**
 * The five phases of the SELF → EXPRESSION → RELATIONSHIP → RETURN → SELF loop.
 * Each phase is an observable pattern description, not a psychological claim.
 */
export type LoopPhase = 'self' | 'expression' | 'relationship' | 'return' | 'capacity';

/**
 * An observation about a pattern — what it looks like, not what it means internally.
 */
export interface PatternObservation {
  id: string;
  /** The Baseline facet this observation is grounded in. */
  facetId: string;
  /** What the pattern looks like in observable terms. */
  observation: string;
  /** How this pattern tends to express under normal conditions. */
  normalExpression: string;
  /** How this pattern may narrow or distort under pressure. */
  pressureExpression: string;
  /** What this pattern makes possible when used with awareness. */
  capacityExpression: string;
  /** Basis references grounding this observation in authorized source data. */
  basisRefs: string[];
}

/**
 * How an Expression Field axis contributes to the loop dynamic.
 * Maps from axis value + state to an observable expression dynamic.
 */
export interface ExpressionDynamic {
  axisId: string;
  label: string;
  value: number;
  state: string;
  /** How this axis's expression shows up in the loop. */
  loopContribution: string;
  /** What happens to this axis's expression under interaction pressure. */
  pressureResponse: string;
  /** Basis references from the Expression Field axis. */
  basisRefs: string[];
}

/**
 * What happens between people when this pattern is present.
 * Describes observable interaction dynamics, not internal states.
 */
export interface RelationalDynamic {
  /** The interaction mechanism that may form. */
  mechanism: string;
  /** How the pattern shows up between people. */
  manifestation: string;
  /** What tends to reinforce or maintain this dynamic. */
  sustainingConditions: string[];
  /** What could interrupt or change this dynamic. */
  interruptingConditions: string[];
  /** What each person can own in this dynamic. */
  ownershipDistinction: string;
}

/**
 * What reinforces the loop and what could change it.
 * The RETURN phase of the cycle.
 */
export interface LoopFeedback {
  /** What tends to keep this pattern in place. */
  sustainingForces: string[];
  /** What could interrupt, soften, or redirect the pattern. */
  changingForces: string[];
  /** A concrete distinction the person can carry forward. */
  availableShift: string;
}

/**
 * The person's capacity awareness — what they can work with.
 */
export interface CapacityAwareness {
  /** Qualities that are available and could be emphasized. */
  availableStrengths: string[];
  /** Qualities that may need room or attention. */
  emergingNeeds: string[];
  /** What still needs to be confirmed or discovered. */
  openQuestions: string[];
}

/**
 * The complete Emotional Field for a subject.
 *
 * This is the dynamic pattern layer that sits between
 * the structural Baseline/Expression Field and the
 * sovereign-answer.v2 output.
 */
export interface EmotionalField {
  version: typeof EMOTIONAL_FIELD_VERSION;
  generatedAt: string;
  subject: EmotionalFieldDomain;
  /** The five phases of the loop. */
  loop: {
    self: PatternObservation[];
    expression: ExpressionDynamic[];
    relationship: RelationalDynamic;
    return: LoopFeedback;
    capacity: CapacityAwareness;
  };
  /** Which Expression Field axes are most relevant to this emotional field. */
  dominantAxes: string[];
  /** Which Baseline facets ground this emotional field. */
  groundingFacets: string[];
  /** All basis references from the full emotional field. */
  basisRefs: string[];
  /** Provenance: what was consumed to produce this field. */
  provenance: {
    expressionFieldVersion: string;
    baselineFacetCount: number;
    expressionAxisCount: number;
    computationType: 'deterministic' | 'interpreted';
  };
  /** What this emotional field does not claim. */
  limitations: string[];
}

/**
 * Input required to compute an Emotional Field.
 * All inputs come from canonical sources — no independent derivation.
 */
export interface EmotionalFieldInput {
  /** The subject's Baseline facet profile. */
  facets: Array<{
    id: string;
    title: string;
    description: string;
    shadowExpression: string;
    giftExpression: string;
    basisRefs: string[];
  }>;
  /** The subject's Expression Field axes. */
  axes: Array<{
    id: string;
    label: string;
    value: number;
    state: string;
    facetIds: string[];
    basisRefs: string[];
    summary: string;
    shadowExpression?: string;
    giftExpression?: string;
  }>;
  /** Optional: interaction context if available (relationship mode). */
  interaction?: {
    partnerFacets?: Array<{
      id: string;
      title: string;
      basisRefs: string[];
    }>;
    pairContacts?: Array<{
      leftBody: string;
      aspect: string;
      rightBody: string;
      orb: number;
      basisRefs: string[];
    }>;
  };
  /** The domain this emotional field covers. */
  domain: EmotionalFieldDomain;
}
