export const consentScopes = [
  'pair.compare',
  'system.include',
  'trait.display',
  'framework.display',
  'current_conditions.use',
  'library.link',
  'covenant.include'
] as const;

export type ConsentScope = (typeof consentScopes)[number];
export type SystemType = 'family' | 'household' | 'friendship' | 'team' | 'workplace' | 'custom';
export type AlignmentState = 'aligned' | 'partially_aligned' | 'strained' | 'unknown';

export interface Person {
  id: string;
  accountId: string;
  displayName: string;
  role: string;
  sourceOfTruth: 'owner' | 'invited-account' | 'owner-entered';
  baselineStatus: 'pending' | 'ready' | 'unavailable';
}

export interface Relationship {
  id: string;
  accountId: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: string;
  directionality: 'mutual' | 'source-to-target' | 'target-to-source';
  systemId?: string;
}

export interface System {
  id: string;
  accountId: string;
  type: SystemType;
  name: string;
}

export interface AlignmentByLayer {
  individual: AlignmentState;
  interaction: AlignmentState;
  role: AlignmentState;
  system: AlignmentState;
}

export function isConsentScope(value: string): value is ConsentScope {
  return (consentScopes as readonly string[]).includes(value);
}
