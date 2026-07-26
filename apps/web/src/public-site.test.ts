import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../public/public-site.js', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('../public/launch.css', import.meta.url), 'utf8');
const launchPolish = readFileSync(new URL('../public/launch-polish.css', import.meta.url), 'utf8');
const marketingCss = readFileSync(new URL('../public/marketing.css', import.meta.url), 'utf8');
const recognitionCss = readFileSync(new URL('../public/recognition-ui.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${how}\n${pricing}\n${faq}`;

describe('Sovereign.OS launch surface', () => {
  it('uses the approved sharp, grounded product voice', () => {
    for (const phrase of [
      'See what is really happening.',
      'Bring the decision, the silence, the reaction, or the pressure.',
      'People do not arrive with clean categories. They arrive with experiences.',
      'Bring the real moment. See what belongs where.',
      'Set it up once. Correct it as you go.'
    ]) expect(publicCopy).toContain(phrase);
    expect(publicCopy).not.toMatch(/healing journey|observatory|signal map|we know what they feel|hidden motive revealed|diagnose the relationship/i);
  });

  it('includes one complete public route set', () => {
    for (const href of ['/how-it-works.html', '/pricing.html', '/faq.html', '/login', '/signup', '/privacy', '/terms']) {
      expect(publicCopy).toContain(href);
    }
    expect(landing).toContain("location.pathname === '/'");
    expect(landing).toContain("location.pathname === '/privacy'");
    expect(landing).toContain("location.pathname === '/terms'");
    expect(landing).toContain('renderPolicyPage');
    expect(index).toContain('/public-site.js');
  });

  it('matches the launch billing contract', () => {
    for (const phrase of ['$20', '$99', '10 Sovereign AI turns', 'permanent plan', 'Stripe']) {
      expect(publicCopy).toContain(phrase);
    }
    for (const feature of ['Today', 'Explore', 'People', 'Systems', 'Library', 'Covenant', 'export']) {
      expect(publicCopy).toContain(feature);
    }
    expect(pricing).toContain('Your workspace is not deleted when a paid subscription ends.');
  });

  it('explains privacy, permission, uncertainty, and visual authority clearly', () => {
    for (const phrase of [
      'Reduced before AI use.',
      'Permission is required.',
      'Unknowns remain unknown',
      'A suggestion is not a verdict.',
      'The artwork explains an answer. It does not create one.',
      'does not claim hidden motives'
    ]) expect(publicCopy).toContain(phrase);
  });

  it('keeps the landing focused', () => {
    expect((landing.match(/<section/g) ?? []).length).toBeLessThanOrEqual(6);
    expect(landing).not.toMatch(/Live a life you would choose to watch again|See more clearly, from the start|Clearer decisions\. Better conversations/i);
  });

  it('ships a real, accessible motion demo rather than a decorative mockup', () => {
    for (const phrase of [
      'recognitionScenarios',
      'data-recognition-tab',
      'aria-live="polite"',
      'activateRecognitionDemo()',
      "['ArrowLeft', 'ArrowRight', 'Home', 'End']",
      "matchMedia('(prefers-reduced-motion: reduce)')"
    ]) expect(landing).toContain(phrase);
    for (const selector of [
      '.recognition-frame',
      '.recognition-tabs',
      '.baseline-field',
      '@keyframes sovereign-orbit',
      '@keyframes recognition-refresh'
    ]) expect(launchPolish).toContain(selector);
  });

  it('uses a shared responsive public design layer', () => {
    for (const selector of ['.launch-nav', '.launch-hero', '.launch-grid', '.pricing-grid', '.faq-list', '.launch-callout']) {
      expect(launchCss).toContain(selector);
    }
    expect(launchCss).toContain('@media(max-width:820px)');
    expect(launchCss).toContain('min-height:44px');
    expect(marketingCss).toContain('safe-area-inset-top');
    expect(marketingCss).toContain('prefers-reduced-motion');
    expect(landing).toContain("ensureStyle('/launch-polish.css', 'sovereign-launch-polish')");
    expect(launchPolish).toContain('@media (max-width:560px)');
  });

  it('keeps sign-in and account creation reachable on mobile', () => {
    for (const document of [how, pricing, faq, index]) expect(document).toContain('/launch-polish.css');
    expect(launchPolish).toContain('.launch-links a[href="/login"]');
    expect(launchPolish).toContain('display:inline-flex');
    expect(launchPolish).toContain(':focus-visible');
    expect(launchPolish).toContain('prefers-reduced-motion');
  });

  it('keeps authenticated recognition controls separate from marketing', () => {
    expect(recognitionCss).toContain('.scope-list > label');
    expect(recognitionCss).toContain('[data-recognition-module-offer]');
    expect(landing).not.toContain('mirror-surface');
  });
});
