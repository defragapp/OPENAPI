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
    expect(app).toContain('Baseline tendency');
    expect(app).toContain('Current amplification');
    expect(app).toContain('Known observation');
    expect(app).toContain('Unknown actual state');
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
    expect(css).toContain('@media (min-width: 1040px)');
  });

  it('uses visible field labels across private forms', () => {
    expect(app).toContain('className="field"');
    for (const label of ['Email address', 'Area of focus', 'Person’s name', 'System name', 'Birth date', 'Sovereign+ billing']) {
      expect(app).toContain(label);
    }
  });

  it('keeps consent under the invited person’s control', () => {
    expect(app).toContain('Send private invitation');
    expect(app).toContain('You decide what may be shared.');
    expect(app).not.toContain('>Grant</button>');
    expect(consent).toContain('Your permissions remain yours.');
    expect(consent).toContain('Do not allow');
  });

  it('requires a visible opt-in before exact shared framework evidence is requested', () => {
    expect(recognitionUi).toContain('Show exact supporting data');
    expect(recognitionUi).toContain('framework.display · optional and revocable');
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
