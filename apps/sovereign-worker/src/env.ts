export interface Env {
  APP_ENV: string;
  APP_VERSION: string;
  DB: D1Database;
  KV?: KVNamespace;
  JOBS?: Queue;
  THREADS: DurableObjectNamespace;
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  AI_GATEWAY_ID?: string;
  AI?: { run: (model: string, input: unknown, options?: unknown) => Promise<unknown>; aiGatewayLogId?: string };
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  EMAIL?: { send: (message: { from: string; to: string; subject: string; text?: string; html?: string }) => Promise<unknown> };
  RESEND_API_KEY?: string;
  TRANSACTIONAL_FROM_EMAIL?: string;
  PUBLIC_CONTACT_EMAIL?: string;
  EMAIL_SMOKE_TEST_RECIPIENT?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY?: string;
  STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL?: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
  STRIPE_PORTAL_RETURN_URL?: string;
  SCRIPTURE_TRANSLATION?: string;
  SOVV_INTERNAL_BASE_URL?: string;
  SOVV_INTERNAL_AUTH_TOKEN?: string;
  SESSION_SIGNING_SECRET: string;
  CURRENT_CONDITIONS_LAT?: string;
  CURRENT_CONDITIONS_LNG?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  TURNSTILE_EXPECTED_ACTION?: string;
  PUBLIC_APP_URL?: string;
  ASTRONOMY_API_URL?: string;
  AI_FREE_MONTHLY_TURNS?: string;
  AI_SOVEREIGN_PLUS_MONTHLY_TURNS?: string;
  WORLDS_VIDEO_ENABLED?: string;
  WORLDS_VIDEO_MODEL?: string;
  WORLDS_VIDEO_TURN_COST?: string;
  THREAD_RETENTION_DAYS?: string;
  AUDIT_RETENTION_DAYS?: string;
  BASELINE_GEOCODER_URL?: string;
  BASELINE_TIMEZONE_URL?: string;
  BASELINE_HORIZONS_URL?: string;
  BASELINE_PROVIDER_TIMEOUT_MS?: string;
}

export interface AuthContext {
  accountId: string;
  subject: string;
  sessionId?: string | undefined;
  sovvCookieHeader?: string | undefined;
}
