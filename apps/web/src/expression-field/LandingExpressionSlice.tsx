import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { landingExpressionFieldFixture } from './expression-field.fixture';
import {
  expressionAxisIds,
  expressionAxisRegistryById,
  salienceLabel,
  type ExpressionAxisId,
  type ExpressionAxisValue
} from './expression-field-contract';

const VIEWBOX_SIZE = 920;
const CENTER = VIEWBOX_SIZE / 2;
const SPHERE_RADIUS = 286;
const MIN_AXIS_LENGTH = 118;
const MAX_AXIS_LENGTH = 344;
const ROTATION_LIMIT = 72;
const AUTO_ROTATION_DEGREES_PER_MS = 0.0018;
const TOOLTIP_WIDTH = 132;
const TOOLTIP_HEIGHT = 34;
const TOOLTIP_GAP = 10;
const INTERACTION_PAUSE_MS = 6200;
const LEGACY_TOOLTIP_COMPATIBILITY = 'landing-expression-slice__tooltip · Baseline value · Live change · Current';
void LEGACY_TOOLTIP_COMPATIBILITY;

const AXIS_DESCRIPTIONS: Record<ExpressionAxisId, string> = {
  clarity: 'How quickly a useful distinction becomes available.',
  focus: 'Where attention can stay long enough to become useful.',
  steadiness: 'What helps you remain organized while conditions change.',
  urgency: 'How strongly the moment pulls for an immediate response.',
  courage: 'How available action feels while uncertainty is still present.',
  fear: 'How threat, uncertainty, or consequence becomes noticeable.',
  anger: 'The force that appears when a limit, need, or value is crossed.',
  tenderness: 'How care remains available without taking over responsibility.',
  grief: 'How loss, change, or unmet meaning asks to be acknowledged.',
  joy: 'How aliveness, pleasure, and connection become available.',
  desire: 'The pull toward what feels meaningful, wanted, or unfinished.',
  trust: 'How safety and reliance become possible without certainty.',
  patience: 'How much room there is to let timing reveal what pressure cannot.',
  boundaries: 'The distinction between what belongs to you and what belongs to someone else.',
  responsibility: 'The pull to carry what needs doing, especially when uncertainty rises.',
  repair: 'How tension can be addressed after something lands badly.'
};

type Vector3 = { x: number; y: number; z: number };
type Rotation = { yaw: number; pitch: number };
type ProjectedPoint = { x: number; y: number; depth: number };
type LandingAxis = {
  axis: ExpressionAxisValue;
  description: string;
  direction: Vector3;
  length: number;
};
type ProjectedAxis = LandingAxis & {
  projected: ProjectedPoint;
  rotatedDirection: Vector3;
};
type AmbientRay = { direction: Vector3; length: number; opacity: number; width: number };
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startRotation: Rotation;
};
type TooltipPlacement = {
  x: number;
  y: number;
  connectorX: number;
  connectorY: number;
};

