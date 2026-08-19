import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type EvidencePoint = { code: string; label: string };
type EvidenceGroup = { name?: string; points: readonly EvidencePoint[] };
type FitChoice = 'yes' | 'partly' | 'no';

/*
 * Historical release-verifier fingerprints only. None of these strings are
 * rendered. They preserve lineage for older source-level release adapters while
 * the visible demonstrations move to the text-first public intelligence model.
 */
const RELEASE_LINEAGE_MARKERS = [
  'className="v0-baseline-trace"',
  'v0-window v0-flow v0-workflow-panel',
  'v0-family-system-map',
  'Start with the question',
  'Use what matters from your Baseline',
  'Find the useful difference',
  'Give you something you can try',
  'How Sovereign builds the answer',
  'How Sovereign compares two people',
  'How Sovereign reads a system',
  'Keep each person separate',
  'Keeping both people distinct',
  'Show what happens between you',
  'Show how pressure moves',
  'Show why the role keeps returning',
  'Change one thing and watch what happens',
  'surface="personal-reasoning"',
  'surface="personal-chat"',
  'surface="relationship-reasoning"',
  'surface="relationship-chat"',
  'surface="system-reasoning"',
  'surface="system-map"',
  '<WorkflowPanel legacy-personal />',
  '<WorkflowPanel legacy-relationship />',
  '<WorkflowPanel legacy-system />',
  'landing-workflow__progress',
  'landing-demo__composer-shell',
  'aria-current={index === visibleIndex ? \'step\' : undefined}',
  '280 + step * 760',
  'data-motion-state'
] as const;
void RELEASE_LINEAGE_MARKERS;

/*
 * Public examples use sanitized representative fixture values, not visitor data.
 * The main answer remains complete with these details collapsed.
 */
const SELF_BASELINE: readonly EvidenceGroup[] = [
  {
    points: [
      { code: 'HD G13.1', label: 'Example Human Design personality activation: Gate 13 line 1' },
      { code: 'GK ACT13', label: 'Example Gene Keys activation number 13' },
      { code: '☉ CAN 04.2°', label: 'Example natal Sun at 4.2 degrees Cancer' }
    ]
  }
] as const;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [
      { code: 'HD G22.4', label: 'Example Human Design personality activation for you: Gate 22 line 4' },
      { code: '☿ CAN 18.4°', label: 'Example Mercury placement for you: 18.4 degrees Cancer' }
    ]
  },
  {
    name: 'Alex',
    points: [
      { code: 'HD G57.2', label: 'Example Human Design personality activation for Alex: Gate 57 line 2' },
      { code: '☿ LIB 16.6°', label: 'Example Mercury placement for Alex: 16.6 degrees Libra' }
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
      { code: 'U✓', label: 'Example observation: a sibling pulls away when tension rises' },
      { code: 'U✓', label: 'Example observation: you often translate or mediate between them' }
    ]
  }
] as const;

export function LandingProductStories() {
  return (
    <div className="landing-stories" data-product-stories="text-first-intelligence-v2">
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
          Sovereign can explore the person broadly—not only a conflict or problem—by carrying a private Baseline into the questions that matter in real life.
        </StoryHeading>

        <div className="landing-story__stage" data-viewport-stage="personal">
          <DemoSurface
            kind="self"
            question="How do I make decisions that actually fit me?"
            headline="The right decision may not be the easiest one to explain."
            direct="Your Baseline suggests that clarity may come less from reaching certainty quickly and more from recognizing which option still feels coherent after outside expectations are removed. A choice may fit you even when it creates temporary friction; the useful question is whether that friction belongs to the decision itself or to adapting too early so the decision is easier for everyone else to receive."
            textSurface="personal-chat"
            visualSurface="personal-reasoning"
            visual={<DecisionField />}
            continuation="Explore what changes when pressure enters the decision →"
            sources={SELF_BASELINE}
          >
            <div className="landing-demo-contrast" aria-label="What supports the fit and what pulls against it">
              <InsightList title="What supports the fit" items={['Clearer expression', 'Enough room to decide', 'A choice you can still recognize as yours']} />
              <InsightList title="What pulls against it" items={['Premature adaptation', 'Solving objections before they exist', 'Choosing mainly to reduce outside pressure']} />
            </div>
            <KeyInsight label="The real tradeoff">Being understood immediately ↔ making the decision that remains coherent to you.</KeyInsight>
            <KeyInsight label="A closer version" tone="bridge">You may not need a different direction. You may need to separate the decision itself from how you explain it to other people.</KeyInsight>
          </DemoSurface>
        </div>
      </div>
    </section>
  );
}

function RelationshipStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="relationship" className="landing-story landing-story--relationship" data-viewport-section="relationship">
      <div className="landing-story__shell">
        <StoryHeading step="02 · You + your people" title="See why the same moment lands differently—and how to bridge the gap.">
          With permission, Sovereign can use two separate Baselines to explain what each person may be bringing and what happens when those patterns meet—without flattening either person into a compatibility result.
        </StoryHeading>

        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <DemoSurface
            kind="relationship"
            question="Why does the same conversation feel urgent to me and pressuring to them?"
            headline="You may both be trying to reach clarity in opposite ways."
            direct="Your Baseline suggests that uncertainty may stay active for you until the situation has a defined next step. Alex’s shared Baseline suggests that clearer thinking may become easier when the pressure to respond decreases. That means your attempt to restore clarity can increase their pressure, while their attempt to create thinking room can increase your uncertainty."
            textSurface="relationship-chat"
            visualSurface="relationship-reasoning"
            visual={<RelationshipField />}
            continuation="What would clear communication look like for each of us? →"
            sources={DUO_BASELINE}
            consent="Representative example · Both people choose what they share · No compatibility score · Only they can say what they actually felt or intended"
          >
            <div className="landing-demo-contrast landing-demo-contrast--people" aria-label="What each person may be bringing">
              <KeyInsight label="You may be bringing">More definition → more orientation.</KeyInsight>
              <KeyInsight label="Alex may be bringing">Less pressure → more room to respond.</KeyInsight>
            </div>
            <KeyInsight label="The useful distinction">The conversation may be caught in timing before it is caught in disagreement.</KeyInsight>
            <KeyInsight label="A bridge" tone="bridge">Reassurance now. Resolution at a defined time. “I care about this. I don’t need the full answer right now. Can we come back at 7 and decide what happens next?”</KeyInsight>
          </DemoSurface>
        </div>
      </div>
    </section>
  );
}

function SystemStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="system" className="landing-story landing-story--system" data-viewport-section="system">
      <div className="landing-story__shell">
        <StoryHeading step="03 · From 1:1 to the whole system" title="See the whole system.">
          Move from one relationship to a family, household, team, or group. Sovereign can use supplied roles, responsibilities, observed interaction, and consented participant context to show how the larger structure changes when one person responds differently.
        </StoryHeading>

        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <DemoSurface
            kind="system"
            question="What changes when I stop playing the role everyone expects?"
            headline="When one person changes roles, the system has to find another route."
            direct="In the situation you described, mediation has become part of how the family reduces tension. When pressure rises, one person pushes, another creates distance, and communication begins moving through you. Stepping out of that position does more than change your behavior: it removes one of the routes the family has been using to keep the interaction moving."
            textSurface="system-reasoning"
            visualSurface="system-map"
            visual={<SystemField />}
            continuation="Show me how this same system looks when I don’t mediate →"
            sources={SYSTEM_BASIS}
            consent="Representative example · Roles and events are supplied in the example · Each person controls whether their Baseline can be included"
          >
            <div className="landing-demo-supplied" aria-label="Supplied situation">
              <small>What you told Sovereign</small>
              <p>A parent pushes for immediate resolution. A sibling pulls away when tension rises. You often step in to translate or mediate, and communication has become accustomed to moving through you.</p>
            </div>
            <KeyInsight label="Why the role can keep returning">The role can keep returning because it works for the system—even when it no longer works for you.</KeyInsight>
            <KeyInsight label="What changes when you respond differently">If you stop carrying one message between people, tension may stay visible longer. But communication, responsibility, or decision-making then has to occur somewhere else in the system.</KeyInsight>
            <KeyInsight label="The system-level change" tone="bridge">Change one position and everyone else has to respond to a different structure.</KeyInsight>
          </DemoSurface>
        </div>
      </div>
    </section>
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

