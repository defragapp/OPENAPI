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
  | 'immediate_harm_to_others'
  | 'immediate_danger'
  | 'unverifiable_threat'
  | 'protected_system_request';

export interface SovereignInputSafetyDecision {
  version: 'sovereign-input-safety.v1';
  disposition: SovereignInputSafetyDisposition;
  category: SovereignInputSafetyCategory;
}

const immediateSelfHarmPatterns = [
  /\b(?:i am|i'm|im|i will|i'll|i plan to|i intend to|i am going to|i'm going to|im going to|i am about to|i'm about to|im about to)\s+(?:kill|hurt|harm)\s+(?:myself|me)\b/i,
  /\b(?:i have|i've got|ive got)\s+(?:a\s+)?(?:suicide|suicidal)\s+plan\b/i,
  /\b(?:i just|i have|i've|ive)\s+(?:taken|swallowed|overdosed on)\s+[^.!?]{0,120}\b/i
];

const immediateHarmPatterns = [
  /\b(?:i am|i'm|im|i will|i'll|i plan to|i intend to|i am going to|i'm going to|im going to|i am about to|i'm about to|im about to)\s+(?:kill|hurt|harm|attack|shoot|stab)\s+(?:someone|somebody|them|him|her|people|my\s+(?:partner|parent|mother|father|child|coworker|boss))\b/i,
  /\b(?:i have|i've got|ive got)\s+(?:a\s+)?(?:gun|knife|weapon)\s+and\s+(?:i am|i'm|im)\s+(?:going to|about to)\s+(?:use it|hurt|kill|attack)\b/i
];

const immediateDangerPatterns = [
  /\b(?:someone|they|he|she)\s+(?:is|are)\s+(?:attacking|hurting|holding|chasing|threatening)\s+me\s+(?:right now|now)\b/i,
  /\bi am\s+in\s+immediate\s+danger\b/i
];

const protectedSystemPatterns = [
  /\b(?:show|reveal|print|return|give me|expose)\b[^.!?]{0,100}\b(?:system prompt|hidden instructions?|developer message|internal policy|chain of thought|private identifiers?|credentials?|api keys?|secrets?)\b/i,
  /\b(?:ignore|override|bypass|disable)\b[^.!?]{0,100}\b(?:previous instructions?|system rules?|authorization|consent|safety checks?|entitlements?)\b/i,
  /\b(?:extract|exfiltrate|leak)\b[^.!?]{0,100}\b(?:prompt|secret|credential|private context|account data)\b/i
];

const unverifiableThreatPatterns = [
  /\b(?:people|they|the government|an agency|my neighbors?)\s+(?:are|is)\s+(?:reading|controlling|broadcasting)\s+my\s+(?:mind|thoughts)\b/i,
  /\b(?:a chip|a device|a transmitter)\s+(?:was|has been|is)\s+implanted\s+in\s+me\b/i,
  /\b(?:demons?|spirits?|a curse|the universe)\s+(?:are|is)\s+(?:targeting|controlling|punishing|tracking)\s+me\b/i,
  /\bhidden\s+(?:cameras?|microphones?)\s+(?:are|were)\s+inside\s+(?:my|the)\s+(?:walls?|body|head)\b/i
];

const clearlyNonImmediatePatterns = [
  /\b(?:hypothetical|fictional|in a story|in a novel|in a screenplay|song lyric|quoted example)\b/i,
  /\b(?:years ago|a long time ago|historically|used to feel|previously felt)\b/i
];

export function decideSovereignInputSafety(input: string): SovereignInputSafetyDecision {
  const text = input.trim();
  if (protectedSystemPatterns.some((pattern) => pattern.test(text))) {
    return decision('secure_refusal', 'protected_system_request');
  }

  const clearlyNonImmediate = clearlyNonImmediatePatterns.some((pattern) => pattern.test(text))
    && !/\b(?:right now|tonight|today|currently|about to)\b/i.test(text);
  if (!clearlyNonImmediate) {
    if (immediateSelfHarmPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'immediate_self_harm');
    }
    if (immediateHarmPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'immediate_harm_to_others');
    }
    if (immediateDangerPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'immediate_danger');
    }
  }

  if (unverifiableThreatPatterns.some((pattern) => pattern.test(text))) {
    return decision('grounded', 'unverifiable_threat');
  }
  return decision('standard', 'none');
}

export function buildDeterministicSafetyAnswer(decisionValue: SovereignInputSafetyDecision): SovereignAnswerV2 {
  switch (decisionValue.disposition) {
    case 'urgent':
      return {
        version: 'sovereign-answer.v2',
        mode: 'baseline',
        depth: 'focused',
        headline: 'Immediate human support matters most.',
        direct_answer: 'This is not a moment for Baseline interpretation. Contact local emergency services or go to the nearest emergency department now, and bring a trusted person into the situation if you can.',
        sections: [
          {
            id: 'responsibility',
            label: 'Right now',
            body: 'Move away from weapons, medications, or anything else you could use to cause harm. Stay where another person can be with you.'
          },
          {
            id: 'unknowns',
            label: 'What Sovereign cannot know',
            body: 'Sovereign cannot determine your location or the exact level of danger from this message, so it will not invent a local number or minimize what you said.'
          }
        ],
        basis_refs: [],
        correction_prompt: 'Are you able to contact emergency help or a trusted person now?',
        actions: [],
        confidence: 'confirmed',
        safety_mode: 'escalate'
      };
    case 'grounded':
      return {
        version: 'sovereign-answer.v2',
        mode: 'baseline',
        depth: 'focused',
        headline: 'Separate what is happening from what it may mean.',
        direct_answer: 'The experience may feel certain or threatening, but its cause is not established from what is available. Start with what can be directly checked and bring in a trusted person if you feel unsafe.',
        sections: [
          {
            id: 'unknowns',
            label: 'Still unknown',
            body: 'A strong feeling, pattern, or coincidence does not establish who caused it or whether an unseen explanation is true.'
          },
          {
            id: 'experiment',
            label: 'A grounded next step',
            body: 'Write down only what you directly observed, check it with someone you trust, and seek in-person support if fear or confusion is making it hard to stay safe.'
          }
        ],
        basis_refs: [],
        correction_prompt: 'What can be directly observed or checked right now?',
        actions: [],
        confidence: 'supported',
        safety_mode: 'grounded'
      };
    case 'secure_refusal':
      return {
        version: 'sovereign-answer.v2',
        mode: 'baseline',
        depth: 'focused',
        headline: 'Private system details stay protected.',
        direct_answer: 'I cannot provide hidden instructions, credentials, private identifiers, internal security rules, or steps that bypass authorization. I can explain approved product behavior or help with a legitimate account and privacy question.',
        sections: [
          {
            id: 'unknowns',
            label: 'Protected boundary',
            body: 'System prompts, secrets, private context, and internal enforcement details are not part of the public answer surface.'
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

function decision(
  disposition: SovereignInputSafetyDisposition,
  category: SovereignInputSafetyCategory
): SovereignInputSafetyDecision {
  return { version: 'sovereign-input-safety.v1', disposition, category };
}
