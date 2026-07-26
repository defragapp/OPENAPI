import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentCss = readFileSync(new URL('../public/consent.css', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('../public/launch.css', import.meta.url), 'utf8');
const launchPolishCss = readFileSync(new URL('../public/launch-polish.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const productionPolishCss = readFileSync(new URL('./production-polish.css', import.meta.url), 'utf8');
const languageRuntime = readFileSync(new URL('./ProductLanguageRuntime.ts', import.meta.url), 'utf8');
const recognitionCss = readFileSync(new URL('../public/recognition-ui.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${languageRuntime}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS launch surface', () => {
  it('positions the complete Baseline Design platform in direct language', () => {
    for (const phrase of [
      'Know yourself. Understand the system. Choose what fits.',
      'Baseline Design',
      'shadow and light',
      'alignment',
      'See the relationship from both sides',
      'Understand the whole system',
      'Covenant'
    ]) expect(publicCopy).toContain(phrase);
    expect(publicCopy).not.toMatch(/healing journey|observatory|signal map|we know what they feel|hidden motive revealed|diagnose the relationship/i);
    expect(publicCopy).not.toMatch(/never reveal whether|whether or not an account exists|hidden reasoning|identity-bound|scope-specific|reduced context/i);
  });

  it('does not reduce the product to incident analysis or one prescribed move', () => {
    expect(publicCopy).not.toContain('Bring a real question. Leave with a clearer next move.');
    expect(publicCopy).not.toContain('ONE NEXT MOVE');
    expect(publicCopy).not.toContain('Build the Baseline before bringing the big question.');
    expect(publicCopy).toContain('Do I have to arrive with a problem?');
    expect(publicCopy).toContain('No. Your Baseline Design is useful on its own.');
  });

  it('renders public React routes directly and keeps one complete route set', () => {
    for (const href of ['/how-it-works.html', '/pricing.html', '/faq.html', '/login', '/signup', '/privacy', '/terms']) {
      expect(publicCopy).toContain(href);
    }
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain("location.pathname === '/privacy'");
    expect(main).toContain("location.pathname === '/terms'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
    expect(index).not.toContain('/public-site.js');
    expect(policy).not.toContain('landing-mark');
  });

  it('matches the live launch billing and usage contract', () => {
    for (const phrase of ['$20', '$99', '10 Sovereign responses', '300 Sovereign responses', 'ongoing plan', 'Stripe']) {
      expect(publicCopy).toContain(phrase);
    }
    for (const feature of ['Today', 'Explore', 'People', 'Systems', 'Library', 'Covenant', 'sharing']) {
      expect(publicCopy).toContain(feature);
    }
    expect(publicCopy).not.toMatch(/full account export|export features/i);
    expect(pricing).toContain('does not delete the workspace');
    expect(publicCopy).not.toMatch(/donate\.stripe\.com|Support Sovereign\.OS|Support the platform/i);
  });

  it('explains privacy, permission, uncertainty, and user authority clearly', () => {
    for (const phrase of [
      'Raw birth',
      'permission',
      'cannot establish another person’s private motive',
      'Private account export is not available at launch',
      'Your experience remains authoritative'
    ]) expect(publicCopy).toContain(phrase);
  });

  it('keeps the landing focused while explaining the full platform', () => {
    expect((landing.match(/<section/g) ?? []).length).toBeLessThanOrEqual(7);
    for (const label of ['BASELINE DESIGN', 'APPLY IT ANYWHERE', 'RELATIONSHIPS · FAMILIES · TEAMS', 'Privacy and control']) {
      expect(landing).toContain(label);
    }
    expect(landing).toContain('A deeper understanding of you—and everyone your life includes.');
    expect(landing).not.toMatch(/See more clearly, from the start|Clearer decisions\. Better conversations/i);
  });

  it('ships accessible, concrete examples rather than decorative mockups', () => {
    for (const phrase of [
      'role="tablist"',
      'role="tabpanel"',
      'aria-live="polite"',
      'onKeyDown',
      'ArrowLeft',
      'ArrowRight',
      'aria-selected',
      'Examples show possibilities, not verdicts'
    ]) expect(landing).toContain(phrase);
    for (const selector of [
      '.baseline-card',
      '.example-tabs',
      '.example-thread',
      '.example-sovereign',
      '.example-integration'
    ]) expect(landingCss).toContain(selector);
  });

  it('uses responsive motion-led design layers with reduced-motion support', () => {
    for (const selector of ['.launch-nav', '.launch-hero', '.launch-grid', '.pricing-grid', '.faq-list', '.launch-callout']) {
      expect(launchCss).toContain(selector);
    }
    for (const page of [how, pricing, faq]) {
      expect(page).toContain('/launch.css?v=20260726-platform-r2');
      expect(page).toContain('/launch-polish.css?v=20260726-final-r1');
      expect(page).not.toContain('/marketing.css');
    }
    expect(main).toContain("import './production-polish.css';");
    expect(launchPolishCss).toContain('@supports (animation-timeline: view())');
    expect(launchPolishCss).toContain('prefers-reduced-motion');
    expect(productionPolishCss).toContain('@supports (animation-timeline: view())');
    expect(productionPolishCss).toContain('prefers-reduced-motion');
    expect(productionPolishCss).toContain('@media (max-width: 720px)');
  });

  it('keeps consent management inside the current product and permission language', () => {
    expect(consent).toContain('/launch.css?v=20260726-platform-r2');
    expect(consent).toContain('/consent.css?v=20260726-consent-r1');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consent).toContain('noindex,nofollow');
    expect(consent).not.toContain('<style>');
    expect(consentCss).toContain('.consent-hero');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });

  it('numbers the four-part product summary from 01 through 04', () => {
    expect(launchCss).toContain('counter-reset: summary-step');
    expect(launchCss).toContain('counter-increment: summary-step');
    expect(launchCss).toContain('counter(summary-step, decimal-leading-zero)');
  });

  it('keeps sign-in, account creation, and authenticated recognition controls reachable', () => {
    expect(landing).toContain('href="/login"');
    expect(landing).toContain('href="/signup"');
    expect(recognitionCss).toContain('.scope-list > label');
    expect(recognitionCss).toContain('[data-recognition-module-offer]');
  });
});
