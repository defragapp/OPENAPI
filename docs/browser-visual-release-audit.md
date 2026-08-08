# Sovereign.OS browser visual release audit

Use this prompt with an AI agent that can operate a real browser, inspect the repository, and make code changes.

## Prompt

Act as the senior product designer, staff frontend engineer, accessibility reviewer, and release verifier for Sovereign.OS.

Work only in the canonical repository:

```text
defragapp/OPENAPI
```

Production is the single Cloudflare Worker `sovv-web`. Cloudflare Workers Builds connected to `main` is the only production deployment authority. Do not create another Worker, Pages project, framework, deployment route, or public sharing service.

### Read before inspecting

Read these sources first and treat them as approval boundaries:

- `AGENTS.md`
- `docs/launch-product-contract.md`
- `docs/architecture.md`
- `docs/landing-visual-redesign.md`
- `docs/product-language-system.md`
- `docs/inner-recognition-intelligence.md`
- `apps/web/src/App.tsx`
- `apps/web/src/SovereignIntelligenceWorkspace.tsx`
- `apps/web/src/PrivateAnswerExportRuntime.ts`
- `apps/web/src/styles.css`
- `apps/web/src/interface-composition.css`
- `apps/web/src/premium-surfaces.css`
- `apps/web/src/premium-surface-hardening.css`

Inspect the exact deployed commit. Do not review a local branch while assuming it matches production.

### Visual standard

The approved visual language is quiet, premium, editorial, warm, and precise:

- warm black and graphite application surfaces;
- paper-toned emphasis used selectively;
- clay/copper for restrained emphasis;
- sage only for supported or ready states;
- serif display typography paired with clear sans-serif interface text;
- one focal point at a time;
- generous negative space;
- thin structural rules rather than decorative card grids;
- no mystical, occult, tarot, horoscope-wheel, neon, or generic coaching-dashboard language;
- no harsh, cryptic, pseudo-occult, or deliberately abrasive presentation;
- no compatibility scores, alignment gauges, percentages, or diagnostic labels.

The product must feel like one personal intelligence environment, not a collection of widgets.

## 1. Verify the Cloudflare release

Open these production endpoints and record the exact response:

```text
https://sovereign.defrag.app/health
https://sovereign.defrag.app/ready
https://sovv-web.sovereign-os-api.workers.dev/health
https://sovv-web.sovereign-os-api.workers.dev/ready
```

Confirm:

- both domains return the same deployed Git SHA;
- the SHA equals the intended `main` commit;
- readiness is true;
- migration is `0013_workers_ai_free_capacity` or the newer canonical migration if the repository has advanced;
- static assets are served by `sovv-web`;
- no stale service-worker cache is masking the release;
- the public domain and Worker domain are not serving different application shells;
- security headers, same-origin behavior, and private response cache controls remain intact.

If the release is stale, identify whether the cause is Workers Builds, asset caching, the service worker, a failed verification gate, or a domain route mismatch. Fix the repository or Cloudflare configuration through the canonical path. Do not add a second deployment path.

## 2. Inspect the invitation experience

Use a real, current test invitation created through the product. Do not fabricate a token or bypass consent enforcement.

Review these states:

1. invitation loading;
2. valid invitation before acceptance;
3. accepted connection before scope decisions;
4. one allowed and one denied scope;
5. all requested scopes decided;
6. already-used invitation;
7. expired invitation;
8. invalid invitation.

At desktop widths `1440x900` and `1280x800`, tablet width `1024x768`, and iPhone widths `390x844` and `375x812`, verify:

- the wordmark is aligned and never clipped;
- the headline is the first visual focal point;
- the invitation identity and requested uses are immediately understandable;
- consent scopes remain visually separate without becoming a repetitive card stack;
- allow and deny actions have equal clarity without visually pressuring consent;
- selected decisions are visible and remain reversible;
- loading, success, already-used, expired, invalid, and network-error states remain composed;
- status feedback is visible, calm, and not detached from the action that caused it;
- body text remains readable at normal zoom;
- every control is at least 44 CSS pixels high on touch screens;
- keyboard focus is visible;
- there is no horizontal scrolling, clipped copy, hidden content, or unsafe-area collision;
- the experience remains trustworthy when the invitation contains the maximum supported number of scopes;
- raw birth input and exact private location are never exposed.

