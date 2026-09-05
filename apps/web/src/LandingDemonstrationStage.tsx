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
  const [inputValue, setInputValue] = useState<string>(active.question);

  const handleSelect = (item: DemonstrationItem) => {
    setActiveId(item.id);
    setInputValue(item.question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUrl = `/signup?inquiry=${encodeURIComponent(inputValue.trim() || active.question)}`;
    window.location.href = targetUrl;
  };

  return (
    <div className="landing-demo-stage powder-interface-card" data-testid="landing-demonstration-stage">
      {/* 1. Powder Top Logo & Greeting */}
      <div className="card-top-header">
        <div className="card-top-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
            <path d="M12 2L2 12l10 10 10-10L12 2z"/>
          </svg>
        </div>
        <span className="card-badge">✦ SOVEREIGN BASELINE</span>
      </div>

      <div className="card-welcome">
        <h2>Welcome back</h2>
        <p>How can I help you today?</p>
      </div>

      {/* 2. Powder Prompt Box with Utility Tools */}
      <form className="prompt-box" onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about a decision, a reaction, a relationship, or a system…"
          aria-label="Active situational inquiry"
        />
        <div className="prompt-tools">
          <div className="tools-left">
            <span className="chip-indicator">You</span>
            <span className="chip-indicator">Baseline</span>
            <span className="chip-indicator">Context</span>
          </div>
          <div className="tools-right">
            <button type="submit" className="send-btn" aria-label="Submit prompt">↑</button>
          </div>
        </div>
      </form>

      {/* 3. Powder Category Filter Pills Across Top */}
      <div className="category-filters" role="tablist" aria-label="Explore Situational Demonstrations">
        <div className="filters-left">
          {DEMONSTRATION_QUESTIONS.map((item) => {
            const isSelected = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={isSelected ? 'active' : ''}
                onClick={() => handleSelect(item)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <button type="button" className="search-icon" aria-label="Search">🔍</button>
      </div>

      {/* 4. Active Situational Distinction & Answer Display */}
      <div className="powder-stage-response" role="tabpanel" aria-live="polite">
        <div className="powder-stage-response__header">
          <span className="powder-stage-response__badge">✦ SITUATIONAL INTERPRETATION · {active.scope.toUpperCase()}</span>
        </div>
        <div className="powder-stage-response__answer">
          <p>{active.answer}</p>
        </div>
        <div className="powder-stage-response__distinction">
          <span className="powder-stage-response__icon">✦</span>
          <div className="powder-stage-response__text">{active.distinction}</div>
        </div>
        <div className="powder-stage-response__tags">
          {active.tags.map((tag) => (
            <span key={tag} className="powder-stage-response__tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* 5. Powder Interactive Suggestion Rows with Right Arrows */}
      <ul className="suggestion-list">
        {DEMONSTRATION_QUESTIONS.map((item) => {
          const isSelected = item.id === activeId;
          return (
            <li 
              key={item.id} 
              className={isSelected ? 'is-active-suggestion' : ''}
              onClick={() => handleSelect(item)}
            >
              <span>{item.question}</span>
              <span className="arrow">→</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
