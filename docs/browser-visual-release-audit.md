# Sovereign.OS browser visual release audit

This document defines the rendered-production acceptance path for Sovereign.OS.

## Authority

Canonical repository: `defragapp/OPENAPI`

Production domains:

- `https://sovereign.defrag.app`
- `https://app.defrag.app`

Production release authority is the current `origin/main` commit released through the repository-owned Wrangler OAuth path:

```bash
pnpm production:release:oauth
```

Do not introduce GitHub Actions, a second Worker, Pages, another public deployment path, or a parallel release system.

Before visual review, `/ready` on both branded domains must report:

- `ready: true`;
- the exact intended `main` SHA;
- `migrationVersion: 0015_release_evidence`;
- `latestMigrationVersion: 0015_release_evidence`;
- `dependencies.migrationParity: current`;
- `releaseEvidence.sha` equal to the intended `main` SHA.

## Current visual authority

The approved visual language is quiet, editorial, monochrome, spatial, and precise:

- near-black and graphite application surfaces;
- warm cream/white/gray typography and structural emphasis;
- no electric blue, cyan, neon, generic AI gradients, or glowing dashboard accents;
- spectral color only when it behaves like restrained physical light rather than interface chrome;
- serif display typography paired with clear sans-serif interface text;
- one focal point at a time;
- generous negative space;
- thin structural rules instead of decorative card grids;
- no glassmorphism;
- no mystical, occult, tarot, horoscope-wheel, compatibility-score, gauge, percentage, or diagnostic presentation;
- Expression Field as a structural instrument, not a radar chart, starburst, or decorative data visualization;
- motion must explain state, depth, or relationship and must respect `prefers-reduced-motion`.

The final injected presentation authorities are loaded synchronously from `apps/web/src/main.tsx` in this order: experience refinement → rendered fidelity → landing refinement v2 → invitation fidelity. New rendered-fidelity corrections must remain presentation-only and must not change routing, permissions, Baseline logic, billing, consent, answer contracts, or Worker architecture.

The public experience inherits `docs/product-language-system.md`: Baseline Design is the foundation; the visitor brings an ordinary real-life question or situation; Sovereign makes a useful distinction visible; relationship and system intelligence extend the same foundation outward; technical machinery remains secondary. Internal `capacity` language must not lead the public landing, demo headings, social metadata, or the first product explanation.

## Primary audit: Cloudflare Browser Rendering

Cloudflare Browser Rendering is the primary deterministic production browser.

### Landing composition

Run:

```bash
pnpm verify:live-visual-release
```

This must:

- render the real production landing page;
- capture full-page PNGs for desktop `1440x900`, mobile `390x844`, and mobile `430x932`;
- write screenshots and `report.json` under `.visual-release-audit/`;
- verify zero horizontal overflow;
- verify section order and expected release markers;
- use the founder reference only for desktop composition;
- treat mobile as structural evidence unless an approved viewport-specific mobile reference exists.

A similarity score is a regression alarm, not a substitute for human visual judgment. The desktop `0.70` threshold remains locked until a different reference is explicitly approved; do not lower it to force a release through.

Do not freeze, replace, or re-certify a founder visual reference while a known documentation-to-render contradiction remains. The intended composition must be rendered and inspected first.

### Route cohesion

Run:

```bash
pnpm verify:live-route-cohesion
```

The current route audit renders and inspects:

- `/how-it-works`;
- `/pricing`;
- `/faq`;
- `/privacy`;
- `/terms`;
- `/login`;
- `/signup`;
- invitation shell;
- onboarding gate;
- workspace gate;
- not-found route.

It verifies real rendered layout, typography, primary content, navigation, route authority, and horizontal overflow. The v2 wrapper also persists each Browser Rendering PNG and a route report beneath:

```text
.visual-release-audit/routes/
```

Do not accept a hash-only result as sufficient evidence when a screenshot is available.

## Visual review checklist

Inspect the actual PNGs after the automated audit passes.

### Public landing

Verify:

