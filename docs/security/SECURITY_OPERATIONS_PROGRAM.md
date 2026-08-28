# Security Operations Program

Status: security operations framework for Sovereign.OS

Reviewed: 2026-08-28

This document establishes the security operations program for Sovereign.OS, consolidating application security, infrastructure security, and incident response.

## 1. Application security

### Authentication

| Control | Implementation | Verification |
| --- | --- | --- |
| Email + magic link/code | `auth-public.ts` | Source-verified |
| Passkey (WebAuthn/ES256) | `auth-passkeys.ts`, `webauthn-es256.ts` | Source-verified |
| Turnstile at auth boundaries | Required for signup/login | Live-probed |
| Session tokens (HMAC-SHA256) | 30-day TTL, signed | Source-verified |
| `__Host-` cookie prefix | HttpOnly, Secure, SameSite=Lax | Source-verified |
| Same-origin enforcement | Origin + sec-fetch-site validation | Source-verified |
| Session revocation | Tracked in auth_sessions | Source-verified |
| Rate limiting | 2-min per-email, 10 per-IP per 15-min | Source-verified |

### Authorization

| Control | Implementation | Verification |
| --- | --- | --- |
| Account-bound sessions | Server-side identity only | Source-verified |
| No client-supplied account ID trust | `requireAuth` extracts from session | Source-verified |
| Consent-gated relationship access | `requireConsent` server-side | Source-verified |
| Feature entitlement gates | `requireFeature` for Plus features | Source-verified |
| Policy freshness check | Workspace blocks stale policies | Source-verified |

### Encryption and transport

| Control | Implementation | Verification |
| --- | --- | --- |
| HTTPS enforcement | HSTS with long max-age | Source-verified |
| Session token signing | HMAC-SHA256 | Source-verified |
| Input hashing | SHA-256 for birth data, IP, UA | Source-verified |
| Stripe webhook verification | HMAC-SHA256 with 5-min tolerance | Source-verified |
| Turnstile verification | Server-side token validation | Source-verified |
| Source map exclusion | No .map files in production | Release gate |

### Secrets handling

| Control | Implementation | Verification |
| --- | --- | --- |
| Secrets in Cloudflare Worker env | Not in source code | Wrangler configuration |
| Secret scanning | `pnpm scan:secrets` on every release | Release gate |
| No secrets in logs | Documented prohibition | Credential runbook |
| No secrets in issues/PRs | Documented prohibition | SECURITY.md |
| Credential rotation procedure | 8-step sequence | `credential-rotation-runbook.md` |

### Logging

| Control | Implementation | Verification |
| --- | --- | --- |
| Bounded AI logging | Configured not to collect raw prompts | Code/config evidence |
| IP/UA hashing | SHA-256 hashed in policy records | Source-verified |
| No conversation content in logs | Privacy policy + config | Source-verified |
| Audit events | Tool audit events table | Source-verified |
| Retention limits | 30/90 day cleanup | Source-verified |

### Vulnerability management

| Control | Implementation | Verification |
| --- | --- | --- |
| Dependency audit | `pnpm scan:dependencies` | Release gate |
| Security overrides | undici, fast-uri, ip-address, nanoid patched | package.json |
| Private vulnerability reporting | GitHub private reporting + security.txt | SECURITY.md |
| Public security contact | info@sovereign.defrag.app | security.txt |
| Safe research boundaries | Documented | SECURITY.md |

## 2. Cloudflare security

### WAF configuration

| Control | Implementation | Management |
| --- | --- | --- |
| Free-tier WAF rules | `configure-cloudflare-free-tier.mjs` | Release reconciler |
| API Shield | Endpoint Management templates | Release reconciler |
| Zone-level controls | Externally managed when API returns 403 | Release reconciler |

### Rate limits

| Control | Implementation | Level |
| --- | --- | --- |
| Auth rate limit | 2-min per-email, 10 per-IP per 15-min | Application |
| Cloudflare rate limits | Zone-level configuration | Infrastructure |
| AI turn limits | Free: 10/month, Plus: 300/month | Application |

### Bot protection

