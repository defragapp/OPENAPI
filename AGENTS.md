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
- Public product pages must demonstrate the real Baseline-first answer hierarchy and must stay accurate to live plans and entitlements.
- The only supported answer contract is `sovereign-answer.v2`.
- Exact source data, interpretive Baseline facets, temporary current context, and question-specific synthesis must remain separate.
- Basis contains server-approved exact values only. The model selects Basis IDs and never writes display values.
- Alignment is a structured comparison, never a score, gauge, or model-text sentiment calculation.
- The canonical authenticated implementation is `SovereignIntelligenceWorkspace`.
- Visual explanation must come from Baseline facets, Shadow and Gift, Alignment, relationships, systems, current context, and exact Basis data.

## Typography contract
- Treat `apps/web/src/typography-system.css` as the platform-wide typography source of truth.
- Use `--font-display` for every meaningful heading and title across public, authenticated, onboarding, policy, modal, drawer, answer, relationship, system, Alignment, and Covenant surfaces.
- Use `--font-subheading` only for short supporting introductions and secondary headings.
- Preserve `--font-body` for paragraphs, controls, evidence, metadata, inputs, and long-form answers.
- New headings must use semantic heading elements whenever possible so the typography contract applies automatically.
- Do not add component-local font families or bypass the shared typography tokens without a documented product exception.
- Typography-only work must not alter copy, line breaks, layout, spacing, dimensions, colors, backgrounds, borders, imagery, motion, responsive behavior, or product logic.

## Safety, consent, and privacy
- Always distinguish a stable Baseline facet, temporary current context, observed behavior supplied or confirmed by the user, role and material context, and unknown actual state.
- Never diagnose, assign hidden motives, claim exact emotions, predict with certainty, or present Baseline/current sky/psychological/biblical interpretation as deterministic proof.
- Covenant may be offered contextually but is unavailable until explicitly confirmed for the question or thread.
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
