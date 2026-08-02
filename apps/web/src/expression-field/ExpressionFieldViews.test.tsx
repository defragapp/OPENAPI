import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { landingRelationshipExpressionFieldFixtures, landingSystemExpressionFieldFixtures } from './expression-field.fixture';
import { RelationalExpressionField } from './RelationalExpressionField';
import { SystemExpressionField } from './SystemExpressionField';

const relationshipSubjects = [
  { id: 'you', label: 'You', meta: 'Needs time', detail: 'Your permitted perspective remains distinct.', axes: landingRelationshipExpressionFieldFixtures.you.axes },
  { id: 'other', label: 'They', meta: 'Recognizes quickly', detail: 'Their private experience remains theirs to confirm.', axes: landingRelationshipExpressionFieldFixtures.maya.axes }
] as const;

describe('Expression Field context views', () => {
  it('uses two real Expression Field canvases without drawing a literal relationship line', () => {
    const html = renderToStaticMarkup(
      <RelationalExpressionField
        subjects={relationshipSubjects}
        interaction={{ label: 'Selected interaction', meta: 'Timing · Decision pace', detail: 'The fields orient without reducing either person to the cause.', selectedAxisId: 'clarity' }}
        depth="landing"
      />
    );
    expect(html.match(/<canvas/g)).toHaveLength(2);
    expect(html).toContain('data-expression-field-composition="relationship"');
    expect(html).toContain('Timing · Decision pace');
    expect(html).not.toMatch(/<line|compatibility|motive/i);
  });

  it('keeps every system participant as a distinct field and leaves the center empty', () => {
    const subjects = ['Parent A', 'Child A', 'Child B', 'Parent B'].map((label, index) => ({
      id: `person-${index}`,
      label,
      meta: 'Permitted role',
      detail: 'This person remains distinct.',
      axes: landingSystemExpressionFieldFixtures[index]!.axes
    }));
    const html = renderToStaticMarkup(
      <SystemExpressionField
        subjects={subjects}
        interaction={{ label: 'System interaction', meta: 'Responsibility', detail: 'The system is the interaction among the fields.', selectedAxisId: 'responsibility' }}
        depth="landing"
      />
    );
    expect(html.match(/<canvas/g)).toHaveLength(4);
    expect(html).toContain('data-expression-field-composition="system"');
    expect(html).toContain('the system is shown through how the fields orient');
    expect(html).not.toContain('Whole system');
    expect(html).not.toMatch(/<line|system-center/i);
  });
});
