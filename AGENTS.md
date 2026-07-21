# Repository operating rules

## Scope
These instructions apply to the entire OPENAPI repository.

## Repository boundary
- Write only inside `/workspace/OPENAPI`.
- `/workspace/SOVV` is read-only reference material. Never edit, format, generate files in, commit to, reset, merge, rebase, delete, or push SOVV.
- Verify the SOVV commit and working tree after each meaningful phase when the checkout is available.

## Product definition
- Sovereign.OS is Baseline-first. The product must be useful before the user explains an incident.
- The single user-facing agent is named Sovereign.
- Defrag, Alignment, and Covenant are internal reasoning lenses, not separate top-level products.
- Authenticated navigation is Today, Explore, People, Systems, Library, and You.
- Do not build external marketing pages in this milestone.

## Safety, consent, and privacy
- Always distinguish Baseline tendency, current amplification, observed behavior supplied or confirmed by the user, and unknown actual state.
- Never diagnose, assign hidden motives, claim exact emotions, predict with certainty, or present Baseline/current sky/psychological/biblical interpretation as deterministic proof.
- Covenant is unavailable unless explicitly enabled for the turn or thread.
- Enforce consent and authorization in deterministic server code before tools execute.
- Do not send raw birth inputs, exact private location, secrets, or private identifiers to the model.
- Do not trust client-supplied account IDs such as `x-sovereign-account` or `x-sovereign-subject`.

## Verification
Before commits:
- Inspect the diff.
- Run relevant checks.
- Scan for secrets.
- Verify SOVV remains unchanged when available.

Required baseline checks are:
- `pnpm install`
- `pnpm verify:foundation`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
