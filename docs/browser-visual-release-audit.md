# Sovereign.OS visual release audit

Status: current visual-review checklist plus optional Browser Rendering procedure.

Canonical repository: `defragapp/OPENAPI`.

Production domains:

- `https://sovereign.defrag.app`
- `https://app.defrag.app`

## Current launch evidence model

For the current text-first launch, production infrastructure is released through `docs/production-release.md` after `pnpm verify:cloudflare-build`. Live Cloudflare Browser Rendering is **not required** for the core release.

Human desktop + iPhone/Safari/PWA review is required under #214.

Cloudflare Browser Rendering remains optional deterministic regression evidence. Run it only when explicitly requested or when a future release elects to collect that evidence.

These evidence types are separate:

- human screenshot/device review does not set automated Browser evidence to true;
- source/tests do not set automated Browser evidence to true;
- `routeCohesionVerified=true` only means the automated route Browser audit actually ran and passed;
- `renderedVisualVerified=true` only means the automated rendered-visual Browser audit actually ran and passed.

The current text-first release records those automated fields as `false` when Browser Rendering was intentionally omitted.

Before any visual acceptance, both branded `/ready` endpoints must prove the exact intended SHA, `ready: true`, migration `0018_workers_ai_capacity_reservations`, migration parity `current`, configured policy/privacy dependencies, and exact matching release evidence.

## Visual authority

The approved visual language remains quiet, editorial, monochrome, spatial, and precise:

- near-black/graphite application surfaces;
- warm cream/white/gray typography and structural emphasis;
- no electric blue/cyan/neon/glassmorphism as primary active UI chrome;
- spectral color only when it behaves like restrained physical light rather than interface decoration;
- serif display typography paired with clear sans-serif interface text;
- one focal point at a time;
- generous negative space;
- thin structural rules instead of decorative dashboard-card grids;
- no mystical/occult/Tarot/horoscope-wheel/compatibility-score/gauge/percentage/diagnostic presentation;
- Expression Field as a structural instrument, not a radar chart or emotion detector;
- motion explains state/depth/relationship and respects reduced motion.

The founder component authority remains `docs/v0-visual-port-contract.md`; user-facing copy remains governed by `docs/product-language-system.md`.

## Text-thread visual contract

The authenticated launch is text-first and should inherit the **interaction hierarchy**, not fake runtime behavior, from the landing demo chats:

1. user message is immediately legible but restrained;
2. Sovereign direct answer is the primary focal point;
3. relevant answer sections read as one coherent response rather than dashboard tiles;
4. Basis/provenance stays quiet and secondary;
5. correction and continuation appear after the answer;
6. the composer is the obvious next interaction;
7. progress may expose restrained text states such as connecting Baseline/context and preparing the answer;
8. relationship/system/Alignment views may use structured inline layouts where those structures clarify meaning;
9. no video-generation surface is required.

## Required human desktop review

Review at representative desktop widths, including the 1440px class where practical:

Public/auth:

- `/`
- `/how-it-works`
- `/pricing`
- `/faq`
- `/privacy`
- `/terms`
- `/login`
- `/signup`
- invitation/consent states
- invalid/not-found states

Authenticated:

- policy/plan gate
- Baseline build/reveal
- Today
- Explore
- People
- Systems
- Library
- You/account/privacy/billing controls
- short and long text answers
- Basis/source detail
- Alignment
- Covenant when enabled

Verify no horizontal overflow, clipped critical content, broken hierarchy, obsolete blue/neon chrome, inaccessible focus state, or desktop-only layout assumption.

## Required iPhone/Safari/PWA review

Use real iPhone Safari/PWA where available and representative narrow widths, including 375/390/430 CSS-pixel classes and 320px minimum behavior where practical.

Verify:

- safe-area insets;
- no horizontal overflow/clipped headings/forms/thread content;
- touch targets at least 44 CSS px where applicable;
- readable body/input text at normal and increased browser text size;
- pinch zoom not disabled;
- navigation/sheets/dialogs fit the viewport;
- composer remains usable above software keyboard;
- long answers preserve scrolling and continuation controls;
- Basis uses the documented mobile truncation;
- invitation scope decisions remain operable;
- plan/Baseline/account controls do not become unusable stacked desktop panels;
- reduced-motion state remains understandable;
- install/Home Screen identity remains coherent when PWA install is exercised.

## Public landing human checklist

Verify:

- founder hero is the first focal point;
- outlined second line is legible without neon appearance;
- supporting copy quickly explains actual product/use cases;
- `Start with what’s actually happening.` is visibly useful;
- ordinary real-life question is legible at normal viewing distance;
- Baseline is understandable as the persistent private foundation beneath questions;
- personal demo visibly presents question/answer/evidence/workflow hierarchy;
- relationship demo keeps people distinct and makes the interaction itself legible;
- System demo shows responsibility/authority/pressure/unknowns rather than decorative nodes;
- CTA remains subordinate to the concept;
- mobile proof is intentionally compact rather than a desktop wall stacked vertically;
- final action feels like a conclusion.

## Shared-link/install identity

Verify deployed assets/metadata:

- page/Open Graph title explain Sovereign.OS as private personal AI;
- Open Graph description names supported real-life domains in plain language;
- `/og-sovereign.png` is a real 1200×630 asset using the same identity;
- app/apple-touch/favicon/pinned-tab assets remain recognizable as one product;
- Apple link preview/Home Screen install remain product-explanatory.

## Secondary route checklist

At desktop/mobile where relevant:

- no clipped wordmark, heading, form, policy copy, or control;
- no horizontal scrolling;
- navigation remains composed;
- body copy remains readable;
- touch controls meet minimum size;
- focus treatment remains visible;
- no old blue/neon route accents reappear;
- error/invalid/expired/gated states remain understandable.

## Authenticated interaction review

Use a legitimate authenticated test account and real permission state. Never fabricate another person’s consent.

Review:

- onboarding;
- thread send/receive;
- Today/Explore;
- People/Systems/Library/You;
- context drawer;
- composer keyboard behavior;
- short/long text answers;
- invitation scope decisions;
- hover/focus/menu/scrolling/reduced motion;
- on-demand private export/billing/deletion controls where safe.

## Optional Browser Rendering audit

When explicitly requested, the existing commands remain available:

```bash
pnpm verify:live-visual-release
pnpm verify:live-route-cohesion
```

They may capture deterministic production screenshots/reports for the viewports/routes encoded by the scripts. Their thresholds are regression alarms, not substitutes for human judgment.

Do not lower thresholds or replace founder references merely to force an optional audit through.

If these commands are not run, release evidence must retain the corresponding automated verification fields as `false`.

## Defect record

For each human/rendered mismatch record:

```text
Surface
Viewport/device
Mismatch
Production evidence
Expected contract
Root cause
Exact fix
Verification after fix
Severity
```

Do not leave a reproducible P0/P1 production visual/interaction defect as a recommendation. Repair it in the canonical implementation, run the applicable focused tests plus full exact-SHA repository gate, release the new SHA, and recheck the affected human acceptance flow.

## Final visual acceptance

Do not claim human visual completion until the required production surfaces have actually been inspected on desktop and iPhone/Safari. Do not claim automated Browser completion unless the Browser audit itself actually ran and passed.
