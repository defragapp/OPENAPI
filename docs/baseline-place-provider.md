# Baseline birthplace and timezone provider

Status: implementation provider selected; production approval pending independent privacy and reliability review.

## Provider

The implementation adapter uses GeoNames over its secure HTTPS web-service endpoint.

- Search service: `searchJSON`
- Timezone service: `timezoneJSON`
- Runtime identity: `GeoNames` / `geonames-webservices.v1`
- Authentication: a server-held GeoNames username and optional token
- Attribution displayed in the confirmation UI: `GeoNames`

Official sources:

- GeoNames terms and data export: https://www.geonames.org/export/
- Web-service documentation: https://www.geonames.org/export/web-services.html
- Search service: https://www.geonames.org/export/geonames-search.html
- Timezone service: https://www.geonames.org/export/web-services.html#timezone
- Commercial service/SLA information: https://www.geonames.org/commercial-webservices.html

GeoNames states that its data is available under Creative Commons Attribution, permits commercial use, and requires attribution. The public service has daily and hourly credit limits. GeoNames recommends commercial web services for professional or mission-critical use.

## Data sent to GeoNames

Only the minimum place-resolution material is sent:

- city;
- region/state/province when supplied;
- country;
- candidate latitude and longitude for the timezone lookup.

The adapter does **not** send:

- account ID;
- email;
- full birth name or preferred name;
- birth date;
- birth time or time certainty;
- relationship, system, thread, or AI context.

The GeoNames account credential remains server-side. The browser never calls GeoNames directly.

## Internal storage and retention

Candidate source details are encrypted with the same account-bound AES-GCM source key used by the Baseline source record. D1 stores only:

- an opaque candidate ID;
- account ID;
- a one-way normalized query hash;
- key version, nonce, and ciphertext;
- resolver source/version/confidence;
- confirmation and expiry timestamps.

The default candidate lifetime is 30 minutes. The code bounds candidate retention between 5 minutes and 24 hours. Expired candidates must be deleted by the repository retention job. Confirmed canonical source data is retained only as encrypted ciphertext until correction, supersession, or account deletion.

No place query, coordinates, or timezone may be written to application logs, analytics, job payloads, cache keys, persisted errors, or model prompts.

## Historical-timezone behavior

GeoNames returns an Olson/IANA timezone identifier for the resolved coordinates. Sovereign.OS stores that identifier and applies its historical rules to the confirmed birth date and local time in the deterministic calculation layer. The current offset returned by GeoNames is not used as the birth offset.

No UTC, `0,0`, current-device timezone, or approximate fallback is permitted.

## Ambiguity and confirmation

The provider returns at most four populated-place candidates. A result is high-confidence only when the city, region, and country match uniquely. The authenticated product flow always presents the server candidates for explicit confirmation before source persistence and compilation.

The server compatibility adapter may auto-confirm only one unique high-confidence match. It never auto-confirms medium- or low-confidence results.

## Failure policy

There is no second public geocoder and no public timezone fallback.

- Missing credentials: fail closed.
- Non-HTTPS provider URL: fail closed.
- No results: request a more precise city/region/country.
- Ambiguous results: require explicit choice.
- Invalid or absent IANA timezone: discard the candidate.
- Capacity or provider failure: return a retryable unavailable response without guessing.

## Production approval blockers

The adapter must not be treated as production-approved until an independent reviewer confirms:

1. the selected GeoNames account/service tier is appropriate for expected production traffic;
2. attribution placement satisfies the applicable license;
3. GeoNames request logging, retention, and privacy terms are acceptable for birthplace data;
4. external reference fixtures confirm candidate and timezone behavior across historical and ambiguous cases;
5. deletion and expiration tests prove that encrypted candidate records are removed;
6. `/ready` continues to report `ready: false` until the entire full Baseline compiler is independently approved.
