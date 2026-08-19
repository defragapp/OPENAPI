import { useMemo, useState } from 'react';
import {
  SELF_EVIDENCE_GROUPS,
  SELF_PRODUCT_PROOF,
  SELF_REPRESENTATIVE_PROFILE,
  SELF_REPRESENTATIVE_SOURCES
} from './landing-demo-fixtures';
import { ExpressionFieldRenderer } from './expression-field/ExpressionField';
import {
  expressionAxisRegistry,
  salienceLabel,
  type ExpressionAxisId,
  type ExpressionAxisValue
} from './expression-field/expression-field-contract';
import './landing-self-editorial-proof.css';

type AxisConfig = {
  value: number;
  state: ExpressionAxisValue['state'];
  facets: readonly string[];
  summary: string;
  practicalDistinction?: string;
};

const AXIS_CONFIG: Record<ExpressionAxisId, AxisConfig> = {
  clarity: {
    value: 54,
    state: 'mixed',
    facets: ['decision_making', 'alignment_markers'],
    summary: 'Clarity improves after the representative person separates a first preference from the needs they can already see around them.'
  },
  focus: {
    value: 49,
    state: 'gift',
    facets: ['learning', 'creativity_expression'],
    summary: 'Focus is available, but can shift quickly toward whichever person or situation appears to need attention first.'
  },
  steadiness: {
    value: 52,
    state: 'gift',
    facets: ['core_orientation', 'response_change'],
    summary: 'The representative pattern can stay adaptable without losing continuity when an internal position has been named first.'
  },
  urgency: {
    value: 67,
    state: 'under_pressure',
    facets: ['response_pressure', 'decision_making'],
    summary: 'Pressure can accelerate attention toward external signals before slower internal preferences have equal time to form.'
  },
  courage: {
    value: 46,
    state: 'gift',
    facets: ['identity_purpose', 'boundaries'],
    summary: 'Courage here is less about confrontation and more about allowing an unoptimized first position to exist long enough to be heard.'
  },
  fear: {
    value: 39,
    state: 'protective',
    facets: ['response_pressure', 'shadow_expression'],
    summary: 'Protective attention can increase when belonging, usefulness, or another person’s reaction feels consequential.'
  },
  anger: {
    value: 24,
    state: 'unconfirmed',
    facets: ['conflict_repair'],
    summary: 'Anger is not assumed by the representative fixture; actual expression remains the person’s to confirm.'
  },
  tenderness: {
    value: 74,
    state: 'gift',
    facets: ['love_connection', 'gift_expression'],
    summary: 'Relational attunement is a strong resource: the person can notice what another person or relationship needs with unusual speed.'
  },
  grief: {
    value: 31,
    state: 'unconfirmed',
    facets: ['love_connection'],
    summary: 'Grief is not inferred from the Baseline fixture and remains contextual rather than treated as a stable trait.'
  },
  joy: {
    value: 47,
    state: 'gift',
    facets: ['creativity_expression'],
    summary: 'Joy can become easier to recognize when expression is not being edited for reception before it has taken shape.'
  },
  desire: {
    value: 34,
    state: 'repressed',
    facets: ['decision_making', 'underused_capacity', 'alignment_markers'],
    summary: 'A personal preference may be quieter not because it is absent, but because comparison, accommodation, and optimization begin before it gets first access to the question.',
    practicalDistinction: 'Notice the room. Do not let noticing the room answer the question before you do.'
  },
  trust: {
    value: 58,
    state: 'gift',
    facets: ['love_connection', 'gift_expression'],
    summary: 'Trust grows when responsiveness remains chosen rather than becoming an automatic obligation to stabilize everyone else.'
  },
  patience: {
    value: 43,
    state: 'mixed',
    facets: ['response_pressure', 'underused_capacity'],
    summary: 'The underused move is often a brief pause long enough for the first internal preference to become available.'
  },
  boundaries: {
    value: 63,
    state: 'protective',
    facets: ['boundaries', 'shadow_expression'],
    summary: 'The key boundary is sequential: noticing another person’s need does not have to become an immediate decision to meet it.'
  },
  responsibility: {
    value: 83,
    state: 'overextended',
    facets: ['responsibility', 'leadership'],
    summary: 'Reliability and situational awareness can make the person the fastest route to completion, which can quietly turn competence into excess ownership.'
  },
  repair: {
    value: 77,
    state: 'overextended',
    facets: ['conflict_repair', 'love_connection'],
    summary: 'Repair skill is strong, but can become premature accommodation when reducing tension outruns an honest personal position.'
  }
};

