import type { Env } from './env';
import { hasConsent, requireConsent } from './db/people';

interface BaselineRow {
  status: string;
  uncertainty: string;
  reduced_context_json: string;
  computation_version: string;
  provider_status: string;
  last_computed_at: string;
}

interface PersonRow {
  id: string;
  display_name: string;
  role: string;
  source_of_truth: string;
  bound_account_id: string | null;
}

interface ReducedParticipant {
  personId: string;
  label: string;
  role: string;
  baseline: Record<string, unknown>;
  basis?: Record<string, unknown>;
  uncertainty: string;
  providerStatus: string;
  lastComputedAt: string;
  observedState: 'not_confirmed';
  unknownActualState: string;
}

export async function buildPairComparison(env: Env, accountId: string, personId: string) {
  await requireConsent(env, accountId, personId, 'pair.compare');
  await requireConsent(env, accountId, personId, 'trait.display');
  const frameworkAllowed = await hasConsent(env, accountId, personId, 'framework.display');
  const person = await env.DB.prepare('SELECT id, display_name, role, source_of_truth, bound_account_id FROM persons WHERE id = ? AND account_id = ?')
    .bind(personId, accountId)
    .first<PersonRow>();
  if (!person) throw new Response('Person not found', { status: 404 });
  if (!person.bound_account_id) throw new Response('The invited identity is not bound yet.', { status: 409 });

  const [ownerBaseline, invitedBaseline] = await Promise.all([
    loadReducedBaseline(env, accountId),
    loadReducedBaseline(env, person.bound_account_id)
  ]);

  return {
    kind: 'pair',
    personId,
    participants: [
      participant('self', 'You', 'self', ownerBaseline, true),
      participant(person.id, person.display_name, person.role, invitedBaseline, frameworkAllowed)
    ],
    interaction: {
      possibleAlignment: sharedSignals(ownerBaseline.context, invitedBaseline.context),
      possibleFriction: differingSignals(ownerBaseline.context, invitedBaseline.context),
      roleContext: safeJson(person.source_of_truth),
      observationRule: 'Keep user-supplied observations separate from interpretations about why they happened.',
      perspectiveRule: 'Offer more than one plausible interaction explanation without deciding who is right.',
      responsibilityBoundary: 'Each person remains responsible for their own choices, communication, and confirmed experience.',
      prohibitedInference: 'This comparison does not establish a psychological profile, emotion, motive, diagnosis, moral status, or future behavior.',
      missingInformation: ['What each person is experiencing now', 'What each person has directly observed', 'Material constraints not supplied by the users']
    },
    provenance: {
      ownerComputationVersion: ownerBaseline.computationVersion,
      invitedComputationVersion: invitedBaseline.computationVersion,
      frameworkDetailShared: frameworkAllowed,
      consentCheckedAt: new Date().toISOString(),
      rawBirthInputShared: false,
      exactPrivateLocationShared: false
    }
  };
}

