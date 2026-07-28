# Release integrity correction

This narrow correction follows the merged `ee4a93720270da1548ca4a8f2ec5deec98bff25f` release.

It aligns the runtime with its release contracts by:

- keying six-digit email recovery codes with HMAC-SHA-256 and the server session secret;
- keeping only the keyed digest in D1;
- correcting the source-contract test so it rejects plaintext binding rather than the legitimate `code_hash` schema;
- mounting route-specific Privacy and Terms metadata;
- tightening the email-code fallback's TypeScript and safe-return handling;
- making deferred dialog focus restoration null-safe.

Cloudflare's connected production build remains the authoritative executable gate. Production is complete only when the exact merged SHA is returned by both `/health` and `/ready` with migration `0011_email_code_recovery`.
