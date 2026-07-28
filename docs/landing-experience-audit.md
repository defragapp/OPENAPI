# Landing experience audit and revised architecture

## Audit

The existing release has a strong warm-black and paper palette, a considered serif/sans relationship, credible privacy language, and a working keyboard-accessible example selector. Its Baseline, relationship, and system product truths are present.

As a complete journey, however, the hero asks a large headline, two paragraphs, two actions, trust notes, and a dense diagram to compete at once. The page then repeats large headings, rectangular cards, and two-column sections with generous vertical padding. Product behavior is mostly described rather than shown. Supporting labels are small, the provenance of an example insight is absent, the three intelligence levels resemble separate feature cards, and the system promise has no concrete visual proof. The final action does not explain the input, time, uncertainty, or correction experience.

Responsive rules stack the content safely, but the diagram becomes tall and label-dense on phones. Motion is limited to an ambient orbit, so it does not communicate a change in intelligence state. Relationship copy is balanced and consent-aware, but visitors cannot change perspective. These gaps make the experience feel editorial rather than operational and weaken recognition, trust, and conversion.

## Revised architecture

| Section | Visitor question | Product truth | Visual / interaction | CTA and mobile behavior |
| --- | --- | --- | --- | --- |
| Hero | What is this and why is it different? | A Baseline foundation is applied to real life while tendency, pressure, confirmation, and unknown state remain distinct. | Four-stage Baseline-to-insight control. | Build Baseline / see example; stages become a compact scroll-free grid. |
| Difference | Why not use a blank chat? | Sovereign begins with structured personal context. | Short prompt-to-foundation bridge. | No competing CTA; one-column statement on mobile. |
| Intelligence path | Does this expand beyond me? | One foundation supports personal, consented relationship, and system views. | One-to-two-to-many objects across a connected path. | Cards stack while retaining the visual progression. |
| Baseline | What is kept in the foundation? | Stable tendencies remain distinct from pressure, integrated expression, and current emphasis. | Existing dimension ledger. | Link to How it works; compact rows on mobile. |
| Real-life application | Can I see an insight form? | Question, interpretation, evidence, uncertainty, correction, and next move remain visible. | Keyboard tabs, open provenance, and correction controls. | Controls wrap with 44px targets. |
| Relationship | Can it represent both people fairly? | Comparison requires permission and does not infer motives or choose a winner. | My / their possible / relationship perspective switch. | Views stack and focus state remains explicit. |
| System | Can it reveal a family or team pattern? | Individual contributions, roles, authority, pressure, and missing perspective can be examined together. | Stable four-person map with a pressure overlay. | Converts to a legible list rather than a node graph. |
| Trust and control | Is this private and optional? | Raw inputs stay protected, consent is deterministic, and Covenant is opt-in. | Existing three-part control statement. | Single column. |
| Final action | What happens next? | Free setup takes minutes, exact time is optional, and the user can correct the result. | Concise setup expectation beside CTA. | Full-width actions on small screens. |

## Known limitations

Marketing interactions use representative static data and do not call private intelligence APIs. Confirmation controls demonstrate the product pattern but do not persist for anonymous visitors. Visual regression evidence depends on the local browser capture environment.

## Final production review

### Product-honesty verification

| Landing representation | Implemented product basis | Assessment |
| --- | --- | --- |
| Baseline-first exploration | The authenticated workspace builds and uses a Baseline before presenting personal context. | Supported. |
| Correction and continuity | Thread corrections are persisted by the authenticated API, returned in correction history, and included in later conversation context. The public interaction is explicitly labeled as an example and does not claim anonymous persistence. | Supported with an explicit marketing-demo boundary. |
| Insight provenance | Structured responses expose reduced basis, confidence, safety mode, and saved fit without raw birth inputs or exact private locations. | Supported; the landing uses representative language rather than claiming identical UI. |
| Relationship comparison | People context is permission-scoped and supports two-person comparison. The public perspective switch illustrates balanced views; it is not presented as a literal workspace control. | Supported as a representative interaction. |
| System intelligence | Authenticated Systems can be created, populated through active consent, selected as exploration context, and analyzed for roles, authority, pressure, and responsibility. | Supported; the public map is representative static data. |
| Current emphasis | Today exposes a reduced possible-current-amplification value and explicitly avoids treating it as observed fact. | Supported with appropriately conditional copy. |

### Merge recommendation

**Recommend merge after normal code review. Production-readiness score: 91/100.** The page now communicates the Baseline-first distinction, separates interpretation from confirmed and unknown state, shows a coherent self-to-relationship-to-system progression, and explains the setup action. The remaining nine points are operational rather than landing-code blockers: production browser comparison, authenticated end-to-end smoke coverage in the target account, and deployment/version verification still require a production-capable environment.

No copy reviewed here claims diagnosis, motive access, compatibility scoring, deterministic behavior, anonymous correction persistence, or guaranteed outcomes. The screenshot set should be regenerated from the final commit before deployment so the evidence matches the correction-state refinement.
