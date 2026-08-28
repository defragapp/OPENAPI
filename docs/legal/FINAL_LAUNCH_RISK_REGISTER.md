# Final Launch Risk Register

Status: production launch risk assessment

Reviewed: 2026-08-28

This register consolidates all identified risks across legal, privacy, security, AI, brand, payments, operations, and compliance domains. Each risk is assessed for likelihood, impact, and current mitigation.

## Risk scoring

- **Likelihood**: 1 (rare) → 5 (almost certain)
- **Impact**: 1 (negligible) → 5 (critical)
- **Risk score**: Likelihood × Impact (1–25)
- **Rating**: 1–6 Low, 7–12 Medium, 13–19 High, 20–25 Critical

## Legal risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L-01 | Terms missing limitation of liability | 3 | 4 | 12 | MEDIUM | Terms exist but lack clause | Add limitation of liability to Terms |
| L-02 | Terms missing governing law / dispute resolution | 3 | 3 | 9 | MEDIUM | Terms exist but lack clause | Add governing law to Terms |
| L-03 | No refund policy published | 2 | 3 | 6 | LOW | Stripe handles payment disputes | Publish refund policy |
| L-04 | No acceptable use policy (standalone) | 2 | 3 | 6 | LOW | Safety layer + Terms cover abuse | Consider standalone AUP |
| L-05 | No IP ownership clause in Terms | 2 | 4 | 8 | MEDIUM | Copyright exists automatically | Add IP ownership clause |
| L-06 | No formal IP assignment agreements in repo | 2 | 4 | 8 | MEDIUM | Single founder; external agreements | Execute and store externally |

## Privacy risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P-01 | No international data transfer mechanism | 3 | 4 | 12 | MEDIUM | Cloudflare DPA available | Execute DPA; document SCCs if needed |
| P-02 | No GDPR legal basis enumeration | 3 | 3 | 9 | MEDIUM | Consent collected at signup | Add legal basis to privacy policy |
| P-03 | No DPO or EU representative | 2 | 3 | 6 | LOW | Single operator; assess requirement | Assess Art. 27 requirement |
| P-04 | No breach notification timeline | 2 | 4 | 8 | MEDIUM | Incident runbook exists | Add timeline commitment to privacy policy |
| P-05 | No DPIA performed | 2 | 3 | 6 | LOW | Privacy-by-design implemented | Conduct DPIA before EU users |
| P-06 | No formal ROPA (records of processing) | 2 | 2 | 4 | LOW | Data flow register exists | Formalize as ROPA |

## Security risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-01 | No external penetration test | 2 | 4 | 8 | MEDIUM | Source-level security verified; release gates | Schedule pen test |
| S-02 | No cyber insurance | 2 | 4 | 8 | MEDIUM | N/A | Evaluate cyber liability insurance |
| S-03 | No formal risk assessment | 2 | 3 | 6 | LOW | Security controls implemented | Document formal risk assessment |
| S-04 | No business continuity plan | 2 | 4 | 8 | MEDIUM | Cloudflare infrastructure; release recovery | Document BCP/RTO/RPO |
| S-05 | Single operator dependency | 3 | 4 | 12 | MEDIUM | All credentials controlled by owner | Document key-person contingency |
| S-06 | No automated license checker for transitive deps | 2 | 2 | 4 | LOW | Direct deps all permissive | Add license checker to CI |

## AI risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-01 | No evaluation pipeline for model quality | 3 | 3 | 9 | MEDIUM | Safety layer + answer contract | Build eval pipeline |
| A-02 | No model update procedure | 2 | 3 | 6 | LOW | Model is release-controlled | Document model change procedure |
| A-03 | No bias audit | 2 | 3 | 6 | LOW | Interpretive (not diagnostic); uncertainty tracked | Conduct bias assessment |
| A-04 | No user feedback analysis loop | 2 | 2 | 4 | LOW | Corrections recorded | Build feedback analysis |
| A-05 | Provider model change without notice | 2 | 3 | 6 | LOW | AI Gateway abstraction; release-controlled model | Monitor Cloudflare AI model updates |

