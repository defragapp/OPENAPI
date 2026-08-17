import { ELIGIBILITY_RULE, POLICY_CONTENT_HASH, POLICY_METADATA } from '../../../config/policies';
import type { Env } from './env';

const encoder = new TextEncoder();
const EXPORT_CONTRACT = 'sovereign-private-account-export.v1';

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string' || !value) return value ?? null;
  try { return JSON.parse(value); } catch { return value; }
}

function parseRows(rows: Array<Record<string, unknown>>, jsonFields: string[] = []) {
  return rows.map((row) => {
    const copy = { ...row };
    for (const field of jsonFields) if (field in copy) copy[field] = parseJson(copy[field]);
    return copy;
  });
}

async function allRows(env: Env, sql: string, ...bindings: unknown[]) {
  const result = await env.DB.prepare(sql).bind(...bindings).all<Record<string, unknown>>();
  return result.results ?? [];
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function releaseSha(env: Env): string {
  const value = String(env.APP_VERSION || '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(value)) throw new Response('Release identity unavailable', { status: 503 });
  return value;
}

function emailFromSubject(subject?: string | null) {
  return subject?.startsWith('email:') ? subject.slice('email:'.length) : null;
}

async function recordPrivacyEvent(env: Env, accountId: string, requestType: 'access_export' | 'policy_update', status: 'completed' | 'rejected', policyVersion?: string) {
  const sha = /^[0-9a-f]{40}$/.test(String(env.APP_VERSION || '').trim().toLowerCase())
    ? String(env.APP_VERSION).trim().toLowerCase()
    : null;
  await env.DB.prepare(`INSERT INTO privacy_request_events
    (id, account_id, request_type, status, policy_version, release_sha, requested_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      `privacy_${crypto.randomUUID()}`,
      accountId,
      requestType,
      status,
      policyVersion ?? null,
      sha,
      new Date().toISOString(),
      status === 'completed' ? new Date().toISOString() : null
    )
    .run();
}

export async function getPolicyStatus(env: Env, accountId: string) {
  const row = await env.DB.prepare(`SELECT
      terms_version,
      privacy_version,
      eligibility_confirmed_at,
      eligibility_rule_version,
      EXISTS(
        SELECT 1 FROM policy_acceptance_receipts
        WHERE account_id = ? AND policy_type = 'terms'
          AND policy_version = ? AND policy_content_hash = ?
      ) AS current_terms_receipt,
      EXISTS(
        SELECT 1 FROM policy_acceptance_receipts
        WHERE account_id = ? AND policy_type = 'privacy'
          AND policy_version = ? AND policy_content_hash = ?
      ) AS current_privacy_receipt
    FROM accounts WHERE id = ?`)
    .bind(
      accountId,
      POLICY_METADATA.terms.version,
      POLICY_CONTENT_HASH,
      accountId,
      POLICY_METADATA.privacy.version,
      POLICY_CONTENT_HASH,
      accountId
    )
    .first<Record<string, string | number | null>>();

  if (!row) throw new Response('Account not found', { status: 404 });
  const policyCurrent = row.terms_version === POLICY_METADATA.terms.version
    && row.privacy_version === POLICY_METADATA.privacy.version
    && Number(row.current_terms_receipt ?? 0) === 1
    && Number(row.current_privacy_receipt ?? 0) === 1;
  const eligibilityCurrent = Boolean(row.eligibility_confirmed_at)
    && row.eligibility_rule_version === ELIGIBILITY_RULE.version;

  return {
    current: policyCurrent && eligibilityCurrent,
    requiresReview: !(policyCurrent && eligibilityCurrent),
    policyCurrent,
    eligibilityCurrent,
    terms: POLICY_METADATA.terms,
    privacy: POLICY_METADATA.privacy,
    contentHash: POLICY_CONTENT_HASH,
    eligibility: ELIGIBILITY_RULE
  };
}

export async function acceptCurrentPolicies(request: Request, env: Env, accountId: string) {
  const body = await request.json().catch(() => ({})) as {
    termsAccepted?: boolean;
    privacyAcknowledged?: boolean;
    ageEligible?: boolean;
    termsVersion?: string;
    privacyVersion?: string;
    policyContentHash?: string;
    eligibilityRuleVersion?: string;
  };
  const matchesCurrent = body.termsAccepted === true
    && body.privacyAcknowledged === true
    && body.ageEligible === true
    && body.termsVersion === POLICY_METADATA.terms.version
    && body.privacyVersion === POLICY_METADATA.privacy.version
    && body.policyContentHash === POLICY_CONTENT_HASH
    && body.eligibilityRuleVersion === ELIGIBILITY_RULE.version;
  if (!matchesCurrent) {
    await recordPrivacyEvent(env, accountId, 'policy_update', 'rejected', POLICY_METADATA.terms.version);
    throw new Response('Current policy review and 18+ eligibility confirmation are required', { status: 409 });
  }

  const acceptedAt = new Date().toISOString();
  const sha = releaseSha(env);
  const [ipHash, userAgentHash] = await Promise.all([
    sha256(request.headers.get('cf-connecting-ip') ?? 'unknown'),
    sha256(request.headers.get('user-agent') ?? 'unknown')
  ]);

  for (const [policyType, policyVersion] of [
    ['terms', POLICY_METADATA.terms.version],
    ['privacy', POLICY_METADATA.privacy.version]
  ] as const) {
    await env.DB.prepare(`INSERT INTO policy_acceptance_receipts
      (id, account_id, policy_type, policy_version, policy_content_hash, release_sha, accepted_at, acceptance_surface, requested_ip_hash, user_agent_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'policy-update', ?, ?)`)
      .bind(
        `policy_${crypto.randomUUID()}`,
        accountId,
        policyType,
        policyVersion,
        POLICY_CONTENT_HASH,
        sha,
        acceptedAt,
        ipHash,
        userAgentHash
      )
      .run();
  }

  await env.DB.prepare(`UPDATE accounts SET
      terms_accepted_at = ?,
      terms_version = ?,
      privacy_version = ?,
      eligibility_confirmed_at = ?,
      eligibility_rule_version = ?,
      updated_at = datetime('now')
    WHERE id = ?`)
    .bind(
      acceptedAt,
      POLICY_METADATA.terms.version,
      POLICY_METADATA.privacy.version,
      acceptedAt,
      ELIGIBILITY_RULE.version,
      accountId
    )
    .run();
  await recordPrivacyEvent(env, accountId, 'policy_update', 'completed', POLICY_METADATA.terms.version);
  return getPolicyStatus(env, accountId);
}

export async function buildPrivateAccountExport(env: Env, accountId: string) {
  const account = await env.DB.prepare(`SELECT id, auth_subject, created_at, updated_at,
      terms_accepted_at, terms_version, privacy_version, onboarding_completed_at, plan_intent,
      eligibility_confirmed_at, eligibility_rule_version
    FROM accounts WHERE id = ?`)
    .bind(accountId)
    .first<Record<string, string | null>>();
  if (!account) throw new Response('Account not found', { status: 404 });

  const [
    baselineRows,
    people,
    baselineProfiles,
    currentConditions,
    systems,
    relationships,
    systemMemberships,
    invitations,
    consentGrants,
    consentVersions,
    threads,
    threadEvents,
    library,
    libraryLinks,
    corrections,
    privacySettings,
    policyReceipts,
    privacyRequests,
    passkeys,
    entitlements,
    subscriptions,
    usage,
    deletionJobs
  ] = await Promise.all([
    allRows(env, `SELECT protected_input_json, reduced_context_json, computation_version, provenance_json,
      status, uncertainty, last_computed_at, provider_status, created_at, updated_at
      FROM baseline_onboarding WHERE account_id = ?`, accountId),
    allRows(env, `SELECT id, role, display_name, source_of_truth, baseline_status, consent_status, created_at, updated_at
      FROM persons WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT bp.id, bp.person_id, bp.version, bp.summary_json, bp.source_ref, bp.active, bp.created_at
      FROM baseline_profiles bp JOIN persons p ON p.id = bp.person_id WHERE p.account_id = ? ORDER BY bp.created_at`, accountId),
    allRows(env, `SELECT cc.id, cc.person_id, cc.computed_at, cc.location_hash, cc.conditions_json, cc.source_ref,
      cc.precision_used, cc.provider_status, cc.created_at
      FROM current_conditions cc JOIN persons p ON p.id = cc.person_id WHERE p.account_id = ? ORDER BY cc.computed_at`, accountId),
    allRows(env, `SELECT id, system_type, name, metadata_json, created_at, updated_at FROM systems WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT id, source_person_id, target_person_id, relationship_type, directionality, system_id, metadata_json, created_at, updated_at
      FROM relationships WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT sm.system_id, sm.person_id, sm.role_label, sm.is_primary, sm.metadata_json, sm.created_at
      FROM system_memberships sm JOIN systems s ON s.id = sm.system_id WHERE s.account_id = ? ORDER BY sm.created_at`, accountId),
    allRows(env, `SELECT id, invited_person_id, invited_email_normalized, email_hash, status, requested_scopes_json,
      policy_version, created_at, accepted_at, revoked_at, expires_at
      FROM invitations WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT cg.id, cg.person_id, cg.scope, cg.granted_at, cg.revoked_at, cg.policy_version, cg.created_at
      FROM consent_grants cg JOIN persons p ON p.id = cg.person_id WHERE p.account_id = ? ORDER BY cg.created_at`, accountId),
    allRows(env, `SELECT cv.id, cv.person_id, cv.scope, cv.version, cv.decision, cv.reason, cv.policy_version, cv.created_at
      FROM consent_versions cv JOIN persons p ON p.id = cv.person_id WHERE p.account_id = ? ORDER BY cv.created_at`, accountId),
    allRows(env, `SELECT id, context_kind, context_ref_id, title, status, covenant_enabled, created_at, updated_at
      FROM threads WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT te.id, te.thread_id, te.seq, te.event_type, te.payload_json, te.created_at
      FROM thread_events te JOIN threads t ON t.id = te.thread_id WHERE t.account_id = ? ORDER BY te.thread_id, te.seq`, accountId),
    allRows(env, `SELECT id, thread_id, kind, body_json, created_at, updated_at FROM saved_understandings WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT id, external_ref, kind, metadata_json, created_at FROM library_links WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT id, thread_id, correction, note, saved_to_library, created_at FROM user_corrections WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT location_mode, location_precision_label, data_retention_days, accessibility_json, updated_at
      FROM account_privacy_settings WHERE account_id = ?`, accountId),
    allRows(env, `SELECT policy_type, policy_version, policy_content_hash, release_sha, accepted_at, acceptance_surface, created_at
      FROM policy_acceptance_receipts WHERE account_id = ? ORDER BY accepted_at`, accountId),
    allRows(env, `SELECT request_type, status, policy_version, release_sha, requested_at, completed_at, created_at
      FROM privacy_request_events WHERE account_id = ? ORDER BY requested_at`, accountId),
    allRows(env, `SELECT id, label, transports_json, created_at, last_used_at FROM auth_passkeys WHERE account_id = ? ORDER BY created_at`, accountId),
    allRows(env, `SELECT plan, features_json, as_of, updated_at FROM entitlement_cache WHERE account_id = ?`, accountId),
    allRows(env, `SELECT plan_key, status, current_period_end, cancel_at_period_end, created_at, updated_at
      FROM stripe_subscriptions WHERE account_id = ? ORDER BY updated_at`, accountId),
    allRows(env, `SELECT period_key, turns_used, updated_at FROM ai_usage_windows WHERE account_id = ? ORDER BY period_key`, accountId),
    allRows(env, `SELECT id, status, requested_at, scheduled_for, completed_at FROM deletion_jobs WHERE account_id = ? ORDER BY requested_at`, accountId)
  ]);

  const generatedAt = new Date().toISOString();
  const exportPayload = {
    contract: EXPORT_CONTRACT,
    generatedAt,
    releaseSha: /^[0-9a-f]{40}$/.test(String(env.APP_VERSION || '').trim().toLowerCase()) ? String(env.APP_VERSION).trim().toLowerCase() : null,
    retention: { exportArtifactStored: false, generatedOnDemand: true },
    excludedSecurityMaterial: [
      'session tokens and session hashes',
      'magic-link and email-code secrets or hashes',
      'passkey credential identifiers and public keys',
      'invitation token hashes',
      'Stripe customer and subscription identifiers',
      'webhook payloads and provider secrets'
    ],
    account: {
      id: account.id,
      email: emailFromSubject(account.auth_subject),
      createdAt: account.created_at,
      updatedAt: account.updated_at,
      termsAcceptedAt: account.terms_accepted_at,
      termsVersion: account.terms_version,
      privacyVersion: account.privacy_version,
      onboardingCompletedAt: account.onboarding_completed_at,
      planIntent: account.plan_intent,
      eligibilityConfirmedAt: account.eligibility_confirmed_at,
      eligibilityRuleVersion: account.eligibility_rule_version
    },
    baseline: parseRows(baselineRows, ['protected_input_json', 'reduced_context_json', 'provenance_json']),
    people,
    baselineProfiles: parseRows(baselineProfiles, ['summary_json']),
    currentConditions: parseRows(currentConditions, ['conditions_json']),
    systems: parseRows(systems, ['metadata_json']),
    relationships: parseRows(relationships, ['metadata_json']),
    systemMemberships: parseRows(systemMemberships, ['metadata_json']),
    invitations: parseRows(invitations, ['requested_scopes_json']),
    consent: {
      grants: consentGrants,
      history: consentVersions
    },
    conversations: {
      threads,
      events: parseRows(threadEvents, ['payload_json']),
      corrections
    },
    library: {
      understandings: parseRows(library, ['body_json']),
      links: parseRows(libraryLinks, ['metadata_json'])
    },
    privacy: {
      settings: parseRows(privacySettings, ['accessibility_json']),
      policyAcceptanceHistory: policyReceipts,
      requestHistory: privacyRequests,
      deletionRequests: deletionJobs
    },
    authentication: {
      passkeys: parseRows(passkeys, ['transports_json'])
    },
    billing: {
      entitlements: parseRows(entitlements, ['features_json']),
      subscriptions
    },
    aiUsage: usage
  };

  await recordPrivacyEvent(env, accountId, 'access_export', 'completed');
  return exportPayload;
}
