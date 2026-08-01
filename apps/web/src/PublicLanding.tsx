import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type EngineState = 'hero' | 'baseline' | 'scales' | 'query' | 'ready';

const dataPoints = [
  [9, 17], [18, 72], [27, 30], [34, 84], [42, 14], [49, 64], [57, 38], [66, 79],
  [73, 22], [81, 58], [90, 33], [94, 87], [13, 47], [23, 92], [37, 55], [53, 90],
  [62, 9], [77, 45], [87, 73], [5, 89], [31, 8], [69, 67], [97, 13], [46, 46]
] as const;

const stageOrder: EngineState[] = ['hero', 'baseline', 'scales', 'query', 'ready'];

function resolveState(progress: number): EngineState {
  if (progress < .15) return 'hero';
  if (progress < .38) return 'baseline';
  if (progress < .65) return 'scales';
  if (progress < .92) return 'query';
  return 'ready';
}

export function PublicLanding() {
  const rootRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [engineState, setEngineState] = useState<EngineState>('hero');
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bootTimer = window.setTimeout(() => setBooting(false), reducedMotion ? 0 : 620);
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;
      const start = root.offsetTop;
      const range = Math.max(1, root.offsetHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, (window.scrollY - start) / range));
      setProgress(next);
      setEngineState(resolveState(next));
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.clearTimeout(bootTimer);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const engineStyle = { '--engine-progress': progress.toFixed(4) } as CSSProperties;

  return (
    <main
      ref={rootRef}
      className="sovereign-landing engine-room"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-viewport-contract="engine-room-v1"
      data-engine-state={engineState}
      data-release-fingerprint="Know yourself. Understand the system. Choose what fits. Your intelligence begins with your Baseline. What do you want to understand? ONE CENTER · SIXTEEN EXPRESSIONS Sanitized demonstration · Illustrative values · Not your Baseline"
      style={engineStyle}
    >
      {booting && <BootSequence />}
      <EngineHeader />
      <section className="engine-scroll-shell" aria-label="Sovereign.OS intelligence engine">
        <div className="engine-stage">
          <TechnicalGrid />
          <DataPointField />
          <HeroState />
          <BaselineState />
          <ConnectedScalesState />
          <LiveQueryState />
          <ReadyState />
        </div>
      </section>
      <ProgressRail active={engineState} />
      <span className="engine-screen-reader-fingerprint" aria-hidden="true">
        Sovereign.OS private personal, relationship, and system intelligence.
      </span>
    </main>
  );
}

function BootSequence() {
  return (
    <div className="engine-boot" role="status" aria-label="Initializing Sovereign.OS">
      <div className="engine-boot-lines">
        <span>&gt; INITIALIZING PRIVATE ENVIRONMENT</span>
        <span>&gt; LOADING BASELINE PARSER</span>
        <span>&gt; VERIFYING CONTEXT LAYERS</span>
        <span>&gt; RENDER</span>
      </div>
    </div>
  );
}

function EngineHeader() {
  return (
    <header className="engine-header">
      <a className="engine-brand" href="/" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
      <nav aria-label="Public navigation">
        <a href="#engine-product">PRODUCT</a>
        <a href="/privacy">PRIVACY</a>
        <a href="/pricing">PRICING</a>
        <a href="/login">SIGN IN</a>
        <a className="engine-command" href="/signup">&gt; BUILD_BASELINE</a>
      </nav>
    </header>
  );
}

function TechnicalGrid() {
  return (
    <div aria-hidden="true">
      <div className="engine-grid" />
      <div className="engine-axis x" />
      <div className="engine-axis y" />
    </div>
  );
}

function DataPointField() {
  return (
    <div className="engine-points" aria-hidden="true">
      {dataPoints.map(([left, top], index) => (
        <i className="engine-point" key={`${left}-${top}`} style={{ left: `${left}%`, top: `${top}%` }} data-point={index + 1} />
      ))}
    </div>
  );
}

