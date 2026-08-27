import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import type { Env } from '../env';
import { getModelSafeBaselineContext } from '../baseline';
import { buildPairComparison, buildSystemAnalysis } from '../relational-context';
import { sovereignRuntimePromptV2 } from './prompt-v1';
import { groundedIntelligencePrompt } from './grounded-intelligence';
import { assertSafeUserInput, assertSovereignOutputSafety, reviewSovereignOutputSafety } from './safety';
import { projectModelSafeConversationContext } from '../conversation-context';
import {
  attachBasisValues,
  composeSovereignAnswerText,
  deriveAuthorizedBasisRegistry,
  parseSovereignAnswer,
  sovereignAnswerJsonContract,
  type SovereignAnswerV2
} from './recognition';
import type { BasisRegistryItem } from '../baseline-contracts';
import { assertCovenantSafe, retrieveCovenantContext, type ScripturePassage } from '../covenant/scripture';
import { buildEmotionalField } from '../emotional-field';
import { buildExpressionAxisValues } from '../expression-field';
import { buildRelationshipField } from '../relationship-field';
import type { RelationshipField } from '@sovereign/agent-contracts';

export interface SovereignContext {
  env: Env;
  accountId: string;
  threadId: string;
  traceId: string;
  covenantEnabled: boolean;
  plan: string;
  personId?: string;
  systemId?: string;
  authorizedContext?: unknown;
}

export interface SovereignResult {
  text: string;
  answer: SovereignAnswerV2;
  basis: BasisRegistryItem[];
}

export async function runSovereignText(input: string, context: SovereignContext): Promise<string> {
  return (await runSovereignResult(input, context)).text;
}

export async function runSovereignStream(input: string, context: SovereignContext): Promise<globalThis.ReadableStream<string>> {
  return oneChunkStream(Promise.resolve((await runSovereignResult(input, context)).text));
}

export async function runSovereignResult(input: string, context: SovereignContext): Promise<SovereignResult> {
  assertSafeUserInput(input);
  const aiConfig = resolveAiModelConfig(context.env);
  if (aiConfig.provider !== 'cloudflare-gateway') throw new Error('Only Cloudflare AI Gateway is supported.');

  const { prompt, basisRegistry, covenantPassages } = await buildCloudflareGatewayPrompt(input, context);
  const raw = await runCloudflareGateway(prompt, context, aiConfig.model);
  const answer = parseSovereignAnswer(raw, basisRegistry);
  assertAuthorizedAnswerMode(answer, context);
  groundCovenantScripture(answer, covenantPassages);
  const allowFrameworkLabels = asksForFrameworkDetail(input);
  sanitizeSovereignAnswerLanguage(answer, allowFrameworkLabels);
  const review = reviewSovereignOutputSafety(composeSovereignAnswerText(answer), { allowFrameworkLabels });
  const text = review.text;
  assertSovereignOutputSafety(text, { contract: 'sovereign-answer.v2', allowFrameworkLabels });
  if (answer.mode === 'covenant') assertCovenantSafe(text);
  return { text, answer, basis: attachBasisValues(answer, basisRegistry) };
}

function assertAuthorizedAnswerMode(answer: SovereignAnswerV2, context: SovereignContext): void {
  if (context.covenantEnabled && answer.mode !== 'covenant') {
    throw new Error('Explicitly enabled Covenant requires a Covenant answer');
  }
  if (!context.covenantEnabled && answer.mode === 'covenant') {
    throw new Error('Covenant cannot activate without explicit confirmation');
  }
  if (!context.covenantEnabled && context.personId && answer.mode !== 'relationship') {
    throw new Error('A permitted person comparison requires a relationship answer');
  }
  if (!context.covenantEnabled && context.systemId && answer.mode !== 'system') {
    throw new Error('A permitted system context requires a system answer');
  }
}

