import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type {
  ExpressionAxisId,
  ExpressionAxisValue,
  ExpressionFieldResponse
} from './expression-field-contract';
import { landingExpressionFieldFixture } from './expression-field.fixture';
import {
  damp,
  distanceToSegment,
  expressionAxisRegistry,
  fibonacciSphere,
  multiplyQuaternion,
  projectPoint,
  quaternionFromEuler,
  rotateVector,
  scaleVector,
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
  axes: ExpressionAxisValue[];
  variant: 'landing' | 'account';
  autoRotate: boolean;
  selectedAxisId: ExpressionAxisId;
  onSelectAxis: (id: ExpressionAxisId) => void;
  resetSignal: number;
}

type Segment = { id: ExpressionAxisId; startX: number; startY: number; endX: number; endY: number };
type PointerState = { id: number; x: number; y: number; startX: number; startY: number; moved: boolean };

const shellPoints = fibonacciSphere(1200);
const gridLines = buildGridLines();

export function LandingExpressionField() {
  return (
    <div className="landing-expression-field">
      <ExpressionFieldInstrument
        snapshot={landingExpressionFieldFixture}
        variant="landing"
        autoRotate
        selectedAxisId="responsibility"
      />
      <p>Sanitized demonstration · Illustrative values · Not your Baseline</p>
    </div>
  );
}

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
        <ExpressionFieldCanvas
          axes={snapshot.axes}
          variant={variant}
          autoRotate={autoRotate}
          selectedAxisId={selected}
          onSelectAxis={selectAxis}
          resetSignal={resetSignal}
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

function ExpressionFieldCanvas({ axes, variant, autoRotate, selectedAxisId, onSelectAxis, resetSignal }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<Quaternion>(quaternionFromEuler(-0.14, 0.42));
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef<PointerState | null>(null);
  const visibleRef = useRef(true);
  const segmentsRef = useRef<Segment[]>([]);
  const displayedValuesRef = useRef(new Map<ExpressionAxisId, number>());
  const axesById = useMemo(() => new Map(axes.map((axis) => [axis.id, axis])), [axes]);

  useEffect(() => {
    rotationRef.current = quaternionFromEuler(-0.14, 0.42);
    velocityRef.current = { x: 0, y: 0 };
  }, [resetSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dprCap = variant === 'landing' ? 1.5 : 2;
    let width = 1;
    let height = 1;
    let frame = 0;
    let previousTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, dprCap);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry?.isIntersecting ?? true;
    }, { rootMargin: '120px' });
    intersectionObserver.observe(canvas);

    const render = (time: number) => {
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
        drawExpressionField({
          context,
          width,
          height,
          axesById,
          rotation: rotationRef.current,
          selectedAxisId,
          displayedValues: displayedValuesRef.current,
          segments: segmentsRef.current,
          delta
        });
      }
      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [axesById, autoRotate, selectedAxisId, variant]);

  function pointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
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
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    const totalX = event.clientX - pointer.startX;
    const totalY = event.clientY - pointer.startY;
    if (!pointer.moved && Math.hypot(totalX, totalY) > 5) pointer.moved = true;
    if (variant === 'landing' && Math.abs(totalY) > Math.abs(totalX) * 1.25) return;
    rotationRef.current = multiplyQuaternion(quaternionFromEuler(dy * 0.006, dx * 0.006), rotationRef.current);
    velocityRef.current = { x: dx * 0.85, y: dy * 0.85 };
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function pointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
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
      aria-label="Rotatable Expression Field. Select an expression from the controls below for exact text detail."
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={() => { pointerRef.current = null; }}
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
  const radius = Math.min(width, height) * 0.43;
  context.clearRect(0, 0, width, height);

  const atmosphere = context.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius * 1.18);
  atmosphere.addColorStop(0, 'rgba(30, 123, 232, .08)');
  atmosphere.addColorStop(0.62, 'rgba(18, 86, 173, .035)');
  atmosphere.addColorStop(1, 'rgba(5, 18, 35, 0)');
  context.fillStyle = atmosphere;
  context.beginPath();
  context.arc(centerX, centerY, radius * 1.18, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = 'rgba(73, 151, 245, .16)';
  context.lineWidth = 0.75;
  for (const line of gridLines) {
    context.beginPath();
    line.forEach((point, index) => {
      const projected = projectPoint(rotateVector(point, rotation), radius, centerX, centerY);
      if (index === 0) context.moveTo(projected[0], projected[1]);
      else context.lineTo(projected[0], projected[1]);
    });
    context.stroke();
  }

  for (const point of shellPoints) {
    const rotated = rotateVector(point, rotation);
    const projected = projectPoint(rotated, radius, centerX, centerY);
    const depth = (rotated[2] + 1) / 2;
    context.fillStyle = `rgba(68, 151, 255, ${0.1 + depth * 0.52})`;
    context.beginPath();
    context.arc(projected[0], projected[1], 0.55 + depth * 0.72, 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = 'rgba(83, 166, 255, .38)';
  context.lineWidth = 1;
  context.beginPath();
  context.arc(centerX, centerY, radius * 0.59, 0, Math.PI * 2);
  context.stroke();

  input.segments.length = 0;
  const layers = expressionAxisRegistry.map((definition) => {
    const axis = input.axesById.get(definition.id);
    const target = axis?.value ?? 0;
    const current = damp(input.displayedValues.get(definition.id) ?? target, target, 6.2, input.delta);
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

function buildGridLines(): Vec3[][] {
  const lines: Vec3[][] = [];
  for (const latitude of [-60, -36, -12, 12, 36, 60]) {
    const phi = latitude * Math.PI / 180;
    lines.push(Array.from({ length: 73 }, (_, index) => {
      const theta = index / 72 * Math.PI * 2;
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)] as Vec3;
    }));
  }
  for (let longitude = 0; longitude < 12; longitude += 1) {
    const theta = longitude / 12 * Math.PI * 2;
    lines.push(Array.from({ length: 73 }, (_, index) => {
      const phi = -Math.PI / 2 + index / 72 * Math.PI;
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)] as Vec3;
    }));
  }
  return lines;
}

function placePromptInComposer(prompt: string) {
  const textarea = document.querySelector<HTMLTextAreaElement>('.sovereign-composer textarea');
  if (!textarea) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(textarea, prompt);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}
