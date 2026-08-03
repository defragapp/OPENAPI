# Security Incident Response Runbook

This runbook covers suspected credential exposure, unauthorized repository access, customer-data exposure, account takeover, payment abuse, production compromise, and significant service abuse.

## 1. Contain

- Preserve owner access and verified recovery methods.
- Revoke unauthorized sessions, collaborators, tokens, deploy keys, apps, and service access.
- Disable an affected route, integration, or credential only when a safe replacement or containment path is ready, unless active exploitation requires immediate shutdown.
- Apply temporary Cloudflare rules or Access restrictions when they reduce exposure without blocking required customer or provider traffic.
- Do not delete evidence before preserving it.

## 2. Preserve evidence

Record:

- Detection time and source.
- Affected service, route, account, repository, or credential category.
- Relevant commit IDs, event IDs, request IDs, provider audit events, and timestamps.
- Actions taken and by whom.
- Current production impact.

Do not copy full secrets, payment data, authentication cookies, private customer content, exact location history, or birth records into the incident log.

## 3. Assess scope

Determine:

- What was exposed or changed.
- The earliest and latest plausible exposure times.
- Which identities, environments, and providers were affected.
- Whether production data was accessed, altered, exported, or deleted.
- Whether billing, authentication, consent, or entitlements were affected.
- Whether the issue remains exploitable.

Distinguish confirmed facts from assumptions and unresolved questions.

## 4. Eradicate and recover

- Rotate compromised credentials using the credential-rotation runbook.
- Patch the root cause through a reviewed branch and pull request.
- Restore safe configuration from repository-owned sources of truth.
- Verify migrations, release gates, security headers, authentication boundaries, billing flows, webhooks, and health/readiness.
- Monitor provider audit logs and production telemetry for recurrence.

Cloudflare Workers Builds connected to the canonical repository remains the production release authority unless the incident itself makes that path unsafe.

## 5. Notify appropriately

Escalate to the repository owner immediately for any confirmed or suspected exposure involving:

- Customer or account data.
- Authentication or signing secrets.
- Payment or Stripe data.
- Production infrastructure control.
- Unauthorized repository access.
- Material service interruption.

Legal, regulatory, customer, provider, insurer, or law-enforcement notification decisions require the owner and appropriate qualified counsel. Do not make unsupported claims about breach scope or legal obligations.

## 6. Close and improve

Before closing the incident:

- Confirm containment and remediation.
- Confirm revoked credentials no longer work.
- Confirm production checks pass.
- Document the root cause and contributing controls.
- Add or strengthen automated checks where practical.
- Track unresolved provider-plan, billing, or permissions blockers separately.
- Remove temporary emergency controls that are no longer necessary.
