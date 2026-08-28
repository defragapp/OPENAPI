# Trust Center

Status: enterprise trust package for partnerships, investors, and enterprise users

Reviewed: 2026-08-28

This document provides a consolidated trust package for external review by partners, investors, enterprise customers, and auditors.

## About Sovereign.OS

Sovereign.OS is a private personal AI platform for understanding yourself, your relationships, and the systems around you. Users build a Baseline — a private reference built around them — then explore how they think, decide, communicate, create, connect, and respond under pressure.

**Product category**: Private personal AI for real life.

**Production URL**: https://sovereign.defrag.app

**Authenticated app**: https://app.defrag.app

## Architecture overview

### Infrastructure

| Component | Provider | Purpose |
| --- | --- | --- |
| Compute | Cloudflare Workers | Application runtime at global edge |
| Database | Cloudflare D1 | Private source of truth for all account state |
| Coordination | Cloudflare Durable Objects | Thread turn serialization |
| AI inference | Cloudflare Workers AI via AI Gateway | Sovereign intelligence answers |
| Authentication | Built-in + Cloudflare Turnstile | Magic link/code + passkey + abuse prevention |
| Payments | Stripe | Subscription billing |
| Email | Resend | Transactional delivery |
| Astronomy | NASA/JPL Horizons | Deterministic Baseline computation |

### Data architecture

```
User browser
  │
  ├── __Host-sovereign_session (HttpOnly, Secure, SameSite=Lax)
  │
  └── HTTPS → Cloudflare Workers (sovereign-agent)
                │
                ├── D1 (account, baseline, consent, threads, billing)
                ├── Durable Objects (thread coordination)
                ├── Turnstile (auth challenge)
                ├── Workers AI / AI Gateway (inference)
                ├── NASA/JPL Horizons (astronomy)
                ├── Stripe (payment events)
                └── Resend (transactional email)
```

### Key architectural decisions

| Decision | Rationale |
| --- | --- |
| Single Worker, single D1 | Simplicity; no distributed state |
| Server-side consent enforcement | Deterministic privacy protection |
| SHA-256 hashed sensitive inputs | Minimize exposure of birth data |
| Model-safe context reduction | Raw sensitive data never enters AI |
| Namespace-prefixed relationship data | Prevent data merging between participants |
| On-demand export, no artifact storage | Minimize data copies |
| No R2, no Queue | Reduced attack surface |
| Exact-SHA release verification | Deterministic deployment |

## Security summary

### Authentication

- Email + magic link (15-min expiry, single-use, SHA-256 hashed)
- Email code (6-digit, 10-min expiry, 5 max attempts, constant-time comparison)
- WebAuthn/passkey (ES256, challenge expiry, replay protection)
- HMAC-SHA256 session tokens (30-day TTL)
- `__Host-` cookie prefix (HttpOnly, Secure, SameSite=Lax)
- Same-origin enforcement (Origin + sec-fetch-site validation)

### Transport security

- HSTS with long max-age
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy
- Strict Content Security Policy
- No source maps served publicly

### AI safety

- 14+ forbidden pattern categories with auto-rewrite
- Provider gate: only Cloudflare AI Gateway
- sovereign-answer.v2 Zod schema enforcement
- Basis ref authorization (rejects invented references)
- Input disposition routing (standard/grounded/urgent/secure_refusal)
- 8000-character input limit
- Fail-closed on provider unavailability

### Abuse prevention

- Cloudflare Turnstile at all auth boundaries
- Per-email and per-IP rate limiting
- Event deduplication for payment webhooks
- HMAC-SHA256 webhook signature verification (5-min tolerance)

### Release security

- Exact 40-character SHA verification
- Secret scanning on every release
- Migration parity verification
- Single-deploy release (no automatic retry)
- Production fixture scanning

### SOC 2 readiness

30+ controls mapped to AICPA Trust Services Criteria. See `docs/security/soc2-readiness-controls.md` for full control mapping.

| Family | Controls | Implemented |
| --- | --- | --- |
| Security | 8 | 8/8 |
| Availability | 5 | 4/5 (1 external) |
| Processing Integrity | 6 | 6/6 |
| Confidentiality | 6 | 4/6 (2 external) |
| Privacy | 10 | 10/10 |

## Privacy summary

### Data zones

| Zone | Content | Model access |
| --- | --- | --- |
| Raw sensitive | Birth data, exact location, auth, billing | NEVER |
| Reduced machine context | Facet profile, authorized relationship context | YES |
| User-visible output | Sovereign answers with sources | Delivered to user |

### Privacy rights

| Right | Implementation |
| --- | --- |
| Access/export | On-demand JSON export of 22 data categories |
| Deletion | 14-day grace, 20+ tables cleaned, subscription cancelled |
| Correction | User corrections on answers |
| Consent management | 7 scopes, per-person, server-side enforcement |
| Policy review | Version + hash + eligibility re-acceptance |
| Portability | Machine-readable JSON export |

### Retention

