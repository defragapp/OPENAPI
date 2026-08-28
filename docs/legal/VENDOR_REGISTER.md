# Vendor Compliance Register

Status: production vendor inventory and compliance assessment

Reviewed: 2026-08-28

This register tracks all third-party service providers that process Sovereign.OS user data or support production operations. It assesses each vendor's compliance posture and identifies required agreements.

## Active production vendors

### 1. Cloudflare

| Field | Detail |
| --- | --- |
| Role | Primary infrastructure provider |
| Services used | Workers, D1, Durable Objects, AI Gateway, Turnstile, Assets, DNS, Email Routing |
| Data processed | All user requests, account state, Baseline data, session state, AI inference |
| Data location | Global edge network; D1 storage in Cloudflare infrastructure |
| Agreement status | Cloudflare Terms of Service; DPA available but execution status unknown |
| Certifications | SOC 2 Type II, ISO 27001, ISO 27701, GDPR DPA |
| Subprocessor list | Published by Cloudflare |
| Data processing agreement | Available; needs execution/verification |
| Criticality | CRITICAL — all production infrastructure depends on Cloudflare |
| Exit complexity | HIGH — full re-architecture required |

**Required actions**:
- Execute Cloudflare DPA if serving EU users
- Review Cloudflare subprocessor list for changes
- Verify D1 data residency meets requirements
- Document Cloudflare account access controls

### 2. Stripe

| Field | Detail |
| --- | --- |
| Role | Payment processor |
| Services used | Checkout, Customer Portal, Subscriptions, Webhooks |
| Data processed | Payment information, customer email, subscription state |
| Data location | United States |
| Agreement status | Stripe Terms of Service / Stripe SSA |
| Certifications | SOC 2 Type II, PCI DSS Level 1 |
| Subprocessor list | Published by Stripe |
| Data processing agreement | Included in Stripe SSA |
| Criticality | HIGH — payment processing depends on Stripe |
| Exit complexity | MEDIUM — alternative payment processors available |

**Required actions**:
- Verify Stripe DPA covers current processing
- Review webhook endpoint security
- Monitor Stripe API version compatibility

### 3. Resend

| Field | Detail |
| --- | --- |
| Role | Transactional email provider |
| Services used | Email delivery (magic links, codes, invitations, notices) |
| Data processed | Recipient email address, email subject/body, delivery metadata |
| Data location | United States |
| Agreement status | Resend Terms of Service |
| Certifications | SOC 2 status should be verified |
| Data processing agreement | Needs verification |
| Criticality | MEDIUM — email delivery for auth and notices |
| Exit complexity | LOW — alternative email providers available; Cloudflare Email binding exists as fallback |

**Required actions**:
- Verify Resend DPA availability
- Confirm Resend SOC 2 status
- Test Cloudflare Email binding fallback

### 4. NASA/JPL Horizons

| Field | Detail |
| --- | --- |
| Role | Astronomical computation API |
| Services used | Horizons endpoint for Baseline/current-condition engine |
| Data processed | Astronomy query parameters (not personal data directly) |
| Data location | United States (JPL) |
| Agreement status | NASA Terms of Use (public API) |
| Certifications | US government system |
| Data processing agreement | N/A — public API |
| Criticality | MEDIUM — Baseline computation depends on astronomical data |
| Exit complexity | LOW — alternative ephemeris data sources available |

**Required actions**:
- Monitor API availability and rate limits
- Verify fail-closed behavior when API is unavailable

### 5. Deepgram (TTS)

| Field | Detail |
| --- | --- |
| Role | Text-to-speech provider |
| Services used | TTS endpoint (if active) |
| Data processed | Text content for speech synthesis |
| Data location | United States |
| Agreement status | Deepgram Terms of Service |
| Certifications | SOC 2 status should be verified |
| Data processing agreement | Needs verification |
| Criticality | LOW — TTS is a supplementary feature |
| Exit complexity | LOW — alternative TTS providers available |

**Required actions**:
- Verify if TTS is active in current production
- Verify Deepgram DPA if processing user content

## Vendor risk matrix

| Vendor | Criticality | Data sensitivity | Replaceability | Overall risk |
| --- | --- | --- | --- | --- |
| Cloudflare | Critical | High (all data) | Very low | HIGH |
| Stripe | High | Medium (payment data) | Medium | MEDIUM |
| Resend | Medium | Low (email addresses) | High | LOW |
| NASA/JPL | Medium | Low (query params) | High | LOW |
| Deepgram | Low | Low (text for TTS) | High | LOW |

## Required vendor agreements

| Vendor | Agreement | Status | Priority |
| --- | --- | --- | --- |
| Cloudflare | Data Processing Agreement (DPA) | Available; execution needed for EU users | HIGH |
| Cloudflare | Business Associate Agreement (BAA) | Not required (no HIPAA data) | N/A |
| Stripe | Subscription Services Agreement (SSA) | Standard Stripe terms | Verify |
| Stripe | DPA | Included in SSA | Verify |
| Resend | Terms of Service | Active | Verify |
| Resend | DPA | Needs verification | MEDIUM |
| Deepgram | Terms of Service | Active if TTS used | LOW |

## Vendor management gaps

| Gap | Risk | Recommendation |
| --- | --- | --- |
| No executed DPAs with all processors | Medium (especially for GDPR) | Execute Cloudflare DPA before serving EU users |
| No vendor risk assessment schedule | Medium | Schedule annual vendor review |
| No subprocessor monitoring | Low | Subscribe to vendor change notifications |
| No vendor incident response coordination | Medium | Verify vendor incident notification commitments |
| No vendor exit plan documentation | Low (for non-critical vendors) | Document Cloudflare exit strategy for BCP |
| No vendor insurance/certification verification | Low | Collect and review vendor SOC 2 reports |

## Vendor data flow summary

```
User → Cloudflare (Workers/D1/DO/Turnstile/AI Gateway/Assets/DNS)
         → Stripe (payment events)
         → Resend (transactional email)
         → NASA/JPL (astronomical computation)
         → Deepgram (TTS, if active)
```

All user data flows through Cloudflare as the primary processor. Secondary processors (Stripe, Resend, NASA/JPL, Deepgram) receive only the data necessary for their specific function.

## Source evidence

- `apps/sovereign-worker/wrangler.jsonc` — Cloudflare bindings and configuration
- `apps/sovereign-worker/src/billing/stripe.ts` — Stripe integration
- `apps/sovereign-worker/src/email.ts` — Resend integration
- `apps/sovereign-worker/src/baseline-engine.ts` — NASA/JPL integration
- `apps/sovereign-worker/src/routes/stripe.ts` — webhook handling
- `docs/privacy-data-flow-register.md` — data flow register
- `docs/security/soc2-readiness-controls.md` — CONF-06 vendor agreements
