# Preview and production preparation

Status: current preparation guidance. Production authority is `docs/production-release.md`.

## Resource inventory

Preview and production remain isolated.

Production:

- Worker: `sovv-web`.
- D1: `sovereign-openapi-db`.
- D1 Sessions + automatic read replication.
- Durable Object: `ThreadCoordinator`.
- AI binding: `AI` through Gateway `sovereign-ai-gateway`.
- model: `@cf/zai-org/glm-4.7-flash`.
- capacity ledger foundation: `0013_workers_ai_free_capacity`.
- release-evidence table foundation: `0015_release_evidence`.
- current schema: `0019_deprecate_manual_capacity`.
- current private export: authenticated on-demand/no-artifact.
- Queue/R2: disabled.
- Worlds/video: not part of current launch.

`defragapp/SOVV` is read-only legacy reference and is not a production binding, fallback API, deployment source, or runtime dependency.

## Secret inventory

Required encrypted Worker secrets:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RELEASE_EVIDENCE_SECRET` (authenticates the `POST /internal/release-evidence` write endpoint; the release environment must export the same value)

No direct OpenAI provider key is accepted by the production answer Worker.

Never commit or print production secret values.

## Current production runbook

From an exact clean checkout matching current `origin/main`:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The second command is run only after the first is green for that exact same SHA.

The text-first release:

1. asserts exact current `origin/main`;
2. verifies production release config/migrations;
3. verifies public DMARC;
4. prepares the production config;
5. applies migrations through `0019_deprecate_manual_capacity`;
6. verifies Worker secrets and repository-owned Cloudflare controls;
7. deploys exactly one Worker version;
8. verifies runtime/parent-domain/secondary public behavior without Browser Rendering;
9. writes/converges exact-SHA release evidence.

`pnpm production:release:oauth` is optional Browser-audited release machinery and is not required for the current text-first launch.

## Cloudflare control preparation

The release credential must have sufficient access for Worker/D1 operations and the exact control mutations/reads owned by the release script. In particular, release preparation may reconcile API Shield Endpoint Management and the owned Free-plan rate-limit rule before deploy.

Cloudflare may normalize named API path parameters to positional `{varN}` templates. The repository normalizes both expected and returned endpoint templates before deciding an operation is missing.

If an unrelated Free-plan rate-limit rule occupies the only available slot, the release fails rather than deleting it.

## Release evidence preparation

Release evidence is exact-SHA D1 data. It does not create a second Worker deployment.

For the text-first release:

- `routeCohesionVerified` is `false` because the automated Browser route audit is not run;
- `renderedVisualVerified` is `false` because the automated rendered Browser audit is not run;
- DMARC, SHA, migration, and runtime convergence still must be verified.

A human desktop/iPhone review is separate product evidence and never flips those automated fields.

## Preview verification

When an isolated preview is needed, use the protected preview procedure in `docs/preview-deployment.md`. Preview must use its own database/config/secrets and must not attach production routes/customer state.

Preview acceptance should cover the same current product boundaries relevant to the change, including policy/18+ handling, Baseline readiness, text AI responses, consent/entitlements, on-demand private export, deletion grace, and Stripe test behavior.

## Rollback preparation

- Record the previous stable Worker version before a production mutation where rollback may be needed.
- Do not roll back D1 with destructive migration; use forward repair.
- A Worker rollback must remain compatible with the already-applied D1 schema and external Stripe/email events.
- Do not delete or rotate unrelated secrets merely to perform rollback.

## Health/readiness preparation

Expected production readiness includes:

- exact target version/SHA;
- migration `0019_deprecate_manual_capacity` current;
- D1, Durable Object, AI Gateway/Workers AI, email, Stripe, scheduled cleanup, and adapter readiness as exposed by the endpoint contract;
- policy acceptance receipts configured;
- privacy access controls configured;
- private export state on-demand/no-artifact where exposed;
- exact matching release evidence.

Health/readiness must never reveal tokens, private IDs, exact locations, provider payloads, or secret topology.

## Privacy verification

Before release acceptance, inspect the relevant logs/traces for prohibited values: raw birth input, exact private location, hidden reasoning, provider authorization headers, Stripe secrets/IDs not intended for the log, invitation secrets, and unconsented person context. Expected result: zero findings.

## Deterministic smoke tests

The full release gate owns the current smoke matrix, including auth, Baseline, jobs, Worker Gateway, Stripe, product, privacy/export, and release closure. Do not treat fixture-only success as final live-product acceptance.

## Stripe test configuration

Use configured Stripe test-mode price/return settings for preview or safe billing verification. Domain entitlement behavior depends on server-confirmed feature state, never a hard-coded price amount in the browser.

## Sharing and deletion

Public sharing contains only public Sovereign.OS content and no private workspace data unless a future separately reviewed product contract says otherwise.

Private account export is available on demand to the authenticated account and is not retained as an export artifact.

Account deletion remains a scheduled 14-day grace workflow with subscription cancellation before destructive deletion.
