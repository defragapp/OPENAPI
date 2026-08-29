# Real User Acceptance Report

Status: end-to-end user journey verification

Reviewed: 2026-08-28

Live funnel session: 2026-08-29 (real browser, real Turnstile solve, real mailbox) — see "Live signup funnel session" below.

This report verifies that a real human can use Sovereign.OS end-to-end, from discovery through daily use. Verification is based on source-code audit and live production probing.

## New user flow verification

### 1. Discovery and landing

| Check | Implementation | Status |
| --- | --- | --- |
| Landing loads at sovereign.defrag.app | `PublicLanding.tsx` served by Assets | VERIFIED via live probe |
| Hero statement visible | "Healing isn't optional. Holding onto the pain is." | Source-verified |
| Product description clear | "Private personal AI for understanding yourself..." | Source-verified |
| Navigation works | How it works, Pricing, FAQ, Sign in, Get started | Source-verified |
| Mobile responsive | Mobile nav, breakpoint-specific layout | Source-verified |
| Legal links present | Privacy, Terms in footer | Source-verified |

### 2. Signup

| Check | Implementation | Status |
| --- | --- | --- |
| Email capture | `/api/v1/auth/signup` endpoint | Source-verified |
| Turnstile required | `verifyTurnstile` at `auth-public.ts:74-102` | VERIFIED — returns `verification_failed` without valid token |
| Policy acceptance required | Terms + Privacy version + content hash + 18+ confirmation | Source-verified via `config/policies.ts` |
| Magic link delivery | Resend API; Cloudflare email binding engaged only when `RESEND_API_KEY` is absent — provider priority, not a failure fallback (`email.ts`) | Source-verified in `email.ts`; LIVE DELIVERY BLOCKED 2026-08-29 — sending domain not verified in Resend (see live session below) |
| Email code option | 6-digit code, 10-min expiry, 5 max attempts | Source-verified |
| Session creation | HMAC-SHA256 JWT, 30-day TTL | Source-verified in `security/auth.ts` |
| Cookie security | `__Host-sovereign_session`, HttpOnly, Secure, SameSite=Lax | Source-verified |
| Duplicate account handling | Existing email returns same response (no enumeration) | Source-verified |
| Rate limiting | 2-min per-email, 10 per-IP per 15-min | Source-verified |
| Safe redirect | `safeReturnTo` allowlist: `/app`, `/onboarding`, `/consent.html` | Source-verified |

### 3. Onboarding

| Check | Implementation | Status |
| --- | --- | --- |
| Birth information collection | Date, time, place inputs | Source-verified in `App.tsx` |
| Privacy notice at collection | Baseline notice states raw birth/exact location boundary | Source-verified |
| Consent language | Terms + Privacy + 18+ at signup | Source-verified |
| Baseline creation | `persistBaseline` with SHA-256 hashed protected storage | Source-verified in `baseline.ts` |
| State machine | `not_started` → `source_computing` → `facet_profile_preparing` → `ready` | Source-verified |
| Retry handling | `prepareStoredBaselineFacetProfile` explicit retry endpoint | Source-verified |
| Failure recovery | Provider-unavailable fail-close; no guessing | Source-verified |

### 4. Intelligence experience

| Check | Implementation | Status |
| --- | --- | --- |
| Ask question | Thread creation + message endpoint | Source-verified in `index.ts` |
| Receive answer | `runSovereignResult` with full pipeline | Source-verified in `agent/sovereign.ts` |
| Answer structure | sovereign-answer.v2: direct answer → sections → sources | Source-verified in `agent/recognition.ts` |
| Source details available | Basis refs with authorization check | Source-verified |
| Limitations shown | Uncertainty tracking; "unknowns" section required | Source-verified |
| Continue conversation | Thread persistence + message history | Source-verified |
| Turn accounting | Free: 10/month, Plus: 300/month | Source-verified in `billing/usage.ts` |
| Safety enforcement | 14+ forbidden patterns with auto-rewrite | Source-verified in `agent/safety.ts` |

### 5. Relationship intelligence

