import { RelationalExpressionField } from './RelationalExpressionField';
import { SystemExpressionField } from './SystemExpressionField';
import type {
  ExpressionFieldConnection,
  ExpressionFieldContext,
  ExpressionFieldSubject
} from './expression-field-view-contract';

type ThreadExpressionFieldProps =
  | {
      mode: 'relationship';
      subjects: readonly ExpressionFieldSubject[];
      context: ExpressionFieldContext;
      className?: string;
    }
  | {
      mode: 'system';
      subjects: readonly ExpressionFieldSubject[];
      context: ExpressionFieldContext;
      className?: string;
      activeConnection?: ExpressionFieldConnection;
    };

export function ThreadExpressionField(props: ThreadExpressionFieldProps) {
  if (props.mode === 'system') {
    return (
      <SystemExpressionField
        subjects={props.subjects}
        interaction={props.context}
        depth="thread"
        compact
        className={props.className ?? ''}
        {...(props.activeConnection ? { activeConnection: props.activeConnection } : {})}
      />
    );
  }
  return (
    <RelationalExpressionField
      subjects={props.subjects}
      interaction={props.context}
      depth="thread"
      compact
      className={props.className ?? ''}
    />
  );
}
