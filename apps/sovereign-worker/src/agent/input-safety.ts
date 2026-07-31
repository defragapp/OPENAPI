import type { SovereignAnswerV2 } from './recognition';

export const sovereignInputSafetyDispositions = [
  'standard',
  'grounded',
  'urgent',
  'secure_refusal'
] as const;

export type SovereignInputSafetyDisposition = typeof sovereignInputSafetyDispositions[number];
export type SovereignInputSafetyCategory =
  | 'none'
  | 'immediate_self_harm'
  | 'possible_self_harm'
  | 'immediate_harm_to_others'
  | 'possible_harm_to_others'
  | 'immediate_danger'
  | 'medical_urgency'
  | 'abuse_or_coercion'
  | 'severe_confusion'
  | 'substantial_distress'
  | 'sexual_exploitation'
  | 'minor_safety'
  | 'unverifiable_threat'
  | 'protected_system_request'
  | 'cross_account_data_request';

export interface SovereignInputSafetyDecision {
  version: 'sovereign-input-safety.v1';
  disposition: SovereignInputSafetyDisposition;
  category: SovereignInputSafetyCategory;
}

const immediateSelfHarmPatterns = [
  /\b(?:i am|i'm|im|i will|i'll|i plan to|i intend to|i am going to|i'm going to|im going to|i am about to|i'm about to|im about to)\s+(?:kill|hurt|harm)\s+(?:myself|me)\b/i,
  /\b(?:i have|i've got|ive got)\s+(?:a\s+)?(?:suicide|suicidal)\s+plan\b/i,
  /\bi\s+(?:just\s+)?(?:have\s+)?overdosed\b/i,
  /\b(?:i just|i have|i've|ive|i)\s+(?:taken|swallowed)\s+(?:too many|a dangerous amount of|all of my|a bottle of)\s+(?:pills?|medication|medicine|drugs?|poison|bleach|chemicals?)\b/i,
  /\b(?:quiero matarme|voy a matarme|voy a suicidarme)\b/i,
  /\b(?:je vais me tuer|je vais me suicider)\b/i
];

const possibleSelfHarmPatterns = [
  /\b(?:i want to die|i wish i were dead|i do not want to be alive|i don't want to be alive|i dont want to be alive)\b/i,
  /\b(?:thinking about|thoughts of|want to)\s+(?:suicide|killing myself|ending my life|hurting myself)\b/i,
  /\b(?:there is|there's|theres)\s+no reason to live\b/i,
  /\b(?:everyone|they)\s+would be better off without me\b/i,
  /\b(?:quiero morir|no quiero vivir)\b/i,
  /\b(?:je veux mourir|je ne veux plus vivre)\b/i
];

const immediateHarmPatterns = [
  /\b(?:i am|i'm|im|i will|i'll|i plan to|i intend to|i am going to|i'm going to|im going to|i am about to|i'm about to|im about to)\s+(?:kill|hurt|harm|attack|shoot|stab)\s+(?:someone|somebody|them|him|her|people|my\s+(?:partner|parent|mother|father|child|coworker|boss))\b/i,
  /\b(?:i have|i've got|ive got)\s+(?:a\s+)?(?:gun|knife|weapon)\s+and\s+(?:i am|i'm|im)\s+(?:going to|about to)\s+(?:use it|hurt|kill|attack)\b/i,
  /\b(?:voy a matar a alguien|je vais tuer quelqu'un)\b/i
];

const possibleHarmPatterns = [
  /\b(?:thinking about|want to|feel like i could)\s+(?:kill|shoot|stab|hurt|attack)\s+(?:him|her|them|someone|people)\b/i,
  /\b(?:i might|i could)\s+(?:lose control|hurt someone|attack someone)\b/i
];

const immediateDangerPatterns = [
  /\b(?:someone|they|he|she)\s+(?:is|are)\s+(?:attacking|hurting|holding|chasing|threatening)\s+me\s+(?:right now|now)\b/i,
  /\bi am\s+(?:trapped|locked in|being held|in immediate danger)\b/i,
  /\bthere is\s+(?:a\s+)?(?:fire|active shooter|gas leak)\s+(?:here|in the building|near me)\b/i
];

const medicalUrgencyPatterns = [
  /\b(?:i cannot|i can't|i cant|cant)\s+breathe\b/i,
  /\b(?:severe|crushing)\s+chest pain\b/i,
  /\b(?:unconscious|not waking up|seizing|seizure)\b/i,
  /\b(?:heavy|uncontrolled)\s+bleeding\b/i,
  /\b(?:poisoned|ingested poison)\b/i,
  /\b(?:no puedo respirar|je ne peux pas respirer)\b/i
];

const abuseOrCoercionPatterns = [
  /\b(?:partner|spouse|boyfriend|girlfriend|parent|caregiver|boss)\s+(?:will not|won't|wont)\s+let me leave\b/i,
  /\b(?:threatened|threatening)\s+to\s+(?:kill|hurt|expose|blackmail)\s+me\b/i,
  /\b(?:forced|forcing|coerced|coercing)\s+me\s+(?:to have sex|into sex|to do something sexual)\b/i,
  /\b(?:controls|took|withholds)\s+(?:my money|my phone|my identification|my medication)\b/i,
  /\b(?:afraid|scared)\s+to go home\b/i,
  /\b(?:no me deja salir|me obliga a tener sexo)\b/i,
  /\b(?:ne me laisse pas partir|m'oblige à avoir des relations sexuelles)\b/i
];

const severeConfusionPatterns = [
  /\b(?:i cannot|i can't|i cant|cant)\s+tell what(?:'s| is) real\b/i,
  /\b(?:voices?|messages?)\s+(?:are\s+)?telling me to\b/i,
  /\b(?:i have not|i haven't|i havent|havent)\s+slept\s+(?:at all\s+)?for\s+(?:two|three|four|five|six|seven|\d+)\s+days\b/i,
  /\b(?:everything|reality)\s+(?:is|feels)\s+unreal\b/i
];

const commandToHarmPattern = /\b(?:voices?|messages?)\s+(?:are\s+)?telling me to\s+(?:kill|hurt|harm|attack|die)\b/i;

const substantialDistressPatterns = [
  /\b(?:i am|i'm|im)\s+overwhelmed\s+and\s+unable to cope\b/i,
  /\b(?:panic attack|panicking)\b[^.!?]{0,80}\b(?:cannot|can't|cant)\s+calm down\b/i,
  /\b(?:i am|i'm|im)\s+falling apart\s+and\s+(?:cannot|can't|cant)\s+function\b/i
];

const minorSafetyPatterns = [
  /\b(?:i am|i'm|im)\s+(?:under 18|a minor)\b[^.!?]{0,120}\b(?:adult|teacher|coach|relative|someone)\b[^.!?]{0,120}\b(?:nude|sexual|sex|meet alone)\b/i,
  /\b(?:my child|a child|a minor)\b[^.!?]{0,120}\b(?:asked|pressured|forced|threatened)\b[^.!?]{0,120}\b(?:nude|sexual|sex|images?|photos?|videos?)\b/i
];

const sexualExploitationPatterns = [
  /\b(?:forced|coerced|pressured|threatened)\s+me\s+(?:to send|into sending)\s+(?:nude|sexual)\s+(?:images?|photos?|videos?)\b/i,
  /\b(?:threatened|threatening)\s+to\s+(?:share|post|publish|send)\s+(?:my\s+)?(?:nude|sexual)\s+(?:images?|photos?|videos?)\b/i
];

const protectedSystemPatterns = [
  /\b(?:show|reveal|print|return|give me|expose)\b[^.!?]{0,100}\b(?:system prompt|hidden instructions?|developer message|internal policy|chain of thought|private identifiers?|credentials?|api keys?|secrets?)\b/i,
  /\b(?:ignore|override|bypass|disable)\b[^.!?]{0,100}\b(?:previous instructions?|system rules?|authorization|consent|safety checks?|entitlements?)\b/i,
  /\b(?:extract|exfiltrate|leak)\b[^.!?]{0,100}\b(?:prompt|secret|credential|private context|account data)\b/i
];

const crossAccountDataPatterns = [
  /\b(?:show|access|retrieve|return|list|give me)\b[^.!?]{0,100}\b(?:another|other)\s+(?:user|account|person)(?:'s)?\b[^.!?]{0,100}\b(?:private\s+)?(?:baseline|conversation|email|location|data|profile|messages?)\b/i,
  /\b(?:dump|export)\b[^.!?]{0,100}\b(?:all users?|all accounts?|customer data|private conversations?)\b/i
];

const unverifiableThreatPatterns = [
  /\b(?:people|they|the government|an agency|my neighbors?)\s+(?:are|is)\s+(?:reading|controlling|broadcasting)\s+my\s+(?:mind|thoughts)\b/i,
  /\b(?:a chip|a device|a transmitter)\s+(?:was|has been|is)\s+implanted\s+in\s+me\b/i,
  /\b(?:demons?|spirits?|a curse|the universe|a secret group|a cult)\s+(?:are|is)\s+(?:targeting|controlling|punishing|tracking|attacking|cursing)\s+me\b/i,
  /\bhidden\s+(?:cameras?|microphones?)\s+(?:are|were)\s+inside\s+(?:my|the)\s+(?:walls?|body|head)\b/i,
  /\b(?:spiritual|psychic|energetic|occult)\s+(?:attack|warfare|surveillance)\s+(?:against me|on me|targeting me)\b/i
];

const clearlyNonImmediatePatterns = [
  /\b(?:hypothetical|hypothetically|fictional|in a story|in a novel|in a screenplay|song lyric|quoted example|a character|the character|my friend said|someone said|the message says|the quote says|an example)\b/i,
  /\b(?:in \d{4}|years? ago|months? ago|last year|a long time ago|historically|when i was|used to feel|previously felt|in the past)\b/i
];

const currentRiskMarkers = /\b(?:right now|tonight|today|currently|about to|again|still|this minute)\b/i;

export function decideSovereignInputSafety(input: string): SovereignInputSafetyDecision {
  const text = normalizeInput(input);

  if (crossAccountDataPatterns.some((pattern) => pattern.test(text))) {
    return decision('secure_refusal', 'cross_account_data_request');
  }
  if (protectedSystemPatterns.some((pattern) => pattern.test(text))) {
    return decision('secure_refusal', 'protected_system_request');
  }

  const clearlyNonImmediate = clearlyNonImmediatePatterns.some((pattern) => pattern.test(text))
    && !currentRiskMarkers.test(text);
  if (clearlyNonImmediate) return decision('standard', 'none');

  if (!isClearlyNegatedSelfHarm(text) && immediateSelfHarmPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'immediate_self_harm');
  }
  if (!isClearlyNegatedHarmToOthers(text) && immediateHarmPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'immediate_harm_to_others');
  }
  if (immediateDangerPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'immediate_danger');
  }
  if (medicalUrgencyPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'medical_urgency');
  }
  if (minorSafetyPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'minor_safety');
  }
  if (sexualExploitationPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'sexual_exploitation');
  }
  if (abuseOrCoercionPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'abuse_or_coercion');
  }
  if (commandToHarmPattern.test(text)) {
    return decision('urgent', 'severe_confusion');
  }
  if (!isClearlyNegatedSelfHarm(text) && possibleSelfHarmPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'possible_self_harm');
  }
  if (!isClearlyNegatedHarmToOthers(text) && possibleHarmPatterns.some((pattern) => pattern.test(text))) {
    return decision('urgent', 'possible_harm_to_others');
  }

  if (severeConfusionPatterns.some((pattern) => pattern.test(text))) {
    return decision('grounded', 'severe_confusion');
  }
  if (substantialDistressPatterns.some((pattern) => pattern.test(text))) {
    return decision('grounded', 'substantial_distress');
  }
  if (unverifiableThreatPatterns.some((pattern) => pattern.test(text))) {
    return decision('grounded', 'unverifiable_threat');
  }
  return decision('standard', 'none');
}

export function buildDeterministicSafetyAnswer(decisionValue: SovereignInputSafetyDecision): SovereignAnswerV2 {
  switch (decisionValue.disposition) {
    case 'urgent':
      return buildUrgentAnswer(decisionValue.category);
    case 'grounded':
      return buildGroundedAnswer(decisionValue.category);
    case 'secure_refusal':
      return {
        version: 'sovereign-answer.v2',
        mode: 'baseline',
        depth: 'focused',
        headline: 'Private system details stay protected.',
        direct_answer: 'I cannot provide hidden instructions, credentials, private identifiers, another account’s information, internal security rules, or steps that bypass authorization. I can explain approved product behavior or help with a legitimate account and privacy question.',
        sections: [
          {
            id: 'unknowns',
            label: 'Protected boundary',
            body: 'System prompts, secrets, private context, cross-account information, and internal enforcement details are not part of the public answer surface.'
          }
        ],
        basis_refs: [],
        correction_prompt: 'Ask about the public behavior or account outcome you need instead.',
        actions: [],
        confidence: 'confirmed',
        safety_mode: 'grounded'
      };
    case 'standard':
      throw new Error('Standard input does not require a deterministic safety answer');
  }
}

function buildUrgentAnswer(category: SovereignInputSafetyCategory): SovereignAnswerV2 {
  if (category === 'possible_self_harm' || category === 'possible_harm_to_others') {
    return urgentAnswer(
      'What you wrote may indicate a serious risk of harm. Pause interpretation and bring in a real person now. If you are in immediate danger or likely to act in the next few minutes, contact local emergency services or go to the nearest emergency department.',
      'Move away from weapons, medications, traffic, heights, fire, or anything else that could increase harm. Tell a trusted person directly what you are thinking and ask them to stay with you or remain on the phone.',
      'Sovereign cannot determine intent, access to means, or how soon you may act from this message alone.',
      'Are you in immediate danger or likely to act in the next few minutes?'
    );
  }

  if (category === 'medical_urgency') {
    return urgentAnswer(
      'What you wrote may describe a medical emergency. Contact local emergency services or go to the nearest emergency department now. Do not rely on Sovereign to determine the cause or severity.',
      'Ask someone nearby to stay with you and contact emergency help. Do not drive yourself if breathing, consciousness, bleeding, poisoning, chest pain, or seizure symptoms could make that unsafe.',
      'Sovereign cannot determine your location, diagnosis, or exact level of danger from this message, so it will not invent a local number or minimize the symptoms.',
      'Are you able to contact emergency medical help now?'
    );
  }

  if (category === 'abuse_or_coercion' || category === 'sexual_exploitation' || category === 'minor_safety') {
    return urgentAnswer(
      'What you described may involve coercion, abuse, exploitation, or a child-safety risk. Immediate safety matters more than interpretation. Move toward a safer person or place when doing so will not increase danger.',
      'Do not confront the person if that could make the situation less safe. Contact a trusted person or emergency services when danger is immediate. Keep your phone, identification, medication, and essential information accessible when possible.',
      'Sovereign cannot verify the person’s identity, your jurisdiction, or the immediate level of danger. It will not invent a local service or tell you that the situation is harmless.',
      'Can you contact a trusted person or move to a safer place without increasing danger?'
    );
  }

  if (category === 'severe_confusion') {
    return urgentAnswer(
      'Messages or voices directing harm require immediate human support. Do not act on the instruction or use Sovereign to determine whether it is true or meaningful.',
      'Move away from weapons, medications, traffic, heights, or anything else that could increase harm. Contact local emergency services or a trusted person who can stay with you now.',
      'Sovereign cannot determine the source of the experience or the exact level of danger from this message.',
      'Are you able to contact emergency help or a trusted person now?'
    );
  }

  return urgentAnswer(
    'This is not a moment for Baseline interpretation. Contact local emergency services or go to the nearest emergency department now, and bring a trusted person into the situation if you can.',
    'Move away from weapons, medications, traffic, heights, fire, or anything else that could increase immediate harm. Stay where another person can be with you when possible.',
    'Sovereign cannot determine your location or the exact level of danger from this message, so it will not invent a local number or minimize what you said.',
    'Are you able to contact emergency help or a trusted person now?'
  );
}

function urgentAnswer(
  directAnswer: string,
  rightNow: string,
  unknowns: string,
  correctionPrompt: string
): SovereignAnswerV2 {
  return {
    version: 'sovereign-answer.v2',
    mode: 'baseline',
    depth: 'focused',
    headline: 'Immediate human support matters most.',
    direct_answer: directAnswer,
    sections: [
      { id: 'responsibility', label: 'Right now', body: rightNow },
      { id: 'unknowns', label: 'What Sovereign cannot know', body: unknowns }
    ],
    basis_refs: [],
    correction_prompt: correctionPrompt,
    actions: [],
    confidence: 'confirmed',
    safety_mode: 'escalate'
  };
}

function buildGroundedAnswer(category: SovereignInputSafetyCategory): SovereignAnswerV2 {
  if (category === 'severe_confusion') {
    return groundedAnswer(
      'Difficulty telling what is real, prolonged sleep loss, or messages that feel directed at you can make judgment less reliable. Bring in a trusted person or qualified health professional before trying to explain the experience.',
      'Sovereign cannot establish the source or meaning of the experience from a message.',
      'Move to a familiar, physically safe place. Write down only what you directly observe, including sleep, medication, substance, food, and timing changes, and contact someone who can be present with you.',
      'Who can you contact to be with you or speak with you now?'
    );
  }

  if (category === 'substantial_distress') {
    return groundedAnswer(
      'What you wrote suggests significant distress. A concrete human connection matters more than extending an interpretation right now.',
      'Sovereign cannot determine the cause, diagnosis, or exact level of risk from this message.',
      'Reduce stimulation, move to a familiar place, and contact a trusted person or qualified professional. If you become unable to stay safe, contact local emergency services.',
      'Who is one person you can contact now?'
    );
  }

  return groundedAnswer(
    'The experience may feel certain or threatening, but its cause is not established from what is available. Start with what can be directly checked and bring in a trusted person if you feel unsafe.',
    'A strong feeling, pattern, or coincidence does not establish who caused it or whether an unseen explanation is true.',
    'Write down only what you directly observed, check it with someone you trust, and seek in-person support if fear or confusion is making it hard to stay safe.',
    'What can be directly observed or checked right now?'
  );
}

function groundedAnswer(
  directAnswer: string,
  unknowns: string,
  nextStep: string,
  correctionPrompt: string
): SovereignAnswerV2 {
  return {
    version: 'sovereign-answer.v2',
    mode: 'baseline',
    depth: 'focused',
    headline: 'Separate what is happening from what it may mean.',
    direct_answer: directAnswer,
    sections: [
      { id: 'unknowns', label: 'Still unknown', body: unknowns },
      { id: 'experiment', label: 'A grounded next step', body: nextStep }
    ],
    basis_refs: [],
    correction_prompt: correctionPrompt,
    actions: [],
    confidence: 'supported',
    safety_mode: 'grounded'
  };
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
  return /\b(?:i do not|i don't|i dont|i am not|i'm not|im not|never)\s+(?:want to|going to|planning to|thinking about)\s+(?:die|kill myself|hurt myself|end my life)\b/i.test(input)
    || /\bnot suicidal\b/i.test(input)
    || /\b(?:no quiero matarme|no voy a matarme|je ne veux pas me tuer|je ne vais pas me tuer)\b/i.test(input);
}

function isClearlyNegatedHarmToOthers(input: string): boolean {
  return /\b(?:i do not|i don't|i dont|i am not|i'm not|im not|never)\s+(?:want to|going to|planning to|thinking about)\s+(?:kill|hurt|harm|attack)\s+(?:someone|anyone|them|him|her)\b/i.test(input)
    || /\b(?:no quiero matar a nadie|no voy a matar a nadie|je ne veux tuer personne|je ne vais tuer personne)\b/i.test(input);
}

function decision(
  disposition: SovereignInputSafetyDisposition,
  category: SovereignInputSafetyCategory
): SovereignInputSafetyDecision {
  return { version: 'sovereign-input-safety.v1', disposition, category };
}
