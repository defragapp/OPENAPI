# Handoff Report — Survey Phase Part 1: Copy & Tone (R1) & Visual Cohesion (R2)

**Agent**: `teamwork_preview_explorer_survey_1`  
**Working Directory**: `/Users/cjo/OPENAPI/.agents/teamwork_preview_explorer_survey_1/`  
**Milestone**: Survey Phase — Part 1 (R1 Holistic Copy & Tone Audit & R2 Strict Visual Design Cohesion)  
**Date**: 2026-09-05  

---

## 1. Observation

### Part 1: Holistic Copy & Tone Audit (R1)

#### 1.1 Brand Thesis Alignment ("Know yourself. Understand your people. See the whole system.")
- **`apps/web/src/PublicLanding.tsx:220`**:
  - The tripartite thesis appears explicitly only once:
    ```tsx
    <p className="v0-body-lead">Know yourself. Understand your people. See the whole system.</p>
    ```
- **Absence across other routes**:
  - `/how-it-works` (`apps/web/src/PublicHowItWorks.tsx` & `apps/web/public/how-it-works.html`): The phrase does not appear. Instead, it uses a fragmented kicker `HOW SOVEREIGN WORKS` / `YOU → PEOPLE → SYSTEMS` (`PublicHowItWorks.tsx:18`) and the closing CTA only says `"Start with yourself."` (`PublicHowItWorks.tsx:68`).
  - `/pricing` (`apps/web/src/PublicPricing.tsx` & `apps/web/public/pricing.html`): The thesis is completely absent. The closing CTA section only states `"Start with yourself."` (`PublicPricing.tsx:65`, `public/pricing.html:131`).
  - `/faq` (`apps/web/src/PublicFAQ.tsx` & `apps/web/public/faq.html`): The thesis is completely absent. The closing CTA section repeats `"Start with yourself."` (`PublicFAQ.tsx:270`).
  - `/login` and `/signup` (`apps/web/src/App.tsx:288-333`): No brand thesis grounding is present; only authentication form headings and passkey prompts.
  - `/onboarding` (`apps/web/src/PlanOnboarding.tsx`): Focuses entirely on plan confirmation and tier cards with no connection to the tripartite thesis.
  - `/app` (`apps/web/src/SovereignIntelligenceWorkspace.tsx:1037-1041`): The primary arrival greeting states:
    ```tsx
    <span className="greeting-kicker">Personal Intelligence</span>
    <h1 className="greeting-title">What feels active for you now?</h1>
    ```
    The tripartite framework ("Know yourself. Understand your people. See the whole system.") is not reinforced anywhere on the arrival stage or workspace shell.

#### 1.2 Robotic Placeholders, Chatbot Clichés, and Test Fixtures
- **`apps/web/src/LandingDemonstrationStage.tsx:106-107`**:
  - Robotic chatbot greeting:
    ```tsx
    <h2>Welcome back</h2>
    <p>How can I help you today?</p>
    ```
    *Violation*: Explicitly prohibited by `docs/product-language-system.md:203` ("Forbidden: 'How can I help you today?'").
- **`apps/web/src/LandingProductStories.tsx:50-52, 124-126`**:
  - Internal testing codes and test fixture markers exposed in production UI:
    ```tsx
    <span className="meta-chip">U✓</span>
    <span className="meta-chip">U✓ test-fixture</span>
    ```
- **`apps/web/src/PowderLanding.tsx:128-134`**:
  - Corporate B2B-style mock client logo bar:
    ```tsx
    <div className="powder-logos" aria-label="Selected system contexts">
      <span className="client-logo">Self</span>
      <span className="client-logo">Relationship</span>
      <span className="client-logo">Leadership</span>
      <span className="client-logo">Creative Work</span>
      <span className="client-logo">High-Stakes Teams</span>
    </div>
    ```
    *Observation*: Formatted as a corporate SaaS customer logo bar (`.client-logo`), clashing with the contemplative Sovereign aesthetic.
