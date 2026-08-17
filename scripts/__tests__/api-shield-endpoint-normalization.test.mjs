import { describe, expect, it } from 'vitest';
import {
  apiShieldOperationMatches,
  normalizeApiShieldEndpoint
} from '../configure-cloudflare-free-tier.mjs';

describe('API Shield endpoint normalization', () => {
  it('normalizes named OpenAPI path parameters to Cloudflare varN templates', () => {
    expect(normalizeApiShieldEndpoint('/api/v1/people/{personId}/consent/{scope}'))
      .toBe('/api/v1/people/{var1}/consent/{var2}');
    expect(normalizeApiShieldEndpoint('/api/v1/invitations/{invitationId}/consent/{scope}'))
      .toBe('/api/v1/invitations/{var1}/consent/{var2}');
    expect(normalizeApiShieldEndpoint('/api/v1/billing/checkout'))
      .toBe('/api/v1/billing/checkout');
  });

  it('matches Cloudflare-normalized managed operations to the canonical repository endpoint', () => {
    expect(apiShieldOperationMatches({
      host: 'app.defrag.app',
      method: 'PUT',
      endpoint: '/api/v1/people/{var1}/consent/{var2}'
    }, 'PUT', '/api/v1/people/{personId}/consent/{scope}')).toBe(true);

    expect(apiShieldOperationMatches({
      host: 'app.defrag.app',
      method: 'PUT',
      endpoint: '/api/v1/invitations/{var1}/consent/{var2}'
    }, 'PUT', '/api/v1/invitations/{invitationId}/consent/{scope}')).toBe(true);

    expect(apiShieldOperationMatches({
      host: 'sovereign.defrag.app',
      method: 'PUT',
      endpoint: '/api/v1/people/{var1}/consent/{var2}'
    }, 'PUT', '/api/v1/people/{personId}/consent/{scope}')).toBe(false);
  });
});
