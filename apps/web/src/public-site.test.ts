import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landingScript = readFileSync(new URL('../public/public-site.js', import.meta.url), 'utf8');
const howItWorks = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const marketingCss = readFileSync(new URL('../public/marketing.css', import.meta.url), 'utf8');
const recognitionCss = readFileSync(new URL('../public/recognition-ui.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publicCopy = `${landingScript}\n${howItWorks}`;

describe('public Sovereign.OS marketing experience', () => {
  it('starts with personal context instead of an incident or empty chat prompt', () => {
    for (const copy of [
      'Start with context. <em>Not a blank box.</em>',
      'It already has a place to begin.',
      'Create my Baseline',
      'Useful before you ask.',
      'Open the app and see something useful.'
    ]) expect(publicCopy).toContain(copy);

    expect(publicCopy).not.toMatch(/tell it what happened|describe what happened|what happened\?|start with what happened|talk it through/i);
  });

  it('uses simple universal language without clinical, spiritual, or self-help identity', () => {
    expect(publicCopy).not.toMatch(/observatory|signal|orbit|map|trauma|shadow work|healing journey|spiritual|scripture|astrology|human design|gene keys|numerology|diagnos|therapy|therapeutic/i);
    for (const copy of [
      'how you make decisions, communicate, learn',
      'what may be stronger now',
      'the people you choose to include',
      'groups around you',
      'You decide what fits'
    ]) expect(publicCopy).toContain(copy);
  });

  it('shows a real product experience rather than an abstract diagram', () => {
    for (const copy of [
      'product-device',
      'product-screen',
      'A fast answer may feel clearer than it is.',
      'Give the decision one more pass.',
      'What stays true',
      'What may be stronger today'
    ]) expect(landingScript).toContain(copy);

    expect(marketingCss).toContain('.product-device');
    expect(marketingCss).toContain('.product-bottom-nav');
    expect(marketingCss).not.toMatch(/\.signal-|\.orbit|\.observatory/);
  });

  it('explains useful capabilities in ordinary language', () => {
    for (const copy of [
      'What Sovereign can help with',
      'Clearer decisions. Better conversations. Less guesswork.',
      'Act, wait, or clarify',
      'Understand the difference',
      'See the role you carry',
      'Keep the useful part. Leave the rest behind.'
    ]) expect(landingScript).toContain(copy);
  });

  it('keeps privacy, permission, uncertainty, and saving choices understandable', () => {
    for (const copy of [
      'Nothing shared without permission',
      'No claim is made about your exact state without your input.',
      'Sharing is a choice, not a shortcut.',
      'Saved only when you choose.'
    ]) expect(publicCopy).toContain(copy);

    expect(publicCopy).not.toMatch(/secretly thinks|destined|proves? what another person thinks|must be true/i);
  });

  it('loads the marketing surface without altering authenticated routes', () => {
    expect(index).toContain('/public-site.js');
    expect(index).toContain('/recognition-ui.css');
    expect(landingScript).toContain("location.pathname !== '/'");
    expect(landingScript).toContain("shell.className = 'marketing-page marketing-home'");
    expect(landingScript).toContain("link.href = '/marketing.css'");
    expect(landingScript).toContain('/how-it-works.html');
  });

  it('is designed for iPhone and desktop without hover-only controls', () => {
    for (const selector of [
      '.product-device',
      '.capability-layout',
      '.feature-rail',
      '.value-split',
      '.demo-window',
      '@media (max-width: 720px)'
    ]) expect(marketingCss).toContain(selector);

    expect(marketingCss).toContain('safe-area-inset-top');
    expect(marketingCss).toContain('safe-area-inset-bottom');
    expect(marketingCss).toContain('min-height: 44px');
    expect(marketingCss).toContain('prefers-reduced-motion');
    expect(marketingCss).toContain('-webkit-backdrop-filter');
  });

  it('keeps optional exact-data consent readable and explicit inside the app', () => {
    expect(recognitionCss).toContain('.scope-list > label');
    expect(recognitionCss).toContain('min-height: 58px');
    expect(recognitionCss).toContain('width: 24px');
    expect(recognitionCss).toContain('[data-recognition-module-offer]');
  });
});
