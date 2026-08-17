import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = read('./landing-expression-field-v3.css');
const integrationStyles = read('./landing-expression-field-integration.css');
const storyStyles = read('./landing-product-stories-v2.css');
const approvedStyles = read('./public-landing-approved-v8.css');
const heroExtension = read('./landing-hero-field-v4.css');
const finalAuthority = read('./public-landing-final-authority.css');
const refinement = read('./experience-refinement-v1.css');
const renderedFidelity = read('./rendered-fidelity-v1.css');
const languageAuthority = read('../../../docs/product-language-system.md');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('approved public landing v8', () => {
  it('preserves the founder cascade and appends the final rendered-fidelity authority last', () => {
    const imports = [
      "import './landing-expression-field-v3.css';",
      "import './landing-expression-field-integration.css';",
      "import './v0-restored-product-stories.css';",
      "import './landing-product-stories-v2.css';",
      "import './public-landing-approved-v8.css';",
      "import './landing-hero-field-v4.css';",
      "import './deployed-route-cohesion.css';",
      "import './passkey-auth.css';"
    ];
    for (let index = 1; index < imports.length; index += 1) {
      expect(main.indexOf(imports[index]!)).toBeGreaterThan(main.indexOf(imports[index - 1]!));
    }
    expect(main.slice(main.indexOf(imports.at(-1)!) + imports.at(-1)!.length)).not.toContain("import './");
    expect(main).toContain("import experienceRefinementCss from './experience-refinement-v1.css?inline';");
    expect(main).toContain("import renderedFidelityCss from './rendered-fidelity-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;')).toBeGreaterThan(
      main.indexOf('style.textContent += `\\n${experienceRefinementCss}`;')
    );
  });

  it('keeps the founder hero and makes the required real-life recognition stage visible', () => {
    for (const marker of [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      '<LandingExpressionSlice />',
      '<RealLifeQuestions />',
      '<LandingProductStories />',
      'Start with what’s actually happening.',
      'Why do we keep having the same fight?',
      'Your Baseline is the private personal foundation Sovereign uses to understand where to begin.',
      'Build my Baseline',
      'See a Sovereign answer'
    ]) expect(landing).toContain(marker);
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));

    for (const marker of [
      'Baseline-first recognition: this is a real explanatory stage',
      'height: auto !important',
      'min-height: clamp(330px, 29vw, 420px) !important',
      '.landing-question-orbit h2',
      'position: static !important',
      'clip: auto !important',
      'font-size: clamp(1.14rem, 1.9vw, 1.55rem) !important'
    ]) expect(renderedFidelity).toContain(marker);
  });

  it('implements the canonical Baseline-first experience hierarchy instead of architecture-first copy', () => {
    for (const marker of [
      '## Experience hierarchy',
      'Baseline Design is the foundation.',
      'A visitor arrives with an ordinary real-life question',
      'Relationship and system intelligence extend that same foundation outward.',
      'The technical machinery stays underneath the experience.'
    ]) expect(languageAuthority).toContain(marker);

    expect(landing).toContain('A blank conversation starts with the prompt. Sovereign starts with your Baseline.');
    expect(landing).toContain('Build your Baseline once. Use it as the private personal foundation for what you want to understand next.');
    expect(landing).not.toContain('Generic AI sees the prompt. Sovereign sees the context.');
  });

  it('keeps one 360-degree structural field while the final presentation remains monochrome', () => {
    for (const marker of [
      'const VIEWBOX_SIZE = 920',
      'const SPHERE_RADIUS = 286',
      'data-field-geometry="spherical-360"',
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'landing-expression-slice__readout',
      'relative emphasis',
      'requestAnimationFrame'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('#8b5cff');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(refinement).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelity).toContain('--v8-blue: #d8d0c5 !important');
    expect(renderedFidelity).toContain("radialGradient[id$='-sphere-fill']");
  });

  it('keeps self, relationship, and system examples distinct and permission-safe', () => {
    for (const marker of [
      'See the capacity beneath the pattern.',
      'Understand what happens between you.',
      'See what keeps the pattern going—and what could change it.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Shared with permission',
      'Illustrative supplied context',
      'Role context',
      'Where decisions and outcomes keep returning.',
      'What changes if resolution no longer defaults to one person.'
    ]) expect(renderedStories).toContain(marker);

    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).not.toContain("role: 'Stabilizer'");
    expect(stories).not.toContain("role: 'Catalyst'");
    expect(stories).not.toContain("role: 'Observer'");
    expect(stories).not.toContain("role: 'Anchor'");
    expect(renderedStories).not.toContain('Permitted context');
    expect(renderedStories).not.toContain('Ask about your life.');
    expect(renderedStories).not.toContain('Bring the question');
  });

  it('keeps exact supporting codes quiet and secondary', () => {
    for (const marker of ["{ code: 'GK 13.4'", "{ code: 'GATE 4.11'", "{ code: 'MARS · CANCER'", "{ code: 'GATE 22.4'", "{ code: 'GATE 57.2'"]) {
      expect(stories).toContain(marker);
    }
    expect(stories).toContain('<strong>Basis</strong>');
    expect(finalAuthority).toContain('.landing-evidence__code');
    expect(renderedFidelity).toContain('.landing-evidence abbr');
  });

  it('keeps product proof readable on desktop and mobile without reopening blue UI styling', () => {
    expect(renderedFidelity).toContain('font-size: 0.86rem !important');
    expect(renderedFidelity).toContain('font-size: 0.8rem !important');
    expect(renderedFidelity).toContain('min-height: 330px !important');
    expect(renderedFidelity).toContain('font-size: 1.02rem !important');
    expect(approvedStyles).toContain('@media (max-width: 760px)');
    expect(heroExtension).toContain('@keyframes landing-real-question');
    expect(main).toContain('window.visualViewport');
  });

  it('keeps every active CSS layer structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles, heroExtension, finalAuthority, refinement, renderedFidelity]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
