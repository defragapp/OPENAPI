import { computeReducedBaseline } from '../apps/sovereign-worker/src/baseline';

async function main() {
  const exact = await computeReducedBaseline({ birthDate: '1990-05-17', birthTime: '14:30', birthTimeCertainty: 'exact', birthplace: 'Austin, TX', birthTimezone: 'America/Chicago', locationPrecision: 'city_or_regional' }, { allowRecordedFixture: true });
  const unknown = await computeReducedBaseline({ birthDate: '1990-05-17', birthTimeCertainty: 'unknown', birthplace: 'Paris, France', birthTimezone: 'Europe/Paris', locationPrecision: 'none' }, { allowRecordedFixture: true });
  const unavailable = await computeReducedBaseline({ birthDate: '1990-05-17', birthTimeCertainty: 'approximate', birthTime: '08:00', birthplace: 'Unavailable Provider', birthTimezone: 'UTC', locationPrecision: 'approximate' }, { providerAvailable: false });
  const safe = JSON.stringify([exact.reducedContext, unknown.reducedContext, unavailable.reducedContext]);
  for (const forbidden of ['1990-05-17', '14:30', 'Austin', 'Paris', 'America/Chicago', 'Europe/Paris', 'latitude']) if (safe.includes(forbidden)) throw new Error(`raw private value leaked: ${forbidden}`);
  if (exact.reducedContext.sourceData?.provenance.exactPrivateLocationReturned !== false) throw new Error('exact private location boundary is missing');
  if (!exact.reducedContext.sourceData?.natalBodies.every((body) => Number.isFinite(body.longitude))) throw new Error('authorized natal longitude values are missing');
  if (unknown.uncertainty !== 'high') throw new Error('unknown birth time did not preserve high uncertainty');
  if (unavailable.status !== 'partial' || unavailable.providerStatus !== 'unavailable') throw new Error('unavailable provider did not fail closed');
  if (!exact.provenance.deterministicCalculation || !exact.provenance.interpretiveFrameworks) throw new Error('structured provenance missing');
  const productionDefault = await computeReducedBaseline({ birthDate: '1990-05-17', birthTimeCertainty: 'unknown', birthplace: 'Paris, France', birthTimezone: 'Europe/Paris', locationPrecision: 'none' });
  if (productionDefault.status !== 'partial' || productionDefault.provenance.deterministicCalculation) throw new Error('synthetic Baseline escaped explicit fixture mode');
  let malformed = false;
  try { await computeReducedBaseline({ birthDate: 'bad', birthTimeCertainty: 'unknown', birthplace: 'X', birthTimezone: 'Not/A_Timezone', locationPrecision: 'none' }); } catch { malformed = true; }
  if (!malformed) throw new Error('malformed input accepted');
  console.log('Baseline smoke passed raw_excluded=true timezone_excluded=true private_location_excluded=true natal_longitudes_preserved=true birthplace_external=false uncertainty_preserved=true unavailable_fails_closed=true fixture_test_only=true provenance=true sovv_commit=a3db94bccc75089723bef0cf5ff36c47064bd789');
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
