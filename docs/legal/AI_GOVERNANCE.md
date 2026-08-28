# Sovereign.OS — AI Governance Document

**Date:** 2026-08-28
**Status:** Implemented and source-verified.

---

## 1. Models in Use

| Component | Provider | Model | Purpose | Fallback |
|---|---|---|---|---|
| Intelligence engine | Cloudflare Workers AI via AI Gateway | `@cf/zai-org/glm-4.7-flash` | Generate structured `sovereign-answer.v2` responses | Fail-closed: no response generated; turn released; user sees error |
| Text-to-speech | Cloudflare Workers AI | `@cf/deepgram/aura-2-en` | Audio rendering of answer text | 500 error; no fallback audio |
| Baseline astronomy | NASA/JPL Horizons API | N/A (deterministic computation) | Astronomical position calculation for Baseline | Fail-closed: baseline marked `unavailable`; no guessing |

### Provider Gate

The worker enforces a single provider at `sovereign.ts:53`:
```
if (aiConfig.provider !== 'cloudflare-gateway') throw new Error('Only Cloudflare AI Gateway is supported.');
```

No other model provider, self-hosted model, or external API is permitted for intelligence generation.

---

## 2. Input Handling

### What the Model Receives

- Reduced/model-safe Baseline context (facet profiles, expression axes, basis registry)
- The user's current question text
- Permitted relationship/system context (consent-gated)
- Thread continuity (last 3 assistant responses + user corrections)
- Emotional Field computation (if Baseline data available)
- Relationship Field computation (if pair comparison available)
- Sovereign answer contract specification
- Covenant instruction (if explicitly enabled for thread)

### What the Model NEVER Receives

- Raw birth date, birth time, birthplace, or birth timezone
- Exact private location (latitude/longitude)
- Authentication material (session tokens, passwords, passkeys)
- Billing identifiers (Stripe customer IDs, subscription IDs)
- Invitation secrets or tokens
- Unrelated Library history
- Unconsented person data
- System prompts or internal safety rules
- Other accounts' private data

### Input Safety

- Maximum input length: 8,000 characters (`safety.ts:56-58`)
- Input safety classifier with four dispositions: `standard`, `grounded`, `urgent`, `secure_refusal`
- Urgent inputs (imminent harm) receive deterministic safety response without model call
- Secure refusal inputs protect system boundaries without model call

---

## 3. Output Safety

### Forbidden Patterns (automatically rejected)

The safety layer at `safety.ts` enforces 14+ forbidden pattern categories:

| Category | Example Patterns | Effect |
|---|---|---|
| Diagnosis | `diagnos*`, `narcissistic`, `borderline`, `bipolar` | Auto-rewrite or rejection |
| Claimed motive | `they really wants`, `she secretly feels` | Auto-rewrite |
| Absent person profile | `you are avoidant`, `they are dysregulated` | Auto-rewrite |
| Projection as fact | `is definitely projecting` | Auto-rewrite |
| Fixed family role | `you are the scapegoat`, `golden child` | Auto-rewrite |
| Family blame | `your parents caused your trauma` | Auto-rewrite |
| Spiritual causation | `literal curse`, `God is causing` | Auto-rewrite |
| Baseline as proof | `your chart says`, `your baseline proves` | Auto-rewrite |
| Clinical jargon | `overfunctioning`, `system anxiety` | Auto-rewrite |
| Therapy claim | `as your therapist`, `this will heal your trauma` | Auto-rewrite |
| Unsupported directive | `you must confront`, `you should leave` | Auto-rewrite |
| Excessive disclaimer | Repeated `I cannot` patterns | Auto-rewrite |
| Institutional tone | `as an ai`, `insufficient data` | Auto-rewrite |
| Certainty claims | `will definitely`, `exactly feels` | Rejection |

### Answer Contract Enforcement

Every answer must satisfy `sovereign-answer.v2`:

- Version: `sovereign-answer.v2` (literal)
- Mode: one of `baseline`, `now`, `shadow_gift`, `alignment`, `relationship`, `system`, `covenant`
- Depth: `focused`, `standard`, or `deep`
- Section count: standard/deep 2-5, focused ≤3
- Mode-specific sections required (relationship: you/other/interaction/responsibility/unknowns; system: system/responsibility/unknowns)
- Basis refs validated against authorized registry (no invented refs)
- Confidence: `confirmed`, `supported`, or `exploratory` (no numeric scores)
- Safety mode: `standard`, `grounded`, or `escalate`

### Prohibited Output Types

- No compatibility scores or percentages
- No gauges or visual metrics
- No deterministic predictions
- No diagnosis or clinical labels
- No hidden motive attribution
- No compatibility verdicts
- No "your chart says" certainty language

---

## 4. Human Control

### User Controls

1. **Correction**: Users can mark answers as `yes` (fit), `partly`, or `not_today` — corrections feed into future context
2. **Consent revocation**: Users can revoke any consent scope at any time
3. **Content deletion**: Users can delete threads, Library items, current conditions, and their entire account
4. **Source inspection**: Users can view source details behind any answer
5. **Covenant opt-in**: Covenant mode requires explicit per-thread activation
6. **Data export**: Users can export their account data on demand

### Epistemic Boundaries

The product language system enforces:

- "Contribution is not causation"
- "Feedback is not blame"
- "Understanding a pattern does not make harm mutual"
- "Another person's motive, exact emotion, or private state remains unknown unless that person supplies it"
- "Safety takes precedence over pattern analysis when abuse, coercion, or immediate danger is present"

---

## 5. AI Turn Economics

| Plan | Monthly Turns | Cost Control |
|---|---|---|
| Free | 10 | Daily neuron budget: 7,500 |
| Sovereign+ | 300 | Capacity reservations table |

- Turns are tracked per UTC calendar month
- Failed requests release their reservation
- Safety responses (grounded/urgent/refusal) do not consume standard turns
- AI Gateway logs are configured with `collectLog: false` for request content

---

## 6. Monitoring and Observability

- AI Gateway: `sovereign-ai-gateway` with metadata (plan, pseudonymous account ref, response contract)
- Worker observability: invocation logs enabled, traces at 5% head sampling
- Turn state tracking: `pending` → `streaming` → `completed` / `failed` in D1
- No raw prompt content logged by default

---

## 7. Governance Gaps

1. **No model evaluation pipeline** — no systematic eval of answer quality, safety, or helpfulness over time
2. **No model update procedure** — if the model changes or is deprecated, no documented migration path
3. **No bias audit** — no systematic check for demographic or cultural bias in answers
4. **No user feedback loop** — corrections are stored but not systematically analyzed for model improvement
5. **No AI incident register** — no formal log of AI safety failures, false positives, or edge cases
