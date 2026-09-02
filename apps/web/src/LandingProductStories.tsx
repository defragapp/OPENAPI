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
      { code: 'tenderness', label: 'Tenderness' },
      { code: 'responsibility', label: 'Responsibility' },
      { code: 'boundaries', label: 'Boundaries' }
    ]
  }
] as const;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [
      { code: 'clarity', label: 'Clarity' },
      { code: 'focus', label: 'Focus' }
    ]
  },
  {
    name: 'Partner',
    points: [
      { code: 'steadiness', label: 'Steadiness' },
      { code: 'patience', label: 'Patience' }
    ]
  },
  {
    name: 'Between you',
    points: [{ code: 'clarity □ steadiness', label: 'Clarity & Steadiness' }]
  }
] as const;

const SYSTEM_BASIS: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [{ code: 'responsibility', label: 'Example Baseline quality: Responsibility' }]
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

interface StoryContent {
  id: 'personal' | 'relationship' | 'system';
  label: string;
  question: string;
  direct: string;
  distinction: string;
  basis: readonly EvidenceGroup[];
}

const STORIES: readonly StoryContent[] = [
  {
    id: 'personal',
    label: '01 · You',
    question: 'Why do I keep saying yes when I want to say no?',
    direct: 'You may equate accommodation with connection, so refusing feels like risking the relationship. Your Baseline Design shows high tenderness and responsibility — under pressure, those become over-accommodation.',
    distinction: 'Being helpful is not the same as being responsible for someone else\'s reaction.',
    basis: [
      {
        points: [
          { code: 'tenderness', label: 'Example Baseline quality: Tenderness' },
          { code: 'responsibility', label: 'Example Baseline quality: Responsibility' },
          { code: 'boundaries', label: 'Example Baseline quality: Boundaries' }
        ]
      }
    ] as const
  },
  {
    id: 'relationship',
    label: '02 · You + your people',
    question: 'Why does my partner\'s silence feel like punishment?',
    direct: 'You may need verbal reassurance to regulate; they may need silence to process. When you pursue and they withdraw, each move makes sense from inside one person and becomes pressure from inside the other.',
    distinction: 'Different processing needs are not a lack of care.',
    basis: [
      {
        name: 'You',
        points: [
          { code: 'clarity', label: 'Example Baseline quality for you: Clarity' },
          { code: 'focus', label: 'Example Baseline quality for you: Focus' }
        ]
      },
      {
        name: 'Partner',
        points: [
          { code: 'steadiness', label: 'Example Baseline quality for your partner: Steadiness' },
          { code: 'patience', label: 'Example Baseline quality for your partner: Patience' }
        ]
      },
      {
        name: 'Between you',
        points: [{ code: 'clarity □ steadiness', label: 'Example interaction dynamic: Clarity & Steadiness' }]
      }
    ] as const
  },
  {
    id: 'system',
    label: '03 · From 1:1 to the whole system',
    question: 'Why do I always end up managing the family crisis?',
    direct: 'The system may have organized around your reliability — you became the stabilizer because you stabilized things once. That doesn\'t mean the role is yours to carry now.',
    distinction: 'Being the one who can doesn\'t make it the one who must.',
    basis: [
      {
        name: 'You',
        points: [{ code: 'responsibility', label: 'Example Baseline quality: Responsibility' }]
      },
      {
        name: 'What you told Sovereign',
        points: [
          { code: 'U✓', label: 'Example observation: a parent pushes for immediate resolution' },
          { code: 'U✓', label: 'Example observation: you move into mediation' },
          { code: 'U✓', label: 'Example observation: a sibling withdraws as pressure rises' }
        ]
      }
    ] as const
  }
] as const;

export function LandingProductStories() {
  return (
    <div className="landing-stories" data-product-stories="high-value-intelligence-v1">
      <nav className="landing-stories__labels" aria-label="Product demonstrations">
        {STORIES.map((story) => (
          <span key={story.id} className="landing-story__label">{story.label}</span>
        ))}
      </nav>
      <div className="landing-stories__cards">
        {STORIES.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}

function StoryCard({ story }: { story: StoryContent }) {
  const suffix = story.id === 'personal' ? 'personal' : story.id === 'relationship' ? 'relationship' : 'system';
  const className = `demo-card landing-story landing-story--${suffix}${story.id === 'system' ? ' roles-responsibility-map' : ''}`;
  return (
    <section
      className={className}
      data-story-id={story.id}
      data-verification-text={story.label}
    >
      <div className="demo-card__question">
        <p>{story.question}</p>
      </div>
      <div className="demo-card__answer">
        <p>{story.direct}</p>
      </div>
      <div className="demo-card__distinction">
        <span aria-hidden="true">✦</span>
        <p>{story.distinction}</p>
      </div>
      <SourceDetails groups={story.basis} />
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