Auth & Billing — Subagent

Scope
- Verify auth boundaries, onboarding gates, account authorization, and entitlement checks
- Verify Stripe integration: webhook path /api/v1/stripe/webhook, signature verification at app layer, no unsafe Service Auth replacing scoped Access bypass

Actions
- Probe live endpoints with safe GET/POST where permitted; do not invent credentials
- Confirm 401 on unsigned Stripe webhook requests; ensure idempotency and retry behavior preserved
- Report concrete gaps, logs, and minimal test updates back to primary agent