- **`apps/web/src/SovereignIntelligenceWorkspace.tsx:570`**:
  - Redundant secondary action button below recent threads:
    ```tsx
    <button type="button" className="new-conversation" onClick={handleResetToEmptyState}>
      Ask something new
    </button>
    ```
    *Observation*: Directly duplicates the `+ New Chat` pill button at line 538 in the sidebar header and uses cliché chatbot wording.
- **`apps/web/src/App.tsx:300`**:
  - Hardcoded runtime placeholder string:
    ```tsx
    data-sitekey={(window as any).__TURNSTILE_SITE_KEY__ ?? 'configured-at-runtime'}
    ```
- **Backend / Worker Fixture Fallbacks**:
  - `apps/sovereign-worker/src/index.ts:534`: `fallbackText = 'Development fallback only. The OPENAPI-owned Baseline engine is available only after its provider calls complete...'`
  - `apps/sovereign-worker/src/entry.ts:371`: `direct_answer: 'The development fixture cannot provide a personalized interpretation...'`

#### 1.3 Clinical & Medical Jargon Audit
- **`apps/web/src/PublicHowItWorks.tsx:42`**:
  - Verbatim: `"Not a measured psychological fact, diagnosis, or destiny claim."`
- **`apps/web/src/PublicFAQ.tsx:135`**:
  - Verbatim: `"It does not diagnose mental-health conditions or assign clinical labels."`
- **`apps/web/src/ExpressionField.tsx:246`**:
  - Verbatim: `"not a diagnosis, score, or exact measurement."`
- **`apps/web/src/PublicLanding.tsx:98` and `PowderLanding.tsx:99`**:
  - Verbatim: `"Healing isn’t optional. Holding onto the pain is."`
  - *Critical note*: While containing therapy/clinical phrasing ("Healing", "pain"), this exact string is an inviolable brand rule protected by `AGENTS.md:30` and release verifiers.

#### 1.4 Dual Implementation Divergence: React Components vs. Static HTML Files
- **`/how-it-works` Divergence**:
  - `apps/web/src/PublicHowItWorks.tsx` (React component): Implements 5 general workflow steps:
    1. `Ask from reality, not theory`
    2. `Baseline references your recurring dynamics`
    3. `Add a person or system to see the relational field`
    4. `Direct answer first, architecture underneath`
    5. `Save what matters, export anytime`
  - `apps/web/public/how-it-works.html` (Static page): Implements a completely different 5-step journey:
    1. `Explore yourself (Self)`
    2. `Active now (What is alive right now)`
    3. `Understand between two (Relational)`
    4. `See the whole system (Systemic)`
    5. `Answer first, then inspect (Direct answer)`
    Includes an interactive visual demonstration window and 5 expandable intent scenarios with tabs (`Self`, `Relational`, `Systemic`, `Work`, `Decision`).
- **`/pricing` Divergence**:
  - `apps/web/src/PublicPricing.tsx`: Implements 3 pricing cards (`Monthly`, `Annual`, `Founding Member`) with billing toggles and feature bullets.
  - `apps/web/public/pricing.html`: Implements the 3 cards with additional FAQ accordion questions and a comparison table.
- **`/faq` Duplication & Divergence**:
  - In `apps/web/src/PublicFAQ.tsx`, questions are duplicated across categories:
    - Line 35 ("Is Sovereign a therapy app or AI companion?") vs Line 118 ("Is Sovereign a therapy app or medical advice?").
    - Line 60 ("How does Sovereign keep my thoughts private?") vs Line 122 ("How does Sovereign protect my privacy?").
    - Line 138 ("Can I export or delete my data?") vs Line 155 ("Can I export my data?").

---

### Part 2: Strict Visual Design Cohesion Audit (R2)

#### 2.1 Dusk Background Gradient (`#100814` to `#1a101f` to `#0d0710`)
- **`apps/web/src/workspace.css:10535`**:
  - Correctly implemented on workspace runtime:
    ```css
    body:has(.sovereign-app-runtime) {
      background: linear-gradient(180deg, #100814 0%, #1a101f 48%, #0d0710 100%) fixed !important;
      background-color: #100814 !important;
    }
    ```
