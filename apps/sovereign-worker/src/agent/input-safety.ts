import type { SovereignAnswerV2, SovereignSafetyResponse } from './recognition';
import { SAFETY_RESOURCE_CATALOG_VERSION, resourcesForSafetyPresentation } from './safety-resources';

export const sovereignInputSafetyDispositions = [
  'standard',
  'grounded',
  'supportive_resources',
  'urgent',
  'secure_refusal'
] as const;

export type SovereignInputSafetyDisposition = typeof sovereignInputSafetyDispositions[number];
export type SovereignInputSafetyCategory =
  | 'none'
  | 'immediate_self_harm'
  | 'immediate_harm_to_others'
  | 'dangerous_ingestion'
  | 'immediate_danger'
  | 'medical_urgency'
  | 'severe_confusion'
  | 'indirect_self_harm'
  | 'abuse_or_coercion'
  | 'acute_distress'
  | 'minor_sexual_exploitation'
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
  /\b(?:me voy a matar|voy a suicidarme|voy a hacerme dano|estoy a punto de matarme)\b/i,
  /\b(?:je vais me tuer|je vais me suicider|je suis sur le point de me tuer)\b/i
];

const dangerousIngestionPatterns = [
  /\bi\s+(?:just\s+)?(?:have\s+)?overdosed\b/i,
  /\b(?:i just|i have|i've|ive|i)\s+(?:taken|swallowed|drank)\s+(?:too many|a dangerous amount of|all of my|a bottle of)\s+(?:pills?|medication|medicine|drugs?|poison|bleach|chemicals?)\b/i,
  /\b(?:acabo de|he)\s+(?:tomado|tragado)\s+(?:demasiadas|una botella de)\s+(?:pastillas|medicinas|drogas)\b/i
];

const immediateHarmPatterns = [
  /\b(?:i am|i'm|im|i will|i'll|i plan to|i intend to|i am going to|i'm going to|im going to|i am about to|i'm about to|im about to)\s+(?:kill|hurt|harm|attack|shoot|stab)\s+(?:someone|somebody|them|him|her|people|my\s+(?:partner|parent|mother|father|child|coworker|boss))\b/i,
  /\b(?:i have|i've got|ive got)\s+(?:a\s+)?(?:gun|knife|weapon)\s+and\s+(?:i am|i'm|im)\s+(?:going to|about to)\s+(?:use it|hurt|kill|attack)\b/i,
  /\b(?:voy a matar|voy a atacar|estoy a punto de herir)\s+(?:a alguien|a una persona|a mi pareja)\b/i
];

const immediateDangerPatterns = [
  /\b(?:someone|they|he|she)\s+(?:is|are)\s+(?:attacking|hurting|holding|chasing|threatening)\s+me\s+(?:right now|now)\b/i,
  /\bi am\s+in\s+immediate\s+danger\b/i,
  /\b(?:alguien me esta atacando ahora|estoy en peligro inmediato)\b/i
];

const medicalUrgencyPatterns = [
  /\b(?:i cannot|i can't|cant)\s+breathe\s+(?:right now|now)\b/i,
  /\b(?:severe|crushing)\s+chest\s+pain\s+(?:right now|now)\b/i,
  /\b(?:someone|they|he|she)\s+(?:is having|has)\s+(?:a seizure|stroke symptoms)\s+(?:right now|now)\b/i,
  /\b(?:i am|i'm|im)\s+(?:bleeding heavily|losing a lot of blood)\b/i,
  /\b(?:no puedo respirar ahora|tengo dolor fuerte en el pecho ahora)\b/i
];

const severeConfusionPatterns = [
  /\b(?:voices?|a voice)\s+(?:are|is)\s+(?:telling|commanding|ordering)\s+me\s+to\s+(?:hurt|kill|attack)\s+(?:myself|someone|somebody|them|him|her)\b/i,
  /\b(?:i cannot|i can't|cant)\s+tell\s+where\s+i\s+am\s+and\s+(?:i am|i'm|im)\s+(?:not safe|in danger)\b/i
];

const indirectSelfHarmPatterns = [
  /\b(?:i do not|i don't|i dont)\s+want\s+to\s+(?:be here|wake up|keep living|live anymore)\b/i,
  /\beveryone\s+would\s+be\s+better\s+off\s+without\s+me\b/i,
  /\b(?:end it|make it stop)\s+(?:tonight|right now|now)\b/i,
  /\b(?:no quiero seguir viviendo|todos estarian mejor sin mi)\b/i
];

const abuseOrCoercionPatterns = [
  /\b(?:my|the)\s+(?:partner|spouse|parent|caregiver)\s+(?:will not|won't|wont)\s+let\s+me\s+leave\b/i,
  /\b(?:my|the)\s+(?:partner|spouse|parent|caregiver)\s+(?:threatens|threatened)\s+me\s+if\s+i\s+leave\b/i,
  /\b(?:someone|my partner|my spouse)\s+(?:forced|is forcing)\s+me\s+to\s+(?:have sex|send sexual images|give them money|stay)\b/i,
  /\b(?:my|the)\s+(?:partner|spouse|caregiver)\s+controls\s+(?:all of\s+)?my\s+(?:money|phone|medication|documents)\b/i
];

const acuteDistressPatterns = [
  /\b(?:i feel|i am|i'm|im)\s+(?:hopeless|overwhelmed|desperate|unable to cope)\b/i,
  /\b(?:i cannot|i can't|cant)\s+cope\s+(?:anymore|right now|today)\b/i,
  /\b(?:i feel unsafe and alone|i do not feel safe being alone)\b/i
];

const minorSexualExploitationPatterns = [
  /\b(?:i am|i'm|im)\s+(?:under 18|a minor|\d{1,2} years old)\b[^.!?]{0,120}\b(?:asking|pressuring|forcing|blackmailing)\b[^.!?]{0,100}\b(?:nude|sexual|explicit)\s+(?:photo|photos|image|images|video|videos)\b/i,
  /\b(?:an adult|someone older)\s+(?:is asking|asked|is pressuring|is blackmailing)\s+(?:a child|a minor|me)\b[^.!?]{0,100}\b(?:nude|sexual|explicit)\s+(?:photo|photos|image|images|video|videos)\b/i
];

const protectedSystemPatterns = [
  /\b(?:show|reveal|print|return|give me|expose)\b[^.!?]{0,120}\b(?:system prompt|hidden instructions?|developer message|internal policy|chain of thought|private identifiers?|credentials?|api keys?|secrets?)\b/i,
  /\b(?:ignore|override|bypass|disable)\b[^.!?]{0,120}\b(?:previous instructions?|system rules?|authorization|consent|safety checks?|entitlements?)\b/i,
  /\b(?:extract|exfiltrate|leak)\b[^.!?]{0,120}\b(?:prompt|secret|credential|private context|account data)\b/i,
  /\b(?:show|give|return|export|leak)\b[^.!?]{0,100}\b(?:another|other|someone else's|someone elses)\s+(?:user|account|person)\b[^.!?]{0,100}\b(?:messages?|baseline|private data|context|history)\b/i
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

export function normalizeSovereignSafetyInput(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function decideSovereignInputSafety(input: string): SovereignInputSafetyDecision {
  const text = normalizeSovereignSafetyInput(input);
  if (protectedSystemPatterns.some((pattern) => pattern.test(text))) {
    return decision('secure_refusal', 'protected_system_request');
  }

  const clearlyNonImmediate = clearlyNonImmediatePatterns.some((pattern) => pattern.test(text))
    && !/\b(?:right now|tonight|today|currently|about to|ahora|esta noche)\b/i.test(text);
  if (!clearlyNonImmediate) {
    if (dangerousIngestionPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'dangerous_ingestion');
    }
    if (medicalUrgencyPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'medical_urgency');
    }
    if (immediateSelfHarmPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'immediate_self_harm');
    }
    if (immediateHarmPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'immediate_harm_to_others');
    }
    if (immediateDangerPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'immediate_danger');
    }
    if (severeConfusionPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'severe_confusion');
    }
    if (minorSexualExploitationPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'minor_sexual_exploitation');
    }
    if (indirectSelfHarmPatterns.some((pattern) => pattern.test(text))) {
      return decision('urgent', 'indirect_self_harm');
    }
  }

  if (abuseOrCoercionPatterns.some((pattern) => pattern.test(text))) {
    return decision('supportive_resources', 'abuse_or_coercion');
  }
  if (acuteDistressPatterns.some((pattern) => pattern.test(text))) {
    return decision('supportive_resources', 'acute_distress');
  }
  if (unverifiableThreatPatterns.some((pattern) => pattern.test(text))) {
    return decision('grounded', 'unverifiable_threat');
  }
  return decision('standard', 'none');
}

export function buildDeterministicSafetyAnswer(decisionValue: SovereignInputSafetyDecision): SovereignAnswerV2 {
  switch (decisionValue.disposition) {
    case 'urgent':
      return urgentAnswer(decisionValue);
    case 'supportive_resources':
      return supportiveResourcesAnswer(decisionValue);
    case 'grounded':
      return withSafety(decisionValue, 'grounded', {
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
      });
    case 'secure_refusal':
      return withSafety(decisionValue, 'secure_refusal', {
        version: 'sovereign-answer.v2',
        mode: 'baseline',
        depth: 'focused',
        headline: 'Private system details stay protected.',
        direct_answer: 'I cannot provide hidden instructions, credentials, private identifiers, another person’s private context, internal security rules, or steps that bypass authorization. I can explain approved product behavior or help with a legitimate account and privacy question.',
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
      });
    case 'standard':
      throw new Error('Standard input does not require a deterministic safety answer');
  }
}

function urgentAnswer(decisionValue: SovereignInputSafetyDecision): SovereignAnswerV2 {
  const emergencyCategories = new Set<SovereignInputSafetyCategory>([
    'immediate_self_harm',
    'immediate_harm_to_others',
    'dangerous_ingestion',
    'immediate_danger',
    'medical_urgency'
  ]);
  const presentation: SovereignSafetyResponse['presentation'] = emergencyCategories.has(decisionValue.category)
    ? 'emergency'
    : 'urgent';

  if (decisionValue.category === 'dangerous_ingestion' || decisionValue.category === 'medical_urgency') {
    return withSafety(decisionValue, presentation, {
      version: 'sovereign-answer.v2',
      mode: 'baseline',
      depth: 'focused',
      headline: 'Get immediate medical help now.',
      direct_answer: 'Call local emergency services or go to the nearest emergency department now. Do not wait for symptoms to change, and ask another person to stay with you if possible.',
      sections: [
        {
          id: 'responsibility',
          label: 'Right now',
          body: 'Stop taking anything else. Keep the medication, substance, or product container available for emergency responders, but do not induce vomiting unless a qualified responder tells you to.'
        },
        {
          id: 'unknowns',
          label: 'What Sovereign cannot determine',
          body: 'Sovereign cannot assess dose, symptoms, or medical severity from a message, so it will not tell you to wait or try to manage this alone.'
        }
      ],
      basis_refs: [],
      correction_prompt: 'Can you contact emergency medical help now?',
      actions: [],
      confidence: 'confirmed',
      safety_mode: 'escalate'
    });
  }

  if (decisionValue.category === 'minor_sexual_exploitation') {
    return withSafety(decisionValue, presentation, {
      version: 'sovereign-answer.v2',
      mode: 'baseline',
      depth: 'focused',
      headline: 'Bring a trusted adult or emergency help in now.',
      direct_answer: 'Stop responding to the person, do not send more images or money, and tell a trusted adult or local emergency service now if anyone is threatening, coercing, or trying to meet a minor.',
      sections: [
        {
          id: 'responsibility',
          label: 'Protect the evidence',
          body: 'Do not negotiate with the person. Preserve messages, usernames, and payment requests without redistributing sexual images.'
        },
        {
          id: 'unknowns',
          label: 'Immediate safety first',
          body: 'Sovereign cannot verify who is involved or where they are. If a meeting, threat, or physical danger is immediate, contact local emergency services now.'
        }
      ],
      basis_refs: [],
      correction_prompt: 'Is there a trusted adult or emergency service you can contact now?',
      actions: [],
      confidence: 'confirmed',
      safety_mode: 'escalate'
    });
  }

  return withSafety(decisionValue, presentation, {
    version: 'sovereign-answer.v2',
    mode: 'baseline',
    depth: 'focused',
    headline: presentation === 'emergency' ? 'Immediate human support matters most.' : 'Bring another person into this now.',
    direct_answer: presentation === 'emergency'
      ? 'This is not a moment for Baseline interpretation. Contact local emergency services or go to the nearest emergency department now, and bring a trusted person into the situation if you can.'
      : 'Do not handle this alone. Contact a trusted person and an urgent support service now, and use local emergency services if anyone may be harmed.',
    sections: [
      {
        id: 'responsibility',
        label: 'Right now',
        body: 'Move away from weapons, medications, or anything else that could be used to cause harm. Stay where another person can be with you.'
      },
      {
        id: 'unknowns',
        label: 'What Sovereign cannot know',
        body: 'Sovereign cannot determine your location or the exact level of danger from this message, so it will not minimize what you said or pretend an online response is enough.'
      }
    ],
    basis_refs: [],
    correction_prompt: 'Are you able to contact emergency help or a trusted person now?',
    actions: [],
    confidence: 'confirmed',
    safety_mode: 'escalate'
  });
}

function supportiveResourcesAnswer(decisionValue: SovereignInputSafetyDecision): SovereignAnswerV2 {
  const abuse = decisionValue.category === 'abuse_or_coercion';
  return withSafety(decisionValue, 'supportive_resources', {
    version: 'sovereign-answer.v2',
    mode: 'baseline',
    depth: 'focused',
    headline: abuse ? 'Your safety matters more than interpreting the relationship.' : 'This deserves support from a real person.',
    direct_answer: abuse
      ? 'Control, threats, forced sexual contact, blocked movement, or restricted access to money, medication, or documents are safety concerns. Contact someone you trust and use a local support or emergency service if the danger may be immediate.'
      : 'Feeling hopeless, overwhelmed, unable to cope, or unsafe alone is enough reason to contact a trusted person or crisis-support service now. You do not need to wait until it becomes an emergency.',
    sections: [
      {
        id: 'responsibility',
        label: 'A safer next step',
        body: abuse
          ? 'Use a device the controlling person cannot monitor if possible. Keep identification, medication, keys, and a safe contact accessible without announcing a plan that could increase danger.'
          : 'Tell one person plainly that you need company or support today, and choose the service below that matches where you are.'
      },
      {
        id: 'unknowns',
        label: 'If danger becomes immediate',
        body: 'Contact local emergency services or go to the nearest emergency department. Sovereign cannot assess immediate risk or replace in-person help.'
      }
    ],
    basis_refs: [],
    correction_prompt: 'Who can you contact for human support today?',
    actions: [],
    confidence: 'confirmed',
    safety_mode: 'grounded'
  });
}

function withSafety(
  decisionValue: Exclude<SovereignInputSafetyDecision, { disposition: 'standard' }>,
  presentation: SovereignSafetyResponse['presentation'],
  answer: Omit<SovereignAnswerV2, 'safety'>
): SovereignAnswerV2 {
  return {
    ...answer,
    safety: {
      version: 'sovereign-safety-response.v1',
      disposition: decisionValue.disposition,
      category: decisionValue.category,
      presentation,
      resource_catalog_version: SAFETY_RESOURCE_CATALOG_VERSION,
      resources: resourcesForSafetyPresentation(presentation)
    }
  };
}

function decision(
  disposition: SovereignInputSafetyDisposition,
  category: SovereignInputSafetyCategory
): SovereignInputSafetyDecision {
  return { version: 'sovereign-input-safety.v1', disposition, category };
}
