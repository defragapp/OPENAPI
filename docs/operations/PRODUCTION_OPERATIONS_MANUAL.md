# Production Operations Manual

Status: canonical production operations reference

Reviewed: 2026-08-28

This manual documents the operational procedures for maintaining Sovereign.OS production infrastructure.

## Production identity

| Element | Value |
| --- | --- |
| Repository | `defragapp/OPENAPI` |
| Branch | `main` (single canonical branch) |
| Current SHA | `e2e7c2389dafa4621632db0dede9964d6ac80d08` |
| Worker name | `sovv-web` |
| Public site | `https://sovereign.defrag.app` |
| Authenticated app | `https://app.defrag.app` |
| Root domain | `defrag.app` |
| D1 database | `sovereign-openapi-db` |
| Durable Object | `ThreadCoordinator` |
| AI model | `@cf/zai-org/glm-4.7-flash` |
| AI Gateway | `sovereign-ai-gateway` |
| Release tag | `release-certified-baseline` |

## GitHub operations

### Branch protection recommendations

| Setting | Recommended value | Rationale |
| --- | --- | --- |
| Require pull request | Not required (single operator) | Current workflow is direct-to-main |
| Require status checks | `pnpm verify:cloudflare-build` | Prevent broken deploys |
| Require signed commits | Recommended | Prevent unauthorized commits |
| Restrict force pushes | Always | Protect history |
| Allow deletions | Never | Protect main branch |
| Require linear history | Recommended | Clean commit history |

### Release tags

| Tag | Purpose |
| --- | --- |
| `release-v1.0.0` | Initial release marker |
| `release-certified-baseline` | Current production certification |
| `release-certified-baseline-59225c6` | SHA-specific certification |

### Release process

```bash
# 1. Confirm on main at current origin/main
git fetch origin
git checkout main
git reset --hard origin/main

# 2. Run full repository gate
pnpm verify:cloudflare-build

# 3. Release same SHA to production
pnpm production:release:text

# 4. Verify both domains converge
curl -s https://sovereign.defrag.app/ready | jq .
curl -s https://app.defrag.app/ready | jq .
```

### Untracked production-impacting files

Current untracked items (not production-impacting):
- `FINAL_OUTCOME_CERTIFICATION.md` — audit document
- `PRODUCTION_ENVIRONMENT_REPORT.md` — audit document
- `scripts/live-answer-probe/` — audit scripts
- `visual-inspection/` — audit artifacts

These are documentation/audit artifacts, not production-impacting code.

## Cloudflare operations

### Workers deployment

| Check | Method | Expected |
| --- | --- | --- |
| Deployed SHA | `GET /ready` | Matches release SHA |
| Routes correct | Route cohort verification | All SPA + API routes resolve |
| Domains correct | DNS verification | sovereign.defrag.app, app.defrag.app |
| Worker status | Cloudflare dashboard | Active, no errors |

### Rollback procedure

1. Identify the previously stable deployment version
2. Use Cloudflare dashboard → Workers → sovv-web → Deployments
3. Roll back to the previous deployment
4. Verify `/ready` on both domains
5. **Note**: Rollback does NOT reverse D1 migrations, Stripe events, or email delivery

**Forward-repair is preferred over rollback.** Use migrations to fix forward when possible.

### D1 operations

| Operation | Method | Notes |
| --- | --- | --- |
| Migration application | `pnpm production:release:text` (automatic) | Applied before deploy |
| Migration verification | `GET /ready` → `migrationVersion` | Must be `0018_workers_ai_capacity_reservations` |
| Migration parity | `GET /ready` → `dependencies.migrationParity` | Must be `current` |
| Backup/recovery | Cloudflare D1 automatic backups | Verify backup schedule in dashboard |
| Direct queries | `wrangler d1 execute sovereign-openapi-db` | Use read-replica when possible |

**D1 recovery plan**:
1. D1 maintains automatic backups (verify schedule in Cloudflare dashboard)
2. Point-in-time recovery available through Cloudflare
3. Application-level data can be reconstructed from D1 state + Stripe events
4. No R2 backup dependency (R2 is disabled)

### Durable Object operations

| Check | Method | Expected |
| --- | --- | --- |
| ThreadCoordinator active | `GET /ready` → `dependencies.durableObjects` | `configured` |
| Turn coordination | Integration tests | Serialize concurrent turns |
| Persistence | DO storage | Bounded to thread workflow |

