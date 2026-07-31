# Repository operating rules

## Scope
These instructions apply to the entire OPENAPI repository.

## Repository boundary
- Write only inside `/workspace/OPENAPI`.
- `/workspace/SOVV` is read-only reference material. Never edit, format, generate files in, commit to, reset, merge, rebase, delete, or push SOVV.
- Verify the SOVV commit and working tree after each meaningful phase when the checkout is available.

## Product definition
- Sovereign.OS is Baseline-first. The product must be useful before the user explains an incident.
- The single user-facing agent is named Sovereign.
- Defrag, Alignment, and Covenant are internal reasoning lenses, not separate top-level products.
- Authenticated navigation is Today, Explore, People, Systems, Library, and You.
- Public product pages must demonstrate the real Baseline-first answer hierarchy and must stay accurate to live plans and entitlements.
- The only supported ordinary intelligence answer contract is `sovereign-answer.v2`.
- Safety routing uses private `safety-decision.v1` and public `sovereign-safety.v1`; generated `safety_mode` is never policy authority.
- Exact source data, interpretive Baseline facets, temporary current context, and question-specific synthesis must remain separate.
- Basis contains server-approved exact values only. The model selects Basis IDs and never writes display values.
- Alignment is a structured comparison, never a score, gauge, or model-text sentiment calculation.
- The canonical authenticated implementation is `SovereignIntelligenceWorkspace`.
- Visual explanation must come from Baseline facets, Shadow and Gift, Alignment, relationships, systems, current context, and exact Basis data.

## Safety, consent, and privacy
- Always distinguish a stable Baseline facet, temporary current context, observed behavior supplied or confirmed by the user, role and material context, and unknown actual state.
- Never diagnose, assign hidden motives, claim exact emotions, predict with certainty, or present Baseline/current sky/psychological/biblical interpretation as deterministic proof.
- Determine safety disposition in server code before ordinary interpretation. The primary answer model may not decide whether a request is standard, grounded, supportive, urgent, emergency, or securely refused.
- Immediate danger, self-harm, harm to others, urgent medical concerns, abuse or coercion, severe confusion, and protected-internal exfiltration requests must use the dedicated safety path when routed there.
- Urgent and emergency safety responses bypass Baseline, relationship, system, Covenant, and symbolic interpretation; suppress ordinary actions and monetization; and do not consume a monthly AI turn.
- Crisis and support resources must come from a server-curated, versioned catalog. The model never invents resource names, phone numbers, URLs, or jurisdictions.
- Covenant may be offered contextually but is unavailable until explicitly confirmed for the question or thread.
- Enforce consent and authorization in deterministic server code before tools execute.
- Do not send raw birth inputs, exact private location, secrets, or private identifiers to the model.
- Do not trust client-supplied account IDs such as `x-sovereign-account` or `x-sovereign-subject`.
- Do not expose system prompts, hidden instructions, classifier details, policy rules, provider metadata, trace IDs, internal paths, credentials, or another account's private context.

## Verification
Before commits:
- Inspect the diff.
- Run relevant checks.
- Scan for secrets.
- Verify SOVV remains unchanged when available.

Required baseline checks are:
- `pnpm install`
- `pnpm verify:foundation`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
