# Customer Support Operations

Status: customer support framework for Sovereign.OS

Reviewed: 2026-08-28

This document defines the customer support operating model for Sovereign.OS.

## Support channels

### Primary channel

| Channel | Address | Purpose |
| --- | --- | --- |
| Email | info@sovereign.defrag.app | All support inquiries |
| Security reporting | GitHub private vulnerability reporting | Security issues only |
| Security email | Via security.txt contact | Security issues only |

### Support locations in product

| Location | Link |
| --- | --- |
| Landing footer | /pricing#support |
| Landing footer | mailto:info@sovereign.defrag.app |
| Security.txt | info@sovereign.defrag.app |

## Response expectations

| Inquiry type | Target response | Notes |
| --- | --- | --- |
| Account access issues | 1 business day | Auth recovery available |
| Billing questions | 2 business days | Stripe portal for self-service |
| Privacy requests | 5 business days | Automated export/deletion available |
| Bug reports | 3 business days | Acknowledgment + triage |
| Feature requests | Acknowledged; no timeline | Tracked for product evolution |
| Security reports | Immediate acknowledgment | Follow SECURITY.md process |
| Legal inquiries | 5 business days | May require counsel review |

## Self-service operations

### Available without support contact

| Operation | Method | Location |
| --- | --- | --- |
| Account creation | Signup flow | /signup |
| Login recovery | Magic link / email code | /login |
| Passkey management | WebAuthn enrollment | /app |
| Baseline creation | Onboarding flow | /onboarding |
| Ask questions | Thread interface | /app |
| Save understandings | Library save button | In thread |
| Manage consent | People/Systems consent | /app |
| View sources | "See source details" | In answer |
| Correct answers | Correction input | In thread |
| Subscription management | Stripe Customer Portal | Via /app billing |
| Cancel subscription | Stripe Portal or deletion workflow | Via /app |
| Export data | Account export | /app |
| Delete account | Deletion workflow with 14-day grace | /app |
| Review/re-accept policies | Policy re-presentation | /app |
| View pricing | Pricing page | /pricing |
| Read FAQ | FAQ page | /faq |
| Read Terms | Terms page | /terms |
| Read Privacy | Privacy page | /privacy |

## Refund handling

### Current policy

**Status**: NOT YET PUBLISHED (see `docs/legal/TERMS_REVIEW.md`)

### Recommended refund policy

| Scenario | Policy |
| --- | --- |
| Free tier | No payment; no refund applicable |
| Plus monthly | No partial-month refunds; cancellation stops next billing |
| Plus annual | Pro-rated refund within first 14 days; no refund after |
| Accidental charge | Contact info@sovereign.defrag.app within 14 days |
| Service outage | Evaluated case-by-case |
| Dispute | Stripe dispute process available as last resort |

### Refund procedure

1. User emails info@sovereign.defrag.app with billing issue
2. Owner reviews Stripe dashboard for the account
3. If refund warranted: issue through Stripe dashboard
4. Confirm refund to user via email
5. Document in support records

## Account deletion support

### Self-service path (preferred)

1. User initiates deletion in /app
2. 14-day grace period begins
3. User can cancel during grace
4. After grace: subscription cancelled, data deleted
5. Confirmation email sent

### Support-assisted path

If user cannot access their account:
1. User emails info@sovereign.defrag.app with deletion request
2. Verify identity (email-based verification)
3. If verified: owner initiates deletion from admin
4. Confirm deletion to user

## Privacy request support

### Self-service (preferred)

| Request | Method |
| --- | --- |
| Data export | POST /api/v1/account/export |
| Account deletion | Deletion workflow |
| Consent revocation | In-app consent management |
| Policy review | In-app policy re-presentation |

### Support-assisted

If user cannot access their account:
1. User emails info@sovereign.defrag.app
2. Specify request type (access, deletion, correction)
3. Verify identity
4. Process request
5. Respond with result

## Escalation procedures

| Scenario | Escalation | Action |
| --- | --- | --- |
| Unresolved billing dispute | Stripe dispute | Let Stripe process handle it |
| Data breach suspicion | Incident response runbook | Follow security procedures |
| Legal threat | Legal counsel | Do not respond substantively |
| Media inquiry | Owner only | Do not comment on behalf of product |
| Regulatory inquiry | Legal counsel | Respond through counsel |

## Support documentation needs

| Document | Status | Notes |
| --- | --- | --- |
| FAQ page | Needs content verification | /faq route exists |
| How it works | Needs content verification | /how-it-works route exists |
| Pricing page | Implemented | /pricing with Stripe integration |
| Support contact | Implemented | info@sovereign.defrag.app |

## Support metrics (recommended)

| Metric | Target | Notes |
| --- | --- | --- |
| First response time | < 24 business hours | For all inquiries |
| Resolution time | < 5 business days | For standard inquiries |
| Self-service rate | > 90% | Most operations are self-service |
| Customer satisfaction | Track when feedback received | Informal |

## Source evidence

- `apps/web/src/PublicLanding.tsx` — support links in footer
- `apps/sovereign-worker/src/privacy-rights.ts` — self-service privacy operations
- `apps/sovereign-worker/src/jobs.ts` — deletion workflow
- `apps/sovereign-worker/src/billing/stripe.ts` — subscription management
- `SECURITY.md` — security reporting
