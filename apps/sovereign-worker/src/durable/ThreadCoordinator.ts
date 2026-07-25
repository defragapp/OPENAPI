import type { Env } from '../env';

interface TurnRequest { idempotencyKey: string; accountId: string; message: string; }

export class ThreadCoordinator {
  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const turn = await request.json<TurnRequest>();
    if (!turn.idempotencyKey || !turn.accountId || !turn.message) return Response.json({ error: 'Invalid turn' }, { status: 400 });

    const existing = await this.state.storage.get<number>(`idempotency:${turn.idempotencyKey}`);
    if (existing !== undefined) return Response.json({ sequence: existing, duplicate: true });

    // One turn reserves user, plan, and public-response event positions.
    const sequence = ((await this.state.storage.get<number>('sequence')) ?? -2) + 3;
    await this.state.storage.put({ sequence, [`idempotency:${turn.idempotencyKey}`]: sequence });
    return Response.json({ sequence, duplicate: false });
  }
}
