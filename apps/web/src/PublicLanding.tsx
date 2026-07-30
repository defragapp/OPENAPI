import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const heroAnswer = {
  question: 'Why do I keep taking responsibility for everyone else?',
  direct: 'Your capacity is real. The question is whether the responsibility is actually yours.',
  connection: 'The issue may not be whether you care. It may be where care becomes responsibility for outcomes that belong to other people.',
  experiment: 'Before taking it on, ask: “Am I being asked to lead—or only to absorb the uncertainty?”'
} as const;

const basisFixture = [
  { compact: 'U✓', label: 'User-confirmed experience' },
  { compact: 'HD G13.1', label: 'Human Design personality gate 13, line 1' },
  { compact: 'GK ACT13', label: 'Gene Keys activation number 13' },
  { compact: 'N LP1', label: 'Numerology life path 1' },
  { compact: '☉ CAN 04.2°', label: 'Natal Sun, Cancer, 4.2 degrees' },
  { compact: 'LIVE ♄ ARI 02.3°R', label: 'Live Saturn, Aries, 2.3 degrees, retrograde' }
] as const;

const enginePoints = [
  [8, 18, 0.2], [17, 72, 0.8], [25, 34, 1.4], [31, 83, 0.5],
  [39, 14, 1.1], [47, 62, 1.8], [54, 28, 0.3], [61, 77, 1.2],
  [69, 16, 1.6], [76, 55, 0.7], [84, 31, 1.3], [91, 74, 0.1],
  [13, 48, 1.9], [35, 49, 0.9], [58, 46, 1.5], [81, 87, 0.4]
] as const;

type EngineVariables = CSSProperties & {
  '--engine-progress': string;
  '--hero-opacity': string;
  '--baseline-opacity': string;
  '--scale-opacity': string;
  '--query-opacity': string;
  '--terminal-opacity': string;
  '--baseline-progress': string;
  '--scale-progress': string;
  '--query-progress': string;
};

export function PublicLanding() {
  const rootRef = useRef<HTMLElement>(null);
  const [booting, setBooting] = useState(true);
  const [selectedScale, setSelectedScale] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setBooting(false);
      return;
    }
    const timer = window.setTimeout(() => setBooting(false), 620);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / travel);
      const style = root.style;

      style.setProperty('--engine-progress', progress.toFixed(4));
      style.setProperty('--hero-opacity', windowed(progress, 0, 0.22, 0.08, true).toFixed(4));
      style.setProperty('--baseline-opacity', windowed(progress, 0.12, 0.46, 0.1).toFixed(4));
      style.setProperty('--scale-opacity', windowed(progress, 0.36, 0.7, 0.1).toFixed(4));
      style.setProperty('--query-opacity', windowed(progress, 0.6, 0.93, 0.1).toFixed(4));
      style.setProperty('--terminal-opacity', windowed(progress, 0.88, 1, 0.08, false, true).toFixed(4));
      style.setProperty('--baseline-progress', phaseProgress(progress, 0.12, 0.46).toFixed(4));
      style.setProperty('--scale-progress', phaseProgress(progress, 0.36, 0.7).toFixed(4));
      style.setProperty('--query-progress', phaseProgress(progress, 0.6, 0.93).toFixed(4));
      root.dataset.engineState = progress < 0.16
        ? 'hero'
        : progress < 0.41
          ? 'baseline'
          : progress < 0.65
            ? 'scales'
            : progress < 0.9
              ? 'query'
              : 'terminal';
    };

    const requestUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main
      ref={rootRef}
      className="sovereign-landing engine-room"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-engine-state="hero"
      style={{
        '--engine-progress': '0',
        '--hero-opacity': '1',
        '--baseline-opacity': '0',
        '--scale-opacity': '0',
        '--query-opacity': '0',
        '--terminal-opacity': '0',
        '--baseline-progress': '0',
        '--scale-progress': '0',
        '--query-progress': '0'
      } as EngineVariables}
    >
      {booting && <BootSequence />}
      <EngineHeader />
      <section className="engine-scroll-shell" aria-label="Sovereign.OS intelligence engine">
        <div className="engine-stage">
          <TechnicalGrid />
          <DataPointField />
          <HeroIntelligenceStage />
          <BaselineContextStage />
          <ConnectedScalesStage selected={selectedScale} onSelect={setSelectedScale} />
          <PublicAnswerStage />
          <TerminalStage />
          <EngineProgress />
        </div>
        <span id="top" className="engine-anchor engine-anchor-top" />
        <span id="baseline" className="engine-anchor engine-anchor-baseline" />
        <span id="scales" className="engine-anchor engine-anchor-scales" />
        <span id="answer" className="engine-anchor engine-anchor-answer" />
        <span id="ready" className="engine-anchor engine-anchor-ready" />
      </section>
      <noscript>
        <section className="engine-noscript">
          <h1>Know yourself. Understand the system. Choose what fits.</h1>
          <p>Sovereign.OS is a private AI for understanding yourself, your relationships, and the systems around you. Build your Baseline once, then ask naturally.</p>
          <a href="/signup">Build my Baseline</a>
        </section>
      </noscript>
    </main>
  );
}