### AI Gateway configuration

| Setting | Value | Source |
| --- | --- | --- |
| Gateway ID | `sovereign-ai-gateway` | `wrangler.jsonc` |
| Model | `@cf/zai-org/glm-4.7-flash` | `wrangler.jsonc` |
| Provider gate | `cloudflare-gateway` only | `agent/sovereign.ts` |
| Free turns | 10/month | `AI_FREE_MONTHLY_TURNS` |
| Plus turns | 300/month | `AI_SOVEREIGN_PLUS_MONTHLY_TURNS` |
| Capacity ledger | Daily tracking | Migration `0013` |

### Rate limits and protection

| Control | Implementation | Location |
| --- | --- | --- |
| Auth rate limit | 2-min per-email, 10 per-IP per 15-min | `auth-public.ts` |
| Turnstile | Required at signup/login | `auth-public.ts` |
| Input size limit | 8000 chars | `agent/safety.ts` |
| Cloudflare WAF | Free-tier configuration | `configure-cloudflare-free-tier.mjs` |
| API Shield | Endpoint Management templates | Release reconciler |
| Bot protection | Cloudflare bot management | Zone-level configuration |
| DDoS protection | Cloudflare automatic | Zone-level |

### Scheduled jobs

| Schedule | Job | Purpose |
| --- | --- | --- |
| `*/15 * * * *` | `runDueJobs` | Process deletion, cleanup, invitation expiry |

## Monitoring and observability

### Health endpoints

| Endpoint | Purpose | Key fields |
| --- | --- | --- |
| `GET /health` | Basic health | `ok`, `sha`, `migrationVersion`, `dependencies` |
| `GET /healthz` | Alias | Same as `/health` |
| `GET /ready` | Full readiness | `ready`, all dependencies, release evidence |

### Observability configuration

| Setting | Value |
| --- | --- |
| Logs enabled | Yes |
| Invocation logs | Yes |
| Traces enabled | Yes |
| Trace sampling | 5% (`head_sampling_rate: 0.05`) |

### Release evidence verification

After each release, verify:
1. Both `/ready` endpoints report exact target SHA
2. `ready: true` on both domains
3. `migrationVersion: 0018_workers_ai_capacity_reservations`
4. `migrationParity: current`
5. `policyAcceptanceReceipts: configured`
6. `privacyAccessControls: configured`
7. DMARC evidence verified

## Required production secrets

| Secret | Purpose | Rotation procedure |
| --- | --- | --- |
| `SESSION_SIGNING_SECRET` | HMAC session tokens | `docs/security/credential-rotation-runbook.md` |
| `TURNSTILE_SECRET_KEY` | Turnstile verification | Same |
| `RESEND_API_KEY` | Transactional email | Same |
| `STRIPE_SECRET_KEY` | Payment processing | Same |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Same |

**Never** copy secret values into repository files, build output, issues, screenshots, or logs.

## Emergency procedures

### Service degradation

| Symptom | Check | Action |
| --- | --- | --- |
| `/health` returns `ok: false` | D1 connectivity | Check D1 status in Cloudflare dashboard |
| `/ready` returns `ready: false` | Dependencies | Check each dependency status |
| AI failures | AI Gateway | Check Cloudflare AI status; capacity ledger |
| Auth failures | Turnstile/Resend | Check provider status |
| Payment failures | Stripe | Check webhook delivery; signature verification |

### Incident response

Follow `docs/security/incident-response-runbook.md`:
1. Contain
2. Preserve evidence
3. Assess scope
4. Eradicate and recover
5. Notify appropriately
6. Close and improve

### Rollback decision criteria

Rollback when:
- Critical security vulnerability in deployed code
- Data corruption detected
- Service completely unavailable and forward-repair is not viable

Rollback is NOT appropriate when:
- Forward-fix migration can resolve the issue
- Issue is in external provider (Cloudflare, Stripe, Resend)
- Issue is cosmetic/non-functional

## Source evidence

- `docs/production-release.md` — canonical release authority
- `apps/sovereign-worker/wrangler.jsonc` — production configuration
- `apps/sovereign-worker/src/index.ts` — health/readiness endpoints
- `scripts/cloudflare-production-text-release.mjs` — release script
- `scripts/configure-cloudflare-free-tier.mjs` — Cloudflare controls
