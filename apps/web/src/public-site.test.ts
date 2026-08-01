import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const policy = read('./PublicPolicy.tsx');
const main = read('./main.tsx');
const how = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const notFound = read('../public/404.html');
const consent = read('../public/consent.html');
const consentCss = read('../public/consent.css');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('opens inside the intelligence engine rather than a conventional marketing page', () => {
    expect(landing).toContain('className="sovereign-landing engine-room"');
    expect(landing).toContain('KNOW YOURSELF.');
    expect(landing).toContain('UNDERSTAND THE SYSTEM.');
    expect(landing).toContain('Personal, relationship, and system intelligence built from context.');
    expect(landing).toContain('&gt; BUILD_MY_BASELINE');
    expect(landing).toContain('&gt; VIEW_ENGINE');
    expect(landing).not.toContain('<section className="landing-foundation"');
    expect(landing).not.toContain('className="pricing-preview"');
  });

  it('shows one deterministic computation from Baseline through a real question', () => {
    for (const value of [
      'Your intelligence begins with a stable Baseline.',
      'INPUT / NATAL_REDUCTION',
      'STATUS / VALIDATED',
      'Move outward without rebuilding context.',
      'PERMISSION /',
      'SOURCE /',
      'CONSENTED',
      'Why do I keep taking responsibility for everyone else?',
      'FETCH_BASELINE',
      'APPLY_CURRENT_CONTEXT',
      'DISTINGUISH_SIGNAL',
      'FORM_UNDERSTANDING',
      'Your capacity is real.',
      'The question is whether the responsibility is actually yours.',
      'I will do my part.',
      'I must make this work for everyone.',
      '&gt; READY'
    ]) expect(landing).toContain(value);
  });

  it('uses a continuous pinned canvas and a deliberate mobile recomposition', () => {
    expect(engine).toContain('.engine-scroll-shell { min-height: 600svh; }');
    expect(engine).toContain('position: sticky');
    expect(engine).toContain('.engine-grid');
    expect(engine).toContain('.baseline-machine');
    expect(engine).toContain('.scale-field');
    expect(engine).toContain('.query-computation');
    expect(engine).toContain('@media (max-width: 680px)');
    expect(engine).toMatch(/@media \(max-width: 680px\)[\s\S]*?position: relative;/);
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
    expect(engine).not.toContain('border-radius: 999px');
  });

  it('keeps privacy and permission visible without fake metrics', () => {
    expect(landing).toContain('PERMISSION /');
    expect(landing).toContain('CONTEXT /');
    expect(landing).toContain('SCOPE /');
    expect(landing).toContain('SOURCE /');
    expect(landing).not.toContain('OVERLAP: 68%');
    expect(landing).not.toContain('compatibility score');
    expect(faq).toContain('It cannot know another person’s exact feelings, motives, private experience, or future behavior.');
  });

  it('keeps verified pricing, correction, and optional Covenant explicit on support surfaces', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Review and correct what does not fit', 'Covenant']) {
      expect(publicCopy).toContain(phrase);
    }
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('renders public React routes without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
    expect(main).toContain("import './engine-room.css'");
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('keeps support pages and consent independently controlled', () => {
    for (const page of [how, pricing, faq]) {
      expect(page).toContain('/premium-public-release.css?v=20260730-final');
      expect(page).toContain('SOVEREIGN.OS');
    }
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(notFound).toContain('content="noindex, nofollow"');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});
