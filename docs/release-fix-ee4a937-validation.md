# Historical validation checklist — `ee4a937`

Status: historical evidence only. The unchecked live items below describe an earlier `0011_email_code_recovery` release and are not current production tasks.

Current production acceptance is tracked under #207/#210–#216 and `docs/production-release.md`.

Historical checklist:

- [x] Recovery codes were stored with a server-keyed HMAC rather than an unkeyed hash.
- [x] The source contract rejected plaintext or reversible code storage.
- [x] Privacy and Terms mounted route-specific canonical/social metadata.
- [x] Email-code fallback preserved allowlisted return routing.
- [x] Deferred dialog focus restoration was null-safe.
- [ ] Historical Cloudflare foundation, migration, secrets, configuration, typecheck, tests, builds, dry-run, and live verification were not completed in this record.
- [ ] Historical `/health` exact-commit verification was not completed in this record.
- [ ] Historical `/ready` exact-commit / `0011_email_code_recovery` verification was not completed in this record.

Do not complete these old boxes as a substitute for current exact-SHA release/product acceptance.
