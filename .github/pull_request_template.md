## Summary

Describe the change and why it is required.

## Security and privacy

- [ ] No secrets, credentials, tokens, signing material, private keys, or production values are included.
- [ ] No private birth records, exact location history, customer content, payment data, or authentication material is exposed.
- [ ] Authentication, authorization, policy, consent, and entitlement boundaries remain server-enforced.
- [ ] Logs/errors do not expose private data, provider internals, stack traces, hidden reasoning, or secret values.
- [ ] New/changed dependencies have been reviewed for necessity and licensing.
- [ ] Private export remains account-scoped, on-demand, and no-artifact when applicable.

## Billing

- [ ] This change does not affect billing.
- [ ] Billing behavior changed and monthly/annual pricing, Checkout, Portal, webhooks, idempotency, and entitlements were verified.

## Cloudflare and release integrity

- [ ] Production remains bound to one exact current `origin/main` SHA.
- [ ] Current text-first release procedure remains `pnpm verify:cloudflare-build` followed, for the same SHA, by `pnpm production:release:text`.
- [ ] Any optional Browser-audited release/evidence is labeled as such and is not implied when Browser Rendering was not run.
- [ ] Production routes/Wrangler configuration remain consistent.
- [ ] Current D1 schema remains `0017_privacy_access_and_eligibility` unless this change intentionally introduces a later reviewed migration.
- [ ] No GitHub Actions deploy, deploy hook, Pages release, public source maps, duplicate Workers, Queue/R2 dependency, historical Workers Builds trigger, or alternate repository was introduced as production authority.
- [ ] API Shield/rate-limit changes preserve bounded ownership and do not overwrite unrelated account rules.
- [ ] Required exact-SHA repository/live checks pass before production is treated as accepted.

## Product integrity

- [ ] `docs/product-language-system.md` remains the sole user-facing language authority.
- [ ] `docs/launch-product-contract.md` remains the launch-scope authority.
- [ ] Baseline Design remains the foundation and public explanation begins with recognizable real-life questions/useful distinctions rather than implementation machinery.
- [ ] `SovereignIntelligenceWorkspace` remains the canonical authenticated workspace.
- [ ] The current core launch remains text-first unless a separately approved product decision explicitly changes it.
- [ ] No video/Worlds activation was introduced implicitly.
- [ ] Consent, correction, uncertainty, privacy, and non-diagnostic behavior remain intact where applicable.

## Verification

List the exact commands, focused tests, full gate, live checks, and human desktop/mobile evidence actually performed. Do not claim a verification method that was not run.

## Deployment and rollback

Describe deployment impact, migrations, configuration changes, one-deploy expectations, prior stable version when relevant, and the safe rollback/forward-repair path.
