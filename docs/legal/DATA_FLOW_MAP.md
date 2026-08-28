# Sovereign.OS Data Flow Map

Status: production data-flow audit for company readiness

Reviewed: 2026-08-28

This document maps every user data path in the current Sovereign.OS production deployment. It supplements `docs/privacy-data-flow-register.md` with a category-oriented view suitable for regulatory review, vendor due diligence, and incident scoping.

## Data categories

### 1. Account and authentication data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Email address | Cloudflare D1 | Account identity, magic link/code delivery | Until account deletion | Deletion removes record |
| Password hash (if applicable) | D1 | Authentication | Until account deletion or password change | Deletion removes record |
| Session token (HMAC-SHA256) | D1 (hash), browser cookie | Authenticated session | 30-day TTL; revocable | Logout revokes; deletion removes |
| Magic link token hash | D1 | Single-use email authentication | 15-min expiry; cleaned on use/expiry | Automatic |
| Email code hash | D1 | 6-digit authentication | 10-min expiry, 5 max attempts | Automatic |
| Passkey credential (WebAuthn) | D1 | Phishing-resistant authentication | Until revoked or account deleted | User can revoke; deletion removes |
| Policy acceptance receipts | D1 | Auditable consent to Terms/Privacy | Retained with account as audit evidence | Pseudonymized on deletion |
| Eligibility confirmation | D1 | 18+ launch eligibility | Retained with account | Pseudonymized on deletion |
| IP hash (SHA-256) | D1 | Auth rate-limit and policy evidence | Up to 90 days operational window | Hashed; raw IP not stored |
| User-agent hash | D1 | Auth policy evidence | Up to 90 days operational window | Hashed; raw UA not stored |

### 2. Baseline data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Birth date (hashed) | D1 (SHA-256) | Baseline source computation | Until account deletion | Deletion removes |
| Birth time (hashed) | D1 (SHA-256) | Baseline source computation | Until account deletion | Deletion removes |
| Birth place (hashed) | D1 (SHA-256) | Baseline source computation | Until account deletion | Deletion removes |
| Facet profile (reduced) | D1 | Model-safe Baseline representation | Until account deletion | Deletion removes |
| Source computation state | D1 | Readiness state machine | Until account deletion | Deletion removes |
| Current conditions | D1 | Temporary context for answers | Until user removes or account deleted | User-removable |

**Boundary**: Raw birth inputs never enter model context. Only the reduced facet profile is shared with the AI inference path.

### 3. Intelligence and thread data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| User question text | Cloudflare Workers AI (via AI Gateway) | Answer generation | 30 days unsaved; then scheduled deletion | User can save; deletion removes |
| Sovereign answer (structured) | D1, browser | Response delivery | 30 days unsaved; then scheduled deletion | User can save; deletion removes |
| Thread coordination state | Durable Objects | Turn serialization | Bounded to thread workflow | Automatic |
| AI turn reservation | D1 | Usage accounting (free: 10/mo, plus: 300/mo) | Until account deletion | Deletion removes |
| Saved understandings (Library) | D1 | User-curated knowledge | Until user deletes or account deleted | User can delete anytime |
| Corrections | D1 | User feedback on answers | Until account deletion | Deletion removes |

**Boundary**: Model context excludes raw birth data, exact private location, auth material, billing IDs, invitation secrets, and unconsented relationship data.

### 4. Relationship and system data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Invited person Baseline (namespace-prefixed) | D1 | Relationship/system intelligence | Until account deletion or person removed | Deletion removes |
| Consent grants | D1 | Per-scope permission tracking | Until revoked or account deleted | Revocable per scope |
| Invitation tokens (hashed) | D1 | Invitation redemption | Until redeemed/expired or account deleted | Automatic |
| Pair comparison data | D1 (computed, not raw merge) | Relationship analysis | Until account deletion | Consent-gated; deletion removes |
| System analysis data | D1 (computed, consent rechecked) | Family/team/system analysis | Until account deletion | Consent-gated; deletion removes |

**Boundary**: Every relationship/system query rechecks consent server-side. Namespace-prefixed basis refs prevent data merging between participants. No raw birth data shared between participants.

