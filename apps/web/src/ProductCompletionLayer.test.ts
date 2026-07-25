import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const layer = readFileSync(new URL('./ProductCompletionLayer.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
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

  it('surfaces real pair and system responses instead of discarding them', () => {
    expect(layer).toContain("const RELATIONAL_EVENT = 'sovereign:relational-result'");
    expect(layer).toContain('/(compare|comparison)');
    expect(layer).toContain('/(alignment|analysis)');
    expect(layer).toContain('result.participants');
    expect(layer).toContain('Responsibility boundaries');
    expect(layer).toContain('Raw birth input shared');
  });

  it('provides owner and invitee revocation controls', () => {
    expect(layer).toContain('/api/v1/invitations/mine');
    expect(layer).toContain('stop using');
    expect(layer).toContain('Cancel invitation');
    expect(layer).toContain('Remove from workspace');
    expect(layer).toContain('Do not allow');
    expect(layer).not.toContain('grant on behalf');
  });

  it('keeps the review layer usable on small screens', () => {
    expect(css).toContain('safe-area-inset-bottom');
    expect(css).toContain('@media (max-width: 620px)');
    expect(css).toContain('max-height: calc(100dvh - 32px)');
  });
});
