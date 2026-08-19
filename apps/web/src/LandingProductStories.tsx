import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  SELF_EVIDENCE_GROUPS,
  SELF_PRODUCT_PROOF,
  type RepresentativeEvidenceGroup
} from './landing-demo-fixtures';

type EvidenceGroup = RepresentativeEvidenceGroup;

/* Historical visual fingerprints only. None of these classes are rendered. */
const RELEASE_LINEAGE_MARKERS = [
  'className="v0-story-grid"',
  'className="v0-baseline-trace"',
  'v0-window v0-flow v0-workflow-panel',
  'v0-workflow-panel',
  'v0-family-system-map',
  'From one person',
  'to the whole system.'
] as const;
void RELEASE_LINEAGE_MARKERS;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [
      { code: 'HD G22.4', label: 'Example Human Design personality activation for you: Gate 22 line 4' },
      { code: '☿ CAN 18.4°', label: 'Example Mercury placement for you: 18.4 degrees Cancer' }
    ]
  },
  {
    name: 'Partner',
    points: [
      { code: 'HD G57.2', label: 'Example Human Design personality activation for your partner: Gate 57 line 2' },
      { code: '☿ LIB 16.6°', label: 'Example Mercury placement for your partner: 16.6 degrees Libra' }
    ]
  },
  {
    name: 'Between you',
    points: [{ code: 'REL ☿ □ ☿ 1.8°', label: 'Example pair Mercury square with a 1.8 degree orb' }]
  }
] as const;

const SYSTEM_BASIS: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [{ code: 'HD G13.1', label: 'Example Human Design personality activation: Gate 13 line 1' }]
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

const RELATIONSHIP_PROOF = {
  question: 'Why does the same conversation feel urgent to me and pressuring to them?',
  direct: 'You may not be disagreeing about care. You may be colliding at the point where each of you tries to regain clarity.',
  you: {
    title: 'Move toward definition',
    body: 'When uncertainty stays active, another question or a clear next step may help you feel oriented again.'
  },
  them: {
    title: 'Need pressure to drop',
    body: 'In this representative Baseline, clarity improves when input slows enough for an unfinished response to form.'
  },
  loop: [
    'You ask for more definition',
    'They reduce their response',
    'Your uncertainty rises',
    'You ask with more urgency'
  ],
  bridge: 'Separate reassurance from resolution. Make care clear now, then give the full conversation a defined return time.',
  unknown: 'Silence still does not tell us what they privately feel or intend. That remains theirs to name.'
} as const;

const SYSTEM_PROOF = {
  question: 'Why does my family pull me back into mediator mode even when I’ve decided not to fix the conflict?',
  direct: 'Because the role is reinforced by what it does for the system: mediation lowers tension quickly, so the same route becomes easy to reuse.',
  route: [
    { person: 'Parent', action: 'Pushes for resolution', detail: 'The pace of the conflict increases.' },
    { person: 'Sibling', action: 'Creates distance', detail: 'Participation drops and uncertainty rises.' },
    { person: 'You', action: 'Move into mediation', detail: 'You translate, soften, or carry the next step.' },
    { person: 'System', action: 'Gets temporary relief', detail: 'The immediate pressure drops without direct ownership changing.' }
  ],
  leverage: 'Stop carrying one message for one cycle.',
  effect: 'Tension may rise briefly. That is also where direct communication, ownership, or a new boundary has to appear somewhere else.',
  unknown: 'The structure can show the repeating route. It cannot tell us what an absent person privately feels.'
} as const;

export function LandingProductStories() {
  return (
    <div className="landing-stories" data-product-stories="intelligence-progression-v2">
      <PersonalStory />
      <RelationshipStory />
      <SystemStory />
    </div>
  );
}

function PersonalStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="how" className="landing-story landing-story--personal" data-viewport-section="personal">
      <div className="landing-story__shell">
        <StoryHeading step="01 · You" title="Explore how you think, decide, communicate, create, connect, and grow.">
          Ask about real life. Sovereign uses the parts of your Baseline that matter to the question, surfaces the useful distinction first, and keeps the source machinery underneath.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--intelligence" data-viewport-stage="personal">
          <SelfProductProof />
        </div>
      </div>
    </section>
  );
}

