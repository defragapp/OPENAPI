# Intellectual Property Protection Register

Status: production IP asset inventory

Reviewed: 2026-08-28

This register inventories intellectual property assets owned by Sovereign.OS for launch readiness purposes. It does not constitute legal advice or a representation of registered rights.

## Owned assets

### 1. Product name and branding

| Asset | Type | Current status | Protection |
| --- | --- | --- | --- |
| Sovereign.OS | Product name / brand | In use in production | Common law trademark rights through use; formal registration recommended |
| SOVV | Internal project name / archive reference | In use in repository | Common law rights; low external exposure |
| Sovereign Intelligence | Product feature name | In use in code (`SovereignIntelligenceWorkspace`) | Common law rights through product use |
| Defrag | Personal/brand domain | In use (defrag.app) | Domain registration |
| sovereign.defrag.app | Primary production domain | Active in production | Domain registration |
| app.defrag.app | Authenticated app domain | Active in production | Domain registration |

### 2. Proprietary terminology and frameworks

| Term | Context | Protection |
| --- | --- | --- |
| Baseline Design | Core product concept — private reference built around the person | Proprietary framework; documented in `docs/product-language-system.md` |
| Expression Field | Product object — stable quality vs pressured expression | Proprietary product concept |
| Alignment | Structured comparison lens (not a score) | Proprietary product concept |
| Covenant | Contextual reasoning lens | Proprietary product concept |
| Basis | Internal server name for exact source values | Proprietary internal terminology |
| sovereign-answer.v2 | Answer contract schema | Proprietary interface contract |
| Shadow / Gift | Expression framework terminology | Proprietary product vocabulary |
| Emotional Field Model | Internal explanatory lens (not user-facing name) | Proprietary internal concept |
| Relationship Field | Computed relationship intelligence | Proprietary product concept |
| System Field | Computed system intelligence | Proprietary product concept |

### 3. Source code and architecture

| Asset | Location | Protection |
| --- | --- | --- |
| Full application source code | `apps/`, `packages/` | Copyright; private repository |
| Baseline engine | `apps/sovereign-worker/src/baseline-engine.ts` | Copyright; proprietary computation |
| Sovereign answer contract | `apps/sovereign-worker/src/agent/recognition.ts` | Copyright; proprietary schema |
| Safety layer (14+ forbidden patterns) | `apps/sovereign-worker/src/agent/safety.ts` | Copyright; proprietary output governance |
| Relational consent system | `apps/sovereign-worker/src/relational-context.ts`, `apps/sovereign-worker/src/db/people.ts` | Copyright; proprietary consent architecture |
| D1 migration history (0001–0018) | `apps/sovereign-worker/migrations/` | Copyright; proprietary schema design |
| Typography system | `apps/web/src/typography-system.css` | Copyright; proprietary visual system |
| Production visual authority | `apps/web/src/production-visual-authority-v1.css` | Copyright; proprietary visual system |
| Release orchestrator | `scripts/cloudflare-production-text-release.mjs` | Copyright; proprietary deployment system |
| Verification suite | `scripts/verify-*.mjs` | Copyright; proprietary quality system |

### 4. UX patterns and interaction design

| Pattern | Description | Protection |
| --- | --- | --- |
| Self → People → Systems narrative hierarchy | Product experience progression | Proprietary UX architecture |
| Consent-gated relationship intelligence | Per-scope permission model for relationship data | Proprietary interaction design |
| Baseline-first answer hierarchy | Answer structure: direct answer → relevant sections → source details → correction | Proprietary UX pattern |
| Policy acceptance with canonical hash | Append-only receipt system for Terms/Privacy consent | Proprietary compliance architecture |
| One-room workspace | Single authenticated workspace with navigation rail | Proprietary UX pattern |

### 5. Prompts and AI contracts

| Asset | Description | Protection |
| --- | --- | --- |
| Sovereign system prompt architecture | Prompt construction for Baseline-first answers | Copyright; proprietary |
| sovereign-answer.v2 Zod schema | Structured output contract with section enforcement | Copyright; proprietary |
| Safety forbidden pattern list | 14+ categories with auto-rewrite rules | Copyright; proprietary |
| Model-safe Baseline reduction | Input sanitization and context reduction pipeline | Copyright; proprietary |
| Input disposition routing | standard/grounded/urgent/secure_refusal classification | Copyright; proprietary |

### 6. Database schemas

| Schema | Migration | Protection |
| --- | --- | --- |
| Account/auth schema | 0001–0005 | Copyright; proprietary |
| Baseline storage schema | 0006–0008 | Copyright; proprietary |
| Consent and people schema | 0009–0012 | Copyright; proprietary |
| Policy and privacy schema | 0016–0017 | Copyright; proprietary |
| AI capacity reservations | 0018 | Copyright; proprietary |

## Domain registrations

| Domain | Purpose | Registrar |
| --- | --- | --- |
| sovereign.defrag.app | Public landing + authenticated app | Cloudflare |
| app.defrag.app | Authenticated app alias | Cloudflare |
| defrag.app | Root domain | Cloudflare |

## Protection gaps

| Gap | Risk | Recommended action |
| --- | --- | --- |
| No formal trademark registration | Name/terminology protection relies on common law rights only | File trademark applications for Sovereign.OS and key product terms in relevant jurisdictions |
| No copyright registration | Copyright exists automatically but registration strengthens enforcement | Register copyright for key source code and proprietary frameworks where available |
| No trade secret program | Internal terminology and architecture are in a private repo but no formal trade secret policy | Implement trade secret markings and access controls for proprietary algorithms |
| No IP assignment agreements in repo | Personnel IP assignment is an external legal matter | Ensure founder/contractor IP assignment agreements are executed and stored externally |
| Open-source dependency obligations | Third-party licenses require compliance (see THIRD_PARTY_LICENSE_REPORT.md) | Maintain dependency audit and license compliance program |

## Source evidence

- Repository structure: `apps/`, `packages/`, `scripts/`
- `docs/product-language-system.md` — product terminology authority
- `config/policies.ts` — policy framework
- `apps/sovereign-worker/wrangler.jsonc` — production configuration
- DNS records verified in `FINAL_LIVE_USER_ACCEPTANCE.md`
