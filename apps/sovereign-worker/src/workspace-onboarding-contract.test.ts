import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const onboardingMigration = readFileSync(new URL('../migrations/0010_account_onboarding_and_chat_history.sql', import.meta.url), 'utf8');
const recoveryMigration = readFileSync(new URL('../migrations/0011_email_code_recovery.sql', import.meta.url), 'utf8');
const capacityMigration = readFileSync(new URL('../migrations/0013_workers_ai_free_capacity.sql', import.meta.url), 'utf8');
const policyReceiptMigration = readFileSync(new URL('../migrations/0016_policy_acceptance_receipts.sql', import.meta.url), 'utf8');
const privacyAccessMigration = readFileSync(new URL('../migrations/0017_privacy_access_and_eligibility.sql', import.meta.url), 'utf8');
const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const index = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./entry.ts', import.meta.url), 'utf8');
const baseline = readFileSync(new URL('./baseline.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');
const privacyRights = readFileSync(new URL('./privacy-rights.ts', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('../../web/src/PlanOnboarding.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('../../web/src/AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('../../web/src/SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const permissions = readFileSync(new URL('../../web/src/ProductCompletionLayer.tsx', import.meta.url), 'utf8');
const systemPermissions = readFileSync(new URL('../../web/src/SystemMembershipManager.tsx', import.meta.url), 'utf8');
const entitlements = readFileSync(new URL('./db/entitlements.ts', import.meta.url), 'utf8');
const people = readFileSync(new URL('./db/people.ts', import.meta.url), 'utf8');
const workspaceCss = readFileSync(new URL('../../web/src/app-shell.css', import.meta.url), 'utf8');
const entryCss = readFileSync(new URL('../../web/src/main.tsx', import.meta.url), 'utf8');

describe('account onboarding, recovery, and conversation persistence', () => {
  it('adds an explicit, account-scoped plan confirmation state', () => {
    expect(onboardingMigration).toContain('onboarding_completed_at');
    expect(onboardingMigration).toContain("plan_intent TEXT NOT NULL DEFAULT 'free'");
    expect(index).toContain("app.get('/api/v1/account/onboarding'");
    expect(index).toContain("app.post('/api/v1/account/onboarding'");
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('Choose Sovereign+');
  });

  it('sends new accounts to plan confirmation and returning accounts to an allowlisted destination', () => {
    expect(auth).toContain('createdAccount');
    expect(auth).toContain("onboarding?.onboarding_completed_at ? safeReturnTo(returnTo) : '/onboarding'");
    expect(runtime).toContain("pathname === '/onboarding'");
    expect(runtime).not.toContain('url.hostname.toLowerCase() !== APP_HOST');
  });

  it('checks current policy and eligibility before Baseline or plan verification opens the workspace', () => {
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/account/policy-status'");
    expect(authenticatedWorkspace.indexOf("fetch('/api/v1/account/policy-status'"))
      .toBeLessThan(authenticatedWorkspace.indexOf("fetch('/api/v1/account/onboarding'"));
    expect(authenticatedWorkspace).toContain("setState('policy_review')");
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/account/policy-acceptance'");
    expect(privacyRights).toContain('export async function getPolicyStatus');
    expect(privacyRights).toContain('export async function acceptCurrentPolicies');
    expect(privacyAccessMigration).toContain('eligibility_rule_version TEXT');
  });

  it('requires a structurally valid Baseline before onboarding completion or message persistence', () => {
    expect(index).toContain('await requireCompletedBaseline(context.env, auth.accountId)');
    expect(entry).toContain('await requireCompletedBaseline(env, auth.accountId)');
    expect(entry.indexOf('await requireCompletedBaseline(env, auth.accountId, threadId'))
      .not.toBeGreaterThan(entry.length);
    expect(entry.indexOf('await requireCompletedBaseline(env, auth.accountId)'))
      .toBeLessThan(entry.indexOf('await ensureThread(env, auth.accountId, threadId'));
    expect(baseline).toContain("error: 'baseline_required'");
    expect(baseline).toContain("type: 'https://sovereign.defrag.app/problems/baseline-required'");
    expect(baseline).toContain('baselineSourceDataSchema.safeParse');
    expect(baseline).toContain('baselineFacetProfileSchema.safeParse');
    expect(baseline).toContain('validateFacetProfileBasis(profile.data, registry)');
  });

  it('persists exact Baseline source before deferred facet preparation and exposes real readiness polling', () => {
    expect(index).toContain('deferFacetProfile: (task) => context.executionCtx.waitUntil(task)');
    expect(index).toContain("result.readinessState === 'facet_profile_preparing'");
    expect(index).toContain('? 202');
    expect(baseline).toContain('options.deferFacetProfile');
    expect(baseline).toContain("reducedContext.facetProfileStatus = 'pending'");
    expect(baseline).toContain("latest.facetProfileStatus = 'ready'");
    expect(baseline).toContain("latest.facetProfileStatus = 'retryable'");
    expect(onboarding).toContain('pollBaselineReadiness');
    expect(index).toContain("app.post('/api/v1/baseline/profile/prepare'");
    expect(baseline).toContain('prepareStoredBaselineFacetProfile');
    expect(onboarding).toContain("fetch('/api/v1/baseline/profile/prepare'");
  });

  it('resumes onboarding until both source and facet profile are ready', () => {
    for (const source of [onboarding, authenticatedWorkspace, workspace]) {
      expect(source).toContain("status === 'completed'");
      expect(source).toContain("ready === true");
      expect(source).toContain("facetProfileStatus === 'ready'");
      expect(source).not.toContain("status === 'partial'");
    }
  });

  it('contains no authenticated prompt-card menu or retired mobile destination bar', () => {
    for (const retired of ['surfacePrompts', 'exploreModes', 'question-rail', 'explore-mode-list', 'mobile-bottom-nav', 'library-grid', 'account-summary']) {
      expect(workspace).not.toContain(retired);
    }
    expect(workspace).toContain('composerExamples');
    expect(workspace).toContain('composer-example');
    expect(workspace).not.toContain('Ask a follow-up');
  });

  it('renders exact accessible Basis values with responsive limits and expiry protection', () => {
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(workspace).toContain('{value.display}');
    expect(workspace).toContain('aria-label={value.accessibleLabel}');
    expect(workspace).toContain('available.length - limit');
    expect(workspace).toContain("if (value.category !== 'live') return true");
    expect(workspace).toContain('expiry > Date.now()');
    expect(baseline).toContain("current.status === 'ready' ? buildCurrentBasisRegistry(reduced) : []");
    expect(workspace).toContain("current?.status === 'ready' ? `On");
  });

  it('returns state-specific recovery for unavailable answers and unrestorable threads', () => {
    expect(entry).toContain("error: 'answer_service_unavailable'");
    expect(entry).toContain("nextAction: 'retry_message'");
    expect(workspace).toContain('That conversation could not be restored.');
    expect(workspace).toContain('Your Baseline, permissions, and other saved conversations remain unchanged.');
  });

  it('keeps permissions visible, specific, and revocable from You', () => {
    for (const label of ['Current context', 'Permissions', 'People and invitations', 'System permissions', 'Data and privacy', 'Accessibility']) {
      expect(workspace).toContain(label);
    }
    expect(workspace).toContain('There is no “share everything” control.');
    expect(permissions).toContain("granted: false");
    expect(permissions).toContain("status: 'revoked'");
    expect(permissions).toContain("method: 'DELETE'");
    expect(systemPermissions).toContain('sovereign:open-system-membership');
  });

  it('uses real entitlement features before exposing paid task controls and preserves continuity', () => {
    for (const feature of ['people.compare', 'systems.family', 'systems.team', 'library.continuity']) {
      expect(workspace).toContain(feature);
    }
    expect(workspace).toContain("sessionStorage.setItem('sovereign:upgrade-continuity'");
    expect(workspace).toContain("get('billing') !== 'success'");
    expect(onboarding).not.toMatch(/\$99|\$20|\$8\.25|save \$141/);
    expect(entitlements).toContain("error: 'entitlement_required'");
    expect(entitlements).toContain("nextAction: 'review_plan'");
    expect(people).toContain("error: 'permission_denied'");
    expect(people).toContain("nextAction: 'review_permissions'");
  });

  it('keeps the composer mobile-safe and examples still under reduced motion', () => {
    expect(workspaceCss).toContain('env(safe-area-inset-bottom)');
    expect(workspaceCss).toContain('min-height: 44px');
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceCss).toContain('.composer-example');
    expect(workspace).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
  });

  it('keeps answers complete without opening Basis provenance and uses validated actions only', () => {
    expect(workspace.indexOf('<p className="direct-answer">'))
      .toBeLessThan(workspace.indexOf('<BasisStrip values={basis} />'));
    expect(workspace).toContain('trustedAnswerActions');
    expect(workspace).toContain('interfaceActions?.primary');
    expect(workspace).not.toContain('const primaryAction = answer.actions');
  });

  it('keeps passkey authentication as the final stylesheet authority', () => {
    expect(entryCss.indexOf("import './deployed-route-cohesion.css'"))
      .toBeLessThan(entryCss.indexOf("import './passkey-auth.css'"));
  });

  it('stores hashed, expiring, one-use email recovery codes with attempt limits', () => {
    expect(recoveryMigration).toContain('CREATE TABLE IF NOT EXISTS auth_email_codes');
    expect(recoveryMigration).toContain('code_hash TEXT NOT NULL');
    expect(recoveryMigration).toContain('max_attempts INTEGER NOT NULL DEFAULT 5');
    expect(auth).toContain('constantTimeEqual');
    expect(auth).toContain('invalidCodeResponse()');
  });

  it('stores global Workers AI reservations below the Cloudflare free allocation', () => {
    expect(capacityMigration).toContain('CREATE TABLE IF NOT EXISTS workers_ai_daily_capacity');
    expect(capacityMigration).toContain('reserved_neurons INTEGER NOT NULL');
    expect(runtime).toContain("aiFreeCapacity: db?.capacity_ready === 1 ? 'configured' : 'missing'");
    expect(runtime).toContain("dependencies.aiFreeCapacity === 'configured'");
  });

  it('exposes account-owned thread history and stores restorable message text', () => {
    expect(index).toContain("app.get('/api/v1/threads'");
    expect(index).toContain("app.get('/api/v1/threads/:threadId'");
    expect(entry).toContain('await touchThread(env, auth.accountId, threadId, message)');
    expect(entry).toContain("'user_message', { text: message");
    expect(entry).not.toContain("'user_message', { redacted: true");
  });

  it('reports migration 0018 with privacy and capacity-reservation readiness', () => {
    expect(runtime).toContain("CAPACITY_MIGRATION_VERSION = '0013_workers_ai_free_capacity'");
    expect(runtime).toContain("PASSKEY_MIGRATION_VERSION = '0014_passkey_authentication'");
    expect(runtime).toContain("RELEASE_EVIDENCE_MIGRATION_VERSION = '0015_release_evidence'");
    expect(runtime).toContain("POLICY_RECEIPT_MIGRATION_VERSION = '0016_policy_acceptance_receipts'");
    expect(runtime).toContain("LATEST_MIGRATION_VERSION = '0019_deprecate_manual_capacity'");
    expect(runtime).toContain('const migrationVersion = capacityReservationSchemaReady');
    expect(runtime).toContain("policyAcceptanceReceipts: policyReceiptSchemaReady ? 'configured' : 'missing'");
    expect(runtime).toContain("privacyAccessControls: privacyAccessSchemaReady ? 'configured' : 'missing'");
    expect(runtime).toContain("aiCapacityReservations: capacityReservationSchemaReady ? 'configured' : 'missing'");
    expect(policyReceiptMigration).toContain('CREATE TABLE policy_acceptance_receipts');
    expect(privacyAccessMigration).toContain('CREATE TABLE privacy_request_events');
    expect(runtime).toContain("answerContract: 'sovereign-answer.v2'");
  });
});
