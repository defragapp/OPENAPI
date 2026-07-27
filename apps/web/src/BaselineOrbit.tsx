export function BaselineOrbit({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`baseline-orbit ${compact ? 'baseline-orbit-compact' : ''}`} aria-label="Example Baseline Design card">
      <header>
        <div><span className="orbit-mark">S</span><strong>YOUR BASELINE</strong></div>
        <span>{compact ? 'PERSONAL CONTEXT' : 'EXAMPLE · YOUR EXPERIENCE WILL DIFFER'}</span>
      </header>
      <div className="orbit-map" aria-hidden="true">
        <div className="orbit-ring orbit-ring-outer" />
        <div className="orbit-ring orbit-ring-inner" />
        <div className="orbit-node orbit-node-core"><span>CORE</span><strong>Self-direction</strong></div>
        <div className="orbit-node orbit-node-light"><span>LIGHT</span><strong>Clear leadership</strong></div>
        <div className="orbit-node orbit-node-shadow"><span>SHADOW</span><strong>Carrying everything</strong></div>
        <div className="orbit-node orbit-node-aligned"><span>ALIGNED</span><strong>Support without surrender</strong></div>
        <div className="orbit-center"><span>YOU</span><strong>One quality<br />many expressions</strong></div>
      </div>
      {!compact && (
        <>
          <article className="orbit-question">
            <span>YOU EXPLORE</span>
            <p>How do I know when independence is aligned—and when it has become isolation?</p>
          </article>
          <article className="orbit-answer">
            <span>SOVEREIGN CONNECTS</span>
            <p>Your need for self-direction can support courage and leadership. Under pressure, receiving support may feel unsafe.</p>
            <strong>What changes when support does not require surrendering authority?</strong>
          </article>
        </>
      )}
      <footer>
        <span>Baseline</span><i>+</i><span>shadow &amp; light</span><i>+</i><span>real life</span>
      </footer>
    </div>
  );
}
