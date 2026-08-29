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
  const budget = parseWorkersAiDailyBudget(configuredBudget);
  const usageDay = now.toISOString().slice(0, 10);
  const reservedNeurons = estimateWorkersAiNeurons(input);
  const row = await db.prepare(`INSERT INTO workers_ai_daily_capacity (usage_day, reserved_neurons, request_count, updated_at)
    VALUES (?, ?, 1, datetime('now')) ON CONFLICT(usage_day) DO UPDATE SET
      reserved_neurons = workers_ai_daily_capacity.reserved_neurons + excluded.reserved_neurons,
      request_count = workers_ai_daily_capacity.request_count + 1, updated_at = datetime('now')
    WHERE workers_ai_daily_capacity.reserved_neurons + excluded.reserved_neurons <= ?
    RETURNING reserved_neurons, request_count`).bind(usageDay, reservedNeurons, budget).first<{ reserved_neurons: number; request_count: number }>();
  if (!row) throw freeCapacityResponse(now);
  try {
    await db.prepare(`INSERT INTO workers_ai_capacity_reservations (reservation_id, usage_day, reserved_neurons) VALUES (?, ?, ?)`)
      .bind(reservationId, usageDay, reservedNeurons).run();
  } catch (error) {
    await db.prepare(`UPDATE workers_ai_daily_capacity SET reserved_neurons = MAX(0, reserved_neurons - ?), request_count = MAX(0, request_count - 1), updated_at = datetime('now') WHERE usage_day = ?`)
      .bind(reservedNeurons, usageDay).run().catch(() => undefined);
    throw error;
  }
  return { reservationId, usageDay, reservedNeurons, totalReservedNeurons: Number(row.reserved_neurons), requestCount: Number(row.request_count) };
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
  if (!reservation || !Number.isSafeInteger(actualNeurons) || actualNeurons! < 0 || actualNeurons! > reservation.reservedNeurons) return;
  const refund = reservation.reservedNeurons - actualNeurons!;
  const claimed = await db.prepare(`UPDATE workers_ai_capacity_reservations SET settled_neurons = ?, settled_at = datetime('now')
    WHERE reservation_id = ? AND usage_day = ? AND reserved_neurons = ? AND settled_at IS NULL RETURNING reservation_id`)
    .bind(actualNeurons, reservation.reservationId, reservation.usageDay, reservation.reservedNeurons).first();
  if (!claimed) return;
  await db.prepare(`UPDATE workers_ai_daily_capacity SET reserved_neurons = MAX(0, reserved_neurons - ?), updated_at = datetime('now') WHERE usage_day = ?`)
    .bind(refund, reservation.usageDay).run();
}

// Reclaims neurons from shared-pool reservations that were never settled (an abandoned turn or a
// provider call that terminated before settlement). Each stale reservation is atomically claimed and
// marked settled so it cannot be refunded twice. Idempotent and never negative.
export async function voidStaleWorkersAiCapacityReservations(db: CapacityDatabase, staleSeconds = 120): Promise<number> {
  const modifier = `-${staleSeconds} seconds`;
  const stale = await db.prepare(
    `SELECT reservation_id, usage_day, reserved_neurons FROM workers_ai_capacity_reservations
     WHERE settled_at IS NULL AND created_at < datetime('now', ?)`
  ).bind(modifier).all<{ reservation_id: string; usage_day: string; reserved_neurons: number }>();
  let released = 0;
  for (const row of stale.results ?? []) {
    const claimed = await db.prepare(
      `UPDATE workers_ai_capacity_reservations SET settled_neurons = 0, settled_at = datetime('now')
       WHERE reservation_id = ? AND usage_day = ? AND reserved_neurons = ? AND settled_at IS NULL RETURNING reservation_id`
    ).bind(row.reservation_id, row.usage_day, row.reserved_neurons).first<{ reservation_id: string }>();
    if (!claimed) continue;
    await db.prepare(`UPDATE workers_ai_daily_capacity SET reserved_neurons = MAX(0, reserved_neurons - ?), updated_at = datetime('now') WHERE usage_day = ?`)
      .bind(row.reserved_neurons, row.usage_day).run();
    released += 1;
  }
  return released;
}

function freeCapacityResponse(now: Date): Response {
  const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
  return Response.json({ error: 'sovereign_free_capacity_reached', message: 'Sovereign has reached today’s shared AI capacity. Your workspace and draft remain unchanged.', retryable: true, resetsAt }, {
    status: 429, headers: { 'cache-control': 'private, no-store', 'retry-after': String(Math.max(1, Math.ceil((Date.parse(resetsAt) - now.getTime()) / 1_000))) }
  });
}
