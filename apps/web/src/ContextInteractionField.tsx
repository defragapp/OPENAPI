import { useEffect, useId, useMemo, useRef, useState } from 'react';

export type ContextFieldNode = {
  id: string;
  label: string;
  meta: string;
  detail: string;
  tone?: 'cream' | 'sage' | 'warm';
};

export type ContextFieldConnection = {
  from: string;
  to: string;
};

type ContextFieldMode = 'self' | 'relationship' | 'system';

type ContextInteractionFieldProps = {
  mode: ContextFieldMode;
  nodes: readonly ContextFieldNode[];
  centerLabel: string;
  centerMeta: string;
  centerDetail: string;
  compact?: boolean;
  className?: string;
  connections?: readonly ContextFieldConnection[];
  activeConnection?: ContextFieldConnection;
  onNodeSelect?: (id: string) => void;
};

type FieldPosition = { x: number; y: number };
type FieldRay = { x1: number; y1: number; x2: number; y2: number; strength: number };

const SELF_POSITIONS: readonly FieldPosition[] = [{ x: 500, y: 128 }];
const RELATIONSHIP_POSITIONS: readonly FieldPosition[] = [{ x: 250, y: 128 }, { x: 750, y: 128 }];
const SYSTEM_POSITIONS: readonly FieldPosition[] = [
  { x: 500, y: 72 },
  { x: 820, y: 205 },
  { x: 500, y: 358 },
  { x: 180, y: 205 },
  { x: 310, y: 338 },
  { x: 690, y: 338 }
];

const MAX_NODES: Record<ContextFieldMode, number> = { self: 1, relationship: 2, system: 6 };
const SELF_CENTER = { x: 500, y: 128 } as const;
const SYSTEM_CENTER = { x: 500, y: 220 } as const;

