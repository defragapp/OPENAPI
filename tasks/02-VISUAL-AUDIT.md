# POWDER VISUAL AUDIT & SOVEREIGN RE-IMPLEMENTATION

## 1. POWDER REFERENCE AUDIT

### Global Visual System
* **Atmosphere**: Uses deep, warm, dark tones (`#000912`), not pure `#000000`. Soft gradients and lighting overlays create physical depth without relying on neon or glassmorphism.
* **Composition**: Large, editorial max-width (often ~1200px to 1400px), with generous horizontal gutters.
* **Typography Scale**: High contrast between massive display text (tight tracking) and highly readable, medium-sized body text. Minimal intermediate sizes.
* **Container Geometry**: Thin borders (`rgba(255,255,255,0.1)`), large corner radii for major sections, subtle background fills.
* **Metadata/Labels**: Small capsule/kicker treatments (pills) above headlines to set context quietly.

### Hero & Product Preview
* The hero is an integrated vertical stack: small kicker pill → massive centered headline → supporting copy → primary CTA → **oversized product UI preview**.
* The product UI acts as visual evidence. It occupies the spatial layer behind or immediately below the typography. It's cropped intentionally and framed cleanly.

### Section Choreography
* Moves from large editorial hero to alternating horizontal and vertical modules.
* "Feature" sections aren't 3-column grids of generic icons. They are large, asymmetrical layouts featuring representative product UI paired with sparse explanatory copy.

## 2. SOVEREIGN GAP ANALYSIS

### Hero
* **Current**: `V0Hero` contains text, then a 3D SVG sphere (`LandingExpressionSlice`), then a row of 4 icons (`MobileCapabilityRail`).
* **Gap**: The product is missing from the hero. The 3D sphere is beautiful but abstract; it feels like an illustration rather than the *actual product experience*. The hero should feature a massive, realistic representation of the Sovereign conversational workspace.

### Product Demonstration
* **Current**: `LandingDemonstrationStage` is a fake window with a tab rail and a simulated chat UI.
* **Gap**: It looks like a "dashboard mockup" rather than the real Sovereign workspace. The "LIVE SOVEREIGN BASELINE INQUIRY" text violates product honesty (it implies live analysis instead of an illustrative example). The fake window dots (`<span /><span /><span />`) feel like a generic SaaS template. It's placed *below* the hero instead of being integrated into the hero.

### Layout & Containers
* **Current**: CSS relies on standard `max-width: 1240px` but the sections (`v0-comparison`, `landing-stories`) feel disjointed.
* **Gap**: Lacks the cohesive, flowing spatial rhythm of Powder. Needs quieter borders, more whitespace, and a unified atmospheric background.

## 3. IMPLEMENTATION PLAN

1. **Hero Recomposition**:
   * Move a high-fidelity, oversized product preview (representing the Sovereign workspace) into the `V0Hero` immediately below the CTA.
   * Remove the abstract 3D sphere from the primary hero center, or use it as an atmospheric background element.
2. **Product Preview Realism**:
   * Redesign `LandingDemonstrationStage` to look exactly like the real `SovereignIntelligenceWorkspace`, removing the fake OS window controls and "LIVE" claims. Label it clearly as an illustrative example.
3. **Typography & Atmosphere**:
   * Adjust `public.css` to use a rich, deep near-black background (`var(--sov-background)`).
   * Ensure Geist Sans is scaled beautifully.
   * Add large, thin-bordered containers for the major product stories.
4. **Copy & Language fixes**:
   * Fix `LandingExpressionFieldPreview.tsx` (remove "Vector length" and "emotional score").
   * Ignore `v0-release-fingerprint.ts` as it is historical provenance (already confirmed in previous steps).

## 4. IMPLEMENTATION & RENDERED VERIFICATION (COMPLETED)
* **Hero UI & Product Frame**: Shifted `<LandingDemonstrationStage />` into `V0Hero`. It is now an oversized, deeply integrated component instead of an isolated element. Styled with the authentic `workspace-arrival` elevation (20px radius, 180deg transparent-to-dark gradient, soft lighting box shadow) making it read as real software, not a SaaS graphic.
* **Atmosphere Depth**: Converted `<LandingExpressionSlice />` into an atmospheric background element masked behind the hero text (`opacity: 0.4`, centered absolute) instead of an inline module. This creates depth equivalent to Powder's blurred imagery without borrowing arbitrary sci-fi gradients.
* **Product Honesty Fixes**: Removed "LIVE SOVEREIGN BASELINE INQUIRY" and the generic window dots (`span / span / span`) from the demonstration stage. Replaced with accurate "ILLUSTRATIVE EXAMPLE" metadata. Also removed "emotional score" and "Vector length" language from `LandingExpressionFieldPreview.tsx`.
* **Tests Passed**: Realigned UI verifiers to expect the new hero composition without removing strict checks.
