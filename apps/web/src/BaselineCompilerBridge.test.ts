import { describe, expect, it } from 'vitest';
import { parseBirthplace } from './BaselineCompilerBridge';

describe('Baseline compiler browser bridge', () => {
  it('requires city, region, and country before server resolution', () => {
    expect(parseBirthplace('Upland, California, United States')).toEqual({
      city: 'Upland',
      region: 'California',
      country: 'United States'
    });
    expect(() => parseBirthplace('Upland, California')).toThrow(
      'Enter the birthplace as city, region, and country.'
    );
  });

  it('preserves multi-part regions without accepting a timezone value', () => {
    expect(parseBirthplace('London, England, Greater London, United Kingdom')).toEqual({
      city: 'London',
      region: 'England, Greater London',
      country: 'United Kingdom'
    });
    expect(JSON.stringify(parseBirthplace('Paris, Ile-de-France, France'))).not.toContain('timeZone');
    expect(JSON.stringify(parseBirthplace('Paris, Ile-de-France, France'))).not.toContain('timezone');
  });
});
