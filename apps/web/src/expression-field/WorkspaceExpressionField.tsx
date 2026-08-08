import { RelationalExpressionField } from './RelationalExpressionField';
import { SystemExpressionField } from './SystemExpressionField';
import type {
  ExpressionFieldConnection,
  ExpressionFieldContext,
  ExpressionFieldSubject
} from './expression-field-view-contract';

type WorkspaceExpressionFieldProps =
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
      onSelectionChange?: (id: string) => void;
    };

export function WorkspaceExpressionField(props: WorkspaceExpressionFieldProps) {
  if (props.mode === 'relationship') {
    return <RelationalExpressionField subjects={props.subjects} interaction={props.context} depth="workspace" className={props.className ?? ''} />;
  }
  return (
    <SystemExpressionField
      subjects={props.subjects}
      interaction={props.context}
      depth="workspace"
      className={props.className ?? ''}
      {...(props.activeConnection ? { activeConnection: props.activeConnection } : {})}
      {...(props.onSelectionChange ? { onSelectionChange: props.onSelectionChange } : {})}
    />
  );
}
