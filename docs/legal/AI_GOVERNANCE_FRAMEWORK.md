# AI Governance Framework

Status: comprehensive AI governance for Sovereign.OS

Reviewed: 2026-08-28

This framework establishes governance rules for Sovereign.OS as an AI company. It supersedes and extends `docs/legal/AI_GOVERNANCE.md` with regulatory protection.

## 1. AI system classification

### What Sovereign.OS AI does

| Function | Description | Classification |
| --- | --- | --- |
| Personal interpretation | Interprets Baseline data to answer questions about self, relationships, systems | Interpretive tool |
| Pattern recognition | Identifies recurring themes in how a person thinks, decides, communicates | Reflective analysis |
| Relationship intelligence | Compares Baseline data between consenting participants | Consent-gated analysis |
| System analysis | Examines dynamics in families, teams, groups | Consent-gated analysis |
| Source attribution | Shows exact source values used for each answer | Transparency feature |
| Uncertainty disclosure | Explicitly states what is unknown or uncertain | Honesty mechanism |

### What Sovereign.OS AI does NOT do

| Prohibited function | Enforcement | Source |
| --- | --- | --- |
| Medical diagnosis | Forbidden pattern category | `agent/safety.ts` |
| Psychological diagnosis | Forbidden pattern category | `agent/safety.ts` |
| Prediction of specific future behavior | Forbidden pattern (certainty) | `agent/safety.ts` |
| Guaranteed outcomes | Forbidden pattern (certainty) | `agent/safety.ts` |
| Personality certainty claims | Forbidden pattern (certainty) | `agent/safety.ts` |
| Relationship destiny claims | Forbidden pattern (certainty) | `agent/safety.ts` |
| Hidden profiling | Consent gates + namespace separation | `relational-context.ts` |
| Unauthorized comparison | `requireConsent` before any pair comparison | `relational-context.ts:58-60` |
| Deterministic compatibility scoring | Alignment is structured comparison, never a score | Product design |
| Social scoring | Not a product function | By design |
| Manipulation | Safety layer prohibits manipulative output | `agent/safety.ts` |

### Explicit prohibitions (14+ forbidden pattern categories)

| # | Category | Example |
| --- | --- | --- |
| 1 | Diagnosis | "You have depression" |
| 2 | Claimed motive (for another) | "They did it because they hate you" |
| 3 | Certainty about unknown state | "This will definitely happen" |
| 4 | Personality verdict | "You are a narcissist" |
| 5 | Destiny/prediction | "You will divorce within 2 years" |
| 6 | Mutualized harm | "You both hurt each other equally" |
| 7 | Hidden emotion attribution | "They feel angry even though they say they don't" |
| 8 | Unqualified authority | "As an expert, I can tell you..." |
| 9 | Replacement for professional care | "You don't need a therapist" |
| 10 | Fabricated source | Invented Basis references |
| 11 | Unconsented data use | Using someone's data without consent |
| 12 | Raw sensitive data in model | Birth data sent to AI |
| 13 | Scored/gauged identity | "Your empathy score is 7/10" |
| 14 | Behavioral manipulation | Output designed to manipulate |

## 2. AI transparency

### AI disclosure

Users are informed that:
- They are interacting with AI (Sovereign)
- AI uses their Baseline as a reference, not as deterministic fact
- AI output is interpretive and correctable
- AI shows source details for inspection
- AI explicitly states uncertainty
- AI cannot replace professional medical/psychological care

### User explanation

The product language system ensures users understand:
- Sovereign is a private personal AI for understanding themselves
- Baseline is a private reference, not a diagnosis or score
- Interpretation is correctable — users can review, correct, or reject
- Sources are inspectable via "See source details"
- Relationship/system intelligence requires consent from each person

### Model limitation notice

Sovereign.AI limitations communicated through product design:
- Uses a single model (`@cf/zai-org/glm-4.7-flash`) via Cloudflare AI Gateway
- Model does not have access to raw birth data
- Model does not have memory across sessions (only within thread context)
- Model output is structured by sovereign-answer.v2 contract
- Model output is reviewed by safety layer before delivery
- Model may produce uncertain or incomplete interpretations

## 3. EU AI Act assessment

### Classification

| Criterion | Assessment | Result |
| --- | --- | --- |
| Prohibited AI practices (Art. 5) | No social scoring, no manipulation, no exploitation | NOT PROHIBITED |
| High-risk (Art. 6 + Annex III) | Not in listed high-risk categories (not law enforcement, not critical infrastructure, not employment decision, not credit scoring) | NOT HIGH-RISK |
| General-purpose AI model | Uses Cloudflare Workers AI; Cloudflare bears model-provider obligations | APPLICATION PROVIDER |
| Limited risk / transparency obligation | AI system interacts with humans; transparency required | MINIMAL OBLIGATION |

### Obligations

