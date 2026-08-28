# Privacy Compliance Operating Model

Status: US privacy compliance framework

Reviewed: 2026-08-28

This document establishes the operating model for US privacy law compliance, covering federal and state requirements.

## Applicable US privacy laws

### California Consumer Privacy Act / CPRA

**Applicability thresholds** (meet any one):
- Annual gross revenue > $25 million
- Annual buy/sell/share of personal information of 100,000+ consumers/households
- 50%+ revenue from selling/sharing personal information

**Current assessment**: Sovereign.OS likely below all thresholds as a single-operator launch. However, the product is designed to meet CPRA requirements by default.

### State privacy laws

| State | Law | Status | Applicability |
| --- | --- | --- | --- |
| California | CCPA/CPRA | Effective | Threshold-based; designed for compliance |
| Colorado | CPA | Effective July 2023 | Threshold-based |
| Virginia | VCDPA | Effective January 2023 | Threshold-based |
| Connecticut | CTDPA | Effective July 2023 | Threshold-based |
| Utah | UCPA | Effective December 2023 | Threshold-based |
| Texas | TDPSA | Effective July 2024 | Threshold-based |
| Oregon | OCPA | Effective July 2024 | Threshold-based |
| Montana | MTCDPA | Effective October 2024 | Threshold-based |
| Iowa | Iowa CDPL | Effective January 2025 | Threshold-based |
| Tennessee | TIPA | Effective July 2025 | Threshold-based |

**General applicability**: Most state laws apply based on processing volume or revenue thresholds that a single-operator product is unlikely to meet initially. However, the product design follows the most restrictive standards (CPRA/GDPR) as a baseline.

## Consumer rights implementation

### Right to know / access

| Requirement | Implementation | Status |
| --- | --- | --- |
| User can request their data | `POST /api/v1/account/export` | IMPLEMENTED |
| Machine-readable format | JSON with `sovereign-private-account-export.v1` contract | IMPLEMENTED |
| Covers all data categories | 22 tables queried | IMPLEMENTED |
| Delivered within timeframe | On-demand, immediate | IMPLEMENTED |
| No fee for request | Free, authenticated | IMPLEMENTED |

**Data categories disclosed in privacy policy**:
- Account information (email, creation date)
- Baseline data (hashed birth information, facet profile)
- Intelligence data (threads, answers, corrections)
- Relationship data (people, consent, systems)
- Library data (saved understandings)
- Policy acceptance history
- Billing state (plan, subscription)
- AI usage (turn counts)

### Right to delete

| Requirement | Implementation | Status |
| --- | --- | --- |
| User can request deletion | Deletion workflow in UI | IMPLEMENTED |
| Grace period | 14 days | IMPLEMENTED |
| Cancellation during grace | `cancelDeletion` endpoint | IMPLEMENTED |
| Comprehensive deletion | 20+ tables cleaned | IMPLEMENTED |
| Subscription cancelled first | Stripe cancellation before deletion | IMPLEMENTED |
| Confirmation provided | Email notification on completion | IMPLEMENTED |

### Right to correct

| Requirement | Implementation | Status |
| --- | --- | --- |
| User can correct data | User corrections on answers | IMPLEMENTED |
| Corrections recorded | `user_corrections` table | IMPLEMENTED |
| Library save option | `saved_to_library` flag | IMPLEMENTED |

### Right to opt-out of sale/sharing

| Requirement | Implementation | Status |
| --- | --- | --- |
| No sale of personal information | Product does not sell data | BY DESIGN |
| No sharing for cross-context behavioral advertising | No ad trackers; no behavioral advertising | BY DESIGN |
| "Do Not Sell" link | Not required (no sale occurs) | Document in privacy policy |

### Right to data portability

| Requirement | Implementation | Status |
| --- | --- | --- |
| Machine-readable export | JSON format | IMPLEMENTED |
| Complete coverage | 22 data categories | IMPLEMENTED |
| No fee | Free, authenticated | IMPLEMENTED |
| Timely delivery | On-demand | IMPLEMENTED |

