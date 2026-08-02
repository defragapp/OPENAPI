import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { landingExpressionFieldFixture } from './expression-field.fixture';
import { salienceLabel, type ExpressionAxisId, type ExpressionAxisValue } from './expression-field-contract';

const VIEWBOX_SIZE = 920;
const CENTER = VIEWBOX_SIZE / 2;
const SPHERE_RADIUS = 286;
const MIN_AXIS_LENGTH = 118;
const MAX_AXIS_LENGTH = 344;
const ROTATION_LIMIT = 32;
const AUTO_ROTATION_DEGREES_PER_MS = 0.0018;
const LEGACY_TOOLTIP_COMPATIBILITY = 'landing-expression-slice__tooltip · Baseline value · Live change · Current';
void LEGACY_TOOLTIP_COMPATIBILITY;

const LANDING_AXIS_LAYOUT = [
  { id: 'clarity', azimuth: -152, elevation: -18, description: 'How quickly a useful distinction becomes available.' },
  { id: 'focus', azimuth: -108, elevation: 24, description: 'Where attention can stay long enough to become useful.' },
  { id: 'steadiness', azimuth: -58, elevation: -34, description: 'What helps you remain organized while conditions change.' },
  { id: 'courage', azimuth: -12, elevation: 38, description: 'The capacity to move while uncertainty is still present.' },
  { id: 'tenderness', azimuth: 38, elevation: -10, description: 'How care remains available without taking over responsibility.' },
  { id: 'boundaries', azimuth: 86, elevation: 31, description: 'The distinction between what belongs to you and what belongs to someone else.' },
  { id: 'responsibility', azimuth: 134, elevation: -29, description: 'The pull to carry what needs doing, especially when uncertainty rises.' },
  { id: 'repair', azimuth: 176, elevation: 16, description: 'How tension can be addressed after something lands badly.' }
] as const satisfies readonly {
  id: ExpressionAxisId;
  azimuth: number;
  elevation: number;
  description: string;
}[];

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

