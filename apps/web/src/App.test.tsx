import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Sovereign PWA shell', () => {
  const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
  const recognitionUi = readFileSync(new URL('../public/recognition-ui.js', import.meta.url), 'utf8');

  it('contains all authenticated surfaces', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) {
      expect(app).toContain(label);
    }
  });

  it('keeps Today Baseline-first and correction-ready', () => {
    expect(app).toContain('Your Baseline');
    expect(app).toContain('What may be louder now');
    expect(app).toContain('What you confirmed');
    expect(app).toContain('What remains unknown');
    expect(app).toContain('baseline?.reducedContext?.baselineTendency');
    expect(app).toContain('current?.reduced?.possibleCurrentAmplification');
    expect(app).toContain('Not today');
  });

  it('allows pinch zoom and includes mobile-safe CSS hooks', () => {
    expect(html).not.toContain('user-scalable=no');
    expect(css).toContain('safe-area-inset-bottom');
    expect(css).toContain('min-height: 44px');
  });

  it('keeps the responsive navigation and native Today data path', () => {
    expect(app).toContain('className="side-rail"');
    expect(app).toContain('className="tabbar"');
    expect(app).toContain("api('/api/v1/today')");
    expect(css).toContain('@media (max-width: 680px)');
  });

  it('uses visible field labels across private forms', () => {
    expect(app).toContain('className="field"');
    for (const label of ['Email address', 'Area of focus', 'Person’s name', 'System name', 'Birth date', 'Sovereign+ billing']) {
      expect(app).toContain(label);
    }
  });

  it('keeps consent under the invited person’s control', () => {
    expect(app).toContain('Send private invitation');
    expect(app).toContain('Choose what this connection may use.');
    expect(app).not.toContain('>Grant</button>');
    expect(consent).toContain('Manage what others may use.');
    expect(consent).toContain('Do not allow');
  });

  it('uses direct account language without exposing security implementation copy', () => {
    expect(app).toContain('Understand your life in context.');
    expect(app).toContain('Welcome back.');
    expect(app).toContain('Check your email for the private sign-in link.');
    expect(app).not.toMatch(/never reveal whether|whether or not an account exists|if this address can receive|no password/i);
  });

  it('keeps Library to explicitly saved understandings rather than blank composition', () => {
    expect(app).toContain('Return to what was worth keeping.');
    expect(app).toContain('Your Library is a collection of chosen insights');
    expect(app).not.toContain('Understanding title');
    expect(app).not.toContain('Editable summary');
  });

  it('requires a visible opt-in before exact shared framework evidence is requested', () => {
    expect(recognitionUi).toContain('Show exact supporting data');
    expect(recognitionUi).toContain('Optional. You can turn this off later.');
    expect(recognitionUi).toContain('shareFrameworkEvidence');
    expect(recognitionUi).toContain("!url.includes('/invitations/send') || !shareFrameworkEvidence");
    expect(recognitionUi).toContain("body.requestedScopes = [...new Set([...requestedScopes, 'framework.display'])]");
  });

  it('shows an Insight Module save action only after a server offer and explicit approval', () => {
    expect(html).toContain('/recognition-ui.js');
    expect(recognitionUi).toContain('x-sovereign-module-offer');
    expect(recognitionUi).toContain('Save reflection');
    expect(recognitionUi).toContain('approved: true');
    expect(recognitionUi).toContain('/modules/latest');
  });
});
