# Sovereign.OS Inner Recognition Intelligence

## Core rule

**Clear guidance first. Exact data support second. Visual explanation third.**

Sovereign uses verified Baseline, live, relational, and user-confirmed context to answer the user’s actual question. Baseline Design personalizes the answer. A small private grounded-intelligence layer may improve the reasoning. Sovereign translates both into simple language, and the user decides what fits. It does not make the user decode those systems, and it does not treat symbolic data, relational theory, or card artwork as proof.

## User experience

### Question phase

The first response normally fits on one mobile screen:

1. **What I notice** — one or two plain sentences.
2. **Look inward** — exactly one question.
3. **Basis** — only exact verified values that materially shaped the question.

No hidden expectation, lecture, action plan, module, or visual archetype is shown before the user answers.

### Integration phase

After the user answers or clearly confirms the direction:

1. **What this may be showing** — a short possibility based mainly on the user’s words.
2. **A clearer form** — a healthier expression of the same valid need.
3. **What to do** — one concrete action.
4. **Visual explanation** — an optional animated archetype shown inside the same AI thread.
5. **Explore later** — at most one optional module.
6. **Basis** — updated exact support, with `U✓` first when directly confirmed.

## Structured planner

The model returns a private JSON plan with:

- `response_shape`
- `response_phase`
- `recognition`
- `inward_question`
- `candidate_hidden_expectation`
- `protected_need`
- `clearer_form`
- `practical_action`
- `module_suggestion`
- `visual_story`
- `basis`
- `confidence`
- `safety_mode`

The server validates this plan before composing any user-facing text or returning any visual metadata.

`response_shape` is `natural` by default for new turns. `guided` preserves the existing heading-based rendering when headings materially improve clarity or safety. Older saved plans without this field remain compatible and render with the established guided shape.

`candidate_hidden_expectation` remains in the contract for saved-plan compatibility. It no longer requires or authorizes an invented hidden expectation. At runtime it means an optional possible pressure, learned expectation, responsibility tension, competing need, or system role, and it may be empty.

## Private grounded-intelligence layer

The source-controlled concept library contains a precise internal definition, plain-language translation, appropriate uses, prohibited inferences, safe and unsafe examples, and an authoritative source reference for each approved concept. The initial library covers differentiation, system anxiety, triangles, overfunctioning and underfunctioning, multigenerational transmission, emotional cutoff, learned beliefs and expectations, boundaries and responsibility, competing internal needs, protective reactions, burdens, polarization, and projection.

A deterministic router examines only the current user message and selects at most two relevant concepts. Only compact plain-language guidance and explicit inference limits for those concepts enter the model prompt. When nothing is relevant, the router explicitly tells the model not to force a psychological explanation. Framework names stay private unless the user asks for theory, research, or sources.

The reasoning order is:

1. understand the user’s actual question;
2. use only verified Baseline information;
3. separate observations from interpretations;
4. consider at most two relevant grounded explanations;
5. preserve uncertainty about absent people, motives, and causes;
6. distinguish the user’s responsibility from outcomes controlled by others;
7. connect the answer to the user’s values, needs, boundaries, and meaning of alignment;
8. offer one useful distinction, question, or realistic next step when appropriate.

## Inline visual story contract

The visual story is part of the existing AI thread. It is not a separate Tarot product, route, workspace, or interpretation engine.

The contract keeps interpretation and presentation separate:

```ts
visual_story: {
  should_show: boolean;
  mode: 'self' | 'interaction' | 'family';
  primary: VisualCard;
  secondary: VisualCard | null;
  tertiary: VisualCard | null;
  origin: string;
  shadow: string;
  gift: string;
  current: string;
  next_step: string;
  visual_reason: string;
}
```

A visual story may appear only when all of the following are true:

- the response is in integration phase;
- the user directly confirmed the recognition or answered the prior inward question;
- safety mode is `standard`;
- the visual copy is complete;
- interaction or family mode has verified relationship evidence;
- required secondary or tertiary cards are present.

Otherwise the server suppresses the visual story.

### Presentation archetypes

The initial visual vocabulary is intentionally small:

- `fool` — beginning, movement, uncertainty, experimentation;
- `magician` — agency, skill, language, shaping outcomes;
- `three_of_cups` — belonging, group harmony, shared roles;
- `hermit` — distance, privacy, discernment, inner direction;
- `strength` — limits, courage, power without force;
- `tower` — disruption, truth, structural change.

These are visual analogies selected after the grounded interpretation. They cannot create, justify, prove, or override the interpretation.

### Three expressions

Each visual can be viewed through:

- **Past protection** — how the role may have learned to protect something important;
- **Shadow** — how the role may act automatically or under pressure;
- **Gift** — the capacity available when the same role is used with awareness and choice.

The user can mark the visual as fitting, partly fitting, or not relevant today. That correction stays in the current thread and does not rewrite the enduring Baseline.

### Animation

The first implementation uses original layered SVG artwork and deterministic CSS motion inside the browser:

