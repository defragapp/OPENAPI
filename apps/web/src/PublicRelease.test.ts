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

  it('uses the five-state Engine Room as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('data-viewport-contract="engine-room-v1"');
    for (const component of ['<HeroState />', '<BaselineState />', '<ConnectedScalesState />', '<LiveQueryState />', '<ReadyState />']) {
      expect(landing).toContain(component);
    }
    expect(landing).toContain('Your intelligence begins with a stable Baseline.');
    expect(landing).toContain('Why do I keep taking responsibility for everyone else?');
    expect(landing).toContain('Your capacity is real.');
    expect(landing).toContain('The question is whether the responsibility is actually yours.');
    expect(landing).toContain('&gt; READY');
  });

  it('keeps the engine responsive, reversible, and accessible without depending on motion', () => {
    expect(landing).toContain("window.addEventListener('scroll', requestUpdate, { passive: true })");
    expect(landing).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(engine).toContain('@media (max-width: 900px)');
    expect(engine).toContain('@media (max-width: 680px)');
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
    expect(engine).toContain('@media (forced-colors: active)');
    expect(landing).toContain('role="img" aria-label="Demonstration Baseline compilation');
    expect(landing).toContain('aria-label="Self context moves into a consented relationship and then into a wider system"');
    expect(landing).toContain('aria-label="Sovereign query computation sequence"');
  });
});
