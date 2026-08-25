# Historical production completion ledger

Status: historical evidence only. This file is not a current production to-do list and does not define release authority.

The former contents tracked a specific 2026 production-hardening period, including then-current SHAs, Cloudflare Builds actions, safety work, billing checks, visual evidence, and external account follow-ups. Those entries became stale as `main`, the release path, schema, privacy controls, and product acceptance process advanced.

## Current technical release rule

Current production release authority is defined only by `docs/production-release.md`.

For the current text-first launch, one exact current `origin/main` SHA must first pass:

```bash
pnpm verify:cloudflare-build
```

and that same SHA is then released through:

```bash
pnpm production:release:text
```

At minimum both branded `/ready` endpoints must report:

- `ready: true`;
- exact target SHA;
- migration `0018_workers_ai_capacity_reservations`;
- migration parity `current`;
- configured policy acceptance receipts/privacy access controls;
- matching exact-SHA release evidence.

The release evidence’s automated route/rendered booleans describe whether those optional Browser audits actually ran; `false` is valid for the current text-first release and is not replaced by human screenshots.

## Current product-completion tracking

Do not add rolling state to this historical file. Current production acceptance is tracked in GitHub:

- #207 — parent production completion;
- #210–#215 — bounded live/product/documentation tasks;
- #216 — sole final `100%` stability/sign-off gate.

Issue #198 Worlds video activation is closed `not planned` for the current launch.

Historical successful deployments, dashboard screenshots, old Cloudflare build UUIDs, old Workers Builds triggers, and unchecked boxes in a dated ledger do not substitute for current exact-SHA evidence or real product-journey acceptance.
