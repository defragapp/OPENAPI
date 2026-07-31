import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const hardening = readFileSync(new URL('./premium-surface-hardening.css', import.meta.url), 'utf8');

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

  it('uses the approved three-stage product demonstration as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('<HeroAnswerPreview />');
    expect(landing).toContain('<PersonalStory />');
    expect(landing).toContain('<RelationshipStory />');
    expect(landing).toContain('<SystemStory />');
    expect(landing).toContain('STEP 01 · YOU');
    expect(landing).toContain('STEP 02 · YOU + 1');
    expect(landing).toContain('STEP 03 · YOUR WHOLE SYSTEM');
    expect(landing).toContain('EXAMPLE ANSWER');
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing).toContain('Your capacity is real. The question is whether the responsibility is actually yours.');
    expect(landing).toContain('How Sovereign reads both of you');
    expect(landing).toContain('className="story-system-map"');
  });

  it('keeps the visual demonstrations responsive, interactive, and accessible without depending on motion', () => {
    expect(landingCss).toContain('@media (max-width: 760px)');
    expect(landingCss).toContain('@media (max-width: 440px)');
    expect(hardening).toContain('@media (max-width: 680px)');
    expect(hardening).toContain('@media (prefers-reduced-motion: reduce)');
    expect(hardening).toContain('@media (forced-colors: active)');
    expect(landing).toContain('aria-label="Permitted family system map"');
    expect(landing).toContain('aria-pressed={activeId === member.id}');
    expect(landing).toContain('aria-label={label || \'Baseline support\'}');
  });
});