function BootSequence() {
  return (
    <div className="engine-boot" role="status" aria-label="Loading Sovereign.OS">
      <span>&gt; INITIALIZING PRIVATE ENVIRONMENT</span>
      <span>&gt; LOADING BASELINE PARSER</span>
      <span>&gt; VERIFYING CONTEXT LAYERS</span>
      <span>&gt; RENDER</span>
    </div>
  );
}

function EngineHeader() {
  return (
    <header className="engine-header">
      <a className="engine-wordmark" href="#top" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
      <nav aria-label="Public navigation">
        <a href="/how-it-works">PRODUCT</a>
        <a href="/privacy">PRIVACY</a>
        <a href="/pricing">PRICING</a>
        <a href="/login">SIGN IN</a>
        <a className="engine-command engine-command-primary" href="/signup" aria-label="Build my Baseline">&gt; BUILD_BASELINE</a>
      </nav>
    </header>
  );
}

function TechnicalGrid() {
  return <div className="engine-grid" aria-hidden="true" />;
}

function DataPointField() {
  return (
    <div className="engine-points" aria-hidden="true">
      {enginePoints.map(([left, top, delay], index) => (
        <span
          key={`${left}-${top}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
            '--point-index': index
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

function HeroIntelligenceStage() {
  return (
    <section className="engine-layer engine-hero" aria-labelledby="landing-title">
      <div className="engine-hero-copy">
        <p className="engine-mode">PERSONAL / RELATIONSHIP / SYSTEM INTELLIGENCE</p>
        <h1 id="landing-title">KNOW YOURSELF.<br />UNDERSTAND THE SYSTEM.</h1>
        <p className="engine-hero-fit">Choose what fits.</p>
        <p className="engine-hero-body">Sovereign.OS is a private AI for understanding yourself, your relationships, and the systems around you. Build your Baseline once, then ask naturally and receive an answer grounded in the person asking.</p>
        <div className="engine-actions">
          <a className="engine-command engine-command-primary" href="/signup" aria-label="Build my Baseline">&gt; BUILD_MY_BASELINE</a>
          <a className="engine-command" href="#answer" aria-label="See a Sovereign answer">&gt; SEE_A_SOVEREIGN_ANSWER</a>
        </div>
        <small>Start free · No card required · Review, correct, or reject any interpretation</small>
      </div>
      <div className="engine-init" aria-hidden="true">&gt; INIT_BASELINE</div>
    </section>
  );
}

function BaselineContextStage() {
  return (
    <section className="engine-layer engine-baseline" aria-labelledby="foundation-title">
      <div className="engine-copy-block">
        <p className="engine-mode">BASELINE / COMPILE</p>
        <h2 id="foundation-title">Your intelligence begins with your Baseline.</h2>
        <p>Sovereign separates what remains structurally yours from what may be receiving more pressure or emphasis now.</p>
        <small>Temporary context does not determine behavior.</small>
      </div>

      <div className="baseline-machine" aria-label="Conceptual Baseline compilation from demonstration inputs">
        <svg viewBox="0 0 760 560" role="img" aria-labelledby="baseline-diagram-title baseline-diagram-desc">
          <title id="baseline-diagram-title">Baseline compilation schematic</title>
          <desc id="baseline-diagram-desc">Demonstration inputs converge into a stable personal structure with identity, decision, pressure, relationship, expression, and boundary dimensions.</desc>
          <g className="machine-axis">
            <path d="M380 36V524" />
            <path d="M66 280H694" />
            <path d="M150 86L610 474" />
            <path d="M610 86L150 474" />
          </g>
          <g className="machine-frame">
            <path d="M380 76L628 280L380 484L132 280Z" />
            <path d="M380 144L544 280L380 416L216 280Z" />
            <circle cx="380" cy="280" r="72" />
          </g>
          <g className="machine-flow">
            <path d="M92 280H308" />
            <path d="M452 280H668" />
            <path d="M380 64V208" />
            <path d="M380 352V500" />
          </g>
          <g className="machine-nodes">
            {[
              [380, 76], [628, 280], [380, 484], [132, 280],
              [380, 144], [544, 280], [380, 416], [216, 280],
              [380, 280]
            ].map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index === 8 ? 12 : 7} />)}
          </g>
        </svg>
        <div className="machine-label label-identity">IDENTITY</div>
        <div className="machine-label label-decision">DECISION</div>
        <div className="machine-label label-pressure">PRESSURE</div>
        <div className="machine-label label-relation">RELATION</div>
        <div className="machine-label label-expression">EXPRESSION</div>
        <div className="machine-label label-boundary">BOUNDARY</div>
      </div>

      <div className="baseline-telemetry" aria-label="Demonstration telemetry">
        <header><span>INPUT / DEMONSTRATION</span><strong>STATUS / VALIDATED</strong></header>
        <code>INPUT / NATAL_REDUCTION</code>
        <code>INPUT / BIRTH_TIME_CERTAINTY</code>
        <code>INPUT / BASELINE_FACTORS</code>
        <code>STABLE_CONTEXT / COMPILED</code>
        <code>STILL UNKNOWN / ACTUAL RESPONSE TODAY</code>
      </div>

      <details className="engine-basis">
        <summary>Why this is personal · {basisFixture.length} supporting values</summary>
        <div>
          {basisFixture.map((value) => <span key={value.compact}><b>{value.compact}</b><small>{value.label}</small></span>)}
        </div>
      </details>
    </section>
  );
}

function ConnectedScalesStage({ selected, onSelect }: { selected: number; onSelect: (index: number) => void }) {
  const scales = [
    ['SELF', 'What remains structurally yours.'],
    ['RELATIONSHIP', 'What forms between two permitted people.'],
    ['SYSTEM', 'Where roles, authority, reliance, responsibility, and pressure move.']
  ] as const;

  return (
    <section className="engine-layer engine-scales" aria-labelledby="scale-title">
      <div className="engine-copy-block engine-scale-copy">
        <p className="engine-mode">ONE INTELLIGENCE · THREE CONNECTED SCALES</p>
        <h2 id="scale-title">The question changes. The environment stays the same.</h2>
        <p>Move from yourself to a relationship or wider system without rebuilding context from the beginning.</p>
      </div>

      <div className="scale-machine">
        <svg viewBox="0 0 920 360" role="img" aria-label="Context moving from self to relationship to system">
          <g className="scale-rail">
            <path d="M120 180H800" />
            <path className="scale-flow" d="M120 180H800" />
          </g>
          <g className="scale-structure self-structure">
            <path d="M120 112L186 180L120 248L54 180Z" />
            <circle cx="120" cy="180" r="12" />
          </g>
          <g className="scale-structure relationship-structure">
            <path d="M460 104L536 180L460 256L384 180Z" />
            <circle cx="430" cy="180" r="10" />
            <circle cx="490" cy="180" r="10" />
            <path d="M440 180H480" />
          </g>
          <g className="scale-structure system-structure">
            <path d="M800 96L886 180L800 264L714 180Z" />
            <circle cx="770" cy="152" r="8" />
            <circle cx="830" cy="152" r="8" />
            <circle cx="770" cy="208" r="8" />
            <circle cx="830" cy="208" r="8" />
            <path d="M770 152L830 208M830 152L770 208M770 152H830M770 208H830" />
          </g>
        </svg>
        <div className="scale-label scale-label-self"><span>01</span><strong aria-label="Yourself">SELF</strong></div>
        <div className="scale-label scale-label-relationship"><span>02</span><strong>RELATIONSHIP</strong></div>
        <div className="scale-label scale-label-system"><span>03</span><strong>SYSTEM</strong></div>
        <div className="permission-overlay">
          <span>PERMISSION / CONFIRMED</span>
          <span>CONTEXT / REDUCED</span>
          <span>SCOPE / RELATIONSHIP</span>
          <span>SOURCE / CONSENTED</span>
        </div>
      </div>

      <div className="scale-selector" role="tablist" aria-label="Sovereign intelligence scales">
        {scales.map(([label], index) => (
          <button
            key={label}
            id={`engine-scale-tab-${index}`}
            role="tab"
            aria-selected={selected === index}
            aria-controls="engine-scale-panel"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => onSelect(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div id="engine-scale-panel" className="scale-panel" role="tabpanel" aria-labelledby={`engine-scale-tab-${selected}`}>
        <strong>{scales[selected]![0]}</strong>
        <p>{scales[selected]![1]}</p>
      </div>

      <SystemMap />
      <p className="engine-trust">PERMISSION BEFORE COMPARISON · Another person remains a person—not a data source you control.</p>
      <p className="engine-trust">No compatibility score. No mind-reading. No one-sided access to another person’s Baseline.</p>
    </section>
  );
}

function SystemMap() {
  return (
    <div className="engine-system-map" aria-label="Demonstration system context">
      <span className="system-person person-you"><b>YOU</b><small>pressure carrier</small></span>
      <span className="system-person person-parent"><b>PARENT</b><small>formal authority</small></span>
      <span className="system-person person-sibling"><b>SIBLING</b><small>reliance</small></span>
      <i className="system-line line-one" aria-hidden="true" />
      <i className="system-line line-two" aria-hidden="true" />
      <strong>RESPONSIBILITY CONCENTRATION / YOU</strong>
    </div>
  );
}

function PublicAnswerStage() {
  const steps = [
    ['01', '> FETCH_BASELINE', 'IDENTITY / LOADED · BOUNDARY_RESPONSE / LOADED · PRESSURE_PATTERN / LOADED'],
    ['02', '> APPLY_CURRENT_CONTEXT', 'TEMPORARY_EMPHASIS / ACTIVE · SYSTEM_CONTEXT / PARTIAL'],
    ['03', '> DISTINGUISH_SIGNAL', 'CARE / RESPONSIBILITY / CONTROL / OBLIGATION'],
    ['04', '> FORM_UNDERSTANDING', 'ANSWER / READY']
  ] as const;

  return (
    <section className="engine-layer engine-query" aria-labelledby="questions-title">
      <div className="query-question">
        <p className="engine-mode">A REAL QUESTION · A PERSONAL ANSWER</p>
        <small>EXAMPLE ANSWER · Sanitized demonstration · Not your Baseline</small>
        <h2 id="questions-title">“{heroAnswer.question}”</h2>
        <p>Useful language first. Exact support when you want it.</p>
      </div>

      <div className="query-computation" aria-live="polite">
        <ol>
          {steps.map(([number, command, telemetry]) => (
            <li key={number}>
              <span>{number}</span>
              <div><strong>{command}</strong><small>{telemetry}</small></div>
            </li>
          ))}
        </ol>

        <article className="query-answer">
          <span>DIRECT ANSWER</span>
          <h3>{heroAnswer.direct}</h3>
          <p>{heroAnswer.connection}</p>
          <div className="answer-distinction">
            <span><small>SUPPORT</small><strong>I will do my part.</strong></span>
            <span><small>OVER-RESPONSIBILITY</small><strong>I must make this work for everyone.</strong></span>
          </div>
          <aside><strong>A PRACTICAL NEXT STEP</strong><p>{heroAnswer.experiment}</p></aside>
          <div className="answer-basis"><b>SUPPORTED BY</b><span>Boundary response</span><span>Responsibility orientation</span><span>System role</span></div>
          <a className="engine-command" href="/signup">&gt; EXAMINE_MY_ROLE_IN_THIS_SYSTEM</a>
        </article>
      </div>
    </section>
  );
}

function TerminalStage() {
  return (
    <section className="engine-layer engine-terminal" aria-labelledby="terminal-title">
      <p className="engine-status">&gt; READY</p>
      <h2 id="terminal-title">Your Baseline becomes the context for every question that follows.</h2>
      <p>Know yourself. Understand the system. Choose what fits.</p>
      <div className="engine-actions">
        <a className="engine-command engine-command-primary terminal-command" href="/signup" aria-label="Build my Baseline">&gt; BUILD_MY_BASELINE<span aria-hidden="true">_</span></a>
        <a className="engine-command" href="/login">&gt; SIGN_IN</a>
      </div>
      <div className="terminal-meta">
        <span>SOVEREIGN+ / $20 MONTHLY / $99 YEARLY</span>
        <nav aria-label="Footer navigation">
          <a href="/privacy">PRIVACY</a>
          <a href="/how-it-works">METHODOLOGY</a>
          <a href="/pricing">PRICING</a>
          <a href="/faq">QUESTIONS</a>
        </nav>
      </div>
    </section>
  );
}

function EngineProgress() {
  return (
    <aside className="engine-progress" aria-hidden="true">
      <span>00</span>
      <i />
      <span>100</span>
    </aside>
  );
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function phaseProgress(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start));
}

function windowed(
  value: number,
  start: number,
  end: number,
  fade: number,
  visibleAtStart = false,
  visibleAtEnd = false
) {
  const fadeIn = visibleAtStart ? 1 : clamp((value - start) / fade);
  const fadeOut = visibleAtEnd ? 1 : clamp((end - value) / fade);
  return Math.min(fadeIn, fadeOut);
}
