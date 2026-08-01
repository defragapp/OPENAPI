import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildFieldRays, ContextInteractionField } from './ContextInteractionField';

const nodes = [
  { id: 'you', label: 'You', meta: 'Needs time', detail: 'Your permitted perspective remains distinct.', tone: 'cream' as const },
  { id: 'other', label: 'They', meta: 'Recognizes quickly', detail: 'Their private experience remains theirs to confirm.', tone: 'sage' as const }
];

describe('shared context interaction field', () => {
  it('builds deterministic line geometry without generated or scored values', () => {
    const first = buildFieldRays({ x: 250, y: 128 }, 1, 'relationship');
    const second = buildFieldRays({ x: 250, y: 128 }, 1, 'relationship');
    expect(first).toEqual(second);
    expect(first).toHaveLength(34);
    expect(first.every((ray) => ray.strength >= 0.22 && ray.strength <= 0.89)).toBe(true);
  });

  it('keeps both people and the interaction independently selectable', () => {
    const html = renderToStaticMarkup(
      <ContextInteractionField
        mode="relationship"
        nodes={nodes}
        centerLabel="What happens between you"
        centerMeta="Timing interaction"
        centerDetail="The interaction remains separate from either person’s identity."
      />
    );
    expect(html).toContain('You');
    expect(html).toContain('They');
    expect(html).toContain('What happens between you');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Distinct people · shared context');
    expect(html).not.toMatch(/score|compatibility|motive/i);
  });
});
