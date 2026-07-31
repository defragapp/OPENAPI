import type { Env } from './env';
import { startBaselineCompilation } from './baseline-compiler';
import { resolveCanonicalBaselineSubmission } from './baseline-place-resolution';

export async function startConfirmedBaselineCompilation(env: Env, accountId: string, rawInput: unknown) {
  const canonical = await resolveCanonicalBaselineSubmission(env, accountId, rawInput);
  return startBaselineCompilation(env, accountId, canonical);
}
