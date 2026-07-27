import type { AlignmentMeta, RequestContext, ResponseMeta, Surface } from './sovereign-transport';

export type Json = Record<string, any>;
export type ApiState = 'idle' | 'loading' | 'ready' | 'error';
export type Correction = 'yes' | 'partly' | 'not_today';
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  context?: RequestContext;
  interfaceActions?: { alignment?: AlignmentMeta; response?: ResponseMeta['response'] };
  createdAt?: string;
};
export type ThreadSummary = { id: string; title: string; contextKind?: string; updatedAt?: string; covenantEnabled?: boolean };
export type WorkspaceState = { today: Json | null; people: Json[]; systems: Json[]; library: Json[]; billing: Json | null; threads: ThreadSummary[] };
export type Api = (path: string, init?: RequestInit) => Promise<Json>;

export const SURFACES: Array<{ name: Surface; description: string }> = [
  { name: 'Today', description: 'Your Baseline, alive today' },
  { name: 'Explore', description: 'Open any part of yourself' },
  { name: 'People', description: 'Two Baselines, one relationship' },
  { name: 'Systems', description: 'See the whole system' },
  { name: 'Library', description: 'Keep what changes understanding' },
  { name: 'You', description: 'Your design and control' }
];

export const PROMPTS: Record<Surface, string[]> = {
  Today: ['What remains steady in me today?', 'What may be receiving more emphasis right now?', 'Where could this move into shadow?', 'What would the clearer expression look like?'],
  Explore: ['Show me a part of my Baseline I may not recognize yet.', 'Help me examine whether this choice fits who I am.', 'What is this response trying to protect?', 'What would a more integrated expression look like?'],
  People: ['What are we each bringing into this relationship?', 'How might this feel from the other side?', 'Where do our communication needs differ?', 'What belongs to me, and what belongs to them?'],
  Systems: ['What role does each person occupy in this system?', 'Where is responsibility concentrating?', 'What changes if I stop carrying this role?', 'Which perspectives are missing?'],
  Library: ['Continue from a saved understanding.', 'Connect two saved understandings.', 'What has changed since I saved this?', 'Apply this understanding to what is happening now.'],
  You: ['Explain one Baseline quality in plain language.', 'How does my Baseline shape communication?', 'What do shadow and light mean for me?', 'What can change without changing who I am?']
};

export function responseSections(text: string) { const clean = text.replace(/\r/g, '').trim(); if (!clean) return []; const blocks = clean.split(/\n\s*\n+/).map((block) => block.trim()).filter(Boolean); return blocks.slice(0, 8).map((block, index) => { const lines = block.split('\n').map((line) => line.trim()).filter(Boolean); const firstLine = lines[0] ?? ''; const heading = firstLine.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, ''); const hasHeading = lines.length > 1 && (firstLine.startsWith('#') || firstLine.endsWith(':') || firstLine.startsWith('**') || /^[A-Z][A-Z\s&·-]{3,}$/.test(firstLine)); return { title: hasHeading ? heading.replace(/:$/, '') : index === 0 ? 'Direct answer' : 'What this may show', body: (hasHeading ? lines.slice(1) : lines).join(' ').replace(/^[-*]\s+/gm, '') }; }); }
export function alignmentView(alignment?: AlignmentMeta) { if (!alignment?.applicable) return { position: 50, label: 'Bring a choice into view', confidence: alignment ? `${capitalize(alignment.confidence)} context` : 'Neutral', explanation: alignment?.explanation ?? 'The instrument remains neutral until validated structured context is available.' }; const positions: Record<AlignmentMeta['direction'], number> = { shadow_pull: 18, mixed: 44, conditional: 54, supportive: 70, strongly_supportive: 84, unclear: 50 }; const labels: Record<AlignmentMeta['direction'], string> = { shadow_pull: 'Strong shadow pull', mixed: 'Mixed or conditional', conditional: 'Potentially aligned with changes', supportive: 'Supportive of your direction', strongly_supportive: 'Strong aligned expression', unclear: 'More context needed' }; return { position: positions[alignment.direction], label: labels[alignment.direction], confidence: `${capitalize(alignment.confidence)} context`, explanation: alignment.explanation }; }
export function latestAlignment(messages: ChatMessage[]) { return [...messages].reverse().find((message) => message.role === 'assistant')?.interfaceActions?.alignment; }
export function responseType(surface: Surface, covenant: boolean) { return covenant ? 'covenant_reflection' : surface === 'People' ? 'relationship_understanding' : surface === 'Systems' ? 'system_understanding' : surface === 'Explore' ? 'alignment_exploration' : surface === 'Today' ? 'today_understanding' : 'baseline_understanding'; }
export function composerPlaceholder(surface: Surface) { return surface === 'People' ? 'Ask about this relationship…' : surface === 'Systems' ? 'Ask about this system…' : surface === 'Explore' ? 'Bring a choice, behavior, or quality into view…' : 'Ask Sovereign…'; }
export function surfaceIcon(surface: Surface) { return ({ Today: '◉', Explore: '✦', People: '◇', Systems: '⌘', Library: '□', You: '○' } as Record<Surface, string>)[surface]; }
export function newThreadId(surface: Surface) { return `thread-${Date.now()}-${surface}-${crypto.randomUUID().slice(0, 8)}`.replace(/[^a-z0-9_-]/gi, '-'); }
export function validClientId(value: unknown): value is string { return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value); }
export function firstText(...values: unknown[]) { return values.find((value) => typeof value === 'string' && value.trim()) as string ?? ''; }
export function shorten(value: unknown, max: number) { const text = typeof value === 'string' ? value.trim() : ''; return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text; }
export function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
export function requestContext(surface: Surface, personId: string, systemId: string, covenantEnabled: boolean): RequestContext { const context: RequestContext = { version: 1, surface, covenantEnabled }; if (personId) context.personId = personId; if (systemId) context.systemId = systemId; return context; }
export function surfaceFromContextKind(value?: string): Surface { const normalized = String(value ?? '').toLowerCase(); if (normalized === 'explore' || normalized === 'alignment') return 'Explore'; if (normalized === 'people' || normalized === 'relationship') return 'People'; if (normalized === 'systems' || normalized === 'system') return 'Systems'; if (normalized === 'library') return 'Library'; if (normalized === 'you' || normalized === 'account') return 'You'; return 'Today'; }
export function openConsentControls() { window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls')); }
