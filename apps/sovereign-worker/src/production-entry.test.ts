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

  it('fails readiness if any legacy SOVV authentication configuration is present in production', () => {
    expect(productionEntry).toContain("env.APP_ENV === 'production'");
    expect(productionEntry).toContain('env.SOVV_INTERNAL_BASE_URL || env.SOVV_INTERNAL_AUTH_TOKEN');
    expect(productionEntry).toContain("url.pathname === '/ready'");
    expect(productionEntry).toContain("error: 'legacy_auth_adapter_enabled'");
    expect(productionEntry).toContain("dependency: 'legacySovvAdapter'");
    expect(productionEntry).toContain('status: 503');
  });

  it('preflights paid relationship and system context before the delegated runtime can persist a turn', () => {
    expect(productionEntry).toContain("const safety = decideSovereignInputSafety(message)");
    expect(productionEntry).toContain("if (safety.disposition !== 'standard') return null");
    expect(productionEntry).toContain('const entitlements = await getEntitlements(env, auth.accountId)');
    expect(productionEntry).toContain('if (selection.personId || selection.systemId)');
    expect(productionEntry).toContain('await authorizeConversationContext(env, auth.accountId, selection, entitlements)');

    const delegatedFetch = 'return runtime.fetch(request, env, executionContext)';
    expect(productionEntry.indexOf('const preflight = await launchPreflight(request, env)'))
      .toBeLessThan(productionEntry.indexOf(delegatedFetch));

    const messageStart = productionEntry.indexOf('const messageMatch = url.pathname.match(THREAD_MESSAGE_PATH)');
    const messageEnd = productionEntry.indexOf('const systemAlignmentMatch = url.pathname.match(LEGACY_SYSTEM_ALIGNMENT_PATH)');
    const messagePreflight = productionEntry.slice(messageStart, messageEnd);
    expect(messagePreflight.indexOf('await authorizeConversationContext(env, auth.accountId, selection, entitlements)'))
      .toBeLessThan(messagePreflight.lastIndexOf('return null;'));
  });

  it('bounds the request before production preflight parses or delegates a message', () => {
    expect(productionEntry).toContain("import { readThreadMessageBody } from './security/request-body'");
    expect(productionEntry).toContain('await readThreadMessageBody(request.clone())');
    expect(productionEntry.indexOf('await readThreadMessageBody(request.clone())'))
      .toBeLessThan(productionEntry.indexOf('decideSovereignInputSafety(message)'));
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