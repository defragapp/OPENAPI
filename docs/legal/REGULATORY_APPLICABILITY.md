# Regulatory Applicability Assessment

Status: production regulatory mapping

Reviewed: 2026-08-28

This document assesses which data protection and consumer regulations apply to Sovereign.OS based on its current product design, deployment infrastructure, and user base. It is an engineering assessment, not legal advice.

## Product characteristics relevant to regulation

| Characteristic | Current state |
| --- | --- |
| Product type | Private personal AI platform |
| Deployment | Cloudflare Workers (global edge) |
| Data storage | Cloudflare D1 (Cloudflare infrastructure) |
| User authentication | Email + magic link/code + passkey |
| Sensitive data | Birth date/time/place (hashed), relationship data, AI conversations |
| Payment processing | Stripe subscriptions |
| Transactional email | Resend |
| AI inference | Cloudflare Workers AI via AI Gateway |
| Age gate | 18+ launch eligibility |
| Tracking | No analytics/ad trackers |
| Data export | On-demand authenticated JSON export |
| Deletion | 14-day grace, comprehensive table deletion |

## Regulatory framework assessment

### GDPR (EU General Data Protection Regulation)

**Applicability**: Likely applicable if any EU/EEA residents use the product.

| GDPR requirement | Current implementation | Gap |
| --- | --- | --- |
| Lawful basis for processing (Art. 6) | Consent at signup (Terms/Privacy acceptance) | No explicit legal basis enumeration in privacy policy |
| Consent requirements (Art. 7) | Separate Terms/Privacy receipts with hash, version, SHA | Implemented |
| Right of access (Art. 15) | `POST /api/v1/account/export` | Implemented |
| Right to rectification (Art. 16) | User corrections recorded | Partial — corrections stored but no explicit rectification workflow for Baseline data |
| Right to erasure (Art. 17) | Comprehensive deletion workflow | Implemented |
| Right to data portability (Art. 20) | JSON export with 22 data categories | Implemented (machine-readable JSON) |
| Right to object (Art. 21) | No automated decision-making profiling | Low risk — Baseline is interpretive, not deterministic profiling |
| Data protection by design (Art. 25) | Privacy model with data zones, consent gates, model-safe reduction | Implemented |
| Breach notification (Art. 33-34) | Incident response runbook exists | No explicit timeline commitment in privacy policy |
| Data Protection Officer (Art. 37-38) | Not designated | Assess requirement; likely not mandatory for single-operator |
| EU representative (Art. 27) | Not designated | Required if processing EU data without EU establishment |
| International transfers (Art. 44-49) | Not documented | Cloudflare processes data globally; SCCs or adequacy needed |
| Records of processing (Art. 30) | Data flow register exists | Internal record exists; formal ROPA format recommended |
| DPIA (Art. 35) | Not performed | Recommended for AI + sensitive personal data |

**Overall GDPR readiness**: PARTIAL — core rights implemented; documentation and formal mechanisms need completion.

### CCPA / CPRA (California Consumer Privacy Rights Act)

**Applicability**: Applicable if the business meets thresholds (revenue, data volume, or revenue from selling/sharing data). Current single-operator product likely below thresholds, but may grow.

| CPRA requirement | Current implementation | Gap |
| --- | --- | --- |
| Right to know | Account export covers all data | Implemented |
| Right to delete | Comprehensive deletion workflow | Implemented |
| Right to opt-out of sale/sharing | No sale or sharing occurs | Document "no sale" statement |
| Right to correct | Corrections recorded | Implemented |
| Right to limit use of sensitive PI | Sensitive data (birth info) hashed, never in model context | Implemented by design |
| Non-discrimination | No tiered service based on rights exercise | Implemented |
| Privacy policy disclosures | Privacy policy exists | Add CPRA-specific disclosures if thresholds met |
| "Do Not Sell or Share My Personal Information" link | Not present | Add if CPRA thresholds met |

**Overall CPRA readiness**: LOW RISK — product design is privacy-forward; formal compliance needed only if thresholds are met.

### Children's data (COPPA / Age eligibility)

**Applicability**: COPPA applies to services directed at children under 13. Sovereign.OS has an 18+ eligibility rule.

| Requirement | Current implementation | Gap |
| --- | --- | --- |
| Age gate at signup | 18+ explicit confirmation required | Implemented |
| Version-tracked eligibility | `eligibility_rule_version` stored | Implemented |
| No directed-at-children design | Product is personal AI for adults; sensitive content | By design |
| Verifiable parental consent | Not applicable (18+ product) | N/A |

