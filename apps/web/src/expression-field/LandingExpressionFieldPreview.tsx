import { ExpressionFieldRenderer } from './ExpressionField';
import { RelationalExpressionField } from './RelationalExpressionField';
import { SystemExpressionField } from './SystemExpressionField';
import type {
  ExpressionFieldContext,
  ExpressionFieldSubject
} from './expression-field-view-contract';

type LandingExpressionFieldPreviewProps =
  | {
      mode: 'self';
      subject: ExpressionFieldSubject;
      context: ExpressionFieldContext;
      compact?: boolean;
      className?: string;
    }
  | {
      mode: 'relationship';
      subjects: readonly ExpressionFieldSubject[];
      context: ExpressionFieldContext;
      compact?: boolean;
      className?: string;
    }
  | {
      mode: 'system';
      subjects: readonly ExpressionFieldSubject[];
      context: ExpressionFieldContext;
      compact?: boolean;
      className?: string;
      onSelectionChange?: (id: string) => void;
    };

export function LandingExpressionFieldPreview(props: LandingExpressionFieldPreviewProps) {
  if (props.mode === 'relationship') {
    return (
      <RelationalExpressionField
        subjects={props.subjects}
        interaction={props.context}
        depth="landing"
        compact={props.compact ?? false}
        className={props.className ?? ''}
      />
    );
  }
  if (props.mode === 'system') {
    return (
      <SystemExpressionField
        subjects={props.subjects}
        interaction={props.context}
        depth="landing"
        compact={props.compact ?? false}
        className={props.className ?? ''}
        {...(props.onSelectionChange ? { onSelectionChange: props.onSelectionChange } : {})}
      />
    );
  }
  return (
    <figure className={`single-expression-field expression-field-depth-landing${props.compact ? ' is-compact' : ''}${props.className ? ` ${props.className}` : ''}`} data-expression-field-composition="self">
      <span className="expression-field-landing-kicker">This little light of mine · one center, many expressions</span>
      <div className="single-expression-stage">
        <ExpressionFieldRenderer
          axes={props.subject.axes}
          selectedAxisId={props.subject.selectedAxisId ?? props.context.selectedAxisId}
          draggable
          variant="preview"
          ariaLabel="A sanitized Baseline Expression Field with one stable center. Vector length shows relative salience in this example, not an emotional score or diagnosis."
        />
      </div>
      <figcaption>
        <strong>{props.context.label}</strong>
        <span>{props.context.meta}</span>
        <p>{props.context.detail}</p>
      </figcaption>
    </figure>
  );
}
