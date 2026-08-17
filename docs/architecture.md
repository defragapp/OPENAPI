# Sovereign.OS production architecture

Status: current runtime architecture. Product/language behavior inherits `product-language-system.md`, `launch-product-contract.md`, and `inner-recognition-intelligence.md`. Release execution inherits `production-release.md`.

## Executive summary

Sovereign.OS is a TypeScript-first pnpm monorepo in `defragapp/OPENAPI`.

Production consists of:

- React 19 + Vite web/PWA application;
- one Cloudflare Worker, `sovv-web`;
- D1 as canonical account/product storage;
- request-scoped D1 Sessions with automatic read replication;
- one SQLite Durable Object per thread for sequencing/idempotency;
- Cloudflare Workers AI through AI Gateway `sovereign-ai-gateway`;
- Turnstile, Resend, and Stripe;
- static assets served by the same Worker;
- D1-scheduled retention/background work;
- one exact-`origin/main` production release authority.

`defragapp/SOVV` is read-only legacy reference material. It is not a production dependency, fallback service, or release source.

## Current production authority

For the current text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The full gate and release command must target the same exact current `origin/main` SHA. The release path performs one Worker deployment and excludes live Browser Rendering. Human desktop/iPhone visual acceptance is tracked separately from infrastructure readiness.

`pnpm production:release:oauth` remains an optional Browser-audited path when explicitly requested. GitHub Actions, deploy hooks, Cloudflare Pages, Workers Builds triggers, preview Workers, duplicate production Workers, Queue, R2, and alternate repositories are not production authorities.

See `docs/production-release.md` for the executable sequence and exact evidence semantics.

## Production resources

- Worker: `sovv-web`
- public host: `https://sovereign.defrag.app`
- authenticated app/API: `https://app.defrag.app`
- parent routes: `https://defrag.app` and `https://www.defrag.app`
- D1: `sovereign-openapi-db`
- Durable Object: `ThreadCoordinator`
- AI Gateway: `sovereign-ai-gateway`
- Workers AI model: `@cf/zai-org/glm-4.7-flash`
- current schema: `0017_privacy_access_and_eligibility`
- daily Workers AI capacity ledger foundation: `0013_workers_ai_free_capacity`
- release-evidence table foundation: `0015_release_evidence`
- policy receipt foundation: `0016_policy_acceptance_receipts`
- R2: disabled
- Queue: disabled
- Worlds/video generation: not part of the current launch runtime

## Product contract

Sovereign.OS is Baseline-first. Baseline Design is the private personal foundation beneath ordinary real-life questions, decisions, relationships, and recurring situations. The primary experience makes the useful distinction visible before source calculations, framework abbreviations, Basis codes, provider details, permission mechanics, or deployment architecture.

The authenticated launch is text-first. The canonical thread progression is:

`user question → direct Sovereign answer → relevant structured sections → quiet Basis/provenance → correction or continuation`

The landing demo-chat may teach that hierarchy, but production uses the real Worker, D1 state, permissions, entitlements, and `sovereign-answer.v2`; it never substitutes canned or random demo answers for authenticated inference.

Relationship and system intelligence extend the same Baseline-first foundation while keeping each participant distinct and permission-bound.

Authenticated navigation remains Today, Explore, People, Systems, Library, and You.

## Web responsibilities

The web application provides:

- public product pages;
- signup/login/recovery and passkey controls;
- policy/18+ review;
- Plan → Baseline → Workspace onboarding;
- the canonical `SovereignIntelligenceWorkspace` text thread;
- Today, Explore, People, Systems, Library, and You;
- invitation/consent/account controls;
- mobile/iPhone safe-area and keyboard behavior;
- D1 bookmark continuity for sequential same-origin API requests;
- no shared caching of private API responses.

## Worker responsibilities

The Worker provides:

