import { useState } from 'react';

const stages = [
  { label: 'Foundation', eyebrow: 'STEADY BASELINE', title: 'Self-directed clarity', copy: 'You tend to find direction by naming what matters and retaining meaningful agency.' },
  { label: 'Question', eyebrow: 'A REAL QUESTION', title: 'Why do I carry everything alone?', copy: 'The question enters as context. It does not overwrite what is relatively steady.' },
  { label: 'Connection', eyebrow: 'RELEVANT CONNECTION', title: 'Authority and support', copy: 'Self-direction may become most relevant where accepting support feels like surrendering your voice.' },
  { label: 'Insight', eyebrow: 'POSSIBLE INSIGHT', title: 'Support may not be the problem.', copy: 'The tension may be whether support comes with shared responsibility or loss of authority.' },
  { label: 'Evidence', eyebrow: 'WHY THIS APPEARS', title: 'Tendency, question, possibility.', copy: 'Baseline: self-direction · Question: carrying responsibility · Actual current state: still unknown.' },
  { label: 'Confirm', eyebrow: 'YOUR EXPERIENCE DECIDES', title: 'Confirm, partly confirm, or correct.', copy: 'What fits can be kept with the exploration. What does not fit changes the context—not your authority.' }
] as const;

export function BaselineOrbit({ compact = false }: { compact?: boolean }) {
  const [stage, setStage] = useState(compact ? 0 : 3);
  const active = stages[stage]!;

  return (
    <div className={`baseline-experience ${compact ? 'is-compact' : ''}`} aria-label="Interactive example of a personal Baseline becoming relevant to a question">
      <div className="baseline-experience-topline"><span>EXAMPLE BASELINE</span><span>{stage + 1} / {stages.length}</span></div>
      <div className={`baseline-signature signature-stage-${stage}`} aria-hidden="true">
        <i className="signature-shell shell-one" /><i className="signature-shell shell-two" /><i className="signature-shell shell-three" />
        <div className="signature-core"><span>YOUR</span><strong>Baseline</strong><small>steady foundation</small></div>
        <span className="signature-quality quality-one">Direct clarity</span>
        <span className="signature-quality quality-two">Shared responsibility</span>
        <span className="signature-quality quality-three">Agency</span>
        <span className="signature-context">“Why do I carry everything alone?”</span>
      </div>
      {!compact && <div className="baseline-resolution" key={stage} aria-live="polite">
        <span>{active.eyebrow}</span><h2>{active.title}</h2><p>{active.copy}</p>
      </div>}
      {!compact && <div className="baseline-stage-rail" aria-label="Interpretation sequence">
        {stages.map((item, index) => <button type="button" key={item.label} onClick={() => setStage(index)} aria-pressed={stage === index}><i>{index + 1}</i><span>{item.label}</span></button>)}
      </div>}
    </div>
  );
}