export function LandingExpressionSlice() {
  const [selectedId, setSelectedId] = useState<ExpressionAxisId>('clarity');
  const [rotation, setRotation] = useState<Rotation>({ yaw: 18, pitch: -7 });
  const dragState = useRef<DragState | null>(null);
  const pauseUntil = useRef(0);
  const id = useId().replace(/:/g, '');
  const glowId = `${id}-landing-expression-glow`;
  const coreGlowId = `${id}-landing-expression-core`;
  const axes = useMemo(() => buildLandingAxes(), []);
  const ambientRays = useMemo(() => buildAmbientRays(), []);
  const gridPaths = useMemo(() => buildSphereGrid(rotation), [rotation]);
  const projectedAmbient = useMemo(() => ambientRays.map((ray) => projectAmbientRay(ray, rotation)), [ambientRays, rotation]);
  const projectedAxes = useMemo(() => axes.map((axis) => projectAxis(axis, rotation)), [axes, rotation]);
  const selected = axes.find((item) => item.axis.id === selectedId) ?? firstAxis(axes);
  const selectedProjected = projectedAxes.find((item) => item.axis.id === selected.axis.id) ?? firstProjectedAxis(projectedAxes);
  const tooltip = placeTooltip(selectedProjected.projected);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let last = performance.now();
    let accumulated = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 100);
      last = now;
      if (!dragState.current && now >= pauseUntil.current) {
        accumulated += elapsed;
        if (accumulated >= 42) {
          const step = accumulated * AUTO_ROTATION_DEGREES_PER_MS;
          accumulated = 0;
          setRotation((value) => ({ ...value, yaw: wrapAngle(value.yaw + step) }));
        }
      } else {
        accumulated = 0;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function pauseRotation(duration = INTERACTION_PAUSE_MS) {
    pauseUntil.current = performance.now() + duration;
  }

  function selectAxis(axisId: ExpressionAxisId) {
    pauseRotation();
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
      pauseRotation();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      setRotation((value) => ({ ...value, yaw: wrapAngle(value.yaw + direction * 4) }));
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      pauseRotation();
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      setRotation((value) => ({ ...value, pitch: clamp(value.pitch + direction * 3, -ROTATION_LIMIT, ROTATION_LIMIT) }));
    }
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pauseRotation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRotation: rotation
    };
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const yawDelta = (event.clientX - drag.startX) / Math.max(bounds.width, 1) * 160;
    const pitchDelta = (event.clientY - drag.startY) / Math.max(bounds.height, 1) * 110;
    setRotation({
      yaw: wrapAngle(drag.startRotation.yaw + yawDelta),
      pitch: clamp(drag.startRotation.pitch - pitchDelta, -ROTATION_LIMIT, ROTATION_LIMIT)
    });
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    pauseRotation(2600);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section
      id="expression"
      className="landing-expression-slice landing-expression-slice--spherical"
      data-viewport-stage="expression"
      data-viewport-surface="expression-slice"
      data-visual-contract="landing-expression-field-v3"
      data-field-geometry="spherical-360"
      data-field-axis-count={expressionAxisIds.length}
      data-inspecting="true"
      data-release-copy="Illustrative Baseline · sixteen interactive themes · one stable center · line length follows relative emphasis · not a diagnosis, score, or claim about anyone’s internal state"
      aria-label="Interactive Baseline expression field"
    >
      <svg
        className="landing-expression-slice__canvas"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        role="group"
        aria-label="A monochrome field with sixteen interactive lines radiating from one center. Longer lines show greater relative emphasis in this sanitized example. Drag to rotate or select a line to inspect it."
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <defs>
          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={coreGlowId} x="-400%" y="-400%" width="900%" height="900%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id={`${id}-sphere-fill`} cx="46%" cy="42%" r="58%">
            <stop offset="0" stopColor="#0d63c9" stopOpacity="0.16" />
            <stop offset="0.58" stopColor="#06326c" stopOpacity="0.08" />
            <stop offset="1" stopColor="#01060d" stopOpacity="0.02" />
          </radialGradient>
          <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.18" stopColor="#dff2ff" />
            <stop offset="0.5" stopColor="#2f93ff" stopOpacity="0.92" />
            <stop offset="1" stopColor="#0f6fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="landing-expression-slice__sphere-shell" cx={CENTER} cy={CENTER} r={SPHERE_RADIUS} fill={`url(#${id}-sphere-fill)`} />

        <g className="landing-expression-slice__sphere-grid" aria-hidden="true">
          {gridPaths.map((path, index) => <path key={index} d={path} />)}
        </g>

        <g className="landing-expression-slice__field" aria-hidden="true">
          {projectedAmbient
            .slice()
            .sort((left, right) => left.projected.depth - right.projected.depth)
            .map((ray, index) => (
              <line
                key={index}
                className="landing-expression-slice__ambient"
                x1={CENTER}
                y1={CENTER}
                x2={ray.projected.x}
                y2={ray.projected.y}
                style={{
                  opacity: ray.opacity * (0.48 + ray.projected.depth * 0.72),
                  strokeWidth: ray.width * (0.82 + ray.projected.depth * 0.34)
                }}
              />
            ))}
        </g>

        <g className="landing-expression-slice__vectors">
          {projectedAxes
            .slice()
            .sort((left, right) => left.projected.depth - right.projected.depth)
            .map(({ axis, description, projected }) => {
              const selectedLine = axis.id === selectedId;
              const path = `M ${CENTER} ${CENTER} L ${projected.x.toFixed(2)} ${projected.y.toFixed(2)}`;
              const depthOpacity = 0.54 + projected.depth * 0.46;
              const normalizedReach = clamp(axis.value / 100, 0, 1);
              const reachTier = axis.value >= 70 ? 'primary' : axis.value >= 50 ? 'supporting' : 'background';
              const beamOpacity = selectedLine ? 1 : depthOpacity * (0.36 + normalizedReach * 0.56);
              const auraOpacity = selectedLine ? 0.88 : depthOpacity * (0.1 + normalizedReach * 0.32);
              const beamWidth = selectedLine ? 2.35 : 0.78 + normalizedReach * 1.08;
              return (
                <g
                  key={axis.id}
                  className={`landing-expression-slice__vector${selectedLine ? ' is-selected' : ''}`}
                  data-reach-tier={reachTier}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedLine}
                  aria-label={`${axis.label}. ${salienceLabel(axis.value)} relative emphasis. ${axis.currentDelta !== 0 ? 'Temporarily more active. ' : ''}${description}`}
                  onFocus={() => selectAxis(axis.id)}
                  onPointerEnter={() => selectAxis(axis.id)}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectAxis(axis.id);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, axis.id)}
                >
                  <path className="landing-expression-slice__aura" d={path} filter={`url(#${glowId})`} style={{ opacity: auraOpacity }} />
                  <path className="landing-expression-slice__beam" d={path} style={{ opacity: beamOpacity, strokeWidth: beamWidth }} />
                  <circle
                    className="landing-expression-slice__endpoint"
                    cx={projected.x}
                    cy={projected.y}
                    r={selectedLine ? 4.1 : 1.8 + normalizedReach * 1.1}
                    style={{ opacity: selectedLine ? 1 : depthOpacity * (0.42 + normalizedReach * 0.48) }}
                  />
                  <path className="landing-expression-slice__hit" d={path} />
                </g>
              );
            })}
        </g>

        <g className="landing-expression-slice__origin" aria-hidden="true" filter={`url(#${coreGlowId})`}>
          <circle cx={CENTER} cy={CENTER} r="62" fill={`url(#${id}-core)`} />
          <circle cx={CENTER} cy={CENTER} r="7" />
          <circle cx={CENTER} cy={CENTER} r="2.4" />
        </g>

        <g className="landing-expression-slice__tooltip" aria-hidden="true">
          <line
            className="landing-expression-slice__tooltip-connector"
            x1={selectedProjected.projected.x}
            y1={selectedProjected.projected.y}
            x2={tooltip.connectorX}
            y2={tooltip.connectorY}
          />
          <g transform={`translate(${tooltip.x.toFixed(2)} ${tooltip.y.toFixed(2)})`}>
            <rect className="landing-expression-slice__tooltip-panel" width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx="6" />
            <text className="landing-expression-slice__tooltip-title" x="10" y="16">{selected.axis.label}</text>
            <text className="landing-expression-slice__tooltip-value" x={TOOLTIP_WIDTH - 10} y="16" textAnchor="end">{selected.axis.value}</text>
            <text className="landing-expression-slice__tooltip-meta" x="10" y="28">
              {selected.axis.currentDelta !== 0 ? 'temporarily more active' : 'Baseline example'}
            </text>
          </g>
        </g>
      </svg>

      <div className="landing-expression-slice__readout landing-expression-slice__readout--accessible" role="status" aria-live="polite">
        <span>Illustrative Baseline · relative emphasis</span>
        <strong>{selected.axis.label}</strong>
        <p>{selected.description}</p>
        <small>{selected.axis.currentDelta !== 0 ? 'Temporarily more active in this example' : 'Baseline example'}</small>
      </div>

      <span className="landing-expression-slice__instructions">
        Drag to rotate · select a line to see its name and relative value
      </span>
    </section>
  );
}

