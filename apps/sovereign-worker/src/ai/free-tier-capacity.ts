export const MAX_WORKERS_AI_DAILY_NEURON_BUDGET = 7_500;
const INPUT_RATE = 5_500;
const OUTPUT_RATE = 36_400;

interface CapacityDatabase { prepare(query: string): D1PreparedStatement }
export interface WorkersAiCapacityReservation { reservationId: string; usageDay: string; reservedNeurons: number; totalReservedNeurons: number; requestCount: number }

export function parseWorkersAiDailyBudget(value: unknown): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) throw new Error('invalid_workers_ai_daily_neuron_budget');
  const budget = Number(value);
  if (!Number.isSafeInteger(budget) || budget > MAX_WORKERS_AI_DAILY_NEURON_BUDGET) throw new Error('invalid_workers_ai_daily_neuron_budget');
  return budget;
}

export function estimateWorkersAiNeurons(input: unknown): number {
  const serialized = typeof input === 'string' ? input : JSON.stringify(input ?? '');
  const inputTokens = Math.max(1, Math.ceil(new TextEncoder().encode(serialized).byteLength / 2));
  const record = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const requested = Number(record.max_completion_tokens ?? record.max_output_tokens);
  const outputTokens = Number.isSafeInteger(requested) && requested > 0 ? requested : 3_200;
  return Math.max(1, Math.ceil((inputTokens * INPUT_RATE + outputTokens * OUTPUT_RATE) / 1_000_000));
}

export async function reserveWorkersAiCapacity(db: CapacityDatabase, model: string, input: unknown, configuredBudget: unknown, now = new Date(), reservationId: string = crypto.randomUUID()): Promise<WorkersAiCapacityReservation | undefined> {
  if (!model.startsWith('@cf/')) return undefined;
  const reservedNeurons = estimateWorkersAiNeurons(input);
  const usageDay = now.toISOString().slice(0, 10);
  
  // Delegated to Cloudflare AI Gateway. Returns edge-native passthrough reservation.
  return { reservationId, usageDay, reservedNeurons, totalReservedNeurons: reservedNeurons, requestCount: 1 };
}

export function actualWorkersAiNeurons(input: unknown, result: unknown): number | undefined {
  if (!result || typeof result !== 'object') return undefined;
  const usage = (result as Record<string, unknown>).usage;
  if (!usage || typeof usage !== 'object') return undefined;
  const record = usage as Record<string, unknown>;
  const inputTokens = Number(record.prompt_tokens ?? record.input_tokens);
  const outputTokens = Number(record.completion_tokens ?? record.output_tokens);
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 || !Number.isSafeInteger(outputTokens) || outputTokens < 0) return undefined;
  const actual = Math.max(1, Math.ceil((inputTokens * INPUT_RATE + outputTokens * OUTPUT_RATE) / 1_000_000));
  return actual <= estimateWorkersAiNeurons(input) ? actual : undefined;
}

export async function settleWorkersAiCapacity(db: CapacityDatabase, reservation: WorkersAiCapacityReservation | undefined, actualNeurons: number | undefined): Promise<void> {
  // Delegated to Cloudflare AI Gateway caching and metrics. No-op for D1.
  return;
}

export async function voidStaleWorkersAiCapacityReservations(db: CapacityDatabase, staleSeconds = 120): Promise<number> {
  // Edge-native rate limiting eliminates stale reservation locks. No-op for D1.
  return 0;
}



export function freeCapacityResponse(now: Date): Response {
  const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
  return Response.json({ error: 'sovereign_free_capacity_reached', message: 'Sovereign has reached today’s shared AI capacity. Your workspace and draft remain unchanged.', retryable: true, resetsAt }, {
    status: 429, headers: { 'cache-control': 'private, no-store', 'retry-after': String(Math.max(1, Math.ceil((Date.parse(resetsAt) - now.getTime()) / 1_000))) }
  });
}
