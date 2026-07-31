import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const entrySource = readFileSync(new URL('../entry.ts', import.meta.url), 'utf8');

describe('server-owned safety execution boundary', () => {
  it('returns deterministic safety before entitlements, private context, Gateway checks, and AI turn reservation', () => {
    const decisionIndex = entrySource.indexOf('const safetyDecision = decideSovereignInputSafety(message)');
    const responseIndex = entrySource.indexOf("if (safetyDecision.disposition !== 'standard')", decisionIndex);
    const entitlementsIndex = entrySource.indexOf('const entitlements = await getEntitlements', responseIndex);
    const authorizationIndex = entrySource.indexOf('const authorizedContext = await authorizeConversationContext', entitlementsIndex);
    const gatewayIndex = entrySource.indexOf('const aiConfig = resolveAiModelConfig(env)', authorizationIndex);
    const usageIndex = entrySource.indexOf('const usage = await reserveAiTurn', gatewayIndex);

    expect(decisionIndex).toBeGreaterThan(0);
    expect(responseIndex).toBeGreaterThan(decisionIndex);
    expect(entitlementsIndex).toBeGreaterThan(responseIndex);
    expect(authorizationIndex).toBeGreaterThan(entitlementsIndex);
    expect(gatewayIndex).toBeGreaterThan(authorizationIndex);
    expect(usageIndex).toBeGreaterThan(gatewayIndex);
  });

  it('suppresses technical Basis, plan metadata, and ordinary interface actions for deterministic safety', () => {
    const start = entrySource.indexOf("if (safetyDecision.disposition !== 'standard')");
    const end = entrySource.indexOf('const entitlements = await getEntitlements', start);
    const boundary = entrySource.slice(start, end);

    expect(boundary).toContain('primary: null');
    expect(boundary).toContain('contextual: []');
    expect(boundary).toContain('basis: []');
    expect(boundary).not.toContain('reserveAiTurn');
    expect(boundary).not.toContain('getEntitlements');
    expect(boundary).not.toContain('authorizeConversationContext');
    expect(boundary).not.toContain('x-sovereign-plan');
    expect(boundary).not.toContain('buildInterfaceActions');
    expect(boundary).not.toContain('show_plan');
    expect(boundary).not.toContain('offer_covenant');
    expect(boundary).not.toContain('save_to_library');
  });

  it('keeps ordinary generation on the existing entitlement, context, Cloudflare Gateway, and quota path', () => {
    expect(entrySource).toContain('const entitlements = await getEntitlements');
    expect(entrySource).toContain('const authorizedContext = await authorizeConversationContext');
    expect(entrySource).toContain("aiConfig.provider !== 'cloudflare-gateway'");
    expect(entrySource).toContain('const usage = await reserveAiTurn');
    expect(entrySource).toContain('runSovereignResult(message');
    expect(entrySource).toContain('releaseAiTurn(env, auth.accountId, usage.periodKey)');
  });
});
