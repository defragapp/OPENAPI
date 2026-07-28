import { useState } from 'react';

const stages = ['Baseline', 'Question', 'Connection', 'Insight'] as const;

export function BaselineOrbit({ compact = false }: { compact?: boolean }) {
  const [stage, setStage] = useState(3);

  return (
    <div
      className={`baseline-orbit ${compact ? 'baseline-orbit-compact' : ''}`}
      style={compact ? { minHeight: 500 } : undefined}
      aria-label="Example of the Baseline Core used inside Sovereign.OS"
    >
      <header>
        <div><span className="orbit-mark" aria-hidden="true" /><strong>YOUR BASELINE CORE</strong></div>
        <span>{compact ? 'PERSONAL FOUNDATION' : 'EXAMPLE · YOUR DESIGN WILL BE PERSONAL'}</span>
      </header>
      {!compact && <div className="orbit-stages" aria-label="Example interpretation stages">
        {stages.map((label, index) => <button type="button" key={label} className={stage === index ? 'active' : ''} aria-pressed={stage === index} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}
      </div>}
      <div className={`orbit-map orbit-stage-${stage}`} aria-hidden="true">
        <div className="orbit-ring orbit-ring-outer" />
        <div className="orbit-ring orbit-ring-inner" />
        <div className="orbit-node orbit-node-core"><span>HOW YOU PROCESS</span><strong>Names what matters through direct clarity</strong></div>
        <div className="orbit-node orbit-node-light"><span>CLEARER EXPRESSION</span><strong>Leads without carrying every role</strong></div>
        <div className="orbit-node orbit-node-shadow"><span>UNDER PRESSURE</span><strong>Withdraws and tries to hold everything alone</strong></div>
        <div className="orbit-node orbit-node-aligned"><span>CURRENT EMPHASIS</span><strong>Boundaries and shared responsibility</strong></div>
        <div className="orbit-center"><span>CORE ORIENTATION</span><strong>Self-directed<br />clarity</strong><small>steady Baseline</small></div>
      </div>
      <div className="orbit-layer-key" aria-label="Baseline and current context legend">
        <span><i className="steady" />Steady design</span>
        <span><i className="current" />Current emphasis</span>
      </div>
      {!compact && stage > 0 && (
        <>
          <article className="orbit-question">
            <span>A REAL QUESTION</span>
            <p>Why do I feel responsible for everything, then disappear when I need support?</p>
          </article>
          {stage > 1 && <article className="orbit-answer">
            <div><span>BASELINE CONNECTION</span><p>Self-direction can support courage and leadership. Under pressure, accepting help may feel like losing authority.</p></div>
            {stage > 2 && <div><span>POSSIBLE INSIGHT</span><strong>What changes when support is shared without asking you to surrender your voice?</strong></div>}
          </article>}
        </>
      )}
      <footer>
        <span>Baseline core</span><i>+</i><span>pressure response</span><i>+</i><span>aligned expression</span><i>+</i><span>current context</span>
      </footer>
    </div>
  );
}
