# Sovereign.OS final launch-convergence execution directive — 2026-08-24

## Mission

Ship one exact, current `main` release that includes every **newer, valid, launch-intended** runtime, workspace, public-product, visual, responsive, and release change. A deployment is not complete merely because `/ready` reports a new SHA. The public and authenticated product must visibly and behaviorally contain the accepted changes.

This is an execution directive for Codex. Implement, verify, promote directly to `main`, and release. Do not create a pull request.

## Verified starting state

Re-fetch all refs before acting. These values are audit anchors, not permission to use a stale checkout.

- Repository: `defragapp/OPENAPI`
- Production Worker: `sovv-web`
- Cloudflare account: `8b1954d216d65077c6480d62583fe2c2`
- Production D1: `sovereign-openapi-db` / `497e5df9-c82a-499e-9be6-d809c992e8ce`
- Last technically accepted production source before this directive: `ee8f80d55fd0314fcf61f126d92e39b777b307a3`
- Its source tree includes the launch-capacity, ingress, Node 22, migration 0018, saturation-refusal, and workspace-continuity work.
- Production migration: `0019_deprecate_manual_capacity`
- Production daily Workers AI ceiling: `WORKERS_AI_DAILY_NEURON_BUDGET=7500`
- R2 and Queues: absent
- The last release was technically successful but did **not** deliver a public visual change. Its visual archive fingerprint remained `6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba`.

## Latest valid visual/product source

The newest implemented public-product work that did not reach `main` is:

- branch: `refine/public-product-proof-v1`
- audited head: `9de9e82c59da6d3a9a64693108688de6f0644351`
- original base: `614ebc2c56ca343ac2ff649b8e3590efa181f5b3`
- governing issue: #254
- governing authority: the final #254 comment titled **Canonical landing-demo visual contract — 2026-08-19**

The audited branch differs from the last production source in these public-product files:

- `apps/web/src/LandingDemoFixtureIntegrity.test.ts`
- `apps/web/src/LandingProductStories.tsx`
- `apps/web/src/LandingRefinement.test.ts`
- `apps/web/src/LandingSelfEditorialProof.tsx`
- `apps/web/src/MobileProductionUX.test.ts`
- `apps/web/src/PremiumPlatformRelease.test.ts`
- `apps/web/src/PublicLandingViewportContract.test.ts`
- `apps/web/src/PublicLandingViewportContract.ts`
- `apps/web/src/PublicRelease.test.ts`
- `apps/web/src/SelectiveVisualPort.test.ts`
- `apps/web/src/expression-field/ExpressionField.tsx`
- `apps/web/src/landing-demo-fixtures.ts`
- `apps/web/src/landing-self-editorial-proof.css`
- `apps/web/src/public-intelligence-demonstration-v1.css`
- `apps/web/src/public-site.test.ts`
- `docs/v0-visual-port-contract.md`

Do not merge this old-base branch wholesale. Port its accepted intent and file-level changes onto the newest `origin/main`, resolving against current capacity, workspace, migration, release, and test contracts.

## Authority and exclusions

Use this order when sources disagree:

1. This directive and the user's latest launch instruction.
2. Current `origin/main` runtime/security/data/release behavior.
3. The final canonical #254 visual-contract comment.
4. Current governing launch, intelligence, language, privacy, and visual contracts.
5. Older PRs and branches only as implementation evidence.

Do not resurrect stale work because it has a newer-looking branch name or many commits.

- PR #255 and PR #257 are not merge sources. Their intended launch-capacity and workspace-continuity behavior is already represented in current `main`; verify equivalence, then classify them superseded.
- PR #253 is not to be merged wholesale. It is an old-base typography candidate and conflicts with later production authority. Do not reintroduce its route-wide typography changes.
- Rejected branch `archive/public-product-proof-v2-rejected-20260819` and commit `e5df9a625a5d709d37b186339c1891f46ca928cd` are evidence of what **not** to ship.
- Do not activate Worlds/video.
- Do not add R2, Queues, a second workspace, a second landing implementation, generic SaaS dashboard/card grids, compatibility scores, Tarot/occult presentation, neon/glassmorphism, or decorative media.
- Do not weaken privacy, consent, entitlement, Stripe, authentication, `sovereign-answer.v2`, Basis/source, Expression Field, capacity, or migration contracts.
- Do not create another terminal CSS override layer.
- Do not use GitHub Actions.
- Do not run production saturation.
- Do not mutate Cloudflare Access, Stripe, Resend, customers, payments, subscriptions, email, or entitlements in this task.

