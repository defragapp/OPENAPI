# Validation checklist

- [x] Recovery codes are stored with a server-keyed HMAC rather than an unkeyed hash.
- [x] The source contract rejects plaintext or reversible code storage.
- [x] Privacy and Terms mount route-specific canonical/social metadata.
- [x] Email-code fallback preserves allowlisted return routing.
- [x] Deferred dialog focus restoration is null-safe.
- [ ] Cloudflare foundation, migration, secrets, configuration, typecheck, tests, builds, dry-run, and live verification pass.
- [ ] `/health` reports the exact merged commit.
- [ ] `/ready` reports `ready=true`, the exact merged commit, and `0011_email_code_recovery`.