## Brand risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-01 | No trademark registration | 3 | 4 | 12 | MEDIUM | Common law rights through use | File trademark applications |
| B-02 | "Sovereign" name conflict with existing marks | 2 | 3 | 6 | LOW | .OS suffix + AI context differentiates | Conduct trademark search |
| B-03 | No brand guidelines document | 2 | 2 | 4 | LOW | Product language system + visual authority | Create brand guidelines |
| B-04 | Social media handles not secured | 2 | 2 | 4 | LOW | No social presence yet | Secure key handles |

## Payment risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PAY-01 | Stripe account suspension | 1 | 5 | 5 | LOW | Compliant use; webhook verification | Maintain Stripe compliance |
| PAY-02 | Webhook endpoint exposure | 1 | 4 | 4 | LOW | HMAC-SHA256 signature verification | Monitor Stripe API changes |
| PAY-03 | No automatic renewal disclosure compliance | 2 | 3 | 6 | LOW | Cancellation available | Verify state-law renewal disclosure |

## Operational risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| O-01 | Cloudflare platform dependency | 2 | 5 | 10 | MEDIUM | Full infrastructure on Cloudflare | Document exit strategy |
| O-02 | No status page for incident communication | 2 | 3 | 6 | LOW | /health and /ready endpoints | Consider status page |
| O-03 | No support ticketing system | 2 | 2 | 4 | LOW | Email-based support | Implement support inbox when scaling |
| O-04 | No SLA or uptime commitment | 2 | 2 | 4 | LOW | Cloudflare SLA covers infrastructure | Document availability target |

## Compliance risks

| ID | Risk | L | I | Score | Rating | Current mitigation | Remaining action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | CPRA threshold met without compliance | 1 | 4 | 4 | LOW | Privacy-forward design | Monitor thresholds |
| C-02 | EU AI Act obligations unclear | 2 | 2 | 4 | LOW | Interpretive AI; not high-risk | Monitor AI Act implementation |
| C-03 | State privacy law proliferation | 2 | 2 | 4 | LOW | GDPR/CPRA-ready design | Track state law developments |
| C-04 | No SOC 2 certification | 2 | 2 | 4 | LOW | SOC 2 readiness controls documented | Formal audit when needed |

## Risk summary

| Rating | Count | Categories |
| --- | --- | --- |
| Critical (20–25) | 0 | — |
| High (13–19) | 0 | — |
| Medium (7–12) | 9 | L-01, L-02, L-05, L-06, P-01, P-04, S-01, S-02, S-04, S-05, B-01 |
| Low (1–6) | 17 | All remaining |

## Top 5 risks requiring owner action before scaling

1. **L-01 / P-01 (score 12)**: Add limitation of liability to Terms; execute Cloudflare DPA for international users
2. **S-05 (score 12)**: Document key-person contingency for single-operator risk
3. **B-01 (score 12)**: File trademark application for Sovereign.OS
4. **O-01 (score 10)**: Document Cloudflare exit strategy for business continuity
5. **L-02 / P-04 (score 8–9)**: Add governing law to Terms; add breach notification timeline to privacy policy

## Risk acceptance statement

No risks are rated Critical or High. All Medium risks have existing technical mitigations and require documentation/policy completion rather than architectural changes. The product is technically sound; the remaining risks are in the legal, compliance, and business documentation layer.

## Source documents

- `docs/legal/LEGAL_READINESS_MATRIX.md` — legal gaps
- `docs/legal/PRIVACY_RIGHTS_AUDIT.md` — privacy implementation
- `docs/legal/REGULATORY_APPLICABILITY.md` — regulatory mapping
- `docs/legal/SECURITY_BUSINESS_READINESS.md` — security posture
- `docs/legal/AI_GOVERNANCE.md` — AI governance
- `docs/legal/BRAND_PROTECTION.md` — brand audit
- `docs/legal/VENDOR_REGISTER.md` — vendor dependencies
- `docs/legal/CUSTOMER_OPERATIONS.md` — customer operations
- `docs/security/soc2-readiness-controls.md` — SOC 2 readiness