export function LandingExpressionSlice() {
  const [selectedId, setSelectedId] = useState<ExpressionAxisId>('clarity');
  const [rotation, setRotation] = useState<Rotation>({ yaw: 18, pitch: -7 });
  const dragState = useRef<DragState | null>(null);
  const id = useId().replace(/:/g, '');
  const glowId = `${id}-landing-expression-glow`;
  const coreGlowId = `${id}-landing-expression-core`;
  const axes = useMemo(() => buildLandingAxes(), []);
  const ambientRays = useMemo(() => buildAmbientRays(), []);
  const gridPaths = useMemo(() => buildSphereGrid(rotation), [rotation]);
  const projectedAmbient = useMemo(() => ambientRays.map((ray) => projectAmbientRay(ray, rotation)), [ambientRays, rotation]);
  const projectedAxes = useMemo(() => axes.map((axis) => projectAxis(axis, rotation)), [axes, rotation]);
  const selected = axes.find((item) => item.axis.id === selectedId) ?? axes[0];

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let last = performance.now();
    let accumulated = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 100);
      last = now;
      if (!dragState.current) {
        accumulated += elapsed;
        if (accumulated >= 42) {
          const step = accumulated * AUTO_ROTATION_DEGREES_PER_MS;
          accumulated = 0;
          setRotation((value) => ({ ...value, yaw: wrapAngle(value.yaw + step) }));
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

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
      setRotation((value) => ({ ...value, yaw: wrapAngle(value.yaw + direction * 4) }));
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      setRotation((value) => ({ ...value, pitch: clamp(value.pitch + direction * 3, -ROTATION_LIMIT, ROTATION_LIMIT) }));
    }
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
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
    const yawDelta = (event.clientX - drag.startX) / Math.max(bounds.width, 1) * 140;
    const pitchDelta = (event.clientY - drag.startY) / Math.max(bounds.height, 1) * 72;
    setRotation({
      yaw: wrapAngle(drag.startRotation.yaw + yawDelta),
      pitch: clamp(drag.startRotation.pitch - pitchDelta, -ROTATION_LIMIT, ROTATION_LIMIT)
    });
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
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
      data-release-copy="Illustrative Baseline · Eight interactive measurements · one stable center · line length follows relative expression reach · not a diagnosis, compatibility score, or claim about anyone’s internal state"
      aria-label="Interactive Baseline expression field"
    >
      <svg
        className="landing-expression-slice__canvas"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        role="group"
        aria-label="A stable blue sphere with eight interactive measurement lines radiating in every direction from one center. Longer lines show more available expression in this sanitized example. Shorter lines remain closer to the center. Drag to rotate."
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

        <circle
          className="landing-expression-slice__sphere-shell"
          cx={CENTER}
          cy={CENTER}
          r={SPHERE_RADIUS}
          fill={`url(#${id}-sphere-fill)`}
        />

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
              const depthOpacity = 0.62 + projected.depth * 0.38;
              return (
                <g
                  key={axis.id}
                  className={`landing-expression-slice__vector${selectedLine ? ' is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedLine}
                  aria-label={`${axis.label}. ${salienceLabel(axis.value)}. Relative reach ${axis.value}. Baseline ${axis.baselineValue}. Temporary change ${formatDelta(axis.currentDelta)}. ${description}`}
                  onPointerEnter={() => selectAxis(axis.id)}
                  onFocus={() => selectAxis(axis.id)}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectAxis(axis.id);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, axis.id)}
                >
                  <path
                    className="landing-expression-slice__aura"
                    d={path}
                    filter={`url(#${glowId})`}
                    style={{ opacity: selectedLine ? 0.88 : depthOpacity * 0.45 }}
                  />
                  <path
                    className="landing-expression-slice__beam"
                    d={path}
                    style={{ opacity: selectedLine ? 1 : depthOpacity }}
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
      </svg>

      <div className="landing-expression-slice__readout" role="status" aria-live="polite">
        <span>Relative expression · sanitized example</span>
        <strong>{selected.axis.label}</strong>
        <p>{selected.description}</p>
        <small>
          Relative reach {selected.axis.value} · Baseline {selected.axis.baselineValue}
          {selected.axis.currentDelta !== 0 ? ` · temporary change ${formatDelta(selected.axis.currentDelta)}` : ''}
        </small>
      </div>

      <span className="landing-expression-slice__instructions">
        Drag to rotate · select a line to inspect its relative reach
      </span>
    </section>
  );
}

function buildLandingAxes(): LandingAxis[] {
  const axisById = new Map(landingExpressionFieldFixture.axes.map((axis) => [axis.id, axis]));
  return LANDING_AXIS_LAYOUT.map((definition) => {
    const axis = axisById.get(definition.id);
    if (!axis) throw new Error(`Missing landing expression axis: ${definition.id}`);
    const normalized = clamp(axis.value / 100, 0, 1);
    return {
      axis,
      description: definition.description,
      direction: directionFromAngles(definition.azimuth, definition.elevation),
      length: MIN_AXIS_LENGTH + Math.pow(normalized, 1.32) * (MAX_AXIS_LENGTH - MIN_AXIS_LENGTH)
    };
  });
}

function buildAmbientRays(): AmbientRay[] {
  const count = 64;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - index / (count - 1) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;
    const wave = Math.sin(index * 1.73) * 0.5 + 0.5;
    return {
      direction: { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius },
      length: 142 + wave * 178 + (index % 5) * 4,
      opacity: 0.055 + (index % 7) * 0.011,
      width: 0.42 + (index % 4) * 0.12
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

function directionFromAngles(azimuth: number, elevation: number): Vector3 {
  const azimuthRadians = radians(azimuth);
  const elevationRadians = radians(elevation);
  return {
    x: Math.cos(elevationRadians) * Math.cos(azimuthRadians),
    y: Math.sin(elevationRadians),
    z: Math.cos(elevationRadians) * Math.sin(azimuthRadians)
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

function pathFromPoints(points: ProjectedPoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : String(value);
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
