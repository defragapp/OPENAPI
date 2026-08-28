# Global Scale Readiness

Status: launch traffic readiness assessment

Reviewed: 2026-08-28

Release SHA: e2e7c2389dafa4621632db0dede9964d6ac80d08

This document assesses Sovereign.OS readiness for high-traffic launch conditions (100,000+ users in the first month).

## Current architecture capacity

### Cloudflare Workers

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| Runtime | Cloudflare Workers (global edge) | Auto-scaling; no cold starts on paid plan |
| Execution limit | 30 seconds per request | Sufficient for AI-augmented responses |
| Memory | 128 MB per worker | Sufficient for current workload |
| Concurrent requests | No explicit limit (platform-managed) | Cloudflare handles concurrency |
| CPU time | 10-50 ms per request (depending on plan) | Monitor under load |

**Verdict**: Workers infrastructure scales horizontally by design. No bottleneck at the compute layer.

### D1 Database

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| Read replicas | Automatic with D1 | Scales reads horizontally |
| Write throughput | Single-writer D1 | Monitor write contention under heavy concurrent auth/signup |
| Query performance | 18 migrations; indexed tables | Verify index coverage for high-frequency queries |
| Connection pooling | D1 manages connections | No connection pool exhaustion risk |

**Expected bottleneck**: Write contention during traffic spikes (many simultaneous signups/baseline creations). D1 single-writer model may queue writes.

**Mitigation**: D1 write queue is platform-managed. Monitor `d1_queries_executed` and `d1_write_queries` metrics. If write latency exceeds 500ms, consider read/write separation for non-critical paths.

### Durable Objects

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| ThreadCoordinator | One DO per thread | Auto-scales; each DO handles its own state |
| Turn serialization | In-DO locking | Prevents concurrent write conflicts |
| Storage | DO local storage + D1 | Bounded per-thread state |

**Verdict**: DOs scale by instantiation. No bottleneck unless a single thread receives hundreds of concurrent turns (unlikely).

### AI Gateway

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| Model | `@cf/zai-org/glm-4.7-flash` | Cloudflare-managed inference |
| Gateway | `sovereign-ai-gateway` | Rate limiting, caching, analytics |
| Free tier | 10 turns/month per user | Limits total inference load |
| Plus tier | 300 turns/month per user | Higher but bounded |
| Capacity ledger | Daily tracking | Prevents single-day exhaustion |
| Timeout | Provider timeout configured | Fail-closed on timeout |

**Expected bottleneck**: AI inference latency under concurrent load. Model inference is the slowest operation (1-10 seconds per turn).

**Mitigation**:
- Turn limits (10/300 per month) naturally cap per-user load
- Daily capacity ledger prevents burst exhaustion
- Fail-closed behavior prevents cascading failures
- AI Gateway provides rate limiting and caching

### Turnstile

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| Abuse prevention | Required at signup/login | Cloudflare-managed |
| Verification | Server-side token check | Fast (< 100ms) |

**Verdict**: Turnstile is Cloudflare-managed and scales with the platform.

### Resend (Email)

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| Transactional email | Magic links, codes, invitations | Provider-managed delivery |
| Fallback | Cloudflare Email binding | Redundancy for delivery |
| Rate | Provider-limited | Monitor delivery latency |

**Expected bottleneck**: Email delivery latency during signup spikes. Users may wait 30-60 seconds for magic links.

**Mitigation**: Fallback to Cloudflare Email binding. Clear UI messaging about email delivery timing.

### Stripe (Payments)

| Factor | Current state | Scale assessment |
| --- | --- | --- |
| Checkout | Stripe-hosted checkout | Offloads payment processing |
| Webhooks | Signature-verified, deduplicated | Handles concurrent events |
| Portal | Stripe-hosted portal | Offloads billing management |

**Verdict**: Stripe handles its own scaling. Webhook deduplication prevents double-processing.

## Expected bottlenecks

| Bottleneck | Severity | Likelihood | Mitigation |
| --- | --- | --- | --- |
| AI inference latency | Medium | High | Turn limits; fail-closed; capacity ledger |
| D1 write contention | Low–Medium | Medium | Monitor write latency; optimize hot paths |
| Email delivery delay | Low | Medium | Fallback provider; clear UI messaging |
| Cold start (first request) | Low | Low | Cloudflare keeps workers warm |
| Static asset delivery | Very Low | Low | Cloudflare CDN; already cached |

## Monitoring requirements

### Critical metrics