- **Public Routes Disconnect**:
  - `/` hero (`public.css:16814`): Uses a different slate/rose gradient:
    ```css
    background: linear-gradient(180deg, rgb(27, 34, 40) 0%, rgb(53, 63, 68) 42%, rgb(211, 151, 148) 95%) fixed;
    ```
  - `/how-it-works`, `/pricing`, `/faq`, `/login`, `/signup`, `/onboarding` (`public.css` & `app-shell.css`): Default to flat dark backgrounds (`#090b0e`, `#0b0d0c`, or `#050505`) with green/cyan accents instead of the cohesive dusk purple gradient.

#### 2.2 Mountain Ridge Silhouettes (`powder-hills-far.png`, `powder-hills-mid.png`)
- **Asset Status**:
  - `apps/web/public/powder-hills-far.png` exists (571,154 bytes).
  - `apps/web/public/powder-hills-mid.png` exists (691,556 bytes).
- **CSS Implementations**:
  - `workspace.css:10541-10565`: Implemented as fixed background layers on `body:has(.sovereign-app-runtime)`:
    ```css
    body:has(.sovereign-app-runtime)::before {
      background-image: url('/powder-hills-far.png');
      background-size: 100% auto;
      background-position: center bottom;
      opacity: 0.28;
    }
    body:has(.sovereign-app-runtime)::after {
      background-image: url('/powder-hills-mid.png');
      background-size: 100% auto;
      background-position: center bottom;
      opacity: 0.38;
    }
    ```
  - `public.css:16823-16859`: Implemented on `.v0-hero.sovereign-opening-field::before` and `::after` with opacity 0.35 and 0.50.
- **Defects / Gaps**:
  - The mountain ridge backdrop is completely missing from `/how-it-works`, `/pricing`, `/faq`, `/login`, `/signup`, and `/onboarding`.
  - When navigating from the landing page or workspace to any other public page, the atmospheric landscape vanishes abruptly.

#### 2.3 Floating Glassmorphic Workspace Window (`/app`)
- **Specification Compliance in `workspace.css:10578-10592`**:
  ```css
  .sovereign-app-runtime {
    width: 100% !important;
    max-width: 1152px !important; /* max-w-6xl */
    height: 88vh !important;       /* h-[88vh] */
    border-radius: 24px !important;/* rounded-3xl */
    background: rgba(22, 22, 22, 0.92) !important; /* bg-[#161616]/92 */
    backdrop-filter: blur(28px) !important;        /* backdrop-blur-2xl */
    -webkit-backdrop-filter: blur(28px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important; /* border border-white/10 */
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06) inset !important; /* shadow-2xl */
    overflow: hidden !important;
  }
  ```
- **Critical Structural Defect in `/app`**:
  - In `apps/web/src/AuthenticatedWorkspace.tsx:177-243`:
    - When the session is in gate states (`state === 'checking'`, `'confirming_plan'`, `'policy_review'`), the component renders `<main className="private-route-gate">` directly into `#root`.
    - This bypasses `.sovereign-app-runtime` entirely, resulting in full-screen flat gate cards (`#0b0d0c`) without the floating glassmorphic container or mountain backdrop.

#### 2.4 Left Sidebar Anatomy (`apps/web/src/SovereignIntelligenceWorkspace.tsx:524-583`)
- **Top Diamond Logo Header**:
  - Implemented at line 526:
    ```tsx
    <div className="brand-badge">
      <span className="brand-mark">◇</span>
      <span className="brand-label">Sovereign.OS</span>
    </div>
    ```
- **`+ New Chat` Pill Button**:
  - Implemented at line 538:
    ```tsx
    <button type="button" className="new-thread-pill" onClick={handleResetToEmptyState}>
      <span className="pill-plus">+</span> New Chat
    </button>
    ```
- **Recent Threads with Relative Time**:
  - Implemented at lines 556-568: Lists thread titles with relative time indicators (`today`, `yesterday`, `3d ago`).
