# Landing experience audit and revised architecture

Status: historical design audit and supporting rationale. The current root composition is governed by `docs/v0-visual-port-contract.md`; user-facing language is governed by `docs/product-language-system.md`. This audit does not override either contract.

## Production audit

The July 29 release established the near-black and paper palette, privacy language, keyboard-accessible examples, and the Baseline / relationship / system / Basis / pricing / consent product foundations that later releases refined.

The deployed page at that time was nevertheless unclear at the category level. A new visitor saw framework language before they understood what kind of product Sovereign was, what they could ask, or why the answer demonstration mattered.

The first viewport therefore behaved like an editorial introduction to an intelligence framework rather than an immediately recognizable AI product. The visitor had to decode the product before they could understand its value.

The current production direction corrects that by making the product legible through the founder hero, an immediately adjacent product explanation, recognizable questions, direct answers, and the self → people → systems progression.

## Founder correction

Within five seconds, a first-time visitor should understand:

- Sovereign.OS is a private personal AI;
- they can explore themselves, decisions, relationships, families, teams, and other systems;
- Sovereign gives a direct answer grounded in the user's private Baseline and only the additional context that belongs to the question;
- Baseline Design is why the answer does not begin from a blank prompt;
- the user remains responsible for deciding what fits;
- the acquisition action is `Get started`.

The founder-approved emotional line remains first in the founder-locked hero sequence. Product clarity must appear in the immediately adjacent supporting definition, recognizable question, answer demonstration, and acquisition path. The emotional line is not the category definition and must not become a therapy or diagnosis claim.

The enduring line `Know yourself. Understand the system. Choose what fits.` remains a brand close, not the only product explanation.

## Revised architecture

| Section | Visitor question | Product truth | Visual / interaction | CTA and mobile behavior |
| --- | --- | --- | --- | --- |
| Hero | What is this and what can I do? | Sovereign.OS is a private personal AI. | Founder-locked emotional hero with an immediately adjacent product definition; the recognizable question and answer begin in the next required stage. | `Get started` / `Sign in`; the definition remains clear on mobile. |
| Questions | Can it help with my real life? | One Sovereign supports self, decisions, relationships, and systems. | Real-life question treatment leading into one coherent answer/workflow demonstration. | Keyboard and touch behavior remain usable without horizontal page overflow. |
| Self | Why not use a blank chat? | Sovereign starts with a private Baseline and applies it to the person's actual question. | Conversation remains primary; relevant structure appears only when useful. | No competing acquisition CTA. |
| Relationship | Can it represent both people fairly? | Comparison requires permission, keeps both people distinct, and does not infer private motives or choose a winner. | `You`, `They`, and `Between you` remain visibly separate. | Permission and relationship state remain legible on mobile. |
| System | Can it reveal how a family or team functions? | Consented people, supplied roles, permitted perspectives, confirmed responsibilities, reliance/care, pressure, constraints, observations, and interactions can be examined together. | Stable system view keeps participants distinct and exposes structure without creating a synthetic group personality. | Converts to a legible mobile composition rather than a decorative graph. |
| Basis | What shaped the answer? | Exact approved values remain available but secondary. | Compact Basis strip and accessible source detail. | One-line truncation with `+N`. |
| Pricing | What do I receive? | Free supports personal exploration; Sovereign+ brings in permitted people, systems, continuity, and Covenant. | Outcome-led plan comparison with exact prices and limits. | Full-width actions and readable comparison on mobile. |
| Final action | What happens next? | The user starts free, builds a Baseline, and asks naturally. | Concrete entry statement and quiet enduring brand line. | `Get started` remains the acquisition action. |

## Product-honesty boundary

Marketing interactions use sanitized representative data and do not call private intelligence APIs. The demonstration must not imply it is using the visitor's private Baseline.

Relationship and system demonstrations remain representative. They may show supported role and interaction logic but must not imply anonymous persistence, private person access, motive detection, diagnosis, compatibility scoring, deterministic outcome, owner-granted consent, inferred authority, or a canonical `missing perspective` dimension.

System intelligence is grounded in consented participants plus supplied roles, permitted perspectives, confirmed responsibilities, reliance/care, pressure, constraints, observations, and interactions. Another person's exact private state remains unknown unless that person supplies and permits it.

## Approval criteria

The landing is ready only when an unfamiliar reviewer can answer without decoding framework machinery first:

1. What is Sovereign.OS?
2. What can I ask it?
3. What does it give me?
4. Why is it different from generic AI?
5. What should I click first?

The required answers are:

- a private personal AI;
- questions about self, decisions, relationships, families, teams, and wider systems;
- a direct answer built around the person asking and the context that actually belongs to the question;
- it begins with a private Baseline rather than a blank prompt;
- `Get started`.

Production deployment still requires the exact-SHA Cloudflare release gate, live health/readiness, responsive browser review, and the human acceptance tracked in #214.
