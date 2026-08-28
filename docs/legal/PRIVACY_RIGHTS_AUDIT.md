# Privacy Rights Operations Audit

Status: production privacy-rights implementation audit

Reviewed: 2026-08-28

This audit verifies that Sovereign.OS implements the privacy rights required by major data protection frameworks and that the implementation is source-verifiable.

## Implemented privacy rights

### 1. Right of access (data export)

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| User can request their data | `POST /api/v1/account/export` | `apps/sovereign-worker/src/privacy-rights.ts` |
| Export is machine-readable | JSON format with `sovereign-private-account-export.v1` contract | Export payload structure |
| Export covers all account data | 22 data categories included | `buildPrivateAccountExport` queries 22 tables |
| Authentication required | Same-origin authenticated request | Route middleware |
| No export artifact stored | Generated on demand, returned directly | `retention.exportArtifactStored: false` |
| Security material excluded | Sessions, secrets, passkeys, Stripe IDs excluded | `excludedSecurityMaterial` array |
| Privacy event recorded | `access_export` event logged | `recordPrivacyEvent` call |

**Coverage**: Account, Baseline, People, Systems, Relationships, Consent, Threads, Library, Corrections, Privacy settings, Policy receipts, Passkeys, Entitlements, Subscriptions, AI usage, Deletion history.

**Status**: IMPLEMENTED

### 2. Right to deletion (account deletion)

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| User can request deletion | Deletion workflow in UI + `enqueueJob('deletion.execute')` | `apps/sovereign-worker/src/jobs.ts` |
| Grace period before destruction | 14-day grace period with `grace` status | `deletion_jobs` table, `scheduled_for` |
| User can cancel during grace | `cancelDeletion` endpoint | `jobs.ts:177-181` |
| Subscription cancelled before deletion | `cancelAccountSubscriptions` called first | `jobs.ts:148` |
| Comprehensive table deletion | 20 account tables cleaned | `ACCOUNT_TABLE_DELETES` array |
| Email removed from Stripe customer | `email_normalized = NULL` | `jobs.ts:158-159` |
| Account pseudonymized | `auth_subject = 'deleted:' + id` | `jobs.ts:166-168` |
| Policy receipts retained (audit) | Receipts kept with pseudonymized account | Deletion inventory |
| Deletion confirmation email sent | `notifyAccountDeletionCompleted` | `jobs.ts:172-174` |
| Background jobs cleaned | Non-deletion jobs removed; deletion job minimized | `jobs.ts:160-161` |

**Deletion inventory** (20 tables + cascaded data):
- auth_magic_links, auth_email_codes, auth_passkey_challenges, auth_passkeys, auth_sessions
- baseline_onboarding, account_privacy_settings, privacy_request_events
- relationships, systems, persons (cascades: current_conditions, consent_grants, system_memberships)
- threads (cascades: thread_events), saved_understandings, library_links
- export_artifacts, export_jobs, tool_audit_events, user_corrections
- entitlement_cache, ai_usage_windows

**Status**: IMPLEMENTED

### 3. Right to policy review and re-consent

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Policy status check | `getPolicyStatus` checks current versions | `privacy-rights.ts:60-106` |
| Stale policy detection | `requiresReview: true` when versions don't match | Policy comparison logic |
| Workspace blocks until current | `AuthenticatedWorkspace` checks policy status | UI enforcement |
| Re-acceptance requires exact match | Version + content hash + eligibility rule verified | `acceptCurrentPolicies` validation |
| Separate Terms/Privacy receipts | Two receipts per acceptance (terms + privacy) | `policy_acceptance_receipts` table |
| Receipt contains full audit trail | Version, hash, release SHA, time, surface, IP hash, UA hash | Receipt schema |
| Privacy event recorded | `policy_update` event logged | `recordPrivacyEvent` call |

**Status**: IMPLEMENTED

### 4. Right to consent management (relationship data)

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Per-scope consent | 7 consent scopes defined | `CONSENT_SCOPES` in `people.ts` |
| Default denied | No consent grant exists until explicitly given | `requireConsent` check |
| Per-person consent | Consent tied to specific `person_id` | `consent_grants` table |
| Revocation | `revoked_at` timestamp on consent_grants | Consent revocation flow |
| Server-side enforcement | `requireConsent` in deterministic server code | `relational-context.ts:58-60` |
| Rechecked per query | System analysis rechecks every member | `relational-context.ts:190-192` |
| Invitation binding | Consent grants tied to invitation redemption | Invitation + consent flow |

