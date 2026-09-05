# Milestone 3 Handoff Report: Auth, Lifecycle & D1 Transactions

**Agent**: `worker_m3`  
**Date**: 2026-09-05T07:46:00Z  
**Working Directory**: `/Users/cjo/OPENAPI/.agents/worker_m3/`  
**Parent**: Project Orchestrator (`d98ba1b1-afd7-4a1e-9dd5-16c5d31d2453`)  
**Type**: Hard Handoff  

---

## 1. Observation

### 1.1 Exclusively Owned Scope
- `apps/web/src/PlanOnboarding.tsx`
- `apps/sovereign-worker/src/auth-public.ts`
- `apps/sovereign-worker/src/db/accounts.ts`

### 1.2 Observed Pre-Change Defects
1. **Split-Brain Race Condition on Stripe Return (`PlanOnboarding.tsx`)**:
   - In `apps/web/src/PlanOnboarding.tsx` around line 197:
     ```ts
     if (completed || effectivePlan === 'sovereign_plus' || rememberedPlan === 'free') {
       setPhase('baseline');
       setStatus(nextBaseline.readinessMessage || 'Add the birth details you know. Your Baseline must be ready before the workspace opens.');
       return;
     }

     setPhase('plan');
     setStatus('Choose a plan first. You’ll build your Baseline before the workspace opens.');
     ```
     When users return from Stripe checkout via `/onboarding?billing=success` while the Stripe webhook is in flight, `effectivePlan` remains `'free'`, `completed` is `false`, and `rememberedPlan` is `'sovereign_plus'`. The check evaluated to `false`, resetting the user back to `phase: 'plan'` and displaying the plan selection screen instead of advancing to Baseline intake.
   - Also, if browser storage did not retain `rememberedPlan` (e.g. storage cleared or across contexts), returning with `billing=success` did not remember the Sovereign+ plan intent.

2. **Sequential Unbatched D1 Queries in `redeemMagicLink` (`auth-public.ts`)**:
   - Lines 275–288 executed separate sequential queries without atomic batching:
     ```ts
     const redeemed = await env.DB.prepare("UPDATE auth_magic_links SET used_at = datetime('now'), account_id = ? WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')").bind(accountId, row.id).run();
     if ((redeemed.meta?.changes ?? 0) === 0) return Response.json({ status: 'already used' }, { status: 409 });
     try {
       if (row.purpose === 'signup') {
         await env.DB.prepare("UPDATE accounts SET terms_accepted_at = ?, terms_version = ?, privacy_version = ?, updated_at = datetime('now') WHERE id = ? AND auth_subject = ?").bind(...).run();
         for (const [policyType, policyVersion] of [['terms', row.terms_version], ['privacy', row.privacy_version]] as const) {
           await env.DB.prepare("INSERT OR IGNORE INTO policy_acceptance_receipts ...").run();
         }
         if (row.name?.trim()) await env.DB.prepare("UPDATE persons ...").run();
       } else {
         await env.DB.prepare("UPDATE auth_email_codes ...").run();
       }
     ```
     If any query after `auth_magic_links` failed, the magic link was marked used but subsequent terms, policy acceptance receipts, or person updates were lost.

3. **Missing Error Boundaries and Explicit Error Codes (`AUTH_D1_ERROR`, `TURNSTILE_FAILED`)**:
   - In `apps/sovereign-worker/src/db/accounts.ts`, the initial `SELECT id, auth_subject FROM accounts` was outside the try/catch block, and the error response lacked `code: 'AUTH_D1_ERROR'`.
   - In `apps/sovereign-worker/src/auth-public.ts`, `createSessionResponse` lacked a try/catch boundary, allowing database exceptions on `auth_sessions` insert to bubble as raw 500 internal errors instead of `{ error: 'AUTH_D1_ERROR', code: 'AUTH_D1_ERROR' }`.
   - In `auth-public.ts`, `verifyTurnstile` invocation in `requestMagicLink` threw raw `Response` instances without a local catch handler returning the proper `TURNSTILE_FAILED` JSON envelope.

---

## 2. Logic Chain

1. **Fixing the Stripe Return Race Condition**:
   - In `PlanOnboarding.tsx` inside `loadJourney`:
     - Added logic:
       ```ts
       const billing = new URLSearchParams(location.search).get('billing');
       let rememberedPlan = readPlanChoice();
       if (billing === 'success' && !rememberedPlan) {
         rememberedPlan = 'sovereign_plus';
         rememberPlanChoice('sovereign_plus');
       }
       ```
     - Updated phase check at line 201 (formerly 197):
       ```ts
       if (completed || effectivePlan === 'sovereign_plus' || billing === 'success' || rememberedPlan === 'sovereign_plus' || rememberedPlan === 'free') {
         setPhase('baseline');
         setStatus(nextBaseline.readinessMessage || 'Add the birth details you know. Your Baseline must be ready before the workspace opens.');
         return;
       }
       ```
     - Preserved `if (effectivePlan === 'sovereign_plus')` at line 145 to ensure compatibility with `AccountJourneyRelease.test.ts:86`.
   - As a result, any user returning from Stripe checkout directly enters the Baseline intake phase without being forced to choose a plan again.