## Required execution

### Phase 1 — establish the exact current source

1. Use an authenticated checkout of `defragapp/OPENAPI`.
2. Read `AGENTS.md` and all directly governing repository instructions.
3. Fetch `origin main` and every remote branch/pr ref.
4. Use Node 22+ and pnpm 9.15.9.
5. Require a clean worktree.
6. Record current `origin/main` SHA and tree.
7. Inventory every remote ref with unique commits since the merge base of the last production source. Classify each as:
   - already represented in current `main`;
   - valid launch work to port;
   - stale/superseded;
   - contradictory/rejected;
   - unrelated/post-launch.
8. Do not merge branches by commit count or date alone. Compare behavior and files.

### Phase 2 — converge the visible product

Start from current `origin/main`. Preserve all current backend/capacity/workspace changes.

1. Port the accepted #254 Self-proof implementation from `refine/public-product-proof-v1@9de9e82c59da6d3a9a64693108688de6f0644351` file by file.
2. Resolve conflicts in favor of current-main runtime contracts and the final #254 visual contract.
3. The public page itself is the product surface. The Self proof must not appear inside faux app chrome.
4. Self reading order:
   - `01 · YOU` and concise editorial heading;
   - one small ordinary human question;
   - one strong direct answer;
   - the real production Expression Field with one relevant axis inspectable;
   - concise mechanism text;
   - visually dominant `THE DISTINCTION`;
   - quiet `Your Baseline · Shadow + Gift · Alignment` context;
   - collapsed `See source details`.
5. Preserve the real Expression Field geometry and interaction: 360°, 16-axis registry, stable center, relative-salience line lengths, inspection, drag/rotation, keyboard behavior, accessibility, and reduced motion. Placement and scale may adapt; geometry may not be redrawn into a marketing illustration.
6. Render Self on desktop and iPhone. Iterate until it is visibly coherent, premium, readable, and unmistakably different from the currently deployed faux-chat/report treatment.
7. Then implement Relationship using the existing `RelationalExpressionField` grammar:
   - two distinct permission-bound subject fields;
   - separate `Between you` center;
   - selectable `You / other person / Between you` readout;
   - no compatibility score, Venn diagram, profile-card wall, motive claim, hidden-state claim, or bespoke arrow diagram.
8. Then implement System using the existing `SystemExpressionField` grammar:
   - 2–6 distinct subject fields;
   - explicitly open system center;
   - only supported relationships and active connections;
   - supplied representative roles, observations, responsibilities, constraints, and change effects;
   - no org chart, generic node graph, or invented private state.
9. The progression must read visually as:
   - one field;
   - two fields plus the space between;
   - multiple fields plus the behavior of the whole.
10. Use one ordinary question, one strong direct answer, 2–3 concise mechanism paragraphs, one dominant distinction, quiet context proof, and collapsed source details per demonstration. Keep primary answer copy around 90–150 words.
11. Keep deterministic sanitized fixtures. Validate both `basisRef` integrity and semantic support. Unsupported facts remain unknown.
12. Consolidate only the touched landing/demo authority. Remove dead conflicting demo selectors where safe. Do not attempt the entire platform-wide #258 CSS program in this release.
13. Preserve the current near-black/cream editorial system, one focal point per surface, calm motion, 44px mobile targets, safe areas, visible focus, keyboard operation, and `prefers-reduced-motion`.

### Phase 3 — authenticated-product truth check

After the public Self/Relationship/System proof is coherent:

1. Compare it to authenticated Explore, People, and Systems using equivalent acceptance questions.
2. If the product already communicates the same intelligence clearly, do not change authenticated code.
3. If a reproducible mismatch exists, make the smallest coherent UX/content-hierarchy fix.
4. Preserve the active thread and unsent draft across navigation.
5. Preserve explicit `New exploration` as the only destructive reset.
6. Keep the single transient state `Preparing your answer…`.
7. Never forward raw provider/backend errors to the user.
8. Keep conversation visually primary and Sources collapsed/available.

### Phase 4 — verification

Run and require success on the exact candidate:

- dependency and secret scans;
- focused Self/Relationship/System fixture and rendered-contract tests;
- full web tests;
- full Worker tests;
- typecheck;
- production, intelligence, visual-intelligence, premium-platform, migration, and release verifiers;
- `pnpm verify:cloudflare-build`;
- desktop 1440 and laptop rendering;
- iPhone 390 and 430 rendering;
- tablet rendering;
- keyboard/focus;
- reduced motion;
- no horizontal overflow;
- public home, How it works, Pricing, FAQ, Terms, Privacy, auth, onboarding, workspace, account, People, Systems, and 404 route checks.

