import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentCss = readFileSync(new URL('../public/consent.css', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('../public/launch.css', import.meta.url), 'utf8');
const launchPolishCss = readFileSync(new URL('../public/launch-polish.css', import.meta.url), 'utf8');
const staticExperienceCss = readFileSync(new URL('../public/static-experience.css', import.meta.url), 'utf8');
const platformPublicCss = readFileSync(new URL('../public/platform-public.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const productCss = readFileSync(new URL('./sovereign-product-v2.css', import.meta.url), 'utf8');
const precisionCss = readFileSync(new URL('./sovereign-product-precision.css', import.meta.url), 'utf8');
const staticProductCss = readFileSync(new URL('../public/sovereign-product-v2.css', import.meta.url), 'utf8');
const staticPrecisionCss = readFileSync(new URL('../public/sovereign-product-precision.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

 describe('Sovereign.OS public experience', () => {
  it('states the product value and first action in the first viewport', () => {
    expect(landing).toContain('Ask about your life.');
    expect(landing).toContain('Get an answer built around you.');
    expect(landing).toContain('private personal AI for understanding yourself, your relationships, your decisions, and the groups around you');
    expect(landing).toContain('Build my Baseline');
    expect(landing).toContain('See a Sovereign answer');
    expect(landing).not.toContain('INIT_BASELINE');
    expect(landing).not.toContain('Know yourself.<br />Understand the system.');
  });

  it('shows a recognizable question and direct answer before explaining the context architecture', () => {
    const questionIndex = landing.indexOf('Why do I keep taking responsibility for everyone else?');
    const answerIndex = landing.indexOf('Your ability to create direction is real. The problem begins when responsibility reaches you without matching authority.');
    const foundationIndex = landing.indexOf('Sovereign keeps different kinds of information separate');
    expect(questionIndex).toBeGreaterThan(-1);
    expect(answerIndex).toBeGreaterThan(questionIndex);
    expect(foundationIndex).toBeGreaterThan(answerIndex);
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing).toContain('YOU ASKED');
  });

  it('presents one intelligence environment across personal, relationship, decision, and system context', () => {
    for (const phrase of ['Your Baseline', 'What may be active now', 'People and systems', 'Your answer', 'WHAT HAPPENS BETWEEN YOU', 'PRESSURE FIELD']) {
      expect(landing).toContain(phrase);
    }
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('role="tabpanel"');
    expect(landing).toContain('aria-live="polite"');
  });

  it('uses real product demonstrations instead of disconnected marketing claims', () => {
    for (const component of ['<PublicAnswerStage', '<PermissionField />', '<SystemMap />']) expect(landing).toContain(component);
    expect(landing).toContain('REAL QUESTIONS · CLEAR ANSWERS');
    expect(landing).toContain('The useful explanation stays primary while exact Basis remains available underneath it.');
  });

  it('keeps exact Basis fixtures secondary to plain-language value', () => {
    for (const value of ['U✓', 'HD G13.1', 'GK ACT13', 'N LP1', '☉ CAN 04.2°']) expect(landing).toContain(value);
    expect(landing).toContain('BASIS');
    expect(landing).toContain('WHAT MAY BE STEADY');
    expect(landing).toContain('WHAT MAY BE ACTIVE NOW');
    expect(landing).toContain('STILL UNKNOWN');
  });

  it('keeps relationship and system intelligence permission-bound', () => {
    expect(landing).toContain('PERMISSION BEFORE COMPARISON');
    expect(landing).toContain('Understand the interaction without pretending to know another person’s mind.');
    expect(landing).toContain('Their actual motive remains unknown until they explain it themselves.');
    expect(landing).toContain('No compatibility score. No mind-reading. No one-sided access to another person’s Baseline.');
    expect(faq).toContain('It cannot know another person’s exact feelings, motives, private experience, or future behavior.');
  });

  it('keeps verified prices, plan limits, correction, and optional Covenant explicit', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Review and correct what does not fit', 'Covenant']) {
      expect(publicCopy).toContain(phrase);
    }
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('renders the public React routes without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
    expect(main).toContain("import './sovereign-product-v2.css'");
    expect(main).toContain("import './sovereign-product-precision.css'");
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('keeps the static public family on the unified product assets', () => {
    for (const page of [how, pricing, faq]) {
      expect(page).toContain('/launch.css?v=20260730-cohesion');
      expect(page).toContain('/launch-polish.css?v=20260730-cohesion');
      expect(page).toContain('/static-release.css?v=20260730-cohesion');
      expect(page).toContain('/static-experience.css?v=20260730-cohesion');
      expect(page).toContain('/platform-public.css?v=20260730-platform2');
      expect(page).toContain('/sovereign-product-v2.css?v=20260730-reconciliation');
      expect(page).toContain('/sovereign-product-precision.css?v=20260730-precision');
    }
    expect(how).toContain('One question. The right context. A clear answer.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(pricing).not.toContain('Begin with yourself. Expand when other people matter.');
    expect(faq).toContain('What Sovereign understands. What remains yours to confirm.');
  });

  it('uses one technical typography and geometry system across public surfaces', () => {
    for (const css of [productCss, precisionCss, staticProductCss, staticPrecisionCss]) {
      expect(css).toContain('--s2-bg');
      expect(css).toContain('@media');
    }
    expect(precisionCss).toContain('--precision-display');
    expect(precisionCss).toContain('--precision-mono');
    expect(precisionCss).toContain('border-radius:0!important');
    expect(precisionCss).not.toContain('Iowan Old Style');
    expect(staticPrecisionCss).not.toContain('Iowan Old Style');
  });

  it('keeps public pages responsive and consent independently controlled', () => {
    expect(launchCss).toContain('@media (max-width: 680px)');
    expect(launchPolishCss).toContain('prefers-reduced-motion');
    expect(landingCss).toContain('@media (max-width: 760px)');
    expect(productCss).toContain('@media(max-width:760px)');
    expect(precisionCss).toContain('@media(max-width:760px)');
    expect(staticExperienceCss).toContain('@media (max-width: 860px)');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(staticExperienceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(staticExperienceCss).toContain('overflow-x: auto;');
    expect(staticExperienceCss).toContain('overscroll-behavior-inline: contain;');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(notFound).toContain('content="noindex, nofollow"');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
    expect(platformPublicCss).toContain('min-height: 0');
  });
});
