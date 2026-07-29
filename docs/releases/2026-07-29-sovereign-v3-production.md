# Sovereign.OS v3 production release

- Product source: `defragapp/OPENAPI`
- Visual reconciliation merge: `0c3fbbcd80ce763a54d14cb36fbbb707be3be6e8`
- Production Worker: `sovv-web`
- Public domain: `sovereign.defrag.app`
- Release authority: Cloudflare Workers Builds connected to `main`
- Required build gate: `pnpm verify:cloudflare-build`
- Required deployment command: `pnpm production:deploy`
- Expected migration: `0012_baseline_facets_and_answer_v2`

This release marker exists to trigger the connected Cloudflare production build after the GitHub-hosted release runner failed before executing repository steps. It does not alter product behavior, contracts, billing, authentication, consent, or data.
