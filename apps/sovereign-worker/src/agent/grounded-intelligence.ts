export type GroundedConceptId =
  | 'differentiation'
  | 'system_anxiety'
  | 'triangles'
  | 'overfunctioning_underfunctioning'
  | 'multigenerational_transmission'
  | 'emotional_cutoff'
  | 'learned_beliefs_expectations'
  | 'boundaries_responsibility'
  | 'competing_internal_needs'
  | 'protective_reactions'
  | 'burdens'
  | 'polarization'
  | 'projection';

export interface GroundedConcept {
  id: GroundedConceptId;
  internalDefinition: string;
  plainLanguage: string;
  usefulFor: string[];
  cannotInfer: string[];
  safeExamples: string[];
  unsafeExamples: string[];
  source: { title: string; url: string };
  signals: RegExp[];
}

const bowenSource = {
  title: 'Bowen Center — The Eight Concepts of Bowen Theory',
  url: 'https://www.thebowencenter.org/core-concepts-diagrams'
};
const ifsSource = {
  title: 'Internal Family Systems Institute — The IFS Model',
  url: 'https://ifs-institute.com/resources/articles/internal-family-systems-model-outline'
};

export const groundedConcepts: readonly GroundedConcept[] = [
  {
    id: 'differentiation',
    internalDefinition: 'The capacity to stay connected to others while thinking and acting from one’s own considered position under pressure.',
    plainLanguage: 'Staying connected without losing your own judgment.',
    usefulFor: ['pressure to agree', 'conflict without cutoff', 'alignment under group pressure'],
    cannotInfer: ['emotional health', 'maturity', 'the correct choice'],
    safeExamples: ['You can hear their concern and still decide what is yours to do.'],
    unsafeExamples: ['You are undifferentiated and emotionally immature.'],
    source: bowenSource,
    signals: [/pressure to agree/i, /lose myself/i, /keep the peace/i, /aligned/i, /supposed to/i, /(?:baseline|design).*relationship|relationship.*wrong/i]
  },
  {
    id: 'system_anxiety',
    internalDefinition: 'Pressure that spreads through a relationship group and can narrow choices or intensify familiar reactions.',
    plainLanguage: 'Tension can move through a group and make everyone react faster.',
    usefulFor: ['family tension', 'group escalation', 'responsibility for everyone'],
    cannotInfer: ['who started the tension', 'a diagnosis', 'any person’s motive'],
    safeExamples: ['When tension rises, people may fall into familiar ways of coping.'],
    unsafeExamples: ['Your family is anxious because your mother controls everyone.'],
    source: bowenSource,
    signals: [/everyone/i, /whole family/i, /family.*tense/i, /keep.*calm/i, /things fall apart/i, /scapegoat/i]
  },
  {
    id: 'triangles',
    internalDefinition: 'A three-person interaction pattern in which tension between two people is managed through a third relationship.',
    plainLanguage: 'Two people may pull in a third person when dealing directly feels hard.',
    usefulFor: ['being put in the middle', 'messenger roles', 'alliance pressure'],
    cannotInfer: ['deliberate manipulation', 'fault', 'private loyalties'],
    safeExamples: ['You can step out of the middle without deciding who is right.'],
    unsafeExamples: ['They triangulated you on purpose to control the family.'],
    source: bowenSource,
    signals: [/in the middle/i, /take.*side/i, /between (?:them|us)/i, /messenger/i, /tell (?:him|her|them)/i]
  },
  {
    id: 'overfunctioning_underfunctioning',
    internalDefinition: 'A reciprocal pattern in which one person assumes increasing responsibility as another assumes less, which can stabilize and reinforce both positions.',
    plainLanguage: 'The more one person takes over, the easier it can become for someone else to step back.',
    usefulFor: ['rescuing', 'uneven responsibility', 'burnout from managing others'],
    cannotInfer: ['competence', 'laziness', 'why either person acts this way'],
    safeExamples: ['Helping is a choice; noticing a problem does not automatically make it yours.'],
    unsafeExamples: ['You are the overfunctioner and they are dependent on you.'],
    source: bowenSource,
    signals: [/responsible for everyone/i, /do everything/i, /step(?:ping)? in/i, /rescu/i, /fix (?:it|everything|them)/i]
  },
  {
    id: 'multigenerational_transmission',
    internalDefinition: 'Ways relationship expectations and responses may be learned, reinforced, and repeated across generations without determining future behavior.',
    plainLanguage: 'Families can pass down expectations and ways of responding, and those patterns can change.',
    usefulFor: ['family chains', 'repeated generational patterns', 'inherited expectations'],
    cannotInfer: ['a curse', 'a single origin', 'inevitable repetition'],
    safeExamples: ['You can name the pattern you see and choose one part not to repeat.'],
    unsafeExamples: ['Your bloodline carries this wound and you must break it.'],
    source: bowenSource,
    signals: [/generational/i, /family chain/i, /break.*chain/i, /passed down/i, /every generation/i, /curse/i, /keep happening.*family|family.*keep happening/i]
  },
  {
    id: 'emotional_cutoff',
    internalDefinition: 'Managing unresolved relationship intensity mainly through distance or reduced contact; distance alone does not reveal why it is needed.',
    plainLanguage: 'Distance can lower tension without settling what the relationship means.',
    usefulFor: ['wanting to disappear', 'distance after conflict', 'contact decisions'],
    cannotInfer: ['avoidance', 'lack of care', 'whether contact is safe'],
    safeExamples: ['Space may help; you can decide what amount of contact is safe and workable.'],
    unsafeExamples: ['Your cutoff proves you are avoidant.'],
    source: bowenSource,
    signals: [/disappear/i, /cut (?:them|him|her) off/i, /no contact/i, /distance myself/i, /never speak/i]
  },
  {
    id: 'learned_beliefs_expectations',
    internalDefinition: 'Rules and predictions learned through repeated experience that may shape attention and choices without being objective facts.',
    plainLanguage: 'A familiar rule can feel true even when it has not been tested here.',
    usefulFor: ['limiting beliefs', 'family rules', 'expectations about belonging'],
    cannotInfer: ['the original event', 'who taught the belief', 'that the belief is false in every setting'],
    safeExamples: ['Ask whether this is a present fact or an old rule showing up again.'],
    unsafeExamples: ['Your parents programmed this limiting belief into you.'],
    source: { title: 'APA Dictionary of Psychology — Schema', url: 'https://dictionary.apa.org/schema' },
    signals: [/limiting belief/i, /always have to/i, /family rule/i, /not allowed to/i, /learned.*expect/i]
  },
  {
    id: 'boundaries_responsibility',
    internalDefinition: 'Distinguishing one’s own choices, limits, commitments, and effects from outcomes or internal states controlled by other people.',
    plainLanguage: 'Care about what happens without taking ownership of another person’s part.',
    usefulFor: ['baggage', 'forgiveness pressure', 'uneven responsibility', 'limits'],
    cannotInfer: ['what boundary is safe', 'that withdrawal is required', 'another person’s obligations'],
    safeExamples: ['You can own your choice and leave their response with them.'],
    unsafeExamples: ['Set a hard boundary and cut them off now.'],
    source: { title: 'APA — Building and maintaining healthy relationships', url: 'https://www.apa.org/topics/relationships' },
    signals: [/baggage/i, /responsib/i, /boundary/i, /forgive/i, /mine to carry/i, /owe (?:them|him|her)/i]
  },
  {
    id: 'competing_internal_needs',
    internalDefinition: 'Two valid needs or action tendencies can be active at the same time without either defining the whole person.',
    plainLanguage: 'Two real needs can pull in different directions.',
    usefulFor: ['mixed feelings', 'closeness and distance', 'decision conflict'],
    cannotInfer: ['a disorder', 'separate personalities', 'which need should win'],
    safeExamples: ['One need may want connection while another wants space; both can be heard.'],
    unsafeExamples: ['Your polarized parts are fighting for control.'],
    source: ifsSource,
    signals: [/part of me/i, /torn between/i, /both want/i, /conflicting reaction/i, /mixed feelings/i]
  },
  {
    id: 'protective_reactions',
    internalDefinition: 'Automatic responses that may have reduced threat or discomfort before, while their present purpose and origin remain uncertain.',
    plainLanguage: 'A quick reaction may be trying to keep something difficult from happening.',
    usefulFor: ['strong automatic reactions', 'defensiveness', 'withdrawal'],
    cannotInfer: ['trauma', 'a hidden wound', 'the reaction’s exact purpose'],
    safeExamples: ['The reaction may be protective; check what feels at risk before naming why.'],
    unsafeExamples: ['Your protector formed because of childhood trauma.'],
    source: ifsSource,
    signals: [/automatic/i, /react before/i, /defensive/i, /shut down/i, /protect(?:ing|ive)/i]
  },
  {
    id: 'burdens',
    internalDefinition: 'Painful beliefs or responsibilities a person experiences as carried; the metaphor does not establish where they came from.',
    plainLanguage: 'You may be carrying a belief or responsibility that can be examined rather than obeyed.',
    usefulFor: ['carrying baggage', 'shame', 'borrowed responsibility'],
    cannotInfer: ['who caused it', 'trauma history', 'that it belongs to someone else'],
    safeExamples: ['You can ask whether this responsibility is truly yours today.'],
    unsafeExamples: ['This is your mother’s burden living inside you.'],
    source: ifsSource,
    signals: [/burden/i, /baggage/i, /carry(?:ing)? .*for/i, /not mine/i, /weight.*family/i]
  },
  {
    id: 'polarization',
    internalDefinition: 'Opposing action tendencies can intensify each other, making either-or choices feel more necessary than they are.',
    plainLanguage: 'The harder one side pulls, the harder the other may pull back.',
    usefulFor: ['inner conflict', 'relationship stalemates', 'all-or-nothing choices'],
    cannotInfer: ['pathology', 'equal responsibility', 'the correct compromise'],
    safeExamples: ['Slow the either-or choice long enough to hear what each side is protecting.'],
    unsafeExamples: ['Your polarized system is dysregulated.'],
    source: ifsSource,
    signals: [/part of me/i, /either.*or/i, /push.*pull/i, /opposite/i, /torn/i]
  },
  {
    id: 'projection',
    internalDefinition: 'An interpretation that someone may be attributing their own feelings or expectations elsewhere; it cannot be established from accusation alone.',
    plainLanguage: 'Someone may be reacting through their own expectations, but you cannot know that without stronger evidence.',
    usefulFor: ['projection claims', 'misread intentions', 'separating impact from explanation'],
    cannotInfer: ['another person’s unconscious process', 'motive', 'diagnosis', 'that the claim is true'],
    safeExamples: ['Name what was said or done and its impact before deciding what caused it.'],
    unsafeExamples: ['Your mother is projecting her insecurity onto you.'],
    source: { title: 'APA Dictionary of Psychology — Projection', url: 'https://dictionary.apa.org/projection' },
    signals: [/project(?:ing|ion)/i, /really feel/i, /secretly/i, /manipulat/i, /motive/i]
  }
] as const;

export interface RoutedGroundedConcept {
  id: GroundedConceptId;
  plainLanguage: string;
  usefulFor: string[];
  cannotInfer: string[];
  safeGuidance: string;
}

export function routeGroundedIntelligence(input: string, limit = 2): RoutedGroundedConcept[] {
  return groundedConcepts
    .map((concept, index) => ({ concept, index, score: concept.signals.reduce((score, signal) => score + (signal.test(input) ? 1 : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ concept }) => ({
      id: concept.id,
      plainLanguage: concept.plainLanguage,
      usefulFor: concept.usefulFor,
      cannotInfer: concept.cannotInfer,
      safeGuidance: concept.safeExamples[0]!
    }));
}

export function groundedIntelligencePrompt(input: string): string {
  const selected = routeGroundedIntelligence(input);
  if (!selected.length) return 'No grounded relational concept was selected. Do not force a psychological explanation.';
  return `Private reasoning aids (never name these labels unless the user explicitly asks):\n${JSON.stringify(selected)}\nUse them only as possibilities supported by the available facts. Do not force a psychological explanation.`;
}