**Overall COPPA readiness**: COMPLIANT — 18+ gate is appropriate for the product.

### ePrivacy Directive / Regulation (EU)

**Applicability**: Applicable if EU users access the service (cookie/electronic storage rules).

| Requirement | Current implementation | Gap |
| --- | --- | --- |
| Consent for non-essential cookies | Only essential cookies/storage used | No cookie banner needed for strictly necessary storage |
| Cookie disclosure | First-party storage documented in privacy data flow register | Implemented |
| No tracking without consent | Analytics tests enforce no trackers | Implemented |

**Overall ePrivacy readiness**: COMPLIANT — only strictly necessary storage is used.

### AI-specific regulation (EU AI Act)

**Applicability**: The EU AI Act classifies AI systems by risk. Sovereign.OS provides personal interpretive AI, not high-risk AI.

| Requirement | Current implementation | Gap |
| --- | --- | --- |
| Risk classification | Interpretive, not diagnostic; not high-risk | Likely minimal-risk or limited-obligation |
| Transparency | User knows they're interacting with AI; source details available | Implemented |
| Prohibited practices | No social scoring, no manipulation, no exploitation | Safety layer enforces forbidden patterns |
| General-purpose AI model obligations | Uses Cloudflare Workers AI (provider manages model obligations) | Cloudflare bears model-provider obligations |
| Documentation | AI governance document exists | `docs/legal/AI_GOVERNANCE.md` |

**Overall AI Act readiness**: LOW RISK — product is interpretive, not high-risk; transparency is maintained.

### Consumer protection (FTC / state consumer laws)

**Applicability**: US consumer protection laws apply to commercial products.

| Requirement | Current implementation | Gap |
| --- | --- | --- |
| Truthful advertising | Product language system governs claims | Implemented |
| Clear pricing | Free/Plus plans with Stripe checkout | Implemented |
| No unfair/deceptive practices | Consent-gated data use; no hidden tracking | Implemented |
| Refund policy | Not documented | GAP — see LEGAL_READINESS_MATRIX.md |
| Terms of service | Present at signup | GAP — missing liability limitation, governing law |
| Automatic renewal disclosure | Subscription cancellation available | Verify renewal disclosure meets state requirements |

**Overall consumer protection readiness**: PARTIAL — core protections in place; formal policies need completion.

## Infrastructure provider regulatory posture

| Provider | Relevant certifications | Sovereign.OS reliance |
| --- | --- | --- |
| Cloudflare | SOC 2 Type II, ISO 27001, GDPR DPA available | Primary infrastructure; DPA should be executed |
| Stripe | SOC 2 Type II, PCI DSS Level 1 | Payment processing; Stripe DPA/SSA governs |
| Resend | SOC 2 (in progress/available) | Email delivery; DPA should be verified |
| NASA/JPL | US government public API | Astronomical data; public use terms |

## Priority actions for regulatory readiness

### Before serving EU users

1. Add legal basis enumeration to privacy policy
2. Document international data transfer mechanism (SCCs)
3. Assess whether EU representative is required (Art. 27)
4. Conduct DPIA for AI + sensitive personal data processing
5. Execute Cloudflare DPA

### Before scaling US user base

6. Add refund policy
7. Add governing law and dispute resolution to Terms
8. Assess CPRA threshold applicability
9. Add "no sale of personal information" statement
10. Verify automatic renewal disclosure compliance

### Ongoing

11. Monitor AI Act implementation timeline and obligations
12. Maintain data flow register as provider/path changes occur
13. Review retention periods against evolving guidance
14. Track state privacy law developments (Colorado, Virginia, Connecticut, etc.)

## Source evidence

- `config/policies.ts` — eligibility and policy configuration
- `apps/sovereign-worker/src/privacy-rights.ts` — privacy rights implementation
- `apps/sovereign-worker/src/jobs.ts` — deletion and retention
- `apps/sovereign-worker/src/auth-public.ts` — age gate
- `docs/privacy-data-flow-register.md` — data flow register
- `docs/privacy-model.md` — privacy model
- `docs/security/soc2-readiness-controls.md` — SOC 2 readiness
- `apps/sovereign-worker/wrangler.jsonc` — infrastructure configuration
