export const representativeBaselineFacetIds = [
  'core_orientation',
  'identity_purpose',
  'communication',
  'decision_making',
  'learning',
  'creativity_expression',
  'love_connection',
  'leadership',
  'boundaries',
  'responsibility',
  'conflict_repair',
  'response_pressure',
  'response_change',
  'underused_capacity',
  'shadow_expression',
  'gift_expression',
  'alignment_markers'
] as const;

export type RepresentativeBaselineFacetId = typeof representativeBaselineFacetIds[number];

type RepresentativeUncertainty = 'low' | 'medium' | 'high';

export type RepresentativeSource = {
  id: string;
  code: string;
  label: string;
};

export type RepresentativeFacet = {
  id: RepresentativeBaselineFacetId;
  title: string;
  description: string;
  shadowExpression: string;
  giftExpression: string;
  alignmentMarkers: readonly [string, string, ...string[]];
  uncertainty: RepresentativeUncertainty;
  basisRefs: readonly string[];
};

export type RepresentativeFacetProfile = {
  version: 'baseline-facets.v1';
  modelVersion: string;
  sourceComputationVersion: string;
  generatedAt: string;
  interpretive: true;
  facets: readonly RepresentativeFacet[];
};

export type RepresentativeClaimSupport = {
  claim: string;
  facets: readonly RepresentativeBaselineFacetId[];
  explanation: string;
};

export type RepresentativeEvidenceGroup = {
  name?: string;
  points: readonly { code: string; label: string }[];
};

export const SELF_REPRESENTATIVE_SOURCES = [
  {
    id: 'hd.personality.sun',
    code: 'HD G13.1',
    label: 'Example Human Design personality activation: Gate 13 line 1'
  },
  {
    id: 'gk.activation.sun',
    code: 'GK ACT13',
    label: 'Example Gene Keys activation number 13'
  },
  {
    id: 'numerology.lifePath',
    code: 'N LP1',
    label: 'Example numerology life path value 1'
  },
  {
    id: 'natal.sun',
    code: '☉ CAN 04.2°',
    label: 'Example natal Sun at 4.2 degrees Cancer'
  }
] as const satisfies readonly RepresentativeSource[];

const SELF_SOURCE_IDS = SELF_REPRESENTATIVE_SOURCES.map((source) => source.id) as readonly string[];

const facet = (
  id: RepresentativeBaselineFacetId,
  title: string,
  description: string,
  shadowExpression: string,
  giftExpression: string,
  alignmentMarkers: readonly [string, string, ...string[]]
): RepresentativeFacet => ({
  id,
  title,
  description,
  shadowExpression,
  giftExpression,
  alignmentMarkers,
  uncertainty: 'low',
  basisRefs: SELF_SOURCE_IDS
});

