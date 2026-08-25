import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ExpressionAxisId,
  ExpressionAxisValue,
  ExpressionFieldResponse
} from './expression-field-contract';
import {
  assertExpressionFieldResponse,
  expressionStateLabel,
  salienceLabel
} from './expression-field-contract';
import {
  damp,
  distanceToSegment,
  expressionAxisRegistry,
  multiplyQuaternion,
  projectPoint,
  quaternionFromEuler,
  quaternionFromUnitVectors,
  rotateVector,
  scaleVector,
  slerpQuaternion,
  vectorLengthForValue,
  type Quaternion,
  type Vec3
} from './expression-field-math';

interface InstrumentProps {
  snapshot: ExpressionFieldResponse;
  variant: 'landing' | 'account';
  autoRotate?: boolean;
  selectedAxisId?: ExpressionAxisId;
  onSelectedAxisChange?: (id: ExpressionAxisId) => void;
}

interface CanvasProps {
  axes: readonly ExpressionAxisValue[];
  variant: 'preview' | 'account';
  autoRotate: boolean;
  selectedAxisId: ExpressionAxisId;
  onSelectAxis: (id: ExpressionAxisId) => void;
  resetSignal: number;
  engagementDirection?: ExpressionFieldEngagementDirection;
  engagementPhase: number;
  draggable: boolean;
  suspendWhenOffscreen: boolean;
  ariaLabel: string;
}

export type ExpressionFieldEngagementDirection = 'left' | 'right' | 'up' | 'down' | 'up-left' | 'up-right' | 'down-left' | 'down-right';

export interface ExpressionFieldRendererProps {
  axes: readonly ExpressionAxisValue[];
  selectedAxisId: ExpressionAxisId;
  autoRotate?: boolean;
  engagementDirection?: ExpressionFieldEngagementDirection;
  engagementPhase?: number;
  draggable?: boolean;
  suspendWhenOffscreen?: boolean;
  className?: string;
  ariaLabel: string;
}

type Segment = { id: ExpressionAxisId; startX: number; startY: number; endX: number; endY: number };
type PointerState = {
  id: number;
  originX: number;
  originY: number;
  lastX: number;
  lastY: number;
  dragging: boolean;
};

type DrawInput = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  axesById: Map<ExpressionAxisId, ExpressionAxisValue>;
  rotation: Quaternion;
  selectedAxisId: ExpressionAxisId;
  displayedValues: Map<ExpressionAxisId, number>;
  segments: Segment[];
  delta: number;
};

const DRAG_THRESHOLD = 5;
const engagementDirections: Record<ExpressionFieldEngagementDirection, Vec3> = {
  left: [-1, 0, 0],
  right: [1, 0, 0],
  up: [0, 1, 0],
  down: [0, -1, 0],
  'up-left': [-0.7071, 0.7071, 0],
  'up-right': [0.7071, 0.7071, 0],
  'down-left': [-0.7071, -0.7071, 0],
  'down-right': [0.7071, -0.7071, 0]
};
const axisDirectionById = new Map(expressionAxisRegistry.map((axis) => [axis.id, axis.direction]));