**Consent scopes**:
- `pair.compare` — relationship comparison
- `system.include` — system analysis inclusion
- `trait.display` — trait display in answers
- `framework.display` — framework display in answers
- `current_conditions.use` — current conditions usage
- `library.link` — library linking
- `covenant.include` — covenant inclusion

**Status**: IMPLEMENTED

### 5. Right to data correction

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| User can submit corrections | Correction endpoint in thread flow | `user_corrections` table |
| Corrections recorded | Stored with thread reference | `user_corrections` schema |
| Library save option | `saved_to_library` flag | Correction flow |

**Status**: IMPLEMENTED

### 6. Right to subscription cancellation

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| User can cancel subscription | Stripe subscription cancellation | `cancelAccountSubscriptions` |
| Cancellation before deletion | Subscription cancelled in deletion flow | `jobs.ts:148` |
| Server-confirmed entitlement | Entitlement projected from Stripe events | `stripe.ts` projection logic |

**Status**: IMPLEMENTED

### 7. Age eligibility gate

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| 18+ confirmation required at signup | Explicit eligibility confirmation | `config/policies.ts` ELIGIBILITY_RULE |
| Version-tracked rule | `eligibility_rule_version` stored per account | Account schema |
| Re-confirmation on rule change | Policy status check includes eligibility | `getPolicyStatus` |

**Status**: IMPLEMENTED

## Retention enforcement

| Data category | Retention | Enforcement | Source |
| --- | --- | --- | --- |
| Unsaved thread content | 30 days | `cleanupExpired` scheduled job | `jobs.ts:213-218` |
| Thread correction notes | 30 days | Note nullified | `jobs.ts:219` |
| Security/audit metadata | 90 days | `cleanupExpired` | `jobs.ts:220-221` |
| Magic links | 30 days | Cleanup | `jobs.ts:222` |
| Email codes | 30 days | Cleanup | `jobs.ts:223` |
| Passkey challenges | 30 days | Cleanup | `jobs.ts:224` |
| Revoked sessions | 90 days | Cleanup | `jobs.ts:225` |
| Completed/failed jobs | 90 days | Cleanup | `jobs.ts:226` |
| Expired sessions | Immediate revocation | Auto-revoke on expiry | `jobs.ts:227` |
| Library understandings | Until user deletes or account deleted | No automatic cleanup | By design |
| Policy receipts | With pseudonymized account | Retained for audit | By design |

## Analytics and tracking prohibition

| Check | Implementation | Evidence |
| --- | --- | --- |
| No Google Analytics | Test enforces absence | `PrivacyComplianceContract.test.ts` |
| No Google Tag Manager | Test enforces absence | Same test |
| No Meta Pixel | Test enforces absence | Same test |
| No PostHog/Mixpanel/Segment | Test enforces absence | Same test |
| No Cloudflare Insights beacon | Test enforces absence | Same test |
| First-party storage disclosed | Cookie + localStorage + sessionStorage documented | `docs/privacy-data-flow-register.md` |

**Status**: IMPLEMENTED

## Gaps for regulatory readiness

| Gap | Applicable regulation | Risk | Recommendation |
| --- | --- | --- | --- |
| No dedicated privacy portal/email for privacy requests | GDPR Art. 38, CPRA | Medium | Establish privacy contact (can be email-based) |
| No breach notification timeline in privacy policy | GDPR Art. 33-34, state breach laws | Medium | Add breach notification commitment to privacy policy |
| No DPO or EU representative | GDPR Art. 37-38 | Low–Medium (depends on processing scope) | Assess whether DPO is required; designate if needed |
| No international transfer mechanism documented | GDPR Chapter V | Medium | Document transfer mechanism in privacy policy |
| No GDPR legal basis enumeration | GDPR Art. 6 | Medium | Add legal basis statements to privacy policy |
| No CCPA/CPRA "Do Not Sell" mechanism | CPRA | Low (no sale occurs) | Document "no sale" statement; add opt-out if needed |

## Source evidence

- `apps/sovereign-worker/src/privacy-rights.ts` — export, policy status, acceptance
- `apps/sovereign-worker/src/jobs.ts` — deletion, cleanup, retention
- `apps/sovereign-worker/src/db/people.ts` — consent management
- `apps/sovereign-worker/src/relational-context.ts` — consent enforcement
- `config/policies.ts` — policy versions and eligibility
- `docs/privacy-model.md` — privacy model
- `docs/privacy-data-flow-register.md` — data flow register