async function runCloudflareGateway(prompt: string, context: SovereignContext, model: string): Promise<string> {
  if (!context.env.AI) throw new Error('Cloudflare AI binding is not configured.');
  if (!context.env.AI_GATEWAY_ID) throw new Error('AI_GATEWAY_ID is not configured.');
  const result = await context.env.AI.run(
    model,
    { prompt, max_completion_tokens: 3_200 },
    {
      gateway: {
        id: context.env.AI_GATEWAY_ID,
        skipCache: true,
        collectLog: false,
        metadata: {
          plan: context.plan === 'sovereign_plus' ? 'sovereign_plus' : 'free',
          account_ref: await pseudonymousAccountRef(context),
          response_contract: 'sovereign-answer.v2'
        }
      }
    }
  );
  if (result instanceof Response) return result.text();
  if (result instanceof ReadableStream) return collectTextStream(decodeTextStream(result as ReadableStream<string | Uint8Array>));
  if (isAsyncIterable(result)) return collectTextStream(asyncIterableToTextStream(result));
  return extractText(result);
}

async function buildCloudflareGatewayPrompt(input: string, context: SovereignContext): Promise<{
  prompt: string;
  basisRegistry: BasisRegistryItem[];
  covenantPassages: ScripturePassage[];
}> {
  const [authorizedContext, continuity, covenantEnabled] = await Promise.all([
    resolveAuthorizedContext(context),
    loadRecognitionContinuity(context),
    isCovenantEnabledForThread(context)
  ]);
  const basisRegistry = deriveAuthorizedBasisRegistry({ authorizedContext, continuity });
  const covenantContext = covenantEnabled ? retrieveCovenantContext(input) : [];
  const covenantInstruction = covenantEnabled
    ? `Covenant was explicitly enabled for this thread. Use mode "covenant". Keep the grounded answer complete on its own. Use only these retrieved passages and quote no passage not present here:\n${JSON.stringify(covenantContext)}`
    : 'Covenant is off. Do not apply Scripture or biblical metaphor automatically.';

  const emotionalField = buildEmotionalFieldFromContext(authorizedContext);
  const emotionalFieldInstruction = emotionalField
    ? `\n\nEmotional Field — the dynamic pattern layer computed from Baseline and Expression Field:\n${JSON.stringify(emotionalField, null, 2)}\n\nUse the Emotional Field as structured evidence for the relevant loop phases. Ground observations in the pattern descriptions and expression dynamics provided. Do not use the Emotional Field to diagnose, assign hidden motives, claim exact emotions, or make deterministic predictions. The Emotional Field describes observable patterns and their possible dynamics; actual experience remains unknown unless the user confirms it. Select basis_refs from the Emotional Field's basisRefs when they materially support the answer.`
    : '';

  const relationshipField = buildRelationshipFieldFromContext(authorizedContext);
  const relationshipFieldInstruction = relationshipField
    ? `\n\nRelationship Field — the interaction dynamics layer computed from two Emotional Fields and pair contacts:\n${JSON.stringify(relationshipField, null, 2)}\n\nUse the Relationship Field as structured evidence for the relationship answer. Ground observations in the shared structures, contrasting structures, interaction dynamics, and recurring patterns provided. Do not use the Relationship Field to score compatibility, diagnose relationship health, assign hidden motives, claim certainty about what either person intends or feels, or predict outcomes. The Relationship Field describes observable interaction patterns and their possible dynamics; actual experience between participants remains unknown unless directly confirmed. Select basis_refs from the Relationship Field's basisRefs when they materially support the answer.`
    : '';

  const prompt = `${sovereignRuntimePromptV2}

Authorization-checked server context, stripped of raw birth inputs, exact private location, secrets, source paths, and private identifiers:
${JSON.stringify(authorizedContext)}

Recent thread continuity. Assistant text and user corrections only; no hidden reasoning:
${JSON.stringify(continuity)}

Authorized exact Basis registry. Select IDs only in basis_refs:
${JSON.stringify(basisRegistry.map(({ id, display, uncertainty, subject }) => ({ id, display, uncertainty, subject })))}

${groundedIntelligencePrompt(input)}${emotionalFieldInstruction}${relationshipFieldInstruction}

Required JSON shape:
${sovereignAnswerJsonContract()}

Current user message:
${input}

${covenantInstruction}`;
  return { prompt, basisRegistry, covenantPassages: covenantContext };
}