### Right to non-discrimination

| Requirement | Implementation | Status |
| --- | --- | --- |
| No service degradation for exercising rights | All rights available to all users | IMPLEMENTED |
| No price discrimination | Same pricing regardless of rights exercise | IMPLEMENTED |

## Privacy notice requirements

### Required disclosures

| Disclosure | Current status | Location |
| --- | --- | --- |
| Categories of PI collected | Documented | Privacy policy |
| Purposes of collection | Documented | Privacy policy |
| Categories of third parties | Documented | Privacy policy, data flow register |
| Retention periods | Documented | Privacy policy, data flow register |
| Consumer rights | Documented | Privacy policy |
| How to exercise rights | Documented | Privacy policy, account export |
| Contact information | Documented | Privacy policy, security.txt |
| Effective date | Documented | Privacy policy |
| Changes notification | Documented | Privacy policy (re-presentation) |

### Gaps to address

| Gap | Risk | Action |
| --- | --- | --- |
| No "Do Not Sell" statement | Low (no sale occurs) | Add explicit "we do not sell" statement |
| No state-specific rights listing | Medium if thresholds met | Add comprehensive rights listing |
| No breach notification timeline | Medium | Add timeline commitment |
| No DPO contact | Low | Add privacy contact email |

## Operational procedures

### Processing privacy requests

| Request type | Method | Response time | Verification |
| --- | --- | --- | --- |
| Access/export | `POST /api/v1/account/export` | Immediate | Authenticated |
| Deletion | UI workflow | 14-day grace | Authenticated |
| Correction | In-app corrections | Immediate | Authenticated |
| Consent revocation | In-app consent management | Immediate | Authenticated |
| Policy questions | Email to info@sovereign.defrag.app | Reasonable | N/A |

### Verification of identity

All privacy requests require authentication. This satisfies identity verification requirements because:
- Only the account holder can access their data
- Authentication uses HMAC-SHA256 sessions with `__Host-` cookies
- Passkey option provides phishing-resistant verification
- Same-origin enforcement prevents CSRF

### Record keeping

| Record | Retention | Purpose |
| --- | --- | --- |
| Privacy request events | With account | Audit evidence |
| Policy acceptance receipts | With pseudonymized account | Consent evidence |
| Export requests | 90 days (audit metadata) | Compliance evidence |
| Deletion requests | With pseudonymized account | Deletion evidence |

## Sensitive data handling

### Categories of sensitive PI

| Category | Handling | Protection |
| --- | --- | --- |
| Birth date/time/place | SHA-256 hashed in storage; never in model context | Hashed storage + model boundary |
| Relationship data | Consent-gated; namespace-prefixed | Server-side consent enforcement |
| AI conversations | 30-day retention; private, no-store | Retention cleanup |
| Authentication material | Hashed tokens; HttpOnly cookies | Secure session management |
| Payment data | Handled by Stripe; only events received | Stripe PCI compliance |

### Sensitive PI opt-out (CPRA)

CPRA provides the right to limit use of sensitive PI. Sovereign.OS handles sensitive data only for the purposes disclosed at collection (Baseline computation). No secondary use occurs.

## Children's data

| Requirement | Implementation | Status |
| --- | --- | --- |
| Age gate | 18+ explicit confirmation at signup | IMPLEMENTED |
| No directed-at-children design | Adult personal AI product | BY DESIGN |
| COPPA compliance | Not applicable (18+ product) | N/A |

## Source evidence

- `config/policies.ts` — policy configuration
- `apps/sovereign-worker/src/privacy-rights.ts` — privacy operations
- `apps/sovereign-worker/src/jobs.ts` — deletion and retention
- `apps/sovereign-worker/src/baseline.ts` — sensitive data handling
- `docs/privacy-data-flow-register.md` — data flow register
- `docs/privacy-model.md` — privacy model
