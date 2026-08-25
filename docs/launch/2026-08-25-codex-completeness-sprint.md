# Sovereign.OS — Codex Production Launch Completeness Sprint

**Issue:** #262  
**Parent:** #207  
**Final sign-off:** #216  
**Working branch:** `codex/launch-completeness-2026-08-25`  
**Canonical repository:** `defragapp/OPENAPI`  

## Mission

Take the existing Sovereign.OS implementation to a real high-traffic public launch without redesigning the product or weakening any existing release/privacy/security gates.

This is a completeness, hardening, verification, and acceptance sprint.

## Product contract to preserve

- one continuous Sovereign intelligence workspace;
- text-first core experience;
- Baseline as private, explorable reference;
- current/temporary context separate from Baseline;
- permission-bound People and Systems;
- `sovereign-answer.v2`;
- qualitative Alignment, never a compatibility score;
- inspectable, non-probative Basis;
- optional Covenant;
- intentional Library persistence;
- server-enforced entitlements;
- near-black / warm-cream editorial visual language;
- conversation-primary UI.

Do not add or restore Worlds/video launch dependencies, compatibility percentages, hidden-motive certainty, deterministic psychological claims, Tarot, unsupported framework claims, practitioner/organizational/developer tiers, broad architecture replacements, or broad visual redesigns.

## P0 launch blockers from the 2026-08-25 audit

### 1. Node 22+ canonical gate

Repository authority requires Node `>=22`. The audit ran in Node `20.20.2`, causing Wrangler and `node:sqlite` failures.

Run the canonical gates in Node 22+; never lower the engine requirement or bypass the migration/build gates.

### 2. Exact-SHA production readiness

Production must prove, on both branded readiness surfaces:

- exact intended Git SHA;
- `ready=true`;
- current migration version;
- migration parity `current`;
- required policy/privacy/access controls;
- capacity configuration;
- matching release evidence.

### 3. Real authenticated first-value path

A real production account must complete:

`account → policy/18+ → Plan → Baseline → reveal → workspace → first Sovereign answer`

Fixtures/source inspection do not count as live acceptance evidence.

## Required execution sequence

### Phase 1 — Canonical verification

Discover the repository's authoritative scripts, then run under Node 22+:

```bash
node --version
pnpm --version
pnpm verify:foundation
pnpm verify:migrations
pnpm scan:secrets
pnpm verify:cloudflare-build
pnpm verify:production-release
pnpm verify:intelligence-release
pnpm verify:visual-intelligence
pnpm verify:premium-platform
pnpm typecheck
pnpm test
pnpm build
pnpm verify:worker-bundle-size
```

Do not weaken or remove failing tests.

### Phase 2 — P0/P1 closure

For every finding:

`evidence → smallest coherent fix → regression test → verification → documentation`

### Phase 3 — Intelligence acceptance

Trace:

`question → auth/workspace → Baseline → current context → People/System authorization → context assembly → model → sovereign-answer.v2 → Basis → persistence → rendering → continuation`

Verify prohibited raw/private data remains outside model context according to the current privacy boundary.

### Phase 4 — Traffic/failure hardening

Review concurrency, AI latency/failure, retry storms, idempotency, duplicate requests, D1 contention, Durable Object sequencing, auth/session failures, Resend failure, Stripe duplicate/out-of-order webhooks, rate limits, bounded context/payloads, partial writes, stale assets/version mismatch, migration compatibility, and rollback.

Prefer the existing Workers/D1/Durable Objects/AI Gateway architecture. Do not introduce R2 or unnecessary services.

### Phase 5 — Stripe + Resend

Prove:

`Stripe → signed webhook → validation → idempotent processing → entitlement → server authorization → UI`

and:

`application → Resend → delivery/webhook → application state`

No browser-only entitlement. No credential/token logging. Verify webhook signatures against raw request bodies where required. Make retryable outbound email idempotent.

### Phase 6 — Documentation

A competent 2026 engineer must be able to understand, develop, verify, deploy, operate, diagnose, and roll back the system without founder-only verbal knowledge.

Document actual current behavior only; historical/aspirational material must not override current authority.

### Phase 7 — Release candidate

Release only the final exact green SHA through the current text-first production procedure. Prove both branded `/health` and `/ready`, exact SHA parity, migration parity, and release evidence.

### Phase 8 — Human acceptance

Complete the real acceptance lanes #210–#214 and feed their evidence to #216.

## Required final manifest

Return:

- candidate SHA;
- Node/pnpm versions;
- canonical gate results;
- production SHA;
- branded health/readiness results;
- migration version/parity;
- release-evidence SHA;
- real account/Baseline/first-answer evidence;
- auth/session evidence;
- People/Systems/revocation evidence;
- privacy/model-context evidence;
- Stripe/entitlement evidence;
- Resend/auth-email evidence;
- desktop/iPhone/accessibility evidence;
- traffic/failure evidence;
- rollback evidence;
- documentation status;
- unresolved P0/P1/P2/P3 items.

Final status must be exactly one of:

- `BLOCKED — <explicit blockers>`
- `RELEASE CANDIDATE — all technical gates pass; human/live acceptance remains`
- `PUBLIC LAUNCH READY — all required gates and real acceptance evidence pass`

## Credential safety

Never place secret values in source, prompts, issues, logs, or documentation. Use secure names only:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`

R2 is intentionally disabled and must not be reintroduced.
