import { describe, expect, it } from 'vitest';
import { canUseDevelopmentFixtures, runtimeMode } from './runtime';
import type { Env } from './env';

describe('runtime fixture policy', () => {
  it('allows deterministic fixtures only in explicit development or test modes', () => {
    expect(runtimeMode({ APP_ENV: 'production' } as Env)).toBe('production');
    expect(canUseDevelopmentFixtures({ APP_ENV: 'production' } as Env)).toBe(false);
    expect(canUseDevelopmentFixtures({ APP_ENV: 'preview' } as Env)).toBe(false);
    expect(canUseDevelopmentFixtures({ APP_ENV: '' } as Env)).toBe(false);
    expect(canUseDevelopmentFixtures({ APP_ENV: 'development' } as Env)).toBe(true);
    expect(canUseDevelopmentFixtures({ APP_ENV: 'test' } as Env)).toBe(true);
  });
});
