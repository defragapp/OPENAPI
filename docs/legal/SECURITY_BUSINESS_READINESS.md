# Security Business Readiness Policy

Status: production security posture assessment for company readiness

Reviewed: 2026-08-28

This document consolidates Sovereign.OS security controls, policies, and gaps for company launch readiness. It references existing security documentation and adds business-level security policy statements.

## Security policy statements

### 1. Secrets management

| Policy | Implementation | Evidence |
| --- | --- | --- |
| No secrets in source control | `pnpm scan:secrets` on every release | `scripts/scan-secrets.mjs` |
| Production secrets in protected stores | Cloudflare Worker environment variables | `wrangler.jsonc` bindings |
| Credential rotation procedure | 8-step replacement sequence | `docs/security/credential-rotation-runbook.md` |
| Compromised credential response | Treat as compromised; revoke/rotate immediately | `SECURITY.md` |
| No secrets in logs/issues/PRs | Documented prohibition | Credential rotation runbook |

**Current state**: IMPLEMENTED — secret scanning, protected storage, rotation procedure all in place.

### 2. Access control

| Policy | Implementation | Evidence |
| --- | --- | --- |
| Authentication required for private data | Session middleware on all private routes | `auth-public.ts`, `security/auth.ts` |
| HMAC-SHA256 session tokens | Signed tokens with 30-day TTL | `security/auth.ts` |
| Secure session cookie | `__Host-` prefix, HttpOnly, Secure, SameSite=Lax | Cookie configuration |
| Same-origin enforcement | Origin + sec-fetch-site validation | `security/auth.ts` requireSameOrigin |
| Passkey/phishing-resistant option | WebAuthn/ES256 with challenge expiry | `auth-passkeys.ts`, `security/webauthn-es256.ts` |
| Session revocation | Revoked sessions tracked in auth_sessions | Session table |
| No client-supplied account ID trust | Server-side session identity only | `security/auth.ts` |

**Current state**: IMPLEMENTED — multi-layer authentication with secure session management.

### 3. Transport security

| Policy | Implementation | Evidence |
| --- | --- | --- |
| HTTPS enforcement | HSTS header with long max-age | `security/headers.ts` |
| Content type sniffing prevention | X-Content-Type-Options: nosniff | `security/headers.ts` |
| Clickjacking protection | X-Frame-Options: DENY | `security/headers.ts` |
| Cross-origin isolation | COOP, CORP headers | `security/headers.ts` |
| CSP enforcement | Strict Content Security Policy | `security/headers.ts` |
| Private response caching | Cache-Control: private, no-store for private responses | Route handlers |
| Source map protection | No .map files served publicly | Source-map gate in release |

**Current state**: IMPLEMENTED — comprehensive security headers.

### 4. Input validation and abuse prevention

| Policy | Implementation | Evidence |
| --- | --- | --- |
| Turnstile at auth boundaries | Required for signup/login | `auth-public.ts` |
| Rate limiting | 2-min per-email, 10 per-IP per 15-min | `auth-public.ts` |
| Input size limits | 8000 char limit on user input | `agent/safety.ts` |
| Zod schema validation | sovereign-answer.v2 strict schema | `agent/recognition.ts` |
| SQL injection prevention | D1 parameterized queries | All D1 operations |
| XSS prevention | React rendering + CSP | Framework + headers |
| Safe redirect validation | Strict allowlist for return URLs | `auth-public.ts` safeReturnTo |

**Current state**: IMPLEMENTED — multi-layer input validation and abuse prevention.

### 5. Payment security

| Policy | Implementation | Evidence |
| --- | --- | --- |
| Webhook signature verification | HMAC-SHA256 with 5-min tolerance | `security/stripe-signature.ts` |
| Constant-time comparison | Timing-safe signature check | `security/stripe-signature.ts` |
| Event deduplication | Prevents duplicate state changes | `routes/stripe.ts` |
| Server-confirmed entitlement | Subscription projected from Stripe events | `billing/stripe.ts` |
| Idempotency keys | Checkout session idempotency | `billing/stripe.ts` |

**Current state**: IMPLEMENTED — payment security with signature verification and deduplication.

### 6. AI safety and output governance

