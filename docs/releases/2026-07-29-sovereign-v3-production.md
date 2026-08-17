# Historical Sovereign.OS v3 production release — 2026-07-29

Status: dated release manifest only. This file preserves the production assumptions of that release and is not current deployment, schema, or visual authority.

Historical record:

- Product source: `defragapp/OPENAPI`
- Visual reconciliation merge: `0c3fbbcd80ce763a54d14cb36fbbb707be3be6e8`
- Production Worker: `sovv-web`
- Public domain: `sovereign.defrag.app`
- Historical release authority: Cloudflare Workers Builds connected to `main`
- Historical required build gate: `pnpm verify:cloudflare-build`
- Historical deployment command: `pnpm production:deploy`
- Historical expected migration: `0012_baseline_facets_and_answer_v2`

This marker existed to trigger the connected Cloudflare production build after a GitHub-hosted release runner failed before executing repository steps. It did not alter product behavior, contracts, billing, authentication, consent, or data.

Current production authority is `docs/production-release.md`; do not reuse this historical path or migration.
