import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const productionEntry = readFileSync(new URL('./production-entry.ts', import.meta.url), 'utf8');
const rootConfig = readFileSync(new URL('../../../wrangler.jsonc', import.meta.url), 'utf8');
const directConfig = readFileSync(new URL('../../../wrangler.production-direct.jsonc', import.meta.url), 'utf8');
const verifier = readFileSync(new URL('../../../scripts/verify-direct-preview-config.mjs', import.meta.url), 'utf8');

describe('production launch preflight', () => {
  it('is the exact production entry in both canonical Wrangler configs', () => {
    expect(JSON.parse(rootConfig).main).toBe('apps/sovereign-worker/src/production-entry.ts');
    expect(JSON.parse(directConfig).main).toBe('apps/sovereign-worker/src/production-entry.ts');
    expect(JSON.parse(rootConfig)).toEqual(JSON.parse(directConfig));
    expect(verifier).toContain("rootConfig.main === 'apps/sovereign-worker/src/production-entry.ts'");
  });

  it('preflights paid relationship and system context before the delegated runtime can persist a turn', () => {
    expect(productionEntry).toContain("const safety = decideSovereignInputSafety(message)");
    expect(productionEntry).toContain("if (safety.disposition !== 'standard') return null");
    expect(productionEntry).toContain('const entitlements = await getEntitlements(env, auth.accountId)');
    expect(productionEntry).toContain('if (selection.personId || selection.systemId)');
    expect(productionEntry).toContain('await authorizeConversationContext(env, auth.accountId, selection, entitlements)');
    expect(productionEntry.indexOf('await authorizeConversationContext'))
      .toBeLessThan(productionEntry.indexOf('return runtime.fetch(request, env, executionContext)'));
  });

  it('keeps urgent/grounded/refusal handling outside paid entitlement preflight', () => {
    expect(productionEntry.indexOf("if (safety.disposition !== 'standard') return null"))
      .toBeLessThan(productionEntry.indexOf('const entitlements = await getEntitlements(env, auth.accountId)'));
  });

  it('checks a previously enabled Covenant thread again after a billing downgrade', () => {
    expect(productionEntry).toContain('SELECT covenant_enabled FROM threads WHERE id = ? AND account_id = ?');
    expect(productionEntry).toContain("requireFeature(entitlements, 'covenant.lens')");
  });

  it('fails dormant audio closed and gates legacy system analysis', () => {
    expect(productionEntry).toContain("DISABLED_TEXT_FIRST_PATHS = new Set(['/api/tts'])");
    expect(productionEntry).toContain('LEGACY_SYSTEM_ALIGNMENT_PATH');
    expect(productionEntry).toContain("? 'systems.family' : 'systems.team'");
  });
});