| Control | Implementation | Level |
| --- | --- | --- |
| Turnstile | Required at auth boundaries | Application |
| Cloudflare bot management | Zone-level | Infrastructure |
| DDoS protection | Cloudflare automatic | Infrastructure |

### Access policies

| Control | Implementation | Level |
| --- | --- | --- |
| Worker secrets | Cloudflare encrypted env | Infrastructure |
| D1 access | Wrangler OAuth + account auth | Infrastructure |
| Dashboard access | Cloudflare account credentials | Infrastructure |

## 3. Incident response

### Breach procedure

Follow `docs/security/incident-response-runbook.md`:

| Step | Action | Timeline |
| --- | --- | --- |
| 1. Contain | Preserve access; revoke unauthorized access | Immediate |
| 2. Preserve evidence | Record detection, scope, actions | Immediate |
| 3. Assess scope | Determine what was exposed, timeline, affected identities | Within hours |
| 4. Eradicate/recover | Replace credentials; patch root cause; verify | As practical |
| 5. Notify | Escalate to owner; legal counsel for notifications | Immediately for confirmed exposure |
| 6. Close/improve | Confirm remediation; document; strengthen controls | After containment |

### Escalation contacts

| Scenario | Contact | Method |
| --- | --- | --- |
| Credential exposure | Repository owner | Direct |
| Customer data exposure | Repository owner + legal counsel | Direct |
| Payment/Stripe data | Repository owner + Stripe | Direct + Stripe support |
| Production compromise | Repository owner | Direct |
| Service abuse | Repository owner | Direct |

### Communication templates

**Internal notification** (to owner):
> Subject: Security incident — [category]
> Detection time: [timestamp]
> Affected: [service/route/credential category]
> Current status: [contained/active]
> Actions taken: [list]
> Immediate needs: [list]

**Customer notification** (if required — requires legal counsel approval):
> Subject: Important security notice regarding your Sovereign.OS account
> What happened: [plain language description]
> What information was affected: [specific categories]
> What we are doing: [remediation steps]
> What you can do: [action steps]
> Contact: [info@sovereign.defrag.app]

**Provider notification** (if required):
> Follow each provider's incident notification process.

### Regulatory notification obligations

| Jurisdiction | Authority | Timeline | Trigger |
| --- | --- | --- | --- |
| EU (GDPR) | Supervisory authority | 72 hours | Personal data breach |
| EU (GDPR) | Data subjects | Without undue delay | High risk to rights/freedoms |
| UK (UK GDPR) | ICO | 72 hours | Personal data breach |
| US (state laws) | Varies by state | Varies (30-60 days typical) | Per state thresholds |
| California | CA AG | Most expedient | 500+ CA residents |

**Note**: Notification decisions require legal counsel. Do not make unsupported claims about breach scope.

## 4. Security monitoring

### Continuous monitoring

| What | How | Frequency |
| --- | --- | --- |
| /health and /ready | Automated or manual check | Daily |
| Dependency vulnerabilities | `pnpm scan:dependencies` | Every release |
| Secret exposure | `pnpm scan:secrets` | Every release |
| Cloudflare security events | Cloudflare dashboard | Weekly |
| Stripe webhook failures | Application logs | Ongoing |
| Auth failures | Application logs | Ongoing |

### Periodic review

| Review | Frequency | Owner |
| --- | --- | --- |
| Cloudflare account access | Quarterly | Owner |
| GitHub repository access | Quarterly | Owner |
| Stripe account access | Quarterly | Owner |
| Resend account access | Quarterly | Owner |
| Secret rotation assessment | Semi-annually | Owner |
| Security controls review | Annually | Owner |

## Source evidence

- `SECURITY.md` — security policy
- `docs/security/incident-response-runbook.md` — incident response
- `docs/security/credential-rotation-runbook.md` — credential management
- `docs/security/soc2-readiness-controls.md` — SOC 2 readiness
- `apps/sovereign-worker/src/security/` — security implementations
- `apps/sovereign-worker/src/auth-public.ts` — auth security
- `apps/sovereign-worker/wrangler.jsonc` — infrastructure configuration