const SOURCE_IDS = SELF_REPRESENTATIVE_SOURCES.map((source) => source.id);
const FACET_IDS = new Set<string>(SELF_REPRESENTATIVE_PROFILE.facets.map((facet) => facet.id));

function buildSelfExpressionAxes(): readonly ExpressionAxisValue[] {
  return expressionAxisRegistry.map((axis) => {
    const config = AXIS_CONFIG[axis.id];
    const facetIds = config.facets.filter((id) => FACET_IDS.has(id));
    return {
      id: axis.id,
      label: axis.label,
      baselineValue: config.value,
      currentDelta: 0,
      value: config.value,
      state: config.state,
      confidence: 'supported',
      facetIds,
      basisRefs: [...SOURCE_IDS],
      summary: config.summary,
      ...(config.practicalDistinction ? { practicalDistinction: config.practicalDistinction } : {}),
      contextDomain: axis.domain
    } satisfies ExpressionAxisValue;
  });
}

const SELF_EXPRESSION_AXES = buildSelfExpressionAxes();

export function LandingSelfEditorialProof() {
  const [selectedAxisId, setSelectedAxisId] = useState<ExpressionAxisId>('desire');
  const selectedAxis = useMemo(
    () => SELF_EXPRESSION_AXES.find((axis) => axis.id === selectedAxisId) ?? SELF_EXPRESSION_AXES[0]!,
    [selectedAxisId]
  );

  return (
    <article
      className="landing-self-editorial"
      data-product-proof="self-editorial-v1"
      data-viewport-surface="personal-proof"
      aria-label="Representative Sovereign self intelligence example"
    >
      <div className="landing-self-editorial__question" aria-label="Example user question">
        <small>You asked</small>
        <p>{SELF_PRODUCT_PROOF.question}</p>
      </div>

      <div className="landing-self-editorial__answer">
        <small>Direct answer</small>
        <h3>{SELF_PRODUCT_PROOF.directAnswer}</h3>
      </div>

      <div className="landing-self-editorial__mechanism">
        {SELF_PRODUCT_PROOF.mechanism.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <figure className="landing-self-vector" aria-labelledby="landing-self-vector-title">
        <div className="landing-self-vector__canvas">
          <ExpressionFieldRenderer
            axes={SELF_EXPRESSION_AXES}
            selectedAxisId={selectedAxisId}
            onSelectAxis={setSelectedAxisId}
            draggable
            variant="preview"
            ariaLabel="Representative Self Expression Field. Sixteen lines begin at one stable center. Line length shows relative expression emphasis in this example, not a diagnosis or score. Select a line to inspect it."
          />
        </div>
        <figcaption>
          <span>Expression Field · representative Baseline</span>
          <div className="landing-self-vector__readout">
            <small>Inspected axis</small>
            <strong id="landing-self-vector-title">{selectedAxis.label}</strong>
            <em>{salienceLabel(selectedAxis.value)} · relative emphasis</em>
            <p>{selectedAxis.summary}</p>
          </div>
        </figcaption>
      </figure>

      <blockquote className="landing-self-editorial__distinction">
        <small>The distinction</small>
        <p>{SELF_PRODUCT_PROOF.insight}</p>
      </blockquote>

      <p className="landing-self-editorial__closing">{SELF_PRODUCT_PROOF.closing}</p>

      <footer className="landing-self-editorial__evidence">
        <span>{SELF_PRODUCT_PROOF.contextLine}</span>
        <details>
          <summary>See source details</summary>
          <p>Representative source values used in this demonstration. These are not visitor data.</p>
          <div>
            {SELF_EVIDENCE_GROUPS.flatMap((group) => group.points).map((point) => (
              <code key={point.code} title={point.label}>{point.code}</code>
            ))}
          </div>
        </details>
      </footer>
    </article>
  );
}
