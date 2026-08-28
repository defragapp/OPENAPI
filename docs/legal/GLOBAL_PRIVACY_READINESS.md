# Global Privacy Readiness

Status: international privacy framework assessment

Reviewed: 2026-08-28

This document evaluates Sovereign.OS readiness for international privacy regulations beyond US state laws.

## GDPR (EU General Data Protection Regulation)

### Applicability assessment

GDPR applies if Sovereign.OS:
- Has an establishment in the EU, OR
- Processes personal data of EU residents in connection with offering services to them, OR
- Monitors behavior of EU individuals

**Current assessment**: If any EU resident signs up for Sovereign.OS, GDPR likely applies under the "offering services" criterion (product is accessible via the internet to EU users).

### Lawful basis

| Processing activity | Lawful basis | Notes |
| --- | --- | --- |
| Account creation | Contract (Art. 6(1)(b)) | Necessary to provide the service |
| Baseline computation | Contract (Art. 6(1)(b)) | Core product functionality |
| AI inference | Contract (Art. 6(1)(b)) | Core product functionality |
| Payment processing | Contract (Art. 6(1)(b)) | Necessary for subscription |
| Transactional email | Contract (Art. 6(1)(b)) | Necessary for authentication |
| Security/rate limiting | Legitimate interest (Art. 6(1)(f)) | Fraud prevention, security |
| Policy consent records | Legal obligation (Art. 6(1)(c)) | Consent audit evidence |
| Birth data (sensitive) | Explicit consent (Art. 9(2)(a)) | Sensitive personal data |

**Gap**: These lawful bases are not currently enumerated in the privacy policy.

### Consent requirements

| Requirement | Current implementation | Gap |
| --- | --- | --- |
| Freely given | Yes — not bundled with other terms | None |
| Specific | Yes — separate Terms/Privacy receipts | None |
| Informed | Yes — privacy policy linked at signup | None |
| Unambiguous | Yes — affirmative acceptance required | None |
| Withdrawable | Yes — deletion + consent revocation | None |
| Recorded | Yes — append-only receipts with hash | None |
| Granular | Yes — separate Terms and Privacy | None |

### Data Protection Agreement (DPA)

| Processor | DPA available | Status |
| --- | --- | --- |
| Cloudflare | Yes — Cloudflare DPA | Needs execution |
| Stripe | Yes — included in SSA | Verify |
| Resend | Needs verification | Contact Resend |
| NASA/JPL | N/A — public API | N/A |

### Subprocessors

| Subprocessor | Purpose | GDPR role | Listed |
| --- | --- | --- | --- |
| Cloudflare | Infrastructure | Processor | Needs listing |
| Stripe | Payments | Processor | Needs listing |
| Resend | Email | Processor | Needs listing |
| Cloudflare AI | Inference | Sub-processor | Needs listing |
| NASA/JPL | Astronomy | N/A (no personal data) | N/A |

**Gap**: Privacy policy does not list subprocessors.

### International transfers

| Transfer | Mechanism needed | Current status |
| --- | --- | --- |
| EU user → Cloudflare (global) | SCCs or adequacy | Not documented |
| EU user → Stripe (US) | SCCs or adequacy | Not documented |
| EU user → Resend (US) | SCCs or adequacy | Not documented |

**Gap**: No international transfer mechanism documented. Cloudflare's DPA includes SCCs; this should be referenced.

### Data Protection Impact Assessment (DPIA)

A DPIA is recommended because Sovereign.OS:
- Processes sensitive personal data (birth information)
- Uses AI/automated decision-making for interpretation
- Processes relationship data with consent gates

**Gap**: No formal DPIA conducted.

### EU Representative (Art. 27)

Required if processing EU data without an EU establishment.

**Assessment**: Single-operator product; likely required if EU users are served.

**Gap**: No EU representative designated.

### Breach notification

| Requirement | GDPR timeline | Current implementation |
| --- | --- | --- |
| Supervisory authority notification | 72 hours | Incident runbook exists; no timeline commitment |
| Data subject notification | Without undue delay | No timeline commitment |