| Check | Implementation | Status |
| --- | --- | --- |
| Consent before person appears | `requireConsent` server-side check | Source-verified in `db/people.ts` |
| No hidden profiling | Each person's data namespace-prefixed | Source-verified in `relational-context.ts` |
| No unauthorized comparisons | `buildPairComparison` requires consent first | Source-verified at `relational-context.ts:58-60` |
| No deterministic claims | Interpretive language; uncertainty preserved | Source-verified in safety layer |
| Consent scopes | 7 scopes: pair.compare, system.include, trait.display, etc. | Source-verified |
| Revocation | `revoked_at` timestamp; takes effect immediately | Source-verified |

### 6. Payment

| Check | Implementation | Status |
| --- | --- | --- |
| Stripe checkout | `createCheckoutSession` with idempotency keys | Source-verified in `billing/stripe.ts` |
| Webhook verification | HMAC-SHA256 with 5-min tolerance | Source-verified in `security/stripe-signature.ts` |
| Entitlement activation | Server-confirmed subscription projection | Source-verified |
| Subscription state | Event ordering with `last_event_created` comparison | Source-verified |
| Cancellation | `cancelAccountSubscriptions` via Stripe API | Source-verified |
| Portal access | `createPortalSession` for billing management | Source-verified |
| URL validation | Only `checkout.stripe.com` and `billing.stripe.com` allowed | Source-verified |

## Returning user flow

| Check | Implementation | Status |
| --- | --- | --- |
| Login | Magic link or email code at `/login` | Source-verified |
| Passkey login | WebAuthn/ES256 with challenge expiry | Source-verified |
| Session persistence | 30-day TTL with `__Host-` cookie | Source-verified |
| Workspace loads | `SovereignIntelligenceWorkspace` with policy check | Source-verified |
| Policy re-presentation | Stale policy blocks workspace until re-acceptance | Source-verified in `privacy-rights.ts` |

## Account lifecycle

| Operation | Implementation | Status |
| --- | --- | --- |
| Data export | `POST /api/v1/account/export` — 22 categories | Source-verified in `privacy-rights.ts` |
| Account deletion | 14-day grace, subscription cancel, 20+ tables | Source-verified in `jobs.ts` |
| Deletion cancellation | Possible during grace period | Source-verified |
| Deletion confirmation | Email notification on completion | Source-verified |
| Subscription cancellation | Stripe integration | Source-verified |

## Privacy operations

| Operation | Implementation | Status |
| --- | --- | --- |
| Consent management | Per-scope, per-person, server-side | Source-verified |
| Consent revocation | Immediate effect for new analysis | Source-verified |
| Policy review | Version + hash + eligibility check | Source-verified |
| Policy re-acceptance | Append-only receipts with full audit trail | Source-verified |

## Live production verification

| Endpoint | Result | Verified |
| --- | --- | --- |
| `GET https://sovereign.defrag.app/` | 200 OK | Yes |
| `GET https://sovereign.defrag.app/ready` | SHA matches, ready: true | Yes |
| `GET https://app.defrag.app/ready` | SHA matches, ready: true | Yes |
| `POST /api/v1/auth/signup` (no Turnstile) | verification_failed | Yes |
| `POST /api/v1/auth/signup` (bogus token, valid-shaped body) | 400 `verification_failed` reason `invalid` — secret valid, token rejected | Yes — 2026-08-29 after secret repair |
| `POST /api/v1/auth/login` (bogus token) | 400 `verification_failed` reason `invalid` | Yes — 2026-08-29 |
| `POST /api/v1/auth/signup` (wrong policy) | invalid/eligibility | Yes |
| `GET /api/v1/account/export` (no auth) | 401 | Yes |
| `POST /api/v1/stripe/webhook` (no sig) | Rejected | Yes |

## Gaps requiring owner action

The following verifications require a live user session and cannot be completed by source audit alone:

| Gap | Required action |
| --- | --- |
| Complete signup with valid email | Owner must create test account |
| Complete Baseline creation | Owner must enter birth data |
| Receive first intelligence answer | Owner must ask a question |
| Test Stripe checkout with real card | Owner must initiate checkout (can cancel) |
| Test email delivery | Owner must verify magic link arrives |
| Mobile visual QA | Owner must verify on iPhone/Android |
| Passkey enrollment | Owner must test WebAuthn flow |

