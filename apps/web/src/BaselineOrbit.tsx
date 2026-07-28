export function BaselineOrbit({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`baseline-orbit ${compact ? 'baseline-orbit-compact' : ''}`}
      style={compact ? { minHeight: 500 } : undefined}
      aria-label="Example of the Baseline Core used inside Sovereign.OS"
    >
      <header>
        <div><span className="orbit-mark" aria-hidden="true" /><strong>YOUR BASELINE CORE · A REAL QUESTION</strong></div>
        <span>{compact ? 'PERSONAL FOUNDATION' : 'EXAMPLE · YOUR DESIGN WILL BE PERSONAL'}</span>
      </header>
      {!compact && <p className="orbit-summary">A question activates the most relevant qualities, then shows how the interpretation connects back to your Baseline.</p>}
      <div className="orbit-map" aria-hidden="true">
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
      {!compact && (
        <>
          <article className="orbit-question">
            <span>A REAL QUESTION</span>
            <p>Why do I feel responsible for everything, then disappear when I need support?</p>
          </article>
          <article className="orbit-answer">
            <div><span>WHY THIS APPEARS</span><p>Self-direction can support courage and leadership. Under pressure, asking for help may feel like surrendering authority.</p></div>
            <div><span>WHAT TO EXAMINE</span><strong>What changes when support is shared without asking you to surrender your voice?</strong></div>
          </article>
        </>
      )}
      <footer>
        <span>Baseline core</span><i>+</i><span>pressure response</span><i>+</i><span>aligned expression</span><i>+</i><span>current context</span>
      </footer>
    </div>
  );
}
