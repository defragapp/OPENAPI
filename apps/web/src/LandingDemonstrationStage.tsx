import { useState } from 'react';

export interface DemonstrationItem {
  id: string;
  scope: string;
  label: string;
  question: string;
  answer: string;
  distinction: string;
  accent: string;
  tags: string[];
}

export const DEMONSTRATION_QUESTIONS: DemonstrationItem[] = [
  {
    id: 'myself',
    scope: 'Myself',
    label: 'Myself',
    question: 'Why do I keep becoming the responsible one?',
    answer: 'You may create direction quickly when ownership is unclear. The cost begins when your capacity becomes an obligation to carry the outcome.',
    distinction: 'Leadership is not the same as responsibility for everyone involved.',
    accent: '#dda273',
    tags: ['Self Baseline', 'Ownership vs Obligation', 'Capacity']
  },
  {
    id: 'reaction',
    scope: 'A reaction',
    label: 'A reaction',
    question: 'Why can’t I let this go after the conversation is over?',
    answer: 'The unfinished part may be less about the words and more about not knowing where the relationship stands.',
    distinction: 'Wanting clarity is different from needing immediate resolution.',
    accent: '#dda273',
    tags: ['Reaction Baseline', 'Clarity vs Resolution', 'Processing']
  },
  {
    id: 'decision',
    scope: 'A decision',
    label: 'A decision',
    question: 'Should I say something now or wait?',
    answer: 'The choice may not be between honesty and silence. It may be between speaking while pressure is high and agreeing on a time when the message can actually land.',
    distinction: 'Waiting with a return time is different from avoidance.',
    accent: '#9fbaa1',
    tags: ['Decision Timing', 'Pressure vs Clarity', 'Alignment']
  },
  {
    id: 'relationship',
    scope: 'A relationship',
    label: 'A relationship',
    question: 'Why does the same conversation feel calm to them and urgent to me?',
    answer: 'You may need a defined next step in order to settle. They may need less pressure before they can respond clearly. The conflict can become a timing gap before it becomes a values gap.',
    distinction: 'Different processing speeds do not automatically mean different levels of care.',
    accent: '#9fbaa1',
    tags: ['Relational Bridge', 'Processing Speeds', 'Shared Context']
  },
  {
    id: 'system',
    scope: 'A family or team',
    label: 'A family or team',
    question: 'Why does everything fall to me when something goes wrong?',
    answer: 'The group may rely on you to restore structure because you have done it before. That does not establish that the responsibility belongs to you now.',
    distinction: 'Being the most capable person in the room does not make every unfinished responsibility yours.',
    accent: '#8ba8c4',
    tags: ['System Dynamics', 'Role Stabilizer', 'Responsibility']
  },
  {
    id: 'context',
    scope: 'What may be active now',
    label: 'What may be active now',
    question: 'Why does an old role feel harder to keep performing now?',
    answer: 'A familiar responsibility theme may be more visible for a limited time, making the cost of the role harder to ignore.',
    distinction: 'A temporary emphasis can reveal a tension without deciding what you must do.',
    accent: '#8ba8c4',
    tags: ['Active Context', 'Longitudinal Pattern', 'Tension']
  }
];

export function LandingDemonstrationStage() {
  const [activeId, setActiveId] = useState<string>('myself');
  const active: DemonstrationItem = DEMONSTRATION_QUESTIONS.find((item) => item.id === activeId) ?? DEMONSTRATION_QUESTIONS[0]!;

  return (
    <div className="landing-demo-stage" data-testid="landing-demonstration-stage">
      <div className="landing-demo-stage__rail" role="tablist" aria-label="Explore Situational Demonstrations">
        {DEMONSTRATION_QUESTIONS.map((item) => {
          const isSelected = item.id === activeId;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isSelected}
              className={`landing-demo-stage__rail-btn ${isSelected ? 'is-active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="landing-demo-stage__dot" style={{ backgroundColor: item.accent }} />
              <span className="landing-demo-stage__btn-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="landing-demo-stage__viewport" role="tabpanel">
        <div className="landing-demo-stage__window">
          <div className="landing-demo-stage__header">
            <div className="landing-demo-stage__controls" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="landing-demo-stage__status">
              <span>●</span> LIVE SOVEREIGN BASELINE INQUIRY · {active.scope.toUpperCase()}
            </div>
            <div className="landing-demo-stage__badge" style={{ borderColor: active.accent, color: active.accent }}>
              {active.scope}
            </div>
          </div>

          <div className="landing-demo-stage__body">
            <div className="landing-demo-stage__prompt-row">
              <div className="landing-demo-stage__avatar">You</div>
              <div className="landing-demo-stage__prompt-bubble">
                <p className="landing-demo-stage__prompt-text">{active.question}</p>
              </div>
            </div>

            <div className="landing-demo-stage__response-row">
              <div className="landing-demo-stage__avatar is-sov">S</div>
              <div className="landing-demo-stage__answer-card">
                <div className="landing-demo-stage__answer-kicker">
                  SOVEREIGN BASELINE REFERENCE · PERSISTENT
                </div>
                <p className="landing-demo-stage__direct-answer">
                  {active.answer}
                </p>

                <div className="landing-demo-stage__distinction">
                  <span className="landing-demo-stage__distinction-icon">✦</span>
                  <div className="landing-demo-stage__distinction-content">
                    <strong>The Distinction:</strong> {active.distinction}
                  </div>
                </div>

                <div className="landing-demo-stage__tags">
                  {active.tags.map((tag) => (
                    <span key={tag} className="landing-demo-stage__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
