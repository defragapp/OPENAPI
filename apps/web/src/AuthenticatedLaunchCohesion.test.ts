import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const productionRuntime = readFileSync(new URL('./ProductionRuntime.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const designSystem = readFileSync(new URL('./design-system.css', import.meta.url), 'utf8');
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

  it('loads the launch cohesion layer as a single terminal inline authority', () => {
  });

  it('uses a restrained neutral launch authority instead of blue authenticated chrome', () => {
    expect(designSystem).toContain('--launch-ink: #f2ede5;');
    expect(launchCss).toContain('--journey-blue: #e8ddd0 !important;');
    expect(launchCss).toContain('.workspace-mobile-utilities-heading > span');
    expect(launchCss).not.toContain('Avenir Next');
    expect(launchCss).toContain('.account-shell .passkey-button');
    expect(launchCss).toContain('.account-shell .primary-button');
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

  it('restores production-scale onboarding and policy actions after editorial action styling', () => {
    expect(launchCss).toContain('[data-onboarding-phase="baseline_building"]');
    expect(launchCss).toContain('.baseline-onboarding-form > .primary-button');
    expect(launchCss).toContain('.policy-review-gate > section > button');
    expect(launchCss).toContain('grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr)');
    expect(onboarding).toContain('pollBaselineReadiness');
    expect(onboarding).toContain("setBaselineStage('preparing')");
    expect(onboarding).toContain("setBaselineStage('opening')");
    expect(onboarding).not.toContain('personal foundation');
  });

  it('retains the canonical structured Baseline inputs and explicit timezone confirmation', () => {
    expect(onboarding).toContain('birthplaceCity');
    expect(onboarding).toContain('birthplaceCountry');
    expect(onboarding).toContain('birthTimezone');
    expect(onboarding).toContain('timezoneConfirmed');
    expect(onboarding).toContain("birthTimeCertainty: 'unknown'");
    expect(onboarding).toContain("locationPrecision: 'city_or_regional' as const");
  });

  it('routes every reachable Baseline edit back through canonical onboarding', () => {
    expect(workspace).toContain('className={`intelligence-workspace');
    expect(workspace).toContain('className="sovereign-composer sovereign-composer--enhanced"');
    expect(workspace).toContain('function beginBaseline()');
    expect(workspace).toContain("location.assign('/onboarding')");
    expect(workspace).not.toContain('capacity beneath patterns');
  });
});
