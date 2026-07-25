import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const recognition = readFileSync(new URL('../public/recognition-ui.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/mirror-ui.css', import.meta.url), 'utf8');
const clarity = readFileSync(new URL('../public/archetype-clarity.js', import.meta.url), 'utf8');
const clarityStyles = readFileSync(new URL('../public/archetype-clarity.css', import.meta.url), 'utf8');

describe('animated archetype visualization inside the AI thread', () => {
  it('keeps the AI workspace primary and targets the latest completed response', () => {
    expect(index).toContain('/recognition-ui.js');
    expect(index).toContain('/mirror-ui.css');
    expect(index).toContain('/archetype-clarity.js');
    expect(index).toContain('/archetype-clarity.css');
    expect(index.indexOf('/archetype-clarity.js')).toBeGreaterThan(index.indexOf('/recognition-ui.js'));
    expect(index).not.toContain('/mirror-surface.js');
    expect(recognition).toContain("panel.querySelector('.streamed-copy')");
    expect(recognition).toContain('latestResultPanel');
    expect(recognition).toContain("section.dataset.visualContract = 'interpretation-first-artwork-second'");
    expect(styles).not.toContain('mirror-surface-open');
  });

  it('avoids mutation-driven rerender loops and pauses offscreen animation', () => {
    expect(recognition).toContain('scheduleEnhancements');
    expect(recognition).toContain('requestAnimationFrame(renderEnhancements)');
    expect(recognition).toContain('section.dataset.renderKey !== renderKey');
    expect(recognition).toContain('IntersectionObserver');
    expect(styles).toContain('.visual-story-offscreen');
    expect(styles).toContain('animation-play-state: paused');
    expect(clarity).toContain('requestAnimationFrame(enhanceArchetypeStories)');
    expect(clarity).toContain('section.dataset.clarityKey === key');
  });

  it('renders only validated response metadata after user confirmation', () => {
    expect(recognition).toContain("response.headers.get('x-sovereign-visual-story')");
    expect(recognition).toContain('decodeVisualPayload');
    expect(recognition).toContain('normalizeVisualPayload');
    expect(recognition).toContain('story?.should_show');
    expect(recognition).toContain('if (!basis.user_confirmed) return null');
    expect(recognition).toContain('Answer first · Art second');
    expect(recognition).not.toMatch(/tarot determines|card proves|draw determines/i);
    expect(clarity).toContain('Baseline → timing → visual');
  });

  it('makes the wound, shadow, and gift movement explicit in the visible UI', () => {
    for (const phrase of ['PAST PROTECTION', 'WOUND / HISTORY', 'SHADOW', 'UNDER PRESSURE', 'GIFT', 'CLEAR EXPRESSION']) {
      expect(clarity).toContain(phrase);
    }
    expect(clarity).toContain('One role. Three expressions.');
    expect(clarity).toContain('WHAT THIS ROLE LEARNED TO PROTECT');
    expect(clarity).toContain('HOW THE ROLE TIGHTENS UNDER PRESSURE');
    expect(clarity).toContain('HOW THE SAME ENERGY BECOMES USEFUL');
    expect(recognition).toContain("const phases = ['origin', 'shadow', 'gift']");
    expect(recognition).toContain('Play the movement');
    expect(recognition).toContain('aria-pressed');
    expect(styles).toContain('[data-phase="origin"]');
    expect(styles).toContain('[data-phase="shadow"]');
    expect(styles).toContain('[data-phase="gift"]');
  });

  it('defines the visual result as role, pressure, and movement', () => {
    expect(clarity).toContain('<span>ROLE</span>');
    expect(clarity).toContain('PRESSURE NOW');
    expect(clarity).toContain('NEXT MOVEMENT');
    expect(clarity).toContain('dataset.roleMap');
    expect(clarityStyles).toContain('[data-role-map="true"]');
    expect(clarityStyles).toContain('[data-role-summary]');
  });

  it('supports self, consented interaction, and family layouts without changing chat flow', () => {
    for (const mode of ['self', 'interaction', 'family']) expect(recognition).toContain(mode);
    expect(recognition).toContain("normalized.mode !== 'self' && basis.relationship.length === 0");
    expect(recognition).toContain('Permitted relationship context');
    expect(styles).toContain('.thread-card-stage-interaction');
    expect(styles).toContain('.thread-card-stage-family');
    expect(styles).toContain('.thread-role-connection');
  });

  it('uses original layered SVG art with archetype-specific motion', () => {
    for (const archetype of ['fool', 'magician', 'three_of_cups', 'hermit', 'strength', 'tower']) {
      expect(recognition).toContain(archetype);
    }
    expect(recognition).toContain('data-motion-engine="layered-svg"');
    expect(recognition).toContain('<svg viewBox="0 0 300 430"');
    expect(styles).toContain('@keyframes visual-fool-step');
    expect(styles).toContain('@keyframes visual-magician-arm');
    expect(styles).toContain('@keyframes visual-cups-toast');
    expect(styles).toContain('@keyframes visual-tower-flash');
    expect(clarityStyles).toContain('backdrop-filter: blur(15px)');
  });

  it('keeps corrections in the current thread and preserves user authority', () => {
    expect(recognition).toContain('/corrections');
    expect(recognition).toContain("saveVisualCorrection('yes')");
    expect(recognition).toContain("saveVisualCorrection('partly')");
    expect(recognition).toContain("saveVisualCorrection('not_today')");
    expect(recognition).toContain('Your enduring Baseline was not rewritten.');
    expect(recognition).toContain('not an identity, diagnosis, prediction, or source of truth');
    expect(clarity).toContain('one possible role, not a fixed identity');
  });

  it('is compact, iPhone-safe, and reduced-motion aware', () => {
    for (const selector of ['.thread-visual-story', '.thread-visual-card', '.thread-phase-control', '.thread-play-button', '.thread-visual-basis']) {
      expect(styles).toContain(selector);
    }
    expect(styles).toContain('@media (max-width: 680px)');
    expect(styles).toContain('safe-area-inset-bottom');
    expect(styles).toContain('min-height: 48px');
    expect(styles).toContain('scroll-snap-type: x mandatory');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('.thread-play-button { display: none; }');
    expect(clarityStyles).toContain('grid-auto-columns: minmax(78%, 1fr)');
    expect(clarityStyles).toContain('scroll-snap-type: x mandatory');
  });
});
