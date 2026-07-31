import { z } from 'zod';
import type { Env } from './env';
import { startBaselineCompilation } from './baseline-compiler';
import { resolveAndStoreBaselinePlaceCandidates } from './baseline-place-provider';
import {
  confirmServerPlaceResolution,
  resolveCanonicalBaselineSubmission,
  type BaselinePlaceQuery
} from './baseline-place-resolution';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
  'Invalid birth date'
);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const legacySubmissionSchema = z.object({
  birthDate: dateSchema,
  birthplace: z.string().trim().min(2).max(240),
  birthTimeCertainty: z.enum(['exact', 'approximate', 'unknown']),
  birthTime: timeSchema.optional(),
  fullBirthName: z.string().trim().min(2).max(200).optional(),
  preferredName: z.string().trim().min(1).max(120).optional(),
  birthTimezone: z.string().optional(),
  locationPrecision: z.string().optional()
}).strict().superRefine((value, context) => {
  if ((value.birthTimeCertainty === 'exact' || value.birthTimeCertainty === 'approximate') && !value.birthTime) {
    context.addIssue({ code: 'custom', path: ['birthTime'], message: 'Birth time is required for exact or approximate certainty' });
  }
  if (value.birthTimeCertainty === 'unknown' && value.birthTime) {
    context.addIssue({ code: 'custom', path: ['birthTime'], message: 'Unknown birth time must not include a time value' });
  }
});

export async function startConfirmedBaselineCompilation(env: Env, accountId: string, rawInput: unknown) {
  const input = asRecord(rawInput);
  const canonical = typeof input.placeResolutionId === 'string'
    ? await resolveCanonicalBaselineSubmission(env, accountId, rawInput)
    : await resolveLegacyBaselineSubmission(env, accountId, rawInput);
  return startBaselineCompilation(env, accountId, canonical);
}

async function resolveLegacyBaselineSubmission(env: Env, accountId: string, rawInput: unknown) {
  const legacy = legacySubmissionSchema.parse(rawInput);
  const birthplace = parseBirthplace(legacy.birthplace);
  const candidates = await resolveAndStoreBaselinePlaceCandidates(env, accountId, birthplace);
  const confirmedCandidates = candidates.filter((candidate) => candidate.confidence === 'high');

  if (confirmedCandidates.length !== 1) {
    const status = candidates.length ? 409 : 422;
    throw Response.json({
      error: candidates.length ? 'baseline_place_confirmation_required' : 'baseline_place_not_found',
      message: candidates.length
        ? 'Choose the exact birthplace before the Baseline is calculated. No browser timezone or approximate location was used.'
        : 'That birthplace could not be resolved. Enter city, region, and country more precisely.',
      candidates
    }, {
      status,
      headers: { 'cache-control': 'private, no-store' }
    });
  }

  const selected = confirmedCandidates[0]!;
  await confirmServerPlaceResolution(env, accountId, selected.resolutionId);
  return resolveCanonicalBaselineSubmission(env, accountId, {
    ...(legacy.fullBirthName ? { fullBirthName: legacy.fullBirthName } : {}),
    ...(legacy.preferredName ? { preferredName: legacy.preferredName } : {}),
    birthDate: legacy.birthDate,
    birthTimeCertainty: legacy.birthTimeCertainty,
    ...(legacy.birthTime ? { birthTime: legacy.birthTime } : {}),
    birthplace,
    placeResolutionId: selected.resolutionId
  });
}

function parseBirthplace(value: string): BaselinePlaceQuery {
  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) {
    throw Response.json({
      error: 'baseline_place_incomplete',
      message: 'Enter the birthplace as city, region, and country.'
    }, {
      status: 400,
      headers: { 'cache-control': 'private, no-store' }
    });
  }
  const city = parts[0]!;
  const country = parts[parts.length - 1]!;
  const region = parts.slice(1, -1).join(', ');
  return { city, region, country };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
