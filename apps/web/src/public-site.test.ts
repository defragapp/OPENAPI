import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const demoFixtures = readFileSync(new URL('./landing-demo-fixtures.ts', import.meta.url), 'utf8');
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
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const refinementCss = readFileSync(new URL('./experience-refinement-v1.css', import.meta.url), 'utf8');
const renderedFidelityCss = readFileSync(new URL('./rendered-fidelity-v1.css', import.meta.url), 'utf8');
const landingRefinementV2Css = readFileSync(new URL('./landing-refinement-v2.css', import.meta.url), 'utf8');
const landingRefinementV5Css = readFileSync(new URL('./landing-live-refinement-v5.css', import.meta.url), 'utf8');
const sansAuthority = readFileSync(new URL('./sans-typography-authority-v1.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${stories}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('keeps the founder statement but makes the opening product value explicit', () => {
    expect(landing).toContain('Personal AI for real life');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.');
    expect(landing).toContain('Get started');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('Drag to rotate');
    expect(field).toContain('click a line to inspect it');
    expect(field).toContain('{selected.axis.value}');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(landing).not.toContain('capacity beneath');
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
    expect(landing).toContain('Start with yourself. Expand outward when it matters.');
    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(landing).toContain('Why does the same conversation feel urgent to me and pressuring to them?');
    expect(stories).toContain('01 · You');
    expect(stories).toContain('02 · You + your people');
    expect(stories).toContain('03 · From 1:1 to the whole system');
    expect(landing).toContain('Most AI starts with the prompt. Sovereign starts with you.');
    expect(landing).toContain('Know yourself. Understand your people. See the whole system.');
  });

  it('shows insight-first Self proof while preserving transitional relationship/system workflows', () => {
    for (const marker of [
      'data-product-proof="self-v1"',
      'data-viewport-surface="personal-proof"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Start with what happened',
      'Keep each person separate',
      'Show what happens between you',
      'Do not guess private feelings',
      'Find a lower-pressure next step',
      'Start with what you told Sovereign',
      'Show how pressure moves',
      'Show why the role keeps returning',
      'Change one thing and watch what happens'
    ]) expect(stories).toContain(marker);
    for (const marker of [
      'Why am I so good at knowing what everyone else needs from me, but so unsure what I want?',
      'You may not have trouble knowing what you want. Your own preference may be arriving after everyone else’s signals.',
      'The Shadow is not caring too much. It is letting responsiveness become the way the decision gets made.'
    ]) expect(demoFixtures).toContain(marker);
    expect((stories.match(/<WorkflowPanel/g) ?? []).length).toBe(2);
    expect(stories).not.toContain('surface="personal-chat"');
    expect(stories).not.toContain('surface="personal-reasoning"');
    expect(stories).toContain('landing-product-proof__composer');
    expect(stories).not.toContain('<RelationshipContext />');
    expect(stories).not.toContain('<SystemContext />');
  });

  it('keeps relationship/system examples permission-safe and source codes optional', () => {
    expect(stories).toContain('Both people must agree before their Baselines can be used together');
    expect(stories).toContain('Each person controls whether their Baseline can be included');
    expect(stories).toContain('No compatibility score');
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
    expect(main).toContain("import './landing-expression-field-integration.css';");
    expect(main).toContain("import './v0-restored-product-stories.css';");
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline';");
    expect(main).toContain("import landingLiveRefinementV5Css from './landing-live-refinement-v5.css?inline';");
    expect(main).toContain("import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;'));
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
    expect(landingRefinementV5Css).not.toContain('var(--font-display, Georgia, serif)');
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
    expect(pricing).toContain('Explore yourself for free. Add People and Systems with Sovereign+.');
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
