export const DEFAULT_DAILY_NEURON_BUDGET = 7_500;
const INPUT_NEURONS_PER_MILLION_TOKENS = 5_500;
const OUTPUT_NEURONS_PER_MILLION_TOKENS = 36_400;
const CONSERVATIVE_BYTES_PER_TOKEN = 1;

export function resolveWorkersAiDailyNeuronBudget(configured: string | undefined): number {
  const value = configured?.trim();
  if (!value) return DEFAULT_DAILY_NEURON_BUDGET;
  if (!/^\d+$/.test(value)) {
    throw new Error('WORKERS_AI_DAILY_NEURON_BUDGET must be a whole number');
  }
  const budget = Number(value);
  if (!Number.isSafeInteger(budget) || budget < 1 || budget > DEFAULT_DAILY_NEURON_BUDGET) {
    throw new Error(`WORKERS_AI_DAILY_NEURON_BUDGET must be between 1 and ${DEFAULT_DAILY_NEURON_BUDGET} for the Cloudflare Free launch`);
  }
  return budget;
}

interface CapacityDatabase {
  prepare(query: string): D1PreparedStatement;
}

export interface WorkersAiCapacityReservation {
  usageDay: string;
  reservedNeurons: number;
  totalReservedNeurons: number;
  requestCount: number;
}

export function estimateWorkersAiNeurons(input: unknown): number {
  const serialized = typeof input === 'string' ? input : JSON.stringify(input ?? '');
  const inputBytes = new TextEncoder().encode(serialized).byteLength;
  const inputTokens = Math.max(1, Math.ceil(inputBytes / CONSERVATIVE_BYTES_PER_TOKEN));
  const record = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const configuredOutput = Number(record.max_completion_tokens ?? record.max_output_tokens ?? 0);
  const outputTokens = Number.isFinite(configuredOutput) && configuredOutput > 0
    ? Math.ceil(configuredOutput)
    : 3_200;
  const inputNeurons = inputTokens * INPUT_NEURONS_PER_MILLION_TOKENS / 1_000_000;
  const outputNeurons = outputTokens * OUTPUT_NEURONS_PER_MILLION_TOKENS / 1_000_000;
  return Math.max(1, Math.ceil(inputNeurons + outputNeurons));
}

export async function reserveWorkersAiCapacity(
  db: CapacityDatabase,
  model: string,
  input: unknown,
  now = new Date(),
  dailyBudgetConfig?: string
): Promise<WorkersAiCapacityReservation | undefined> {
  if (!model.startsWith('@cf/')) return undefined;
  const dailyNeuronBudget = resolveWorkersAiDailyNeuronBudget(dailyBudgetConfig);
  const usageDay = now.toISOString().slice(0, 10);
  const reservedNeurons = estimateWorkersAiNeurons(input);
  const row = await db.prepare(`INSERT INTO workers_ai_daily_capacity
      (usage_day, reserved_neurons, request_count, updated_at)
    VALUES (?, ?, 1, datetime('now'))
    ON CONFLICT(usage_day) DO UPDATE SET
      reserved_neurons = workers_ai_daily_capacity.reserved_neurons + excluded.reserved_neurons,
      request_count = workers_ai_daily_capacity.request_count + 1,
      updated_at = datetime('now')
    WHERE workers_ai_daily_capacity.reserved_neurons + excluded.reserved_neurons <= ?
    RETURNING reserved_neurons, request_count`)
    .bind(usageDay, reservedNeurons, dailyNeuronBudget)
    .first<{ reserved_neurons: number; request_count: number }>();

  if (!row) throw freeCapacityResponse(now, reservedNeurons, dailyNeuronBudget);
  return {
    usageDay,
    reservedNeurons,
    totalReservedNeurons: Number(row.reserved_neurons),
    requestCount: Number(row.request_count)
  };
}

export async function releaseWorkersAiCapacity(
  db: CapacityDatabase,
  reservation: WorkersAiCapacityReservation | undefined
): Promise<void> {
  if (!reservation) return;
  await db.prepare(`UPDATE workers_ai_daily_capacity
    SET reserved_neurons = MAX(0, reserved_neurons - ?),
        request_count = MAX(0, request_count - 1),
        updated_at = datetime('now')
    WHERE usage_day = ?`)
    .bind(reservation.reservedNeurons, reservation.usageDay)
    .run();
}

function freeCapacityResponse(now: Date, requestedNeurons: number, dailyNeuronBudget: number): Response {
  const resetsAt = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  )).toISOString();
  const retryAfterSeconds = Math.max(1, Math.ceil((Date.parse(resetsAt) - now.getTime()) / 1_000));
  return Response.json({
    error: 'sovereign_free_capacity_reached',
    message: 'Sovereign has reached today’s shared free AI capacity. Your workspace and saved understanding remain available.',
    retryable: true,
    requestedNeurons,
    dailyReservationBudget: dailyNeuronBudget,
    resetsAt
  }, {
    status: 429,
    headers: {
      'cache-control': 'private, no-store',
      'retry-after': String(retryAfterSeconds)
    }
  });
}
