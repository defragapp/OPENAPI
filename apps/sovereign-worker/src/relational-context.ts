import type { Env } from './env';
import { hasConsent, requireConsent } from './db/people';
import {
  baselineFacetProfileSchema,
  baselineSourceDataSchema,
  buildBaselineBasisRegistry,
  validateFacetProfileBasis,
  type BaselineFacet,
  type BaselineFacetProfile,
  type BaselineSourceData,
  type BasisRegistryItem
} from './baseline-contracts';
import { getCachedBaselineFacetProfile } from './baseline-facets';
import { buildExpressionAxisValues } from './expression-field';
import type { ExpressionAxisValue } from '@sovereign/agent-contracts';

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

interface LoadedBaseline {
  facets: BaselineFacet[];
  source: BaselineSourceData;
  basisRegistry: BasisRegistryItem[];
  uncertainty: string;
  providerStatus: string;
  computationVersion: string;
  lastComputedAt: string;
}

interface ParticipantContext {
  key: string;
  label: string;
  role: string;
  facets: BaselineFacet[];
  expressionAxes: ExpressionAxisValue[];
  roleContext: Record<string, unknown>;
  uncertainty: string;
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
    loadStructuredBaseline(env, accountId),
    loadStructuredBaseline(env, person.bound_account_id)
  ]);

  const owner = participant('you', 'You', 'self', ownerBaseline, {});
  const other = participant('other', person.display_name, person.role, invitedBaseline, sanitizeRoleContext(safeJson(person.source_of_truth)));
  const pairContacts = frameworkAllowed ? buildPairContacts(ownerBaseline.source, invitedBaseline.source) : [];
  const invitedBasis = frameworkAllowed
    ? prefixBasis(invitedBaseline.basisRegistry, 'other', 'other')
    : [];
  const ownerBasis = ownerBaseline.basisRegistry;
  const visibleOwnerFacets = remapFacetRefs(owner.facets, '');
  const visibleOtherFacets = frameworkAllowed
    ? remapFacetRefs(other.facets, 'other')
    : other.facets.map((facet) => ({ ...facet, basisRefs: [] }));
  const relationshipBasis = pairContacts.map((contact): BasisRegistryItem => ({
    id: contact.id,
    category: 'relationship',
    display: contact.display,
    accessibleLabel: contact.accessibleLabel,
    computedAt: ownerBaseline.source.computedAt,
    uncertainty: contact.uncertainty,
    provenance: 'Deterministic consented pair contact',
    subject: 'relationship'
  }));

  return {
    kind: 'relationship',
    participants: [
      { ...owner, facets: visibleOwnerFacets },
      {
        ...other,
        facets: visibleOtherFacets,
        expressionAxes: frameworkAllowed
          ? remapAxisRefs(other.expressionAxes, 'other')
          : other.expressionAxes.map((axis) => ({ ...axis, basisRefs: [] }))
      }
    ],
    interaction: {
      facetPairs: pairFacetPairs(visibleOwnerFacets, visibleOtherFacets),
      sharedNeeds: 'Compare observable alignment markers in the relevant facets; do not treat similarity as compatibility.',
      differentRoutes: 'Explain how two distinct facets may reach clarity, connection, or protection differently.',
      likelyInteractionPressure: 'A possible interaction mechanism must be tied to both permitted facet profiles or a user-reported observation.',
      responsibilities: {
        you: 'The user owns their communication, choices, limits, and confirmed experience.',
        other: 'The invited person owns their communication, choices, limits, and confirmed experience.',
        relationship: 'Shared expectations require direct agreement; the comparison cannot create consent or certainty.'
      },
      userReportedObservations: extractArray(safeJson(person.source_of_truth).observations),
      unconfirmedInterpretations: [],
      missingInformation: [
        'What each person is experiencing now',
        'What each person has directly observed',
        'What has been agreed about timing, responsibilities, boundaries, and expectations'
      ],
      exactPairContacts: pairContacts
    },
    basisRegistry: [...ownerBasis, ...invitedBasis, ...relationshipBasis],
    permissions: {
      pairCompare: true,
      traitDisplay: true,
      frameworkDisplay: frameworkAllowed
    },
    provenance: {
      ownerComputationVersion: ownerBaseline.computationVersion,
      invitedComputationVersion: invitedBaseline.computationVersion,
      rawBirthInputShared: false,
      exactPrivateLocationShared: false
    }
  };
}

