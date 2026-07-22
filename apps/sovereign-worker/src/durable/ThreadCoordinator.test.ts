import { describe, expect, it } from 'vitest';
import { ThreadCoordinator } from './ThreadCoordinator';
import type { Env } from '../env';

function coordinator() {
  const storage = new Map<string, unknown>();
  const state = {
    storage: {
      get: async <T>(key: string) => storage.get(key) as T | undefined,
      put: async (values: Record<string, unknown>) => { for (const [key, value] of Object.entries(values)) storage.set(key, value); }
    }
  } as unknown as DurableObjectState;
  return new ThreadCoordinator(state, {} as Env);
}

async function reserve(service: ThreadCoordinator, idempotencyKey: string) {
  const res = await service.fetch(new Request('https://thread.internal/turn', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, accountId: 'acct_1', message: 'hello' })
  }));
  expect(res.status).toBe(200);
  return res.json() as Promise<{ sequence: number; userSequence: number; assistantSequence: number; nextSequence: number; duplicate: boolean }>;
}

describe('ThreadCoordinator event sequencing', () => {
  it('reserves distinct user and assistant event slots and never reuses them for the next turn', async () => {
    const service = coordinator();
    const first = await reserve(service, 'idem-1');
    const second = await reserve(service, 'idem-2');

    expect(first.userSequence).toBe(1);
    expect(first.assistantSequence).toBe(2);
    expect(first.sequence).toBe(first.userSequence);
    expect(second.userSequence).toBe(3);
    expect(second.assistantSequence).toBe(4);
    expect(second.nextSequence).toBe(5);
  });

  it('keeps ordered reservations and returns the same reservation for duplicate turns', async () => {
    const service = coordinator();
    const first = await reserve(service, 'idem-1');
    const second = await reserve(service, 'idem-2');
    const duplicate = await reserve(service, 'idem-1');

    expect([first.userSequence, second.userSequence]).toEqual([1, 3]);
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.userSequence).toBe(first.userSequence);
    expect(duplicate.assistantSequence).toBe(first.assistantSequence);
  });

  it('does not corrupt the next reservation when an assistant response later fails', async () => {
    const service = coordinator();
    const failedTurn = await reserve(service, 'failed-assistant');
    expect(failedTurn.assistantSequence).toBe(2);

    const next = await reserve(service, 'next-turn');
    expect(next.userSequence).toBe(3);
    expect(next.assistantSequence).toBe(4);
  });
});
