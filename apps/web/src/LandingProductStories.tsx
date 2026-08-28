import { useState } from 'react';
import type { ReactNode } from 'react';

type EvidencePoint = { code: string; label: string };
type EvidenceGroup = { name?: string; points: readonly EvidencePoint[] };

/*
 * Public examples use sanitized representative fixture values, not visitor data.
 * Each answer below is authored against the same exact example sources available
 * inside its collapsed source-details disclosure.
 */
const SELF_BASELINE: readonly EvidenceGroup[] = [
  {
    points: [
      { code: 'tenderness', label: 'Example Baseline Design facet: Tenderness' },
      { code: 'responsibility', label: 'Example Baseline Design facet: Responsibility' },
      { code: 'boundaries', label: 'Example Baseline Design facet: Boundaries' }
    ]
  }
] as const;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [
      { code: 'clarity', label: 'Example Baseline Design facet for you: Clarity' },
      { code: 'focus', label: 'Example Baseline Design facet for you: Focus' }
    ]
  },
  {
    name: 'Partner',
    points: [
      { code: 'steadiness', label: 'Example Baseline Design facet for your partner: Steadiness' },
      { code: 'patience', label: 'Example Baseline Design facet for your partner: Patience' }
    ]
  },
  {
    name: 'Between you',
    points: [{ code: 'clarity □ steadiness', label: 'Example pair interaction: Clarity/Steadiness dynamic' }]
  }
] as const;

const SYSTEM_BASIS: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [{ code: 'responsibility', label: 'Example Baseline Design facet: Responsibility' }]
  },
  {
    name: 'What you told Sovereign',
    points: [
      { code: 'U✓', label: 'Example observation: a parent pushes for immediate resolution' },
      { code: 'U✓', label: 'Example observation: you move into mediation' },
      { code: 'U✓', label: 'Example observation: a sibling withdraws as pressure rises' }
    ]
  }
] as const;

interface DemoContent {
  question: string;
  direct: string;
  distinction: string;
  basis: readonly EvidenceGroup[];
}

const DEMOS: readonly DemoContent[] = [
  {
    question: 'Why do I keep saying yes when I want to say no?',
    direct: 'You may equate accommodation with connection, so refusing feels like risking the relationship. Your Baseline Design shows high tenderness and responsibility — under pressure, those become over-accommodation.',
    distinction: 'Being helpful is not the same as being responsible for someone else\'s reaction.',
    basis: SELF_BASELINE
  },
  {
    question: 'Why does my partner\'s silence feel like punishment?',
    direct: 'You may need verbal reassurance to regulate; they may need silence to process. When you pursue and they withdraw, each move makes sense from inside one person and becomes pressure from inside the other.',
    distinction: 'Different processing needs are not a lack of care.',
    basis: DUO_BASELINE
  },
  {
    question: 'Why do I always end up managing the family crisis?',
    direct: 'The system may have organized around your reliability — you became the stabilizer because you stabilized things once. That doesn\'t mean the role is yours to carry now.',
    distinction: 'Being the one who can doesn\'t make it the one who must.',
    basis: SYSTEM_BASIS
  }
] as const;

const DEMO_LABELS = [
  '01 · YOU',
  '02 · YOU & YOUR PEOPLE',
  '03 · WHOLE SYSTEM'
] as const;

export function LandingProductStories() {
  const [selectedDemo, setSelectedDemo] = useState(0);

  const currentDemo = DEMOS[selectedDemo] ?? DEMOS[0] as DemoContent;

  return (
    <div className="landing-stories" data-product-stories="high-value-intelligence-v1">
      <DemoSelector
        labels={DEMO_LABELS}
        selectedIndex={selectedDemo}
        onSelect={setSelectedDemo}
      />
      <SimplifiedDemo content={currentDemo} />
    </div>
  );
}

function DemoSelector({
  labels,
  selectedIndex,
  onSelect
}: {
  labels: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="demo-selector" aria-label="Choose a demonstration" role="tablist">
      {labels.map((label, index) => (
        <button
          key={label}
          role="tab"
          aria-selected={index === selectedIndex}
          aria-controls={`demo-panel-${index}`}
          id={`demo-tab-${index}`}
          className={`demo-selector__tab${index === selectedIndex ? ' is-active' : ''}`}
          onClick={() => onSelect(index)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function SimplifiedDemo({ content }: { content: DemoContent }) {
  return (
    <section className="demo-card" role="tabpanel" aria-labelledby={`demo-tab-${DEMOS.indexOf(content)}`}>
      <div className="demo-card__question">
        <span className="demo-card__q-label">Q</span>
        <p>{content.question}</p>
      </div>
      <div className="demo-card__answer">
        <span className="demo-card__a-label">A</span>
        <p>{content.direct}</p>
      </div>
      <div className="demo-card__distinction">
        <span aria-hidden="true">✦</span>
        <p>{content.distinction}</p>
      </div>
      <SourceDetails groups={content.basis} />
    </section>
  );
}

function SourceDetails({ groups }: { groups: readonly EvidenceGroup[] }) {
  const entries = groups.flatMap((group) => [
    ...(group.name ? [{ text: group.name, label: `${group.name} example sources`, subject: true }] : []),
    ...group.points.map((point) => ({ text: point.code, label: point.label, subject: false }))
  ]);
  return (
    <details className="landing-evidence">
      <summary aria-label="See source details for this representative example">
        <strong>See source details</strong>
        <small>Representative example · Not your Baseline Design</small>
      </summary>
      <div className="landing-evidence__detail">
        <p>Example data used in this demonstration. These values are not visitor data.</p>
        <span className="landing-evidence__values">
          {entries.map((entry, index) => (
            <span
              key={`${entry.text}-${index}`}
              className={entry.subject ? 'landing-evidence__subject' : 'landing-evidence__code'}
              title={entry.label}
            >
              <i aria-hidden="true"> · </i>{entry.text}
            </span>
          ))}
        </span>
      </div>
    </details>
  );
}