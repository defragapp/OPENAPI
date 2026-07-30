import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = {
  landing: readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8'),
  workspace: readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8'),
  account: readFileSync(new URL('./App.tsx', import.meta.url), 'utf8'),
  onboarding: readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8'),
  permissions: readFileSync(new URL('./ProductCompletionLayer.tsx', import.meta.url), 'utf8'),
  accountControls: readFileSync(new URL('./AccountControlCenter.tsx', import.meta.url), 'utf8'),
  policy: readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8'),
  how: readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8'),
  pricing: readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8'),
  faq: readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8'),
  consent: readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8'),
  consentRuntime: readFileSync(new URL('../public/consent.js', import.meta.url), 'utf8'),
  prompt: readFileSync(new URL('../../sovereign-worker/src/agent/prompt-v1.ts', import.meta.url), 'utf8')
};
const allCopy = Object.values(files).join('\n');

describe('plain-language product copy', () => {
  it('states the product, action, and plan difference without interpretation', () => {
    expect(files.landing).toContain('Ask about your life.');
    expect(files.landing).toContain('Get an answer built around you.');
    expect(files.landing).toContain('Build your private Baseline once');
    expect(files.pricing).toContain('Use Free for personal questions. Use Sovereign+ for relationships and groups.');
    expect(files.onboarding).toContain('Choose Free or Sovereign+.');
  });

  it('gives each authenticated surface a literal purpose', () => {
    for (const phrase of [
      'See what is steady and what may matter more now',
      'Ask about yourself or a decision',
      'Understand a relationship with permission',
      'See roles, authority, responsibility, and pressure',
      'Return to insights you chose to save',
      'Manage your Baseline, plan, privacy, and account'
    ]) expect(files.workspace).toContain(phrase);
  });

  it('explains source detail, uncertainty, and permission in familiar words', () => {
    expect(files.workspace).toContain('Supporting details');
    expect(files.workspace).toContain('What shaped this answer');
    expect(files.workspace).toContain('Temporary current context does not determine your behavior.');
    expect(files.account).toContain('Choose what Sovereign may use about you.');
    expect(files.permissions).toContain('Manage shared permissions.');
    expect(files.consent).toContain('Review and change each permission.');
    expect(files.consentRuntime).toContain('Choose Allow or Do not allow for each permission.');
  });

  it('enforces direct generated answers instead of abstract AI prose', () => {
    for (const phrase of [
      'The direct answer must make sense by itself',
      'Write for a first-time user',
      'Use short, concrete sentences',
      'Prefer common verbs',
      'A user should be able to quote the direct answer'
    ]) expect(files.prompt).toContain(phrase);
  });

  it('rejects retired abstract and metaphor-dependent copy across active surfaces', () => {
    for (const phrase of [
      'Know yourself.',
      'Understand the system.',
      'Choose what fits.',
      'Begin with yourself',
      'The question changes. The environment stays the same.',
      'Another person remains a person—not a data source you control.',
      'Your intelligence begins with your Baseline.',
      'Your intelligence begins here.',
      'Bring the whole structure into view.',
      'Keep what changes your understanding.',
      'Opening your intelligence.',
      'Why this is personal',
      'Bring one relationship into view.',
      'Your controls stay together.'
    ]) expect(allCopy).not.toContain(phrase);
  });
});