export interface Env {
  APP_ENV: string;
  APP_VERSION: string;
  DB: D1Database;
  KV?: KVNamespace;
  THREADS: DurableObjectNamespace;
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  AI_GATEWAY_ID?: string;
  AI?: { run: (model: string, input: unknown, options?: unknown) => Promise<unknown>; aiGatewayLogId?: string };
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  ARTIFACTS?: R2Bucket;
  BASELINE?: Fetcher;
  BASELINE_INTERNAL_TOKEN?: string;
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_SOVEREIGN_PLUS?: string;
  STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY?: string;
  STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL?: string;
  STRIPE_PRICE_SOVEREIGN_SUPPORT?: string;
  STRIPE_SUPPORT_URL?: string;
  STRIPE_DONATION_URL?: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
  STRIPE_PORTAL_RETURN_URL?: string;
  SCRIPTURE_TRANSLATION?: string;
  SOVV_INTERNAL_BASE_URL: string;
  SOVV_INTERNAL_AUTH_TOKEN: string;
  SESSION_SIGNING_SECRET: string;
  TURNSTILE_SECRET_KEY?: string;
  CLOUDFLARE_EMAIL_FROM?: string;
  TERMS_VERSION?: string;
  PRIVACY_VERSION?: string;
  CURRENT_CONDITIONS_LAT?: string;
  CURRENT_CONDITIONS_LNG?: string;
}

export interface AuthContext {
  accountId: string;
  subject: string;
  sovvCookieHeader?: string | undefined;
}
