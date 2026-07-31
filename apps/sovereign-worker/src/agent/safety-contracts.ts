import { z } from 'zod';

export const safetyCategories = [
  'none',
  'emotional_distress',
  'self_harm',
  'harm_to_others',
  'immediate_danger',
  'abuse_or_coercion',
  'medical_urgency',
  'severe_confusion',
  'persecutory_or_unverifiable_belief',
  'sexual_exploitation',
  'minor_safety',
  'prompt_injection',
  'data_exfiltration'
] as const;

export const safetyDispositions = [
  'standard',
  'grounded',
  'supportive_resources',
  'urgent',
  'emergency',
  'secure_refusal'
] as const;

const safetySeveritySchema = z.enum(['low', 'moderate', 'high', 'critical']);
const safetyImminenceSchema = z.enum(['not_indicated', 'unclear', 'possible', 'immediate']);
const safetyConfidenceSchema = z.enum(['low', 'medium', 'high']);

export const semanticSafetySignalSchema = z.object({
  version: z.literal('sovereign-risk-signal.v1'),
  categories: z.array(z.enum(safetyCategories)).min(1).max(6),
  disposition: z.enum(safetyDispositions),
  severity: safetySeveritySchema,
  imminence: safetyImminenceSchema,
  confidence: safetyConfidenceSchema
}).strict();

export const safetyDecisionSchema = z.object({
  version: z.literal('safety-decision.v1'),
  disposition: z.enum(safetyDispositions),
  categories: z.array(z.enum(safetyCategories)).min(1).max(8),
  severity: safetySeveritySchema,
  imminence: safetyImminenceSchema,
  confidence: safetyConfidenceSchema,
  source: z.enum(['deterministic', 'semantic', 'combined']),
  classifierVersion: z.string().min(1).max(80),
  policyVersion: z.string().min(1).max(80),
  requiresSemanticReview: z.boolean(),
  requiresResourceResolver: z.boolean(),
  suppressOrdinaryInterpretation: z.boolean(),
  suppressActions: z.array(z.enum([
    'save',
    'covenant',
    'relationship',
    'system',
    'upsell',
    'follow_up',
    'translation'
  ])).max(7)
}).strict();

export type SafetyCategory = typeof safetyCategories[number];
export type SafetyDisposition = typeof safetyDispositions[number];
export type SemanticSafetySignal = z.infer<typeof semanticSafetySignalSchema>;
export type SafetyDecisionV1 = z.infer<typeof safetyDecisionSchema>;

export const publicSafetyResourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9._-]{1,80}$/),
  kind: z.enum(['emergency', 'crisis', 'abuse_support', 'medical', 'trusted_person', 'general_support']),
  label: z.string().min(2).max(120),
  action: z.string().min(2).max(180),
  href: z.string().url().optional(),
  phone: z.string().min(2).max(40).optional(),
  text: z.string().min(2).max(80).optional(),
  jurisdiction: z.string().min(2).max(80),
  provenance: z.string().min(2).max(180),
  reviewedAt: z.string().datetime()
}).strict();

export const sovereignSafetyResponseSchema = z.object({
  version: z.literal('sovereign-safety.v1'),
  disposition: z.enum(['grounded', 'supportive_resources', 'urgent', 'emergency', 'secure_refusal']),
  headline: z.string().min(3).max(180),
  acknowledgement: z.string().min(20).max(1_200),
  immediateQuestion: z.string().min(5).max(220).optional(),
  practicalSteps: z.array(z.string().min(5).max(280)).min(1).max(5),
  resources: z.array(publicSafetyResourceSchema).max(8),
  trustedPersonAction: z.string().min(5).max(240).optional(),
  continueWhenSafe: z.string().min(5).max(240).optional(),
  catalogVersion: z.string().min(1).max(80),
  suppressOrdinaryActions: z.literal(true)
}).strict();

export type PublicSafetyResource = z.infer<typeof publicSafetyResourceSchema>;
export type SovereignSafetyResponseV1 = z.infer<typeof sovereignSafetyResponseSchema>;

export function toPublicAnswerSafetyMode(decision: SafetyDecisionV1): 'standard' | 'grounded' | 'escalate' {
  if (decision.disposition === 'standard') return 'standard';
  if (decision.disposition === 'grounded' || decision.disposition === 'supportive_resources') return 'grounded';
  return 'escalate';
}
