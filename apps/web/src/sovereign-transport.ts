export type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';

export interface RequestContext {
  surface: Surface;
  personId?: string;
  systemId?: string;
  covenantEnabled?: boolean;
}

export interface AlignmentMeta {
  applicable: boolean;
  direction: 'shadow_pull' | 'mixed' | 'conditional' | 'supportive' | 'strongly_supportive' | 'unclear';
  confidence: 'limited' | 'moderate' | 'strong';
  supportingFactors: string[];
  counterFactors: string[];
  missingContext: string[];
  explanation: string;
}

export interface ResponseMeta {
  alignment?: AlignmentMeta;
  response?: {
    phase: 'question' | 'integration';
    confidence?: 'confirmed' | 'supported' | 'exploratory';
    safetyMode?: 'standard' | 'grounded' | 'escalate';
  };
}

const PREFIX = '[[SOVEREIGN_META_V1:';
const END = ']]';

export function decodeSovereignResponse(value: string): { text: string; metadata?: ResponseMeta; pending: boolean } {
  if (!value.startsWith(PREFIX)) return { text: value, pending: false };
  const end = value.indexOf(END, PREFIX.length);
  if (end < 0) return { text: '', pending: true };
  const encoded = value.slice(PREFIX.length, end);
  const text = value.slice(end + END.length).replace(/^\r?\n/, '');
  try {
    return { text, metadata: decodeBase64Url<ResponseMeta>(encoded), pending: false };
  } catch {
    return { text, pending: false };
  }
}

function decodeBase64Url<T>(value: string): T {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