export async function addConsentedSystemMember(env: Env, accountId: string, systemId: string, personId: string, metadata: Record<string, unknown>) {
  await requireConsent(env, accountId, personId, 'system.include');
  await requireConsent(env, accountId, personId, 'trait.display');
  const system = await env.DB.prepare('SELECT id FROM systems WHERE id = ? AND account_id = ?').bind(systemId, accountId).first<{ id: string }>();
  if (!system) throw new Response('System not found', { status: 404 });
  const person = await env.DB.prepare('SELECT id, bound_account_id FROM persons WHERE id = ? AND account_id = ?').bind(personId, accountId).first<{ id: string; bound_account_id: string | null }>();
  if (!person?.bound_account_id) throw new Response('The member identity and Baseline must be connected first.', { status: 409 });
  await env.DB.prepare('INSERT OR REPLACE INTO system_memberships (system_id, person_id, role_label, is_primary, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(systemId, personId, String(metadata.formalRole ?? 'member'), 0, JSON.stringify(metadata)).run();
  return { systemId, personId, consentVerified: true };
}

export async function buildSystemAnalysis(env: Env, accountId: string, systemId: string) {
  const system = await env.DB.prepare('SELECT id, name, system_type, metadata_json FROM systems WHERE id = ? AND account_id = ?')
    .bind(systemId, accountId)
    .first<{ id: string; name: string; system_type: string; metadata_json: string }>();
  if (!system) throw new Response('System not found', { status: 404 });

  const members = await env.DB.prepare(`SELECT p.id, p.display_name, p.role, p.source_of_truth, p.bound_account_id, sm.metadata_json
    FROM system_memberships sm JOIN persons p ON p.id = sm.person_id
    WHERE sm.system_id = ? AND p.account_id = ? ORDER BY sm.created_at`).bind(systemId, accountId).all<Record<string, string | null>>();
  if ((members.results ?? []).length < 2) {
    throw new Response('A reviewable system requires the owner and at least two consented invited members.', { status: 409 });
  }

  const ownerBaseline = await loadReducedBaseline(env, accountId);
  const participants: ReducedParticipant[] = [participant('self', 'You', 'self', ownerBaseline, true)];
  for (const member of members.results ?? []) {
    const personId = member.id ?? '';
    await requireConsent(env, accountId, personId, 'system.include');
    await requireConsent(env, accountId, personId, 'trait.display');
    const frameworkAllowed = await hasConsent(env, accountId, personId, 'framework.display');
    const boundAccountId = member.bound_account_id;
    if (!boundAccountId) throw new Response('Every invited member must have a bound identity and Baseline.', { status: 409 });
    const baseline = await loadReducedBaseline(env, boundAccountId);
    const roleMetadata = { ...safeJson(member.source_of_truth), membership: safeJson(member.metadata_json) };
    participants.push({
      ...participant(personId, member.display_name ?? 'Member', member.role ?? 'member', baseline, frameworkAllowed),
      role: String(roleMetadata.membership && typeof roleMetadata.membership === 'object' && 'formalRole' in roleMetadata.membership
        ? (roleMetadata.membership as Record<string, unknown>).formalRole ?? member.role ?? 'member'
        : member.role ?? 'member')
    });
  }

  return {
    kind: 'system',
    system: { id: system.id, name: system.name, type: system.system_type, context: safeJson(system.metadata_json) },
    participants,
    interactionEdges: buildEdges(participants),
    sharedConstraints: participants.map((item) => ({ personId: item.personId, role: item.role, actualState: 'unknown unless confirmed' })),
    responsibilityBoundaries: [
      'No participant is assigned responsibility for another participant’s internal state.',
      'Authority, dependence, caregiving, financial limits, safety, and access constraints must be supplied before action guidance.',
      'A group-level tendency is not a group diagnosis.'
    ],
    missingInformation: ['Current observations from each participant', 'Authority and dependence details', 'Safety or coercion concerns', 'The shared decision or objective'],
    supportiveNextSteps: [
      'Ask each participant to confirm what is accurate today.',
      'Separate shared facts from interpretations.',
      'Name one responsibility each person actually controls.'
    ],
    prohibitedInferences: ['psychological profile', 'hidden motive', 'diagnosis', 'villain assignment', 'right-or-wrong verdict', 'predicted behavior', 'God’s exact intent'],
    provenance: { consentCheckedAt: new Date().toISOString(), rawBirthInputShared: false, exactPrivateLocationShared: false }
  };
}

async function loadReducedBaseline(env: Env, accountId: string): Promise<{ context: Record<string, unknown>; exactBasis: Record<string, unknown>; uncertainty: string; providerStatus: string; computationVersion: string; lastComputedAt: string }> {
  const row = await env.DB.prepare('SELECT status, uncertainty, reduced_context_json, computation_version, provider_status, last_computed_at FROM baseline_onboarding WHERE account_id = ?')
    .bind(accountId)
    .first<BaselineRow>();
  if (!row || !['completed', 'ready'].includes(row.status)) throw new Response('A completed reduced Baseline is required.', { status: 409 });
  const reduced = safeJson(row.reduced_context_json);
  return {
    context: publicBaseline(reduced),
    exactBasis: exactFrameworkBasis(reduced),
    uncertainty: row.uncertainty,
    providerStatus: row.provider_status,
    computationVersion: row.computation_version,
    lastComputedAt: row.last_computed_at
  };
}

function publicBaseline(context: Record<string, unknown>): Record<string, unknown> {
  return {
    baselineTendency: context.baselineTendency ?? 'No plain-language tendency is available.',
    currentAmplification: context.currentAmplification ?? 'Current amplification was not included.',
    userObservation: context.userObservation ?? 'No observation has been confirmed.',
    systemInference: context.systemInference ?? 'No system inference is available.',
    uncertainty: context.uncertainty ?? 'unknown',
    unknownActualState: context.unknownActualState ?? 'Actual state remains unknown unless confirmed.'
  };
}

function exactFrameworkBasis(context: Record<string, unknown>): Record<string, unknown> {
  const calculation = context.deterministicCalculation;
  if (!calculation || typeof calculation !== 'object') return {};
  const source = calculation as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const key of ['humanDesign', 'geneKeys', 'natalPlacements', 'numerology', 'currentAstronomy']) {
    const value = source[key];
    if (value && typeof value === 'object') output[key] = value;
  }
  return output;
}

function participant(personId: string, label: string, role: string, baseline: Awaited<ReturnType<typeof loadReducedBaseline>>, frameworkAllowed: boolean): ReducedParticipant {
  const output: ReducedParticipant = {
    personId,
    label,
    role,
    baseline: baseline.context,
    uncertainty: baseline.uncertainty,
    providerStatus: baseline.providerStatus,
    lastComputedAt: baseline.lastComputedAt,
    observedState: 'not_confirmed',
    unknownActualState: 'Actual emotion, motive, and present experience remain unknown unless this person confirms them.'
  };
  if (frameworkAllowed && Object.keys(baseline.exactBasis).length) output.basis = baseline.exactBasis;
  return output;
}

function sharedSignals(first: Record<string, unknown>, second: Record<string, unknown>): string[] {
  const shared = Object.keys(first).filter((key) => key in second && first[key] === second[key] && typeof first[key] === 'string');
  return shared.length ? shared.map((key) => `Both reduced contexts use compatible ${plainKey(key)} language.`) : ['No reliable shared tendency can be asserted from the available reduced context.'];
}

function differingSignals(first: Record<string, unknown>, second: Record<string, unknown>): string[] {
  const differing = Object.keys(first).filter((key) => key in second && first[key] !== second[key] && typeof first[key] === 'string' && typeof second[key] === 'string');
  return differing.length ? differing.map((key) => `${plainKey(key)} differs and may be worth checking directly rather than treating as motive.`) : ['No specific difference is asserted without stronger reduced Baseline data.'];
}

function buildEdges(participants: ReducedParticipant[]) {
  const edges: Array<{ from: string; to: string; interpretation: string; certainty: 'limited' }> = [];
  for (let index = 0; index < participants.length; index += 1) {
    for (let next = index + 1; next < participants.length; next += 1) {
      edges.push({
        from: participants[index]!.label,
        to: participants[next]!.label,
        interpretation: 'Possible interaction difference only; direct observation and current state are still required.',
        certainty: 'limited'
      });
    }
  }
  return edges;
}

function plainKey(value: string): string { return value.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(); }
function safeJson(value: string | null | undefined): Record<string, unknown> { try { return JSON.parse(value ?? '{}') as Record<string, unknown>; } catch { return {}; } }
