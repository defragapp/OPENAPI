import { describe, expect, it } from 'vitest';
import { safeReturnTo } from './auth-public';

describe('magic-link return routing', () => {
  it('preserves safe local application routes', () => {
    expect(safeReturnTo('/app?thread=abc#latest')).toBe('/app?thread=abc#latest');
  });

  it('rejects external, protocol-relative, auth-loop, and malformed routes', () => {
    expect(safeReturnTo('https://example.com')).toBeNull();
    expect(safeReturnTo('//example.com')).toBeNull();
    expect(safeReturnTo('/login')).toBeNull();
    expect(safeReturnTo('/app\\evil')).toBeNull();
  });
});