| Metric | Source | Alert threshold |
| --- | --- | --- |
| Worker CPU time | Cloudflare dashboard | > 50ms p95 |
| Worker error rate | Cloudflare dashboard | > 1% |
| D1 query latency | Cloudflare dashboard | > 200ms p95 |
| D1 write queue depth | Cloudflare dashboard | > 10 pending |
| AI inference latency | AI Gateway analytics | > 10s p95 |
| AI error rate | AI Gateway analytics | > 5% |
| Turnstile verification rate | Application logs | < 95% success |
| Email delivery rate | Resend dashboard | < 90% delivery |
| Stripe webhook success | Application logs | < 99% success |

### Health endpoint monitoring

| Endpoint | Check frequency | Expected response |
| --- | --- | --- |
| `GET /health` | Every 60 seconds | `ok: true` |
| `GET /ready` | Every 60 seconds | `ready: true`, SHA matches |

### Log monitoring

| Log pattern | Meaning | Action |
| --- | --- | --- |
| `retention_cleanup` | Scheduled cleanup running | Normal |
| `ai_capacity_*` | Capacity ledger operations | Normal |
| `stripe_webhook_error` | Webhook processing failure | Investigate |
| `auth_rate_limit` | Rate limit triggered | Normal under load |
| `provider_unavailable` | AI/email provider down | Investigate |

## Cost controls

| Resource | Cost driver | Control |
| --- | --- | --- |
| Workers | Requests + CPU time | Turn limits cap AI requests |
| D1 | Reads + writes + storage | Retention limits (30/90 days) |
| Durable Objects | Requests + storage | Thread cleanup after 30 days |
| AI Gateway | Inference requests | Monthly turn caps per user |
| Resend | Emails sent | Only transactional; no marketing |
| Stripe | Transaction volume | Percentage-based; scales with revenue |

### Estimated monthly cost at 100K users

| Resource | Estimate | Notes |
| --- | --- | --- |
| Workers (paid plan) | $5/month base | Plus usage-based |
| D1 | $0.25/million reads, $1/million writes | Depends on activity |
| Durable Objects | $0.50/million requests | Depends on thread activity |
| AI inference | Workers AI pricing per token | Bounded by turn limits |
| Resend | Free tier or paid | Depends on volume |
| Stripe | 2.9% + $0.30 per transaction | Only on paid conversions |

**Key insight**: Turn limits (10 free, 300 plus) are the primary cost control for AI inference. At 100K users, even if 10% are active, monthly AI cost is bounded by turn caps.

## Scaling recommendations

### Immediate (before launch)

1. Verify D1 indexes cover high-frequency queries (auth by email, threads by account, consent by person+scope)
2. Set up Cloudflare dashboard alerts for error rate and latency
3. Test signup flow under concurrent load (10+ simultaneous signups)
4. Verify AI Gateway rate limits are configured

### Short-term (first month)

5. Monitor D1 write latency during peak hours
6. Track AI inference p95 latency
7. Monitor email delivery success rate
8. Review Stripe webhook processing times

### Medium-term (growth phase)

9. Evaluate D1 read replica usage for read-heavy endpoints
10. Consider AI response caching for common questions
11. Evaluate Resend scaling plan
12. Review Cloudflare Workers plan tier

## Failure modes

| Failure | User impact | System behavior | Recovery |
| --- | --- | --- | --- |
| AI provider down | Cannot get answers | Fail-closed; clear error message | Wait for provider recovery |
| D1 unavailable | Cannot access any data | /health returns ok: false | Cloudflare D1 recovery |
| Resend down | Cannot receive magic links | 503 with retry-after: 60 | Fallback to Cloudflare Email |
| Stripe down | Cannot subscribe/checkout | Checkout unavailable | Wait for Stripe recovery |
| Turnstile down | Cannot sign up/in | Auth blocked | Cloudflare Turnstile recovery |
| Worker overload | Slow responses | Cloudflare auto-scales | Monitor; escalate if persistent |

## Source evidence

- `apps/sovereign-worker/wrangler.jsonc` — infrastructure configuration
- `apps/sovereign-worker/src/index.ts` — health endpoints
- `apps/sovereign-worker/src/billing/usage.ts` — turn accounting
- `apps/sovereign-worker/src/agent/sovereign.ts` — AI pipeline
- `apps/sovereign-worker/src/jobs.ts` — retention cleanup
- `docs/operations/PRODUCTION_OPERATIONS_MANUAL.md` — operations manual