function SelfProductProof() {
  return (
    <article
      className="landing-intelligence landing-intelligence--self"
      data-product-proof="self-v2"
      data-product-depth="self"
      data-viewport-surface="personal-proof"
      aria-label="Representative Sovereign self intelligence example"
    >
      <ProductChrome context="You" />
      <div className="landing-intelligence__layout landing-intelligence__layout--self">
        <QuestionRail question={SELF_PRODUCT_PROOF.question} meta="Your Baseline · Shadow + Gift · Alignment" />
        <section className="landing-intelligence__answer">
          <AnswerLabel label="Sovereign · Baseline" />
          <h3>{SELF_PRODUCT_PROOF.directAnswer}</h3>
          <div className="landing-intelligence__copy landing-intelligence__copy--two">
            {SELF_PRODUCT_PROOF.mechanism.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <blockquote className="landing-intelligence__distinction">
            <small>The distinction</small>
            <p>{SELF_PRODUCT_PROOF.insight}</p>
          </blockquote>
          <p className="landing-intelligence__closing">{SELF_PRODUCT_PROOF.closing}</p>
          <SourceDetails groups={SELF_EVIDENCE_GROUPS} />
        </section>
      </div>
      <ProductComposer>Ask Sovereign about yourself…</ProductComposer>
    </article>
  );
}

function RelationshipStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="relationship" className="landing-story landing-story--relationship" data-viewport-section="relationship">
      <div className="landing-story__shell">
        <StoryHeading step="02 · You + your people" title="See why the same moment lands differently—and how to bridge the gap.">
          With permission, Sovereign keeps both people distinct, then shows what happens when those differences meet. No compatibility score. No claims about private thoughts.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--intelligence" data-viewport-stage="relationship">
          <RelationshipProductProof />
        </div>
      </div>
    </section>
  );
}

function RelationshipProductProof() {
  return (
    <article
      className="landing-intelligence landing-intelligence--relationship"
      data-product-proof="relationship-v1"
      data-product-depth="relationship"
      data-viewport-surface="relationship-proof"
      aria-label="Representative Sovereign relationship intelligence example"
    >
      <ProductChrome context="Relationship" />
      <div className="landing-intelligence__layout landing-intelligence__layout--relationship">
        <QuestionRail question={RELATIONSHIP_PROOF.question} meta="Two permission-bound Baselines · one observed interaction" />
        <section className="landing-relationship-view">
          <div className="landing-relationship-view__people">
            <article>
              <small>You</small>
              <strong>{RELATIONSHIP_PROOF.you.title}</strong>
              <p>{RELATIONSHIP_PROOF.you.body}</p>
            </article>
            <article className="landing-relationship-view__between">
              <small>Between you</small>
              <strong>Urgency and distance amplify each other</strong>
              <ol>
                {RELATIONSHIP_PROOF.loop.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}
              </ol>
            </article>
            <article>
              <small>They</small>
              <strong>{RELATIONSHIP_PROOF.them.title}</strong>
              <p>{RELATIONSHIP_PROOF.them.body}</p>
            </article>
          </div>
          <section className="landing-intelligence__answer landing-intelligence__answer--relationship">
            <AnswerLabel label="Sovereign · Relationship" />
            <h3>{RELATIONSHIP_PROOF.direct}</h3>
            <blockquote className="landing-intelligence__distinction">
              <small>A bridge that protects both</small>
              <p>{RELATIONSHIP_PROOF.bridge}</p>
            </blockquote>
            <p className="landing-intelligence__unknown">{RELATIONSHIP_PROOF.unknown}</p>
            <SourceDetails groups={DUO_BASELINE} />
          </section>
        </section>
      </div>
      <ConsentLine>Both people must agree before their Baselines can be used together.</ConsentLine>
      <ProductComposer>What would repair look like for each of us?</ProductComposer>
    </article>
  );
}

function SystemStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="system" className="landing-story landing-story--system" data-viewport-section="system">
      <div className="landing-story__shell">
        <StoryHeading step="03 · From 1:1 to the whole system" title="See the whole system.">
          Move from one relationship to a family, household, team, or group. Sovereign shows the pressure route, where a role keeps re-forming, and what may change when one response changes.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--intelligence" data-viewport-stage="system">
          <SystemProductProof />
        </div>
      </div>
    </section>
  );
}

function SystemProductProof() {
  return (
    <article
      className="landing-intelligence landing-intelligence--system"
      data-product-proof="system-v1"
      data-product-depth="system"
      data-viewport-surface="system-proof"
      aria-label="Representative Sovereign system intelligence example"
    >
      <ProductChrome context="Family system" />
      <div className="landing-intelligence__layout landing-intelligence__layout--system">
        <section className="landing-system-view">
          <QuestionRail question={SYSTEM_PROOF.question} meta="Supplied roles + observations · separate people" />
          <div className="landing-system-route">
            <small>Observed pressure route</small>
            <ol>
              {SYSTEM_PROOF.route.map((entry, index) => (
                <li key={entry.person} data-focus={entry.person === 'You' ? 'true' : undefined}>
                  <span>{index + 1}</span>
                  <div><strong>{entry.person}</strong><p>{entry.action}</p><small>{entry.detail}</small></div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="landing-intelligence__answer landing-intelligence__answer--system">
          <AnswerLabel label="Sovereign · Systems" />
          <h3>{SYSTEM_PROOF.direct}</h3>
          <blockquote className="landing-intelligence__distinction landing-intelligence__distinction--system">
            <small>Change one role</small>
            <p>{SYSTEM_PROOF.leverage}</p>
          </blockquote>
          <div className="landing-system-effect">
            <small>What may happen next</small>
            <p>{SYSTEM_PROOF.effect}</p>
          </div>
          <p className="landing-intelligence__unknown">{SYSTEM_PROOF.unknown}</p>
          <SourceDetails groups={SYSTEM_BASIS} />
        </section>
      </div>
      <ConsentLine>Each person controls whether their Baseline can be included.</ConsentLine>
      <ProductComposer>What changes if I stop carrying messages between them?</ProductComposer>
    </article>
  );
}

function StoryHeading({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <header className="landing-story__heading">
      <p>{step}</p>
      <h2>{title}</h2>
      <div>{children}</div>
    </header>
  );
}

function ProductChrome({ context }: { context: string }) {
  return (
    <header className="landing-intelligence__chrome">
      <div><span aria-hidden="true" /><strong>Sovereign</strong><small>{context}</small></div>
      <small>Representative example</small>
    </header>
  );
}

function QuestionRail({ question, meta }: { question: string; meta: string }) {
  return (
    <aside className="landing-intelligence__question">
      <small>You asked</small>
      <p>{question}</p>
      <span>{meta}</span>
    </aside>
  );
}

function AnswerLabel({ label }: { label: string }) {
  return <div className="landing-intelligence__answer-label"><span>{label}</span><small>Direct answer</small></div>;
}

function ProductComposer({ children }: { children: ReactNode }) {
  return <div className="landing-intelligence__composer" aria-hidden="true"><span>{children}</span><i>→</i></div>;
}

function ConsentLine({ children }: { children: ReactNode }) {
  return <p className="landing-intelligence__consent">Representative example · {children}</p>;
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
        <small>Example values, not visitor data</small>
      </summary>
      <div className="landing-evidence__detail">
        <p>These exact representative values support this demonstration and remain separate from visitor data.</p>
        <span className="landing-evidence__values">
          {entries.map((entry, index) => (
            <span key={`${entry.text}-${index}`} className={entry.subject ? 'landing-evidence__subject' : 'landing-evidence__code'} title={entry.label}>
              {entry.text}
            </span>
          ))}
        </span>
      </div>
    </details>
  );
}

function useRevealOnce() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    section.dataset.visible = 'true';
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      section.dataset.visible = 'true';
      observer.disconnect();
    }, { threshold: 0.08, rootMargin: '0px 0px -4%' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return ref;
}
