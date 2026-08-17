## Summary

Describe the change and why it is required.

## Security and privacy

- [ ] No secrets, credentials, tokens, signing material, private keys, or production values are included.
- [ ] No private birth records, exact location history, customer content, payment data, or authentication material is exposed.
- [ ] Authentication, authorization, consent, and entitlement boundaries remain server-enforced.
- [ ] Logs and errors do not expose private data, provider internals, stack traces, or secret values.
- [ ] New or changed dependencies have been reviewed for necessity and licensing.

## Billing

- [ ] This change does not affect billing.
- [ ] Billing behavior changed and monthly/annual pricing, Checkout, Portal, webhooks, idempotency, and entitlements were verified.

## Cloudflare and release integrity

- [ ] Production remains bound to the exact current `origin/main` SHA and the canonical `pnpm production:release:oauth` path.
- [ ] `pnpm production:deploy` remains an internal release stage rather than an alternate standalone authority.
- [ ] Production routes and Wrangler configuration remain consistent.
- [ ] No GitHub Actions deploy, deploy hook, Pages release, public source maps, duplicate Workers, Queues, R2 dependencies, or historical Workers Builds trigger path was introduced as production authority.
- [ ] Required release checks and exact-SHA production verification pass.

## Product integrity

- [ ] The change preserves `docs/product-language-system.md` as the sole user-facing language authority.
- [ ] Baseline Design remains the foundation; public explanation begins with recognizable real-life questions and useful distinctions rather than implementation machinery.
- [ ] Consent, correction, uncertainty, and non-diagnostic behavior remain intact where applicable.

## Verification

List the exact commands, tests, rendered screenshots, and live checks performed.

## Deployment and rollback

Describe deployment impact, migrations, configuration changes, and the safe rollback path.
