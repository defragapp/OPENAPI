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
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_STANDARD?: string;
  STRIPE_PRICE_PREMIUM?: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
  STRIPE_PORTAL_RETURN_URL?: string;
  SOVV_INTERNAL_BASE_URL: string;
  SOVV_INTERNAL_AUTH_TOKEN: string;
  SESSION_SIGNING_SECRET: string;
  CURRENT_CONDITIONS_LAT?: string;
  CURRENT_CONDITIONS_LNG?: string;
}

export interface AuthContext {
  accountId: string;
  subject: string;
  sovvCookieHeader?: string | undefined;
}
