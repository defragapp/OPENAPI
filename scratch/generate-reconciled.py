with open('/Users/cjo/.gemini/antigravity-cli/brain/08b62639-5407-4fa4-8b67-3467cc1f826c/sovereign-language-authority-reconciled.md', 'w') as f:
    f.write("""# SOVEREIGN.OS — LANGUAGE AUTHORITY RECONCILIATION

## 1. SOURCE AUTHORITY
| Source | Authority | Scope | Can define wording? | Can constrain wording? | Historical? |
| ------ | --------- | ----- | ------------------- | ---------------------- | ----------- |
| `docs/product-language-system.md` | Primary | UI language, voice, sequence | Yes | Yes | No |
| `docs/launch-product-contract.md` | Primary | Included product/approval boundary | Yes | Yes | No |
| `docs/inner-recognition-intelligence.md` | Primary | Intelligence, answer, Basis behavior | Yes | Yes | No |
| `docs/legal/AI_GOVERNANCE.md` | Governance | Comm boundary, tone, prohibited claims | No | Yes | No |
| `agent/prompt-v1.ts` & `agent/safety.ts` | Implementation | Active AI output & safety rules | No | Yes | No |
| `docs/legal/BRAND_PROTECTION_POLICY.md` | Brand | Public boundary, disallowed metaphors | No | Yes | No |
| `docs/v0-visual-port-contract.md` & visual docs | Visual | Presentation & sequence constraints | No | Yes | No |
| `.junie/agents/ai-quality.md` | Quality | Output tone, naturalness, structure | No | Yes | No |
| `tasks/00-GOAL.md` & `tasks/02-VISUAL-AUDIT.md` | Historical | Context / evidence only | No | No | Yes |

*Conflict Rule: Primary authorities govern wording. Governance/Brand documents constrain it. If a supporting document or recent PR contradicts `product-language-system.md`, it is a defect (Active Drift).*

## 2. PRODUCT TRUTH
Sovereign.OS is a Baseline-first AI platform for **self-exploration, relationship intelligence, and system intelligence**. It begins with a private Baseline (a stable, explorable reference), adds temporary current conditions, and expands to consented relationships and systems without reducing the user to a type, score, or diagnosis.

## 3. LOCKED LANGUAGE
- `Healing isn’t optional. Holding onto the pain is.`
- `Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.`
- `Most AI starts with the prompt. Sovereign starts with you.`
- `Know yourself. Understand your people. See the whole system.`
- `See why the same moment lands differently—and how to bridge the gap.`
- `Ask about what you actually want to understand.` (Capability heading)
- `Build your Baseline once, then explore how you think, decide, communicate, create, connect, respond under pressure, and change.`
- `Start free. Build your Baseline, then explore what you want to understand next.`

## 4. APPROVED VOCABULARY
- **Baseline:** A private reference built around you.
- **Active now:** A temporary layer.
- **Shadow:** How a valid quality may narrow/distort under pressure.
- **Gift:** What the same quality makes possible with awareness.
- **Alignment:** Examining fit, not a score.
- **Sources / See source details:** The user-facing label for internal "Basis".

## 5. VOICE
Clear, adult, calm, specific, direct, unforced. State the human question, then useful understanding, then deeper context, and finally source/framework detail. Do not force technical machinery or explanations of how to use the app in front of the actual value.

## 6. TONE
- **Self-Exploration:** Make room for curiosity; do not imply defect.
- **Relationships:** Make complexity understandable without turning every interaction into conflict, blame, or repair.
- **Systems:** Keep participants distinct; explain roles and pressure without locking people into fixed identities.
- **Safety:** Concrete, boundary-focused, non-clinical.

## 7. UX LANGUAGE RULES
- Do not make every interaction an "action plan." 
- Avoid hedging with "may" everywhere—be direct for user-supplied facts, interpretive for Baseline, and conditional for relationships.
- Do not let "system intelligence" become architect-facing language in normal UI.
- Use explicit sources beneath the UI, only when asked.

## 8. AI ANSWER VOICE
- **Rhythm:** Cohesive adult prose. Do not march through a fixed checklist merely because a mode supports those fields.
- **Certainty:** Do not claim motives, exact emotions, or predict futures. 
- **Structure:** Direct answer first -> 2-5 relevant sections -> quiet source details -> relevant actions -> concise correction prompt.

## 9. MARKETING LANGUAGE
- **Category:** `Private personal AI for real life.`
- **Differentiation:** `Most AI starts with the prompt. Sovereign starts with you.`
- **Tone:** Adult, emotionally literate, restrained. NOT a generic chatbot or therapy tool.

## 10. SAFETY LANGUAGE
Do not allow safety behavior to make Sovereign sound like a compliance bot. Responses must sound human, concise, boundary-focused, non-clinical, non-institutional, and non-repetitive. Do not use excessive disclaimers.

## 11. PROHIBITED LANGUAGE
- **Diagnosis:** `diagnos*`, `narcissistic`, `borderline`, `bipolar`, `personality disorder`.
- **Claimed Motive:** `they secretly want`, `he feels`.
- **Absent Person Profile:** `they are avoidant`, `your mother is toxic`, `dysregulated`.
- **Projection as Fact:** `is clearly projecting`.
- **Fixed Family Role:** `the scapegoat`, `golden child`, `family fixer`.
- **Family Blame:** `past generations caused this`, `your parents made you`.
- **Spiritual Causation:** `literal curse`, `the universe is forcing`, `low frequency`.
- **Baseline as Proof:** `your chart says`, `this transit means`.
- **Clinical Jargon:** `overfunctioning`, `system anxiety`, `burdened protector`, `your inner child is wounded`.
- **Therapy Claim:** `this will heal your trauma`, `as your therapist`.
- **Unsupported Directive:** `you must confront`, `cut them off`.
- **Institutional Tone:** `as an ai`, `the subject presents`.

## 12. RETIRED LANGUAGE
- `foundation` / `personal foundation` / `one private foundation`
- `Ask about your life.` / `Ask about your life. Get an answer built around you.`
- `What do you want to understand?`
- `Bring the question you already have.`
- `Ask anything.` / `Tell me what's on my mind.`
- `healing journey` / `unlock your potential` / `break the cycle`

## 13. INTERNAL LANGUAGE
*(Do not use in public UI)* `Capacity`, `Basis`, `model context`, `evidence levels`, `source layers`, `server-confirmed state`, `authorization vocabulary`, `source_computing`, `facet profile`, `interpretive uncertainty`, `permitted perspectives`, `confirmed responsibilities`, `emotional vector`.

## 14. ACTIVE DRIFT
- `Inquire about what you actually want to understand.` (A mechanical replacement for `Ask about what you actually want to understand.`).
- `Build your private Baseline intelligence, then explore what you want to understand next.` (Mixes terms and is mechanical).
- `Explore {selected.label.toLowerCase()} ->` (Awkward mechanical patch replacing `Ask about...`).

## 15. STRONG PROPOSALS
- `Start with what you actually want to understand.` (A potential substitute for `Ask about...` if `Ask` is globally suppressed, but currently `Ask about what you actually want to understand` is canonical for the heading).
- `{selected.label}` (Instead of `Explore {selected.label} ->`).

## 16. UNRESOLVED
- The exact prompt replacement for "Ask about..." / "Inquire about..." / "Explore..." in the chat composer input placeholder (`apps/web/src/SovereignIntelligenceWorkspace.tsx:1874`).
- Phrases like "Make it yours", "Bring more of your life into the picture", and "Start with yourself" (Approved contextually in *How it Works*, but not universally resolved as global CTA language).
""")
