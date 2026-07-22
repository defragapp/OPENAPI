import type { Env } from './env';

export type RuntimeMode = 'local' | 'test' | 'production';

export function runtimeMode(env: Env): RuntimeMode {
  const raw = (env.APP_ENV || '').toLowerCase();
  if (raw === 'production') return 'production';
  if (raw === 'test') return 'test';
  return 'local';
}

export function canUseDevelopmentFixtures(env: Env): boolean {
  return runtimeMode(env) !== 'production';
}

export function serviceUnavailable(message = 'Sovereign is not available right now. Your private context was not analyzed or saved as a model response.'): Response {
  return Response.json({ error: 'service_unavailable', message }, { status: 503, headers: { 'cache-control': 'no-store' } });
}
