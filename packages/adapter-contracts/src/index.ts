export interface AdapterRequestContext {
  accountId: string;
  traceId: string;
  contractVersion: 1;
}

export interface BaselineSummaryRequest extends AdapterRequestContext {
  personId: string;
  focus?: string;
  includeFrameworkLabels: false;
}

export interface CurrentConditionsRequest extends AdapterRequestContext {
  personId: string;
  precision: 'reduced';
}