Rendered inspection is required. Source-string tests alone cannot accept the visual release.

Do not proceed with any high/critical dependency finding, secret finding, test failure, migration mismatch, P0/P1 defect, broken privacy/consent/billing/auth boundary, or visible mobile regression.

### Phase 5 — direct-main promotion

1. Re-fetch `origin/main` immediately before promotion.
2. If `main` moved, integrate deliberately and rerun every affected gate.
3. Commit the coherent convergence as one auditable commit.
4. Push directly to `main`. Do not create a branch or PR.
5. Confirm GitHub `main` equals the exact green commit.
6. If direct-main protection rejects the push, stop before production and report the exact repository policy; do not create a PR unless the owner explicitly changes this directive.

### Phase 6 — canonical production release

Cloudflare Workers Builds currently has a dead former-user build credential. Do not waste time retrying it and do not change repository deployment architecture.

Use the already proven authenticated Wrangler OAuth production path from an environment logged into Cloudflare account `8b1954d216d65077c6480d62583fe2c2`:

1. Confirm `wrangler whoami` shows the Sovereign.os Platform Build account.
2. Capture the current active deployment ID and actual Worker version ID for rollback.
3. Export release metadata for the exact current GitHub `main` SHA.
4. Run the canonical repository command:
   - `pnpm production:release:text`
5. Exactly one new Worker deployment is allowed.
6. Do not reverse migration 0018.
7. Do not use raw `wrangler deploy` as a substitute.

### Phase 7 — live acceptance

Require all four endpoints to succeed:

- `https://sovereign.defrag.app/health`
- `https://sovereign.defrag.app/ready`
- `https://app.defrag.app/health`
- `https://app.defrag.app/ready`

Require:

- both domains report the exact new GitHub `main` SHA;
- both readiness endpoints return `ready=true`;
- release-evidence SHA equals the new live SHA;
- migration is `0019_deprecate_manual_capacity`;
- migration parity is current;
- AI capacity reservations are configured;
- daily neuron budget remains 7500;
- R2 and Queues remain absent;
- both domains agree;
- the public landing visibly contains the new Self, Relationship, and System product proof;
- the visual fingerprint/contract evidence changes intentionally from the prior production archive;
- desktop and iPhone screenshots prove the visible delta.

`routeCohesionVerified=false` and `renderedVisualVerified=false` may remain truthful text-first automation fields, but they do not excuse skipping the required human/rendered evidence in this directive.

## GitHub closure

After exact live acceptance:

1. Verify PR #255 and #257 intended behavior is represented in live `main`; then close them as superseded by the released SHA.
2. Close PR #253 as superseded unless the final implemented source intentionally contains a separately accepted, current-main-derived subset.
3. Update #254 with the exact live SHA and rendered desktop/iPhone evidence; close only when Self, Relationship, and System meet the final canonical contract.
4. Update #214 and #216 with the exact release evidence and remaining real-world acceptance rows.
5. Keep provider/account/legal or controlled-canary work open only when it genuinely requires human/provider action; distinguish it from shipped source work.
6. Do not claim every issue is resolved merely because deployment succeeded.

## Required final report

Return:

1. starting `origin/main` SHA/tree;
2. unique-ref inventory and disposition;
3. exact files/behavior ported from `refine/public-product-proof-v1`;
4. new Relationship and System implementation summary;
5. authenticated-product changes, if any, with evidence;
6. focused and full test/gate results;
7. rendered desktop/tablet/iPhone evidence;
8. final GitHub `main` SHA/tree;
9. previous deployment ID and Worker version ID;
10. release command result and deployment count;
11. new deployment ID and Worker version ID;
12. all four live endpoint results;
13. live application and release-evidence SHA;
14. migration/capacity/R2/Queues evidence;
15. public visual fingerprint and proof that the visible product changed;
16. PR/issue closure actions;
17. remaining blockers divided into source defects, provider controls, human acceptance, and post-launch work;
18. final classification:
    - `VISIBLE_PRODUCTION_RELEASE_ACCEPTED`
    - `RELEASE_BLOCKED_BEFORE_PROMOTION`
    - `BUILD_OR_GATE_FAILED`
    - `PRODUCTION_RELEASE_ROLLED_BACK`

Do not return `VISIBLE_PRODUCTION_RELEASE_ACCEPTED` unless the public product is visibly changed and the exact same accepted source is live on both branded domains.
