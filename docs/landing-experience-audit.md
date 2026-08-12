# Landing experience audit and revised architecture

Status: historical design audit and supporting rationale. The current root composition is governed by `docs/v0-visual-port-contract.md`; user-facing language is governed by `docs/product-language-system.md`. This audit does not override either contract.

## Production audit

The July 29 release has a strong warm-black and paper palette, a considered serif/sans relationship, credible privacy language, keyboard-accessible examples, and accurate Baseline, relationship, system, Basis, pricing, and consent product truths.

The deployed page is nevertheless unclear at the category level. A new visitor sees `PRIVATE AI, BUILT AROUND YOUR BASELINE` and `Know yourself. Understand the system. Choose what fits.` before they understand what Baseline means, what kind of AI Sovereign is, what they can ask, or why the answer card is relevant.

The first viewport therefore behaves like an editorial introduction to an intelligence framework rather than an immediately recognizable AI product. The visitor must decode the product before they can desire it.

The current test suite preserves the problem by treating the old philosophy headline and Baseline-first kicker as proof that the product is unmistakable. Category clarity must instead be verified through an explicit AI definition, a visible user question, a visible Sovereign answer, and an obvious first action.

## Founder correction

Within five seconds, a first-time visitor must understand:

- Sovereign.OS is a private personal AI;
- they can ask about themselves, relationships, decisions, families, or teams;
- Sovereign gives a direct answer grounded in a private personal foundation;
- Baseline Design is why the answer does not begin from a blank prompt;
- the user remains responsible for deciding what fits;
- the first action is `Build my Baseline`.

The founder-approved emotional line remains first in the founder-locked hero sequence. Product clarity must appear in the immediately adjacent kicker, supporting definition, recognizable question, answer demonstration, and actions. The emotional line is not the category definition and must not become a therapy or diagnosis claim.

The enduring line `Know yourself. Understand the system. Choose what fits.` remains a brand close, not the only product explanation.

## Revised architecture

| Section | Visitor question | Product truth | Visual / interaction | CTA and mobile behavior |
| --- | --- | --- | --- | --- |
| Hero | What is this and what can I do? | Sovereign.OS is a private personal AI. | Founder-locked emotional hero with an immediately adjacent product definition and actions; the recognizable question and answer begin in the next required stage. | Build my Baseline / See a Sovereign answer; definition and actions remain clear on mobile. |
| Brand meaning | Why does this matter? | Understanding can separate pain, identity, relationship interaction, and system reinforcement without diagnosis. | Quiet editorial statement after the product interaction. | No competing CTA. |
| Questions | Can it help with my real life? | One AI supports self, decisions, relationships, and systems. | Real-life question rail updating one shared answer stage. | Keyboard tabs; horizontally scrollable without page overflow. |
| Difference | Why not use a blank chat? | Sovereign starts with a private Baseline and adds only chosen context. | Baseline, temporary current context, confirmation, and unknown state remain separate. | No competing CTA. |
| Expression | Is this a fixed label? | One valid quality can narrow under pressure or become useful with awareness. | Existing Shadow, Gift, and Alignment state selector. | Controls wrap with 44px targets. |
| Relationship | Can it represent both people fairly? | Comparison requires permission and does not infer motives or choose a winner. | Separate person fields and full-width interaction field. | Permission steps remain legible as a list on mobile. |
| System | Can it reveal how a family or team functions? | Roles, authority, responsibility, care, pressure, and missing perspective can be examined together. | Stable four-person system map and separate pressure field. | Converts to a legible list rather than a decorative graph. |
| Basis | What shaped the answer? | Exact approved values remain available but secondary. | Compact Basis strip and accessible source detail. | One-line truncation with `+N`. |
| Pricing | What do I receive? | Free supports personal exploration; Sovereign+ brings in permitted people, systems, continuity, and Covenant. | Outcome-led plan cards with exact prices and limits. | Full-width cards and actions on mobile. |
| Final action | What happens next? | The user builds a Baseline and then asks naturally. | Concrete entry statement and quiet enduring brand line. | Full-width primary action on small screens. |

## Product-honesty boundary

Marketing interactions use sanitized representative data and do not call private intelligence APIs. The demonstration must say that it is not the visitor’s Baseline.

The public labels `Answer`, `Under pressure`, `At its best`, and `What fits` are translations of Direct answer, Shadow, Gift, and Alignment for category clarity. They do not alter `sovereign-answer.v2`.

Relationship and system demonstrations remain representative. They may show supported role and interaction logic but must not imply anonymous persistence, private person access, motive detection, diagnosis, compatibility scoring, or deterministic outcome.

## Approval criteria

The landing is ready only when an unfamiliar reviewer can answer without scrolling through framework explanation:

1. What is Sovereign.OS?
2. What can I ask it?
3. What does it give me?
4. Why is it different from generic AI?
5. What should I click first?

The required answers are:

- a private personal AI;
- questions about self, relationships, decisions, families, and teams;
- a direct answer built around the person asking;
- it begins with a private Baseline rather than a blank prompt;
- Build my Baseline.

Production deployment still requires the exact-SHA Cloudflare release gate, live health/readiness, responsive browser review, and deployed route verification.
