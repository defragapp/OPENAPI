import { z } from 'zod';
import { reviewSovereignOutputSafety } from './safety';

export const alignmentResultSchema = z.object({
  applicable: z.boolean(),
  direction: z.enum(['shadow_pull', 'mixed', 'conditional', 'supportive', 'strongly_supportive', 'unclear']),
  confidence: z.enum(['limited', 'moderate', 'strong']),
  supporting_factors: z.array(z.string().min(1).max(220)).max(6),
  counter_factors: z.array(z.string().min(1).max(220)).max(6),
  missing_context: z.array(z.string().min(1).max(220)).max(6),
  explanation: z.string().max(420)
});

export type AlignmentResult = z.infer<typeof alignmentResultSchema>;

export const neutralAlignmentResult = (): AlignmentResult => ({
  applicable: false,
  direction: 'unclear',
  confidence: 'limited',
  supporting_factors: [],
  counter_factors: [],
  missing_context: ['A specific choice, behavior, relationship, or direction has not been assessed.'],
  explanation: 'The alignment instrument remains neutral until the structured response contains enough relevant context.'
});

export function parseAlignmentResult(raw: string): AlignmentResult {
  try {
    const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
    const alignment = alignmentResultSchema.parse(parsed.alignment ?? neutralAlignmentResult());
    return sanitizeAlignment(alignment);
  } catch {
    return neutralAlignmentResult();
  }
}

export function alignmentJsonContract(): string {
  return JSON.stringify({
    applicable: 'true only when the user is examining a concrete choice, behavior, relationship, opportunity, or direction',
    direction: 'shadow_pull | mixed | conditional | supportive | strongly_supportive | unclear',
    confidence: 'limited | moderate | strong; based on the quality and completeness of relevant context, never response length',
    supporting_factors: ['specific supplied or authorization-checked factors that support fit'],
    counter_factors: ['specific supplied or authorization-checked factors that complicate fit'],
    missing_context: ['facts still needed before a stronger assessment'],
    explanation: 'one plain-language sentence explaining the direction without a score, verdict, prediction, or command'
  }, null, 2);
}

function sanitizeAlignment(value: AlignmentResult): AlignmentResult {
  const rewrite = (text: string) => reviewSovereignOutputSafety(text).text;
  return {
    ...value,
    supporting_factors: value.supporting_factors.map(rewrite),
    counter_factors: value.counter_factors.map(rewrite),
    missing_context: value.missing_context.map(rewrite),
    explanation: rewrite(value.explanation)
  };
}

function extractJson(raw: string): string {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Structured response was not JSON');
  return trimmed.slice(start, end + 1);
}
