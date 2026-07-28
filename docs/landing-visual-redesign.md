# Landing visual quality critique and redesign plan

## Visual critique

The current page is correct but not desirable. It gives nearly equal visual weight to the hero, feature path, Baseline ledger, conversation thread, relationship card, system map, controls, and final action. Most ideas live inside bordered rectangles and depend on labels plus paragraphs. This produces the rhythm of a case study: heading, explanation, card, repeat.

The hero's diagram is technically interactive, but it reads as a dashboard because it combines a header bar, step navigation, four floating data cards, a legend, question cards, and a footer. The Baseline has no singular visual identity. Typography compounds the problem: oversized serif headings become the dominant object while supporting product text is comparatively small. On mobile, desktop objects stack into a long document rather than becoming a focused product sequence.

The strongest opportunity is the transition from one person to a relationship to a system. The current implementation splits those ideas across a feature grid, a dense relationship panel, and a separate system card, so the category expansion has to be read rather than felt.

## Revised page architecture

1. **Hero as product:** one concise category statement and one living Baseline field. A six-step interaction moves from foundation through question, connection, possible insight, evidence, and confirmation.
2. **Difference in one beat:** a short visual contrast between blank-prompt assistance and persistent personal context. No feature cards.
3. **One live exploration:** one dominant question-to-insight composition with selectable real-life questions, progressive evidence, and explicit unknown state.
4. **One intelligence, expanding:** a single visual stage morphs between self, relationship, and system. Supporting copy changes in place instead of creating three parallel cards.
5. **Trust and continuity:** a quiet ledger shows what is known, interpreted, confirmed, and private, followed immediately by the start action.

## Redesigned hero concept

The hero's right side is an open intelligence field rather than a dashboard. A distinctive nested Baseline “signature” sits at its center. Context enters as a question, a relevant Baseline quality comes into focus, and a possible insight resolves beneath it. The visitor advances the state from a compact rail; the movement explains relevance rather than decorating empty space. Evidence and confirmation appear only at the appropriate stage. Reduced-motion mode removes interpolation while preserving every state.

## Component redesign plan

- **`BaselineOrbit`:** replace orbiting cards and chart-like rings with a nested signature, one active quality, an entering question, a resolving insight, and a six-step state rail.
- **`PublicLanding`:** remove the feature grid, Baseline ledger, long relationship comparison, separate system card, and repeated section-heading pattern. Replace them with three dominant interactive scenes and a compact trust/final-action composition.
- **Landing stylesheet:** use a dedicated final stylesheet with fewer borders, larger readable interface text, stronger foreground/background contrast, controlled cinematic gradients, and intentionally horizontal mobile interactions.
- **Tests:** assert the new narrative and safety boundaries rather than obsolete section copy or CSS class names.

## Mobile behavior

The hero becomes a single focused stage with a horizontally scrollable state rail. Question choices become snap-scrolling controls. The self-to-system visual retains a fixed-height stage and changes in place, avoiding three tall stacked cards. Body copy stays at least 16px, touch targets remain at least 44px, and no essential state depends on hover or motion.
