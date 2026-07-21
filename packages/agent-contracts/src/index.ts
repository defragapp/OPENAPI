export interface UnknownState {
  label: string;
  reason: string;
}

export interface BaselineDimension {
  name: string;
  tendency: string;
  underPressure?: string;
  supportiveMove?: string;
}

export interface BaselineSummaryOutput {
  summary: string;
  dimensions: BaselineDimension[];
  unknowns: UnknownState[];
  sourceRefs: string[];
}

export interface PairComparisonOutput {
  sharedStrengths: string[];
  frictionPoints: string[];
  translationNotes: string[];
  unknowns: UnknownState[];
}


export * from './model-config';