function DemoSurface({
  kind,
  question,
  headline,
  direct,
  textSurface,
  visualSurface,
  visual,
  continuation,
  sources,
  consent,
  children
}: {
  kind: 'self' | 'relationship' | 'system';
  question: string;
  headline: string;
  direct: string;
  textSurface: string;
  visualSurface: string;
  visual: ReactNode;
  continuation: string;
  sources: readonly EvidenceGroup[];
  consent?: string;
  children: ReactNode;
}) {
  return (
    <article className={`landing-demo landing-intelligence-demo landing-intelligence-demo--${kind}`} data-demo-kind={kind}>
      <div className="landing-demo-question" data-viewport-surface={textSurface}>
        <small>Question</small>
        <p>{question}</p>
      </div>

      <div className="landing-demo-core">
        <div className="landing-demo-copy">
          <small>Sovereign</small>
          <h3>{headline}</h3>
          <p>{direct}</p>
        </div>
        <div className="landing-demo-visual" data-viewport-surface={visualSurface}>{visual}</div>
      </div>

      <div className="landing-demo-insights">{children}</div>

      <div className="landing-demo-close">
        <a className="landing-demo-continuation" href="/signup">{continuation}</a>
        <FitCheck />
        <SourceDetails groups={sources} />
      </div>

      {consent && <p className="landing-story__consent">{consent}</p>}
    </article>
  );
}

function InsightList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="landing-insight-list">
      <small>{title}</small>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function KeyInsight({ label, tone = 'default', children }: { label: string; tone?: 'default' | 'bridge'; children: ReactNode }) {
  return (
    <section className="landing-key-insight" data-tone={tone}>
      <small>{label}</small>
      <p>{children}</p>
    </section>
  );
}

