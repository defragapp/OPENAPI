import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('../security/auth.ts', import.meta.url), 'utf8');
const people = readFileSync(new URL('../db/people.ts', import.meta.url), 'utf8');
const product = readFileSync(new URL('../db/product.ts', import.meta.url), 'utf8');
const insightModules = readFileSync(new URL('../db/insight-modules.ts', import.meta.url), 'utf8');
const billing = readFileSync(new URL('./stripe.ts', import.meta.url), 'utf8');

describe('launch plan enforcement', () => {
  it('keeps Free deterministic and maps paid routes to server-side features', () => {
    for (const feature of ['people.compare', 'systems.family', 'library.continuity']) {
      expect(auth).toContain(feature);
    }
    expect(auth).not.toContain('export.full');
    expect(auth).toContain('requireRouteEntitlement');
    expect(product).toContain("['baseline.today', 'baseline.explore'].includes(feature)");
  });

  it('keeps owned records readable and deletable after paid access ends', () => {
    expect(people).not.toMatch(/listPeople[\s\S]{0,160}requirePeopleFeature/);
    expect(product).not.toMatch(/listSystems[\s\S]{0,160}requireSystemAccess/);
    expect(product).not.toMatch(/listUnderstandings[\s\S]{0,160}requireLibraryAccess/);
    expect(product).not.toMatch(/deleteUnderstanding[\s\S]{0,160}requireLibraryAccess/);
  });

  it('requires paid access to create or use paid capabilities and keeps export unavailable', () => {
    expect(people).toMatch(/createPerson[\s\S]{0,220}requirePeopleFeature/);
    expect(people).toMatch(/requireConsent[\s\S]{0,220}requireScopeFeature/);
    expect(product).toMatch(/createSystem[\s\S]{0,220}requireSystemAccess/);
    expect(product).toMatch(/saveUnderstanding[\s\S]{0,220}requireLibraryAccess/);
    expect(product).toMatch(/createExportJob[\s\S]{0,220}Private export is not available/);
    expect(insightModules).toMatch(/saveLatestInsightModule[\s\S]{0,240}library\.continuity/);
  });

  it('uses hosted Checkout and Portal with configured price IDs', () => {
    expect(billing).toContain("'/checkout/sessions'");
    expect(billing).toContain("'/billing_portal/sessions'");
    expect(billing).toContain('STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY');
    expect(billing).toContain('STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL');
    expect(billing).toContain('A Sovereign+ subscription is already active');
    expect(billing).toContain('integration_identifier');
    expect(billing).not.toContain('payment_method_types');
  });
});
