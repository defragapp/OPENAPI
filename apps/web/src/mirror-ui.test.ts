import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const recognition = readFileSync(new URL('../public/recognition-ui.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/mirror-ui.css', import.meta.url), 'utf8');

describe('animated archetype visualization inside the AI thread', () => {
  it('keeps the existing AI workspace primary and removes the standalone Mirror surface', () => {
    expect(index).toContain('/recognition-ui.js');
    expect(index).toContain('/mirror-ui.css');
    expect(index).not.toContain('/mirror-surface.js');
    expect(recognition).toContain("panel.querySelector('.streamed-copy')");
    expect(recognition).toContain("section.dataset.visualContract = 'interpretation-first-artwork-second'");
    expect(styles).not.toContain('mirror-surface-open');
    expect(styles).not.toContain('.mirror-visual-workspace');
  });

  it('renders only validated visual metadata returned with an AI response', () => {
    expect(recognition).toContain("response.headers.get('x-sovereign-visual-story')");
    expect(recognition).toContain('decodeVisualPayload');
    expect(recognition).toContain('normalizeVisualPayload');
    expect(recognition).toContain('story?.should_show');
    expect(recognition).toContain('The interpretation was completed first');
    expect(recognition).toContain('Interpreted first · Illustrated second');
    expect(recognition).not.toMatch(/tarot determines|card proves|draw determines/i);
  });

  it('shows past protection, shadow, and gift as views of one grounded role', () => {
    for (const phrase of ['Past protection', 'Shadow', 'Gift', 'WHAT THIS ROLE MAY HAVE LEARNED', 'THE CAPACITY INSIDE THE ROLE']) {
      expect(recognition).toContain(phrase);
    }
    expect(recognition).toContain("visualPhase = latestVisual?.story?.primary?.phase || 'shadow'");
    expect(recognition).toContain('data-visual-phase');
    expect(styles).toContain('[data-phase="origin"]');
    expect(styles).toContain('[data-phase="shadow"]');
    expect(styles).toContain('[data-phase="gift"]');
  });

  it('supports self, consented interaction, and family-system layouts without changing the chat flow', () => {
    for (const mode of ['self', 'interaction', 'family']) expect(recognition).toContain(mode);
    expect(recognition).toContain("story.mode !== 'self'");
    expect(recognition).toContain('Permitted relationship context');
    expect(styles).toContain('.thread-card-stage-interaction');
    expect(styles).toContain('.thread-card-stage-family');
    expect(styles).toContain('.thread-role-connection');
  });

  it('uses original layered SVG art with deterministic character motion', () => {
    for (const archetype of ['fool', 'magician', 'three_of_cups', 'hermit', 'strength', 'tower']) {
      expect(recognition).toContain(archetype);
    }
    expect(recognition).toContain('data-motion-engine="layered-svg"');
    expect(recognition).toContain('<svg viewBox="0 0 300 430"');
    expect(styles).toContain('@keyframes visual-fool-step');
    expect(styles).toContain('@keyframes visual-magician-arm');
    expect(styles).toContain('@keyframes visual-cups-toast');
    expect(styles).toContain('@keyframes visual-tower-flash');
  });

  it('keeps corrections inside the existing thread and preserves user authority', () => {
    expect(recognition).toContain('/corrections');
    expect(recognition).toContain("saveVisualCorrection('yes'");
    expect(recognition).toContain("saveVisualCorrection('partly'");
    expect(recognition).toContain("saveVisualCorrection('not_today'");
    expect(recognition).toContain('Your enduring Baseline was not rewritten.');
    expect(recognition).toContain('temporary visual role, not an identity or a source of truth');
  });

  it('is premium, iPhone-safe, and reduced-motion aware', () => {
    for (const selector of ['.thread-visual-story', '.thread-visual-card', '.thread-phase-control', '.thread-visual-basis']) {
      expect(styles).toContain(selector);
    }
    expect(styles).toContain('@media (max-width: 680px)');
    expect(styles).toContain('safe-area-inset-bottom');
    expect(styles).toContain('min-height: 48px');
    expect(styles).toContain('scroll-snap-type: x mandatory');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});