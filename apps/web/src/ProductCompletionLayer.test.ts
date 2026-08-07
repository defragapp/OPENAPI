import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const layer = readFileSync(new URL('./ProductCompletionLayer.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const space = readFileSync(new URL('./SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./product-completion.css', import.meta.url), 'utf8');

describe('product completion layer', () => {
  it('is activated by the production React entrypoint', () => {
    expect(main).toContain('installProductRuntime()');
    expect(main).toContain('<ProductCompletionLayer />');
    expect(main).toContain("import './product-completion.css'");
  });

  it('renders Turnstile explicitly from a public build-time site key', () => {
    expect(layer).toContain('VITE_TURNSTILE_SITE_KEY');
    expect(layer).toContain('api.js?render=explicit');
    expect(layer).toContain('turnstile.render');
    expect(layer).not.toContain('TURNSTILE_SECRET_KEY');
  });

  it('keeps pair and system responses inside their authoritative space surfaces', () => {
    expect(space).toContain('/comparison');
    expect(space).toContain('/analysis');
    expect(space).toContain('comparison.participants');
    expect(space).toContain('analysis.participants');
    expect(space).toContain('WHAT HAPPENS BETWEEN YOU');
    expect(space).toContain('Pressure field');
    expect(layer).not.toContain('sovereign:relational-result');
    expect(layer).not.toContain('RelationalResultDialog');
  });

  it('provides owner and invitee revocation controls in plain language', () => {
    expect(layer).toContain('/api/v1/invitations/mine');
    expect(layer).toContain('Compare together');
    expect(layer).toContain('Include in a system');
    expect(layer).toContain('stop using');
    expect(layer).toContain('Cancel invitation');
    expect(layer).toContain('Remove from space');
    expect(layer).toContain('Do not allow');
    expect(layer).not.toContain('grant on behalf');
  });

  it('keeps dialogs keyboard-closable and prevents background scrolling', () => {
    expect(layer).toContain("event.key !== 'Escape'");
    expect(layer).toContain("document.body.style.overflow = 'hidden'");
    expect(layer).toContain('aria-labelledby="shared-context-title"');
    expect(layer).toContain('aria-pressed={decision');
  });

  it('keeps the review layer usable without covering the composer', () => {
    expect(css).toContain('safe-area-inset-bottom');
    expect(css).toContain('@media (max-width: 620px)');
    expect(css).toContain('max-height: calc(100dvh - 32px)');
    expect(css).toContain('bottom: calc(176px + env(safe-area-inset-bottom))');
    expect(css).toContain('.shared-context-trigger { bottom: 176px; }');
  });
});