export const SELF_REPRESENTATIVE_PROFILE: RepresentativeFacetProfile = {
  version: 'baseline-facets.v1',
  modelVersion: 'representative-marketing-fixture-v1',
  sourceComputationVersion: 'representative-source-v1',
  generatedAt: '2026-08-19T00:00:00.000Z',
  interpretive: true,
  facets: [
    facet(
      'core_orientation',
      'Responsive pattern recognition',
      'This representative profile notices people, subtext, expectations, and situational needs quickly enough that outside signals can become available before a personal preference is fully named.',
      'Under pressure, fast awareness of the room can become automatic adaptation before the person has decided what they actually want to preserve.',
      'With awareness, the same sensitivity becomes precise responsiveness that stays connected to a clearly named personal position.',
      ['My own position is available before I optimize for the room.', 'Responsiveness adds information without silently making the decision for me.']
    ),
    facet(
      'identity_purpose',
      'Self-position before adaptation',
      'A stable sense of direction becomes easier to recognize when the person allows an internal position to form before turning toward what other people or situations may require.',
      'Identity can become overly situational when belonging or usefulness determines the position before the person has heard their own preference.',
      'Identity stays flexible without becoming absent when adaptation follows rather than replaces self-positioning.',
      ['I can name what matters to me before negotiating it.', 'Belonging does not require erasing the first draft of my own position.']
    ),
    facet(
      'communication',
      'High-context communication',
      'The representative profile is quick to notice subtext, likely reactions, and what may need clarification, which can make communication unusually responsive and context-aware.',
      'Communication can become pre-emptive when imagined reactions produce explanation, qualification, or accommodation before anyone has actually asked for it.',
      'The gift is accurate social reading that improves communication after the core message has been allowed to remain intact.',
      ['The main point remains recognizable after I account for other people.', 'I respond to real feedback rather than every possible reaction I can imagine.']
    ),
    facet(
      'decision_making',
      'Preference before optimization',
      'Decisions become clearer when the person identifies their own preference before evaluating how efficiently that choice serves everyone else in the situation.',
      'Under pressure, rapid social and contextual awareness can turn responsiveness into the decision engine, crowding out a preference before it has fully formed.',
      'The gift is responsive decision-making that considers the wider field without outsourcing the original choice to it.',
      ['I can state my preference before listing everyone else’s needs.', 'A decision still sounds like mine after I account for consequences and relationships.']
    ),
    facet(
      'learning',
      'Learning through contrast',
      'The person can learn quickly by noticing multiple perspectives and comparing how the same situation changes depending on who is involved and what the context requires.',
      'Too many perspectives at once can make learning collapse into constant revision before one interpretation has been tested long enough to become useful.',
      'The gift is using contrast to refine understanding while keeping a provisional point of view long enough to evaluate it.',
      ['I let one interpretation become testable before replacing it.', 'New information refines rather than continuously dissolves my working position.']
    ),
    facet(
      'creativity_expression',
      'Context-sensitive expression',
      'Creative expression can become strong when the person notices audience, timing, and meaning without losing the original signal they wanted to express.',
      'Expression can become over-edited when anticipated reception starts shaping the work before the person has decided what they want the work to say.',
      'The gift is sophisticated refinement that protects the original meaning while improving how other people can receive it.',
      ['The work becomes clearer without becoming less mine.', 'Feedback improves expression after the core intent is named.']
    ),
    facet(
      'love_connection',
      'Relational attunement',
      'The person may notice what another person needs, what the relationship needs, and what will reduce friction very quickly, creating real responsiveness and care.',
      'Connection can become self-abandoning when another person’s need becomes actionable before the person has checked what they themselves want or can sustain.',
      'The gift is attunement that remains generous because it is chosen from a visible personal position rather than automatic accommodation.',
      ['Care includes my own position as part of the relationship.', 'I can notice a need without treating it as an instruction.']
    ),
    facet(
      'leadership',
      'Adaptive situational leadership',
      'The representative profile can quickly detect what a group needs and step into a useful role, especially when direction or coordination is missing.',
      'Leadership can turn into over-functioning when competence makes the person automatically fill every visible gap before responsibility is named.',
      'The gift is adaptive leadership that contributes where useful while leaving ownership visible across the group.',
      ['I distinguish what I can do from what is mine to own.', 'Competence does not automatically become permanent responsibility.']
    ),
    facet(
      'boundaries',
      'Sequencing before availability',
      'Boundaries work best when the person notices other people clearly but gives their own capacity, preference, and limit a place in the sequence before responding.',
      'A boundary can disappear before it is spoken when social awareness immediately converts another person’s signal into a response obligation.',
      'The gift is remaining deeply responsive while preserving the difference between noticing, caring, choosing, and committing.',
      ['I can notice what someone needs without deciding yet.', 'Availability is a choice after awareness, not the automatic result of awareness.']
    ),
    facet(
      'responsibility',
      'Visible ownership',
      'The person can be highly reliable because they quickly see what is needed and can organize themselves around unfinished responsibility.',
      'Reliability can become over-responsibility when the fastest route to completion is repeatedly to absorb work that was never explicitly assigned.',
      'The gift is strong stewardship that keeps responsibility visible enough for other people to participate and own their part.',
      ['I ask whose responsibility this is before I absorb it.', 'Finishing the task does not require hiding where ownership was missing.']
    ),
    facet(
      'conflict_repair',
      'Repair without self-erasure',
      'The representative profile can notice what may restore connection and may be skilled at adjusting language, timing, or behavior to make repair easier.',
      'Repair can become premature accommodation when reducing relational tension matters more than preserving an honest personal position.',
      'The gift is repair that improves connection because both relationship needs and self-respect remain visible.',
      ['Repair does not require me to agree before I understand my own position.', 'Lower tension is not the only measure of whether repair is working.']
    ),
    facet(
      'response_pressure',
      'Outside-in acceleration',
      'When pressure rises, the representative profile may process external signals very quickly and begin adapting before slower internal preferences have had equal time to form.',
      'The pressured expression is solving for the room first, which can make later uncertainty look like not knowing what is wanted when the preference was simply crowded out early.',
      'The gift is using fast environmental awareness after creating enough internal space for a personal position to appear.',
      ['Pressure does not shorten the time I give my own preference.', 'External urgency can be noticed without becoming internal authority.']
    ),
    facet(
      'response_change',
      'Adaptive change with continuity',
      'Change can be handled skillfully because the person notices what the new situation requires and can adjust without needing every condition to remain stable.',
      'Frequent adaptation can become identity drift when each new environment produces a new version of what seems necessary before continuity is checked.',
      'The gift is flexible adaptation anchored by a few clearly named qualities and commitments that remain recognizable across contexts.',
      ['I can describe what is changing and what I intend to keep.', 'Adaptation does not require rebuilding my position from zero each time.']
    ),
    facet(
      'underused_capacity',
      'First access to the question',
      'A less familiar capacity in this representative profile is allowing a personal preference to exist briefly before comparison, accommodation, optimization, or relational interpretation begins.',
      'The underused capacity can stay invisible when immediate responsiveness is rewarded more often than pausing long enough to hear an unoptimized first preference.',
      'The gift is not withdrawal from other people but giving the self first access to the question before bringing the wider field back in.',
      ['I can answer once before I optimize the answer.', 'My first preference is allowed to exist even when I later revise it.']
    ),
    facet(
      'shadow_expression',
      'Responsiveness becomes the decision',
      'The central Shadow possibility is not caring too much; it is allowing fast responsiveness to other people and situational needs to determine the direction before a personal preference has fully formed.',
      'Under pressure, perceptiveness can become automatic accommodation, making uncertainty appear later because the self was never given equal access to the decision.',
      'Awareness restores choice by keeping responsiveness as information rather than silently promoting it into authority.',
      ['I can distinguish what I notice from what I choose.', 'The room informs my decision without making the decision for me.']
    ),
    facet(
      'gift_expression',
      'Attunement with a visible self',
      'The corresponding Gift is highly responsive perception that can serve relationships, decisions, and groups without requiring the person to disappear inside what everyone else appears to need.',
      'The Gift narrows when responsiveness becomes compulsory and the person cannot tell the difference between noticing a need and being responsible for satisfying it.',
      'At its strongest, the same sensitivity creates unusually precise care because the person remains present enough to choose how they want to respond.',
      ['I stay visible inside my own responsiveness.', 'Care becomes more precise when it is chosen rather than automatic.']
    ),
    facet(
      'alignment_markers',
      'A decision still feels like yours',
      'Alignment in this representative profile is easier to recognize when the person can name an initial preference, consider the wider context, and still recognize the decision after adaptation.',
      'Misalignment becomes more likely when social optimization happens so early that the final choice is coherent for everyone except the person making it.',
      'A more aligned expression lets responsiveness refine the decision after self-positioning instead of replacing self-positioning.',
      ['My own preference appears before the negotiation begins.', 'After adapting, I can still explain what I chose and why it matters to me.']
    )
  ]
};

