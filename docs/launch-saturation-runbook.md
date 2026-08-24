# Public launch saturation and rollback runbook

Status: controlled canary authority for #259. This document does not authorize uncontrolled production load.

## Purpose

Prove the exact launch candidate is observable, Free-capacity-bounded, and recoverable under a gradual announcement-shaped ramp before general Cloudflare Access removal.

Cloudflare documents that an individual D1 database processes queries one at a time and queues excess concurrency before returning overloaded errors. Source configuration alone cannot prove the throughput of Sovereign.OS queries. The candidate must be measured.

## Hard safety boundary

`scripts/launch-saturation.mjs` refuses:

- `app.defrag.app`;
- `sovereign.defrag.app`;
- `defrag.app` and `www.defrag.app`;
- the production `sovv-web` workers.dev hostname;
- any other `*.defrag.app` hostname;
- a target that does not exactly match `SATURATION_APPROVED_CANARY_ORIGIN`;
- concurrency above 25 or more than 600 requests per run;
- a Free-capacity AI run above 60 requests or concurrency 5.

Use only a production-equivalent preview/canary with synthetic accounts and no real Baseline, relationship, system, location, invitation, billing, prompt, or answer data.

The harness never prints session cookies, Access credentials, response bodies, prompts, answers, or private identifiers. It emits aggregate JSON status, latency, response-byte, and threshold results.

## Preconditions

- [ ] Exact candidate SHA is recorded.
- [ ] `pnpm verify:cloudflare-build` passed for that exact SHA.
- [ ] Canary uses migration `0017_privacy_access_and_eligibility`.
- [ ] Canary Worker/D1/Durable Object resources and routes are recorded.
- [ ] Workers AI launch posture is Free-only with `@cf/zai-org/glm-4.7-flash` and production `WORKERS_AI_DAILY_NEURON_BUDGET=7500`.
- [ ] AI Gateway is independently verified with content logging disabled and rate limiting at 500 requests per 60 seconds using a sliding window.
- [ ] Synthetic account/session fixtures contain no real user information.
- [ ] Current Worker, D1, Durable Object, Gateway, and WAF dashboards are open.
- [ ] Prior stable Worker version and current Access/ruleset state are recorded.
- [ ] One operator owns the stop decision.

Do not place credentials in a command transcript or issue. Load them from the supported protected environment.

## Harness self-test

```bash
pnpm test:launch-saturation
```

The self-test performs no network requests. It proves the production-host refusal, exact canary attestation, bounded concurrency, Free-capacity AI profile, gradual ramp, and message-boundary profile.

## Common canary configuration

```bash
export SATURATION_TARGET_ORIGIN="https://CANARY_HOST"
export SATURATION_APPROVED_CANARY_ORIGIN="$SATURATION_TARGET_ORIGIN"
export SATURATION_REQUESTS="30"
export SATURATION_CONCURRENCY="5"
export SATURATION_MAX_P95_MS="3000"
export SATURATION_MAX_5XX_RATE="0.01"
```

If the canary is protected by Access, provide `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` from the protected environment. Authenticated profiles also require `SATURATION_SESSION_COOKIE`.

## Profiles

### Public and logged-out surfaces

```bash
export SATURATION_PROFILE="public"
pnpm saturation:canary
```

Exercises the root, primary public explanation/pricing routes, and health/readiness. Expected status is 200.

### Authenticated read distribution

```bash
export SATURATION_PROFILE="authenticated-read"
pnpm saturation:canary
```

Exercises session, entitlements, thread listing, and You/account reads. A synthetic completed account session is required.

### Oversized AI message rejection

```bash
export SATURATION_PROFILE="message-boundary"
export SATURATION_THREAD_ID="synthetic-boundary-thread"
pnpm saturation:canary
```

Sends valid JSON containing a normalized 12,001-character message. Every request must return controlled `413`. Confirm separately in telemetry that these requests create no D1 thread/turn event, Durable Object coordination, monthly turn reservation, neuron reservation, or AI Gateway request.

Also run one declared body above 64 KiB and one streamed/chunked body above 64 KiB without `Content-Length` through the focused integration test environment. The repository unit test covers both parser branches; canary evidence must confirm downstream work remains zero.

### Free capacity exhaustion and graceful degradation