export function groundCovenantScripture(answer: SovereignAnswerV2, passages: ScripturePassage[]): void {
  if (answer.mode !== 'covenant') return;
  if (!passages.length) throw new Error('Covenant requires a retrieved Scripture passage');
  const scripture = answer.sections.find((section) => section.label.toLowerCase().includes('scripture'));
  if (!scripture) throw new Error('Covenant answer is missing its Scripture section');
  const nonScriptureText = [
    answer.headline,
    answer.direct_answer,
    ...answer.sections.filter((section) => section !== scripture).flatMap((section) => [section.label, section.body])
  ].join('\n');
  if (extractScriptureCitations(nonScriptureText).length) {
    throw new Error('Scripture citations must remain in the server-grounded Scripture section');
  }
  scripture.body = passages.map((passage) => (
    `${passage.citation} — ${passage.text}\nContext: ${passage.context}`
  )).join('\n\n');
}

function extractScriptureCitations(value: string): string[] {
  return value.match(/\b(?:[1-3]\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s+\d{1,3}:\d{1,3}(?:[–—-]\d{1,3})?\b/g) ?? [];
}

async function resolveAuthorizedContext(context: SovereignContext): Promise<unknown> {
  if (context.authorizedContext !== undefined) return projectModelSafeConversationContext(context.authorizedContext);
  if (context.systemId) return projectModelSafeConversationContext(await buildSystemAnalysis(context.env, context.accountId, context.systemId));
  if (context.personId) return projectModelSafeConversationContext(await buildPairComparison(context.env, context.accountId, context.personId));

  return getModelSafeBaselineContext(context.env, context.accountId);
}

async function loadRecognitionContinuity(context: SovereignContext): Promise<unknown> {
  const events = await context.env.DB.prepare(`SELECT te.event_type, te.payload_json, te.created_at
    FROM thread_events te JOIN threads t ON t.id = te.thread_id
    WHERE te.thread_id = ? AND t.account_id = ? AND te.event_type IN ('assistant_response','assistant_development_response')
    ORDER BY te.seq DESC LIMIT 3`).bind(context.threadId, context.accountId).all<Record<string, string>>();
  const corrections = await context.env.DB.prepare(`SELECT correction, note, created_at FROM user_corrections
    WHERE thread_id = ? AND account_id = ? ORDER BY created_at DESC LIMIT 3`).bind(context.threadId, context.accountId).all<Record<string, string | null>>();
  const userCorrections = corrections.results ?? [];
  return {
    recentAssistantResponses: (events.results ?? []).map((row) => safeJson(row.payload_json)),
    userCorrections,
    basisRegistry: userCorrections.flatMap((row, index): BasisRegistryItem[] => row.correction === 'yes'
      ? [{
          id: `user_confirmation.${index + 1}`,
          category: 'user_confirmation',
          display: 'U✓',
          accessibleLabel: 'User confirmed that a prior interpretation fit',
          computedAt: normalizeDatabaseTimestamp(row.created_at ?? null),
          uncertainty: 'low',
          provenance: 'User confirmation',
          subject: 'self'
        }]
      : [])
  };
}

async function isCovenantEnabledForThread(context: SovereignContext): Promise<boolean> {
  const row = await context.env.DB.prepare('SELECT covenant_enabled FROM threads WHERE id = ? AND account_id = ?')
    .bind(context.threadId, context.accountId)
    .first<{ covenant_enabled: number }>();
  return row?.covenant_enabled === 1;
}

function asksForFrameworkDetail(input: string): boolean {
  return /\b(?:Bowen|IFS|internal family systems|attachment theory|psychological framework|sources?|research)\b/i.test(input);
}

/**
 * Attempt to build an Emotional Field from the authorized context.
 * Returns null if the context does not contain valid Baseline + Expression Field data.
 * This is a best-effort computation; the answer remains valid without it.
 */
export function buildEmotionalFieldFromContext(authorizedContext: unknown): ReturnType<typeof buildEmotionalField> | null {
  try {
    const root = authorizedContext as Record<string, unknown>;
    const selected = root.selectedContext as Record<string, unknown> | undefined;
    const baseline = (selected?.baseline ?? root.baseline) as Record<string, unknown> | undefined;
    if (!baseline) return null;

    const reducedContext = baseline.reducedContext as Record<string, unknown> | undefined;
    if (!reducedContext) return null;

    const rawFacetProfile = reducedContext.facetProfile as Record<string, unknown> | undefined;
    if (!rawFacetProfile || !Array.isArray(rawFacetProfile.facets)) return null;

    const facets = rawFacetProfile.facets.map((f: Record<string, unknown>) => ({
      id: String(f.id ?? ''),
      title: String(f.title ?? ''),
      description: String(f.description ?? ''),
      shadowExpression: String(f.shadowExpression ?? ''),
      giftExpression: String(f.giftExpression ?? ''),
      basisRefs: Array.isArray(f.basisRefs) ? f.basisRefs.map(String) : []
    })).filter((f: { id: string }) => f.id.length > 0);

    if (facets.length === 0) return null;

    const axes = buildExpressionAxisValues({ facets: facets as Parameters<typeof buildExpressionAxisValues>[0]['facets'] });

    return buildEmotionalField({
      facets: facets as Parameters<typeof buildEmotionalField>[0]['facets'],
      axes,
      domain: 'self'
    });
  } catch {
    return null;
  }
}

/**
 * Attempt to build a Relationship Field from a pair comparison authorized context.
 * Returns null if the context does not contain two participants with valid data.
 * This is a best-effort computation; the answer remains valid without it.
 */
export function buildRelationshipFieldFromContext(authorizedContext: unknown): RelationshipField | null {
  try {
    const root = authorizedContext as Record<string, unknown>;
    const participants = root.participants as Array<Record<string, unknown>> | undefined;
    if (!participants || participants.length < 2) return null;

    const interaction = root.interaction as Record<string, unknown> | undefined;
    if (!interaction) return null;

    const a = participants[0]!;
    const b = participants[1]!;
    const labelA = typeof a.label === 'string' ? a.label : 'Participant A';
    const labelB = typeof b.label === 'string' ? b.label : 'Participant B';
    const keyA = typeof a.key === 'string' ? a.key : 'a';
    const keyB = typeof b.key === 'string' ? b.key : 'b';

    const emotionalFieldA = buildEmotionalFieldForParticipant(a, labelA, keyA);
    const emotionalFieldB = buildEmotionalFieldForParticipant(b, labelB, keyB);
    if (!emotionalFieldA || !emotionalFieldB) return null;

    const rawPairContacts = interaction.exactPairContacts as Array<Record<string, unknown>> | undefined;
    const pairContacts = (rawPairContacts ?? []).map((c) => ({
      id: String(c.id ?? c.display ?? ''),
      display: String(c.display ?? ''),
      accessibleLabel: String(c.accessibleLabel ?? c.display ?? ''),
      uncertainty: String(c.uncertainty ?? 'medium')
    }));

    const rawFacetPairs = interaction.facetPairs as Array<Record<string, unknown>> | undefined;
    const facetPairs = (rawFacetPairs ?? []).map((fp) => ({
      facetId: String(fp.facetId ?? ''),
      participantA: extractFacetSnapshot(fp.you),
      participantB: extractFacetSnapshot(fp.other)
    })).filter((fp) => fp.facetId.length > 0 && fp.participantA && fp.participantB);

    return buildRelationshipField({
      emotionalFieldA,
      emotionalFieldB,
      pairContacts,
      facetPairs: facetPairs as Parameters<typeof buildRelationshipField>[0]['facetPairs']
    });
  } catch {
    return null;
  }
}

function buildEmotionalFieldForParticipant(
  participant: Record<string, unknown>,
  label: string,
  key: string
): { label: string; key: string; field: ReturnType<typeof buildEmotionalField> } | null {
  const rawFacets = participant.facets as Array<Record<string, unknown>> | undefined;
  if (!rawFacets || rawFacets.length === 0) return null;

  const facets = rawFacets.map((f) => ({
    id: String(f.id ?? ''),
    title: String(f.title ?? ''),
    description: String(f.description ?? ''),
    shadowExpression: String(f.shadowExpression ?? ''),
    giftExpression: String(f.giftExpression ?? ''),
    basisRefs: Array.isArray(f.basisRefs) ? f.basisRefs.map(String) : []
  })).filter((f) => f.id.length > 0);

  if (facets.length === 0) return null;

  const axes = buildExpressionAxisValues({ facets: facets as Parameters<typeof buildExpressionAxisValues>[0]['facets'] });
  const field = buildEmotionalField({
    facets: facets as Parameters<typeof buildEmotionalField>[0]['facets'],
    axes,
    domain: 'self'
  });

  return { label, key, field };
}

function extractFacetSnapshot(raw: unknown): { id: string; title: string; description: string; basisRefs: string[] } | null {
  if (!raw || typeof raw !== 'object') return null;
  const f = raw as Record<string, unknown>;
  const id = String(f.id ?? '');
  if (!id) return null;
  return {
    id,
    title: String(f.title ?? ''),
    description: String(f.description ?? ''),
    basisRefs: Array.isArray(f.basisRefs) ? f.basisRefs.map(String) : []
  };
}

export function sanitizeSovereignAnswerLanguage(answer: SovereignAnswerV2, allowFrameworkLabels: boolean): void {
  const rewrite = (value: string) => reviewSovereignOutputSafety(value, { allowFrameworkLabels }).text;
  answer.headline = rewrite(answer.headline);
  answer.direct_answer = rewrite(answer.direct_answer);
  answer.correction_prompt = rewrite(answer.correction_prompt);
  answer.sections = answer.sections.map((section) => ({
    ...section,
    label: rewrite(section.label),
    body: rewrite(section.body)
  }));
  answer.actions = answer.actions.map((action) => ({ ...action, label: rewrite(action.label) }));
}

async function pseudonymousAccountRef(context: SovereignContext): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(context.env.SESSION_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(context.accountId));
  return [...new Uint8Array(signature)].slice(0, 16).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function decodeTextStream(stream: ReadableStream<string | Uint8Array>): globalThis.ReadableStream<string> {
  const decoder = new TextDecoder();
  return stream.pipeThrough(new TransformStream<string | Uint8Array, string>({
    transform(chunk, controller) {
      const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      const publicText = extractStreamChunkText(text);
      if (publicText) controller.enqueue(publicText);
    }
  }));
}

function asyncIterableToTextStream(iterable: AsyncIterable<unknown>): globalThis.ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of iterable) controller.enqueue(extractText(chunk));
      controller.close();
    }
  });
}

