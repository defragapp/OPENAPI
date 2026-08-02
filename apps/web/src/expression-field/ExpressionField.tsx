import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type {
  ExpressionAxisId,
  ExpressionAxisValue,
  ExpressionFieldResponse
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
  className?: string;
  ariaLabel: string;
}

type Segment = { id: ExpressionAxisId; startX: number; startY: number; endX: number; endY: number };
type PointerState = { id: number; x: number; y: number; startX: number; startY: number; moved: boolean };

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
      const body = await response.json().catch(() => ({})) as ExpressionFieldResponse & { message?: string };
      if (!response.ok) throw new Error(body.message || 'The Expression Field is temporarily unavailable.');
      setSnapshot(body);
      setSelectedAxisId(body.axes.find((axis) => axis.currentDelta > 0)?.id ?? body.axes[0]?.id ?? 'clarity');
    } catch (problem) {
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
        <strong>{loading ? 'Preparing field' : 'Expression field'}</strong>
      </button>

      {open && (
        <div className="expression-field-overlay" role="presentation">
          <button className="expression-field-backdrop" type="button" aria-label="Close Expression Field" onClick={() => setOpen(false)} />
          <aside className="expression-field-focus" role="dialog" aria-modal="true" aria-labelledby="expression-field-title">
            <header>
              <div><span>YOUR BASELINE · LIVE CONTEXT</span><h2 id="expression-field-title">Expression Field</h2></div>
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
                      placePromptInComposer(`What does ${selected.label} mean in my Expression Field, and what may be more active now?`);
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
          ariaLabel="Rotatable Expression Field. Select an expression from the controls below for exact text detail."
        />
        <span className="expression-field-origin-label">ONE CENTER · SIXTEEN EXPRESSIONS</span>
      </div>

      {selectedAxis && (
        <div className="expression-field-details" aria-live="polite">
          <div>
            <span>{selectedAxis.currentDelta > 0 ? 'MORE ACTIVE NOW' : 'BASELINE EXPRESSION'}</span>
            <h3>{selectedAxis.label}</h3>
          </div>
          {variant === 'account' && <strong>Relative expression · {selectedAxis.value}</strong>}
          <p>{selectedAxis.activeNow ?? selectedAxis.summary}</p>
          <small>{selectedAxis.state === 'unconfirmed' ? 'Actual expression remains yours to confirm.' : selectedAxis.state.replace('_', ' ')}</small>
        </div>
      )}

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

export function ExpressionFieldRenderer({
  axes,
  selectedAxisId,
  autoRotate = true,
  engagementDirection,
  engagementPhase = 0,
  draggable = false,
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

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry?.isIntersecting ?? true;
      if (visibleRef.current) start();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: '120px' });
    intersectionObserver.observe(canvas);

    function render(time: number) {
      frame = 0;
      const delta = Math.min(0.05, Math.max(0.001, (time - previousTime) / 1000));
      previousTime = time;
      if (visibleRef.current && !document.hidden) {
        if (!pointerRef.current && !reduceMotion) {
          const velocity = velocityRef.current;
          if (Math.abs(velocity.x) + Math.abs(velocity.y) > 0.001) {
            rotationRef.current = multiplyQuaternion(quaternionFromEuler(velocity.y * delta, velocity.x * delta), rotationRef.current);
            velocity.x *= Math.pow(0.055, delta);
            velocity.y *= Math.pow(0.055, delta);
          } else if (autoRotate) {
            rotationRef.current = multiplyQuaternion(quaternionFromEuler(0, 0.045 * delta), rotationRef.current);
          }
        }
        const cycle = ((time / 6200 + engagementPhase) % 1 + 1) % 1;
        const wave = (1 - Math.cos(cycle * Math.PI * 2)) / 2;
        const engagementAmount = reduceMotion ? 0.72 : smoothstep(0.34, 0.82, wave) * 0.94;
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

    const visibilityChange = () => start();
    document.addEventListener('visibilitychange', visibilityChange);
    start();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange);
      requestRenderRef.current = () => undefined;
    };
  }, [axesById, autoRotate, engagementDirection, engagementPhase, selectedAxisId, variant]);

  function pointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!draggable) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
    velocityRef.current = { x: 0, y: 0 };
  }

  function pointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!draggable) return;
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    const totalX = event.clientX - pointer.startX;
    const totalY = event.clientY - pointer.startY;
    if (!pointer.moved && Math.hypot(totalX, totalY) > 5) pointer.moved = true;
    if (variant === 'preview' && Math.abs(totalY) > Math.abs(totalX) * 1.25) return;
    rotationRef.current = multiplyQuaternion(quaternionFromEuler(dy * 0.006, dx * 0.006), rotationRef.current);
    velocityRef.current = { x: dx * 0.85, y: dy * 0.85 };
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    requestRenderRef.current();
  }

  function pointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!draggable) return;
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.moved) {
      const rect = event.currentTarget.getBoundingClientRect();
      const pointX = event.clientX - rect.left;
      const pointY = event.clientY - rect.top;
      const nearest = segmentsRef.current
        .map((segment) => ({
          id: segment.id,
          distance: distanceToSegment(pointX, pointY, segment.startX, segment.startY, segment.endX, segment.endY)
        }))
        .sort((left, right) => left.distance - right.distance)[0];
      if (nearest && nearest.distance <= 18) onSelectAxis(nearest.id);
    }
    pointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <canvas
      ref={canvasRef}
      className="expression-field-canvas"
      role="img"
      aria-label={ariaLabel}
      onPointerDown={draggable ? pointerDown : undefined}
      onPointerMove={draggable ? pointerMove : undefined}
      onPointerUp={draggable ? pointerUp : undefined}
      onPointerCancel={draggable ? () => { pointerRef.current = null; } : undefined}
    />
  );
}