## 3. Inspect Sovereign answer output

Use an authenticated test account with a completed Baseline. Generate real answers in each supported mode:

- Baseline;
- Now;
- Shadow and Gift;
- Alignment;
- Relationship using permission-bound context;
- System using confirmed members and relationship edges;
- Covenant only after explicit confirmation.

For each answer, verify:

- the direct answer appears before supporting structure;
- the headline and direct answer form one coherent reading sequence;
- Basis remains exact, compact, optional, and server-authorized;
- the answer does not resemble a dashboard report or generic chat bubble stack;
- Alignment shows `Supports the fit`, `Pulls against it`, `The real tradeoff`, `Still needed`, and `A closer version` without any score or gauge;
- Relationship keeps `You`, `They`, and `Between you` distinct and does not claim private motives;
- System output preserves roles, authority, responsibility, reliance, pressure, and unknown perspectives;
- Covenant visibly separates Biblical parallel, Scripture, teaching, application, and boundary;
- `Still unknown` remains readable but subordinate;
- correction and continuation actions are clear without competing with the answer;
- `Print or save PDF` appears only for the latest completed answer and performs a local browser print operation without sending answer content to another endpoint;
- print output removes application chrome and preserves readable section boundaries;
- the composer never covers the final lines or actions;
- long content wraps cleanly with no narrow columns, stranded labels, or excessive line length;
- the mobile layout becomes one intentional reading column rather than squeezed desktop panels.

Test short, standard, and unusually long answers. Test Basis with zero, three, five, and more than five values.

## 4. Interaction and accessibility review

Verify with keyboard only and with reduced motion enabled:

- tab order follows visual order;
- focus never enters hidden drawers;
- drawers and dialogs trap focus and return it to the trigger;
- Escape closes dismissible overlays;
- screen-reader names explain icon-only controls;
- consent choices expose their selected state;
- live status updates do not repeatedly interrupt reading;
- `prefers-reduced-motion` removes nonessential movement;
- forced-colors mode preserves boundaries and action visibility;
- 200% browser zoom does not create horizontal scrolling;
- iOS safe-area insets protect the composer, bottom navigation, and invitation actions.

Do not accept passing automated checks as visual approval. Inspect the rendered interface directly.

## 5. Fidelity ledger

Compare the production render against the approved Sovereign.OS reference composition and record at least these concrete points:

1. warm-black and paper color temperature;
2. serif headline character and line breaks;
3. first-viewport focal hierarchy;
4. spacing rhythm and negative space;
5. border, radius, and shadow restraint;
6. answer reading order;
7. invitation trust hierarchy;
8. mobile collapse and touch ergonomics;
9. visible copy changes;
10. any new or missing visual element.

For every mismatch, record:

```text
Mismatch
Reference evidence
Production evidence
Root cause
Exact fix
Verification after fix
```

Do not leave a fixable visual issue as a recommendation. Repair it, rerun the relevant checks, redeploy through Workers Builds, and inspect the new production render again.

## 6. Required repository verification

Before merging or approving a release, run the repository's canonical verification path:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify:cloudflare-build
```

Also confirm the focused tests covering the invitation, answer presentation, and private print action pass.

## 7. Final report

Return:

- exact merged `main` SHA;
- Cloudflare Workers Build/deployment ID and result;
- `/health` and `/ready` results from both domains;
- desktop and mobile viewport sizes inspected;
- invitation states inspected;
- answer modes inspected;
- private print output inspected;
- accessibility states inspected;
- fidelity ledger with every mismatch and fix;
- remaining intentional deviations, if any;
- confirmation that production matches the approved visual system and canonical product contract.

Do not claim completion if you could not inspect the real deployed interface. State the exact blocker and the next concrete action instead.
