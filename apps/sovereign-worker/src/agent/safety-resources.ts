import type { SovereignInputSafetyCategory, SovereignInputSafetyDecision } from './input-safety';

export const sovereignSafetyPresentations = [
  'grounded',
  'supportive_resources',
  'urgent',
  'emergency',
  'secure_refusal'
] as const;

export type SovereignSafetyPresentation = typeof sovereignSafetyPresentations[number];

export interface SovereignSafetyResourceAction {
  kind: 'call' | 'text' | 'link';
  label: string;
  value: string;
}

export interface SovereignSafetyResourceEntry {
  id: string;
  name: string;
  purpose: 'emergency' | 'crisis_support';
  jurisdiction: 'US';
  actions: SovereignSafetyResourceAction[];
  provenance: 'official_government' | 'official_service';
  officialSource: string;
  reviewedOn: '2026-08-02';
}

export interface SovereignSafetyResourceSelection {
  version: 'sovereign-safety-resources.2026-08-02';
  jurisdiction: 'US' | 'unknown';
  selectionSource: 'connection_country' | 'generic_fallback';
  selectionNotice: string;
  disregardAllowed: true;
  resources: SovereignSafetyResourceEntry[];
}

export interface SovereignSafetyResponseMetadata {
  version: 'sovereign-safety-response.v1';
  disposition: SovereignInputSafetyDecision['disposition'];
  category: SovereignInputSafetyCategory;
  presentation: SovereignSafetyPresentation;
  resourceCatalog: SovereignSafetyResourceSelection;
}

const emergencyServices: SovereignSafetyResourceEntry = {
  id: 'us-emergency-911',
  name: 'Emergency services',
  purpose: 'emergency',
  jurisdiction: 'US',
  actions: [
    { kind: 'call', label: 'Call 911', value: '911' }
  ],
  provenance: 'official_government',
  officialSource: 'https://www.911.gov/calling-911/',
  reviewedOn: '2026-08-02'
};

const crisisSupport: SovereignSafetyResourceEntry = {
  id: 'us-988-lifeline',
  name: '988 Suicide & Crisis Lifeline',
  purpose: 'crisis_support',
  jurisdiction: 'US',
  actions: [
    { kind: 'call', label: 'Call 988', value: '988' },
    { kind: 'text', label: 'Text 988', value: '988' },
    { kind: 'link', label: 'Official 988 information', value: 'https://988lifeline.org/get-help/' }
  ],
  provenance: 'official_service',
  officialSource: 'https://988lifeline.org/get-help/',
  reviewedOn: '2026-08-02'
};

const crisisSupportCategories = new Set<SovereignInputSafetyCategory>([
  'immediate_self_harm',
  'possible_self_harm',
  'severe_confusion',
  'substantial_distress'
]);

const emergencyCategories = new Set<SovereignInputSafetyCategory>([
  'immediate_self_harm',
  'immediate_harm_to_others',
  'immediate_danger',
  'medical_urgency'
]);

export function buildSafetyResponseMetadata(
  decision: SovereignInputSafetyDecision,
  connectionCountry?: string
): SovereignSafetyResponseMetadata {
  const presentation = presentationForDecision(decision);
  const normalizedCountry = connectionCountry?.trim().toUpperCase();

  if (presentation === 'secure_refusal') {
    return {
      version: 'sovereign-safety-response.v1',
      disposition: decision.disposition,
      category: decision.category,
      presentation,
      resourceCatalog: {
        version: 'sovereign-safety-resources.2026-08-02',
        jurisdiction: 'unknown',
        selectionSource: 'generic_fallback',
        selectionNotice: '',
        disregardAllowed: true,
        resources: []
      }
    };
  }

  const resources: SovereignSafetyResourceEntry[] = [];
  if (normalizedCountry === 'US') {
    if (presentation === 'emergency' || (presentation === 'urgent' && emergencyCategories.has(decision.category))) {
      resources.push(emergencyServices);
    }
    if (crisisSupportCategories.has(decision.category)) resources.push(crisisSupport);
  }

  return {
    version: 'sovereign-safety-response.v1',
    disposition: decision.disposition,
    category: decision.category,
    presentation,
    resourceCatalog: normalizedCountry === 'US'
      ? {
          version: 'sovereign-safety-resources.2026-08-02',
          jurisdiction: 'US',
          selectionSource: 'connection_country',
          selectionNotice: 'These U.S. resources were selected from the connection country only. That may be wrong, and you can disregard them.',
          disregardAllowed: true,
          resources
        }
      : {
          version: 'sovereign-safety-resources.2026-08-02',
          jurisdiction: 'unknown',
          selectionSource: 'generic_fallback',
          selectionNotice: 'Sovereign could not safely determine a supported jurisdiction. Use local emergency services or a trusted person without relying on a model-generated contact.',
          disregardAllowed: true,
          resources: []
        }
  };
}

export function formatSafetyResourcesText(metadata: SovereignSafetyResponseMetadata): string[] {
  if (metadata.presentation === 'secure_refusal' || !metadata.resourceCatalog.selectionNotice) return [];
  if (metadata.resourceCatalog.resources.length === 0) {
    return ['HUMAN SUPPORT', metadata.resourceCatalog.selectionNotice];
  }

  return [
    'HUMAN SUPPORT',
    metadata.resourceCatalog.selectionNotice,
    ...metadata.resourceCatalog.resources.flatMap((resource) => [
      resource.name,
      ...resource.actions.map((action) => action.label)
    ])
  ];
}

function presentationForDecision(decision: SovereignInputSafetyDecision): SovereignSafetyPresentation {
  if (decision.disposition === 'secure_refusal') return 'secure_refusal';
  if (decision.disposition === 'urgent') {
    return emergencyCategories.has(decision.category) ? 'emergency' : 'urgent';
  }
  if (decision.disposition === 'grounded') {
    return decision.category === 'substantial_distress' ? 'supportive_resources' : 'grounded';
  }
  return 'grounded';
}
