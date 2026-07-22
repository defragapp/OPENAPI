# Sovereign tool contracts

All tools return reduced, typed data. Tool errors must be safe to show and must never leak secrets or raw upstream payloads.

## Personal

- `get_my_baseline_summary(personId, focus?, verbosity?)`
- `explore_my_baseline_dimension(personId, dimension)`
- `get_my_current_conditions(personId, locationMode)`
- `compare_baseline_to_current_conditions(personId)`
- `explain_framework_source(sourceRef)`
- `save_personal_understanding(threadId, payload)`

## People

- `list_my_people(accountId)`
- `get_person_relationship(relationshipId)`
- `get_consented_baseline_context(personId, scope)`
- `compare_two_baselines(leftPersonId, rightPersonId, lens)`
- `explain_two_perspectives(relationshipId, focus?)`
- `assess_pair_alignment(relationshipId, includeCurrentConditions)`

## Systems

- `list_my_systems(accountId)`
- `get_family_system(systemId)`
- `get_team_system(systemId)`
- `analyze_role_distribution(systemId)`
- `analyze_group_interactions(systemId, focus?)`
- `assess_system_alignment(systemId)`
- `compare_current_conditions_across_members(systemId)`

## Continuity

- `retrieve_prior_understanding(accountId, query, context)`
- `save_understanding(threadId, kind, payload)`
- `update_relationship_context(relationshipId, patch)`
- `record_user_correction(threadId, correction)`
- `manage_consent(personId, scope, decision)`

## Covenant

- `retrieve_scripture(topic, translation, maxPassages)`
- `apply_biblical_lens(threadId, passageIds, scope)`

Covenant tools require explicit opt-in and must state their limits.