2. **Atomic D1 Transaction Batching**:
   - In `apps/sovereign-worker/src/auth-public.ts:redeemMagicLink`, combined all write operations into an array of prepared statements:
     - `UPDATE auth_magic_links SET used_at = datetime('now'), account_id = ? ...`
     - For signup:
       - `UPDATE accounts SET terms_accepted_at = ?, terms_version = ?, privacy_version = ?, updated_at = datetime('now') ...`
       - `INSERT OR IGNORE INTO policy_acceptance_receipts` for terms
       - `INSERT OR IGNORE INTO policy_acceptance_receipts` for privacy
       - Optional `UPDATE persons SET display_name = ? ...`
     - For login:
       - `UPDATE auth_email_codes SET used_at = COALESCE(used_at, datetime('now')) ...`
   - Executed via `env.DB.batch(statements)` if available (with fallback loop for mock test runners like `fakeEnv()`).
   - Verified that if `firstResult?.meta?.changes === 0`, it returns 409 `{ status: 'already used' }`.
   - Applied identical batching pattern in `redeemEmailCode` for `auth_email_codes` and `auth_magic_links`.

3. **Explicit Error Codes and Error Boundaries**:
   - In `apps/sovereign-worker/src/db/accounts.ts`:
     - Wrapped the entire body of `resolveAccount` (both `SELECT` and `INSERT` batch) in try/catch.
     - Throws HTTP 500 `Response` containing `{ error: 'AUTH_D1_ERROR', code: 'AUTH_D1_ERROR', status: 'error', message: 'Account creation failed during database transaction' }`.
   - In `apps/sovereign-worker/src/auth-public.ts`:
     - In `requestMagicLink`, wrapped `verifyTurnstile` in a try/catch block returning `turnstileProblem('unavailable', 503)` or the thrown Response (`TURNSTILE_FAILED`).
     - In `requestMagicLink`, wrapped D1 magic link and email code inserts in try/catch returning `{ status: 'error', error: 'AUTH_D1_ERROR', code: 'AUTH_D1_ERROR', message: 'Authentication request failed during schema write' }`.
     - In `redeemMagicLink`, wrapped account resolution and batched D1 execution in try/catch returning `{ status: 'error', error: 'AUTH_D1_ERROR', code: 'AUTH_D1_ERROR', message: 'Account creation failed during schema write' }`.
     - In `redeemEmailCode`, wrapped D1 queries in try/catch returning `{ status: 'error', error: 'AUTH_D1_ERROR', code: 'AUTH_D1_ERROR', message: 'Email code redemption failed during schema write' }`.
     - In `createSessionResponse`, wrapped session creation in try/catch returning `{ status: 'error', error: 'AUTH_D1_ERROR', code: 'AUTH_D1_ERROR', message: 'Session creation failed during schema write' }`.

4. **Migrations Parity & Four-Step Lifecycle Validation**:
   - Re-verified all 19 D1 migrations (0001 through 0019) with `pnpm verify:migrations`. All non-destructive and replay tests pass cleanly.
   - Validated end-to-end lifecycle contract:
     `[Auth / Account Creation]` -> `[Tier Selection: Free vs Sovereign+]` -> `[Baseline Intake: DOB/TOB/POB]` -> `[Workspace Entry]`.

---

## 3. Caveats

- In test mock environments (`scripts/auth-smoke.ts`), `env.DB.batch` is not mocked as a method on the simulated database; the implementation gracefully falls back to sequential statement execution when `typeof env.DB.batch !== 'function'`, ensuring both mock and production Cloudflare D1 runtimes succeed.
- No other caveats. All changes are contained within exclusively owned files.

---

## 4. Conclusion

1. The Stripe checkout return split-brain race condition in `PlanOnboarding.tsx` is completely resolved.
2. D1 query batching in `auth-public.ts:redeemMagicLink` and `redeemEmailCode` is atomic via `env.DB.batch([...])`.
3. Explicit `AUTH_D1_ERROR` and `TURNSTILE_FAILED` error boundaries are in place across account activation, session creation, and Turnstile verification.
4. All local tests, typechecks, migration checks, and smoke tests pass with 0 errors.

---

## 5. Verification Method

To independently verify:

1. **Typecheck Workspace**:
   ```bash
   pnpm -r typecheck
   ```
   *Result*: Exits with code 0 across all 10 workspace packages.

2. **Verify D1 Migrations Parity**:
   ```bash
   pnpm verify:migrations
   ```
   *Result*: Exits with code 0. Validated 19 migration files for non-destructive structure; migration upgrade verified immutable from 0018 -> 0019.

3. **Run Auth Smoke Tests**:
   ```bash
   pnpm smoke:auth
   ```
   *Result*: Exits with code 0. Reports: `Auth smoke passed private_login=true signup_only_creation=true policy_acceptance=true eligibility_18_plus=true policy_receipts=2 email=true redemption=true session=true used_rejected=true`.

4. **Run Lifecycle Contract Test Suites**:
   ```bash
   pnpm exec vitest run apps/web/src/OnboardingOrderContract.test.ts apps/sovereign-worker/src/workspace-onboarding-contract.test.ts apps/web/src/AccountJourneyRelease.test.ts
   ```
   *Result*: Exits with code 0 (3 files, 36 passed).

5. **Run Auth Public & Security Test Suites**:
   ```bash
   pnpm exec vitest run apps/sovereign-worker/src/auth-public.test.ts apps/sovereign-worker/src/auth-account-creation-contract.test.ts apps/sovereign-worker/src/email-code-recovery.test.ts apps/sovereign-worker/src/email-code-security-contract.test.ts apps/sovereign-worker/src/d1-session.test.ts
   ```
   *Result*: Exits with code 0 (5 files, 29 passed).

6. **Run Foundation & Related Smoke Tests**:
   ```bash
   pnpm verify:foundation
   pnpm smoke:baseline
   pnpm smoke:product
   ```
   *Result*: All exit with code 0.
