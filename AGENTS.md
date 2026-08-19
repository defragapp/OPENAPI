# Repository operating rules

## Scope
These instructions apply to the entire OPENAPI repository.

## Repository boundary
- Write only inside `/workspace/OPENAPI` when using the canonical checkout.
- `/workspace/SOVV` is read-only reference material. Never edit, format, generate files in, commit to, reset, merge, rebase, delete, or push SOVV.
- Verify the SOVV commit and working tree after meaningful phases when that checkout is available.

## Branch and release discipline
- `main` is the single canonical development and production branch for Sovereign.OS.
- Work directly on `main` for normal AI-assisted implementation turns. Do not create a new branch for each request, correction, release attempt, visual pass, or verification pass.
- Create a temporary branch only when the user explicitly asks for isolated review work or repository protection makes direct `main` work impossible.
- Never create parallel `final`, `release`, `reconciliation`, `visual`, `hotfix`, or agent-named branches as substitutes for strengthening the existing platform on `main`.
- Production always targets one exact current `origin/main` SHA.
- For the current text-first launch, the release sequence is `pnpm verify:cloudflare-build` followed, for the same exact SHA, by `pnpm production:release:text`.
- `pnpm production:release:text` is the single-deploy production mutation path for this launch and intentionally excludes live Browser Rendering.
- `pnpm production:release:oauth` remains an optional Browser-audited path; do not invoke it when the owner has explicitly excluded Browser Rendering from the acceptance pass.
- GitHub Actions, deploy hooks, Cloudflare Pages, duplicate production Workers, preview Workers, historical Workers Builds triggers, and alternate repositories are not production release authorities.
- A technical release is complete only when both branded `/ready` endpoints report the exact target SHA, `ready: true`, migration `0017_privacy_access_and_eligibility`, migration parity `current`, configured policy/privacy dependencies, and exact matching release evidence.
- Release evidence must describe what actually ran. Never set automated route/rendered verification fields to `true` unless those automated Browser checks ran and passed.
- Human desktop/iPhone review is separate product acceptance evidence and must not be relabeled as automated Browser Rendering.
- Extend canonical components and contracts in place. Do not create duplicate workspaces, alternative landing implementations, second agents, or disconnected product shells.

## Founder v0 visual-port contract
- Read `docs/v0-visual-port-contract.md` before changing any public, workspace, account, onboarding, policy, or visual release surface.
- The supplied founder v0 archive is the component and visual authority for the public landing and the visual language applied sitewide.
- Preserve the exact founder hero `Healing isn’t optional. Holding onto the pain is.` and the approved self → people → systems narrative; do not introduce a competing product story.
- Port visual components and styling only. Never import the archive’s mock auth, localStorage users, canned or random answers, dashboard state, fake billing, fake consent, or fake account behavior.
- Preserve the real OPENAPI routes, APIs, authentication, billing, consent, Baseline contracts, one-room workspace, and `sovereign-answer.v2`.
- The authenticated launch is text-first. The landing demo-chat visual logic may inform the real thread hierarchy, but do not introduce a required video/media-generation workflow.
- Preserve the certified local CSS import order in `apps/web/src/main.tsx`; no local component stylesheet may load after `passkey-auth.css`.
- `apps/web/src/production-visual-authority-v1.css` is the terminal inline presentation authority and must be appended after all other inline visual/typography authorities. Do not add a later visual override.
- Do not call a visual implementation `canonical`, `approved`, `v0`, `editorial`, or `cinematic` unless its actual implementation and evidence support that claim.
- Do not freeze or replace a founder visual reference while a known documentation-to-render contradiction remains unresolved. Inspect actual desktop and mobile production renders first.
- Release, deployment, copy, verifier, navigation, and infrastructure work must not redefine the visual system as a side effect. A non-visual task may repair a visual defect only when the defect is directly evidenced and the smallest coherent visual change is made.
- Do not replace the near-black/cream founder system with a white/light shell, generic enterprise SaaS styling, dashboard/card-grid composition, neon/glassmorphism chrome, or a new design language during release hardening.
- Changes to `typography-system.css`, `sans-typography-authority-v1.css`, `production-visual-authority-v1.css`, or `premium-action-static-v1.css` must preserve the founder visual language, receive focused regression coverage, and remain subject to #214 desktop+iPhone human visual acceptance.

## Product definition
- Sovereign.OS is Baseline-first. The product must be useful before the user explains an incident.
- Baseline Design is a private, explorable reference built around the person. It gives Sovereign continuity across self, decisions, relationships, and systems without turning interpretation into fact.
- Relationship and system intelligence extend the same Baseline-first reference outward while keeping each person distinct and permission-bound.
- Source calculations, Basis codes, provider details, permission mechanics, and deployment architecture stay beneath the primary experience until needed for support, verification, control, or deeper inspection.
- The single user-facing agent is Sovereign.
- Defrag, Alignment, and Covenant are internal reasoning lenses, not separate top-level products.
- Authenticated navigation is Today, Explore, People, Systems, Library, and You.
- The canonical authenticated implementation is `SovereignIntelligenceWorkspace`.
- The core AI experience is one text thread: user question → direct answer → relevant sections → quiet source details → correction or continuation.
- Public product pages must demonstrate the real Baseline-first answer hierarchy and stay accurate to live plans and entitlements.
- The only supported answer contract is `sovereign-answer.v2`.
- Exact source data, interpretive Baseline facets, temporary current context, and question-specific synthesis must remain separate.
- Basis remains the internal/server name for exact source values. User-facing UI labels this layer `Sources`, `Source details`, or `See source details`; do not require users to learn the internal term.
- Exact source values remain server-approved only. The model selects Basis IDs and never writes display values.
- Alignment is a structured comparison, never a score, gauge, or model-text sentiment calculation.
- `docs/product-language-system.md` is the single source of truth for user-facing product language. Other documents may explain or enforce it but must not define a competing hero or product promise.
- Release tests and verifiers may enforce approved user-facing language only after it is defined in `docs/product-language-system.md`; they must never invent or restore UI wording.
- Public surfaces must begin with the real situation and useful distinction. Internal `capacity` terminology may remain where the intelligence contract requires it, but it must not lead the public landing, public demonstration headings, share metadata, or the first explanation of the product.
- Internal taxonomy such as evidence levels, model context, provider state, authorization state, or release vocabulary must not become interface copy.
- Contribution is not causation, feedback is not blame, and pattern analysis must never mutualize harm.

