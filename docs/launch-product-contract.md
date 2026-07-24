# Sovereign.OS launch product contract

Status: founder-approved direction for pre-deployment work as of July 24, 2026.

This document is the product boundary for the first public approval candidate. It prevents implementation agents from guessing positioning, access, religious framing, multi-user behavior, or retention policy.

## Approval scope

The approval candidate must include real multi-user behavior. A self-only preview with static pair or system placeholders is not sufficient for approval.

Before approval, Sovereign.OS must support:

- authenticated invited-person identity;
- invitee-controlled, scope-specific consent;
- reduced Baseline comparison for two people;
- reduced Baseline overlays for families, households, teams, workplaces, and custom groups;
- immediate enforcement of consent revocation;
- participant-level uncertainty, provenance, role context, and responsibility boundaries;
- structured results that never merge a group into a diagnosis or inferred hidden motive.

A workspace owner may request access, cancel an invitation, remove a person from their workspace, or stop using shared context. A workspace owner may never grant consent on behalf of another person.

## Public Baseline language

The primary interface uses simple, human language. Users should not need to understand astrology, Human Design, Gene Keys, numerology, source files, model configuration, or framework terminology to receive useful help.

Those frameworks may remain inside the private computation and provenance boundary when authorized and technically justified. They must not be exposed as the primary explanation or presented as scientifically verified psychological measurement.

The public answer must keep these categories separate:

1. Baseline tendency
2. Current amplification
3. User-confirmed observation
4. Role, authority, dependence, or material context
5. Unknown actual state

## Covenant

Covenant is a primary launch capability.

Sovereign may recognize that a family or relational dynamic could be explored through a relevant biblical metaphor or Scripture pattern. The primary grounded answer must remain complete without Covenant.

When relevant, Sovereign may offer a subtle action such as **Explore through Scripture**. Covenant must not activate until the user explicitly chooses it for the current question or thread.

Covenant must:

- retrieve Scripture from an approved, verifiable source;
- keep passage text, metaphorical application, and practical suggestion separate;
- preserve the Baseline, Current, Observed, Role Context, and Unknown boundaries;
- avoid claims about God's exact intent;
- avoid using Scripture as proof of another person's motive, diagnosis, future behavior, or moral status;
- avoid automatic requirements for estrangement, contact, reconciliation, forgiveness, submission, or continued exposure to harm;
- account for safety, coercion, authority, dependence, caregiving, and practical constraints;
- require the relevant consent scope before another person's Baseline or saved context is included.

## Free access and billing

Free is a permanent first-party plan, not a Stripe subscription and not a temporary trial.

- Free allowance: 10 Sovereign AI turns per UTC calendar month.
- Sovereign+ remains a Stripe-backed paid subscription.
- Entitlements must be enforced server-side on every protected route.
- A payment failure, cancellation, or expired subscription must resolve safely to Free without deleting the user's workspace.

Any future free trial of Sovereign+ requires a separate founder decision.

## Support contributions

The existing Stripe support product is a voluntary contribution toward continued Sovereign.OS development and grants no access, subscription, feature, or entitlement.

No support or donation action is included in the approval candidate until the founder explicitly confirms why it belongs in the product and where it should appear. Existing Stripe objects may remain active, but the application must not silently introduce support placement.

## Retention

Use purpose-specific retention rather than one blanket period.

- Unsaved thread content and complete AI responses: 30 days.
- Minimal security and operational audit metadata without conversation content: 90 days.
- Explicitly saved Library understandings: retained until the user deletes them or closes the account.
- Export artifacts: seven days unless a shorter period is configured.
- Magic links and sessions: existing purpose-specific expiry.
- Billing records: retained only as required for subscription operation, accounting, fraud prevention, and applicable law.

Retention periods must be visible in Privacy and account controls. Scheduled cleanup must be tested. Saved Library records must not depend on retaining the source thread. Full prompts, raw birth input, exact private location, provider credentials, and hidden reasoning must never be written to operational logs.

## Approval evidence

Production deployment is prohibited until all of the following are available for one exact commit SHA:

- green CI;
- protected Cloudflare preview;
- successful D1 migration replay;
- authenticated desktop and iPhone smoke tests;
- real invitation, identity, grant, comparison, revocation, and blocked-after-revocation flow;
- family or team overlay with at least three consented users;
- validated structured AI output before display;
- Covenant suggestion and explicit-enable verification;
- Free allowance, paid upgrade, cancellation, and fallback verification;
- 30-day thread and 90-day audit retention tests;
- reviewed Terms and Privacy documents;
- zero raw birth inputs, exact private locations, secrets, unconsented person data, or hidden reasoning in logs and traces;
- explicit founder approval.
