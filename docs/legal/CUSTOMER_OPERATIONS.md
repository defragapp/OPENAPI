# Customer Operations Verification

Status: production customer operations audit

Reviewed: 2026-08-28

This audit verifies that Sovereign.OS provides the customer-facing operations required for a legitimate public product.

## Customer-facing channels

### 1. Contact

| Channel | Implementation | Status |
| --- | --- | --- |
| Email | info@sovereign.defrag.app | IMPLEMENTED — in footer, security.txt |
| Support link | /pricing#support | IMPLEMENTED — in footer |
| Security reporting | GitHub private vulnerability reporting + security.txt | IMPLEMENTED |

### 2. Self-service operations

| Operation | Implementation | Status |
| --- | --- | --- |
| Account creation | /signup with Turnstile | IMPLEMENTED |
| Account login | /login with magic link/code + passkey | IMPLEMENTED |
| Subscription management | Stripe Customer Portal | IMPLEMENTED |
| Account deletion | Deletion workflow with 14-day grace | IMPLEMENTED |
| Data export | POST /api/v1/account/export | IMPLEMENTED |
| Policy review/re-acceptance | Workspace policy check | IMPLEMENTED |
| Consent management | Per-scope consent in People/Systems | IMPLEMENTED |
| Passkey management | WebAuthn registration/revocation | IMPLEMENTED |
| Password/session management | Session revocation, logout | IMPLEMENTED |
| Corrections | User corrections on answers | IMPLEMENTED |
| Library management | Save/delete understandings | IMPLEMENTED |

### 3. Legal page access

| Page | Route | Accessible from |
| --- | --- | --- |
| Terms of Service | /terms | Footer |
| Privacy Policy | /privacy | Footer |
| Security policy | SECURITY.md (repository) | security.txt |
| Cookie/storage disclosure | Privacy policy + data flow register | Privacy page |

## Onboarding flow

| Step | Implementation | Status |
| --- | --- | --- |
| Signup | Email + Turnstile + policy acceptance + 18+ confirmation | IMPLEMENTED |
| Email verification | Magic link or email code | IMPLEMENTED |
| Baseline creation | Birth date/time/place input with privacy notice | IMPLEMENTED |
| Baseline computation | Source computing → facet profile preparing → ready | IMPLEMENTED |
| First question | Sovereign text thread | IMPLEMENTED |
| Upgrade prompt | Free → Plus when appropriate | IMPLEMENTED |

## Subscription lifecycle

| Stage | Implementation | Status |
| --- | --- | --- |
| Free tier | 10 AI turns/month | IMPLEMENTED |
| Checkout | Stripe Checkout with price ID mapping | IMPLEMENTED |
| Payment | Stripe payment processing | IMPLEMENTED |
| Entitlement | Server-confirmed subscription projection | IMPLEMENTED |
| Plus tier | 300 AI turns/month | IMPLEMENTED |
| Cancellation | Stripe subscription cancellation | IMPLEMENTED |
| Grace period | Period-end access until cancellation | IMPLEMENTED |
| Portal | Stripe Customer Portal for billing management | IMPLEMENTED |

## Error and failure handling

| Scenario | Handling | Status |
| --- | --- | --- |
| Auth rate limit | 2-min per-email, 10 per-IP per 15-min | IMPLEMENTED |
| Turnstile failure | Fail-closed; auth blocked | IMPLEMENTED |
| Email delivery failure | 503 with retry-after: 60 | IMPLEMENTED |
| AI capacity exhaustion | Fail-closed; capacity ledger | IMPLEMENTED |
| Provider unavailable | Fail-closed; no guessing | IMPLEMENTED |
| Stripe webhook failure | Retryable flag recorded | IMPLEMENTED |
| Deletion failure | Job retry with max attempts | IMPLEMENTED |
| Policy stale | Workspace blocks until re-acceptance | IMPLEMENTED |

## Accessibility

| Feature | Implementation | Status |
| --- | --- | --- |
| Semantic HTML | Header, nav, main, footer, section, article elements | IMPLEMENTED |
| ARIA labels | Navigation labels, section labels, icon labels | IMPLEMENTED |
| Keyboard navigation | Standard HTML links and buttons | IMPLEMENTED |
| Accessible question list | Hidden `<ul>` for screen readers alongside visual carousel | IMPLEMENTED |
| Focus management | Standard browser focus on links/buttons | IMPLEMENTED |

## Communication templates

| Template | Provider | Status |
| --- | --- | --- |
| Magic link email | Resend (Cloudflare Email fallback) | IMPLEMENTED — branded HTML + text |
| Email code email | Resend | IMPLEMENTED |
| Invitation email | Resend | IMPLEMENTED |
| Deletion confirmation | Resend | IMPLEMENTED |
| Invitation lifecycle notifications | Resend | IMPLEMENTED |

## Gaps for company readiness

| Gap | Risk | Recommendation |
| --- | --- | --- |
| No dedicated support ticketing system | Medium for scaling | Implement support inbox (email-based is acceptable for launch) |
| No FAQ content verified | Medium | Populate /faq with actual content |
| No status page | Low | Consider status page for incident communication |
| No changelog/release notes | Low | Consider public changelog |
| No SLA or uptime commitment | Medium for enterprise | Document availability target when ready |
| No customer communication for outages | Medium | Establish outage notification procedure |
| No feedback/feature request channel | Low | Consider feedback mechanism |

## Source evidence

- `apps/web/src/PublicLanding.tsx` — public pages
- `apps/web/src/App.tsx` — auth and onboarding
- `apps/sovereign-worker/src/auth-public.ts` — auth flows
- `apps/sovereign-worker/src/privacy-rights.ts` — privacy operations
- `apps/sovereign-worker/src/jobs.ts` — deletion and cleanup
- `apps/sovereign-worker/src/email.ts` — email templates
- `apps/sovereign-worker/src/billing/stripe.ts` — subscription lifecycle
- `SECURITY.md` — security reporting