function oneChunkStream(text: Promise<string>): globalThis.ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      controller.enqueue(await text);
      controller.close();
    }
  });
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return extractStreamChunkText(value);
  if (Array.isArray(value)) return value.map(extractText).join('');
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.output_text === 'string') return record.output_text;
    if (typeof record.text === 'string') return record.text;
    if (record.result) return extractText(record.result);
    if (record.response) return extractText(record.response);
    if (Array.isArray(record.output)) return extractText(record.output);
    if (Array.isArray(record.choices)) return record.choices.map(extractText).join('');
    if (record.delta) return extractText(record.delta);
    if (record.message) return extractText(record.message);
    if (record.content) return extractText(record.content);
  }
  return JSON.stringify(value ?? '') ?? '';
}

function extractStreamChunkText(text: string): string {
  if (!text.includes('data:')) return text;
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter((line) => line && line !== '[DONE]')
    .map((payload) => {
      try { return extractText(JSON.parse(payload)); } catch { return payload; }
    })
    .join('');
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return Boolean(value && typeof (value as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === 'function');
}

async function collectTextStream(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader();
  let output = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output += value;
  }
  return output;
}

function safeJson(value: string | undefined): unknown {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function normalizeDatabaseTimestamp(value: string | null): string {
  if (!value) return new Date(0).toISOString();
  const timestamp = Date.parse(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(timestamp) ? new Date(0).toISOString() : new Date(timestamp).toISOString();
}
