import { useState, useEffect } from 'react';

export type ProcessingState = 'understanding' | 'checking-context' | 'connecting' | 'answer-ready';

interface AnswerProcessingIndicatorProps {
  initialState?: ProcessingState;
  onComplete?: () => void;
}

const STAGES: { state: ProcessingState; label: string; progress: number }[] = [
  { state: 'understanding', label: 'Understanding your question through your Baseline…', progress: 25 },
  { state: 'checking-context', label: 'Checking your context…', progress: 50 },
  { state: 'connecting', label: 'Connecting patterns and distinctions…', progress: 75 },
  { state: 'answer-ready', label: 'Preparing direct answer…', progress: 100 }
];

export function AnswerProcessingIndicator({ onComplete }: AnswerProcessingIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setCurrentStep(2), 1400);
    const timer3 = setTimeout(() => {
      setCurrentStep(3);
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const current = STAGES[currentStep] ?? STAGES[0]!;

  return (
    <div
      className="sovereign-processing-indicator"
      role="status"
      aria-live="polite"
      aria-label={current.label}
    >
      <div className="sovereign-processing-indicator__spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="sovereign-processing-indicator__svg">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="rgba(241, 233, 222, 0.15)"
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="#dda273"
            strokeWidth="2"
            strokeDasharray="56.5"
            strokeDashoffset={56.5 - (56.5 * current.progress) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
      </div>
      <span className="sovereign-processing-indicator__text">
        {current.label}
      </span>
    </div>
  );
}