### 5. Payment and billing data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Stripe customer ID | D1 | Payment identity | Until account deletion | Deletion minimizes |
| Subscription state (projected) | D1 | Entitlement tracking | Until account deletion or cancellation | Cancellation available in UI |
| Webhook event records | D1 | Event ordering, deduplication | Bounded; for subscription operation and fraud prevention | Minimized on deletion |
| Price/plan mapping | Worker env vars | Plan identification | Configuration | N/A (no PII) |

**Boundary**: Stripe card/financial data is handled directly by Stripe. Sovereign receives only event notifications and subscription state.

### 6. Communication data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Recipient email address | Resend | Magic link, code, invitation, notices | Provider-operational retention | Deletion removes from Sovereign |
| Email subject/body | Resend | Transactional delivery | Provider-operational retention | N/A (no private workspace content in emails) |
| Delivery identifiers | Resend | Delivery tracking | Provider-operational retention | N/A |

**Boundary**: No private workspace content, Baseline data, or relationship data is included in transactional emails.

### 7. Astronomical computation data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Astronomy query parameters | NASA/JPL Horizons | Deterministic Baseline computation | Results/provenance stored in D1 as needed | Deletion removes |

**Boundary**: Birthplace geocoding is not performed by the provider path. Unavailable provider results fail closed.

### 8. Security challenge data

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| Turnstile challenge response | Cloudflare Turnstile | Signup/login abuse prevention | Provider-operational | Required for auth |
| Hashed IP + user-agent | D1 (Sovereign) | Rate-limit and policy evidence | Up to 90 days | Hashed; raw not stored |

### 9. Browser storage

| Field | Destination | Purpose | Retention | User control |
| --- | --- | --- | --- | --- |
| `__Host-sovereign_session` cookie | Browser | Authenticated session | 30-day TTL | Cleared on logout |
| Navigation rail preference | localStorage | UI display preference | Until cleared | User can clear |
| Onboarding/upgrade state | sessionStorage | Temporary continuity | Session-scoped | Automatic |

**Boundary**: No analytics, ad tracker, or behavioral tracking scripts in active entry surfaces. Enforced by `PrivacyComplianceContract.test.ts`.

### 10. Dormant/disabled data paths

| Path | Status | Data flow |
| --- | --- | --- |
| Worlds/video generation | Disabled | No active data flow; feature flag false |
| R2 storage | Disabled | No bucket binding; no export artifacts |
| Queue binding | Disabled | No queue binding in production |

## Cross-border data flows

All production infrastructure operates through Cloudflare (global network), with D1 databases in Cloudflare's infrastructure. Stripe and Resend are US-based providers. NASA/JPL is a US government public API.

**Current gap**: No explicit international data transfer mechanism (SCCs, adequacy decision) is documented in the privacy policy. This is flagged in `LEGAL_READINESS_MATRIX.md`.

## Data flow diagram (text)

```
User browser
  |
  +-- HTTPS --> Cloudflare Workers (sovereign-agent)
  |               |
  |               +-- D1 (account, baseline, consent, threads, billing state)
  |               +-- Durable Objects (thread coordination)
  |               +-- Turnstile (auth challenge)
  |               +-- Workers AI via AI Gateway (inference)
  |               +-- NASA/JPL Horizons (astronomy)
  |               +-- Stripe (payment events)
  |               +-- Resend (transactional email)
  |
  +-- First-party cookie (__Host-sovereign_session)
  +-- localStorage (nav preference)
  +-- sessionStorage (onboarding state)
```

## Source evidence

- `docs/privacy-data-flow-register.md` — operational provider register
- `docs/privacy-model.md` — data zones and consent model
- `apps/sovereign-worker/src/baseline.ts` — Baseline storage
- `apps/sovereign-worker/src/auth-public.ts` — auth data flows
- `apps/sovereign-worker/src/relational-context.ts` — relationship data flows
- `apps/sovereign-worker/src/billing/stripe.ts` — billing data flows
- `apps/sovereign-worker/src/email.ts` — email data flows
- `apps/sovereign-worker/src/agent/sovereign.ts` — AI inference data flows
- `apps/sovereign-worker/src/security/headers.ts` — transport security
- `config/policies.ts` — policy and eligibility
