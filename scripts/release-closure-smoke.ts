import { readFileSync } from 'node:fs';
import { computeCurrentConditions, computeReducedBaseline } from '../apps/sovereign-worker/src/baseline';
import { deletionInventory } from '../apps/sovereign-worker/src/jobs';
import { requestMagicLink, verifyTurnstile } from '../apps/sovereign-worker/src/auth-public';
import type { Env } from '../apps/sovereign-worker/src/env';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function fakeDb(): D1Database { return { prepare(sql: string) { return { bind(...args: unknown[]) { return { async first() { if (sql.includes('auth_magic_links WHERE email_normalized')) return null; if (sql.startsWith('SELECT id FROM accounts')) return null; if (sql.startsWith('SELECT id FROM persons')) return null; return null; }, async run() { return { success: true, meta: { changes: 1 } }; }, async all() { return { results: [] }; } }; }, async run() { return { success: true, meta: { changes: 1 } }; }, async all() { return { results: [] }; } }; } } as unknown as D1Database; }
async function main() {
  const worker = readFileSync('apps/sovereign-worker/src/index.ts', 'utf8');
  const runtime = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
  const privacyRights = readFileSync('apps/sovereign-worker/src/privacy-rights.ts', 'utf8');
  assert(worker.includes("app.post('/api/v1/threads/:threadId/covenant'"), 'missing Covenant thread route');
  assert(worker.includes("requireFeature(await getEntitlements") && worker.includes("'covenant.lens'"), 'missing Covenant entitlement gate');
  assert(worker.includes("requireConsent(context.env, auth.accountId, body.personId, 'covenant.include')"), 'missing Covenant person consent gate');
  assert(worker.includes("app.get('/api/v1/covenant/scripture/:reference', async () => Response.json({ error: 'not_found' }, { status: 404 }))"), 'direct scripture retrieval must be unavailable');
  assert(worker.includes('export async function queue'), 'missing optional background-message handler');
  assert(worker.includes('export async function scheduled'), 'missing scheduled cleanup export');
  assert(runtime.includes("url.pathname === '/api/v1/account/export'"), 'missing authenticated private export route');
  assert(runtime.includes("'content-disposition': 'attachment; filename=\"sovereign-account-export.json\"'"), 'private export is not returned as a download');
  assert(runtime.includes("privateExports: 'on-demand-no-artifact'"), 'runtime does not advertise on-demand no-artifact export');
  assert(privacyRights.includes("exportArtifactStored: false"), 'private export retention contract is missing');
  assert(privacyRights.includes("generatedOnDemand: true"), 'private export on-demand contract is missing');
  for (const prohibited of ['credential_id TEXT', 'public_key_jwk TEXT', 'stripe_customer_id TEXT', 'stripe_subscription_id TEXT', 'token_hash TEXT']) {
    assert(!privacyRights.includes(prohibited), `private export source includes prohibited credential/provider field marker ${prohibited}`);
  }
  assert(!privacyRights.includes('env.R2') && !privacyRights.includes('r2_key'), 'private export must not use R2 or retained export artifacts');
  const envProd = { APP_ENV: 'production', APP_VERSION: 'closure', DB: fakeDb(), THREADS: {} as DurableObjectNamespace, STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret' } as Env;
  let turnstileClosed = false; try { await verifyTurnstile(envProd, 'test-turnstile-pass'); } catch (error) { turnstileClosed = error instanceof Response && error.status === 503; }
  assert(turnstileClosed, 'production Turnstile test bypass was accepted');
  let emailClosed = false; try { await requestMagicLink(new Request('https://app.test/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'user@example.com', turnstileToken: 'x' }) }), { ...envProd, TURNSTILE_SECRET_KEY: 'secret' }); } catch { emailClosed = true; }
  assert(emailClosed, 'production email test capture or raw magic link path did not fail closed');
  const baseline = await computeReducedBaseline({ birthDate: '1990-01-01', birthTimeCertainty: 'unknown', birthplace: 'London', birthTimezone: 'Europe/London', locationPrecision: 'none' }, { allowRecordedFixture: true });
  assert(JSON.stringify(baseline.reducedContext).includes('unavailable'), 'unknown birth time did not disable unsupported precision-sensitive frameworks');
  const current = await computeCurrentConditions(envProd, 'acct_release', 'city_or_regional');
  assert(current.providerStatus === 'unavailable' && current.reduced.unknownActualState.includes('do not determine'), 'current conditions without provider did not fail closed');
  const required = [
    'auth_magic_links',
    'auth_email_codes',
    'auth_sessions',
    'auth_passkeys',
    'auth_passkey_challenges',
    'baseline_onboarding',
    'privacy_request_events',
    'current_conditions',
    'relationships',
    'consent_grants',
    'system_memberships',
    'thread_events',
    'user_corrections',
    'policy_acceptance_receipts:retained-with-pseudonymized-account-audit'
  ];
  const inventory = deletionInventory().join('\n');
  for (const item of required) assert(inventory.includes(item), `deletion inventory missing ${item}`);
  assert(!/R2:exports/.test(inventory), 'disabled R2 private-export storage remained in deletion inventory');
  console.log('Release closure smoke passed scheduled_cleanup=true optional_message_handler=true covenant_matrix=true turnstile_closed=true email_closed=true baseline_frameworks=true current_fails_closed=true deletion_inventory=true credential_cleanup=true privacy_request_cleanup=true private_exports=on-demand-no-artifact');
}
main().catch(async (error) => {
  if (error instanceof Response) {
    console.error(`Release closure smoke received HTTP ${error.status}: ${await error.text()}`);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exit(1);
});
