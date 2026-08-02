import { useEffect, useMemo, useState } from 'react';
import { ExpressionFieldRenderer } from './ExpressionField';
import type {
  ExpressionFieldContext,
  ExpressionFieldDepth,
  ExpressionFieldSubject
} from './expression-field-view-contract';

export function RelationalExpressionField({
  subjects,
  interaction,
  depth,
  compact = false,
  className = '',
  onSelectionChange
}: {
  subjects: readonly ExpressionFieldSubject[];
  interaction: ExpressionFieldContext;
  depth: ExpressionFieldDepth;
  compact?: boolean;
  className?: string;
  onSelectionChange?: (id: string) => void;
}) {
  const fieldSubjects = useMemo(() => subjects.filter((subject) => subject.axes.length > 0).slice(0, 2), [subjects]);
  const subjectKey = fieldSubjects.map((subject) => subject.id).join('|');
  const [selectedId, setSelectedId] = useState('interaction');

  useEffect(() => setSelectedId('interaction'), [subjectKey]);

  if (fieldSubjects.length !== 2) return null;
  const selectedSubject = fieldSubjects.find((subject) => subject.id === selectedId);
  const selectedLabel = selectedSubject?.label ?? interaction.label;
  const selectedMeta = selectedSubject?.meta ?? interaction.meta;
  const selectedDetail = selectedSubject?.detail ?? interaction.detail;

  function select(id: string) {
    setSelectedId(id);
    onSelectionChange?.(id);
  }

  return (
    <figure
      className={`relational-expression-field expression-field-depth-${depth}${compact ? ' is-compact' : ''}${className ? ` ${className}` : ''}`}
      data-expression-field-composition="relationship"
      data-expression-field-selection={selectedId}
    >
      <div className="relational-expression-stage" aria-label="Two distinct Baseline Expression Fields">
        {fieldSubjects.map((subject, index) => {
          const selected = selectedId === 'interaction' || selectedId === subject.id;
          return (
            <div key={subject.id} className={`expression-field-subject${selected ? ' is-selected' : ''}`}>
              <ExpressionFieldRenderer
                axes={subject.axes}
                selectedAxisId={subject.selectedAxisId ?? interaction.selectedAxisId}
                {...(selectedId === 'interaction' ? { engagementDirection: index === 0 ? 'right' as const : 'left' as const } : {})}
                engagementPhase={0}
                ariaLabel={`${subject.label} Baseline Expression Field. Every line begins at that person’s own center; length represents relative salience from permitted information.`}
              />
              <button type="button" aria-pressed={selectedId === subject.id} onClick={() => select(subject.id)}>
                <strong>{subject.label}</strong>
                <span>{subject.meta}</span>
              </button>
            </div>
          );
        })}
        <div className="relational-expression-center" aria-hidden="true">
          <span>Between you</span>
          <strong>{interaction.meta}</strong>
        </div>
      </div>
      <p className="expression-field-gear-note"><strong>How the gears meet.</strong> Each person stays distinct. Sovereign shows where timing and expression catch, support, or strain without turning either person into the cause.</p>
      <figcaption>
        <button className="expression-field-interaction" type="button" aria-pressed={selectedId === 'interaction'} onClick={() => select('interaction')}>
          <span>{interaction.label}</span>
          <strong>{interaction.meta}</strong>
        </button>
        <p className="expression-field-context-detail" aria-live="polite">
          <span>{selectedLabel} · {selectedMeta}</span>
          {selectedDetail}
        </p>
      </figcaption>
    </figure>
  );
}
