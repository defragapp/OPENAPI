# Full Baseline compiler validation matrix

Status: implementation in progress under issue #114. This document is the independent-review contract. It does not authorize merge or deployment.

## Release rule

A Baseline value may be marked `confirmed` only when all of the following are true:

1. the deterministic algorithm and source version are identified;
2. the input precision required by that value is available;
3. at least one independent external fixture agrees within the documented tolerance;
4. uncertainty and unavailable states are represented explicitly;
5. the exact technical value and its provenance can be rendered through Basis without exposing private source data;
6. correction and recomputation produce a new versioned result without mutating prior evidence;
7. account deletion removes the source, compiler run, stage output, derived facets, and Basis evidence.

AI-generated interpretation is never a technical fixture and cannot promote a value to `confirmed`.

## Current implementation status

| Module | Current staged output | Allowed validation state | Allowed in Basis | Required before full approval |
|---|---|---:|---:|---|
| Birthplace resolution | Server-resolved GeoNames candidate, explicit user confirmation, encrypted coordinates and IANA timezone | `confirmed` only for the confirmed candidate record; provider accuracy remains reviewable | Provider identity and private coordinates are not Basis | Provider privacy/licensing review, ambiguity fixtures, deletion/expiry tests |
| Historical civil time | Confirmed IANA timezone applied to the birth date and local time | `supported_reduced` | No raw date, time, timezone, or offset in Basis | DST gaps/folds, historical rule transitions, unknown/approximate/window fixtures |
| Natal body positions | NASA/JPL Horizons geocentric ecliptic longitude/latitude for supported bodies | `supported_reduced` | Exact body/sign/degree/retrograde may be Basis after external comparison | Independent ephemeris fixtures across dates, locations, retrograde boundaries, tolerance documentation |
| Major natal aspects | Deterministic angular separation for conjunction, sextile, square, trine, opposition | `supported_reduced` | Exact aspect and orb may be Basis after fixture approval | Independent chart fixtures and orb-boundary cases |
| Ascendant, Midheaven, house cusps, placement houses | Unavailable | `pending` | No | Validated topocentric house implementation, house-system declaration, polar-latitude behavior, birth-time precision rules |
| Date numerology | Life Path and Birth Day only | `supported_reduced` | Exact approved values may be Basis after fixture approval | Published calculation rules, master-number policy, independent fixtures |
| Full name numerology | Unavailable | `pending` | No | Approved systems/ciphers, normalization and diacritic policy, suffix/punctuation policy, independent fixtures |
| Human Design | Unavailable; provisional personality-only values are stripped from the staged compiler | `pending` | No HD values | Licensed/approved gate wheel and design-date method, personality and design activations, channels, centers, definition, Type, Strategy, Authority, Profile, independent fixtures |
| Gene Keys | Unavailable; values derived from provisional HD activations are stripped | `pending` | No Gene Keys values | Approved sphere/sequence mapping, dependence on validated activations, independent fixtures |
| Facets | Cloudflare Workers AI through AI Gateway, generated only from the sanitized technical source and validated Basis IDs | `supported_reduced` | Facets are interpretive; only their referenced technical IDs enter Basis | Prompt/version fixtures, invented-ID rejection, private-source exclusion, deterministic source completeness |
| Current overlay | Existing deterministic current-position/contact contract | Separate existing review | Exact approved current values only | Revalidate against the completed natal source and provenance rules |
| Relationship/system synthesis | Existing consent-aware contracts | Separate existing review | Only consented approved Basis IDs | Verify no private source or unconsented Baseline crosses context boundaries |

## Source and privacy assertions

The independent reviewer must prove the following with tests and D1 inspection:

- full birth-record name, preferred/current name, birth date, local birth time, time certainty, birthplace query, coordinates, timezone, and provider candidate are encrypted at rest;
- ciphertext is bound to the owning account through AES-GCM additional authenticated data;
- job payloads contain only opaque account/run identifiers and never source details;
- stage outputs, status responses, logs, analytics, cache keys, and persisted errors contain no names, birth details, coordinates, or timezone;
- the Cloudflare AI context contains sanitized technical values and Basis IDs only;
- GeoNames receives only city/region/country and candidate coordinates required for timezone resolution;
- expired place candidates are removed automatically;
- correction supersedes the prior source and creates a versioned recomputation;
- account deletion removes `baseline_place_resolutions`, `baseline_source_records`, `baseline_compiler_runs`, cascading stage results, onboarding output, facets, and related evidence.

## Job and idempotency assertions

For every compiler stage:

- a run is uniquely keyed by account, normalized source hash, and compiler version;
- only the declared next stage may execute;
- a D1 lease prevents simultaneous ownership;
- an expired lease can be reclaimed;
- retry payloads remain opaque;
- retries use bounded backoff and a finite maximum;
- a completed stage is not duplicated;
- a superseded source cancels active older runs;
- source/envelope/compiler version mismatches fail closed;
- a stage failure records only an approved failure code;
- `unavailable` is not converted to a guessed or empty `confirmed` value;
- final status remains `degraded` until every required module is independently approved.

## Required external fixture set

At minimum, the reviewer must provide fixtures for:

1. exact, approximate, unknown, and time-window birth inputs;
2. DST spring gaps, autumn folds, and historical timezone changes;
3. ambiguous same-name cities in different regions/countries;
4. equatorial, mid-latitude, high-latitude, and polar-edge locations;
5. each supported natal body, sign boundary, and retrograde station;
6. each supported aspect at exact, inside-orb, boundary, and outside-orb positions;
7. every approved numerology/name calculation, including punctuation, spaces, suffixes, diacritics, and non-Latin names;
8. complete Human Design charts covering every Type, Authority, Profile, definition class, center state, and representative channel/gate combinations;
9. complete Gene Keys profiles covering every approved sphere and sequence;
10. correction, recomputation, interrupted-job resume, concurrent claim, deletion, and retention behavior.

Fixture provenance must record the external reference, retrieval date, expected technical values, tolerance, and reviewer identity. Screenshots alone are insufficient when machine-readable reference output is available.

## AI context and Basis review

The reviewer must inspect generated model requests and prove they exclude:

- full or preferred name;
- birth date or local birth time;
- birthplace text, coordinates, timezone, or offset;
- provider credentials or raw provider response;
- unvalidated provisional HD/Gene Keys values;
- unconsented relationship/system source data.

Basis must contain only approved IDs rendered by the server from exact deterministic values. The model may select existing Basis IDs but may not create, edit, or render technical values.

## Legacy migration

Pre-0014 Baselines contain reduced output and one-way hashes only. Migration marks them `legacy_reduced` with `source_reentry_required`. They must not be reverse engineered, copied into the encrypted source table, or represented as recomputable. The product must request source re-entry and run the new compiler.

## Release blockers

The draft branch must remain undeployable while any of these conditions is true:

- `baselineFullCompiler` is not `configured` after independent approval;
- required deterministic modules or fixtures are incomplete;
- provisional SOVV logic appears in production code or persisted output;
- source encryption, deletion, consent, AI-context, or job-idempotency tests are missing or failing;
- release scripts still identify an unreviewed migration or commit;
- the exact merged SHA has not passed the full repository verification suite.

Only after reviewer approval may the release owner update the readiness approval constant, migration fingerprints, required Cloudflare secrets/bindings, and production release metadata. That approval change must be a distinct reviewed commit.

## Production verification after merge

After reviewed changes reach `main`, verify through Cloudflare Workers Builds:

- deployed version equals the exact merged SHA;
- approved D1 migration applied once;
- `/health` reports configured dependencies without exposing secrets;
- `/ready` returns `true` only with the explicit full-compiler approval;
- synthetic Baseline construction reaches the expected terminal status;
- technical Basis output contains only confirmed values and provenance;
- correction produces a new source hash/version and recomputation;
- account deletion removes encrypted source, candidates, stage results, facets, and evidence;
- no direct OpenAI runtime, Queue, R2, Workflow, second Worker, or SOVV production dependency was introduced.
