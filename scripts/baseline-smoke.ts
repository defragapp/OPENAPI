import { readFileSync } from 'node:fs';
import { computeReducedBaseline } from '../apps/sovereign-worker/src/baseline';
async function main() {
  const exact = await computeReducedBaseline({ birthDate: '1990-05-17', birthTime: '14:30', birthTimeCertainty: 'exact', birthplace: 'Austin, TX', locationPrecision: 'city_or_regional' });
  const unknown = await computeReducedBaseline({ birthDate: '1990-05-17', birthTimeCertainty: 'unknown', birthplace: 'Paris, France', locationPrecision: 'none' });
  const unavailable = await computeReducedBaseline({ birthDate: '1990-05-17', birthTimeCertainty: 'approximate', birthTime: '08:00', birthplace: 'Unavailable Provider', locationPrecision: 'approximate' }, { providerAvailable: false });
  const safe = JSON.stringify([exact.reducedContext, unknown.reducedContext, unavailable.reducedContext]);
  for (const forbidden of ['1990-05-17', '14:30', 'Austin', 'Paris', 'latitude', 'longitude']) if (safe.includes(forbidden)) throw new Error(`raw private value leaked: ${forbidden}`);
  if (unknown.uncertainty !== 'high') throw new Error('unknown birth time did not preserve high uncertainty');
  if (unavailable.status !== 'partial' || unavailable.providerStatus !== 'unavailable') throw new Error('unavailable provider did not fail closed');
  if (!exact.provenance.deterministicCalculation || !exact.provenance.interpretiveFrameworks) throw new Error('structured provenance missing');
  const baselineWorkerSource = readFileSync('apps/baseline-worker/src/index.ts', 'utf8');
  if (!baselineWorkerSource.includes('class BaselineEntrypoint') || !baselineWorkerSource.includes('computeReducedBaseline')) throw new Error('private Baseline service binding compute path missing');
  let malformed = false; try { await computeReducedBaseline({ birthDate: 'bad', birthTimeCertainty: 'unknown', birthplace: 'X', locationPrecision: 'none' }); } catch { malformed = true; }
  if (!malformed) throw new Error('malformed input accepted');
  console.log('Baseline smoke passed raw_excluded=true uncertainty_preserved=true unavailable_fails_closed=true provenance=true private_service=true sovv_commit=a3db94bccc75089723bef0cf5ff36c47064bd789');
}
main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
