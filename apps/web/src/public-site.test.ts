import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const policyAuthority = readFileSync(new URL('../../../config/policies.ts', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentCss = readFileSync(new URL('../public/consent.css', import.meta.url), 'utf8');
const staticExperienceCss = readFileSync(new URL('../public/static-experience.css', import.meta.url), 'utf8');
const staticRefinementCss = readFileSync(new URL('../public/experience-static-refinement-v1.css', import.meta.url), 'utf8');
const staticTerminalCss = readFileSync(new URL('../public/premium-action-static-v1.css', import.meta.url), 'utf8');
const platformPublicCss = readFileSync(new URL('../public/platform-public.css', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const refinementCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const renderedFidelityCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const landingRefinementV2Css = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const landingRefinementV5Css = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const sansAuthority = readFileSync(new URL('./design-system.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${stories}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('keeps the founder statement but makes the opening product value explicit', () => {
    expect(landing).toContain('Personal intelligence for real life');
    expect(landing).toContain('Healing isn\u2019t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign.OS builds your private Baseline — the intelligence reference that carries across every conversation.');
    expect(landing).toContain('Build your Baseline');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('Drag to rotate');
    expect(field).toContain('click a line to inspect it');
    expect(field).toContain('{selected.axis.value}');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
  });

  it('moves from self exploration to People and Systems without a root framework explainer', () => {
    const rendered = landing.slice(landing.indexOf('export function PublicLanding()'), landing.indexOf('function V0Navigation()'));
    const values = ['<V0Navigation />', '<V0Hero />', '<RealLifeQuestions />', '<LandingProductStories />', '<ComparisonStory />', '<FinalCallToAction />', '<V0Footer />'];
    let previous = -1;
    for (const value of values) {
      const index = rendered.indexOf(value);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(landing).toContain('Why does the same conversation feel urgent to me and pressuring to them?');
    expect(stories).toContain('01 · You');
    expect(stories).toContain('02 · You + your people');
    expect(stories).toContain('03 · From 1:1 to the whole system');
    expect(landing).toContain('Sovereign starts');
    expect(landing).toContain('Know yourself. Understand your people. See the whole system.');
  });

  it('shows visible self, relationship, and system intelligence in user language', () => {
    for (const marker of [
      'landing-stories__labels',
      'landing-story__label',
      'demo-card',
      'landing-story--${suffix}',
      'See source details',
      'Representative example · Not your Baseline Design'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel/g) ?? []).length).toBe(0);
    expect(stories).not.toContain("aria-current={index === visibleIndex ? 'step' : undefined}");
    expect(stories).not.toContain('landing-workflow__progress');
    expect(stories).not.toContain('<RelationshipContext />');
    expect(stories).not.toContain('<SystemContext />');
  });

  it('renders three canonical story cards with correct class names', () => {
    expect(stories).toContain('landing-story--${suffix}');
    expect(stories).toContain("id: 'personal'");
    expect(stories).toContain("id: 'relationship'");
    expect(stories).toContain("id: 'system'");
  });

  it('keeps relationship/system examples permission-safe and source codes optional', () => {
    expect(stories).toContain('Representative example · Not your Baseline Design');
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).not.toContain('<strong>Basis</strong>');
    expect(stories).not.toContain('<strong>Example Basis</strong>');
    expect(stories).not.toContain('permitted perspectives');
    expect(stories).not.toContain('confirmed responsibilities');
  });

  it('keeps retired chatbot, technical-field, and rejected category phrasing out of active public copy', () => {
    for (const phrase of [
      'Ask about your life. Get an answer built around you.',
      'What do you want to understand?',
      'Bring the question you already have.',
      'possible interaction vector',
      'emotional vector',
      'One private reference beneath every question.',
      'One private foundation. More useful answers across the questions that shape your life.',
      'Separate helping from carrying the outcome.',
      'See where responsibility keeps landing.',
      'Ordinary questions. More context when it belongs.',
      'Example Basis',
      'server-approved',
      'permitted context',
      'consented people',
      'permitted perspectives',
      'confirmed responsibilities'
    ]) expect(publicCopy.toLowerCase()).not.toContain(phrase.toLowerCase());
  });

  it('keeps verified plans, correction, optional Covenant, and private data access available elsewhere', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Covenant']) expect(publicCopy).toContain(phrase);
    expect(policyAuthority).toContain('on-demand JSON copy of account-owned data');
    expect(policyAuthority).toContain('not retained as an export artifact');
  });

  it('renders the public route without runtime copy rewriting and appends terminal sans typography', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain("import './public.css';");
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('applies the founder visual system with sans-only terminal typography', () => {
    for (const selector of ['.v0-landing-port', '.v0-hero', '.intelligence-workspace', '.sovereign-composer', '.account-shell', '.auth-panel']) expect(v0Css).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storyCss).toContain(selector);
    expect(refinementCss).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelityCss).toContain('--v8-blue: #d8d0c5 !important');
    expect(landingRefinementV2Css).toContain('.landing-workflow__progress');
    expect(landingRefinementV2Css).toContain('@keyframes sovereign-system-route');
    expect(landingRefinementV2Css).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinementV5Css).not.toContain('.landing-baseline-intro');
    expect(landingRefinementV5Css).toContain('@keyframes sovereign-hero-rise');
    expect(sansAuthority).toContain('font-family: var(--font-title) !important');
    expect(staticTerminalCss).toContain('--static-title-font:');
    expect(staticTerminalCss).toContain('font-family: var(--static-title-font) !important');
    expect(staticRefinementCss).toContain('--v0-blue: #e8ddd0');
  });

  it('keeps support pages, consent, and fallback routes intact with current public language', () => {
    expect(how).toContain('Start with yourself. Add another person or the wider situation only when it helps.');
    expect(how).toContain('YOU → PEOPLE → SYSTEMS');
    expect(how).toContain('Ask about what you actually want to understand.');
    expect(how).toContain('A private reference built around you.');
    expect(how).toContain('<summary>See source details</summary>');
    expect(how).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(pricing).toContain('Free: your personal Baseline Design. Sovereign+: your people, your systems, your Library.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(pricing).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(faq).toContain('What can Sovereign help you understand?');
    expect(faq).toContain('Can I see what information Sovereign used for an answer?');
    expect(faq).toContain('Do those source details prove the interpretation is true?');
    expect(faq).toContain('Tarot is not part of Sovereign.OS.');
    expect(faq).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(platformPublicCss).toContain('opacity: 1 !important');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(notFound).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(consent).toContain('You control what another person can use with you.');
    expect(consent).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});