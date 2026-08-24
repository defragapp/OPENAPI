# Sovereign.OS owner actions

Status: current bounded owner actions required before uncontrolled public cutover.

Historical instructions in this file that asked the owner to trigger a stale Workers Build are superseded and must not be followed.

## Current release authority

Production follows `docs/production-release.md` from one exact current `origin/main` SHA.

For the current text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The second command is run only for the same SHA that passed the full gate.

A technical release is complete only when both branded readiness endpoints prove the exact target SHA, `ready: true`, migration `0017_privacy_access_and_eligibility`, migration parity `current`, configured policy/privacy dependencies, and matching release evidence.

Automated Browser audit fields in release evidence are truthful booleans. They remain `false` when the current text-first release intentionally does not run Browser Rendering.

## Workers AI Free launch posture

Workers AI remains on the Cloudflare Free plan for launch. This is not a provider billing activation task.

Repository authority must keep production at `WORKERS_AI_DAILY_NEURON_BUDGET=7500`, use the Free-compatible `@cf/zai-org/glm-4.7-flash` model, reject any configured neuron ceiling above 7,500, and preserve controlled `429` degradation when the application-owned daily ledger is exhausted. AI Gateway release evidence still requires content logging disabled and the 500 requests / 60 seconds sliding rate limit. Dollar spend rules and Workers Paid/prepaid activation are not launch requirements while inference remains Workers AI Free-only and no BYOK provider traffic is enabled.

Any future decision to enable paid Workers AI, Unified Billing, prepaid credits, or BYOK inference is a separate owner-approved financial/product change and must not be inferred from this launch authority.

## Current owner-gated launch actions

These actions affect external account authority, legal approval, or human acceptance and cannot be completed truthfully by source changes alone.

### 1. Cloudflare credential containment and replacement

Target: Cloudflare API token and R2/S3 credentials disclosed during launch coordination.

Reason: disclosed credentials must not remain accepted launch authority. The API token in the supplied deployment note currently returns an authentication failure and is not a usable release credential.

Pass condition:

- every disclosed Cloudflare API and R2 credential is revoked or rotated;
- the former credentials no longer authenticate;
- one replacement release credential has only the permissions required by `docs/production-release.md`;
- the replacement is stored only in the supported protected secret store;
- Worker, D1, required secret inspection, AI Gateway management, and applicable zone-control reads/writes are verified without recording the secret value.

Follow `docs/security/credential-rotation-runbook.md`. Do not post replacement values in chat, GitHub, screenshots, logs, or documentation.

### 2. Human product acceptance

Targets: #214 and the real production journeys in #208, #210, #211, #212, #213, and #230.

Reason: desktop, iPhone/Safari/PWA, real account, email, billing, consent, relationship/system, AI behavior, recovery, and accessibility evidence cannot be inferred from source or automated fixtures.

Pass condition: each launch-required lane contains real PASS/FAIL evidence for the exact final candidate and #216 contains no unresolved P0/P1 defect.

### 3. Terms, Privacy, and launch-market approval

Target: #225.

Reason: contracting entity, governing terms, recurring-subscription obligations, privacy governance, and launch-jurisdiction decisions require the owner and qualified counsel.

Pass condition: approved Terms/Privacy and any implementation consequences are reflected deliberately in the versioned policy authority; #225 is closed and #216 no longer reports `OWNER-LEGAL-ACTION`.

### 4. General public Access cutover

Target: the account-wide Cloudflare Access policy protecting Sovereign.OS.

Reason: general Access removal changes public exposure and must occur only after the exact release, saturation/rollback proof, edge controls, human acceptance, and legal approval all agree.

Pass condition:

- the exact final `origin/main` SHA passed `pnpm verify:cloudflare-build` and `pnpm production:release:text`;
- both branded `/ready` endpoints prove the exact SHA and current migration/evidence;
- #256, #259, and #216 are accepted;
- the owner explicitly approves the public cutover;
- post-cutover probes pass and the prior Access configuration can be restored within the rehearsed recovery window.

## When owner action is actually required

Add an owner action here only when a current external account control cannot be completed by repository-owned release/product flows and the exact action, target resource, reason, and pass condition have been freshly verified.

Examples may include a provider-account permission/billing setting that cannot be expressed in source. Such an item must be classified as launch-blocking or non-blocking in the relevant current GitHub task.

Do not carry forward old build UUIDs, build-token UUIDs, stale SHAs, dashboard paths, agent names, manual trigger instructions, or video-provider activation as standing tasks.

Worlds/video activation is not a current owner action; #198 is closed `not planned` for this launch.
