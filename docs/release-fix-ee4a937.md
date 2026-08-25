# Historical release integrity correction — `ee4a937`

Status: historical release record only. This file preserves the facts/acceptance language of an earlier migration `0011_email_code_recovery` release and is **not** current product, schema, or deployment guidance.

Current production authority is `docs/production-release.md`; current schema is `0018_workers_ai_capacity_reservations`.

## Historical correction

This narrow correction followed the merged `ee4a93720270da1548ca4a8f2ec5deec98bff25f` release.

It aligned the runtime at that time by:

- keying six-digit email recovery codes with HMAC-SHA-256 and the server session secret;
- keeping only the keyed digest in D1;
- correcting the source-contract test so it rejected plaintext binding rather than the legitimate `code_hash` schema;
- mounting route-specific Privacy and Terms metadata;
- tightening the email-code fallback's TypeScript and safe-return handling;
- making deferred dialog focus restoration null-safe.

Historical acceptance used the then-current connected Cloudflare production build and migration `0011_email_code_recovery`. Do not reuse that release path, SHA, or migration as current authority.