- subtle breathing and posture movement;
- object or garment movement;
- card-state transitions;
- one-, two-, and three-card layouts;
- reduced-motion support.

The runtime does not generate a new Tarot video for every turn. Future Rive assets may replace individual SVG motion layers without changing the interpretation contract.

## Basis contract

The server derives available values from authorization-checked context. The model may select values verbatim from those lists only. A selected value that does not exist in the verified list fails the turn.

Footer order:

`BASIS · U✓ | HD [...] | GK [...] | A [...] | REL [...] | LIVE [...] | N [...]`

Rules:

- `U✓` appears first when the user directly confirmed the recognition.
- Human Design channels use `13–33` formatting.
- Frameworks are separated by `|`.
- Values inside one framework are separated by `·`.
- Missing or irrelevant frameworks are omitted.
- The main answer remains complete when the footer is hidden.
- In grounded or escalate safety mode, symbolic details are removed from the footer; directly confirmed user experience may remain.

## Provenance contract

Every meaningful insight should explain why it appeared in plain language. The server validates a lightweight provenance block alongside the recognition plan:

```ts
provenance: {
  why_this_appears: string;
  based_on: string[];
  unknowns: string[];
  next_exploration: string;
}
```

Rules:

- `why_this_appears` explains the connection between Baseline Design, current emphasis, user-confirmed experience, and the interpretation without exposing raw calculations.
- `based_on` contains short trusted labels such as `Baseline Design`, `Current emphasis`, `User-confirmed experience`, `Observed context`, or `AI interpretation`.
- `unknowns` names what cannot be established from the evidence available in the thread.
- `next_exploration` offers one short next question or lens, not a command.

The structured intelligence UI can use this block to present a compact `WHY THIS APPEARS` section beneath the main interpretation and above the basis footer.

## Consent and relational use

Plain-language pair comparison requires active `pair.compare` and `trait.display` permission.

System inclusion requires active `system.include` and `trait.display` permission.

Exact invited-person framework evidence additionally requires active `framework.display` permission. Without it, the invited person’s exact Human Design, Gene Keys, astrology, live, and numerology values are omitted from model context and the footer.

Interaction and family visual stories require verified relationship evidence. Another person’s card is never shown from one person’s private account alone.

Raw birth input and exact private location are never included.

## Insight Modules

The AI may stage one small module suggestion only after integration. A staged suggestion is stored as a short-lived thread event, not as an enduring Library record.

Saving requires a separate authenticated request with `approved: true`. The saved object includes:

- title
- recognition
- hidden expectation
- inward question
- clearer form
- practice
- basis
- confidence
- safety mode
- source thread and source event
- private visibility
- explicit approval marker

The source event produces a deterministic module ID, so repeated approval requests do not create duplicates.

## Safety and grounding

The output validator rejects:

- diagnosis
- claimed hidden intent
- guaranteed prediction
- stigmatizing identity labels
- spiritual certainty
- framework language outside the Basis footer
- more than one question
- responses that do not match question or integration structure

Before final validation, a deterministic quality review inspects both the private plan fields and the composed response. It detects diagnosis, absent-person profiling, claimed motives, projection presented as proven, fixed family roles, blame, literal spiritual causation, Baseline-as-proof claims, unnecessary clinical terminology, therapy claims, unsupported relationship commands, and cold institutional phrasing. One affected passage is rewritten into a controlled plain-language alternative, then the complete response is validated again. Crisis, abuse, coercion, self-harm, immediate-danger, and urgent-medical handling continue through the established grounded or escalate path.

Grounded or escalate mode is used for severe fear, little sleep, inability to function, feeling watched or controlled, confusion about reality, immediate harm, abuse, coercion, or urgent medical concerns. In this mode the system prioritizes concrete safety and trusted human support, removes visual symbolism, and reduces symbolic interpretation.

## Runtime sequence

Each turn reserves three event positions:

1. redacted user event;
2. evidence-checked private recognition plan, including any suppressed or approved visual plan;
3. deterministic language review of private plan fields;
4. composed natural or guided response;
5. deterministic rewrite when needed and final safety validation.

The public response is not streamed token-by-token. The complete model result is parsed, evidence-checked, composed, and safety-validated before display.

When `visual_story.should_show` remains true after validation, the worker sends a compact encoded visual payload in the same response. The browser renders it under the completed AI answer. The surrounding workspace, conversation, and composer remain unchanged.

## Review gates

Before deployment:

- Typecheck and unit tests pass.
- Worker gateway smoke passes.
- Invented Basis values are rejected.
- One-question-first behavior is verified.
- Question phase never exposes a visual story.
- Unconfirmed or grounded turns suppress visual symbolism.
- Interaction and family visuals require verified relationship evidence.
- The AI thread remains usable when the visual layer is hidden.
- Reduced-motion behavior is verified on iPhone and desktop.
- Invitee framework evidence is absent without `framework.display`.
- Module saving requires explicit approval and is idempotent.
- Protected preview is reviewed before production approval.
