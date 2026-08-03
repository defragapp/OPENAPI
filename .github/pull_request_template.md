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

- [ ] Cloudflare Workers Builds remains the sole production deployment authority.
- [ ] Production routes and Wrangler configuration remain consistent.
- [ ] No public source maps, deployment hooks, duplicate Workers, Queues, or R2 dependencies were introduced.
- [ ] Required release checks and production verification pass.

## Product integrity

- [ ] The change preserves the canonical Sovereign.OS product and language contracts.
- [ ] Consent, correction, uncertainty, and non-diagnostic behavior remain intact where applicable.

## Verification

List the exact commands, tests, and live checks performed.

## Deployment and rollback

Describe deployment impact, migrations, configuration changes, and the safe rollback path.