- the founder hero is the first focal point;
- the outlined second line remains legible without looking like a neon effect;
- the supporting copy immediately explains the actual product category and ordinary use cases rather than leading with internal framework language;
- Expression Field reads as one centered structural instrument and not as blue UI decoration;
- one selected desktop field line exposes a small endpoint label with the line name and relative numeric value; the label sits near the line end, does not cover the center, and never says `vector` or `emotional vector`;
- the field remains usable without the tooltip on narrow mobile screens where the label would create clutter;
- the CTA remains subordinate to the concept rather than becoming a bright app-store button;
- `Start with what’s actually happening.` is visibly rendered as a real recognition stage rather than existing only in source or accessibility-only clipped text;
- one ordinary real-life question is legible in that stage at normal viewing distance, with the scope label helping a visitor immediately recognize self, relationship, decision, or family-system use;
- the recognition stage makes Baseline Design understandable as the persistent private reference beneath questions without exposing framework codes or implementation machinery as the primary explanation;
- the Personal demonstration is large enough to read at normal viewing distance and visibly progresses through the answer structure instead of looking like two static cards;
- workflow motion makes the active step, completed steps, and useful direction visible and remains understandable with reduced motion;
- the Relationship demonstration keeps both people distinct and makes `Between you` visually legible;
- the System demonstration shows how unresolved decisions or responsibility move under pressure, where the route concentrates, and what can be tested next; it must not read as a decorative four-node family diagram or assign fixed personality roles;
- Personal, Relationship, and System stories remain visually distinct without feeling like repeated dashboard cards;
- mobile pacing preserves the same product identity while shortening proof: workflow steps may become a horizontal snap rail, redundant system reasoning may collapse, and the primary chat/map must still communicate the point without forcing a desktop-length wall of examples;
- the comparison states the factual Baseline-first distinction without making a blanket claim about every other AI product;
- the final CTA feels like a conclusion rather than another product panel.

### Shared-link and install identity

Verify the deployed HTML and assets, not only source:

- page title and Open Graph title lead with `Sovereign.OS — Private personal AI for real life` rather than the emotional hero line alone;
- Open Graph description names self, relationships, decisions, and family or group dynamics in plain language;
- `/og-sovereign.png` returns a real `1200x630` PNG and visually uses the same line-field identity;
- `/app-icon.png` and `/apple-touch-icon.png` return raster icons using the same mark as the SVG favicon and Safari pinned-tab asset;
- iMessage or another Apple link-preview surface shows a product-explanatory preview rather than text-only `Healing isn’t optional…` metadata;
- Chrome/Safari tab identity and an iOS Home Screen install remain recognizably the same product without requiring identical page layouts.

### Secondary routes

Verify at minimum desktop `1440x900` and mobile `390x844` where the route supports mobile auditing:

- no clipped wordmark, heading, form, policy copy, or controls;
- no horizontal scrolling;
- navigation remains composed;
- body copy remains readable at normal zoom;
- touch controls remain at least 44 CSS pixels where applicable;
- focus treatment is visible;
- no old blue/neon route accents reappear;
- error, invalid, expired, and gate states remain calm and understandable.

Any suspicious automated measurement must be resolved by inspecting the corresponding PNG before changing code. For example, an unusually narrow or tall heading box is a reason to inspect the screenshot, not an automatic reason to rewrite the layout.

## Authenticated interactive review

Cloudflare Browser Rendering is authoritative for deterministic layout evidence. Use one real interactive browser agent only after the deterministic audit is green.

Preferred second pass: Gemini in Chrome. Copilot in Edge is acceptable if Chrome is unavailable.

Use a legitimate authenticated test account and real current invitation state. Do not fabricate permission state or bypass consent.

Review:

- onboarding;
- Today;
- Explore;
- People;
- Systems;
- Library;
- You;
- context drawer;
- composer behavior;
- short and long answers;
- mobile keyboard and safe-area behavior;
- invitation scope decisions;
- hover, focus, menu, scrolling, and reduced-motion behavior.

The browser agent is an interaction reviewer, not a deployment authority. Repository changes still go through the canonical `main` verification and release path.

## Acceptance and fixes

For every rendered mismatch record:

```text
Mismatch
Production evidence
Root cause
Exact fix
Verification after fix
```

Do not leave a fixable production visual defect as a recommendation. Repair it in the canonical implementation on `main` unless repository protection or explicit user instruction requires isolated review, run the relevant web tests and repository gates, release the resulting exact current `main` SHA through `pnpm production:release:oauth`, then rerun both Browser Rendering audits against that deployed SHA.

The final report must include:

- exact `main` SHA;
- exact deployed SHA;
- `/ready` evidence for both domains;
- Cloudflare landing screenshots and report;
- Cloudflare route screenshots and report;
- desktop and mobile viewports inspected;
- shared-link and install identity assets inspected;
- authenticated flows inspected when relevant;
- remaining intentional deviations, if any.

Do not claim rendered visual completion when production screenshots were not inspected.
