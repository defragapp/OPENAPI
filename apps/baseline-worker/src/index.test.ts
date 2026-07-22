import { describe, expect, it } from 'vitest';
import app, { type Env } from './index';

const env: Env = { APP_ENV: 'test', APP_VERSION: 'test', BASELINE_MODE: 'reduced', BASELINE_INTERNAL_TOKEN: 'secret' };

describe('baseline worker', () => {
  it('reports readiness for reduced mode', async () => {
    const response = await app.fetch(new Request('https://baseline.test/ready'), env);
    await expect(response.json()).resolves.toMatchObject({ ready: true, mode: 'reduced' });
  });

  it('requires the internal token when configured', async () => {
    const response = await app.fetch(new Request('https://baseline.test/internal/baseline/reduced', { method: 'POST', body: '{}' }), env);
    expect(response.status).toBe(404);
  });

  it('computes reduced Baseline context through the private endpoint', async () => {
    const response = await app.fetch(new Request('https://baseline.test/internal/baseline/reduced', {
      method: 'POST',
      headers: { 'x-openapi-internal': 'secret' },
      body: JSON.stringify({ birthDate: '1990-01-02', birthTime: { certainty: 'exact', localTime: '03:04' }, birthPlace: { country: 'US' } })
    }), env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ready', privacy: { rawBirthInputSentToModel: false, exactLocationSentToModel: false } });
  });
});