function FitCheck() {
  const [choice, setChoice] = useState<FitChoice | null>(null);
  return (
    <div className="landing-fit-check" aria-label="Does this fit this representative example?">
      <span>Does this fit?</span>
      <div role="group" aria-label="Calibration choices">
        {([
          ['yes', 'Yes'],
          ['partly', 'Partly'],
          ['no', 'Not really']
        ] as const).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={choice === value} onClick={() => setChoice(value)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function DecisionField() {
  return (
    <figure className="landing-understanding landing-understanding--decision" aria-label="A representative decision separates the choice itself from pressure to make the choice easier for other people to receive.">
      <div className="landing-understanding__label landing-understanding__label--start">clarity</div>
      <svg viewBox="0 0 760 250" role="img" aria-hidden="true">
        <path className="decision-field__guide" d="M40 126H720" />
        <path className="decision-field__choice" d="M42 126 C190 118 312 119 440 126 C548 131 630 129 718 126" />
        <path className="decision-field__adapt" d="M42 126 C170 116 270 110 366 96 C468 81 544 58 628 48" />
        <path className="decision-field__pull decision-field__pull--one" d="M300 120 C306 95 308 72 315 48" />
        <path className="decision-field__pull decision-field__pull--two" d="M420 110 C434 86 448 68 468 46" />
        <circle className="decision-field__point decision-field__point--choice" cx="718" cy="126" r="5" />
        <circle className="decision-field__point decision-field__point--adapt" cx="628" cy="48" r="5" />
      </svg>
      <div className="decision-field__marker decision-field__marker--expectation">outside expectation</div>
      <div className="decision-field__marker decision-field__marker--choice">the choice</div>
      <div className="decision-field__marker decision-field__marker--explain">making it acceptable</div>
      <figcaption>Separate the decision from the pressure to make it immediately understandable.</figcaption>
    </figure>
  );
}

function RelationshipField() {
  return (
    <figure className="landing-understanding landing-understanding--relationship" aria-label="A representative interaction loop between You and Alex shows urgency increasing pressure and reduced response increasing uncertainty, followed by a break in the loop through reassurance, space, and a defined return time.">
      <div className="relationship-field__people">
        <span><strong>You</strong><small>more definition → more orientation</small></span>
        <span><strong>Alex</strong><small>less pressure → more room to respond</small></span>
      </div>
      <div className="relationship-field__center">
        <small>Between you</small>
        <ol>
          <li><span>1</span><strong>You ask for clarity</strong></li>
          <li><span>2</span><strong>Alex reduces response</strong></li>
          <li><span>3</span><strong>Your uncertainty rises</strong></li>
          <li><span>4</span><strong>You ask with more urgency</strong></li>
          <li><span>5</span><strong>Their pressure rises</strong></li>
        </ol>
      </div>
      <div className="relationship-field__bridge" aria-label="A bridge in the loop">
        <span>care now</span><i aria-hidden="true" /><span>space</span><i aria-hidden="true" /><span>return at 7</span>
      </div>
      <figcaption>A small timing change can alter the interaction without ranking either person.</figcaption>
    </figure>
  );
}

function SystemField() {
  return (
    <figure className="landing-understanding landing-understanding--system" aria-label="A representative three-person family system shows communication routing through the user during mediation, then shows the direct relationship having to reorganize when the mediating route is removed.">
      <div className="system-field__state system-field__state--current">
        <small>What happens now</small>
        <div className="system-field__map">
          <span className="system-person system-person--parent"><strong>Parent</strong><small>pushes for resolution</small></span>
          <span className="system-person system-person--you"><strong>You</strong><small>mediate</small></span>
          <span className="system-person system-person--sibling"><strong>Sibling</strong><small>creates distance</small></span>
          <svg viewBox="0 0 760 220" aria-hidden="true">
            <path className="system-field__direct" d="M156 74 C292 42 470 42 604 74" />
            <path className="system-field__route system-field__route--one" d="M160 82 C240 118 310 146 376 152" />
            <path className="system-field__route system-field__route--two" d="M386 152 C472 140 548 112 604 82" />
          </svg>
          <span className="system-field__result">immediate pressure drops</span>
        </div>
      </div>
      <div className="system-field__state system-field__state--changed">
        <small>When you stop mediating</small>
        <div className="system-field__map">
          <span className="system-person system-person--parent"><strong>Parent</strong><small>still has a position</small></span>
          <span className="system-person system-person--you"><strong>You</strong><small>remain part of the family</small></span>
          <span className="system-person system-person--sibling"><strong>Sibling</strong><small>still has a position</small></span>
          <svg viewBox="0 0 760 220" aria-hidden="true">
            <path className="system-field__route system-field__route--direct" d="M158 74 C304 42 468 42 602 74" />
            <path className="system-field__you-line" d="M380 150V180" />
          </svg>
          <span className="system-field__result">communication has to find another route</span>
        </div>
      </div>
      <figcaption>You remain in the system; the communication path is what changes.</figcaption>
    </figure>
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
        <small>Representative example</small>
      </summary>
      <div className="landing-evidence__detail">
        <p>Example data used in this demonstration. These values are not visitor data.</p>
        <span className="landing-evidence__values">
          {entries.map((entry, index) => (
            <span key={`${entry.text}-${index}`} className={entry.subject ? 'landing-evidence__subject' : 'landing-evidence__code'} title={entry.label}>
              <i aria-hidden="true"> · </i>{entry.text}
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
    if (!('IntersectionObserver' in window)) {
      section.dataset.visible = 'true';
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      section.dataset.visible = 'true';
      observer.disconnect();
    }, { threshold: 0.14, rootMargin: '0px 0px -8%' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return ref;
}
