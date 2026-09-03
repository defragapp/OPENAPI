# Launch saturation and rollback runbook

This runbook stages controlled canary validation. Repository configuration is **not evidence that any Cloudflare control-plane setting is live**. Never run saturation against a branded or production Workers host.

## Prerequisites and isolated canary

- Record the candidate Git SHA, clean-tree state, migration parity, build output, and operator identity.
- Provision an isolated HTTPS canary with synthetic accounts, synthetic Stripe signed fixtures, non-delivering email, no real customers, payments, subscriptions, or entitlements, and separate D1/Durable Object namespaces.
- Confirm R2 and Queues are disabled. Confirm Workers AI is bounded by `WORKERS_AI_DAILY_NEURON_BUDGET=7500`.
- In the provider control plane, separately verify the staged Gateway posture: 500 requests per 60 seconds, logging disabled, and no dollar-denominated spend rule. The neuron ledger—not a Gateway dollar rule—is the cost boundary.

## Checks and safe ramp

Run route-cohesion checks across `/`, `/login`, `/app`, `/healthz`, and `/ready`. Readiness must report the exact candidate SHA, `ready: true`, migration parity `current`, and matching release evidence. Exercise ordinary route traffic separately from AI-generating traffic.

`node scripts/launch-saturation.mjs --canary-target https://isolated-canary.example.test --artifact artifacts/launch-saturation-result.json`

The harness ramps through 1, 5, 10, and 25 concurrent health requests and stops above 2% errors, five-second stage latency, or a 503 readiness response. AI generation is off by default and requires both `--allow-ai-generation` and `--confirm-billed-ai-canary`. Do not enable it until ordinary routes pass.

For graceful exhaustion, use only the isolated budget and synthetic identity. Confirm the stable 429 shared-capacity response, UTC reset, retained conversation and draft, no extra inference, and successful non-AI navigation. Never describe 7,500 neurons/day as unrestricted capacity.

Replay Stripe fixtures only with a valid signature computed over the exact raw UTF-8 body and the canary webhook secret. Confirm oversized bodies fail before signature, D1, or projection work; duplicates remain idempotent. Never use a production event or secret.

## Rollback

Trigger rollback for readiness/SHA mismatch, migration drift, privacy or authorization failure, webhook projection error, reservation overshoot, unsanitized provider errors, more than 2% errors, stage latency over five seconds, or destructive workspace navigation.

Stop the harness and all canary traffic. Preserve its JSON artifact and logs without user payloads. Restore the last verified artifact by exact SHA using the authorized release procedure; do not edit production state manually. Re-run branded `/ready` checks, migration parity, release evidence, and non-mutating smoke checks. Escalate any billing or privacy discrepancy before resuming.

## Evidence and remaining acceptance gates

Evidence must bind source SHA, built artifact SHA, Wrangler configuration hashes, immutable migration `0019_deprecate_manual_capacity`, timestamps, commands/results, canary target, harness artifact, and readiness payloads. Migration `0017_privacy_access_and_eligibility` remains unchanged because it is already deployed. Automated fields may be true only for checks that actually ran.

Before merge or release, humans must review desktop and iPhone presentation, operational language, billing behavior, and accessibility. Provider owners must independently confirm Gateway rate limit/logging, Access, D1 bindings, disabled R2/Queues, secrets, and canary isolation. Production deployment and worldwide launch acceptance remain separate explicit decisions.
