import type { Env } from '../env';

interface TurnRequest { idempotencyKey: string; accountId: string; message: string; }
interface TurnReservation { sequence: number; userSequence: number; assistantSequence: number; nextSequence: number; duplicate: boolean; }

export class ThreadCoordinator {
  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const turn = await request.json<TurnRequest>();
    if (!turn.idempotencyKey || !turn.accountId || !turn.message) return Response.json({ error: 'Invalid turn' }, { status: 400 });

    const existing = await this.state.storage.get<TurnReservation>(`idempotency:${turn.idempotencyKey}`);
    if (existing !== undefined) return Response.json({ ...existing, duplicate: true });

    const userSequence = ((await this.state.storage.get<number>('sequence')) ?? 0) + 1;
    const assistantSequence = userSequence + 1;
    const reservation: TurnReservation = { sequence: userSequence, userSequence, assistantSequence, nextSequence: assistantSequence + 1, duplicate: false };
    await this.state.storage.put({ sequence: assistantSequence, [`idempotency:${turn.idempotencyKey}`]: reservation });
    return Response.json(reservation);
  }
}