| Policy | Implementation | Evidence |
| --- | --- | --- |
| Forbidden pattern enforcement | 14+ categories with auto-rewrite | `agent/safety.ts` |
| Provider gate | Only Cloudflare AI Gateway allowed | `agent/sovereign.ts` |
| Model-safe context reduction | Raw sensitive data excluded from model | `docs/privacy-model.md` |
| Answer contract enforcement | Zod schema with section validation | `agent/recognition.ts` |
| Basis ref authorization | Rejects invented/unauthorized refs | `agent/recognition.ts` |
| Input disposition routing | standard/grounded/urgent/secure_refusal | `docs/production-ai-safety-boundary.md` |

**Current state**: IMPLEMENTED — comprehensive AI safety layer.

### 7. Vulnerability handling

| Policy | Implementation | Evidence |
| --- | --- | --- |
| Private vulnerability reporting | GitHub private reporting + security.txt | `SECURITY.md` |
| Public security contact | info@sovereign.defrag.app via security.txt | `SECURITY.md` |
| Safe research boundaries | Documented do-not-cross lines | `SECURITY.md` |
| Dependency vulnerability scanning | `pnpm scan:dependencies` | `package.json` |
| Dependency overrides for security | undici, fast-uri, ip-address, nanoid patched | `package.json` pnpm overrides |
| Incident response procedure | 6-step runbook | `docs/security/incident-response-runbook.md` |

**Current state**: IMPLEMENTED — reporting, scanning, and response procedures in place.

### 8. Release security

| Policy | Implementation | Evidence |
| --- | --- | --- |
| Exact-SHA release verification | 40-char SHA in /health and /ready | Release orchestrator |
| Migration parity check | /ready verifies migration state | Release orchestrator |
| Secret scan before release | `pnpm scan:secrets` in verify gate | Release pipeline |
| No source maps in production | Source-map gate | Release verification |
| Single-deploy release | One deploy per release; no automatic retry | Release orchestrator |
| Production fixture scan | No test fixtures in production | `pnpm scan:production-fixtures` |

**Current state**: IMPLEMENTED — release pipeline with security gates.

## SOC 2 readiness summary

Full control mapping: `docs/security/soc2-readiness-controls.md`

| Control family | Controls | Implemented | Gaps |
| --- | --- | --- | --- |
| Security | SEC-01 through SEC-08 | 8/8 | Operating evidence needed for audit |
| Availability | AVL-01 through AVL-05 | 4/5 | AVL-05: backup/restore testing external |
| Processing Integrity | PI-01 through PI-06 | 6/6 | Operating evidence needed for audit |
| Confidentiality | CONF-01 through CONF-06 | 4/6 | CONF-05/06: operating evidence + vendor agreements external |
| Privacy | PRIV-01 through PRIV-10 | 10/10 | Some require operating evidence |

**Key**: All technical controls are implemented. Gaps are in operating evidence (requires time-bounded audit period) and external evidence (vendor agreements, personnel controls, legal entity documentation).

## Security gaps for company readiness

| Gap | Risk | Recommendation |
| --- | --- | --- |
| No formal security policy document for external distribution | Medium | Create distributable security policy for vendor/enterprise review |
| No penetration testing evidence | Medium | Schedule external pen test before enterprise sales |
| No formal access review schedule | Low (single operator) | Implement periodic access review when team grows |
| No security training program | Low (single operator) | Document security awareness expectations |
| No cyber insurance | Medium | Evaluate cyber liability insurance |
| No formal risk assessment | Medium | Conduct and document formal risk assessment |
| No business continuity plan | Medium | Document recovery objectives and procedures |
| No external security certifications | Low | SOC 2 readiness documented; formal audit when needed |

## Source evidence

- `SECURITY.md` — security policy
- `docs/security/incident-response-runbook.md` — incident response
- `docs/security/credential-rotation-runbook.md` — credential management
- `docs/security/soc2-readiness-controls.md` — SOC 2 readiness
- `apps/sovereign-worker/src/security/` — security implementations
- `apps/sovereign-worker/src/auth-public.ts` — auth security
- `apps/sovereign-worker/src/agent/safety.ts` — AI safety
- `package.json` — dependency scanning and overrides