export async function addConsentedSystemMember(
  env: Env,
  accountId: string,
  systemId: string,
  personId: string,
  metadata: Record<string, unknown>
) {
  await requireConsent(env, accountId, personId, 'system.include');
  await requireConsent(env, accountId, personId, 'trait.display');
  const system = await env.DB.prepare('SELECT id FROM systems WHERE id = ? AND account_id = ?')
    .bind(systemId, accountId)
    .first<{ id: string }>();
  if (!system) throw new Response('System not found', { status: 404 });
  const person = await env.DB.prepare('SELECT id, bound_account_id FROM persons WHERE id = ? AND account_id = ?')
    .bind(personId, accountId)
    .first<{ id: string; bound_account_id: string | null }>();
  if (!person?.bound_account_id) throw new Response('The member identity and Baseline must be connected first.', { status: 409 });
  await env.DB.prepare('INSERT OR REPLACE INTO system_memberships (system_id, person_id, role_label, is_primary, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(systemId, personId, String(metadata.formalRole ?? 'member'), 0, JSON.stringify(metadata))
    .run();
  return { systemId, personId, consentVerified: true };
}

export async function buildSystemAnalysis(env: Env, accountId: string, systemId: string) {
  const system = await env.DB.prepare('SELECT id, name, system_type, metadata_json FROM systems WHERE id = ? AND account_id = ?')
    .bind(systemId, accountId)
    .first<{ id: string; name: string; system_type: string; metadata_json: string }>();
  if (!system) throw new Response('System not found', { status: 404 });

  const members = await env.DB.prepare(`SELECT p.id, p.display_name, p.role, p.source_of_truth, p.bound_account_id,
      sm.role_label, sm.metadata_json
    FROM system_memberships sm JOIN persons p ON p.id = sm.person_id
    WHERE sm.system_id = ? AND p.account_id = ? ORDER BY sm.created_at`)
    .bind(systemId, accountId)
    .all<Record<string, string | null>>();
  if ((members.results ?? []).length < 2) {
    throw new Response('A reviewable system requires the owner and at least two consented invited members.', { status: 409 });
  }

  const systemContext = sanitizeRoleContext(safeJson(system.metadata_json));
  const ownerBaseline = await loadStructuredBaseline(env, accountId);
  const participants: ParticipantContext[] = [
    participant('you', 'You', 'self', ownerBaseline, sanitizeRoleContext(systemContext.owner))
  ];
  const basisRegistry: BasisRegistryItem[] = [...ownerBaseline.basisRegistry];

  let ordinal = 0;
  for (const member of members.results ?? []) {
    ordinal += 1;
    const personId = member.id ?? '';
    await requireConsent(env, accountId, personId, 'system.include');
    await requireConsent(env, accountId, personId, 'trait.display');
    const frameworkAllowed = await hasConsent(env, accountId, personId, 'framework.display');
    if (!member.bound_account_id) throw new Response('Every invited member must have a bound identity and Baseline.', { status: 409 });
    const baseline = await loadStructuredBaseline(env, member.bound_account_id);
    const key = `member_${ordinal}`;
    const roleContext = {
      ...sanitizeRoleContext(safeJson(member.source_of_truth)),
      ...sanitizeRoleContext(safeJson(member.metadata_json)),
      formalRole: member.role_label ?? safeJson(member.metadata_json).formalRole ?? member.role ?? 'member'
    };
    const item = participant(key, member.display_name ?? `Member ${ordinal}`, member.role ?? 'member', baseline, roleContext);
    participants.push({
      ...item,
      facets: frameworkAllowed
        ? remapFacetRefs(item.facets, key)
        : item.facets.map((facet) => ({ ...facet, basisRefs: [] })),
      expressionAxes: frameworkAllowed
        ? remapAxisRefs(item.expressionAxes, key)
        : item.expressionAxes.map((axis) => ({ ...axis, basisRefs: [] }))
    });
    if (frameworkAllowed) basisRegistry.push(...prefixBasis(baseline.basisRegistry, key, 'other'));
  }

  return {
    kind: 'system',
    system: {
      label: system.name,
      type: system.system_type,
      sharedObjective: systemContext.sharedObjective ?? systemContext.objective ?? null,
      constraints: extractArray(systemContext.constraints),
      currentObservations: extractArray(systemContext.observations)
    },
    participants,
    systemView: {
      roles: participants.map((item) => ({ participant: item.label, role: item.role })),
      responsibilityConcentration: participants.flatMap((item) => roleValue(item, 'responsibility')),
      mediationAndWithdrawal: participants.flatMap((item) => roleValue(item, 'communicationPattern')),
      roleExpectations: participants.flatMap((item) => roleValue(item, 'expectations')),
      changeEffects: extractArray(systemContext.changeEffects),
      unknownRoles: participants.filter((item) => Object.keys(item.roleContext).length === 0).map((item) => item.label)
    },
    relationshipGraph: buildSupportedEdges(participants),
    pressureField: {
      observations: extractArray(systemContext.pressure),
      rule: 'Pressure is shown only from supplied observations or explicit role context, never from decorative links.'
    },
    basisRegistry,
    missingInformation: [
      'Responsibilities, caregiving, dependence, or material constraints that have not been supplied or confirmed',
      'Role expectations or agreements that have not been supplied or confirmed'
    ],
    responsibilityBoundaries: [
      'No participant is responsible for another participant’s internal state.',
      'Roles come only from supplied invitation or system-membership context.',
      'A formal role or practical responsibility is factual only when supplied or confirmed.'
    ],
    provenance: {
      rawBirthInputShared: false,
      exactPrivateLocationShared: false,
      consentRecheckedForEveryParticipant: true
    }
  };
}

async function loadStructuredBaseline(env: Env, accountId: string): Promise<LoadedBaseline> {
  const [row, cachedProfile] = await Promise.all([
    env.DB.prepare('SELECT status, uncertainty, reduced_context_json, computation_version, provider_status, last_computed_at FROM baseline_onboarding WHERE account_id = ?')
      .bind(accountId)
      .first<BaselineRow>(),
    getCachedBaselineFacetProfile(env, accountId)
  ]);
  if (!row || !['completed', 'ready'].includes(row.status)) {
    throw new Response('A completed Baseline is required.', { status: 409 });
  }
  const reduced = safeJson(row.reduced_context_json);
  const source = baselineSourceDataSchema.safeParse(reduced.sourceData);
  const profile = baselineFacetProfileSchema.safeParse(cachedProfile ?? reduced.facetProfile);
  if (!source.success || !profile.success) {
    throw new Response('The structured Baseline profile is still being prepared.', { status: 409 });
  }
  const basisRegistry = buildBaselineBasisRegistry(source.data);
  let validatedProfile: BaselineFacetProfile;
  try {
    validatedProfile = validateFacetProfileBasis(profile.data, basisRegistry);
  } catch {
    throw new Response('The structured Baseline profile is still being prepared.', { status: 409 });
  }
  return {
    facets: validatedProfile.facets,
    source: source.data,
    basisRegistry,
    uncertainty: row.uncertainty,
    providerStatus: row.provider_status,
    computationVersion: row.computation_version,
    lastComputedAt: row.last_computed_at
  };
}

function participant(
  key: string,
  label: string,
  role: string,
  baseline: LoadedBaseline,
  roleContext: Record<string, unknown>
): ParticipantContext {
  return {
    key,
    label,
    role,
    facets: baseline.facets,
    expressionAxes: buildExpressionAxisValues({ facets: baseline.facets }),
    roleContext,
    uncertainty: baseline.uncertainty,
    observedState: 'not_confirmed',
    unknownActualState: 'Actual emotion, motive, and present experience remain unknown unless this person confirms them.'
  };
}

function pairFacetPairs(first: BaselineFacet[], second: BaselineFacet[]) {
  const secondById = new Map(second.map((facet) => [facet.id, facet]));
  return first.flatMap((facet) => {
    const other = secondById.get(facet.id);
    return other ? [{ facetId: facet.id, you: facet, other }] : [];
  });
}

function prefixBasis(items: BasisRegistryItem[], prefix: string, subject: BasisRegistryItem['subject']): BasisRegistryItem[] {
  return items.map((item) => ({ ...item, id: `${prefix}.${item.id}`, subject }));
}

function remapFacetRefs(facets: BaselineFacet[], prefix: string): BaselineFacet[] {
  return facets.map((facet) => ({
    ...facet,
    basisRefs: prefix ? facet.basisRefs.map((id) => `${prefix}.${id}`) : facet.basisRefs
  }));
}

function remapAxisRefs(axes: ExpressionAxisValue[], prefix: string): ExpressionAxisValue[] {
  return axes.map((axis) => ({
    ...axis,
    basisRefs: prefix ? axis.basisRefs.map((id) => `${prefix}.${id}`) : axis.basisRefs
  }));
}

function buildPairContacts(first: BaselineSourceData, second: BaselineSourceData) {
  const definitions = [
    { aspect: 'conjunction', glyph: '☌', angle: 0, orb: 3 },
    { aspect: 'sextile', glyph: '⚹', angle: 60, orb: 2 },
    { aspect: 'square', glyph: '□', angle: 90, orb: 3 },
    { aspect: 'trine', glyph: '△', angle: 120, orb: 3 },
    { aspect: 'opposition', glyph: '☍', angle: 180, orb: 3 }
  ] as const;
  const glyphs: Record<string, string> = { sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇' };
  const contacts: Array<{ id: string; display: string; accessibleLabel: string; uncertainty: 'low' | 'medium' | 'high' }> = [];
  for (const left of first.natalBodies) {
    for (const right of second.natalBodies) {
      const separation = Math.abs(signedLongitudeDelta(left.longitude, right.longitude));
      for (const definition of definitions) {
        const orb = Math.abs(separation - definition.angle);
        if (orb > definition.orb) continue;
        const rounded = Math.round(orb * 10) / 10;
        contacts.push({
          id: `relationship.${left.body}.${definition.aspect}.${right.body}`,
          display: `REL ${glyphs[left.body] ?? left.body} ${definition.glyph} ${glyphs[right.body] ?? right.body} ${rounded.toFixed(1)}°`,
          accessibleLabel: `Relationship contact, your ${left.body} ${definition.aspect} their ${right.body}, ${rounded.toFixed(1)} degree orb`,
          uncertainty: left.uncertainty === 'high' || right.uncertainty === 'high'
            ? 'high'
            : left.uncertainty === 'medium' || right.uncertainty === 'medium'
              ? 'medium'
              : 'low'
        });
      }
    }
  }
  return contacts.sort((left, right) => Number(left.display.match(/(\d+\.\d+)°/)?.[1] ?? 99) - Number(right.display.match(/(\d+\.\d+)°/)?.[1] ?? 99)).slice(0, 12);
}


function roleValue(participant: ParticipantContext, key: string) {
  const value = participant.roleContext[key];
  if (value === undefined || value === null || value === '') return [];
  return [{ participant: participant.label, value, source: 'supplied role context' }];
}

function buildSupportedEdges(participants: ParticipantContext[]) {
  const allowedTypes = ['responsibility', 'reliance', 'communication'] as const;
  const keys = new Set(participants.map((item) => item.key));
  return participants.flatMap((participant) => {
    const raw = Array.isArray(participant.roleContext.connections) ? participant.roleContext.connections : [];
    return raw.flatMap((value) => {
      const connection = value && typeof value === 'object' ? value as Record<string, unknown> : {};
      const to = typeof connection.to === 'string' ? connection.to : '';
      const type = typeof connection.type === 'string' ? connection.type : '';
      if (!keys.has(to) || !allowedTypes.includes(type as typeof allowedTypes[number])) return [];
      return [{
        from: participant.key,
        to,
        type,
        detail: typeof connection.detail === 'string' ? connection.detail : '',
        source: 'supplied role context'
      }];
    });
  });
}


function sanitizeRoleContext(value: unknown): Record<string, unknown> {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
  for (const key of Object.keys(source)) {
    if (/authority/i.test(key)) delete source[key];
  }
  if (Array.isArray(source.connections)) {
    source.connections = source.connections.filter((entry) => {
      if (!entry || typeof entry !== 'object') return false;
      return String((entry as Record<string, unknown>).type ?? '') !== 'authority';
    });
  }
  return source;
}

function extractArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value.slice(0, 20) : [];
}

function signedLongitudeDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

function safeJson(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}