| Data | Retention |
| --- | --- |
| Unsaved thread content | 30 days |
| Security/audit metadata | 90 days |
| Library understandings | Until user deletes |
| Policy receipts | With pseudonymized account |
| Account data | Until deletion |

### Tracking

- No Google Analytics, GTM, Meta Pixel, PostHog, Mixpanel, Segment
- No behavioral advertising storage
- Test-enforced tracker prohibition

### Compliance

| Framework | Readiness |
| --- | --- |
| CCPA/CPRA | Designed for compliance; threshold assessment needed |
| GDPR | PARTIAL — core rights implemented; DPA and transfer documentation needed |
| UK GDPR | PARTIAL — same as GDPR + UK representative |
| PIPEDA (Canada) | HIGH — privacy-forward design |
| COPPA | COMPLIANT — 18+ gate |

## AI governance summary

### What the AI does

- Interprets Baseline data to answer personal questions
- Provides relationship intelligence with consent
- Analyzes system dynamics with consent
- Shows source details for every answer
- Discloses uncertainty explicitly

### What the AI does NOT do

- Medical or psychological diagnosis
- Prediction of specific future behavior
- Guaranteed outcomes or personality verdicts
- Hidden profiling or unauthorized comparison
- Social scoring or manipulation

### Model

| Attribute | Value |
| --- | --- |
| Model | `@cf/zai-org/glm-4.7-flash` |
| Provider | Cloudflare Workers AI |
| Gateway | sovereign-ai-gateway |
| Selection | Release-controlled |

### EU AI Act

- Not prohibited (no social scoring, manipulation, exploitation)
- Not high-risk (not in Annex III categories)
- Minimal transparency obligation (met)

## Compliance matrix

| Domain | Status | Evidence |
| --- | --- | --- |
| Privacy rights | IMPLEMENTED | Export, deletion, consent, correction |
| AI safety | IMPLEMENTED | 14+ forbidden patterns, schema enforcement |
| Security controls | IMPLEMENTED | Auth, transport, secrets, release |
| Consent enforcement | IMPLEMENTED | Server-side, per-scope, per-person |
| Data minimization | IMPLEMENTED | Model-safe reduction, hashed storage |
| Retention controls | IMPLEMENTED | 30/90 day cleanup jobs |
| Payment security | IMPLEMENTED | Webhook signatures, deduplication |
| Age eligibility | IMPLEMENTED | 18+ gate |
| Policy acceptance | IMPLEMENTED | Append-only receipts with hash |
| Analytics prohibition | IMPLEMENTED | Test-enforced |

## Contact

| Purpose | Contact |
| --- | --- |
| General inquiries | info@sovereign.defrag.app |
| Security reports | GitHub private vulnerability reporting |
| Security contact | security.txt at sovereign.defrag.app |
| Privacy inquiries | info@sovereign.defrag.app |

## Document index

### Security

- `SECURITY.md` — security policy
- `docs/security/soc2-readiness-controls.md` — SOC 2 readiness
- `docs/security/incident-response-runbook.md` — incident response
- `docs/security/credential-rotation-runbook.md` — credential management
- `docs/security/SECURITY_OPERATIONS_PROGRAM.md` — security operations
- `docs/security/TRADE_SECRET_POLICY.md` — trade secret protection

### Privacy

- `docs/privacy-model.md` — privacy model
- `docs/privacy-data-flow-register.md` — data flow register
- `docs/legal/DATA_FLOW_MAP.md` — data flow map
- `docs/legal/PRIVACY_RIGHTS_AUDIT.md` — privacy rights audit
- `docs/legal/PRIVACY_COMPLIANCE_OPERATING_MODEL.md` — US privacy compliance
- `docs/legal/GLOBAL_PRIVACY_READINESS.md` — international privacy

### AI governance

- `docs/legal/AI_GOVERNANCE_FRAMEWORK.md` — AI governance framework
- `docs/production-ai-safety-boundary.md` — AI safety boundary

### Legal and IP

- `docs/legal/LEGAL_READINESS_MATRIX.md` — legal gaps
- `docs/legal/TERMS_REVIEW.md` — Terms review
- `docs/legal/TRADEMARK_STRATEGY.md` — trademark strategy
- `docs/legal/IP_ASSET_REGISTER.md` — IP assets
- `docs/legal/BRAND_PROTECTION_POLICY.md` — brand protection
- `docs/legal/THIRD_PARTY_LICENSE_REPORT.md` — license compliance
- `docs/legal/VENDOR_REGISTER.md` — vendor register

### Operations

- `docs/operations/PRODUCTION_OPERATIONS_MANUAL.md` — production operations
- `docs/product/CHANGE_CONTROL_POLICY.md` — change control
- `docs/customer/CUSTOMER_SUPPORT_OPERATIONS.md` — customer support
- `docs/business/REVENUE_OPERATIONS.md` — revenue operations

### Product

- `docs/product-language-system.md` — product language
- `docs/product/REAL_USER_ACCEPTANCE_REPORT.md` — user acceptance
- `docs/production-release.md` — release procedure