- **Bottom User Account Pill**:
  - Implemented at lines 572-582:
    ```tsx
    <div className="user-profile-summary">
      <div className="avatar-chip">{initials}</div>
      <div className="user-text">
        <span className="user-name">{userEmail}</span>
        <span className="user-plan-tag">{planTier}</span>
      </div>
    </div>
    ```

#### 2.5 Center Stage & Composer Dock (`apps/web/src/SovereignIntelligenceWorkspace.tsx:585-695, 1030-1070`)
- **Top Stage Header**:
  - Implemented at lines 586-602: Clean centered "Sovereign" title with surface pill badge (`Personal`, `Relational`, `Systemic`).
- **Warm Arrival Greeting**:
  - Implemented at lines 1037-1041:
    ```tsx
    <span className="greeting-kicker">Personal Intelligence</span>
    <h1 className="greeting-title">What feels active for you now?</h1>
    ```
- **2x3 Action Shortcuts Grid**:
  - Implemented at lines 1043-1068: 6 curated action cards with icons, labels, and pre-composed prompts (e.g. `Deconstruct a recurring loop`, `Map interpersonal friction`, `Audit decision architecture`).
- **Floating Rounded Composer Dock**:
  - Implemented at lines 673-693:
    - Attachment button: `<button className="action-button upload" title="Attach context">📎</button>`
    - Audio rhythm waveform indicator: `<button className="action-button voice" title="Audio rhythm">〰</button>`
    - Expanding textarea with placeholder: `"Speak freely or examine a specific dynamic..."`
    - Send button: `<button className="action-button send" title="Send (Enter)">↑</button>`

#### 2.6 Typography & Design System Tokens
- **Self-Hosted Geist Sans**:
  - Font files located in `apps/web/public/fonts/geist/` (`Geist-Variable.woff2`, `GeistMono-Variable.woff2`).
  - Tested and enforced by `apps/web/src/__tests__/GeistTypographyAuthority.test.ts`.
- **Display Serif Font Misconfiguration**:
  - `apps/web/public/fonts/sovereign-display.woff2` exists (GFS Didot, serif display).
  - In `apps/web/src/design-system.css:203`:
    ```css
    --serif: var(--font-title); /* Aliased to Geist Sans instead of Didot */
    ```
  - *Result*: All intended editorial serif headings fall back to sans-serif Geist Sans.
- **Tailwind Absence**:
  - Neither `tailwindcss` nor `@tailwindcss/vite` is installed in `apps/web/package.json`.
  - All visual specifications (e.g. `max-w-6xl`, `rounded-3xl`, `backdrop-blur-2xl`) must continue to be implemented via pure CSS in `workspace.css` and `design-system.css`.

---

## 2. Logic Chain

1. **Brand Thesis Fragmentation Weakens User Trust**:
   - *Observation*: The core brand thesis ("Know yourself. Understand your people. See the whole system.") is isolated to a single paragraph in `PublicLanding.tsx:220` and completely absent from subpages, onboarding, and workspace greetings.
   - *Inference*: Users navigating from the landing page to `/how-it-works`, `/pricing`, or `/app` lose the organizing framework of the product. The product risks appearing as an undifferentiated general chatbot rather than a structured human intelligence platform.
   - *Requirement*: Anchor each public subpage header/footer and the `/app` empty state greeting in the three-layer thesis: *Personal (Know yourself)*, *Relational (Understand your people)*, and *Systemic (See the whole system)*.

2. **Chatbot Clichés Undermine Sovereign Positioning**:
   - *Observation*: `LandingDemonstrationStage.tsx:106-107` presents `<h2>Welcome back</h2><p>How can I help you today?</p>`.
   - *Inference*: `docs/product-language-system.md:203` explicitly prohibits assistant clichés ("How can I help you today?"). Sovereign is positioned as a sovereign mirror and inquiry partner, not an assistant waiting for orders.
   - *Requirement*: Replace with contemplative inquiry: `"Where is your attention drawn right now?"` or `"Examine an active dynamic."`

