import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../public/recognition-ui.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/mirror-ui.css', import.meta.url), 'utf8');

describe('Baseline mirror visual experience', () => {
  it('loads as a scoped layer inside the existing workspace', () => {
    expect(index).toContain('/mirror-ui.css');
    expect(index.indexOf('/mirror-ui.css')).toBeGreaterThan(index.indexOf('/premium-ui.css'));
    expect(script).toContain('renderMirrorExperience');
    expect(script).toContain("currentSurface !== 'Today'");
    expect(script).toContain("data.mirrorContract = 'baseline-current-user-confirmed'");
  });

  it('presents six potential roles without turning them into identities', () => {
    for (const role of [
      'Preserving connection',
      'Creating order',
      'Seeking support',
      'Creating change',
      'Protecting space',
      'Defending a limit'
    ]) expect(script).toContain(role);

    expect(script).toContain('The card is a possible role—not a fixed identity or a verdict.');
    expect(script).not.toMatch(/you are the peacemaker|you are the controller|reveals your shadow/i);
  });

  it('keeps natal support, current context, and user confirmation separate', () => {
    for (const copy of [
      'Natal foundation',
      'Current context',
      'Your confirmation',
      'Exact verified natal factors appear here when available.',
      'Timing may change the expression; it does not prove the role.'
    ]) expect(script).toContain(copy);

    expect(script).toContain('U✓ Your confirmation');
    expect(script).toContain('/api/v1/today');
    expect(script).toContain('data?.today?.mirror');
  });

  it('shows movement through clear, pressure, automatic, and returning states', () => {
    for (const state of ['clear', 'pressure', 'automatic', 'returning']) {
      expect(script).toContain(state);
      expect(styles).toContain(`[data-orientation="${state}"]`);
    }
    expect(script).toContain('This feels close');
    expect(script).toContain('Partly');
    expect(script).toContain('Show another role');
  });

  it('supports premium iPhone and desktop interaction', () => {
    for (const selector of [
      '.mirror-experience',
      '.mirror-card',
      '.mirror-story',
      '.mirror-deck',
      '.mirror-pair-note'
    ]) expect(styles).toContain(selector);
    expect(styles).toContain('@media(max-width:680px)');
    expect(styles).toContain('min-height:48px');
    expect(styles).toContain('scroll-snap-type:x mandatory');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
  });

  it('keeps relationship comparison permission-aware', () => {
    expect(script).toContain('When both people confirm their own card');
    expect(script).toContain('without choosing a villain or claiming hidden motives');
  });
});
