# Sovereign.OS SOC 2 readiness controls

Status: readiness evidence only

Reviewed: 2026-08-17

**This document is not a SOC 2 report, certification, attestation, audit opinion, or claim of SOC 2 compliance.** A SOC 2 examination is performed by an independent CPA firm against an in-scope system description and controls. This repository records engineering controls and evidence that may support future readiness work.

The control families below are organized around the AICPA Trust Services Criteria categories: Security, Availability, Processing Integrity, Confidentiality, and Privacy. Reference: AICPA & CIMA, *2017 Trust Services Criteria (With Revised Points of Focus — 2022)*, https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022 .

## Control status vocabulary

- **Implemented** — code/configuration and deterministic release evidence exist in this repository.
- **Implemented / operating evidence required** — the technical control exists, but a future audit would need time-bounded operating evidence.
- **External evidence required** — the repository cannot prove the organizational/vendor evidence by itself.

## Security

| ID | Objective | Implementation / evidence | Status | Evidence cadence / gap |
| --- | --- | --- | --- | --- |
| SEC-01 | Restrict private application access to authenticated accounts | Signed account sessions; private API/page boundary; host-only secure session cookie; noindex private pages | Implemented | `auth-session.ts`, `runtime-entry.ts`, auth tests; retain release-gate evidence each release |
| SEC-02 | Provide phishing-resistant account authentication option | WebAuthn/passkey registration/login with challenge expiry, user verification, RP/origin validation, replay/signature-counter checks | Implemented | `auth-passkeys.ts`, `security/webauthn-es256.ts`, migration `0014`; operating enrollment/revocation evidence would be required for audit |
| SEC-03 | Reduce automated abuse at public authentication boundaries | Cloudflare Turnstile, per-IP hashed request evidence, auth rate limiting, fail-closed production configuration | Implemented | `auth-public.ts`, auth smoke |
| SEC-04 | Prevent credentials and secrets from entering source control | Repository secret scan in the production release gate | Implemented | `pnpm scan:secrets` on every certified release |
| SEC-05 | Apply transport/browser security headers | HSTS, nosniff, frame protection, private no-store responses, CSP/security header authority | Implemented | `security/headers.ts`, release route checks |
| SEC-06 | Protect high-risk API operations from malformed/abusive traffic | Cloudflare WAF/rate-limit/API Shield configuration with Free-plan-compatible controls | Implemented / operating evidence required | `configure-cloudflare-free-tier.mjs`; future audit needs Cloudflare-side configuration/export evidence over the audit period |
| SEC-07 | Verify payment events before entitlement changes | Stripe webhook signatures and server-confirmed subscription projection | Implemented | Stripe route/tests/smoke; future audit needs sampled operating evidence |
| SEC-08 | Minimize account security evidence | IP/user-agent evidence used for policy/auth auditing is SHA-256 hashed; raw values are not stored in policy receipts | Implemented | migrations `0016`, auth contract tests |

## Availability

| ID | Objective | Implementation / evidence | Status | Evidence cadence / gap |
| --- | --- | --- | --- | --- |
| AVL-01 | Expose deterministic health and readiness state | `/health` and `/ready` publish release SHA, migration parity and critical dependency state | Implemented | exact-SHA release verification on every production deploy |
| AVL-02 | Prevent deployment with missing database schema | D1 migration validation, remote migration application before deploy, `/ready` migration parity | Implemented | migrations + release orchestrator + parity tests |
| AVL-03 | Keep AI capacity failures bounded and explicit | Workers AI daily capacity ledger; fail-closed behavior when AI/configuration is unavailable; failed requests release usage reservation | Implemented | capacity tests, gateway smoke |
| AVL-04 | Make releases single-deploy and evidence-based | Preflight → migrations → one deploy → postconditions → release evidence; failure progress never triggers an automatic second deploy | Implemented | release-orchestrator tests and release evidence records |
| AVL-05 | Maintain recovery evidence | Application-level release/deployment evidence exists; formal backup/restore testing and business recovery objectives are not established by this repository | External evidence required | Define RTO/RPO, backup ownership and scheduled restore exercise before SOC 2 audit scoping |

## Processing Integrity

| ID | Objective | Implementation / evidence | Status | Evidence cadence / gap |
| --- | --- | --- | --- | --- |
| PI-01 | Prevent duplicate state-changing AI turns | Thread Durable Object coordination plus idempotency keys and D1 turn state | Implemented | worker integration tests |
| PI-02 | Project paid access only from authoritative payment state | Stripe event ordering, signed webhook handling and entitlement cache projection | Implemented | Stripe tests/smoke |
| PI-03 | Produce Baseline output from deterministic provider-backed computation without silent guessing | Provenance, uncertainty state, recorded test fixtures only in test mode, provider-unavailable fail-close | Implemented | baseline engine tests and smoke |
| PI-04 | Keep release evidence tied to exact code and schema | Full 40-character commit SHA, exact migration version, route/visual/DMARC evidence, D1 readback and production convergence | Implemented | release evidence library/writer and release gate |
| PI-05 | Bind policy acceptance to the exact content presented | Canonical policy hash, explicit version tuple, stale-client rejection, exact release SHA, append-only receipts | Implemented | `config/policies.ts`, migrations `0016`/`0017`, auth/privacy tests |
| PI-06 | Make privacy access non-persistent by design | Account export is assembled on demand, returned directly, `private, no-store`, and not written to R2/export artifacts | Implemented | `privacy-rights.ts`, runtime route, release-closure smoke |

## Confidentiality