3. **Clinical Disclaimers Over-Index on Medical Framing**:
   - *Observation*: Repeated use of "diagnosis", "psychological fact", "mental-health conditions" across FAQ and How It Works.
   - *Inference*: Defensive disclaimers using psychiatric terminology inadvertently prime the user to evaluate Sovereign as medical software rather than a clarity and discernment tool.
   - *Requirement*: Refocus language on sovereign inquiry and internal clarity: e.g. `"Sovereign is a reflection engine for personal discernment, not clinical diagnosis or medical care."`

4. **Atmospheric Discontinuity Across Route Navigation**:
   - *Observation*: The dusk background (`#100814` to `#1a101f` to `#0d0710`) and mountain ridge layers (`powder-hills-far.png`, `powder-hills-mid.png`) are applied only to `.sovereign-app-runtime` and partially to `.v0-hero`, leaving `/how-it-works`, `/pricing`, `/faq`, `/login`, and `/onboarding` on a flat `#090b0e` background.
   - *Inference*: Switching between routes causes harsh visual jarring, breaking the contemplative immersion that the brand identity requires.
   - *Requirement*: Elevate the dusk gradient and mountain ridge pseudo-elements to the global app container (`#root` or global body), ensuring seamless atmospheric continuity across all routes.

5. **Display Typography Fallback Collapses Hierarchy**:
   - *Observation*: `design-system.css:203` defines `--serif: var(--font-title);`, collapsing serif display headings to Geist Sans even though `sovereign-display.woff2` exists in `public/fonts/`.
   - *Inference*: Editorial accents and quote moments lose their distinct visual weight and elegance.
   - *Requirement*: Declare `@font-face` for `Sovereign Display` referencing `/fonts/sovereign-display.woff2` and map `--serif: 'Sovereign Display', Georgia, serif;`.

---

## 3. Caveats

1. **Founder Hero String Inviolability**:
   - In `PublicLanding.tsx:98` and `PowderLanding.tsx:99`, the string `"Healing isn’t optional. Holding onto the pain is."` carries therapy undertones. However, `AGENTS.md:30` and release verification scripts (`scripts/verify-production-release-v3.mjs`, `scripts/verify-live-visual-release-v3.mjs`) strictly mandate its exact presence. **Do NOT alter or remove this string.**

2. **Policy Hash Dependency**:
   - Modifying copy in `apps/web/src/PublicPolicy.tsx` or `apps/web/src/config/policies.ts` changes the text hash checked in `apps/sovereign-worker/src/index.ts:162`. Legal policy text must only be adjusted if hashes and worker references are updated in tandem.

3. **Tailwind Notation vs. Pure CSS**:
   - The user specification uses Tailwind class shorthand (e.g. `max-w-6xl`, `h-[88vh]`, `bg-[#161616]/92`, `backdrop-blur-2xl`). As confirmed in `apps/web/package.json`, Tailwind is not installed. All fixes must be implemented using pure CSS rules in `workspace.css`, `public.css`, or `design-system.css`.

4. **Dual Static HTML and React SPA Serving**:
   - The repository contains both React components (`apps/web/src/Public*.tsx`) and static HTML files (`apps/web/public/*.html`). When copy or layout changes are made, both sources must be kept in sync to prevent divergence depending on how Cloudflare Workers or static hosting routes the requests.

---

## 4. Conclusion

### Summary Assessment
The codebase possesses an exceptionally solid foundation: the self-hosted Geist fonts pass strict tests, the floating glassmorphic workspace window in `/app` is already pixel-accurately coded in `workspace.css:10578-10592`, and the mountain PNG assets exist locally.

However, two major gaps prevent release readiness:
1. **Copy Fragmentation (R1)**: The core tripartite brand thesis is missing from 80% of routes; generic chatbot greetings ("How can I help you today?") and internal test chips (`U✓`) are visible in production components; and public subpages lack unified tone.
2. **Visual Continuity (R2)**: The dusk mountain atmosphere is confined to `/app` (and partially `/`), leaving subpages on stark flat backgrounds, and `/app` gate states break out of the floating glassmorphic shell. Additionally, `--serif` is mistakenly aliased to sans-serif Geist.

