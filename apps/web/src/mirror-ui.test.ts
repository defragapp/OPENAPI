import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const recognition = readFileSync(new URL('../public/recognition-ui.js', import.meta.url), 'utf8');
const mirror = readFileSync(new URL('../public/mirror-surface.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/mirror-ui.css', import.meta.url), 'utf8');

describe('separate archetype visual workspace', () => {
  it('loads after the AI thread enhancements without embedding inside Today', () => {
    expect(index).toContain('/mirror-ui.css');
    expect(index).toContain('/mirror-surface.js');
    expect(index.indexOf('/mirror-surface.js')).toBeGreaterThan(index.indexOf('/recognition-ui.js'));
    expect(recognition).not.toContain('renderMirrorExperience');
    expect(mirror).toContain("workspace.dataset.mirrorContract = 'interpretation-first-visual-second'");
    expect(styles).toContain('.app-shell.mirror-surface-open .workspace-frame{display:none}');
    expect(styles).toContain('.app-shell.mirror-surface-open>.tabbar{display:none}');
  });

  it('keeps interpretation and card artwork as separate data layers', () => {
    expect(mirror).toContain('interpretation:');
    expect(mirror).toContain('visualArchetype:');
    expect(mirror).toContain('The visual archetype can explain the result, but it can never create the result by itself.');
    expect(mirror).toContain('today?.today?.mirrorVisual');
    expect(mirror).not.toMatch(/tarot determines|card proves|draw determines/i);
  });

  it('presents origin, shadow, and gift without turning the archetype into identity', () => {
    for (const copy of ['Past protection', 'Shadow', 'Gift', 'WHAT MAY BE ACTIVE NOW', 'THE GIFT INSIDE IT']) {
      expect(mirror).toContain(copy);
    }
    expect(mirror).not.toMatch(/you are the fool|you are the magician|this card proves/i);
    expect(styles).toContain('[data-phase="origin"]');
    expect(styles).toContain('[data-phase="shadow"]');
    expect(styles).toContain('[data-phase="gift"]');
  });

  it('supports self, consented interaction, and family-role visual stories', () => {
    for (const mode of ['self', 'interaction', 'family']) expect(mirror).toContain(mode);
    expect(mirror).toContain('Each person confirms their own role.');
    expect(mirror).toContain('Both cards require identity-bound, active permission.');
    expect(mirror).toContain('Other people appear only when their permitted context is available.');
    expect(styles).toContain('.mirror-pair-stage');
    expect(styles).toContain('.mirror-family-stage');
  });

  it('is ready for animated artwork without requiring generated video at runtime', () => {
    expect(mirror).toContain('data-motion-engine="rive-ready"');
    expect(styles).toContain('.mirror-motion-echo');
    expect(styles).toContain('@keyframes mirror-breathe');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
  });

  it('supports premium iPhone and desktop interaction', () => {
    for (const selector of ['.mirror-visual-workspace', '.mirror-archetype-card', '.mirror-role-shelf', '.mirror-view-switcher']) {
      expect(styles).toContain(selector);
    }
    expect(styles).toContain('@media(min-width:1040px)');
    expect(styles).toContain('@media(max-width:680px)');
    expect(styles).toContain('safe-area-inset-top');
    expect(styles).toContain('min-height:48px');
    expect(styles).toContain('scroll-snap-type:x mandatory');
  });
});
