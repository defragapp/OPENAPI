# Revenue Operations

Status: financial operations framework for Sovereign.OS

Reviewed: 2026-08-28

This document defines the revenue operations framework for Sovereign.OS, covering Stripe configuration, pricing, tax, and accounting.

## Stripe configuration

### Products and prices

| Plan | Price ID source | Interval | Features |
| --- | --- | --- | --- |
| Free | N/A (no Stripe product) | N/A | 10 AI turns/month, Baseline, threads, Library |
| Sovereign Plus | `STRIPE_PLUS_MONTHLY_PRICE_ID` / `STRIPE_PLUS_ANNUAL_PRICE_ID` | Monthly or Annual | 300 AI turns/month, all features |

**Note**: Exact price IDs are configured as Worker secrets/environment variables and are not documented here for security reasons.

### Price-to-plan mapping

Implementation: `apps/sovereign-worker/src/billing/stripe.ts` `priceToSubscription()`

| Price ID | Plan key | Features |
| --- | --- | --- |
| Monthly price ID | `sovereign_plus` | Full feature access, 300 turns/month |
| Annual price ID | `sovereign_plus` | Full feature access, 300 turns/month |

### Stripe API configuration

| Setting | Value | Source |
| --- | --- | --- |
| API version | `2026-06-24.dahlia` | `billing/stripe.ts` |
| Timeout | 10 seconds | `stripeRequest` function |
| Idempotency | Required for all mutations | `requireIdempotencyKey` |

## Subscription lifecycle

### Checkout flow

| Step | Implementation | Notes |
| --- | --- | --- |
| 1. User initiates upgrade | UI trigger in workspace | `createCheckoutSession` |
| 2. Session created with idempotency key | Stripe Checkout | `requireIdempotencyKey` |
| 3. User redirected to Stripe | URL validation: only checkout.stripe.com, billing.stripe.com | `requireStripeHandoffUrl` |
| 4. Payment completed | Stripe webhook | `handleStripeWebhook` |
| 5. Webhook signature verified | HMAC-SHA256, 5-min tolerance | `stripe-signature.ts` |
| 6. Event deduplicated | Prevents double-processing | `routes/stripe.ts` |
| 7. Entitlement projected | Server-confirmed subscription state | `projectSubscriptionEvent` |
| 8. User returned to success URL | `STRIPE_SUCCESS_URL` | Redirect |

### Subscription management

| Operation | Method | Notes |
| --- | --- | --- |
| View subscription | Stripe Customer Portal | `createPortalSession` |
| Update payment method | Stripe Customer Portal | Via portal |
| Change plan | Cancel current + checkout new | Stripe flow |
| Cancel subscription | Stripe Portal or deletion workflow | Period-end cancellation |
| Reactivate | New checkout session | If cancelled |

### Webhook event handling

| Event | Action | Source |
| --- | --- | --- |
| `checkout.session.completed` | Activate entitlement | `routes/stripe.ts` |
| `customer.subscription.created` | Record subscription | `routes/stripe.ts` |
| `customer.subscription.updated` | Update projection | `routes/stripe.ts` |
| `customer.subscription.deleted` | Terminate entitlement | `routes/stripe.ts` |
| `invoice.paid` | Record payment | Filtered to SUBSCRIPTION_EVENTS |
| `invoice.payment_failed` | Record failure | Retryable flag |

Only subscription-related events are processed. Non-subscription events are acknowledged but not acted upon.

## Revenue recognition

### Accounting model

| Revenue type | Recognition | Notes |
| --- | --- | --- |
| Monthly subscription | Recognized monthly as service delivered | Cash basis for small operation |
| Annual subscription | Recognized monthly over 12 months (or cash basis) | Consult accountant |
| Free tier | No revenue | N/A |

### Tax considerations

| Jurisdiction | Obligation | Notes |
| --- | --- | --- |
| US Federal | Income tax on revenue | Standard |
| US State | State income tax varies by state | Consult accountant |
| EU VAT | May apply to digital services to EU consumers | Threshold-based; monitor |
| Sales tax | Varies by US state | Digital goods/services tax varies |

**Recommendation**: Consult a tax professional for nexus determination and collection obligations.

### Stripe tax

| Feature | Status | Notes |
| --- | --- | --- |
| Stripe Tax | Evaluate for automatic tax calculation | Depends on nexus |
| Tax IDs | Configure if required | Business tax ID |
| Invoices | Stripe generates automatically | Available in Customer Portal |

## Receipts and invoicing

| Document | Source | Access |
| --- | --- | --- |
| Payment receipts | Stripe automatic | Customer Portal |
| Subscription invoices | Stripe automatic | Customer Portal |
| Refund receipts | Stripe automatic | Customer Portal |

## Financial controls

### Revenue integrity

| Control | Implementation | Source |
| --- | --- | --- |
| Webhook signature verification | HMAC-SHA256 | `stripe-signature.ts` |
| Event deduplication | Prevents double-entitlement | `routes/stripe.ts` |
| Server-confirmed entitlement | Not client-trusted | `billing/stripe.ts` |
| Idempotency keys | Prevents duplicate charges | `stripeRequest` |
| URL validation | Only trusted Stripe hosts | `requireStripeHandoffUrl` |

### Fraud prevention

| Control | Implementation | Source |
| --- | --- | --- |
| Stripe Radar | Automatic fraud detection | Stripe built-in |
| Webhook verification | Only authenticated events processed | `stripe-signature.ts` |
| Account-scoped operations | No cross-account access | Auth middleware |
| Rate limiting | Prevents abuse at auth boundaries | `auth-public.ts` |

## Accounting exports

### Available data

| Data | Source | Format |
| --- | --- | --- |
| Stripe transactions | Stripe Dashboard → Reports | CSV, PDF |
| Subscription state | D1 `stripe_subscriptions` table | Database query |
| Entitlement state | D1 `entitlement_cache` table | Database query |
| AI usage | D1 `ai_usage_windows` table | Database query |

### Recommended accounting workflow

1. Monthly: Export Stripe transaction report
2. Reconcile with D1 subscription state
3. Record revenue in accounting system
4. Track AI capacity costs (Cloudflare Workers AI)
5. File applicable tax returns

## Pricing page

| Element | Implementation | Status |
| --- | --- | --- |
| Public pricing page | /pricing route | Implemented |
| Free tier description | Feature list | Implemented |
| Plus tier description | Feature list + price | Implemented |
| Checkout initiation | Stripe Checkout integration | Implemented |
| Portal access | Stripe Customer Portal | Implemented |

## Gaps and recommendations

| Gap | Risk | Recommendation |
| --- | --- | --- |
| No published refund policy | Consumer protection | Add to Terms (see TERMS_REVIEW.md) |
| No tax determination | Tax compliance | Consult tax professional; evaluate Stripe Tax |
| No formal accounting system | Financial tracking | Implement basic bookkeeping |
| No revenue dashboard | Business visibility | Build from D1 + Stripe data |
| No dunning procedure | Failed payment handling | Rely on Stripe automatic dunning |
| No proration logic | Plan changes | Stripe handles proration automatically |

## Source evidence

- `apps/sovereign-worker/src/billing/stripe.ts` — Stripe integration
- `apps/sovereign-worker/src/routes/stripe.ts` — webhook handling
- `apps/sovereign-worker/src/security/stripe-signature.ts` — signature verification
- `apps/sovereign-worker/src/billing/usage.ts` — turn accounting
- `apps/sovereign-worker/wrangler.jsonc` — price ID configuration
- `docs/legal/TERMS_REVIEW.md` — refund policy recommendation
