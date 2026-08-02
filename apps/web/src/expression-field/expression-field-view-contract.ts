import type { ExpressionAxisId, ExpressionAxisValue } from './expression-field-contract';

export type ExpressionFieldSubject = {
  id: string;
  label: string;
  meta: string;
  detail: string;
  axes: readonly ExpressionAxisValue[];
  selectedAxisId?: ExpressionAxisId;
};

export type ExpressionFieldConnection = {
  from: string;
  to: string;
};

export type ExpressionFieldContext = {
  label: string;
  meta: string;
  detail: string;
  selectedAxisId: ExpressionAxisId;
};

export type ExpressionFieldDepth = 'landing' | 'thread' | 'workspace';
