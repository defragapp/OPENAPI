import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const entry = readFileSync(new URL('./entry.ts', import.meta.url), 'utf8');
const resources = readFileSync(new URL('./agent/safety-resources.ts', import.meta.url), 'utf8');

describe('safety response transport contract', () => {
  it('builds safety metadata before entitlement and model access', () => {
    const safetyBranch = entry.indexOf("if (safetyDecision.disposition !== 'standard')");
    const entitlementLookup = entry.indexOf('const entitlements = await getEntitlements');
    expect(safetyBranch).toBeGreaterThan(-1);
    expect(entitlementLookup).toBeGreaterThan(safetyBranch);
    expect(entry).toContain("buildSafetyResponseMetadata(safetyDecision, connectionCountry(request))");
    expect(entry).toContain('formatSafetyResourcesText(safety)');
  });

  it('returns the explicit contract and catalog version to the browser', () => {
    expect(entry).toContain('Response.json({ answer, basis: [], interfaceActions, safety }');
    expect(entry).toContain("'x-sovereign-safety-presentation': safety.presentation");
    expect(entry).toContain("'x-sovereign-resource-catalog': safety.resourceCatalog.version");
    expect(resources).toContain("version: 'sovereign-safety-response.v1'");
    expect(resources).toContain("version: 'sovereign-safety-resources.2026-08-02'");
  });

  it('uses only coarse request country and does not persist or infer exact location', () => {
    expect(entry).toContain("(request as Request & { cf?: { country?: unknown } }).cf?.country");
    expect(entry).not.toContain('cf?.latitude');
    expect(entry).not.toContain('cf?.longitude');
    expect(resources).not.toContain('latitude');
    expect(resources).not.toContain('longitude');
    expect(resources).not.toContain('postalCode');
  });

  it('keeps deterministic safety responses free of ordinary actions and Basis evidence', () => {
    expect(entry).toContain('primary: null');
    expect(entry).toContain('contextual: []');
    expect(entry).toContain('basis: []');
    expect(entry).toContain("'cache-control': 'private, no-store'");
  });
});
