import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landingScript = readFileSync(new URL('../public/public-site.js', import.meta.url), 'utf8');
const howItWorks = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('public Inner Recognition experience', () => {
  it('uses the founder-approved clear-guidance-first promise', () => {
    expect(howItWorks).toContain('Understand what this moment is bringing up in you.');
    expect(howItWorks).toContain('One useful question at a time.');
    expect(howItWorks).toContain('The systems stay in the background.');
    expect(howItWorks).toContain('The data supports the question. You decide whether the answer fits.');
    expect(howItWorks).not.toMatch(/trauma decoder|shadow analyzer|wound detection|emotional diagnosis/i);
  });

  it('explains relationship, family, spiritual, privacy, and saved-module behavior without certainty claims', () => {
    for (const copy of [
      'Understand the interaction without deciding who is wrong.',
      'Families often develop roles without naming them',
      'Meaning is welcome. Certainty is not forced.',
      'Nothing is saved without your choice.',
      'Shared framework evidence appears only with specific permission.'
    ]) expect(howItWorks).toContain(copy);
    expect(howItWorks).not.toMatch(/secretly thinks|destined|diagnos(?:e|is)|prove what another person thinks/i);
  });

  it('connects the current landing page without creating another application shell', () => {
    expect(index).toContain('/public-site.js');
    expect(landingScript).toContain("location.pathname !== '/'");
    expect(landingScript).toContain("'/how-it-works.html'");
    expect(landingScript).toContain('Talk it through');
    expect(landingScript).toContain('See how it works');
    expect(landingScript).toContain('Sign in');
  });

  it('keeps the support footer compact and secondary', () => {
    expect(howItWorks).toContain('EXAMPLE BASIS');
    expect(howItWorks).toContain('HD 5/1 · 13–33 | GK 16.1 · 9.1 | LIVE ♃☌☉');
    expect(howItWorks).toContain('Not a diagnosis');
    expect(howItWorks).toContain('Missing fields are omitted.');
  });
});
