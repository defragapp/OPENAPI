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
const platformPublicCss = readFileSync(new URL('../public/platform-public.css', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const refinementCss = readFileSync(new URL('./experience-refinement-v1.css', import.meta.url), 'utf8');
const renderedFidelityCss = readFileSync(new URL('./rendered-fidelity-v1.css', import.meta.url), 'utf8');
const landingRefinementV2Css = readFileSync(new URL('./landing-refinement-v2.css', import.meta.url), 'utf8');
const landingRefinementV5Css = readFileSync(new URL('./landing-live-refinement-v5.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${stories}\n${policy}\n${policyAuthority}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('keeps the founder statement but makes the opening product value explicit', () => {
    expect(landing).toContain('Personal AI for real life');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Build a private Baseline once.');
    expect(landing).toContain('See how it works');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('Drag to rotate');
    expect(field).toContain('click a line to inspect it');
    expect(field).toContain('{selected.axis.value}');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(landing).not.toContain('capacity beneath');
  });

  it('presents Baseline Design before realistic questions and product demonstrations', () => {
    const rendered = landing.slice(landing.indexOf('export function PublicLanding()'), landing.indexOf('function V0Navigation()'));
    const values = ['<V0Navigation />', '<V0Hero />', '<BaselineFoundation />', '<RealLifeQuestions />', '<LandingProductStories />', '<ComparisonStory />', '<FinalCallToAction />', '<V0Footer />'];
    let previous = -1;
    for (const value of values) {
      const index = rendered.indexOf(value);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(landing).toContain('One private reference beneath every question.');
    expect(landing).toContain('calculated astronomical positions and selected interpretive frameworks');
    expect(landing).toContain('What this unlocks');
    expect(landing).toContain('One private foundation. More useful answers across the questions that shape your life.');
    expect(landing).toContain('Should I stay in this job, ask for more, or leave?');
    expect(landing).toContain('How do I stop being the person who holds the whole family together?');
    expect(stories).toContain('Understand what happens');
    expect(landing).toContain('A blank conversation starts with the prompt. Sovereign starts with your Baseline.');
    expect(landing).not.toContain('Generic AI sees the prompt. Sovereign sees the context.');
    expect(landing).toContain('Your thoughts deserve');
  });

  it('shows a visible reasoning flow plus relationship and system context', () => {
    for (const marker of [
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'What your Baseline supports',
      'What changes under pressure',
      'Where responsibility shifts',
      'A cleaner boundary',
      'Keeping both people distinct',
      'Clarity may take time.',
      'Between you',
      'What Sovereign separates',
      'Observed route',
      'Testable change',
      'Selected observation',
      'What to test'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).toContain("aria-current={index === visibleIndex ? 'step' : undefined}");
    expect(stories).toContain('landing-workflow__progress');
    expect(stories).toContain('<RelationshipContext />');
    expect(stories).toContain('<SystemContext />');
  });

  it('keeps relationship and system examples permission-safe, anonymous, and source-aware', () => {
    expect(stories).toContain('With permission, Sovereign keeps each person’s supplied context distinct');
    expect(stories).toContain('Shared with permission');
    expect(stories).toContain('Illustrative supplied context');
    expect(stories).toContain('Each person controls what may be included');
    expect(stories).toContain('No compatibility score');
    expect(stories).toContain('That is a system pattern—not proof that any one person is the cause.');
    expect(stories).toContain('<strong>Basis</strong>');
    expect(stories).not.toContain("name: 'Maya'");
    expect(stories).not.toContain("name: 'Noa'");
    expect(stories).not.toContain("name: 'Ruth'");
    expect(stories).not.toContain("role: 'Stabilizer'");
    expect(stories).not.toContain("role: 'Catalyst'");
    expect(stories).not.toContain("role: 'Observer'");
    expect(stories).not.toContain("role: 'Anchor'");
  });

  it('keeps retired chatbot and technical-field phrasing out of active public copy', () => {
    for (const phrase of [
      'Ask about your life. Get an answer built around you.',
      'What do you want to understand?',
      'Bring the question you already have.',
      'possible interaction vector',
      'emotional vector'
    ]) expect(publicCopy.toLowerCase()).not.toContain(phrase.toLowerCase());
  });

  it('keeps verified plans, correction, optional Covenant, and private data access available elsewhere', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Covenant']) expect(publicCopy).toContain(phrase);
    expect(policyAuthority).toContain('on-demand JSON copy of account-owned data');
    expect(policyAuthority).toContain('not retained as an export artifact');
  });

  it('renders the public route without runtime copy rewriting and appends the final landing authority', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain("import './landing-expression-field-integration.css';");
    expect(main).toContain("import './v0-restored-product-stories.css';");
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline';");
    expect(main).toContain("import landingLiveRefinementV5Css from './landing-live-refinement-v5.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${landingLiveRefinementV5Css}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${landingLiveRefinementV4Css}`;'));
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('applies the founder visual system and bounded monochrome refinement authorities', () => {
    for (const selector of ['.v0-landing-port', '.v0-hero', '.intelligence-workspace', '.sovereign-composer', '.account-shell', '.auth-panel']) expect(v0Css).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storyCss).toContain(selector);
    expect(refinementCss).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelityCss).toContain('--v8-blue: #d8d0c5 !important');
    expect(landingRefinementV2Css).toContain('.landing-workflow__progress');
    expect(landingRefinementV2Css).toContain('@keyframes sovereign-system-route');
    expect(landingRefinementV2Css).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinementV5Css).toContain('.landing-baseline-intro__heading');
    expect(landingRefinementV5Css).toContain('@keyframes sovereign-hero-rise');
    expect(staticRefinementCss).toContain('--v0-blue: #e8ddd0');
    expect(staticRefinementCss).toContain('body.how-page .journey-steps > article');
    expect(staticRefinementCss).toContain('body.pricing-page .pricing-grid');
    expect(staticRefinementCss).toContain('body.questions-page .faq-category');
  });

  it('keeps support pages, consent, and fallback routes intact while using current public language', () => {
    expect(how).toContain('Your Baseline first. The situation second.');
    expect(how).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(pricing).toContain('Start with your Baseline. Add more only when you need it.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(pricing).toContain('/experience-static-refinement-v1.css?v=20260817-cohesion-v2');
    expect(faq).toContain('What you should know before you begin.');
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