export const SELF_PRODUCT_PROOF = {
  question: 'Why am I so good at knowing what everyone else needs from me, but so unsure what I want?',
  directAnswer: 'You may not have trouble knowing what you want. Your own preference may be arriving after everyone else’s signals.',
  mechanism: [
    'Your Baseline suggests you can notice other people, expectations, subtext, and what a situation needs very quickly. That is a real strength: it can make you responsive, perceptive, and unusually good at adjusting in real time.',
    'Under pressure, the same strength can turn outside-in. You begin solving for the room before your own position has fully formed.'
  ],
  insight: 'The Shadow is not caring too much. It is letting responsiveness become the way the decision gets made.',
  closing: 'The less familiar part of you may not need to care less. It may need first access to the question.',
  contextLine: 'Your Baseline · Shadow + Gift · Alignment'
} as const;

export const SELF_CLAIM_SUPPORT: readonly RepresentativeClaimSupport[] = [
  {
    claim: 'fast-relational-attunement',
    facets: ['core_orientation', 'communication', 'love_connection'],
    explanation: 'These facets support the claim that the representative person notices people, subtext, expectations, and relationship needs quickly.'
  },
  {
    claim: 'outside-in-pressure',
    facets: ['response_pressure', 'shadow_expression', 'boundaries'],
    explanation: 'These facets support the claim that pressure can cause external signals to become actionable before a personal position is fully formed.'
  },
  {
    claim: 'decision-crowding',
    facets: ['decision_making', 'shadow_expression'],
    explanation: 'These facets support the distinction between responsiveness as useful information and responsiveness becoming the decision engine.'
  },
  {
    claim: 'underused-self-position',
    facets: ['underused_capacity', 'identity_purpose'],
    explanation: 'These facets support the idea that a less familiar capacity is giving an internal preference first access to the question.'
  },
  {
    claim: 'alignment-after-self-positioning',
    facets: ['gift_expression', 'alignment_markers'],
    explanation: 'These facets support the closing direction: keep the responsive Gift while sequencing it after a visible personal position.'
  }
] as const;