export function ContextInteractionField({
  mode,
  nodes,
  centerLabel,
  centerMeta,
  centerDetail,
  compact = false,
  className = '',
  connections = [],
  activeConnection,
  onNodeSelect
}: ContextInteractionFieldProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(false);
  const instanceId = useId().replaceAll(':', '');
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState('center');
  const fieldNodes = useMemo(() => nodes.slice(0, MAX_NODES[mode]), [mode, nodes]);
  const positions = mode === 'self'
    ? SELF_POSITIONS
    : mode === 'relationship'
      ? RELATIONSHIP_POSITIONS
      : SYSTEM_POSITIONS;
  const center = mode === 'system' ? SYSTEM_CENTER : SELF_CENTER;
  const viewBoxHeight = mode === 'system' ? 430 : 260;
  const selectedNode = fieldNodes.find((node) => node.id === selectedId);
  const selectedLabel = selectedNode?.label ?? centerLabel;
  const selectedMeta = selectedNode?.meta ?? centerMeta;
  const selectedDetail = selectedNode?.detail ?? centerDetail;
  const stageLabel = mode === 'self' ? 'Stable self · changing context' : 'Distinct people · shared context';
  const raySets = useMemo(
    () => fieldNodes.map((_, index) => buildFieldRays(positions[index] ?? center, index, mode)),
    [fieldNodes, mode, positions, center]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || visibleRef.current) return;
    if (!('IntersectionObserver' in window)) {
      visibleRef.current = true;
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      visibleRef.current = true;
      setVisible(true);
      observer.disconnect();
    }, { threshold: 0.28, rootMargin: '40px 0px' });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  function select(id: string) {
    setSelectedId(id);
    onNodeSelect?.(id);
  }

  return (
    <figure
      ref={rootRef}
      className={`context-interaction-field context-field-${mode}${compact ? ' context-field-compact' : ''}${className ? ` ${className}` : ''}`}
      data-field-visible={visible ? 'true' : 'false'}
    >
      <div className="context-field-stage">
        <svg viewBox={`0 0 1000 ${viewBoxHeight}`} role="img" aria-label={`${centerLabel}. Select a label below to inspect each distinct part of the context.`}>
          <defs>
            <filter id={`context-field-glow-${instanceId}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id={`context-field-core-${instanceId}`}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.22" stopColor="#a9d8ff" />
              <stop offset="0.58" stopColor="#368eff" stopOpacity="0.52" />
              <stop offset="1" stopColor="#368eff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="context-field-grid" aria-hidden="true">
            <path d={`M40 ${center.y} H960`} />
            <path d={`M500 24 V${viewBoxHeight - 24}`} />
          </g>

          {mode === 'relationship' && fieldNodes.length === 2 && (
            <g className={`context-field-connection${selectedId === 'center' ? ' is-active' : ''}`} aria-hidden="true">
              <line x1={positions[0]!.x} y1={positions[0]!.y} x2={positions[1]!.x} y2={positions[1]!.y} />
              <circle cx={positions[0]!.x} cy={positions[0]!.y} r="3" />
            </g>
          )}

          {mode === 'system' && fieldNodes.map((node, index) => {
            const position = positions[index] ?? center;
            return <line key={`connection-${node.id}`} className={`context-field-system-line${selectedId === node.id || selectedId === 'center' ? ' is-active' : ''}`} x1={center.x} y1={center.y} x2={position.x} y2={position.y} aria-hidden="true" />;
          })}

          {mode === 'system' && connections.map((connection, index) => {
            const fromIndex = fieldNodes.findIndex((node) => node.id === connection.from);
            const toIndex = fieldNodes.findIndex((node) => node.id === connection.to);
            const from = positions[fromIndex];
            const to = positions[toIndex];
            if (!from || !to) return null;
            const active = activeConnection
              ? activeConnection.from === connection.from && activeConnection.to === connection.to
              : selectedId === connection.from || selectedId === connection.to;
            return <line key={`edge-${connection.from}-${connection.to}-${index}`} className={`context-field-system-edge${active ? ' is-active' : ''}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} aria-hidden="true" />;
          })}

          {fieldNodes.map((node, index) => {
            const position = positions[index] ?? center;
            const active = selectedId === 'center' || selectedId === node.id;
            return (
              <g key={node.id} className={`context-field-origin context-field-tone-${node.tone ?? 'cream'}${active ? ' is-active' : ''}`} aria-hidden="true">
                <g className="context-field-rays">
                  {raySets[index]?.map((ray, rayIndex) => (
                    <line
                      key={`${node.id}-ray-${rayIndex}`}
                      x1={ray.x1}
                      y1={ray.y1}
                      x2={ray.x2}
                      y2={ray.y2}
                      style={{ opacity: ray.strength }}
                    />
                  ))}
                </g>
                <circle className="context-field-halo" cx={position.x} cy={position.y} r="34" fill={`url(#context-field-core-${instanceId})`} />
                <circle className="context-field-core" cx={position.x} cy={position.y} r="4" filter={`url(#context-field-glow-${instanceId})`} />
              </g>
            );
          })}

          {mode === 'system' && (
            <g className={`context-field-system-center${selectedId === 'center' ? ' is-active' : ''}`} aria-hidden="true">
              <circle cx={center.x} cy={center.y} r="46" />
              <circle cx={center.x} cy={center.y} r="5" />
            </g>
          )}
        </svg>
        <span className="context-field-stage-label" aria-hidden="true">{stageLabel}</span>
      </div>

      <figcaption>
        <div className="context-field-options" aria-label="Inspect the context shown">
          {fieldNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              aria-pressed={selectedId === node.id}
              data-tone={node.tone ?? 'cream'}
              onClick={() => select(node.id)}
            >
              <i aria-hidden="true" />
              <span><strong>{node.label}</strong><small>{node.meta}</small></span>
            </button>
          ))}
          <button type="button" aria-pressed={selectedId === 'center'} onClick={() => select('center')}>
            <i aria-hidden="true" />
            <span><strong>{centerLabel}</strong><small>{centerMeta}</small></span>
          </button>
        </div>
        <p className="context-field-detail" aria-live="polite">
          <span>{selectedLabel} · {selectedMeta}</span>
          {selectedDetail}
        </p>
      </figcaption>
    </figure>
  );
}

export function buildFieldRays(position: FieldPosition, seed: number, mode: ContextFieldMode): FieldRay[] {
  const count = mode === 'system' ? 24 : 34;
  const radiusScale = mode === 'system' ? 0.72 : 1;
  return Array.from({ length: count }, (_, index) => {
    const angle = ((index * 137.508 + seed * 31.7) % 360) * Math.PI / 180;
    const start = 5 + ((index * 7 + seed) % 7);
    const length = (31 + ((index * 19 + seed * 13) % 72)) * radiusScale;
    return {
      x1: round(position.x + Math.cos(angle) * start),
      y1: round(position.y + Math.sin(angle) * start),
      x2: round(position.x + Math.cos(angle) * length),
      y2: round(position.y + Math.sin(angle) * length),
      strength: 0.22 + ((index * 11 + seed * 5) % 68) / 100
    };
  });
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
