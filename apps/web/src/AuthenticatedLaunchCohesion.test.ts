import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const productionRuntime = readFileSync(new URL('./ProductionRuntime.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('./authenticated-launch-cohesion-v1.css', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('authenticated launch cohesion', () => {
  it('keeps policy acceptance and 18+ eligibility as separate signup decisions', () => {
    expect(app).toContain('I agree to the <a href={POLICY_METADATA.terms.path}>Terms</a>');
    expect(app).toContain('I confirm I am 18 or older.');
    expect(productionRuntime).toContain("const originalLabel = label.textContent ?? '';");
    expect(productionRuntime).toContain("if (!/\\bTerms\\b|\\bPrivacy(?: Policy)?\\b/i.test(originalLabel)) return;");
    expect(productionRuntime).not.toContain("document.querySelectorAll<HTMLElement>('.account-shell .check-line span').forEach((label) => {\n    if (label.dataset.policyLinks === 'true') return;\n    label.dataset.policyLinks = 'true';");
  });

  it('loads the launch cohesion layer after the workspace production refinement', () => {
    expect(main).toContain("import authenticatedLaunchCohesionCss from './authenticated-launch-cohesion-v1.css?inline'");
    expect(main).toContain('style.textContent += `\\n${authenticatedLaunchCohesionCss}`;');
    expect(main.indexOf('style.textContent += `\\n${authenticatedLaunchCohesionCss}`;'))
      .toBeGreaterThan(main.indexOf('style.textContent += `\\n${workspaceProductionRefinementCss}`;'));
  });

  it('uses a restrained neutral launch authority instead of blue authenticated chrome', () => {
    expect(launchCss).toContain('--launch-ink: #f2ede5;');
    expect(launchCss).toContain('--journey-blue: #e8ddd0 !important;');
    expect(launchCss).toContain('.workspace-mobile-utilities-heading > span');
    expect(launchCss).not.toMatch(/#(?:2f93ff|5aa9ff|78c7ff)/i);
    expect(launchCss).not.toMatch(/rgba\(120,\s*199,\s*255/i);
    expect(launchCss).not.toMatch(/rgba\(47,\s*147,\s*255/i);
  });

  it('keeps mobile account and onboarding surfaces compact and safe-area aware', () => {
    expect(launchCss).toContain('@media (max-width: 820px)');
    expect(launchCss).toContain('env(safe-area-inset-top)');
    expect(launchCss).toContain('env(safe-area-inset-bottom)');
    expect(launchCss).toContain('.account-shell .account-intro-note');
    expect(launchCss).toContain('display: none !important;');
    expect(launchCss).toContain('.plan-onboarding .plan-visual');
    expect(launchCss).toContain('.plan-onboarding .baseline-choice-row');
    expect(launchCss).toContain('grid-template-columns: 1fr !important;');
  });

  it('retains the canonical structured Baseline inputs and explicit timezone confirmation', () => {
    expect(onboarding).toContain('birthplaceCity');
    expect(onboarding).toContain('birthplaceCountry');
    expect(onboarding).toContain('birthTimezone');
    expect(onboarding).toContain('timezoneConfirmed');
    expect(onboarding).toContain("birthTimeCertainty: 'unknown'");
    expect(onboarding).toContain("locationPrecision: 'city_or_regional' as const");
  });

  it('retains one-room thread behavior while the duplicate in-workspace Baseline path is tracked for canonical routing', () => {
    expect(workspace).toContain('className={`intelligence-workspace');
    expect(workspace).toContain('className="sovereign-composer"');
    expect(workspace).toContain("api('/api/v1/account/onboarding')");
    expect(workspace).toContain('function beginBaseline()');
  });
});