function drawExpressionField(input: {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  axesById: Map<ExpressionAxisId, ExpressionAxisValue>;
  rotation: Quaternion;
  selectedAxisId: ExpressionAxisId;
  displayedValues: Map<ExpressionAxisId, number>;
  segments: Segment[];
  delta: number;
}) {
  const { context, width, height, rotation } = input;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.47;
  context.clearRect(0, 0, width, height);

  const atmosphere = context.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius * 1.18);
  atmosphere.addColorStop(0, 'rgba(30, 123, 232, .08)');
  atmosphere.addColorStop(0.62, 'rgba(18, 86, 173, .035)');
  atmosphere.addColorStop(1, 'rgba(5, 18, 35, 0)');
  context.fillStyle = atmosphere;
  context.fillRect(0, 0, width, height);

  input.segments.length = 0;
  const layers = expressionAxisRegistry.map((definition) => {
    const axis = input.axesById.get(definition.id);
    const target = axis?.value ?? 0;
    const current = damp(input.displayedValues.get(definition.id) ?? axis?.baselineValue ?? target, target, 6.2, input.delta);
    input.displayedValues.set(definition.id, current);
    const direction = rotateVector(definition.direction, rotation);
    const end = projectPoint(scaleVector(direction, vectorLengthForValue(current)), radius, centerX, centerY);
    return { definition, end, depth: direction[2] };
  }).sort((left, right) => left.depth - right.depth);

  for (const layer of layers) {
    const selected = layer.definition.id === input.selectedAxisId;
    const alpha = selected ? 0.98 : 0.28 + ((layer.depth + 1) / 2) * 0.42;
    if (selected) {
      context.strokeStyle = 'rgba(90, 182, 255, .18)';
      context.lineWidth = 8;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(layer.end[0], layer.end[1]);
      context.stroke();
    }
    const gradient = context.createLinearGradient(centerX, centerY, layer.end[0], layer.end[1]);
    gradient.addColorStop(0, `rgba(228, 247, 255, ${alpha})`);
    gradient.addColorStop(0.16, `rgba(104, 195, 255, ${alpha})`);
    gradient.addColorStop(1, `rgba(47, 135, 255, ${alpha * 0.82})`);
    context.strokeStyle = gradient;
    context.lineWidth = selected ? 2.1 : 1.05;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(layer.end[0], layer.end[1]);
    context.stroke();
    input.segments.push({ id: layer.definition.id, startX: centerX, startY: centerY, endX: layer.end[0], endY: layer.end[1] });
  }

  const coreGlow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.14);
  coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  coreGlow.addColorStop(0.14, 'rgba(183, 226, 255, .98)');
  coreGlow.addColorStop(0.42, 'rgba(56, 154, 255, .46)');
  coreGlow.addColorStop(1, 'rgba(45, 132, 255, 0)');
  context.fillStyle = coreGlow;
  context.beginPath();
  context.arc(centerX, centerY, radius * 0.14, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#f4fbff';
  context.beginPath();
  context.arc(centerX, centerY, Math.max(2.2, radius * 0.018), 0, Math.PI * 2);
  context.fill();
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