- default-deny private API/page boundaries;
- session and same-origin enforcement;
- entitlement checks;
- policy/eligibility gates;
- thread sequencing/idempotency;
- Baseline and current-condition computation;
- consent-filtered relationship/system context;
- `sovereign-answer.v2` generation and validation;
- exact Basis authorization;
- contextual Covenant grounding;
- deterministic safety routing;
- Stripe webhooks and billing handoffs;
- authenticated private data export;
- privacy-safe health/readiness.

## D1 authority

D1 is canonical for:

- accounts, sessions, passkeys/recovery state;
- policy acceptance and privacy-request events;
- Baseline source/reduced profiles;
- current-condition snapshots;
- People, invitations, consent, and Systems;
- threads, turns, events, corrections, and Library understanding;
- Stripe entitlement projection/webhook idempotency;
- monthly AI usage;
- daily Workers AI capacity reservations;
- release progress/evidence.

Current migration parity is `0017_privacy_access_and_eligibility`.

Private account export is assembled on demand from account-owned D1 data and returned directly with private/no-store behavior. It is not written to R2 or retained as an export artifact.

## Durable Object authority

`ThreadCoordinator` serializes concurrent sends, allocates sequence numbers, and rejects duplicate turns. D1 remains the durable source of truth.

## Workers AI path

Production uses the Cloudflare-hosted model:

```text
@cf/zai-org/glm-4.7-flash
```

Every personalized model request enforces cache bypass and disabled persistent request-content logging. The model receives reduced authorized context rather than raw birth records, exact private location, auth material, Stripe identifiers, invitation secrets, or unrelated account history.

A D1-backed global daily capacity reservation prevents Sovereign from consuming the full account-level Workers AI allocation. A failed model call releases the corresponding reservation and monthly turn where the product contract promises a refund.

## Cloudflare controls

The release path reconciles the repository-owned Free-plan controls before deployment:

- D1 read replication in automatic mode;
- AI Gateway cache/log/rate-limit settings;
- the single Free-plan zone rate-limit rule for `/api/v1/threads/*/messages`;
- API Shield schema/Endpoint Management for critical mutations.

Cloudflare Endpoint Management may normalize named OpenAPI parameters such as `{personId}`/`{scope}` to positional forms such as `{var1}`/`{var2}`. The release script normalizes both expected and returned templates before comparison; that normalization is provider compatibility, not a weakening of the schema contract.

The release path owns only its identified Sovereign.OS controls. If an unrelated Free-plan rate-limit rule occupies the one available slot, release preparation fails rather than deleting the unrelated rule.

## Security/privacy boundary

Treat birth inputs, exact location, Baseline data, relationship data, system membership, spiritual prompts, Stripe references, policy state, and thread content as sensitive.

Required behavior includes:

- secure HTTP-only host session cookie;
- Turnstile verification at public auth boundaries;
- same-origin mutation enforcement;
- server-side entitlements;
- scope-specific consent and immediate future-use revocation;
- prepared D1 statements;
- idempotent Stripe webhooks and AI turns;
- no personalized AI cache or persistent prompt logging;
- on-demand/no-artifact private export;
- 14-day account-deletion grace and Stripe-first cancellation;
- no raw birth input, exact private location, secrets, or unconsented other-person context in model input/logging.

## Technical release acceptance

The exact target commit must:

1. pass `pnpm verify:cloudflare-build`;
2. apply migrations through `0017_privacy_access_and_eligibility`;
3. reconcile required Cloudflare controls;
4. deploy `sovv-web` exactly once;
5. report the exact SHA from both branded hosts;
6. report migration parity `current`, configured policy receipts/privacy controls, and on-demand private export;
7. expose exact matching D1-backed release evidence;
8. preserve the explicit route/rendered Browser-evidence booleans without inventing verification.

Final product acceptance additionally requires the real account/Baseline/text-AI journey, billing/auth lifecycle, permission-bound People/Systems behavior, privacy controls, and human desktop/iPhone QA tracked under #207 and #210–#216.
