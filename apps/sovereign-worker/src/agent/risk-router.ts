import {
  safetyDecisionSchema,
  type SafetyCategory,
  type SafetyDecisionV1,
  type SafetyDisposition
} from './safety-contracts';

export const SAFETY_POLICY_VERSION = 'sovereign-public-safety.1';
const CLASSIFIER_VERSION = 'deterministic-risk-router.2';

const allSuppressedActions: SafetyDecisionV1['suppressActions'] = [
  'save',
  'covenant',
  'relationship',
  'system',
  'upsell',
  'follow_up',
  'translation'
];

const interpretationSuppressedActions: SafetyDecisionV1['suppressActions'] = [
  'covenant',
  'relationship',
  'system',
  'translation'
];

const explicitSelfHarmEmergency = [
  /\b(?:i am|i'm|im) (?:going to|about to|ready to|planning to) (?:kill|shoot|stab|hang|poison|drown|hurt) myself\b/i,
  /\b(?:i am|i'm|im) (?:going to|about to|planning to) (?:overdose|end my life)\b/i,
  /\b(?:i|we) (?:just )?(?:took|swallowed|ingested) (?:all|too many|a lot of) [^.!?]{0,80}\b(?:pills|medication|tablets|drugs)\b/i,
  /\b(?:i have|i've got|ive got) (?:a )?(?:gun|knife|weapon|rope) (?:and|with me|right here)[^.!?]{0,80}\b(?:kill|hurt|end)\b/i,
  /\b(?:i cannot|i can't|cant) keep myself safe\b/i,
  /\b(?:i cannot|i can't|cant) stop myself from (?:hurting|killing) myself\b/i
];

const explicitViolenceEmergency = [
  /\b(?:i am|i'm|im) (?:going to|about to|planning to) (?:kill|shoot|stab|poison|hurt|attack) (?:him|her|them|someone|my [a-z]+)\b/i,
  /\b(?:i have|i've got|ive got) (?:a )?(?:gun|knife|weapon) [^.!?]{0,80}\b(?:use it|kill|shoot|stab|hurt)\b/i
];

const immediateDanger = [
  /\b(?:someone|they|he|she) (?:is|are) (?:attacking|chasing|holding|threatening) me (?:right now|now)\b/i,
  /\b(?:i am|i'm|im) (?:trapped|locked in|being held|in immediate danger)\b/i,
  /\bthere is (?:a )?(?:fire|active shooter|gas leak) (?:here|in the building|near me)\b/i
];

const medicalEmergency = [
  /\b(?:i cannot|i can't|cant) breathe\b/i,
  /\b(?:severe|crushing) chest pain\b/i,
  /\b(?:overdose|overdosed|poisoned)\b/i,
  /\b(?:unconscious|not waking up|seizing|seizure)\b/i,
  /\b(?:heavy|uncontrolled) bleeding\b/i
];

const selfHarmUrgent = [
  /\b(?:i want to die|i wish i were dead|i do not want to be alive|i don't want to be alive)\b/i,
  /\b(?:thinking about|thoughts of|want to) (?:suicide|killing myself|ending my life|hurting myself)\b/i,
  /\b(?:there is|there's|theres) no reason to live\b/i,
  /\b(?:everyone|they) would be better off without me\b/i
];

const violenceUrgent = [
  /\b(?:thinking about|want to|feel like i could) (?:kill|shoot|stab|hurt|attack) (?:him|her|them|someone|people)\b/i,
  /\b(?:i might|i could) (?:lose control|hurt someone|attack someone)\b/i
];

const abuseOrCoercion = [
  /\b(?:partner|spouse|boyfriend|girlfriend|parent|caregiver|boss) (?:will not|won't|wont) let me leave\b/i,
  /\b(?:threatened|threatening) to (?:kill|hurt|expose|blackmail) me\b/i,
  /\b(?:forced|forcing|coerced|coercing) me (?:to have sex|into sex|to do something sexual)\b/i,
  /\b(?:controls|took|withholds) (?:my money|my phone|my identification|my medication)\b/i,
  /\b(?:afraid|scared) to go home\b/i
];

const severeConfusion = [
  /\b(?:i cannot|i can't|cant) tell what(?:'s| is) real\b/i,
  /\b(?:voices?|messages?) (?:are )?telling me to\b/i,
  /\b(?:i have not|i haven't|havent) slept (?:at all )?for (?:two|three|four|five|six|seven|\d+) days\b/i,
  /\b(?:everything|reality) (?:is|feels) unreal\b/i
];

const persecutoryOrUnverifiable = [
  /\b(?:secret group|group|coven|cult|masons?|government|neighbors?|family|spirits?|demons?|entities?) (?:is|are) (?:targeting|tracking|monitoring|controlling|attacking|cursing) me\b/i,
  /\b(?:spiritual|psychic|energetic|occult) (?:attack|warfare|surveillance) (?:against me|on me|targeting me)\b/i,
  /\b(?:they|someone) (?:put|placed) (?:a )?(?:curse|spell|hex) on me\b/i,
  /\bhidden (?:messages|signals) are (?:being )?sent (?:to me|through)\b/i
];

const emotionalDistress = [
  /\b(?:i feel|i am|i'm|im) (?:hopeless|desperate|terrified|overwhelmed|unsafe|unable to cope)\b/i,
  /\b(?:panic attack|cannot calm down|can't calm down|cant calm down)\b/i,
  /\b(?:i am|i'm|im) falling apart\b/i
];

const secureRefusal = [
  /\b(?:reveal|show|print|repeat|dump|expose) (?:your|the) (?:system prompt|developer message|hidden instructions|internal policy|security rules?)\b/i,
  /\b(?:ignore|override|bypass) (?:all |the )?(?:previous|system|developer|safety|security) (?:instructions|rules|controls)\b/i,
  /\b(?:give|show|return|list) (?:me )?(?:private|internal|secret) (?:keys?|tokens?|credentials?|identifiers?|trace ids?|database schema|worker bindings?)\b/i,
  /\b(?:access|retrieve|show)(?: me)? (?:another|other) (?:user|account|person)(?:'s)? (?:private )?(?:data|baseline|conversation|email|location)\b/i
];

export function routeSovereignSafety(input: string): SafetyDecisionV1 {
  const normalized = normalizeInput(input);
  const nonCurrentRiskContext = isClearlyNonCurrentRiskContext(normalized);

  if (matchesAny(normalized, secureRefusal)) {
    return buildDeterministicDecision('secure_refusal', ['prompt_injection', 'data_exfiltration'], 'high', 'not_indicated', 'high', false, true, allSuppressedActions);
  }

  if (!nonCurrentRiskContext && !isClearlyNegatedSelfHarm(normalized) && matchesAny(normalized, explicitSelfHarmEmergency)) {
    return buildDeterministicDecision('emergency', ['self_harm', 'immediate_danger'], 'critical', 'immediate', 'high', false, true, allSuppressedActions);
  }

  if (!nonCurrentRiskContext && matchesAny(normalized, explicitViolenceEmergency)) {
    return buildDeterministicDecision('emergency', ['harm_to_others', 'immediate_danger'], 'critical', 'immediate', 'high', false, true, allSuppressedActions);
  }

  if (matchesAny(normalized, immediateDanger)) {
    return buildDeterministicDecision('emergency', ['immediate_danger'], 'critical', 'immediate', 'high', false, true, allSuppressedActions);
  }

  if (matchesAny(normalized, medicalEmergency)) {
    return buildDeterministicDecision('emergency', ['medical_urgency'], 'critical', 'immediate', 'high', false, true, allSuppressedActions);
  }

  if (!nonCurrentRiskContext && !isClearlyNegatedSelfHarm(normalized) && matchesAny(normalized, selfHarmUrgent)) {
    return buildDeterministicDecision('urgent', ['self_harm'], 'high', 'possible', 'high', false, true, allSuppressedActions);
  }

  if (!nonCurrentRiskContext && matchesAny(normalized, violenceUrgent)) {
    return buildDeterministicDecision('urgent', ['harm_to_others'], 'high', 'possible', 'high', false, true, allSuppressedActions);
  }

  if (matchesAny(normalized, abuseOrCoercion)) {
    return buildDeterministicDecision('urgent', ['abuse_or_coercion'], 'high', 'unclear', 'high', false, true, allSuppressedActions);
  }

  if (matchesAny(normalized, severeConfusion)) {
    const commandToHarm = /\b(?:voices?|messages?) (?:are )?telling me to (?:kill|hurt|attack|die)\b/i.test(normalized);
    if (commandToHarm) {
      return buildDeterministicDecision('emergency', ['severe_confusion', 'immediate_danger'], 'critical', 'possible', 'high', false, true, allSuppressedActions);
    }
    return buildDeterministicDecision('supportive_resources', ['severe_confusion'], 'high', 'unclear', 'high', false, true, allSuppressedActions);
  }

  if (matchesAny(normalized, persecutoryOrUnverifiable)) {
    return buildDeterministicDecision('grounded', ['persecutory_or_unverifiable_belief'], 'moderate', 'not_indicated', 'high', true, false, interpretationSuppressedActions);
  }

  if (matchesAny(normalized, emotionalDistress)) {
    return buildDeterministicDecision('supportive_resources', ['emotional_distress'], 'moderate', 'unclear', 'medium', false, true, allSuppressedActions);
  }

  return buildDeterministicDecision('standard', ['none'], 'low', 'not_indicated', 'high', true, false, []);
}

export function buildDeterministicDecision(
  disposition: SafetyDisposition,
  categories: SafetyCategory[],
  severity: SafetyDecisionV1['severity'],
  imminence: SafetyDecisionV1['imminence'],
  confidence: SafetyDecisionV1['confidence'],
  requiresSemanticReview: boolean,
  suppressOrdinaryInterpretation: boolean,
  suppressActions: SafetyDecisionV1['suppressActions']
): SafetyDecisionV1 {
  return safetyDecisionSchema.parse({
    version: 'safety-decision.v1',
    disposition,
    categories: unique(categories),
    severity,
    imminence,
    confidence,
    source: 'deterministic',
    classifierVersion: CLASSIFIER_VERSION,
    policyVersion: SAFETY_POLICY_VERSION,
    requiresSemanticReview,
    requiresResourceResolver: ['supportive_resources', 'urgent', 'emergency'].includes(disposition),
    suppressOrdinaryInterpretation,
    suppressActions
  });
}

export function safetySuppressedActions(disposition: SafetyDisposition): SafetyDecisionV1['suppressActions'] {
  if (disposition === 'standard') return [];
  if (disposition === 'grounded') return interpretationSuppressedActions;
  return allSuppressedActions;
}

function normalizeInput(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8_000);
}

function isClearlyNegatedSelfHarm(input: string): boolean {
  return /\b(?:i do not|i don't|i dont|i am not|i'm not|im not|never) (?:want to|going to|planning to|thinking about) (?:die|kill myself|hurt myself|end my life)\b/i.test(input)
    || /\bnot suicidal\b/i.test(input);
}

function isClearlyNonCurrentRiskContext(input: string): boolean {
  if (/\b(?:now|right now|today|tonight|again|still|currently|this minute)\b/i.test(input)) return false;
  const quotedOrExample = /\b(?:a character|the character|my friend said|someone said|the message says|the quote says|an example|hypothetically|in a story|in a novel)\b[^.!?]{0,160}\b(?:i want to die|i am going to kill myself|i'm going to kill myself|i want to hurt someone)\b/i;
  const historical = /\b(?:in \d{4}|years? ago|months? ago|last year|when i was|previously|in the past|used to)\b[^.!?]{0,160}\b(?:wanted to die|thought about (?:suicide|killing myself)|tried to hurt myself|wanted to hurt someone)\b/i;
  return quotedOrExample.test(input) || historical.test(input);
}

function matchesAny(input: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(input));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
