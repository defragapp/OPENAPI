import { useEffect, useMemo, useState } from 'react';
import { ExpressionFieldRenderer } from './ExpressionField';
import type { ExpressionFieldEngagementDirection } from './ExpressionField';
import type {
  ExpressionFieldConnection,
  ExpressionFieldContext,
  ExpressionFieldDepth,
  ExpressionFieldSubject
} from './expression-field-view-contract';

type FieldPosition = { name: string; x: number; y: number };

export function SystemExpressionField({
  subjects,
  interaction,
  depth,
  compact = false,
  className = '',
  activeConnection,
  onSelectionChange
}: {
  subjects: readonly ExpressionFieldSubject[];
  interaction: ExpressionFieldContext;
  depth: ExpressionFieldDepth;
  compact?: boolean;
  className?: string;
  activeConnection?: ExpressionFieldConnection;
  onSelectionChange?: (id: string) => void;
}) {
  const fieldSubjects = useMemo(() => subjects.filter((subject) => subject.axes.length > 0).slice(0, 6), [subjects]);
  const positions = useMemo(() => positionsForCount(fieldSubjects.length), [fieldSubjects.length]);
  const subjectKey = fieldSubjects.map((subject) => subject.id).join('|');
  const connectionKey = activeConnection ? `${activeConnection.from}|${activeConnection.to}` : '';
  const [selectedId, setSelectedId] = useState('interaction');

  useEffect(() => setSelectedId('interaction'), [subjectKey, connectionKey]);

  if (fieldSubjects.length < 2) return null;
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
      className={`system-expression-field expression-field-depth-${depth}${compact ? ' is-compact' : ''}${className ? ` ${className}` : ''}`}
      data-expression-field-composition="system"
      data-expression-field-selection={selectedId}
    >
      <div className="system-expression-stage" aria-label={`${fieldSubjects.length} distinct Baseline Expression Fields. The open center represents no person; the system is shown through how the fields orient in relation to one another.`}>
        <div className="system-expression-center" aria-hidden="true">
          <span>{interaction.label}</span>
          <strong>{interaction.meta}</strong>
        </div>
        {fieldSubjects.map((subject, index) => {
          const position = positions[index]!;
          const peerIndex = activeConnection
            ? activeConnection.from === subject.id
              ? fieldSubjects.findIndex((candidate) => candidate.id === activeConnection.to)
              : activeConnection.to === subject.id
                ? fieldSubjects.findIndex((candidate) => candidate.id === activeConnection.from)
                : -1
            : -1;
          const participatesInConnection = peerIndex >= 0;
          const nextPosition = positions[(index + 1) % positions.length]!;
          const selected = selectedId === 'interaction'
            ? activeConnection ? participatesInConnection : true
            : selectedId === subject.id;
          const target = selectedId === 'interaction'
            ? peerIndex >= 0
              ? directionForScreenDelta(positions[peerIndex]!.x - position.x, positions[peerIndex]!.y - position.y)
              : activeConnection
                ? undefined
                : directionForScreenDelta(nextPosition.x - position.x, nextPosition.y - position.y)
            : undefined;
          return (
            <div key={subject.id} className={`expression-field-subject${selected ? ' is-selected' : ''}`} data-field-position={position.name}>
              <ExpressionFieldRenderer
                axes={subject.axes}
                selectedAxisId={subject.selectedAxisId ?? interaction.selectedAxisId}
                {...(target ? { engagementDirection: target } : {})}
                engagementPhase={index * 0.08}
                ariaLabel={`${subject.label} Baseline Expression Field. Every line begins at that person’s own center; length represents relative salience from permitted information.`}
              />
              <button type="button" aria-pressed={selectedId === subject.id} onClick={() => select(subject.id)}>
                <strong>{subject.label}</strong>
                <span>{subject.meta}</span>
              </button>
            </div>
          );
        })}
      </div>
      <p className="expression-field-gear-note"><strong>The whole mechanism.</strong> Like gears in one machine, each person keeps their own center while roles, pressure, responsibility, and timing shape what the system does together.</p>
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

function positionsForCount(count: number): readonly FieldPosition[] {
  if (count === 2) return [
    { name: 'left', x: -1, y: 0 },
    { name: 'right', x: 1, y: 0 }
  ];
  if (count === 3) return [
    { name: 'top', x: 0, y: -1 },
    { name: 'bottom-right', x: 0.78, y: 0.72 },
    { name: 'bottom-left', x: -0.78, y: 0.72 }
  ];
  if (count === 4) return [
    { name: 'top', x: 0, y: -1 },
    { name: 'right', x: 1, y: 0 },
    { name: 'bottom', x: 0, y: 1 },
    { name: 'left', x: -1, y: 0 }
  ];
  if (count === 5) return [
    { name: 'top', x: 0, y: -1 },
    { name: 'upper-right', x: 0.95, y: -0.2 },
    { name: 'bottom-right', x: 0.62, y: 0.82 },
    { name: 'bottom-left', x: -0.62, y: 0.82 },
    { name: 'upper-left', x: -0.95, y: -0.2 }
  ];
  return [
    { name: 'top', x: 0, y: -1 },
    { name: 'upper-right', x: 0.9, y: -0.42 },
    { name: 'bottom-right', x: 0.78, y: 0.72 },
    { name: 'bottom', x: 0, y: 1 },
    { name: 'bottom-left', x: -0.78, y: 0.72 },
    { name: 'upper-left', x: -0.9, y: -0.42 }
  ];
}

function directionForScreenDelta(x: number, y: number): ExpressionFieldEngagementDirection {
  const horizontal = Math.abs(x) > 0.28;
  const vertical = Math.abs(y) > 0.28;
  if (horizontal && vertical) return `${y < 0 ? 'up' : 'down'}-${x < 0 ? 'left' : 'right'}`;
  if (horizontal) return x < 0 ? 'left' : 'right';
  return y < 0 ? 'up' : 'down';
}