export function AccountExpressionField() {
  const [snapshot, setSnapshot] = useState<ExpressionFieldResponse | null>(null);
  const [open, setOpen] = useState(() => new URLSearchParams(location.search).get('view') === 'expression-field');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAxisId, setSelectedAxisId] = useState<ExpressionAxisId>('clarity');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/expression-field?mode=live', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'application/json' }
      });
      if (response.status === 401) {
        location.assign('/login?returnTo=%2Fapp');
        return;
      }
      if (response.status === 409) {
        setSnapshot(null);
        return;
      }
      const body: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
          ? body.message
          : 'The Expression Field is temporarily unavailable.';
        throw new Error(message);
      }
      assertExpressionFieldResponse(body);
      setSnapshot(body);
      setSelectedAxisId(body.axes.find((axis) => axis.currentDelta > 0)?.id ?? body.axes[0]?.id ?? 'clarity');
    } catch (problem) {
      setSnapshot(null);
      setError(problem instanceof Error ? problem.message : 'The Expression Field is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  if (!snapshot && !loading && !error) return null;
  const selected = snapshot?.axes.find((axis) => axis.id === selectedAxisId) ?? snapshot?.axes[0];

  return (
    <>
      <button
        className="expression-field-launcher"
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        aria-label="Open Expression Field"
      >
        <span aria-hidden="true" />
        <strong>{loading ? 'Preparing field' : 'Expression Field'}</strong>
      </button>

      {open && (
        <div className="expression-field-overlay" role="presentation">
          <button className="expression-field-backdrop" type="button" aria-label="Close Expression Field" onClick={() => setOpen(false)} />
          <aside className="expression-field-focus" role="dialog" aria-modal="true" aria-labelledby="expression-field-title">
            <header>
              <div>
                <span>YOUR BASELINE · LIVE CONTEXT</span>
                <h2 id="expression-field-title">Expression Field</h2>
                <p className="expression-field-introduction">See how a Baseline capacity may be expressing—steady, active, protective, overextended, or at its best—without turning it into a verdict.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Expression Field">×</button>
            </header>

            {error && (
              <div className="expression-field-error" role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => void load()}>Try again</button>
              </div>
            )}

            {snapshot && (
              <>
                <ExpressionFieldInstrument
                  snapshot={snapshot}
                  variant="account"
                  selectedAxisId={selectedAxisId}
                  onSelectedAxisChange={setSelectedAxisId}
                />
                {selected && (
                  <button
                    className="expression-field-ask"
                    type="button"
                    onClick={() => {
                      placePromptInComposer(
                        `Help me understand ${selected.label} in my Expression Field. Show its gift, protective or shadow expression, what repression or overextension could look like, and what may be louder now.`
                      );
                      setOpen(false);
                    }}
                  >
                    Ask Sovereign about {selected.label.toLowerCase()} <span aria-hidden="true">→</span>
                  </button>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

export function ExpressionFieldInstrument({
  snapshot,
  variant,
  autoRotate = false,
  selectedAxisId,
  onSelectedAxisChange
}: InstrumentProps) {
  const [internalSelected, setInternalSelected] = useState<ExpressionAxisId>(selectedAxisId ?? snapshot.axes[0]?.id ?? 'clarity');
  const [resetSignal, setResetSignal] = useState(0);
  const selected = selectedAxisId ?? internalSelected;
  const selectedAxis = snapshot.axes.find((axis) => axis.id === selected) ?? snapshot.axes[0];

  function selectAxis(id: ExpressionAxisId) {
    setInternalSelected(id);
    onSelectedAxisChange?.(id);
  }

  return (
    <section className={`expression-field-instrument expression-field-${variant}`} data-expression-field-version={snapshot.version}>
      <div className="expression-field-canvas-shell">
        <ExpressionFieldRenderer
          axes={snapshot.axes}
          autoRotate={autoRotate}
          selectedAxisId={selected}
          onSelectAxis={selectAxis}
          resetSignal={resetSignal}
          draggable
          ariaLabel="Rotatable Expression Field. Every line begins at one stable center. Line length shows qualitative expression emphasis, not a diagnosis, score, or exact measurement."
        />
        <span className="expression-field-origin-label">ONE CENTER · SIXTEEN EXPRESSIONS</span>
      </div>

      {selectedAxis && <ExpressionAxisDetails axis={selectedAxis} />}

      <ul className="sr-only" aria-label="Expression Field values">
        {snapshot.axes.map((axis) => (
          <li key={axis.id}>{axis.label}: {salienceLabel(axis.value)}. {axis.summary}</li>
        ))}
      </ul>

      <div className="expression-field-controls">
        <div role="list" aria-label="Expression channels">
          {snapshot.axes.map((axis) => (
            <button
              key={axis.id}
              type="button"
              role="listitem"
              aria-pressed={axis.id === selected}
              onClick={() => selectAxis(axis.id)}
            >
              {axis.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setResetSignal((value) => value + 1)}>Reset view</button>
      </div>
    </section>
  );
}

function ExpressionAxisDetails({ axis }: { axis: ExpressionAxisValue }) {
  const state = expressionStateLabel(axis.state);
  return (
    <div className="expression-field-details" aria-live="polite">
      <div className="expression-field-details-heading">
        <div>
          <span>{axis.currentDelta > 0 ? 'MORE ACTIVE NOW' : 'BASELINE EXPRESSION'}</span>
          <h3>{axis.label}</h3>
        </div>
        <div className="expression-field-measurement">
          <strong>{salienceLabel(axis.value)}</strong>
          <small>Relative emphasis</small>
        </div>
      </div>
      <p>{axis.activeNow ?? axis.summary}</p>
      <small className="expression-field-state">{state}{axis.state === 'unconfirmed' ? '. Actual expression remains yours to confirm.' : ''}</small>
      {(axis.giftExpression || axis.shadowExpression || axis.repressedExpression || axis.overextendedExpression || axis.practicalDistinction) && (
        <div className="expression-field-language" aria-label={`${axis.label} expression possibilities`}>
          {axis.giftExpression && <ExpressionMeaning label="Gift" text={axis.giftExpression} />}
          {axis.shadowExpression && <ExpressionMeaning label="Protective or shadow" text={axis.shadowExpression} />}
          {axis.repressedExpression && <ExpressionMeaning label="When held back" text={axis.repressedExpression} />}
          {axis.overextendedExpression && <ExpressionMeaning label="When overextended" text={axis.overextendedExpression} />}
          {axis.practicalDistinction && <ExpressionMeaning label="Useful distinction" text={axis.practicalDistinction} />}
        </div>
      )}
    </div>
  );
}

function ExpressionMeaning({ label, text }: { label: string; text: string }) {
  return <div><span>{label}</span><p>{text}</p></div>;
}

export function ExpressionFieldRenderer({
  axes,
  selectedAxisId,
  autoRotate = true,
  engagementDirection,
  engagementPhase = 0,
  draggable = false,
  suspendWhenOffscreen = true,
  className = '',
  ariaLabel,
  ...internal
}: ExpressionFieldRendererProps & { onSelectAxis?: (id: ExpressionAxisId) => void; resetSignal?: number; variant?: 'preview' | 'account' }) {
  return (
    <div className={`expression-field-renderer${draggable ? ' is-draggable' : ''}${className ? ` ${className}` : ''}`}>
      <ExpressionFieldCanvas
        axes={axes}
        variant={internal.variant ?? (draggable ? 'account' : 'preview')}
        autoRotate={autoRotate}
        selectedAxisId={selectedAxisId}
        onSelectAxis={internal.onSelectAxis ?? (() => undefined)}
        resetSignal={internal.resetSignal ?? 0}
        {...(engagementDirection ? { engagementDirection } : {})}
        engagementPhase={engagementPhase}
        draggable={draggable}
        suspendWhenOffscreen={suspendWhenOffscreen}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

function ExpressionFieldCanvas({
  axes,
  variant,
  autoRotate,
  selectedAxisId,
  onSelectAxis,
  resetSignal,
  engagementDirection,
  engagementPhase,
  draggable,
  suspendWhenOffscreen,
  ariaLabel
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<Quaternion>(quaternionFromEuler(-0.14, 0.42));
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef<PointerState | null>(null);
  const visibleRef = useRef(true);
  const segmentsRef = useRef<Segment[]>([]);
  const displayedValuesRef = useRef(new Map<ExpressionAxisId, number>());
  const requestRenderRef = useRef<() => void>(() => undefined);
  const axesById = useMemo(() => new Map(axes.map((axis) => [axis.id, axis])), [axes]);

  useEffect(() => {
    rotationRef.current = quaternionFromEuler(-0.14, 0.42);
    velocityRef.current = { x: 0, y: 0 };
    requestRenderRef.current();
  }, [resetSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const renderContext: CanvasRenderingContext2D = context;
    const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = reducedMotionQuery.matches;
    const dprCap = variant === 'preview' ? 1.5 : 2;
    const selectedDirection = axisDirectionById.get(selectedAxisId);
    const engagementTarget = engagementDirection ? engagementDirections[engagementDirection] : undefined;
    const engagementRotation = selectedDirection && engagementTarget
      ? quaternionFromUnitVectors(selectedDirection, engagementTarget)
      : undefined;
    if (reduceMotion) {
      for (const [id, axis] of axesById) displayedValuesRef.current.set(id, axis.value);
    }
    let width = 1;
    let height = 1;
    let frame = 0;
    let active = true;
    let previousTime = performance.now();

    const start = () => {
      if (!active || frame || !visibleRef.current || document.hidden) return;
      previousTime = performance.now();
      frame = requestAnimationFrame(render);
    };
    requestRenderRef.current = start;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, dprCap);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      renderContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let intersectionObserver: IntersectionObserver | null = null;
    if (suspendWhenOffscreen) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
        if (visibleRef.current) start();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      }, { rootMargin: '120px' });
      intersectionObserver.observe(canvas);
    } else {
      visibleRef.current = true;
      start();
    }

    function render(time: number) {
      frame = 0;
      const delta = Math.min(0.05, Math.max(0.001, (time - previousTime) / 1000));
      previousTime = time;
      if (visibleRef.current && !document.hidden) {
        if (!pointerRef.current && !reduceMotion) {
          const velocity = velocityRef.current;
          if (Math.abs(velocity.x) + Math.abs(velocity.y) > 0.001) {
            rotationRef.current = multiplyQuaternion(quaternionFromEuler(velocity.y * delta, velocity.x * delta), rotationRef.current);
            velocity.x *= Math.pow(0.04, delta);
            velocity.y *= Math.pow(0.04, delta);
          } else if (autoRotate) {
            rotationRef.current = multiplyQuaternion(quaternionFromEuler(0, 0.026 * delta), rotationRef.current);
          }
        }
        const cycle = ((time / 7600 + engagementPhase) % 1 + 1) % 1;
        const wave = (1 - Math.cos(cycle * Math.PI * 2)) / 2;
        const engagementAmount = reduceMotion ? 0.7 : smoothstep(0.34, 0.82, wave) * 0.9;
        const renderedRotation = engagementRotation
          ? slerpQuaternion(rotationRef.current, engagementRotation, engagementAmount)
          : rotationRef.current;
        drawExpressionField({
          context: renderContext,
          width,
          height,
          axesById,
          rotation: renderedRotation,
          selectedAxisId,
          displayedValues: displayedValuesRef.current,
          segments: segmentsRef.current,
          delta
        });
      }
      if (!reduceMotion) start();
    }

    function onReducedMotionChange(event: MediaQueryListEvent) {
      reduceMotion = event.matches;
      if (reduceMotion) {
        velocityRef.current = { x: 0, y: 0 };
        for (const [id, axis] of axesById) displayedValuesRef.current.set(id, axis.value);
      }
      start();
    }

    const visibilityChange = () => start();
    document.addEventListener('visibilitychange', visibilityChange);
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);
    start();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange);
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
      requestRenderRef.current = () => undefined;
    };
  }, [axesById, autoRotate, engagementDirection, engagementPhase, selectedAxisId, suspendWhenOffscreen, variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !draggable) return;

    function localPoint(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function resetPointer(pointerId?: number) {
      const pointer = pointerRef.current;
      if (!pointer || (pointerId !== undefined && pointer.id !== pointerId)) return;
      pointerRef.current = null;
    }

    function pointerDown(event: PointerEvent) {
      if (pointerRef.current) return;
      pointerRef.current = {
        id: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        dragging: false
      };
      velocityRef.current = { x: 0, y: 0 };
    }

    function pointerMove(event: PointerEvent) {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      const totalX = event.clientX - pointer.originX;
      const totalY = event.clientY - pointer.originY;
      if (!pointer.dragging) {
        if (variant === 'preview' && Math.abs(totalY) > Math.abs(totalX) * 1.25) {
          resetPointer(event.pointerId);
          return;
        }
        if (Math.hypot(totalX, totalY) < DRAG_THRESHOLD) return;
        pointer.dragging = true;
        canvas!.setPointerCapture(event.pointerId);
      }
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;
      rotationRef.current = multiplyQuaternion(quaternionFromEuler(dy * 0.0054, dx * 0.0054), rotationRef.current);
      velocityRef.current = { x: dx * 0.72, y: dy * 0.72 };
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      requestRenderRef.current();
    }

    function pointerUp(event: PointerEvent) {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      if (!pointer.dragging) {
        const point = localPoint(event);
        const nearest = segmentsRef.current
          .map((segment) => ({
            id: segment.id,
            distance: distanceToSegment(point.x, point.y, segment.startX, segment.startY, segment.endX, segment.endY)
          }))
          .sort((left, right) => left.distance - right.distance)[0];
        if (nearest && nearest.distance <= 18) onSelectAxis(nearest.id);
      }
      if (canvas!.hasPointerCapture(event.pointerId)) canvas!.releasePointerCapture(event.pointerId);
      resetPointer(event.pointerId);
    }

    function pointerCancel(event: PointerEvent) {
      if (canvas!.hasPointerCapture(event.pointerId)) canvas!.releasePointerCapture(event.pointerId);
      resetPointer(event.pointerId);
    }

    function lostPointerCapture(event: PointerEvent) {
      resetPointer(event.pointerId);
    }

    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerCancel);
    canvas.addEventListener('lostpointercapture', lostPointerCapture);
    return () => {
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerCancel);
      canvas.removeEventListener('lostpointercapture', lostPointerCapture);
    };
  }, [draggable, onSelectAxis, variant]);

  return <canvas ref={canvasRef} className="expression-field-canvas" role="img" aria-label={ariaLabel} />;
}

function drawExpressionField(input: DrawInput) {
  const { context, width, height, rotation } = input;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.455;
  context.clearRect(0, 0, width, height);

  const atmosphere = context.createRadialGradient(centerX, centerY, radius * 0.12, centerX, centerY, radius * 1.16);
  atmosphere.addColorStop(0, 'rgba(15, 111, 255, .1)');
  atmosphere.addColorStop(0.58, 'rgba(8, 103, 223, .035)');
  atmosphere.addColorStop(1, 'rgba(3, 12, 24, 0)');
  context.fillStyle = atmosphere;
  context.fillRect(0, 0, width, height);

  drawRotatingGrid(context, rotation, radius, centerX, centerY);

  input.segments.length = 0;
  const layers = expressionAxisRegistry.map((definition) => {
    const axis = input.axesById.get(definition.id);
    const target = axis?.value ?? 0;
    const current = damp(input.displayedValues.get(definition.id) ?? axis?.baselineValue ?? target, target, 5.5, input.delta);
    input.displayedValues.set(definition.id, current);
    const direction = rotateVector(definition.direction, rotation);
    const end = projectPoint(scaleVector(direction, vectorLengthForValue(current)), radius, centerX, centerY);
    return { definition, axis, end, depth: direction[2] };
  }).sort((left, right) => left.depth - right.depth);

  for (const layer of layers) {
    const selected = layer.definition.id === input.selectedAxisId;
    const depthAlpha = 0.24 + ((layer.depth + 1) / 2) * 0.48;
    const stateWeight = stateVisualWeight(layer.axis?.state);
    const alpha = selected ? 0.98 : Math.min(0.78, depthAlpha * stateWeight.opacity);
    if (selected) {
      context.strokeStyle = 'rgba(61, 155, 255, .16)';
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(layer.end[0], layer.end[1]);
      context.stroke();
    }
    const gradient = context.createLinearGradient(centerX, centerY, layer.end[0], layer.end[1]);
    gradient.addColorStop(0, `rgba(216, 239, 255, ${alpha})`);
    gradient.addColorStop(0.18, `rgba(126, 201, 255, ${alpha})`);
    gradient.addColorStop(1, `rgba(15, 111, 255, ${alpha * 0.9})`);
    context.strokeStyle = gradient;
    context.lineWidth = selected ? 2.15 : 1.02 * stateWeight.width;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(layer.end[0], layer.end[1]);
    context.stroke();
    input.segments.push({ id: layer.definition.id, startX: centerX, startY: centerY, endX: layer.end[0], endY: layer.end[1] });
  }

  const coreGlow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.13);
  coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  coreGlow.addColorStop(0.15, 'rgba(216, 239, 255, .98)');
  coreGlow.addColorStop(0.42, 'rgba(61, 155, 255, .42)');
  coreGlow.addColorStop(1, 'rgba(15, 111, 255, 0)');
  context.fillStyle = coreGlow;
  context.beginPath();
  context.arc(centerX, centerY, radius * 0.13, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#f7fcff';
  context.beginPath();
  context.arc(centerX, centerY, Math.max(2.2, radius * 0.017), 0, Math.PI * 2);
  context.fill();
}

function drawRotatingGrid(context: CanvasRenderingContext2D, rotation: Quaternion, radius: number, centerX: number, centerY: number) {
  context.save();
  context.lineWidth = 0.75;
  const circles: Vec3[][] = [];
  for (const latitude of [-60, -30, 0, 30, 60]) {
    const phi = latitude * Math.PI / 180;
    circles.push(Array.from({ length: 65 }, (_, index) => {
      const theta = index / 64 * Math.PI * 2;
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)] as Vec3;
    }));
  }
  for (let longitude = 0; longitude < 6; longitude += 1) {
    const theta = longitude / 6 * Math.PI;
    circles.push(Array.from({ length: 65 }, (_, index) => {
      const phi = -Math.PI / 2 + index / 64 * Math.PI;
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)] as Vec3;
    }));
  }

  for (const points of circles) {
    const projected = points.map((point) => {
      const rotated = rotateVector(point, rotation);
      return { point: projectPoint(rotated, radius, centerX, centerY), depth: rotated[2] };
    });
    for (let index = 1; index < projected.length; index += 1) {
      const previous = projected[index - 1]!;
      const current = projected[index]!;
      const depth = (previous.depth + current.depth) / 2;
      context.strokeStyle = `rgba(126, 201, 255, ${0.035 + ((depth + 1) / 2) * 0.075})`;
      context.beginPath();
      context.moveTo(previous.point[0], previous.point[1]);
      context.lineTo(current.point[0], current.point[1]);
      context.stroke();
    }
  }
  context.restore();
}

function stateVisualWeight(state: ExpressionAxisValue['state'] | undefined) {
  switch (state) {
    case 'gift':
    case 'integrated': return { opacity: 1.08, width: 1.12 };
    case 'protective':
    case 'under_pressure': return { opacity: 0.94, width: 1.08 };
    case 'repressed': return { opacity: 0.68, width: 0.82 };
    case 'overextended': return { opacity: 1.04, width: 1.2 };
    default: return { opacity: 1, width: 1 };
  }
}

function smoothstep(minimum: number, maximum: number, value: number) {
  const normalized = Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
  return normalized * normalized * (3 - 2 * normalized);
}

function placePromptInComposer(prompt: string) {
  const textarea = document.querySelector<HTMLTextAreaElement>('.sovereign-composer textarea');
  if (!textarea) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(textarea, prompt);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}