## Current data/privacy boundary
- Current D1 schema is `0017_privacy_access_and_eligibility`.
- Signup and material policy review require the exact current Terms/Privacy tuple plus the 18+ launch-eligibility confirmation.
- Private account export is authenticated, generated on demand from account-owned D1 data, returned with private/no-store behavior, and not retained as an export artifact.
- R2 remains disabled.
- Worlds/video generation is not part of the current launch runtime; do not activate it without a later explicit product decision.

## Typography contract
- Treat `apps/web/src/typography-system.css` as the platform-wide typography source of truth.
- Sovereign uses a deliberate split typography system rather than one typeface everywhere.
- Public brand identity—the root hero, major public-section titles, public secondary-page titles, and public `SOVEREIGN.OS` wordmarks—uses the existing self-hosted `Sovereign Display` face first, followed by `Iowan Old Style`, Palatino/Book Antiqua, Georgia, and serif fallbacks. This is the founder editorial voice, not a decorative product-UI font.
- Product UI—including authentication, onboarding, account, workspace, composer, controls, product demonstrations, labels, and authenticated headings—uses self-hosted `Geist Sans` first. Apple/SF Pro Display, Segoe Variable/Segoe, system-ui, Helvetica, and Arial are fallback only and must not win when the bundled Geist asset is present.
- The canonical assets are `apps/web/public/fonts/sovereign-display.woff2` and `apps/web/public/fonts/geist/Geist-Variable.woff2`. Do not introduce a new title font or native-only replacement during release hardening.
- The retired bundled `Sovereign Sans`, `Optima`, and `Avenir Next` must not become active title authorities. Do not replace the public founder display face with those alternatives.
- `--font-public-display` owns public brand/display typography. `--font-title` owns product/UI title typography. `--font-body` remains the native long-form/body stack.
- The terminal typography authority may enforce font family only; it must not impose a universal `h1`/`h2`/`h3` size or spacing system over route-owned composition.
- `apps/web/src/production-visual-authority-v1.css` owns final live visual proportions, warm-metal interface accent, demo organization, navigation/brand geometry, and motion after route/component foundations have loaded.
- `SOVEREIGN.OS` public wordmark sizing is a shared sitewide contract. React and standalone public routes must use the same founder-display identity while allowing breakpoint-specific placement; account/workspace branding may remain on the product/UI sans stack.
- Product demonstrations must remain visible without JavaScript reveal state. Motion may enhance entry/progression but must never gate comprehension or create blank product sections.
- Use `--font-public-display` only for public identity headings/wordmarks and other explicitly documented public editorial moments. Do not leak it into forms, buttons, account surfaces, the authenticated workspace, source details, or product-demo chrome.
- Use `--font-title` for meaningful product/UI headings and titles across authenticated, onboarding, modal, drawer, answer, relationship, system, Alignment, and Covenant surfaces.
- Use `--font-subheading` only for short supporting introductions and secondary headings.
- Preserve `--font-body` for paragraphs, controls, source details, metadata, inputs, and long-form answers.
- New headings must use semantic heading elements whenever possible so the correct route-level typography contract can apply automatically.
- Do not add component-local font families or bypass shared typography tokens without a documented product exception.
- Typography-only work must not alter copy, line breaks, layout, spacing, dimensions, colors, backgrounds, borders, imagery, motion, responsive behavior, or product logic.

## Safety, consent, and privacy
- Always distinguish a stable Baseline facet, temporary current context, observed behavior supplied or confirmed by the user, role/material context, and unknown actual state.
- Never diagnose, assign hidden motives, claim exact emotions, predict with certainty, or present Baseline/current sky/psychological/biblical interpretation as deterministic proof.
- Covenant may be offered contextually but is unavailable until explicitly confirmed for the question or thread.
- Enforce consent and authorization in deterministic server code before tools execute.
- Do not send raw birth inputs, exact private location, secrets, billing identifiers, authentication material, or unconsented private identifiers to the model.
- Do not trust client-supplied account IDs such as `x-sovereign-account` or `x-sovereign-subject`.

## Verification before commits
- Inspect the diff.
- Run relevant checks when execution access is available.
- Scan for secrets.
- Verify SOVV remains unchanged when available.

Required baseline checks are:
- `pnpm install`
- `pnpm verify:foundation`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Before a production release mutation, run `pnpm scan:dependencies` against the exact candidate lockfile in an environment with registry access. High/critical findings must be resolved or explicitly reviewed and accepted with evidence; a registry/network failure is an environment failure, not a passing scan.

Production candidates additionally require the exact-SHA `pnpm verify:cloudflare-build` gate before any release mutation. Do not substitute source inspection, issue comments, old deployment evidence, or healthy endpoints from a different SHA for that gate.