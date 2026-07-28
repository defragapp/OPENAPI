# Sovereign.OS — Continuous Visual Development Mode

## Required workflow for UI, UX, and intelligence-interface changes

Before making any UI, UX, or intelligence-interface change:

1. Start the local Sovereign.OS development environment.
2. Open the relevant live browser preview.
3. Keep the preview visible while editing.
4. Make small changes.
5. Observe the rendered result immediately.
6. Refine the visual experience before moving on.
7. Repeat until the experience feels polished.
8. Run verification.
9. Commit.

Do not work blind and validate only after completion.

## Preview requirement

The preview should remain available for continuous inspection of:

- Landing page
- Today
- Explore
- People
- Systems
- Library
- You
- Pricing
- Authentication flows

Do not rely only on source code, component structure, screenshots, or test output.
The browser experience is the source of truth for visual quality.

## Review during every UI change

After each meaningful edit:

1. Observe the live rendered result.
2. Compare it against the intended product experience.
3. Identify visual issues.
4. Refine immediately.

### Product feel

Ask whether the experience feels like a mature intelligence platform or like a prototype/dashboard.
Target:

- ChatGPT-level product maturity
- Gemini-level intelligence presentation
- Claude-level clarity
- Grok-level polish and personality

### Visual quality

Inspect:

- Typography: readability, hierarchy, scale, contrast
- Layout: spacing, balance, density, alignment
- Components: consistency, interaction clarity, premium feel
- Motion: purposeful, meaningful, communicating intelligence

## Intelligence interface review

For every intelligence component, do not ask only “Does it render?”
Ask instead:

- Does the user understand what this means?
- Does the interface communicate why an insight appeared?
- Does it show the evidence/provenance clearly?
- Does it connect Baseline context to the current question?
- Does it make relationships and systems understandable?

The interface should communicate:

- “This system understands my context.”

Not:

- “This is a technical data panel.”

## Required iteration behavior

Do not batch a large set of UI changes and inspect later.
Work in small visual loops:

1. Improve one surface.
2. View it in the browser.
3. Adjust spacing, typography, or interaction.
4. Continue until the component feels production quality.

## Visual acceptance standard

A change is incomplete until:

- Functionality works
- Browser preview was reviewed live
- Desktop layout is refined
- Mobile layout is refined
- Typography is readable
- Spacing is intentional
- Motion is purposeful
- The component fits Sovereign.OS’s visual language

## Final review before commit

Capture:

- Desktop view
- Mobile view
- Expanded intelligence state
- Interaction state

Document:

- What changed
- Why it improves the user experience
- Remaining limitations

Then:

1. Run verification
2. Commit
3. Push
4. Report the commit SHA

## Repository context

- Keep Baseline Design at the center of the product experience.
- Preserve trust, provenance, consent, and user correction as core product values.
- Follow the repository rules in `AGENTS.md` and the repo-specific product guidance.
