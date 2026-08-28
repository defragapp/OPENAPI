import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const expressionRenderer = readFileSync(new URL('./expression-field/ExpressionField.tsx', import.meta.url), 'utf8');
const relationshipField = readFileSync(new URL('./expression-field/RelationalExpressionField.tsx', import.meta.url), 'utf8');
const systemField = readFileSync(new URL('./expression-field/SystemExpressionField.tsx', import.meta.url), 'utf8');
const expressionCss = readFileSync(new URL('./design-system.css', import.meta.url), 'utf8');
const v0Visual = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const fieldCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const heroExtension = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const landingRefinementV5 = readFileSync(new URL('./releases.css', import.meta.url), 'utf8');
const sansAuthority = readFileSync(new URL('./design-system.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('founder selective visual port', () => {
  it('ports the integrated interactive 360 field at the opening with click-led inspection', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(field).toContain('expressionAxisRegistryById');
    expect(field).toContain('buildLandingAxes');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('landing-expression-slice__hit');
    expect(field).toContain('data-reach-tier={reachTier}');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).toContain('onFocus={() => selectAxis(axis.id)}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(field).toContain('buildSphereGrid');
    expect(field).toContain('MIN_AXIS_LENGTH');
    expect(field).toContain('MAX_AXIS_LENGTH');
    expect(field).toContain('TOOLTIP_WIDTH = 104');
    expect(field).toContain('TOOLTIP_HEIGHT = 26');
    expect(field).toContain('landing-expression-slice__tooltip-title');
    expect(field).toContain('landing-expression-slice__tooltip-value');
    expect(field).toContain('click a line to inspect it');
    expect(field).toContain('placeTooltip(selectedProjected.projected)');
    expect(field).not.toContain('<div className="landing-expression-slice__tooltip"');
    expect(integrationCss).toContain('background: transparent');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(heroExtension).toContain('stroke: #2f93ff');
    expect(landingRefinementV5).toContain('width: 104px !important');
  });

  it('starts with self exploration rather than a mechanics-first Baseline explainer', () => {
    expect(landing).toContain('Explore yourself');
    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(landing).toContain('How do I know when I\u2019m adapting too early?');
    expect(landing).not.toContain('One private reference beneath every question.');
    expect(landing).not.toContain('One private foundation.');
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).not.toContain('partial Human Design');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
  });

  it('restores simplified demonstrations without restoring duplicate expression fields', () => {
    expect(landing).toContain('<LandingProductStories />');
    for (const marker of [
      '01 · YOU',
      '02 · YOU & YOUR PEOPLE',
      '03 · WHOLE SYSTEM',
      'demo-selector',
      'demo-card',
      'See source details',
      'Representative example · Not your Baseline Design'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('Separate helping from carrying the outcome.');
    expect(stories).not.toContain('See where responsibility keeps landing.');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
  });

  it('preserves the canonical single-room workspace and production data sources', () => {
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("accept': 'application/vnd.sovereign.answer+json'");
    expect(workspace).toContain("api('/api/v1/people')");
    expect(workspace).toContain("api('/api/v1/systems')");
    expect(workspace).toContain("api('/api/v1/today')");
    expect(workspace).toContain('className="relationship-answer"');
    expect(workspace).toContain('className="system-graph"');
    expect(workspace).toContain('className="basis-strip"');
    expect(workspace).toContain('<WorkspaceExpressionField');
    expect(workspace).toContain('<ThreadExpressionField');
    expect(expressionRenderer).toContain('export function ExpressionFieldRenderer');
    expect(relationshipField).toContain('<ExpressionFieldRenderer');
    expect(systemField).toContain('<ExpressionFieldRenderer');
  });

  it('applies founder composition with terminal sans typography', () => {
    for (const selector of ['.intelligence-workspace', '.intelligence-sidebar', '.sovereign-composer', '.surface-heading', '.account-shell', '.auth-panel']) expect(v0Visual).toContain(selector);
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip']) expect(fieldCss).toContain(selector);
    for (const selector of ['.landing-expression-slice__sphere-shell', '.landing-expression-slice__readout', '.landing-question-orbit__stage']) expect(heroExtension).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storyCss).toContain(selector);
    expect(landingRefinementV5).toContain('@keyframes sovereign-hero-rise');
    expect(v0Visual).toContain('.public-approved-v8 .v0-hero h1 > em');
    expect(expressionCss).toContain('min-height: 44px');
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import releasesCss from './releases.css?inline';");
    expect(main).toContain("import releasesCss from './releases.css?inline';");
  });

  it('does not introduce the archive mock runtime, scores, or alternate architecture', () => {
    expect(landing).not.toContain('localStorage');
    const source = `${landing}\n${stories}\n${field}\n${expressionRenderer}\n${relationshipField}\n${systemField}\n${v0Visual}\n${fieldCss}\n${heroExtension}\n${storyCss}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User', 'dashboard-grid', 'mock-auth', 'fake-answer']) {
      expect(source).not.toContain(prohibited);
    }
  });
});
