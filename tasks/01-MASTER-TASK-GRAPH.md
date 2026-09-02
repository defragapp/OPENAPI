# MASTER TASK GRAPH

## P0 — Product integrity / launch blockers
- [x] **A. Repository / authority audit**: Read docs and establish baseline.
- [x] **J. CSS / design-system consolidation**: Fold `sovereign-custom-theme.css` into the 5 canonical stylesheets and remove it from `main.tsx`.

## P1 — Public marketing + entry
- [x] **C. Public landing / visual implementation**: Verify truthful demonstration copy, no fake "live baseline" claims, premium visual density, ensure Powder reference is matched for quality without copying its UI.
- [x] **B. Product-language audit**: Ensure all copy matches `docs/product-language-system.md` (e.g. no "foundation", use "Sources", strict hero text, verify auth/onboarding copy).

## P1 — Authenticated platform UX
- [x] **D. Auth / onboarding / account flow**: Verify signup, passkey, Baseline onboarding strings and UI.
- [x] **E. Workspace / conversation UX**: Verify the primary chat UI, visual primary action, and typography hierarchy.
- [x] **F. Baseline-first intelligence presentation**: Verify answer rendering, section contract, sources secondary.

## P1 — Product functionality
- [x] **G. People / relationship surfaces**: Verify distinct participants, no motive claims.
- [x] **H. Systems intelligence surface**: Verify system participants, roles, no synthetic center person.

## P1 — Mobile / iOS
- [x] **I. Mobile / iPhone / accessibility**: 390/430px layouts, touch targets, safe areas.

## P1 — Verification & Cloudflare release
- [x] **K. Functional runtime verification**: Local `pnpm test`, `typecheck`, etc.
- [x] **L. Production / Cloudflare release verification**: `pnpm verify:cloudflare-build`, `pnpm production:release:text`. (Blocked on credentials)

## P1 — Live visual acceptance
- [ ] **M. Live browser inspection**: Review the actual live deployment post-release.

## P2 — Repository hygiene & Final certification
- [x] **N. Final regression / stability matrix**: Full test/build gate.
- [ ] **O. Final acceptance and release evidence**: Document the final SHA and /ready states.
