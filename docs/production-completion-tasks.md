# Historical production completion ledger

Status: historical evidence only. This file is not a current production to-do list and does not define release authority.

The former contents tracked a specific 2026 production-hardening period, including then-current SHAs, Cloudflare Builds actions, safety work, billing checks, visual evidence, and external account follow-ups. Those entries became stale as `main`, the release path, and production evidence advanced.

## Current completion rule

Current production completion is established only for one exact current `origin/main` SHA through:

```bash
pnpm production:release:oauth
```

and the live evidence required by `docs/production-release.md` and `docs/browser-visual-release-audit.md`.

At minimum both branded `/ready` endpoints must report:

- `ready: true`;
- the exact target SHA;
- migration `0015_release_evidence`;
- migration parity `current`;
- `releaseEvidence.sha` equal to that exact SHA.

Repository checks, old successful deployments, dashboard screenshots, old Cloudflare build UUIDs, historical owner-action files, or unchecked boxes in a dated ledger do not substitute for current exact-SHA evidence.

## Future tracking

Do not add rolling production state to this historical file. Current blockers that genuinely require tracking should live in the relevant current issue or in a narrowly scoped, freshly verified owner-action record. Product, language, architecture, and release authority remain in their canonical documents.
