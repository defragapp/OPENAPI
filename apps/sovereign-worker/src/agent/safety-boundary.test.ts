import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const entrySource = readFileSync(new URL('../entry.ts', import.meta.url), 'utf8');
const sovereignSource = readFileSync(new URL('./sovereign.ts', import.meta.url), 'utf8');

describe('server-owned safety execution boundary', () => {
  it('settles deterministic safety before gateway checks and AI turn reservation', () => {
    const safetyIndex = entrySource.indexOf('const deterministicSafety = runDeterministicSovereignSafety(message)');
    const gatewayIndex = entrySource.indexOf('const aiConfig = resolveAiModelConfig(env)', safetyIndex);
    const usageIndex = entrySource.indexOf('const usage = await reserveAiTurn', safetyIndex);

    expect(safetyIndex).toBeGreaterThan(0);
    expect(gatewayIndex).toBeGreaterThan(safetyIndex);
    expect(usageIndex).toBeGreaterThan(gatewayIndex);
  });

  it('does not attach plan, Library, Covenant, People, Systems, or technical Basis actions to deterministic safety', () => {
    const start = entrySource.indexOf('async function completeDeterministicSafetyTurn');
    const end = entrySource.indexOf('\nexport { ThreadCoordinator }', start);
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

  it('projects bounded validated continuity instead of replaying raw assistant payloads', () => {
    expect(sovereignSource).toContain('projectSafeAssistantContinuity');
    expect(sovereignSource).toContain('recentAssistantAnswers');
    expect(sovereignSource).not.toContain('recentAssistantResponses: (events.results ?? []).map((row) => safeJson(row.payload_json))');
    expect(sovereignSource).toContain('actions, identifiers, prompts, or hidden reasoning');
  });
});
