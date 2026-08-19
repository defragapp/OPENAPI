import { useMemo, useState } from 'react';
import {
  SELF_EVIDENCE_GROUPS,
  SELF_PRODUCT_PROOF,
  SELF_REPRESENTATIVE_PROFILE
} from './landing-demo-fixtures';
import { ExpressionFieldRenderer } from './expression-field/ExpressionField';
import {
  expressionAxisRegistry,
  salienceLabel,
  type ExpressionAxisId,
  type ExpressionAxisValue
} from './expression-field/expression-field-contract';
import './landing-self-editorial-proof.css';

/*
 * Keep the public representative field aligned with the production Worker derivation.
 * The Worker remains authoritative. This map and salience formula intentionally mirror
 * apps/sovereign-worker/src/expression-field.ts for a sanitized Baseline-only fixture.
 */
const AXIS_FACET_MAP: Record<ExpressionAxisId, readonly string[]> = {
  clarity: ['decision_making', 'alignment_markers'],
  focus: ['learning', 'underused_capacity'],
  steadiness: ['core_orientation', 'response_change'],
  urgency: ['response_pressure', 'responsibility'],
  courage: ['leadership', 'gift_expression'],
  fear: ['shadow_expression', 'response_pressure'],
  anger: ['boundaries', 'conflict_repair'],
  tenderness: ['love_connection', 'gift_expression'],
  grief: ['love_connection', 'response_change'],
  joy: ['creativity_expression', 'gift_expression'],
  desire: ['identity_purpose', 'creativity_expression'],
  trust: ['love_connection', 'core_orientation'],
  patience: ['decision_making', 'response_change'],
  boundaries: ['boundaries'],
  responsibility: ['responsibility'],
  repair: ['conflict_repair']
};

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.max(minimum, Math.min(maximum, Math.round(value)))
);

function buildSelfExpressionAxes(): readonly ExpressionAxisValue[] {
  return expressionAxisRegistry.map((axis) => {
    const allowedFacetIds = AXIS_FACET_MAP[axis.id];
    const mappedFacets = SELF_REPRESENTATIVE_PROFILE.facets.filter((facet) => allowedFacetIds.includes(facet.id));
    const basisRefs = [...new Set(mappedFacets.flatMap((facet) => facet.basisRefs))];
    const supportWeight = mappedFacets.reduce((total, facet) => {
      if (facet.uncertainty === 'low') return total + 8;
      if (facet.uncertainty === 'medium') return total + 5;
      return total + 2;
    }, 0);
    const baselineValue = clamp(
      30 + Math.min(28, mappedFacets.length * 8) + Math.min(12, basisRefs.length * 3) + Math.min(8, supportWeight),
      28,
      76
    );
    const primary = mappedFacets[0];
    const practicalDistinction = primary?.alignmentMarkers[0];

    return {
      id: axis.id,
      label: axis.label,
      baselineValue,
      currentDelta: 0,
      value: baselineValue,
      state: 'unconfirmed',
      confidence: mappedFacets.length > 0 && basisRefs.length > 0 ? 'supported' : 'exploratory',
      facetIds: mappedFacets.map((facet) => facet.id),
      basisRefs,
      summary: primary?.description
        ?? `${axis.label} is one expression within this representative Baseline that Sovereign can help examine in ordinary language.`,
      ...(primary?.giftExpression ? { giftExpression: primary.giftExpression } : {}),
      ...(primary?.shadowExpression
        ? {
            shadowExpression: primary.shadowExpression,
            repressedExpression: `When held back, ${primary.shadowExpression.charAt(0).toLowerCase()}${primary.shadowExpression.slice(1)}`,
            overextendedExpression: `When overused, ${primary.shadowExpression.charAt(0).toLowerCase()}${primary.shadowExpression.slice(1)}`
          }
        : {}),
      ...(practicalDistinction ? { practicalDistinction } : {}),
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
            suspendWhenOffscreen={false}
            ariaLabel="Representative Self Expression Field. Sixteen lines begin at one stable center. Line length shows relative expression salience in this example, not a psychological score or diagnosis. Select a line to inspect it."
          />
        </div>
        <figcaption>
          <span>Expression Field · representative Baseline</span>
          <div className="landing-self-vector__readout">
            <small>Inspected axis</small>
            <strong id="landing-self-vector-title">{selectedAxis.label}</strong>
            <em>{salienceLabel(selectedAxis.value)} · relative salience</em>
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