**Gap**: No breach notification timeline in privacy policy.

## UK GDPR

### Applicability

UK GDPR applies separately from EU GDPR post-Brexit. If UK residents use the service, UK GDPR applies with the UK ICO as supervisory authority.

### UK-specific requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| UK representative | Not designated | Required if no UK establishment |
| ICO notification | Not registered | May be required |
| UK SCCs (IDTA) | Not documented | Needed for transfers to US |
| Breach notification to ICO | 72 hours | Same as EU GDPR |

**Assessment**: UK GDPR requirements largely mirror EU GDPR. Same gaps apply.

## Canada (PIPEDA)

### Personal Information Protection and Electronic Documents Act

**Applicability**: Applies to commercial activities in Canada, or to organizations that collect/use/disclose personal information in the course of commercial activity.

### PIPEDA requirements

| Requirement | Current implementation | Status |
| --- | --- | --- |
| Consent for collection/use/disclosure | Explicit consent at signup | IMPLEMENTED |
| Identifying purposes | Privacy policy discloses purposes | IMPLEMENTED |
| Limiting collection | Only necessary data collected | BY DESIGN |
| Limiting use/disclosure | Used only for disclosed purposes | BY DESIGN |
| Accuracy | User can correct data | IMPLEMENTED |
| Safeguards | Security controls implemented | IMPLEMENTED |
| Openness | Privacy policy publicly available | IMPLEMENTED |
| Individual access | Account export available | IMPLEMENTED |
| Challenge compliance | Contact email available | IMPLEMENTED |

**Assessment**: PIPEDA compliance is largely achieved by the product's privacy-forward design.

### Canada's Consumer Privacy Protection Act (CPPA) — proposed

If enacted, CPPA would replace PIPEDA with stronger requirements similar to GDPR. Current design positions Sovereign.OS well for compliance.

## Australia (Privacy Act)

### Applicability

Australian Privacy Principles apply to organizations with annual turnover > AUD 3 million, or that trade in personal information, or that are credit reporting bodies.

**Assessment**: Single-operator product likely below threshold. Product design is compatible with APP requirements.

## Cross-jurisdiction summary

| Jurisdiction | Applicability | Readiness | Key gaps |
| --- | --- | --- | --- |
| EU (GDPR) | Likely if EU users | PARTIAL | DPA, subprocessor list, transfer mechanism, DPIA, representative |
| UK (UK GDPR) | Likely if UK users | PARTIAL | Same as EU + UK representative, ICO |
| Canada (PIPEDA) | Likely if Canadian users | HIGH | Minor documentation gaps |
| Australia (Privacy Act) | Threshold-based | LOW RISK | Below threshold likely |
| Brazil (LGPD) | Possible if Brazilian users | PARTIAL | Similar to GDPR gaps |
| Japan (APPI) | Possible if Japanese users | PARTIAL | Similar gaps |

## Priority actions for international compliance

### Before serving EU/UK users

1. Execute Cloudflare DPA (includes SCCs for international transfers)
2. Add subprocessor list to privacy policy
3. Add lawful basis enumeration to privacy policy
4. Add breach notification timeline to privacy policy
5. Assess whether EU/UK representative is required
6. Conduct DPIA for AI + sensitive data processing
7. Verify Stripe and Resend DPA status

### Before serving Canadian users

8. Verify PIPEDA compliance language in privacy policy
9. Add Canadian-specific disclosures if required

### Ongoing

10. Monitor regulatory developments in all active jurisdictions
11. Review international transfer mechanisms when SCCs are updated
12. Track adequacy decisions that may simplify transfer requirements

## Source evidence

- `config/policies.ts` — consent configuration
- `apps/sovereign-worker/src/privacy-rights.ts` — privacy operations
- `docs/privacy-data-flow-register.md` — data flows
- `docs/privacy-model.md` — privacy model
- `docs/security/soc2-readiness-controls.md` — security controls
- `docs/legal/VENDOR_REGISTER.md` — vendor assessment
