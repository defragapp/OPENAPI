import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const index = read('../index.html');
const pricing = read('../public/pricing.html');
const questions = read('../public/faq.html');
const how = read('../public/how-it-works.html');
const robots = read('../public/robots.txt');
const sitemap = read('../public/sitemap.xml');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const safeArea = read('./engine-room-safe-area.css');

describe('public production release surfaces', () => {
  it('publishes canonical and controlled social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('Know yourself. Understand the system. Choose what fits.');
    for (const [page, canonical] of [[pricing, '/pricing'], [questions, '/faq'], [how, '/how-it-works']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.svg');
      expect(page).toContain('/static-release.css?v=20260730-cohesion');
    }
  });

  it('keeps private routes out of crawl guidance', () => {
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(sitemap).toContain('https://sovereign.defrag.app/how-it-works');
    expect(sitemap).not.toContain('.html');
    expect(sitemap).not.toContain('/app');
  });

  it('uses the canonical interactive Engine Room as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    for (const component of ['<HeroIntelligenceStage />', '<BaselineContextStage />', '<ConnectedScalesStage', '<PublicAnswerStage />', '<TerminalStage />']) {
      expect(landing).toContain(component);
    }
    expect(landing).toContain('EXAMPLE ANSWER · Sanitized demonstration · Not your Baseline');
    expect(landing).toContain('Your capacity is real. The question is whether the responsibility is actually yours.');
    expect(landing).toContain('Useful language first. Exact support when you want it.');
    expect(landing).toContain('SOVEREIGN+ / $20 MONTHLY / $99 YEARLY');
  });

  it('is responsive, reversible, keyboard accessible, and safe without motion', () => {
    expect(landing).toContain("window.addEventListener('scroll', requestUpdate, { passive: true })");
    expect(landing).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('role="tabpanel"');
    expect(landing).toContain('onKeyDown=');
    expect(landing).toContain('aria-live="polite"');
    expect(engine).toContain('@media (max-width: 900px)');
    expect(engine).toContain('@media (max-width: 760px)');
    expect(engine).toContain('@media (max-width: 440px)');
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
    expect(safeArea).toContain('env(safe-area-inset-bottom)');
  });
});
