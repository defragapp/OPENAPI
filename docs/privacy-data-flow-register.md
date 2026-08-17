# Sovereign.OS privacy data-flow and provider register

Status: production implementation record

Reviewed: 2026-08-17

This document records data flows implemented by the current Sovereign.OS production repository. It is an operational inventory, not a representation that any provider has a particular legal role in every jurisdiction and not a substitute for executed vendor agreements or legal advice.

## Governing boundary

Sovereign.OS is Baseline-first and private by default. Raw birth inputs, exact private location, authentication material, billing identifiers, invitation secrets, and unrelated account history stay outside language-model context. Relationship and system context is permission-bound. Public sharing does not expose private workspace data.

The production release uses no R2 bucket and no Queue binding. Private account exports are generated on demand from D1 for the authenticated request and are not stored as export artifacts.

The current launch is text-first. Worlds/video generation is disabled and disconnected from the authenticated workspace, so there is **no active video-provider data flow in the current launch**. Dormant backend/component code is retained only as a future fail-closed reference.

## Data-flow register

| Service / component | Data sent or stored | Purpose | Persistence / retention | User control and boundary | Repository evidence |
| --- | --- | --- | --- | --- | --- |
| Cloudflare Workers + Assets | HTTPS requests, application responses, static assets, bounded operational request metadata | Run the public site, authenticated app, API, security headers, routing and release health | Application state is not stored in Worker memory as durable account state | Private routes require authentication; security responses use `private, no-store`; public/app host boundaries are explicit | `apps/sovereign-worker/src/runtime-entry.ts`, `apps/sovereign-worker/src/security/headers.ts` |
| Cloudflare D1 | Account state, Baseline source/reduced records, consent state, product data, policy receipts, privacy-request events, entitlement projection | Private source of truth and auditable account state | Retention follows the product-specific rules below; deletion lifecycle removes account-private records except documented bounded retention | Account-scoped queries; D1 session/bookmark consistency; deletion and export are account-bound | `apps/sovereign-worker/migrations/`, `apps/sovereign-worker/src/d1-session.ts`, `apps/sovereign-worker/src/jobs.ts`, `apps/sovereign-worker/src/privacy-rights.ts` |
| Cloudflare Durable Objects | Account/thread coordination key and turn coordination state | Serialize concurrent thread turns and idempotent message handling | Coordination state is bounded to the thread workflow; durable account content remains D1-authoritative | Namespaced by account and thread | `apps/sovereign-worker/src/durable/ThreadCoordinator.ts` |
| Cloudflare Turnstile | Security challenge response plus request information required for verification | Signup/login abuse prevention | Sovereign stores only hashed IP and user-agent evidence in its own auth/policy records where required | Required for email signup/login; failures close the auth path | `apps/sovereign-worker/src/auth-public.ts` |
| Cloudflare Workers AI + AI Gateway | Reduced/model-safe Baseline context, the user’s current question, permitted relationship/system context, and response-generation instructions | Produce structured Sovereign text answers | Raw birth details, exact private location, auth data, billing IDs and invitation secrets are excluded from model context; application logging is configured not to collect raw prompt content by default | Baseline, policy, entitlement and consent gates execute before inference; model/provider selection is release-controlled | `apps/sovereign-worker/src/agent/`, `apps/sovereign-worker/src/baseline.ts`, `packages/agent-contracts/src/model-config.ts`, `docs/privacy-model.md` |
| NASA/JPL Horizons endpoint | Astronomy query parameters required by the Baseline/current-condition engine | Deterministic astronomical computation | Results/provenance needed by the Baseline may be stored in D1; general account history is not sent | Birthplace geocoding is not performed by the provider path; unavailable provider results fail closed rather than being guessed | `apps/sovereign-worker/src/baseline-engine.ts`, `apps/sovereign-worker/src/current-conditions/` |
| Stripe | Checkout/subscription/customer data required for payment and billing portal operations | Payments, subscription lifecycle and server-confirmed Sovereign+ entitlement projection | Billing records are retained as required for subscription operation, fraud prevention, accounting and applicable law; account deletion minimizes local state as documented | Access is based only on signed/server-confirmed subscription state | `apps/sovereign-worker/src/billing/stripe.ts`, `apps/sovereign-worker/src/routes/stripe.ts`, `apps/sovereign-worker/src/jobs.ts` |
| Resend | Recipient email address, operational email subject/body and delivery identifiers required for transactional delivery | Magic-link/code delivery, invitation lifecycle and account notices | Delivery information is provider-operational; Sovereign does not put private workspace/Baseline content into transactional messages | Used only for operational email; public contact and transactional sender are `info@defrag.app` | `apps/sovereign-worker/src/email.ts`, `scripts/email-smoke.ts` |
| Dormant Worlds/video code | **No active launch data flow.** The feature flag is false and the authenticated workspace does not mount the launcher/status probe. | Future-only reference if a separately approved product decision reopens video | No generated video is produced or stored by the current launch because the feature is not active | #198 closed `not planned`; reactivation requires new privacy/cost/product/release review | `apps/sovereign-worker/src/world-video.ts`, `apps/web/src/WorldVideoLauncher.tsx`, `docs/worlds-private-video-contract.md` |