| ID | Objective | Implementation / evidence | Status | Evidence cadence / gap |
| --- | --- | --- | --- | --- |
| CONF-01 | Keep raw sensitive Baseline inputs outside model context | Model-safe Baseline reduction; raw birth details, exact private location, auth material, billing IDs and invitation secrets excluded | Implemented | `docs/privacy-model.md`, Baseline smoke, advertised AI-context tests |
| CONF-02 | Prevent one account from authorizing another person’s private data | Account-bound invitation redemption and use-specific consent; owner-granted consent blocked | Implemented | People/consent tests and product smoke |
| CONF-03 | Avoid unnecessary export copies | No R2 binding; account export uses direct authenticated response and does not retain an artifact | Implemented | configs, privacy-rights source, release closure smoke |
| CONF-04 | Avoid public source disclosure | Production build verifies no `.map` files are served publicly | Implemented | `verify:public-source-maps` each release |
| CONF-05 | Bound operational logging | AI calls use bounded logging configuration; privacy policy prohibits raw prompt logging by default | Implemented / operating evidence required | code/config evidence exists; future audit requires provider/account log settings and samples over period |
| CONF-06 | Maintain vendor/confidentiality agreements | Vendor contracts, DPAs, confidentiality terms and access authorizations are not stored/proven by this repository | External evidence required | Maintain vendor register/contracts and periodic review evidence outside source control |

## Privacy

| ID | Objective | Implementation / evidence | Status | Evidence cadence / gap |
| --- | --- | --- | --- | --- |
| PRIV-01 | Give notice at account and sensitive Baseline collection | Linked Terms/Privacy at signup; Baseline notice states raw birth/exact private location model boundary | Implemented | web privacy contract tests |
| PRIV-02 | Record auditable consent to current policies | Separate Terms/Privacy receipts containing version, hash, accepted time, acceptance surface, exact release SHA and hashed request evidence | Implemented | migration `0016`, `privacy-rights.ts` |
| PRIV-03 | Re-present materially changed policies | Workspace checks current policy/eligibility status before showing private product and requires explicit re-acceptance when stale | Implemented | `AuthenticatedWorkspace.tsx`, privacy contract tests |
| PRIV-04 | Enforce launch eligibility | Signup and policy update require explicit confirmation that the account holder is 18+; eligibility rule/version is account-auditable | Implemented | policy config, runtime signup gate, migration `0017` |
| PRIV-05 | Provide account data access | Authenticated same-origin on-demand JSON export of account-owned data with security/provider secrets excluded | Implemented | `/api/v1/account/export`, Account & Library UI |
| PRIV-06 | Provide deletion and cancellation | 14-day grace period, visible cancellation, subscription cancellation before destructive deletion, account-private deletion inventory | Implemented | Account control UI, `jobs.ts`, deletion tests |
| PRIV-07 | Respect relationship consent | Per-use permission, denial/revocation, identity binding and recheck before relationship/system use | Implemented | People/System flows and tests |
| PRIV-08 | Apply retention controls | 30-day unsaved thread/content cleanup, 90-day operational/audit metadata window, explicit Library retention and cleanup jobs | Implemented / operating evidence required | cleanup job/tests; audit would require scheduled-execution evidence over period |
| PRIV-09 | Avoid undeclared behavioral tracking | Active entry surfaces are guarded against common analytics/ad tracker markers; first-party necessary storage is disclosed | Implemented | `PrivacyComplianceContract.test.ts` |
| PRIV-10 | Maintain data-flow/provider inventory | Operational register maps Cloudflare, D1, DO, Turnstile, Workers AI/Gateway, JPL, Stripe, Resend and optional Worlds renderer | Implemented / operating evidence required | `docs/privacy-data-flow-register.md`; review when provider/data path changes |

## Age eligibility and child-data boundary

Sovereign.OS uses an **18+ launch eligibility rule as a product choice**, not as a statement that all applicable law universally requires 18+. The FTC describes COPPA as applying to child-directed services collecting personal information from children under 13 and to general-audience services with actual knowledge of collection from a child under 13. See FTC, *Complying with COPPA: Frequently Asked Questions*, https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions .

The 18+ rule deliberately keeps the initial public launch outside intended child/teen use while the product handles sensitive birth-related inputs and private AI context. A later change to age eligibility requires separate legal/product review; it must not be changed only as UI copy.

## Evidence that must exist outside GitHub before an audit

The application repository is only part of a SOC 2 readiness program. At minimum, a future audit scope would need independently maintained evidence for:

1. legal entity and system-scope definition;
2. workforce roster, onboarding/offboarding and confidentiality commitments;
3. privileged-access inventory and periodic access reviews for GitHub, Cloudflare, Stripe, Resend and other in-scope systems;
4. vendor agreements, DPAs/subprocessor review and vendor-risk decisions;
5. incident-response plan, contact tree and completed tabletop/exercise evidence;
6. formal risk assessment and risk-treatment decisions;
7. backup/recovery ownership, RTO/RPO and successful restore-test evidence;
8. change-management approvals or equivalent documented release ownership over the audit period;
9. vulnerability/dependency management evidence over time;
10. security/privacy training evidence where personnel are in scope;
11. policy approval/review records;
12. the independent CPA firm’s system-description, control-design and operating-effectiveness scoping requirements.

## Release evidence relationship

A green `pnpm verify:cloudflare-build` proves the repository’s deterministic release gates at a specific commit. A successful production release then proves exact-SHA `/health` and `/ready` convergence plus release evidence. Neither event by itself constitutes a SOC 2 examination or a claim that controls operated effectively for an audit period.