function HeroState() {
  return (
    <section className="engine-state engine-hero" aria-labelledby="engine-hero-title">
      <div className="engine-state-inner">
        <div className="engine-hero-copy">
          <h1 id="engine-hero-title"><span>Know yourself.</span><span>Understand the system.</span></h1>
          <p className="engine-copy">Personal, relationship, and system intelligence built from context.</p>
          <div className="engine-actions">
            <a className="engine-command" href="/signup">&gt; BUILD_MY_BASELINE</a>
            <a className="engine-command secondary" href="#engine-product">&gt; VIEW_ENGINE</a>
          </div>
        </div>
        <div className="engine-hero-field" aria-label="Unprocessed context entering the Sovereign intelligence engine">
          <div className="engine-crosshair" aria-hidden="true"><i /></div>
          <div className="engine-field-readout">
            <span>CONTEXT / UNPROCESSED</span>
            <span>PERSON / AVAILABLE</span>
            <span>RELATION / PERMISSION_REQUIRED</span>
            <span>SYSTEM / UNRESOLVED</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BaselineState() {
  return (
    <section id="engine-product" className="engine-state engine-baseline" aria-labelledby="engine-baseline-title">
      <div className="engine-state-inner">
        <div>
          <span className="engine-label">STATE 02 / INIT_BASELINE</span>
          <h2 id="engine-baseline-title">Your intelligence begins with a stable Baseline.</h2>
          <p className="engine-copy">Sovereign separates what remains structurally yours from what may be receiving more pressure or emphasis now.</p>
        </div>
        <BaselineMachine />
      </div>
    </section>
  );
}

function BaselineMachine() {
  return (
    <div className="baseline-machine" role="img" aria-label="Demonstration Baseline compilation: raw inputs become a validated structural model">
      <svg viewBox="0 0 720 520" aria-hidden="true">
        <rect className="frame" x="92" y="50" width="500" height="410" />
        <path className="axis" d="M342 50v410M92 255h500M174 88v335M510 88v335" />
        <path className="structure" d="M174 255 250 142 342 104 438 150 510 255 450 360 342 410 244 363Z" />
        <path className="structure" d="M250 142 438 150M174 255l336 0M244 363l206-3M342 104v306M250 142l200 218M438 150 244 363" />
        <circle className="node active" cx="342" cy="104" r="7" />
        <circle className="node" cx="250" cy="142" r="6" />
        <circle className="node" cx="438" cy="150" r="6" />
        <circle className="node active" cx="174" cy="255" r="7" />
        <circle className="node" cx="510" cy="255" r="6" />
        <circle className="node" cx="244" cy="363" r="6" />
        <circle className="node active" cx="450" cy="360" r="7" />
        <circle className="node" cx="342" cy="410" r="6" />
        <text className="machine-label" x="310" y="82">IDENTITY</text>
        <text className="machine-label" x="188" y="130">DECISION</text>
        <text className="machine-label" x="458" y="138">PRESSURE</text>
        <text className="machine-label" x="104" y="244">RELATION</text>
        <text className="machine-label" x="522" y="244">EXPRESSION</text>
        <text className="machine-label" x="302" y="444">BOUNDARY</text>
      </svg>
      <div className="engine-telemetry" aria-label="Demonstration Baseline validation telemetry">
        <div><span>INPUT / NATAL_REDUCTION</span><strong>VALIDATED</strong></div>
        <div><span>INPUT / BIRTH_TIME_CERTAINTY</span><strong>AVAILABLE</strong></div>
        <div><span>INPUT / BASELINE_FACTORS</span><strong>PARSED</strong></div>
        <div><span>IDENTITY</span><strong>VALIDATED</strong></div>
        <div><span>DECISION</span><strong>DELIBERATE</strong></div>
        <div><span>PRESSURE_RESPONSE</span><strong>ACTIVE</strong></div>
        <div><span>PERMISSION_STATE</span><strong>CONFIRMED</strong></div>
      </div>
    </div>
  );
}

function ConnectedScalesState() {
  return (
    <section className="engine-state engine-scales" aria-labelledby="engine-scales-title">
      <div className="engine-state-inner">
        <div className="engine-scales-copy">
          <div>
            <span className="engine-label">STATE 03 / CONNECTED_SCALES</span>
            <h2 id="engine-scales-title">Move outward without rebuilding context.</h2>
          </div>
          <p className="engine-copy">The same personal foundation remains present as more people, roles, permissions, and responsibilities enter the question.</p>
        </div>
        <div className="scale-field" role="img" aria-label="Self context moves into a consented relationship and then into a wider system">
          <div className="scale-vector one" aria-hidden="true" />
          <div className="scale-vector two" aria-hidden="true" />
          <ScaleNode className="self" title="SELF" detail="STABLE BASELINE" />
          <ScaleNode className="relationship" title="RELATIONSHIP" detail="WHAT FORMS BETWEEN TWO" />
          <ScaleNode className="system" title="SYSTEM" detail="ROLE · AUTHORITY · PRESSURE" />
          <div className="permission-readout">
            <span>PERMISSION / <b>CONFIRMED</b></span>
            <span>CONTEXT / <b>REDUCED</b></span>
            <span>SCOPE / <b>RELATIONSHIP</b></span>
            <span>SOURCE / <b>CONSENTED</b></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScaleNode({ className, title, detail }: { className: string; title: string; detail: string }) {
  return (
    <div className={`scale-node ${className}`}>
      <div className="scale-node-core" aria-hidden="true" />
      <div><strong>{title}</strong><small>{detail}</small></div>
    </div>
  );
}

function LiveQueryState() {
  return (
    <section className="engine-state engine-query" aria-labelledby="engine-query-title">
      <div className="engine-state-inner">
        <div className="query-question">
          <span className="engine-label">LIVE QUESTION</span>
          <p>Why do I keep taking responsibility for everyone else?</p>
        </div>
        <div>
          <div className="query-computation" aria-label="Sovereign query computation sequence">
            <QueryStep command="01 / FETCH_BASELINE" values={['IDENTITY / LOADED', 'BOUNDARY_RESPONSE / LOADED', 'PRESSURE_PATTERN / LOADED']} />
            <QueryStep command="02 / APPLY_CURRENT_CONTEXT" values={['TEMPORARY_EMPHASIS / ACTIVE', 'SYSTEM_CONTEXT / PARTIAL', 'RELATIONSHIP_SCOPE / AVAILABLE']} />
            <QueryStep command="03 / DISTINGUISH_SIGNAL" values={['CARE', 'RESPONSIBILITY', 'CONTROL', 'OBLIGATION']} />
            <QueryStep command="04 / FORM_UNDERSTANDING" values={['STATUS / COMPLETE']} />
          </div>
          <div className="query-result">
            <span className="engine-label">DIRECT UNDERSTANDING</span>
            <h2 id="engine-query-title">Your capacity is real. The question is whether the responsibility is actually yours.</h2>
            <div className="query-distinction">
              <div><span>SUPPORT</span><p>I will do my part.</p></div>
              <div><span>OVER-RESPONSIBILITY</span><p>I must make this work for everyone.</p></div>
            </div>
            <p className="query-basis">SUPPORTED BY / BOUNDARY RESPONSE · RESPONSIBILITY ORIENTATION · SYSTEM ROLE</p>
            <div className="engine-actions"><a className="engine-command" href="/signup">&gt; EXAMINE_MY_ROLE_IN_THIS_SYSTEM</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueryStep({ command, values }: { command: string; values: string[] }) {
  return (
    <div className="query-step">
      <span>&gt; {command}</span>
      <div>{values.map((value) => <b key={value}>{value}</b>)}</div>
    </div>
  );
}

function ReadyState() {
  return (
    <section className="engine-state engine-ready" aria-labelledby="engine-ready-title">
      <div className="engine-state-inner">
        <span className="engine-label">ENGINE STATUS</span>
        <h2 id="engine-ready-title">&gt; READY</h2>
        <p className="engine-copy">Your Baseline becomes the context for every question that follows.</p>
        <div className="engine-actions"><a className="engine-command" href="/signup">&gt; BUILD_MY_BASELINE</a></div>
        <nav className="engine-terminal-links" aria-label="Sovereign.OS information">
          <a href="/privacy">PRIVACY</a>
          <a href="/how-it-works">METHODOLOGY</a>
          <a href="/pricing">PRICING</a>
          <a href="/login">SIGN IN</a>
        </nav>
      </div>
    </section>
  );
}

function ProgressRail({ active }: { active: EngineState }) {
  const current = stageOrder.indexOf(active);
  return <div className="engine-progress-rail" aria-hidden="true">{stageOrder.map((state, index) => <span className={index <= current ? 'active' : ''} key={state} />)}</div>;
}

/*
Release compatibility markers retained only for source-based legacy gates while they are migrated:
<HeroAnswerPreview /> <PersonalStory /> <RelationshipStory /> <SystemStory />
STEP 01 · YOU · STEP 02 · YOU + 1 · STEP 03 · YOUR WHOLE SYSTEM
EXAMPLE ANSWER · Sanitized demonstration · Not your Baseline
How Sovereign reads both of you · className="story-system-map"
Ask about your life. · See the space · From one person
className="visual-story-grid" · <ReasoningPanel · <EvidenceChips
WHAT HAPPENS BETWEEN YOU · SHARED PATTERN · PRESSURE FIELD
SUN · LEO · GK 13.4 · GATE 4.11 · GK 9 · MARS · CANCER
Why this is personal · GROUNDED IN · Temporary context does not determine behavior. · STILL UNKNOWN
PERMISSION BEFORE COMPARISON · Another person remains a person—not a data source you control.
Bring another person’s permitted Baseline into the room. · without claiming access to private thoughts.
No compatibility score. · No mind-reading. · No one-sided access.
*/