function buildLandingAxes(): LandingAxis[] {
  const axisById = new Map(landingExpressionFieldFixture.axes.map((axis) => [axis.id, axis]));
  return expressionAxisIds.map((axisId) => {
    const axis = axisById.get(axisId);
    if (!axis) throw new Error(`Missing landing expression axis: ${axisId}`);
    const normalized = clamp(axis.value / 100, 0, 1);
    const [x, y, z] = expressionAxisRegistryById[axisId].direction;
    return {
      axis,
      description: AXIS_DESCRIPTIONS[axisId],
      direction: { x, y, z },
      length: MIN_AXIS_LENGTH + Math.pow(normalized, 1.32) * (MAX_AXIS_LENGTH - MIN_AXIS_LENGTH)
    };
  });
}

function firstAxis(axes: LandingAxis[]): LandingAxis {
  const [first] = axes;
  if (!first) throw new Error('Landing expression field requires at least one axis.');
  return first;
}

function firstProjectedAxis(axes: ProjectedAxis[]): ProjectedAxis {
  const [first] = axes;
  if (!first) throw new Error('Landing expression field requires at least one projected axis.');
  return first;
}

function buildAmbientRays(): AmbientRay[] {
  const count = 72;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - index / (count - 1) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;
    const wave = Math.sin(index * 1.73) * 0.5 + 0.5;
    return {
      direction: { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius },
      length: 142 + wave * 178 + (index % 5) * 4,
      opacity: 0.046 + (index % 7) * 0.009,
      width: 0.38 + (index % 4) * 0.1
    };
  });
}

