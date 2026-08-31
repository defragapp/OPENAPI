Sovereign.OS — Junie Operational Guidance (Repository-Local)

Scope and Canonical Checkout
- Canonical repo: this working tree at /Users/cjo/Downloads/AZUP-SOV/OPENAPI/openapiii
- Branch: main is the single canonical development and production branch
- Never discard or overwrite local work before a sibling‑checkout inventory
- When recovering work, always inspect sibling/local clones in /Users/cjo/Downloads/AZUP-SOV/OPENAPI and nearby parents

Architecture and Visual Authorities
- Preserve current canonical product architecture. Do not introduce duplicate workspaces, alternate landings, mock auth, fake billing, or fake AI answers
- CSS authority and import order (do not break): apps/web/src/{design-system,public,workspace,app-shell,passkey-auth}.css with passkey-auth.css terminal in apps/web/src/main.tsx
- Typography authority: apps/web/src/design-system.css with bundled Geist Variable; do not replace with a native‑only stack

Work Recovery Rules
- Before any change: inventory all local checkouts, branches, HEAD SHAs, and untracked/modified files
- Classify local files: A) required implementation, B) required test/verifier, C) useful audit/evidence, D) docs, E) generated/transient, F) obsolete/duplicate
- Preserve A–D only; do not merge generated junk (E) or obsolete work (F)

Required Checks and Build/Release Workflow
- Baseline checks before commit: pnpm install; pnpm verify:foundation; pnpm typecheck; pnpm test; pnpm build
- Security: run pnpm scan:dependencies before release when network is available; resolve or explicitly accept High/Critical with evidence
- Production gate: pnpm verify:cloudflare-build must pass for the exact release SHA
- Single production mutation path: pnpm production:release:text at the same SHA after the gate

Live Verification Requirements
- Verify both branded /ready endpoints return ready:true, exact deployed SHA, migration 0018 current/parity, sovereign-answer.v2
- Inspect public routes at 1440/1280/390/430: landing, how-it-works, pricing, faq, privacy, terms, 404, login, signup, invitation
- Inspect authenticated/billing paths where access is available (do not invent credentials)
- Preserve evidence under visual-inspection/ and .visual-release-audit/

Product‑Quality Definition of Done
- Don’t stop at “tests pass.” Product must be polished, coherent, Baseline‑first, visually consistent, responsive, and human‑readable
- AI Output must show correct tone, specificity, restraint, continuity, and clear source presentation; avoid generic filler

Release Discipline
- Keep repo HEAD and deployed SHA distinct; record both in SPRINT_ACCEPTANCE.md and evidence
- Do not create duplicate architectures or alternate shells; extend canonical components in place
- Preserve privacy and fail‑closed behavior; enforce consent and authorization server‑side

Ledger and Commit Hygiene
- Update SPRINT_ACCEPTANCE.md with GREEN/FIXED/BLOCKED/REMAINING and LIVE EVIDENCE after each acceptance pass
- Commit/push coherent changes on main with clear messages; inspect git diff and run git diff --check before committing
- Deploy only when application code changed; never write secrets into the repo
