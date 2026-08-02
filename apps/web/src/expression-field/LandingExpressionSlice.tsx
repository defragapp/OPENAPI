import { useId, useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { landingExpressionFieldFixture } from './expression-field.fixture';
import { salienceLabel, type ExpressionAxisId, type ExpressionAxisValue } from './expression-field-contract';

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 460;
const CENTER_X = 600;
const CENTER_Y = 238;

const LANDING_AXIS_LAYOUT = [
  { id: 'clarity', angle: -170, description: 'How quickly a useful distinction becomes available.' },
  { id: 'focus', angle: -143, description: 'Where attention can stay long enough to become useful.' },
  { id: 'steadiness', angle: -111, description: 'What helps you remain organized while conditions change.' },
  { id: 'courage', angle: -73, description: 'The capacity to move while uncertainty is still present.' },
  { id: 'tenderness', angle: -38, description: 'How care remains available without taking over responsibility.' },
  { id: 'boundaries', angle: -7, description: 'The distinction between what belongs to you and what belongs to someone else.' },
  { id: 'responsibility', angle: 36, description: 'The pull to carry what needs doing, especially when uncertainty rises.' },
  { id: 'repair', angle: 148, description: 'How tension can be addressed after something lands badly.' }
] as const satisfies readonly { id: ExpressionAxisId; angle: number; description: string }[];

type LandingAxis = {
  axis: ExpressionAxisValue;
  description: string;
  endX: number;
  endY: number;
  tooltipX: number;
  tooltipY: number;
};

export function LandingExpressionSlice() {
  const [selectedId, setSelectedId] = useState<ExpressionAxisId>('responsibility');
  const id = useId().replace(/:/g, '');
  const glowId = `${id}-landing-expression-glow`;
  const coreGlowId = `${id}-landing-expression-core`;
  const axes = useMemo(() => buildLandingAxes(), []);
  const selected = axes.find((item) => item.axis.id === selectedId) ?? axes[0]!;

  function selectAxis(axisId: ExpressionAxisId) {
    setSelectedId(axisId);
  }

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, axisId: ExpressionAxisId) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectAxis(axisId);
  }

  const tooltipStyle = {
    '--landing-tooltip-x': `${selected.tooltipX}%`,
    '--landing-tooltip-y': `${selected.tooltipY}%`
  } as CSSProperties;

  return (
    <section
      id="expression"
      className="landing-expression-slice"
      data-viewport-stage="expression"
      data-viewport-surface="expression-slice"
      aria-labelledby="landing-expression-title"
    >
      <div className="landing-expression-slice__inner">
        <header className="landing-expression-slice__header">
          <div>
            <span>Illustrative Baseline</span>
            <h2 id="landing-expression-title">See what is active before it repeats.</h2>
          </div>
          <p>Hover, focus, or tap a line.</p>
        </header>

        <svg
          className="landing-expression-slice__canvas"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role="group"
          aria-label="An interactive field of eight Cloudflare-blue lines radiating from one stable point. Each line represents a relative expression in a sanitized example."
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={coreGlowId} x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {axes.map(({ axis, endX, endY }) => (
              <linearGradient
                key={axis.id}
                id={`${id}-${axis.id}`}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={endX}
                y2={endY}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.12" stopColor="#d8efff" />
                <stop offset="0.48" stopColor="#3b91ff" />
                <stop offset="1" stopColor="#0f6fff" stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>

          <g className="landing-expression-slice__lines">
            {axes.map(({ axis, endX, endY }) => {
              const selectedLine = axis.id === selectedId;
              const path = `M ${CENTER_X} ${CENTER_Y} L ${endX} ${endY}`;
              return (
                <g
                  key={axis.id}
                  className={`landing-expression-slice__vector${selectedLine ? ' is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedLine}
                  aria-label={`${axis.label}. ${salienceLabel(axis.value)}. Select to read the explanation.`}
                  onPointerEnter={() => selectAxis(axis.id)}
                  onFocus={() => selectAxis(axis.id)}
                  onClick={() => selectAxis(axis.id)}
                  onKeyDown={(event) => handleKeyDown(event, axis.id)}
                >
                  <path className="landing-expression-slice__aura" d={path} filter={`url(#${glowId})`} />
                  <path className="landing-expression-slice__beam" d={path} stroke={`url(#${id}-${axis.id})`} />
                  <path className="landing-expression-slice__hit" d={path} />
                </g>
              );
            })}
          </g>

          <g className="landing-expression-slice__origin" aria-hidden="true" filter={`url(#${coreGlowId})`}>
            <circle cx={CENTER_X} cy={CENTER_Y} r="42" />
            <circle cx={CENTER_X} cy={CENTER_Y} r="12" />
            <circle cx={CENTER_X} cy={CENTER_Y} r="3.8" />
          </g>
        </svg>

        <div className="landing-expression-slice__tooltip" style={tooltipStyle} role="status" aria-live="polite">
          <span>{salienceLabel(selected.axis.value)}</span>
          <strong>{selected.axis.label}</strong>
          <p>{selected.description}</p>
        </div>

        <div className="landing-expression-slice__question">
          <span>The question</span>
          <p>“Why do I keep taking responsibility for everyone around me?”</p>
        </div>

        <p className="landing-expression-slice__note">
          Relative expression inside one sanitized example—not a diagnosis, score, or claim about anyone’s internal state.
        </p>
      </div>
    </section>
  );
}

function buildLandingAxes(): LandingAxis[] {
  const axisById = new Map(landingExpressionFieldFixture.axes.map((axis) => [axis.id, axis]));
  return LANDING_AXIS_LAYOUT.map((definition) => {
    const axis = axisById.get(definition.id);
    if (!axis) throw new Error(`Missing landing expression axis: ${definition.id}`);
    const radians = definition.angle * Math.PI / 180;
    const length = 148 + axis.value * 2.35;
    const endX = CENTER_X + Math.cos(radians) * length * 1.32;
    const endY = CENTER_Y + Math.sin(radians) * length * 0.72;
    return {
      axis,
      description: definition.description,
      endX,
      endY,
      tooltipX: clamp(endX / VIEWBOX_WIDTH * 100, 18, 82),
      tooltipY: clamp(endY / VIEWBOX_HEIGHT * 100, 23, 72)
    };
  });
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}
