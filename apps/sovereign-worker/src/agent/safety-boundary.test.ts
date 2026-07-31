import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const entrySource = readFileSync(new URL('../entry.ts', import.meta.url), 'utf8');

describe('server-owned safety execution boundary', () => {
  it('returns deterministic safety before Gateway checks and AI turn reservation', () => {
    const decisionIndex = entrySource.indexOf('const safetyDecision = decideSovereignInputSafety(message)');
    const responseIndex = entrySource.indexOf("if (safetyDecision.disposition !== 'standard')", decisionIndex);
    const gatewayIndex = entrySource.indexOf('const aiConfig = resolveAiModelConfig(env)', responseIndex);
    const usageIndex = entrySource.indexOf('const usage = await reserveAiTurn', gatewayIndex);

    expect(decisionIndex).toBeGreaterThan(0);
    expect(responseIndex).toBeGreaterThan(decisionIndex);
    expect(gatewayIndex).toBeGreaterThan(responseIndex);
    expect(usageIndex).toBeGreaterThan(gatewayIndex);
  });

  it('suppresses technical Basis and ordinary interface actions for deterministic safety', () => {
    const start = entrySource.indexOf("if (safetyDecision.disposition !== 'standard')");
    const end = entrySource.indexOf('const aiConfig = resolveAiModelConfig(env)', start);
    const boundary = entrySource.slice(start, end);

    expect(boundary).toContain('primary: null');
    expect(boundary).toContain('contextual: []');
    expect(boundary).toContain('basis: []');
    expect(boundary).not.toContain('reserveAiTurn');
    expect(boundary).not.toContain('buildInterfaceActions');
    expect(boundary).not.toContain('show_plan');
    expect(boundary).not.toContain('offer_covenant');
    expect(boundary).not.toContain('save_to_library');
  });

  it('keeps ordinary generation on the existing Cloudflare Gateway and quota path', () => {
    expect(entrySource).toContain("aiConfig.provider !== 'cloudflare-gateway'");
    expect(entrySource).toContain('const usage = await reserveAiTurn');
    expect(entrySource).toContain('runSovereignResult(message');
    expect(entrySource).toContain('releaseAiTurn(env, auth.accountId, usage.periodKey)');
  });
});
