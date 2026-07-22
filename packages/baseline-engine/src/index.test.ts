import { describe, expect, it } from 'vitest';
import { computeReducedBaseline, computeReducedCurrentConditions, normalizeBaselineInput } from './index';

describe('baseline-engine', () => {
  it('normalizes the verified SOVV BaselineRequest fields without exposing raw input to the model', async () => {
    const baseline = await computeReducedBaseline({
      birthDate: '1990-01-02',
      birthTime: { certainty: 'exact', localTime: '03:04' },
      birthPlace: { label: 'Austin', region: 'TX', country: 'US' },
      currentLocation: { precision: 'city', label: 'Austin metro' }
    });
    expect(baseline.status).toBe('ready');
    expect(baseline.baselineId).toMatch(/^baseline_[a-f0-9]{24}$/);
    expect(baseline.privacy.rawBirthInputSentToModel).toBe(false);
    expect(baseline.privacy.exactLocationSentToModel).toBe(false);
    expect(JSON.stringify(baseline.modelSafe)).not.toContain('1990-01-02');
    expect(JSON.stringify(baseline.modelSafe)).not.toContain('03:04');
  });

  it('fails closed when birth-time certainty is unknown', async () => {
    const baseline = await computeReducedBaseline({ birthDate: '1990-01-02', birthTime: { certainty: 'unknown' }, birthPlace: { country: 'US' } });
    expect(baseline.status).toBe('unavailable');
    expect(baseline.unavailableReason).toBe('birth_time_certainty_unknown');
  });

  it('rejects malformed input rather than fabricating a Baseline', () => {
    expect(() => normalizeBaselineInput({ birthDate: 'January 2, 1990', birthPlace: { country: 'US' } })).toThrow(TypeError);
  });

  it('returns reduced current-condition context without exact location', async () => {
    const current = await computeReducedCurrentConditions({ location: { precision: 'region', label: 'Central Texas' } });
    expect(current.status).toBe('ready');
    expect(current.privacy.exactLocationSentToModel).toBe(false);
    expect(current.modelSafe.precisionUsed).toBe('region');
  });

  it('returns an explicit unavailable state for unavailable current location', async () => {
    const current = await computeReducedCurrentConditions({ location: { precision: 'unavailable' } });
    expect(current.status).toBe('unavailable');
    expect(current.unavailableReason).toBe('current_location_unavailable');
  });
});
