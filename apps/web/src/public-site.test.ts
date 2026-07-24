import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landingScript = readFileSync(new URL('../public/public-site.js', import.meta.url), 'utf8');
const howItWorks = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const marketingCss = readFileSync(new URL('../public/marketing.css', import.meta.url), 'utf8');
const recognitionCss = readFileSync(new URL('../public/recognition-ui.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publicCopy = `${landingScript}\n${howItWorks}`;

describe('public Sovereign.OS marketing experience', () => {
  it('explains the product in direct public language', () => {
    for (const copy of [
      'Personal AI that doesn’t make you start over.',
      'Create one private Baseline',
      'Set it up once. Use it whenever you need clarity.',
      'Give your personal AI a better place to begin.'
    ]) expect(publicCopy).toContain(copy);

    expect(publicCopy).not.toMatch(/tell it what happened|describe what happened|what happened\?|start with what happened|talk it through/i);
  });

  it('avoids clinical, religious, astrological, and self-help positioning', () => {
    expect(publicCopy).not.toMatch(/observatory|signal map|orbit|trauma|shadow work|healing journey|spiritual|scripture|astrology|human design|gene keys|numerology|therapy|therapeutic/i);
    expect(publicCopy).not.toMatch(/secretly thinks|destined|proves? what another person thinks|must be true/i);
  });

  it('shows the actual product structure instead of a generic marketing mockup', () => {
    for (const copy of [
      'Baseline tendency',
      'Current amplification',
      'Unknown actual state',
      'Today</span><span>Explore</span><span>People</span><span>Systems</span><span>Library',
      'You decide whether this fits.'
    ]) expect(publicCopy).toContain(copy);

    expect(marketingCss).toContain('.app-frame');
    expect(marketingCss).toContain('.desktop-app');
    expect(marketingCss).toContain('.showcase-tab');
  });

  it('demonstrates the main AI capabilities through one interactive product view', () => {
    for (const copy of [
      'What may deserve attention now',
      'Separate the choice from the pressure',
      'Understand where two approaches differ',
      'See the role you are expected to play',
      'data-view="today"',
      'data-view="decision"',
      'data-view="people"',
      'data-view="systems"'
    ]) expect(landingScript).toContain(copy);
  });

  it('keeps the landing focused and avoids the rejected repetitive statements', () => {
    expect(landingScript).not.toMatch(/Live a life you would choose to watch again|See more clearly, from the start|Built for the parts of life that are hard to read|Clearer decisions\. Better conversations\. Less guesswork/i);
    expect((landingScript.match(/<section/g) ?? []).length).toBeLessThanOrEqual(6);
  });

  it('keeps privacy and permission choices understandable', () => {
    for (const copy of [
      'Private by default',
      'Sharing needs permission',
      'Reduced before AI use.',
      'Included only with permission.',
      'Saved only when you choose.'
    ]) expect(publicCopy).toContain(copy);
  });

  it('loads the marketing surface without altering authenticated routes', () => {
    expect(index).toContain('/public-site.js');
    expect(index).toContain('/recognition-ui.css');
    expect(landingScript).toContain("location.pathname !== '/'");
    expect(landingScript).toContain("shell.className = 'marketing-page marketing-home'");
    expect(landingScript).toContain("link.href = '/marketing.css'");
  });

  it('is designed for iPhone and desktop', () => {
    for (const selector of [
      '.hero-v4',
      '.showcase-layout',
      '.desktop-app',
      '.baseline-section',
      '.control-grid',
      '@media (max-width:760px)'
    ]) expect(marketingCss).toContain(selector);

    expect(marketingCss).toContain('safe-area-inset-top');
    expect(marketingCss).toContain('safe-area-inset-bottom');
    expect(marketingCss).toContain('min-height:44px');
    expect(marketingCss).toContain('prefers-reduced-motion');
    expect(marketingCss).toContain('-webkit-backdrop-filter');
  });

  it('keeps optional exact-data consent readable inside the app', () => {
    expect(recognitionCss).toContain('.scope-list > label');
    expect(recognitionCss).toContain('min-height: 58px');
    expect(recognitionCss).toContain('width: 24px');
    expect(recognitionCss).toContain('[data-recognition-module-offer]');
  });
});
