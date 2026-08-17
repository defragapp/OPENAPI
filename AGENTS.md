# Repository operating rules

## Scope
These instructions apply to the entire OPENAPI repository.

## Repository boundary
- Write only inside `/workspace/OPENAPI`.
- `/workspace/SOVV` is read-only reference material. Never edit, format, generate files in, commit to, reset, merge, rebase, delete, or push SOVV.
- Verify the SOVV commit and working tree after each meaningful phase when the checkout is available.

## Branch and release discipline
- `main` is the single canonical development and production branch for Sovereign.OS.
- Work directly on `main` for normal AI-assisted implementation turns. Do not create a new branch for each request, correction, release attempt, visual pass, or verification pass.
- Create a temporary branch only when the user explicitly asks for isolated review work or when repository protection makes direct `main` work impossible.
- Never create parallel `final`, `release`, `reconciliation`, `visual`, `hotfix`, or agent-named branches as substitutes for strengthening the existing platform on `main`.
- Production release authority is the exact current `origin/main` SHA executed through `pnpm production:release:oauth`. `pnpm production:deploy` is an internal stage of that wrapper, not an alternate standalone authority.
- GitHub Actions, deploy hooks, Cloudflare Pages, duplicate production Workers, preview Workers, and historical Workers Builds trigger instructions are not production release authorities.
- A production release is complete only when both branded `/ready` endpoints report the exact target SHA, migration `0015_release_evidence`, migration parity `current`, and matching release evidence after the repository gates and live browser checks pass.
- Extend the canonical components and contracts in place. Do not create duplicate workspaces, alternative landing implementations, second agents, or disconnected product shells.

## Founder v0 visual-port contract
- Read `docs/v0-visual-port-contract.md` before changing any public, workspace, account, onboarding, policy, or visual release surface.
- The supplied founder v0 archive is the component and visual authority for the public landing and the visual language applied sitewide.
- Preserve the exact v0 public sequence beginning with `Healing isn’t optional. Holding onto the pain is.` and ending with `Your thoughts deserve a better place to live.`
- Port visual components and styling only. Never import the archive’s mock auth, localStorage users, canned or random answers, dashboard state, fake billing, fake consent, or fake account behavior.
- Preserve the real OPENAPI routes, APIs, authentication, billing, consent, Baseline contracts, one-room workspace, and `sovereign-answer.v2`.
- The local Vite visual cascade is fixed in this order: `v0-platform-port.css`, `v0-motion-accessibility.css`, `v0-visual-port.css`, `v0-global-experience.css`, then `passkey-auth.css`.
- `apps/web/src/v0-platform-port.css` owns onboarding, policy, and email-access foundations; `v0-motion-accessibility.css` preserves reduced-motion behavior before the founder foundation.
- `apps/web/src/v0-visual-port.css` remains the founder archive foundation for the landing and workspace. `v0-global-experience.css` extends that language across non-landing product surfaces without replacing the certified landing composition.
- `apps/web/src/passkey-auth.css` is the final local Vite visual authority. No local CSS import may load after it.
- `apps/web/public/v0-public-port.css` must remain the standalone visual authority loaded through `premium-public-release.css` for How it works, Pricing, FAQ, and 404.
- `apps/web/src/v0-release-fingerprint.ts` must expose the exact archive and founder-sequence fingerprints on the running document.
- Do not call a visual implementation `canonical`, `approved`, `v0`, `editorial`, or `cinematic` unless the archive fingerprint, runtime sequence fingerprint, rendered component sequence, compiled asset markers, all three visual delivery paths, and sitewide selectors match the documented contract.
- The reconstructed `Know yourself. Understand the system. Choose what fits.` landing is not the founder v0 port and must not return as the root public experience.
- Do not freeze or replace a founder visual reference while a known documentation-to-render contradiction remains unresolved. Inspect the actual desktop and mobile production renders first.

## Product definition
- Sovereign.OS is Baseline-first. The product must be useful before the user explains an incident.
- Baseline Design is the foundation. The visitor brings an ordinary real-life question or situation; Sovereign should make a relevant distinction visible before exposing technical machinery.
- Relationship and system intelligence extend the same Baseline-first foundation outward while keeping each person distinct and permission-bound.
- Source calculations, Basis codes, provider details, permission mechanics, and deployment architecture stay beneath the primary experience until needed for support, verification, control, or deeper inspection.
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
- `docs/product-language-system.md` is the single source of truth for user-facing product language. Other documents may explain or enforce it but must not define a competing hero or product promise.
- Public surfaces must begin with the real situation and useful distinction. Internal `capacity` terminology may remain where the intelligence contract requires it, but it must not lead the public landing, public demonstration headings, share metadata, or the first explanation of the product.
- Across applicable self, relationship, system, Library, Expression Field, and Worlds surfaces, preserve the underlying reasoning separation: stable Baseline reference → what pressure or current context may be adding → what happens between people → what may keep the pattern going and what could change. Translate that separation into ordinary user language on public surfaces.
- This movement is not another named framework or top-level product. Contribution is not causation, feedback is not blame, and pattern analysis must never mutualize harm.

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
