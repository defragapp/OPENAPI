import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('../public/launch.css', import.meta.url), 'utf8');
const launchPolish = readFileSync(new URL('../public/launch-polish.css', import.meta.url), 'utf8');
const marketingCss = readFileSync(new URL('../public/marketing.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const releaseCss = readFileSync(new URL('./public-landing-release.css', import.meta.url), 'utf8');
const recognitionCss = readFileSync(new URL('../public/recognition-ui.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}`;

 describe('Sovereign.OS launch surface', () => {
  it('uses the approved sharp, grounded product voice', () => {
    for (const phrase of [
      'See what is really happening. Choose without losing yourself.',
      'Bring the real moment. See what belongs where.',
      'Simple on the surface. Careful underneath.',
      'Set it up once. Correct it as you go.',
      'Unknowns remain unknown'
    ]) expect(publicCopy).toContain(phrase);
    expect(publicCopy).not.toMatch(/healing journey|observatory|signal map|we know what they feel|hidden motive revealed|diagnose the relationship/i);
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
  });

  it('matches the live launch billing and usage contract', () => {
    for (const phrase of ['$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'permanent plan', 'Stripe']) {
      expect(publicCopy).toContain(phrase);
    }
    for (const feature of ['Today', 'Explore', 'People', 'Systems', 'Library', 'Covenant', 'sharing']) {
      expect(publicCopy).toContain(feature);
    }
    expect(publicCopy).not.toMatch(/full account export|export features/i);
    expect(pricing).toContain('Your workspace is not deleted when a paid subscription ends.');
    expect(publicCopy).not.toMatch(/donate\.stripe\.com|Support Sovereign\.OS|Support the platform/i);
  });

  it('explains privacy, permission, uncertainty, and visual authority clearly', () => {
    for (const phrase of [
      'Raw birth input',
      'identity-bound, scope-specific permission',
      'Unknowns remain unknown',
      'Private account export is not available at launch',
      'The visual helps explain an answer. It does not create one.'
    ]) expect(publicCopy).toContain(phrase);
  });

  it('keeps the landing focused while explaining the internal product', () => {
    expect((landing.match(/<section/g) ?? []).length).toBeLessThanOrEqual(6);
    for (const label of ['Today', 'Explore', 'People & Systems', 'Library & Covenant']) expect(landing).toContain(label);
    expect(landing).not.toMatch(/Live a life you would choose to watch again|See more clearly, from the start|Clearer decisions\. Better conversations/i);
  });

  it('ships a real accessible motion demo rather than a decorative mockup', () => {
    for (const phrase of [
      'role="tablist"',
      'aria-live="polite"',
      'onKeyDown',
      'ArrowLeft',
      'ArrowRight',
      'aria-pressed',
      "matchMedia('(prefers-reduced-motion: reduce)')"
    ]) expect(landing).toContain(phrase);
    for (const selector of [
      '.today-preview',
      '.preview-tabs',
      '.baseline-orbit',
      '@keyframes landing-orbit',
      '@keyframes preview-enter'
    ]) expect(`${landingCss}\n${releaseCss}`).toContain(selector);
  });

  it('uses responsive shared public design layers', () => {
    for (const selector of ['.launch-nav', '.launch-hero', '.launch-grid', '.pricing-grid', '.faq-list', '.launch-callout']) {
      expect(launchCss).toContain(selector);
    }
    expect(launchCss).toContain('@media(max-width:820px)');
    expect(marketingCss).toContain('safe-area-inset-top');
    expect(landingCss).toContain('@media (max-width: 760px)');
    expect(releaseCss).toContain('@media (max-width: 760px)');
    expect(releaseCss).toContain('prefers-reduced-motion');
    expect(launchPolish).toContain(':focus-visible');
  });

  it('keeps sign-in, account creation, and authenticated recognition controls reachable', () => {
    expect(landing).toContain('href="/login"');
    expect(landing).toContain('href="/signup"');
    expect(recognitionCss).toContain('.scope-list > label');
    expect(recognitionCss).toContain('[data-recognition-module-offer]');
  });
});