## First-party browser storage

Sovereign uses the `__Host-sovereign_session` first-party session cookie with HttpOnly, Secure, SameSite=Lax and Priority=High attributes. The workspace uses local storage for the navigation-rail display preference and session storage for temporary onboarding/upgrade-continuity state. These mechanisms are necessary product state, not behavioral-advertising storage.

The active public/app entry surfaces contain no Google Analytics, Google Tag Manager, Meta Pixel, PostHog, Mixpanel, Segment, or Cloudflare Insights beacon. `apps/web/src/PrivacyComplianceContract.test.ts` fails if those common tracker markers enter active entry surfaces.

## Retention map

- Unsaved thread content and complete AI responses: scheduled deletion after 30 days by the current production policy and cleanup job.
- Minimal security/operational metadata without conversation content: up to 90 days under the current production policy.
- Library understandings: retained until the user deletes them or the account is deleted.
- Current-condition data: user-removable and governed by the privacy settings/current-condition lifecycle.
- Policy-acceptance receipts: retained with the account/pseudonymized record as documented audit evidence.
- Privacy-request events: retained with the account to evidence access/review requests; deleted with the account.
- Account deletion: 14-day grace period; active subscription cancellation precedes destructive private-data deletion.
- Billing records: bounded records may remain when required for subscription operation, fraud prevention, accounting or applicable law.
- Private export: generated on demand in the response body, `Cache-Control: private, no-store`, no R2 object, no export-artifact copy.
- Video/Worlds media: none produced by the current launch because the feature is disabled/disconnected.

## Private export boundary

`POST /api/v1/account/export` requires an authenticated same-origin request. The JSON export includes account-owned product data and policy/consent history. It deliberately excludes:

- session tokens and session hashes;
- magic-link and email-code secrets or hashes;
- passkey credential identifiers and public keys;
- invitation token hashes;
- Stripe customer/subscription identifiers;
- webhook payloads and provider secrets.

The historical `/api/v1/export-jobs` path remains disabled; the old R2-oriented artifact schema is not the production export mechanism.

## Policy and eligibility evidence

Signup submits the exact Terms version, Privacy version and canonical policy-content hash shown by the client. Production signup also requires an affirmative 18+ launch-eligibility confirmation. Material policy updates can pause entry to the private workspace until current Terms, Privacy Policy and eligibility rule are affirmatively reviewed again.

Each accepted policy version is represented by a separate append-only Terms/Privacy receipt containing the version, canonical content hash, acceptance time, acceptance surface, exact release SHA and hashed request evidence. The account row keeps current convenience state; the receipt history is the audit evidence.

The 18+ rule is a Sovereign.OS launch eligibility decision. It is not documented as a statement that every applicable law universally requires an 18+ minimum.

## Deletion path

The deletion workflow schedules a 14-day grace period, permits cancellation during that period, cancels active Stripe subscriptions before destructive deletion, removes account-private records and minimizes retained billing state. The deletion inventory is maintained in `apps/sovereign-worker/src/jobs.ts` and tested by the release-closure smoke.

## Governance gaps that remain external to this repository

This repository can prove application behavior, but it cannot itself prove executed data-processing agreements, vendor-account access reviews, corporate personnel controls, insurance, legal entity records, or independent audit evidence. Those artifacts must be maintained in the appropriate corporate/compliance system and linked to this register when available.