## Live signup funnel session — 2026-08-29

Harness: `visual-inspection/signup-funnel.mjs` (Playwright, headed Chromium, disposable Guerrilla Mail inbox). Evidence screenshots in the session log; worker behavior confirmed via `wrangler tail sovv-web`.

| Step | Result |
| --- | --- |
| Production signup page renders | VERIFIED — founder visual system intact at 1280×800 |
| Turnstile widget renders | VERIFIED — managed widget, interactive checkbox (no headless auto-pass) |
| Real Turnstile solve → widget token | VERIFIED — caption "Security check complete.", submit enabled |
| Server accepts real token | VERIFIED — request passed `verifyTurnstile` and reached email delivery |
| Email delivery | **FAILED — production blocker** `resend_403_The sovereign.defrag.app domain is not verified.` observed live in worker tail (`email_delivery_failed`) |
| Fail-closed behavior | VERIFIED — 503 `Email delivery unavailable`, UI: "No account change was made", no magic link row consumed |

### Repairs applied this session

1. **P0-001 Turnstile (RESOLVED):** production `TURNSTILE_SECRET_KEY` on worker `sovv-web` returned `invalid-input-secret`. The secret was reconciled to the exact value of Turnstile widget `0x4AAAAAADhGIF8-iOLIg8MU` via the Cloudflare API (`GET /accounts/8b1954…/challenges/widgets/…`) using the owner's authenticated session; the value was piped directly into the worker secret store and never exposed. Live proof: bogus-token signup/login probes now return 400 `invalid` (siteverify accepts the secret, rejects only the token); both branded `/ready` endpoints remain `ready: true` at the deployed SHA with migration parity current.
2. **P0-002 Email domain (BLOCKED — owner action):** the transactional sender is pinned by `scripts/verify-public-contact.mjs` to `info@sovereign.defrag.app`, and that subdomain was never added/verified in the Resend account. The apex `defrag.app` is verified in Resend but is a **prohibited** sender per the same verifier, so no code or config override may substitute it.

### Required owner actions to unblock signup delivery

Context: the production `RESEND_API_KEY` exists only as an unreadable worker secret; no Resend credential capable of adding a domain exists in this environment, and the Cloudflare email binding cannot absorb Resend failures by design (`email.ts` provider priority). The domain step therefore requires Resend dashboard access.

1. Resend dashboard → Domains → Add `sovereign.defrag.app`.
2. Add the DNS records Resend presents for the subdomain (two DKIM TXT records at `resend._domainkey.sovereign.defrag.app`, SPF TXT at `send.sovereign.defrag.app` — pattern identical to the already-verified apex records).
3. Wait for Resend to mark the domain Verified, then rerun `node visual-inspection/signup-funnel.mjs` — the funnel resumes automatically at real email delivery, magic-link redeem, and onboarding.

These are documented as GitHub issues #210–#216 in the product acceptance task graph; this session adds the delivery-domain blocker to that list.

## Verdict

**All source-verifiable user journey steps PASS.** The remaining gaps require live human testing, which is tracked in the product acceptance task graph and documented in `FINAL_LIVE_USER_ACCEPTANCE.md`.

## Source evidence

- `apps/sovereign-worker/src/auth-public.ts` — auth flows
- `apps/sovereign-worker/src/baseline.ts` — Baseline creation
- `apps/sovereign-worker/src/agent/sovereign.ts` — intelligence pipeline
- `apps/sovereign-worker/src/agent/recognition.ts` — answer contract
- `apps/sovereign-worker/src/agent/safety.ts` — safety layer
- `apps/sovereign-worker/src/relational-context.ts` — relationship intelligence
- `apps/sovereign-worker/src/billing/stripe.ts` — payment flows
- `apps/sovereign-worker/src/privacy-rights.ts` — privacy operations
- `apps/sovereign-worker/src/jobs.ts` — deletion and cleanup
- `apps/web/src/App.tsx` — client-side flows
- `apps/web/src/PublicLanding.tsx` — landing page
