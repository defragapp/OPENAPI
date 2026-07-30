import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentRuntime = readFileSync(new URL('../public/consent.js', import.meta.url), 'utf8');
const consentCss = readFileSync(new URL('../public/consent.css', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('../public/launch.css', import.meta.url), 'utf8');
const launchPolishCss = readFileSync(new URL('../public/launch-polish.css', import.meta.url), 'utf8');
const staticExperienceCss = readFileSync(new URL('../public/static-experience.css', import.meta.url), 'utf8');
const platformPublicCss = readFileSync(new URL('../public/platform-public.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}\n${consentRuntime}`;

describe('Sovereign.OS public experience', () => {
  it('explains the product and first action in the first viewport', () => {
    expect(landing).toContain('PRIVATE PERSONAL AI');
    expect(landing).toContain('Ask about your life.');
    expect(landing).toContain('Get an answer built around you.');
    expect(landing).toContain('Build your private Baseline once');
    expect(landing).toContain('do not have to explain yourself from scratch');
    expect(landing).toContain('Build my Baseline');
    expect(landing).toContain('See an example answer');
  });

  it('shows a recognizable question and direct answer before explaining the Baseline', () => {
    const questionIndex = landing.indexOf('Why do I keep taking responsibility for everyone else?');
    const answerIndex = landing.indexOf('You are good at creating order. That does not make every problem yours to carry.');
    const foundationIndex = landing.indexOf('Build one Baseline. Use it across every personal question.');
    expect(questionIndex).toBeGreaterThan(-1);
    expect(answerIndex).toBeGreaterThan(questionIndex);
    expect(foundationIndex).toBeGreaterThan(answerIndex);
    expect(landing).toContain('EXAMPLE ANSWER');
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing.indexOf('Sanitized demonstration · Not your Baseline')).toBeLessThan(landing.indexOf('YOU ASKED'));
  });

  it('explains self, relationship, and group use without product metaphors', () => {
    expect(landing).toContain('YOURSELF · RELATIONSHIPS · GROUPS');
    expect(landing).toContain('Use the same personal context wherever the question leads.');
    expect(landing).toContain('Yourself');
    expect(landing).toContain('Relationship');
    expect(landing).toContain('System');
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('role="tabpanel"');
    expect(landing).toContain('aria-live="polite"');
  });

  it('uses product demonstrations instead of disconnected marketing claims', () => {
    for (const component of ['<HeroIntelligenceStage />', '<BaselineContextStage />', '<PublicAnswerStage', '<PermissionField />', '<SystemMap />']) {
      expect(landing).toContain(component);
    }
    expect(landing).toContain('A REAL QUESTION · A DIRECT ANSWER');
    expect(landing).toContain('Get the answer first. Open the supporting details when you need them.');
  });

  it('keeps exact supporting values secondary to plain-language value', () => {
    for (const value of ['U✓', 'HD G13.1', 'GK ACT13', 'N LP1', '☉ CAN 04.2°']) expect(landing).toContain(value);
    expect(landing).toContain('Open supporting details');
    expect(landing).toContain('SUPPORTING DETAILS');
    expect(landing).toContain('This context does not determine what you will do.');
    expect(landing).toContain('WHAT SOVEREIGN CANNOT KNOW');
  });

  it('keeps relationship and group information permission-bound', () => {
    expect(landing).toContain('PERMISSION BEFORE COMPARISON');
    expect(landing).toContain('You cannot add someone else’s private information without their permission.');
    expect(landing).toContain('Their actual reason remains unknown until they explain it themselves.');
    expect(landing).toContain('No compatibility score. No mind-reading. No access to another person’s Baseline without permission.');
    expect(faq).toContain('It cannot know another person’s exact feelings, motives, private experience, or future behavior.');
    expect(consent).toContain('Choose what Sovereign may use about you.');
    expect(consentRuntime).toContain('Choose Allow or Do not allow for each permission.');
  });

  it('keeps verified prices, limits, correction, and optional Covenant explicit', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Review and correct what does not fit', 'Covenant']) {
      expect(publicCopy).toContain(phrase);
    }
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('removes rejected abstract copy from current public surfaces', () => {
    for (const phrase of [
      'Know yourself.',
      'Understand the system.',
      'Choose what fits.',
      'Begin with yourself',
      'The question changes. The environment stays the same.',
      'Another person remains a person—not a data source you control.',
      'Your intelligence begins with your Baseline.',
      'Bring the whole structure into view.',
      'open the full system'
    ]) {
      expect(publicCopy).not.toContain(phrase);
    }
  });

  it('renders the public React routes without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(main).not.toMatch(/refinement|landing-v2/i);
  });

  it('keeps the static public family on the cohesion release assets', () => {
    for (const page of [how, pricing, faq]) {
      expect(page).toContain('/launch.css?v=20260730-cohesion');
      expect(page).toContain('/launch-polish.css?v=20260730-cohesion');
      expect(page).toContain('/static-release.css?v=20260730-cohesion');
      expect(page).toContain('/static-experience.css?v=20260730-cohesion');
      expect(page).toContain('/platform-public.css?v=20260730-platform2');
    }
    expect(how).toContain('Build your Baseline once. Then ask about your real life.');
    expect(pricing).toContain('Use Free for personal questions. Use Sovereign+ for relationships and groups.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(faq).toContain('What Sovereign does, how it works, and what it cannot know.');
  });

  it('keeps every static public section visible and composes the pages as one platform', () => {
    expect(platformPublicCss).toContain('opacity: 1 !important');
    expect(platformPublicCss).toContain('animation: none !important');
    expect(platformPublicCss).toContain('.launch-page:not(.pricing-page):not(.questions-page) .launch-band');
    expect(platformPublicCss).toContain('.pricing-page .pricing-section');
    expect(platformPublicCss).toContain('.questions-page .faq-section');
    expect(platformPublicCss).toContain('background: var(--platform-paper)');
    expect(platformPublicCss).toContain('min-height: 0');
  });

  it('keeps public pages responsive and consent independently controlled', () => {
    expect(launchCss).toContain('@media (max-width: 680px)');
    expect(launchPolishCss).toContain('prefers-reduced-motion');
    expect(landingCss).toContain('@media (max-width: 760px)');
    expect(staticExperienceCss).toContain('@media (max-width: 860px)');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(staticExperienceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(staticExperienceCss).toContain('.pricing-page .pricing-hero > p:last-child');
    expect(staticExperienceCss).toContain('.questions-page .questions-hero > p:last-child');
    expect(staticExperienceCss).toContain('.questions-page .faq-section');
    expect(pricing).toContain('class="launch-hero launch-hero-compact pricing-hero"');
    expect(pricing).not.toContain('pricing-hero-detail');
    expect(staticExperienceCss).toMatch(/@media \(max-width: 860px\)[\s\S]*?\.pricing-page \.pricing-hero > p:last-child[\s\S]*?grid-column: 1; grid-row: auto;/);
    expect(pricing).not.toContain('class="plan-summary"');
    expect(faq).toContain('class="launch-page questions-page"');
    expect(faq).toContain('launch-hero-compact questions-hero');
    expect(staticExperienceCss).toContain('overflow-x: auto;');
    expect(staticExperienceCss).toContain('overscroll-behavior-inline: contain;');
    expect(staticExperienceCss).toContain('.launch-links a { flex: 0 0 auto; white-space: nowrap; }');
    expect(staticExperienceCss).not.toContain('.launch-links a:not(.launch-cta) { display: none; }');
    expect(staticExperienceCss).toMatch(/@media \(max-width: 620px\)[\s\S]*?\.price-options \{ grid-template-columns: 1fr; \}/);
    expect(staticExperienceCss).toContain('.launch-shell { width: min(1320px, calc(100% - 64px)); margin: 0 auto; }');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(notFound).toContain('content="noindex, nofollow"');
    expect(notFound).toContain('/launch.css?v=20260730-cohesion');
    expect(notFound).toContain('/launch-polish.css?v=20260730-cohesion');
    expect(notFound).toContain('/static-release.css?v=20260730-cohesion');
    expect(notFound).toContain('/static-experience.css?v=20260730-cohesion');
    expect(notFound).toContain('href="https://sovereign.defrag.app/"');
    expect(notFound).toContain('href="https://app.defrag.app/login"');
    expect(consent).toContain('The other account cannot choose or change these permissions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});