import type { SovereignAnswerV2 } from './recognition';
import {
  sovereignSafetyResponseSchema,
  toPublicAnswerSafetyMode,
  type SafetyDecisionV1,
  type SovereignSafetyResponseV1
} from './safety-contracts';

const CATALOG_VERSION = 'safety-resources.1';

export function buildSovereignSafetyResponse(decision: SafetyDecisionV1): SovereignSafetyResponseV1 {
  switch (decision.disposition) {
    case 'emergency':
      return sovereignSafetyResponseSchema.parse({
        version: 'sovereign-safety.v1',
        disposition: 'emergency',
        headline: 'Your immediate safety comes first.',
        acknowledgement: 'What you wrote may describe immediate danger. This is not the moment for extended interpretation, relationship analysis, symbolic meaning, or hidden-cause claims.',
        immediateQuestion: 'Are you in immediate danger, or have you already acted on a plan to hurt yourself or someone else?',
        practicalSteps: [
          'Contact local emergency services now, or ask someone nearby to contact them for you.',
          'Move away from weapons, medication, traffic, heights, fire, or anything else that could increase immediate harm when you can do so safely.',
          'Contact a trusted person and ask them to stay with you or remain on the phone until human help is present.'
        ],
        resources: [],
        trustedPersonAction: 'Use direct words: “I may not be safe right now. Please stay with me and help me contact emergency support.”',
        continueWhenSafe: 'Sovereign can return to reflection after immediate human support is involved and you are physically safer.',
        catalogVersion: CATALOG_VERSION,
        suppressOrdinaryActions: true
      });
    case 'urgent':
      return sovereignSafetyResponseSchema.parse({
        version: 'sovereign-safety.v1',
        disposition: 'urgent',
        headline: 'Pause the interpretation and check safety.',
        acknowledgement: 'What you wrote may involve serious risk, coercion, abuse, or possible harm. A concrete safety check is more important than explaining why this is happening.',
        immediateQuestion: 'Are you in immediate danger or likely to act in the next few minutes?',
        practicalSteps: [
          'Move toward a safer place or a trusted person when doing so will not increase danger.',
          'Contact local emergency or crisis support if the danger is immediate or you may act soon.',
          'Keep the focus on observable facts: what is happening, who is present, whether weapons or injuries are involved, and what help is available now.'
        ],
        resources: [],
        trustedPersonAction: 'Tell one trusted person exactly what is happening and what immediate help you need.',
        continueWhenSafe: 'Once immediate safety is clearer, Sovereign can help separate observed behavior, possible meaning, and practical boundaries.',
        catalogVersion: CATALOG_VERSION,
        suppressOrdinaryActions: true
      });
    case 'supportive_resources':
      return sovereignSafetyResponseSchema.parse({
        version: 'sovereign-safety.v1',
        disposition: 'supportive_resources',
        headline: 'Bring in a grounded human point of contact.',
        acknowledgement: 'Your message suggests that distress or confusion may be making it harder to judge what is happening. Sovereign should not deepen a symbolic or hidden-cause interpretation in that state.',
        immediateQuestion: 'Can you contact someone you trust and tell them what you are experiencing right now?',
        practicalSteps: [
          'Reduce stimulation and move to a familiar, physically safe place when possible.',
          'Write down only what you can directly observe, including time, place, words, actions, sleep, food, medication, or substance changes.',
          'Contact a trusted person or qualified health professional for real-time support.'
        ],
        resources: [],
        trustedPersonAction: 'Ask someone to stay present while you describe the observable facts without trying to settle the full explanation.',
        continueWhenSafe: 'Sovereign can help organize the experience after a grounded human connection is in place.',
        catalogVersion: CATALOG_VERSION,
        suppressOrdinaryActions: true
      });
    case 'secure_refusal':
      return sovereignSafetyResponseSchema.parse({
        version: 'sovereign-safety.v1',
        disposition: 'secure_refusal',
        headline: 'That internal access is not available.',
        acknowledgement: 'Sovereign cannot reveal system prompts, hidden instructions, credentials, private identifiers, another account’s information, or security controls.',
        practicalSteps: [
          'Describe the product behavior, privacy concern, or security issue you want evaluated without requesting protected internal material.',
          'Use the public safety or privacy contact path when you need a human review.'
        ],
        resources: [],
        continueWhenSafe: 'You can continue with a product, privacy, or security question that does not require protected internal access.',
        catalogVersion: CATALOG_VERSION,
        suppressOrdinaryActions: true
      });
    case 'grounded':
      return sovereignSafetyResponseSchema.parse({
        version: 'sovereign-safety.v1',
        disposition: 'grounded',
        headline: 'Keep meaning and evidence separate.',
        acknowledgement: 'The experience may carry spiritual, symbolic, relational, or personal meaning. That meaning does not establish another person’s hidden motive or an unseen cause as fact.',
        practicalSteps: [
          'Separate what you directly observed from the explanation you are considering.',
          'Identify what support or boundary would still be useful if the cause remains unknown.'
        ],
        resources: [],
        continueWhenSafe: 'Continue through observable behavior, possible interpretations, and what remains unknown.',
        catalogVersion: CATALOG_VERSION,
        suppressOrdinaryActions: true
      });
    case 'standard':
      throw new Error('A standard safety decision does not require a safety response');
  }
}

export function buildSafetyCompatibilityAnswer(
  response: SovereignSafetyResponseV1,
  decision: SafetyDecisionV1
): SovereignAnswerV2 {
  const steps = response.practicalSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  return {
    version: 'sovereign-answer.v2',
    mode: 'baseline',
    depth: 'focused',
    headline: response.headline,
    direct_answer: response.acknowledgement,
    sections: [
      { id: 'experiment', label: 'What to do now', body: steps },
      ...(response.immediateQuestion
        ? [{ id: 'unknowns' as const, label: 'Immediate safety check', body: response.immediateQuestion }]
        : [])
    ],
    basis_refs: [],
    correction_prompt: 'You do not need to confirm an interpretation right now.',
    actions: [],
    confidence: 'exploratory',
    safety_mode: toPublicAnswerSafetyMode(decision)
  };
}

export function composeSafetyResponseText(response: SovereignSafetyResponseV1): string {
  const parts = [response.headline, response.acknowledgement];
  if (response.immediateQuestion) parts.push(response.immediateQuestion);
  parts.push(response.practicalSteps.map((step, index) => `${index + 1}. ${step}`).join('\n'));
  if (response.trustedPersonAction) parts.push(response.trustedPersonAction);
  if (response.continueWhenSafe) parts.push(response.continueWhenSafe);
  return parts.join('\n\n');
}