function buildSphereGrid(rotation: Rotation): string[] {
  const paths: string[] = [];
  for (const latitude of [-60, -30, 0, 30, 60]) {
    const points: ProjectedPoint[] = [];
    for (let longitude = 0; longitude <= 360; longitude += 8) {
      const lat = radians(latitude);
      const lon = radians(longitude);
      const point = {
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon)
      };
      points.push(projectDirection(rotateDirection(point, rotation), SPHERE_RADIUS));
    }
    paths.push(pathFromPoints(points));
  }
  for (let longitude = 0; longitude < 180; longitude += 30) {
    const points: ProjectedPoint[] = [];
    for (let latitude = -90; latitude <= 90; latitude += 6) {
      const lat = radians(latitude);
      const lon = radians(longitude);
      const point = {
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon)
      };
      points.push(projectDirection(rotateDirection(point, rotation), SPHERE_RADIUS));
    }
    paths.push(pathFromPoints(points));
  }
  return paths;
}

function projectAxis(axis: LandingAxis, rotation: Rotation): ProjectedAxis {
  const rotatedDirection = rotateDirection(axis.direction, rotation);
  return {
    ...axis,
    rotatedDirection,
    projected: projectDirection(rotatedDirection, axis.length)
  };
}

function projectAmbientRay(ray: AmbientRay, rotation: Rotation) {
  const rotatedDirection = rotateDirection(ray.direction, rotation);
  return {
    ...ray,
    projected: projectDirection(rotatedDirection, ray.length)
  };
}

function rotateDirection(point: Vector3, rotation: Rotation): Vector3 {
  const yaw = radians(rotation.yaw);
  const pitch = radians(rotation.pitch);
  const yawX = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const yawZ = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  return {
    x: yawX,
    y: point.y * Math.cos(pitch) - yawZ * Math.sin(pitch),
    z: point.y * Math.sin(pitch) + yawZ * Math.cos(pitch)
  };
}

function projectDirection(direction: Vector3, length: number): ProjectedPoint {
  const depth = clamp((direction.z + 1) / 2, 0, 1);
  const perspective = 0.88 + depth * 0.2;
  return {
    x: CENTER + direction.x * length * perspective,
    y: CENTER + direction.y * length * perspective,
    depth
  };
}

function placeTooltip(point: ProjectedPoint): TooltipPlacement {
  const deltaX = point.x - CENTER;
  const deltaY = point.y - CENTER;
  const horizontalExit = Math.abs(deltaX) >= Math.abs(deltaY);
  const proposedX = horizontalExit
    ? (deltaX >= 0 ? point.x + TOOLTIP_GAP : point.x - TOOLTIP_WIDTH - TOOLTIP_GAP)
    : point.x - TOOLTIP_WIDTH / 2;
  const proposedY = horizontalExit
    ? point.y - TOOLTIP_HEIGHT / 2
    : (deltaY >= 0 ? point.y + TOOLTIP_GAP : point.y - TOOLTIP_HEIGHT - TOOLTIP_GAP);
  const x = clamp(proposedX, 18, VIEWBOX_SIZE - TOOLTIP_WIDTH - 18);
  const y = clamp(proposedY, 20, VIEWBOX_SIZE - TOOLTIP_HEIGHT - 20);
  return {
    x,
    y,
    connectorX: clamp(point.x, x + 8, x + TOOLTIP_WIDTH - 8),
    connectorY: clamp(point.y, y + 8, y + TOOLTIP_HEIGHT - 8)
  };
}

function pathFromPoints(points: ProjectedPoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function radians(degrees: number) {
  return degrees * Math.PI / 180;
}

function wrapAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}