This profile proves the application-owned neuron ledger fails closed before Cloudflare’s Free allocation is exhausted. Do not spend the full production 7,500-neuron reserve to prove the behavior. Configure the isolated canary with a deliberately lower `WORKERS_AI_DAILY_NEURON_BUDGET` such as `500`; the runtime accepts lower budgets but rejects any value above 7,500.

```bash
export SATURATION_PROFILE="ai-free-capacity"
export SATURATION_THREAD_ID="synthetic-ai-thread"
export SATURATION_REQUESTS="12"
export SATURATION_CONCURRENCY="2"
export SATURATION_MAX_P95_MS="20000"
pnpm saturation:canary
```

Use a dedicated completed-Baseline synthetic account and provide `SATURATION_SESSION_COOKIE`. Expected statuses are `200` before the canary ledger fills and controlled `429` after it fills. The profile does not PASS unless at least one controlled `429` is observed. Unexpected 4xx/5xx fail the run.

After the capacity `429`, rerun the `public` and `authenticated-read` profiles against the same canary. Static/product/account-rights surfaces must remain usable while AI is unavailable. Confirm telemetry shows no retry storm, duplicate turn write, reservation leak, or provider-request amplification after exhaustion.

## Gradual ramp and stop rules

The harness automatically runs unique stages at concurrency 1, approximately one-third of the requested maximum, and the requested maximum. It stops after the first failed stage.

Default failure conditions:

- any network error;
- any unexpected status;
- more than 1% 5xx;
- p95 above 3 seconds for non-AI profiles;
- p95 above 20 seconds for the Free-capacity AI profile unless explicitly narrowed;
- no controlled `429` during the `ai-free-capacity` profile.

Stop immediately for:

- any privacy, consent, auth, entitlement, or billing defect;
- duplicate/reordered thread events;
- incorrect reservation/refund behavior;
- D1 overload errors or accelerating queue latency;
- Durable Object restarts/serialization failures;
- Worker exceeded-resource, memory, CPU, or uncaught-exception events;
- unexpected provider request amplification after capacity exhaustion;
- inability to restore Access or identify the prior Worker version.

## Required Cloudflare evidence

Capture sanitized before/during/after windows:

- Worker requests, invocation status, CPU, wall time, duration, subrequests, 429, 5xx, and exceptions;
- D1 reads/writes per second, query latency, storage, and overloaded/queue errors;
- Durable Object namespace/request metrics, errors, restarts, and memory percentiles;
- Workers AI neurons, AI Gateway requests, controlled 429 behavior, and provider errors;
- WAF/rate-limit events;
- Stripe webhook failures during the window;
- recovery time after the final stage.

Useful current Cloudflare references:

- Workers metrics: <https://developers.cloudflare.com/workers/observability/metrics-and-analytics/>
- Workers errors: <https://developers.cloudflare.com/workers/observability/errors/>
- D1 metrics: <https://developers.cloudflare.com/d1/observability/metrics-analytics/>
- D1 overload debugging: <https://developers.cloudflare.com/d1/observability/debug-d1/>
- Durable Object metrics: <https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/>

## Rollback rehearsal

Before the test, record the exact stable Worker version ID and verify its bindings remain compatible.

If code rollback is required:

```bash
pnpm exec wrangler rollback STABLE_VERSION_ID --config wrangler.jsonc
```

Cloudflare rollback immediately creates a new deployment using the selected version. It does not roll back D1, Durable Object storage, Stripe events, email, policy receipts, or other connected-resource state. Use forward-repair migrations where required.

Cloudflare reference: <https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/>

The full recovery rehearsal must also prove:

1. general Access can be restored to its recorded protected state;
2. Gateway logging remains disabled and the 500/60 sliding rate limit remains recoverable to the recorded safe state;
3. both branded health/readiness contracts recover;
4. no continuing error or provider-request amplification remains;
5. the incident-response record contains only sanitized identifiers and metrics.

## Acceptance record

Post one PASS/FAIL record to #259 containing:

- exact candidate SHA and canary Worker version;
- profile/stage aggregate JSON;
- sanitized Cloudflare metric windows;
- D1/DO ordering and overload result;
- Free-capacity reservation/refund, controlled 429, and Gateway result;
- prior stable version and rollback duration;
- Access re-lock duration;
- open defects with P0/P1/P2 classification.

Link the accepted result into #216. Do not remove general Access, merge the launch-capacity candidate, raise AI ceilings, or claim public-launch readiness from partial evidence.