### Prioritized Action Plan for Implementation Agents

| Priority | Area | File & Lines | Action Required |
|---|---|---|---|
| **P0** | Chatbot Cliché Removal | `apps/web/src/LandingDemonstrationStage.tsx:106-107` | Replace `"Welcome back"` / `"How can I help you today?"` with contemplative Sovereign prompt: `"What dynamic is alive for you right now?"` |
| **P0** | Test Code Removal | `apps/web/src/LandingProductStories.tsx:50-52, 124-126` | Remove `U✓` and `U✓ test-fixture` chips from customer-facing product story cards. |
| **P1** | Brand Thesis Integration | `PublicHowItWorks.tsx`, `PublicPricing.tsx`, `PublicFAQ.tsx` | Embed `"Know yourself. Understand your people. See the whole system."` prominently into page headers and hero kickers. |
| **P1** | Visual Background Continuity | `public.css`, `workspace.css` | Apply the dusk gradient (`#100814` to `#1a101f` to `#0d0710`) and mountain silhouettes (`powder-hills-far.png`, `powder-hills-mid.png`) globally across all public routes (`/how-it-works`, `/pricing`, `/faq`, `/login`, `/onboarding`). |
| **P1** | Workspace Gate Window Cohesion | `apps/web/src/AuthenticatedWorkspace.tsx:177-243` | Wrap `.private-route-gate` within the floating glassmorphic `.sovereign-app-runtime` container so authentication and plan gates share the floating aesthetic. |
| **P2** | Display Serif Declaration | `apps/web/src/design-system.css:203` | Define `@font-face` for `public/fonts/sovereign-display.woff2` and point `--serif` to `'Sovereign Display', Georgia, serif`. |
| **P2** | Redundant Button Removal | `apps/web/src/SovereignIntelligenceWorkspace.tsx:570` | Remove redundant `"Ask something new"` button below thread list to preserve clean sidebar anatomy. |
| **P2** | Static HTML & React Synchronization | `apps/web/public/*.html` vs `apps/web/src/Public*.tsx` | Align copy and structural steps between static HTML files and React components on `/how-it-works`, `/pricing`, and `/faq`. |

---

## 5. Verification Method

### 1. Build and Typecheck Verification
Execute the project-wide typecheck to ensure zero regressions:
```bash
pnpm -r typecheck
```
*Expected*: Exit code 0 across all workspaces (`apps/web`, `apps/sovereign-worker`, etc.).

### 2. Automated Release Gate Invariants
Verify that mandatory founder hero copy and release rules are intact:
```bash
node scripts/verify-production-release-v3.mjs
node scripts/verify-live-visual-release-v3.mjs
```
*Expected*: Both scripts pass with all invariants satisfied (specifically verifying `"Healing isn’t optional. Holding onto the pain is."` in `PublicLanding.tsx`).

### 3. Font & Design System Integrity
Run typography authority unit tests:
```bash
pnpm --filter @openapi/web test src/__tests__/GeistTypographyAuthority.test.ts
```
*Expected*: Passing test suite verifying self-hosted font loading.

### 4. Visual Inspection Checklist
- Check `/how-it-works`, `/pricing`, and `/faq`: Background matches dusk gradient `#100814` -> `#1a101f` -> `#0d0710` with mountain ridge silhouettes in bottom horizon.
- Check `/app`: Floating container `.sovereign-app-runtime` maintains `max-width: 1152px`, `height: 88vh`, `border-radius: 24px`, and `backdrop-filter: blur(28px)` during active chat AND gate states (`checking`, `confirming_plan`, `policy_review`).
- Check `/app` empty state: Greeting kickers reference the tripartite thesis and action shortcuts are displayed in a clean 2x3 grid.
- Check `LandingDemonstrationStage.tsx`: Ensure `"How can I help you today?"` no longer appears anywhere in DOM.
