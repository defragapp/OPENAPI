# Landing experience audit and revised architecture

## Production audit

The July 29 release has a strong warm-black and paper palette, a considered serif/sans relationship, credible privacy language, keyboard-accessible examples, and accurate personal, relationship, group, pricing, and consent product truths.

The deployed page is nevertheless unclear at the category level. A new visitor encounters internal framework language before they understand what Sovereign.OS helps them do, why carrying personal context forward matters, or how the product differs from a blank general-purpose AI conversation.

The first viewport therefore behaves like an editorial introduction to an intelligence framework rather than an immediately recognizable consumer product. The visitor must decode the product before they can desire it.

The test suite must verify customer comprehension rather than preserve internal terminology. Category clarity requires an explicit product definition, a recognizable question, a useful answer, and an obvious first action.

## Founder correction

Within five seconds, a first-time visitor must understand:

- Sovereign.OS provides private personal and relational intelligence;
- it helps with self-understanding, decisions, relationships, families, and teams;
- it carries forward a private personal foundation instead of starting from zero;
- it uses shared context only with permission;
- the user remains responsible for deciding what is true and useful;
- the first action is `Create my personal foundation`.

The founder-approved emotional line `Healing isn’t optional. Holding the pain is.` remains part of the brand voice, but it follows product clarity. It is not the category definition and must not become a therapy or diagnosis claim.

The enduring line `Know yourself. Understand the system. Choose what fits.` may remain a brand close. It is not the primary product explanation.

## Revised architecture

| Section | Visitor question | Product truth | Visual / interaction | CTA and mobile behavior |
| --- | --- | --- | --- | --- |
| Hero | What is this and why should I care? | Sovereign.OS provides private personal and relational intelligence. | Recognizable question, useful answer, and clear explanation that personal context carries forward. | Create my personal foundation / See how Sovereign answers; category, question, answer beginning, and CTA remain visible on mobile. |
| Difference | Why not use a blank AI chat? | Sovereign starts with the private personal foundation the user creates. | Personal foundation, temporary context, user confirmation, and remaining uncertainty stay distinct. | No competing CTA. |
| Questions | Can it help with my real life? | One product supports self-understanding, decisions, relationships, and groups. | Real questions update one shared answer stage. | Keyboard tabs; horizontally scrollable without page overflow. |
| Pressure and strength | Is this a fixed label? | A useful quality can become difficult under pressure and more effective when used well. | Existing internal Shadow, Gift, and Alignment states translated into ordinary language. | Controls wrap with 44px targets. |
| Relationship | Can it represent both people fairly? | Comparison requires permission and keeps each person’s information distinct. | Separate person views and one shared interaction view. | Permission steps remain legible as a list on mobile. |
| Group | Can it explain a family or team? | Decision authority, responsibility, care, pressure, and missing perspective can be examined together. | Stable four-person group map and separate pressure explanation. | Converts to a legible list rather than a decorative graph. |
| Supporting details | What shaped the answer? | Exact approved values remain available but secondary. | Compact disclosure and accessible source detail. | One-line truncation with `+N`. |
| Pricing | What do I receive? | Free supports personal clarity; Sovereign+ adds permitted relationships, groups, saved insights, and the optional Christian Scripture perspective. | Outcome-led plan cards with exact prices and limits. | Full-width cards and actions on mobile. |
| Final action | What happens next? | The user creates a personal foundation and brings a real question. | Concrete entry statement and quiet brand close. | Full-width primary action on small screens. |

## Product-honesty boundary

Marketing interactions use sanitized representative data and do not call private intelligence APIs. The demonstration must say that it is not the visitor’s personal foundation.

Public labels such as `The answer`, `Under pressure`, `At your best`, `Decision clarity`, and `What this is based on` translate internal contracts without altering `sovereign-answer.v2`.

Relationship and group demonstrations remain representative. They may show supported role and interaction logic but must not imply anonymous persistence, private person access, motive detection, diagnosis, or deterministic outcome.

## Copy approval criteria

The landing is ready only when an unfamiliar reviewer can answer without scrolling:

1. What is Sovereign.OS?
2. What can it help me understand?
3. Why is it different from general AI?
4. What information carries forward?
5. What should I click first?

The required answers are:

- private personal and relational intelligence;
- self-understanding, decisions, relationships, families, and teams;
- it starts with the personal context the user chooses to create;
- relationship and group information is permission-based;
- Create my personal foundation.

The following phrases must not appear on public product surfaces:

- `Build my Baseline`;
- `Ask about your life`;
- `Get an answer built around you`;
- `Choose what Sovereign may use about you`;
- `No mind-reading`;
- `No compatibility score`.

Production deployment still requires the exact-SHA Cloudflare release gate, live health/readiness, responsive browser review, and deployed route verification.
