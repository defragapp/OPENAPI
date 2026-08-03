import { describe, expect, it } from 'vitest';
import { buildSafetyResponseMetadata, formatSafetyResourcesText, sovereignSafetyPresentations } from './safety-resources';
import type { SovereignInputSafetyDecision } from './input-safety';

function decision(
  disposition: SovereignInputSafetyDecision['disposition'],
  category: SovereignInputSafetyDecision['category']
): SovereignInputSafetyDecision {
  return { version: 'sovereign-input-safety.v1', disposition, category };
}

describe('server-owned safety resource catalog', () => {
  it('publishes every supported presentation state', () => {
    expect(sovereignSafetyPresentations).toEqual([
      'grounded',
      'supportive_resources',
      'urgent',
      'emergency',
      'secure_refusal'
    ]);
  });

  it('selects reviewed U.S. emergency and crisis resources from connection country only', () => {
    const metadata = buildSafetyResponseMetadata(decision('urgent', 'immediate_self_harm'), 'us');
    expect(metadata.version).toBe('sovereign-safety-response.v1');
    expect(metadata.presentation).toBe('emergency');
    expect(metadata.resourceCatalog).toMatchObject({
      version: 'sovereign-safety-resources.2026-08-02',
      jurisdiction: 'US',
      selectionSource: 'connection_country',
      disregardAllowed: true
    });
    expect(metadata.resourceCatalog.selectionNotice).toContain('connection country only');
    expect(metadata.resourceCatalog.selectionNotice).toContain('disregard');
    expect(metadata.resourceCatalog.resources.map((resource) => resource.id)).toEqual([
      'us-emergency-911',
      'us-988-lifeline'
    ]);
    for (const resource of metadata.resourceCatalog.resources) {
      expect(resource.jurisdiction).toBe('US');
      expect(resource.reviewedOn).toBe('2026-08-02');
      expect(resource.officialSource).toMatch(/^https:\/\//);
      expect(['official_government', 'official_service']).toContain(resource.provenance);
    }
  });

  it('returns a generic no-contact fallback for unsupported or missing jurisdictions', () => {
    for (const country of [undefined, 'CA', 'T1']) {
      const metadata = buildSafetyResponseMetadata(decision('urgent', 'medical_urgency'), country);
      expect(metadata.presentation).toBe('emergency');
      expect(metadata.resourceCatalog).toMatchObject({
        jurisdiction: 'unknown',
        selectionSource: 'generic_fallback',
        resources: []
      });
      expect(formatSafetyResourcesText(metadata)).toEqual([
        'HUMAN SUPPORT',
        metadata.resourceCatalog.selectionNotice
      ]);
    }
  });

  it('maps supported dispositions without adding crisis resources to protected boundaries', () => {
    expect(buildSafetyResponseMetadata(decision('grounded', 'unverifiable_threat'), 'US').presentation).toBe('grounded');
    expect(buildSafetyResponseMetadata(decision('grounded', 'substantial_distress'), 'US').presentation).toBe('supportive_resources');
    expect(buildSafetyResponseMetadata(decision('urgent', 'abuse_or_coercion'), 'US').presentation).toBe('urgent');
    expect(buildSafetyResponseMetadata(decision('urgent', 'immediate_danger'), 'US').presentation).toBe('emergency');

    const protectedBoundary = buildSafetyResponseMetadata(decision('secure_refusal', 'protected_system_request'), 'US');
    expect(protectedBoundary.presentation).toBe('secure_refusal');
    expect(protectedBoundary.resourceCatalog.resources).toEqual([]);
    expect(protectedBoundary.resourceCatalog.selectionNotice).toBe('');
    expect(formatSafetyResourcesText(protectedBoundary)).toEqual([]);
  });

  it('contains only server-curated fixed actions', () => {
    const metadata = buildSafetyResponseMetadata(decision('urgent', 'immediate_self_harm'), 'US');
    const actions = metadata.resourceCatalog.resources.flatMap((resource) => resource.actions);
    expect(actions).toEqual([
      { kind: 'call', label: 'Call 911', value: '911' },
      { kind: 'call', label: 'Call 988', value: '988' },
      { kind: 'text', label: 'Text 988', value: '988' },
      { kind: 'link', label: 'Official 988 information', value: 'https://988lifeline.org/get-help/' }
    ]);
  });
});