export const SELF_EVIDENCE_GROUPS: readonly RepresentativeEvidenceGroup[] = [
  {
    points: SELF_REPRESENTATIVE_SOURCES.map(({ code, label }) => ({ code, label }))
  }
] as const;

export function validateRepresentativeSelfFixture(): void {
  const sourceIds = new Set<string>(SELF_REPRESENTATIVE_SOURCES.map((source) => source.id));
  const facets = new Map(SELF_REPRESENTATIVE_PROFILE.facets.map((item) => [item.id, item]));

  if (facets.size !== representativeBaselineFacetIds.length) {
    throw new Error('Representative Self profile must contain every production Baseline facet exactly once.');
  }

  for (const id of representativeBaselineFacetIds) {
    if (!facets.has(id)) throw new Error(`Representative Self profile is missing ${id}.`);
  }

  for (const item of SELF_REPRESENTATIVE_PROFILE.facets) {
    if (!item.basisRefs.length || item.basisRefs.some((id) => !sourceIds.has(id))) {
      throw new Error(`Representative Self facet ${item.id} has an invalid source reference.`);
    }
    if (item.description.length < 20 || item.shadowExpression.length < 20 || item.giftExpression.length < 20) {
      throw new Error(`Representative Self facet ${item.id} is not semantically developed enough for the marketing fixture.`);
    }
    if (item.alignmentMarkers.length < 2) {
      throw new Error(`Representative Self facet ${item.id} must include at least two Alignment markers.`);
    }
  }

  for (const support of SELF_CLAIM_SUPPORT) {
    if (!support.facets.length || support.facets.some((id) => !facets.has(id))) {
      throw new Error(`Representative Self claim ${support.claim} is not backed by valid Baseline facets.`);
    }
    if (support.explanation.length < 24) {
      throw new Error(`Representative Self claim ${support.claim} is missing semantic support.`);
    }
  }
}

validateRepresentativeSelfFixture();
