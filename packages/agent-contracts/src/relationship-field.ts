/**
 * Relationship Field — the interaction dynamics layer.
 *
 * Emotional Field models one person's dynamic pattern.
 * Relationship Field models what happens between two people's patterns.
 *
 * Architecture:
 *   Participant A Emotional Field
 *          +
 *   Participant B Emotional Field
 *          +
 *   Pair contacts (synastry aspects)
 *          ↓
 *   Relationship Field
 *          ↓
 *   sovereign-answer.v2
 *
 * The Relationship Field consumes canonical Emotional Fields.
 * It does not recreate Baseline, Expression Field, or Emotional Field.
 *
 * The Relationship Field does not:
 * - Score compatibility
 * - Diagnose relationship health
 * - Claim knowledge of what either person intends or feels
 * - Predict relationship outcomes
 * - Replace direct observation and communication
 */

export const RELATIONSHIP_FIELD_VERSION = 'relationship-field.v1' as const;

/**
 * A structure that both participants share or reinforce.
 * Grounded in both participants' Baseline facets and Expression Field states.
 */
export interface SharedStructure {
  /** The Baseline facet this shared structure is grounded in. */
  facetId: string;
  /** Plain-language label for the shared structure. */
  label: string;
  /** What this shared structure looks like in observable terms. */
  description: string;
  /** How this shared structure may show up between the participants. */
  interactionDescription: string;
  /** Basis references from both participants grounding this observation. */
  basisRefs: string[];
}

/**
 * A structure where the participants differ or emphasize different facets.
 * Grounded in both participants' Baseline facets and Expression Field states.
 */
export interface ContrastingStructure {
  /** The Baseline facet where contrast appears. */
  facetId: string;
  /** Plain-language label for the contrasting structure. */
  label: string;
  /** What participant A emphasizes. */
  descriptionA: string;
  /** What participant B emphasizes. */
  descriptionB: string;
  /** How this contrast may show up between the participants. */
  interactionDescription: string;
  /** Basis references from both participants grounding this observation. */
  basisRefs: string[];
}

/**
 * How a specific Expression Field axis interacts between participants.
 * Describes observable dynamics, not internal states.
 */
export interface InteractionDynamic {
  /** The Expression Field axis this dynamic is grounded in. */
  axisId: string;
  /** Plain-language label for the axis. */
  label: string;
  /** How participant A expresses this axis. */
  dynamicA: string;
  /** How participant B expresses this axis. */
  dynamicB: string;
  /** What happens when these two expressions meet in interaction. */
  interactionDescription: string;
  /** Basis references from both participants grounding this observation. */
  basisRefs: string[];
}

/**
 * A recurring pattern that may form between participants.
 * Grounded in pair contacts and dominant expression axes.
 */
export interface RecurringPattern {
  /** Unique identifier for this pattern. */
  id: string;
  /** What this pattern looks like in observable terms. */
  description: string;
  /** What tends to reinforce or maintain this pattern. */
  sustainingConditions: string[];
  /** What could interrupt or change this pattern. */
  interruptingConditions: string[];
  /** Basis references grounding this pattern. */
  basisRefs: string[];
}

/**
 * What the pair has available to work with.
 */
export interface CapacityBetween {
  /** Qualities both participants bring that support the interaction. */
  availableStrengths: string[];
  /** Qualities that may need attention or room in the interaction. */
  emergingNeeds: string[];
  /** What still needs to be confirmed or discovered about the interaction. */
  openQuestions: string[];
}

/**
 * The complete Relationship Field between two participants.
 *
 * This is the interaction dynamics layer that sits between
 * two Emotional Fields and the sovereign-answer.v2 output.
 */
export interface RelationshipField {
  version: typeof RELATIONSHIP_FIELD_VERSION;
  generatedAt: string;

  /** The two participants in this relationship. */
  participants: {
    a: { label: string; key: string };
    b: { label: string; key: string };
  };

  /** The interaction loop: shared → contrasting → interaction → recurring → sustaining/changing → capacity. */
  loop: {
    sharedStructures: SharedStructure[];
    contrastingStructures: ContrastingStructure[];
    interactionDynamics: InteractionDynamic[];
    recurringPatterns: RecurringPattern[];
    sustainingForces: string[];
    changingForces: string[];
    availableCapacity: CapacityBetween;
  };

  /** Which Expression Field axes are most relevant to this relationship. */
  dominantInteractionAxes: string[];

  /** Summary of pair contacts between participants. */
  pairContactSummary: string[];

  /** All basis references from the full relationship field. */
  basisRefs: string[];

  /** Provenance: what was consumed to produce this field. */
  provenance: {
    emotionalFieldVersion: string;
    expressionFieldVersion: string;
    participantACount: number;
    participantBCount: number;
    pairContactCount: number;
    computationType: 'deterministic';
  };

  /** What this relationship field does not claim. */
  limitations: string[];
}

/**
 * Input required to compute a Relationship Field.
 * All inputs come from canonical Emotional Fields and pair data.
 */
export interface RelationshipFieldInput {
  /** Participant A's Emotional Field. */
  emotionalFieldA: {
    /** Participant label. */
    label: string;
    /** Participant key. */
    key: string;
    /** The emotional field. */
    field: import('./emotional-field').EmotionalField;
  };

  /** Participant B's Emotional Field. */
  emotionalFieldB: {
    /** Participant label. */
    label: string;
    /** Participant key. */
    key: string;
    /** The emotional field. */
    field: import('./emotional-field').EmotionalField;
  };

  /** Pair contacts between participants (synastry aspects). */
  pairContacts: Array<{
    id: string;
    display: string;
    accessibleLabel: string;
    uncertainty: string;
  }>;

  /** Facet pairs — matched facets from both participants. */
  facetPairs: Array<{
    facetId: string;
    participantA: {
      id: string;
      title: string;
      description: string;
      basisRefs: string[];
    };
    participantB: {
      id: string;
      title: string;
      description: string;
      basisRefs: string[];
    };
  }>;
}
