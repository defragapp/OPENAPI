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
const hardening = readFileSync(new URL('./premium-surface-hardening.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('states the current product promise and first action in the first viewport', () => {
    expect(landing).toContain('Know yourself.');
    expect(landing).toContain('Understand the system.');
    expect(landing).toContain('Choose what fits.');
    expect(landing).toContain('private AI for understanding yourself, your relationships, and the systems around you');
    expect(landing).toContain('Build your Baseline once');
    expect(landing).toContain('Build my Baseline');
    expect(landing).toContain('See how it works');
    expect(landing).not.toContain('PERSONAL AI FOR REAL LIFE');
  });

  it('shows a recognizable question and direct answer before the Baseline explanation', () => {
    const questionIndex = landing.indexOf('Why do I keep taking responsibility for everyone else?');
    const answerIndex = landing.indexOf('Your capacity is real. The question is whether the responsibility is actually yours.');
    const foundationIndex = landing.indexOf('Your intelligence begins with your Baseline.');
    expect(questionIndex).toBeGreaterThan(-1);
    expect(answerIndex).toBeGreaterThan(questionIndex);
    expect(foundationIndex).toBeGreaterThan(answerIndex);
    expect(landing).toContain('EXAMPLE ANSWER');
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing.indexOf('Sanitized demonstration · Not your Baseline')).toBeLessThan(landing.indexOf('YOU ASKED'));
  });

  it('presents one intelligence environment across self, relationship, and system scales', () => {
    expect(landing).toContain('STEP 01 · YOU');
    expect(landing).toContain('STEP 02 · YOU + 1');
    expect(landing).toContain('STEP 03 · YOUR WHOLE SYSTEM');
    expect(landing).toContain('Ask about your life.');
    expect(landing).toContain('See the space');
    expect(landing).toContain('From one person');
    expect(landing).toContain('className="visual-story-grid"');
    expect(landing).toContain('className="story-system-map"');
  });

  it('uses the approved product demonstrations instead of a grid of disconnected claims', () => {
    for (const component of ['<HeroAnswerPreview />', '<PersonalStory />', '<RelationshipStory />', '<SystemStory />', '<ReasoningPanel', '<EvidenceChips']) {
      expect(landing).toContain(component);
    }
    expect(landing).toContain('How Sovereign works it through');
    expect(landing).toContain('How Sovereign reads both of you');
    expect(landing).toContain('WHAT HAPPENS BETWEEN YOU');
    expect(landing).toContain('SHARED PATTERN');
    expect(landing).toContain('PRESSURE FIELD');
  });

  it('keeps exact Basis fixtures secondary to plain-language value', () => {
    for (const value of ['SUN · LEO', 'GK 13.4', 'GATE 4.11', 'GK 9', 'MARS · CANCER']) expect(landing).toContain(value);
    expect(landing).toContain('Why this is personal');
    expect(landing).toContain('GROUNDED IN');
    expect(landing).toContain('Temporary context does not determine behavior.');
    expect(landing).toContain('STILL UNKNOWN');
  });

  it('keeps relationship and system intelligence permission-bound', () => {
    expect(landing).toContain('PERMISSION BEFORE COMPARISON');
    expect(landing).toContain('Another person remains a person—not a data source you control.');
    expect(landing).toContain('Bring another person’s permitted Baseline into the room.');
    expect(landing).toContain('without claiming access to private thoughts.');
    expect(landing).toContain('No compatibility score.');
    expect(landing).toContain('No mind-reading.');
    expect(landing).toContain('No one-sided access.');
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
    expect(how).toContain('Set up your Baseline once. Use it wherever life connects.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(faq).toContain('What Sovereign understands. What remains yours to confirm.');
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
    expect(hardening).toContain('.sovereign-story-step');
    expect(hardening).toContain('@media (max-width: 680px)');
    expect(hardening).toContain('@media (prefers-reduced-motion: reduce)');
    expect(hardening).toContain('@media (forced-colors: active)');
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
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});
