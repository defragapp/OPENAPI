import { WorkerEntrypoint } from 'cloudflare:workers';
import { computeCurrentConditionsForService, computeReducedBaseline, type BaselineInput, type LocationPrecision } from '../../sovereign-worker/src/baseline';
import type { Env as SovereignEnv } from '../../sovereign-worker/src/env';

export interface BaselineWorkerEnv {
  APP_ENV: string;
  APP_VERSION: string;
  BASELINE_PUBLIC_ROUTES?: string;
  ASTRONOMY_API_URL?: string;
}

function serviceEnv(env: BaselineWorkerEnv): SovereignEnv {
  return { ...env, DB: undefined as unknown as D1Database, THREADS: undefined as unknown as DurableObjectNamespace, STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: '' } as SovereignEnv;
}

export class BaselineEntrypoint extends WorkerEntrypoint<BaselineWorkerEnv> {
  async compute(input: BaselineInput) {
    return computeReducedBaseline(input);
  }

  async currentConditions(input: { accountId: string; locationPrecision: LocationPrecision }) {
    return computeCurrentConditionsForService(serviceEnv(this.env), input.accountId, input.locationPrecision);
  }
}

export default {
  async fetch() {
    return Response.json({ error: 'not_found', reason: 'Baseline Worker is private and available only through the BASELINE service binding.' }, { status: 404 });
  }
};