| Obligation | Status | Implementation |
| --- | --- | --- |
| Transparency — disclose AI interaction | MET | Users know they're using AI |
| Transparency — disclose generated content | MET | Answer structure shows AI output |
| No prohibited practices | MET | Safety layer enforces prohibitions |
| Documentation | MET | AI governance documented |
| Human oversight | MET | User can correct, reject, delete |

### Registration

The EU AI Act may require registration in an EU database for certain AI systems. As a minimal-obligation application provider, Sovereign.OS likely does not require registration. Monitor implementation timeline.

## 4. AI safety controls

### Input safety

| Control | Implementation | Source |
| --- | --- | --- |
| Size limit | 8000 characters | `agent/safety.ts` assertSafeUserInput |
| Input disposition routing | standard/grounded/urgent/secure_refusal | `docs/production-ai-safety-boundary.md` |
| Sensitive data exclusion | Raw birth data, exact location, auth, billing excluded from model | `docs/privacy-model.md` |
| Consent verification | Server-side before any relationship/system context | `relational-context.ts` |

### Output validation

| Control | Implementation | Source |
| --- | --- | --- |
| Zod schema enforcement | sovereign-answer.v2 strict validation | `agent/recognition.ts` |
| Section count enforcement | Mode-specific section requirements | `agent/recognition.ts` |
| Basis ref authorization | Rejects invented/unauthorized references | `agent/recognition.ts:123-126` |
| Safety layer review | 14+ forbidden patterns, paragraph-by-paragraph | `agent/safety.ts` |
| Auto-rewrite | Forbidden patterns rewritten before delivery | `agent/safety.ts` |
| Hard rejection | Unrecoverable patterns rejected entirely | `agent/safety.ts` |

### Moderation

| Control | Implementation | Source |
| --- | --- | --- |
| Pre-delivery safety check | `reviewSovereignOutputSafety` before response | `agent/safety.ts` |
| Post-delivery correction | User can correct any answer | `user_corrections` table |
| Library curation | User decides what to save | Saved understandings |
| Thread cleanup | 30-day retention for unsaved content | `jobs.ts` |

### Refusal patterns

| Input type | Disposition | Response |
| --- | --- | --- |
| Standard question | Standard processing | Full answer with sources |
| Grounded in Baseline | Enhanced context | Baseline-informed answer |
| Urgent/safety concern | Urgent disposition | Safety-aware response |
| Attempt to extract restricted content | Secure refusal | Decline without revealing system details |

### Audit trail

| Event | Recorded | Retention |
| --- | --- | --- |
| AI turn | Usage window tracking | 90 days |
| Safety intervention | Thread events | 30 days (unsaved) |
| User correction | `user_corrections` | Until account deletion |
| Consent decision | `consent_versions` | Until account deletion |
| Provider failure | Capacity ledger | Daily tracking |

## 5. Model lifecycle management

### Current model

| Attribute | Value |
| --- | --- |
| Model | `@cf/zai-org/glm-4.7-flash` |
| Provider | Cloudflare Workers AI |
| Gateway | `sovereign-ai-gateway` |
| Selection authority | Release-controlled (wrangler.jsonc) |

### Model change procedure (recommended)

1. Evaluate new model against safety requirements
2. Test against sovereign-answer.v2 contract
3. Test against safety forbidden patterns
4. Run full verification suite
5. Update wrangler.jsonc model configuration
6. Release through standard production procedure
7. Monitor output quality post-deployment

### Model evaluation gaps

| Gap | Risk | Recommendation |
| --- | --- | --- |
| No automated evaluation pipeline | Medium | Build eval suite for answer quality |
| No bias audit | Medium | Conduct bias assessment before scaling |
| No user feedback analysis loop | Low | Build feedback analysis from corrections |
| No model comparison framework | Low | Create comparison procedure for model changes |

## 6. AI-specific risk register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| AI produces harmful output | Low | High | 14+ forbidden patterns + auto-rewrite |
| AI fabricates sources | Low | Medium | Basis ref authorization rejects invented refs |
| AI leaks sensitive data | Very Low | Critical | Model-safe context reduction; raw data excluded |
| Model provider changes model | Low | Medium | Gateway abstraction; release-controlled selection |
| AI capacity exhaustion | Medium | Low | Daily capacity ledger; fail-closed |
| Regulatory classification change | Low | Medium | Monitor AI Act implementation |

## Source evidence

- `apps/sovereign-worker/src/agent/safety.ts` — safety layer
- `apps/sovereign-worker/src/agent/recognition.ts` — answer contract
- `apps/sovereign-worker/src/agent/sovereign.ts` — intelligence pipeline
- `apps/sovereign-worker/src/relational-context.ts` — consent enforcement
- `docs/privacy-model.md` — data zones
- `docs/production-ai-safety-boundary.md` — input dispositions
- `docs/product-language-system.md` — product language
- `apps/sovereign-worker/wrangler.jsonc` — model configuration
