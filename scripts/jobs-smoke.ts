import { cleanupExpired, executeDeletion } from '../apps/sovereign-worker/src/jobs';
import type { Env } from '../apps/sovereign-worker/src/env';

function env(): Env & { _writes: string[] } {
  const writes: string[] = [];
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async run() { writes.push(`${sql} ${JSON.stringify(args)}`); return { success: true, meta: { changes: 1 } }; },
            async all() { writes.push(`${sql} ${JSON.stringify(args)}`); return { results: [] }; },
            async first() {
              if (sql.startsWith('SELECT id, status FROM deletion_jobs')) {
                return { id: 'delete_jobs', status: 'running' };
              }
              return null;
            }
          };
        },
        async run() { writes.push(sql); return { success: true, meta: { changes: 1 } }; },
        async all() { writes.push(sql); return { results: [] }; }
      };
    }
  } as unknown as D1Database;

  return {
    APP_ENV: 'test',
    APP_VERSION: 'jobs-smoke',
    DB: db,
    THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SOVV_INTERNAL_BASE_URL: '',
    SOVV_INTERNAL_AUTH_TOKEN: '',
    SESSION_SIGNING_SECRET: 'secret',
    _writes: writes
  };
}

async function main() {
  const e = env();
  await executeDeletion(e, 'acct_jobs', 'delete_jobs');
  await cleanupExpired(e);
  const joined = e._writes.join('\n');
  for (const expected of [
    'deletion_jobs',
    'auth_sessions',
    'auth_email_codes',
    'auth_passkeys',
    'auth_passkey_challenges',
    'privacy_request_events',
    'saved_understandings',
    'auth_magic_links',
    'retained_billing_record'
  ]) {
    if (!joined.includes(expected)) throw new Error(`missing job write ${expected}`);
  }
  if (/ARTIFACTS|R2Bucket|exports\//.test(joined)) throw new Error('R2 dependency remained in jobs smoke');
  console.log('Jobs smoke passed deletion_executes=true cleanup_executes=true credential_cleanup=true privacy_request_cleanup=true r2=false');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
