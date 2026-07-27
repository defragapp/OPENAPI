import { describe, expect, it } from 'vitest';
import { safeReturnTo } from './auth-public';

describe('safe authentication return routing', () => {
  it('preserves only approved in-app destinations', () => {
    expect(safeReturnTo('/app')).toBe('/app');
    expect(safeReturnTo('/app/relationship?person=p_1')).toBe('/app/relationship?person=p_1');
    expect(safeReturnTo('/onboarding')).toBe('/onboarding');
  });

  it('rejects external, protocol-relative, malformed, and unrelated destinations', () => {
    expect(safeReturnTo('https://example.com')).toBe('/app');
    expect(safeReturnTo('//example.com/app')).toBe('/app');
    expect(safeReturnTo('/pricing.html')).toBe('/app');
    expect(safeReturnTo('/app\\evil')).toBe('/app');
    expect(safeReturnTo(null)).toBe('/app');
  });
});
