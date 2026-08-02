import { useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { landingExpressionFieldFixture } from './expression-field.fixture';
import { salienceLabel, type ExpressionAxisId, type ExpressionAxisValue } from './expression-field-contract';

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 780;
const CENTER_X = 600;
const CENTER_Y = 680;
const ROTATION_LIMIT = 12;

const LANDING_AXIS_LAYOUT = [
  { id: 'clarity', angle: -166, description: 'How quickly a useful distinction becomes available.' },
  { id: 'focus', angle: -143, description: 'Where attention can stay long enough to become useful.' },
  { id: 'steadiness', angle: -120, description: 'What helps you remain organized while conditions change.' },
  { id: 'courage', angle: -97, description: 'The capacity to move while uncertainty is still present.' },
  { id: 'tenderness', angle: -74, description: 'How care remains available without taking over responsibility.' },
  { id: 'boundaries', angle: -51, description: 'The distinction between what belongs to you and what belongs to someone else.' },
  { id: 'responsibility', angle: -28, description: 'The pull to carry what needs doing, especially when uncertainty rises.' },
  { id: 'repair', angle: -8, description: 'How tension can be addressed after something lands badly.' }
] as const satisfies readonly { id: ExpressionAxisId; angle: number; description: string }[];

type LandingAxis = {
  axis: ExpressionAxisValue;
  description: string;
  angle: number;
  length: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startRotation: number;
};

export function LandingExpressionSlice() {
  const [selectedId, setSelectedId] = useState<ExpressionAxisId | null>(null);
  const [rotation, setRotation] = useState(0);
  const dragState = useRef<DragState | null>(null);
  const id = useId().replace(/:/g, '');
  const glowId = `${id}-landing-expression-glow`;
  const coreGlowId = `${id}-landing-expression-core`;
  const axes = useMemo(() => buildLandingAxes(), []);
  const ambientRays = useMemo(() => buildAmbientRays(), []);
  const selected = selectedId ? axes.find((item) => item.axis.id === selectedId) ?? null : null;
  const selectedGeometry = selected ? geometryFor(selected.angle + rotation, selected.length) : null;

  function selectAxis(axisId: ExpressionAxisId) {
    setSelectedId(axisId);
  }

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, axisId: ExpressionAxisId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectAxis(axisId);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      setRotation((value) => clamp(value + direction * 2.5, -ROTATION_LIMIT, ROTATION_LIMIT));
    }
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startRotation: rotation
    };
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const width = Math.max(event.currentTarget.getBoundingClientRect().width, 1);
    const delta = (event.clientX - drag.startX) / width * 38;
    setRotation(clamp(drag.startRotation + delta, -ROTATION_LIMIT, ROTATION_LIMIT));
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const tooltipStyle = selectedGeometry
    ? {
        '--landing-tooltip-x': `${clamp(selectedGeometry.tooltipX, 14, 86)}%`,
        '--landing-tooltip-y': `${clamp(selectedGeometry.tooltipY, 18, 73)}%`
      } as CSSProperties
    : undefined;

  return (
    <section
      id="expression"
      className="landing-expression-slice"
      data-viewport-stage="expression"
      data-viewport-surface="expression-slice"
      data-visual-contract="landing-expression-field-v4"
      data-release-copy="Illustrative Baseline · Eight interactive vectors · one stable point · relative expression in a sanitized example · not a diagnosis, score, or claim about anyone’s internal state"
      aria-label="Live Baseline expression field"
    >
      <svg
        className="landing-expression-slice__canvas"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="group"
        aria-label="Eight interactive Cloudflare-blue vectors radiating upward and outward from one stable point. Drag to rotate. Hover, focus, or tap a vector for its value."
        preserveAspectRatio="xMidYMid slice"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <defs>
          <filter id={glowId} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="3.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={coreGlowId} x="-350%" y="-350%" width="800%" height="800%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.2" stopColor="#dff2ff" />
            <stop offset="0.54" stopColor="#2f93ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0f6fff" stopOpacity="0" />
          </radialGradient>
          {axes.map(({ axis, angle, length }) => {
            const end = pointFor(angle + rotation, length);
            return (
              <linearGradient
                key={axis.id}
                id={`${id}-${axis.id}`}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={end.x}
                y2={end.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.08" stopColor="#dff2ff" />
                <stop offset="0.4" stopColor="#78c7ff" />
                <stop offset="0.76" stopColor="#2f93ff" stopOpacity="0.7" />
                <stop offset="1" stopColor="#2f93ff" stopOpacity="0.04" />
              </linearGradient>
            );
          })}
        </defs>

        <g
          className="landing-expression-slice__field"
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
          aria-hidden="true"
        >
          {ambientRays.map((ray, index) => {
            const end = pointFor(ray.angle, ray.length);
            return (
              <line
                key={index}
                className="landing-expression-slice__ambient"
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={end.x}
                y2={end.y}
                style={{ opacity: ray.opacity, strokeWidth: ray.width }}
              />
            );
          })}
        </g>

        <g className="landing-expression-slice__vectors">
          {axes.map(({ axis, angle, length }) => {
            const selectedLine = axis.id === selectedId;
            const end = pointFor(angle + rotation, length);
            const path = `M ${CENTER_X} ${CENTER_Y} L ${end.x} ${end.y}`;
            return (
              <g
                key={axis.id}
                className={`landing-expression-slice__vector${selectedLine ? ' is-selected' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={selectedLine}
                aria-label={`${axis.label}. ${salienceLabel(axis.value)}. Baseline value ${axis.baselineValue}. Live change ${formatDelta(axis.currentDelta)}. Current ${axis.value}.`}
                onPointerEnter={() => selectAxis(axis.id)}
                onFocus={() => selectAxis(axis.id)}
                onClick={(event) => {
                  event.stopPropagation();
                  selectAxis(axis.id);
                }}
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
          <circle cx={CENTER_X} cy={CENTER_Y} r="54" fill={`url(#${id}-core)`} />
          <circle cx={CENTER_X} cy={CENTER_Y} r="7" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="2.3" />
        </g>
      </svg>

      {selected && tooltipStyle ? (
        <div className="landing-expression-slice__tooltip" style={tooltipStyle} role="status" aria-live="polite">
          <span>{salienceLabel(selected.axis.value)}</span>
          <strong>{selected.axis.label}</strong>
          <dl>
            <div><dt>Baseline</dt><dd>{selected.axis.baselineValue}</dd></div>
            <div><dt>Live</dt><dd>{formatDelta(selected.axis.currentDelta)}</dd></div>
            <div><dt>Now</dt><dd>{selected.axis.value}</dd></div>
          </dl>
          <p>{selected.description}</p>
        </div>
      ) : null}

      <span className="landing-expression-slice__instructions">
        Drag to rotate. Hover, focus, or tap a vector to inspect its value.
      </span>
    </section>
  );
}

function buildLandingAxes(): LandingAxis[] {
  const axisById = new Map(landingExpressionFieldFixture.axes.map((axis) => [axis.id, axis]));
  return LANDING_AXIS_LAYOUT.map((definition) => {
    const axis = axisById.get(definition.id);
    if (!axis) throw new Error(`Missing landing expression axis: ${definition.id}`);
    return {
      axis,
      description: definition.description,
      angle: definition.angle,
      length: 390 + axis.value * 3.25
    };
  });
}

function buildAmbientRays() {
  return Array.from({ length: 36 }, (_, index) => {
    const angle = -176 + index * (170 / 35);
    const wave = Math.sin(index * 1.71) * 0.5 + 0.5;
    return {
      angle,
      length: 400 + wave * 360 + (index % 4) * 15,
      opacity: 0.045 + (index % 6) * 0.012,
      width: 0.42 + (index % 3) * 0.14
    };
  });
}

function pointFor(angle: number, length: number) {
  const radians = angle * Math.PI / 180;
  return {
    x: CENTER_X + Math.cos(radians) * length,
    y: CENTER_Y + Math.sin(radians) * length
  };
}

function geometryFor(angle: number, length: number) {
  const point = pointFor(angle, length * 0.66);
  return {
    tooltipX: point.x / VIEWBOX_WIDTH * 100,
    tooltipY: point.y / VIEWBOX_HEIGHT * 100
  };
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}
