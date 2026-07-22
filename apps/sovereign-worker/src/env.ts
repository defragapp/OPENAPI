import type { BaselineInput, LocationPrecision } from './baseline';

export interface BaselineService {
  compute(input: BaselineInput): Promise<any>;
  currentConditions(input: { accountId: string; locationPrecision: LocationPrecision }): Promise<any>;
}

export interface Env {
  APP_ENV: string;
  APP_VERSION: string;
  DB: D1Database;
  KV?: KVNamespace;
  ARTIFACTS?: R2Bucket;
  JOBS?: Queue;
  BASELINE?: BaselineService;
  THREADS: DurableObjectNamespace;
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  AI_GATEWAY_ID?: string;
  AI?: { run: (model: string, input: unknown, options?: unknown) => Promise<unknown>; aiGatewayLogId?: string };
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_STANDARD?: string;
  STRIPE_PRICE_PREMIUM?: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
  STRIPE_PORTAL_RETURN_URL?: string;
  SCRIPTURE_TRANSLATION?: string;
  SOVV_INTERNAL_BASE_URL: string;
  SOVV_INTERNAL_AUTH_TOKEN: string;
  SESSION_SIGNING_SECRET: string;
  CURRENT_CONDITIONS_LAT?: string;
  CURRENT_CONDITIONS_LNG?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  TURNSTILE_EXPECTED_ACTION?: string;
  EMAIL_API_URL?: string;
  EMAIL_API_TOKEN?: string;
  EMAIL_FROM?: string;
  PUBLIC_APP_URL?: string;
  ASTRONOMY_API_URL?: string;
  EMAIL_TIMEOUT_MS?: string;
}

export interface AuthContext {
  accountId: string;
  subject: string;
  sovvCookieHeader?: string | undefined;
}
