import { Hono } from 'hono';
import { computeReducedBaseline, computeReducedCurrentConditions, type SanitizedBaselineInput, type SanitizedCurrentConditionsInput } from '@sovereign/baseline-engine';

export interface Env {
  APP_ENV: string;
  APP_VERSION: string;
  BASELINE_MODE: 'reduced';
  BASELINE_INTERNAL_TOKEN?: string;
  ASTRO_CACHE?: KVNamespace;
}

export interface BaselineWorkerService {
  computeReducedBaseline(input: SanitizedBaselineInput): Promise<Awaited<ReturnType<typeof computeReducedBaseline>>>;
  computeReducedCurrentConditions(input: SanitizedCurrentConditionsInput): Promise<Awaited<ReturnType<typeof computeReducedCurrentConditions>>>;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (context) => context.json({ ok: true, service: 'baseline-worker', version: context.env.APP_VERSION }));
app.get('/ready', (context) => context.json({ ready: context.env.BASELINE_MODE === 'reduced', mode: context.env.BASELINE_MODE }));

app.post('/internal/baseline/reduced', async (context) => {
  if (!isInternal(context.req.raw, context.env)) return context.text('Not found', 404);
  const input = await context.req.json<SanitizedBaselineInput>();
  return context.json(await computeReducedBaseline(input));
});

app.post('/internal/current-conditions/reduced', async (context) => {
  if (!isInternal(context.req.raw, context.env)) return context.text('Not found', 404);
  const input = await context.req.json<SanitizedCurrentConditionsInput>();
  return context.json(await computeReducedCurrentConditions(input));
});

function isInternal(request: Request, env: Env): boolean {
  if (!env.BASELINE_INTERNAL_TOKEN) return true;
  return request.headers.get('x-openapi-internal') === env.BASELINE_INTERNAL_TOKEN;
}

export default app;
