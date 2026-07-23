import type { Env } from './env';

export type RuntimeMode = 'development' | 'test' | 'preview' | 'production' | 'unknown';

export function runtimeMode(env: Env): RuntimeMode {
  const raw = (env.APP_ENV || '').toLowerCase();
  if (raw === 'development' || raw === 'local') return 'development';
  if (raw === 'production') return 'production';
  if (raw === 'preview') return 'preview';
  if (raw === 'test') return 'test';
  return 'unknown';
}

export function canUseDevelopmentFixtures(env: Env): boolean {
  const mode = runtimeMode(env);
  return mode === 'development' || mode === 'test';
}

export function serviceUnavailable(message = 'Sovereign is not available right now. Your private context was not analyzed or saved as a model response.'): Response {
  return Response.json({ error: 'service_unavailable', message }, { status: 503, headers: { 'cache-control': 'no-store' } });
}
