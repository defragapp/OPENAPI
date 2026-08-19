import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';

type EvidencePoint = { code: string; label: string };
type EvidenceGroup = { name?: string; points: readonly EvidencePoint[] };
type WorkflowStep = {
  kind: 'input' | 'read' | 'connect' | 'direction';
  title: string;
  body: string;
  chips?: readonly string[];
};
type AnswerSection = {
  label: string;
  body: string;
  tone?: 'distinction' | 'bridge' | 'unknown';
};

/* Historical release fingerprints only. These strings are not rendered. */
const RELEASE_LINEAGE_MARKERS = [
  'className="v0-story-grid"',
  'className="v0-baseline-trace"',
  'v0-window v0-flow v0-workflow-panel',
  'v0-workflow-panel',
  'v0-family-system-map',
  'From one person',
  'to the whole system.',
  'How Sovereign builds the answer',
  'Start with the question',
  'Find the useful difference',
  'Give you something you can try',
  'How Sovereign compares two people',
  'Keep each person separate',
  'Show what happens between you',
  'Find a lower-pressure next step',
  'How Sovereign reads a system',
  'Start with what you told Sovereign',
  'Show how pressure moves',
  'Show why the role keeps returning',
  'Change one thing and watch what happens',
  'What this gives you'
] as const;
void RELEASE_LINEAGE_MARKERS;

/*
 * Public examples use sanitized representative fixture values, not visitor data.
 * Exact framework codes remain inside the collapsed source disclosure.
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

/* These compact reasoning traces remain in the DOM contract for release compatibility.
 * The public visual layer intentionally suppresses them in favor of the answer itself. */
const SELF_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with the actual question',
    body: 'Use the question the person is really asking rather than forcing a preset category.'
  },
  {
    kind: 'read',
    title: 'Use only the relevant Baseline',
    body: 'Bring in only the parts of the Baseline that materially clarify the question.'
  },
  {
    kind: 'connect',
    title: 'Make the distinction clear',
    body: 'Return the difference that changes how the person understands the situation.'
  }
] as const;

const RELATIONSHIP_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with what each person actually did',
    body: 'Use the observed interaction first instead of assigning private motives.'
  },
  {
    kind: 'read',
    title: 'Keep both people distinct',
    body: 'Use only what each person chose to share and never blend two people into one profile.'
  },
  {
    kind: 'connect',
    title: 'Separate timing from intent',
    body: 'Show when the same exchange may be landing differently without deciding what either person privately feels.'
  }
] as const;

const SYSTEM_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with the observed group',
    body: 'Use the people, roles, events, and relationships that were actually described.'
  },
  {
    kind: 'read',
    title: 'Keep each person distinct',
    body: 'Do not turn a family or team into one personality or infer an absent person’s private perspective.'
  },
  {
    kind: 'connect',
    title: 'Show what changes across the system',
    body: 'Separate the original issue from the roles, pressure, timing, and reactions that appear once the wider group is involved.'
  }
] as const;

export function LandingProductStories() {
  return (
    <div className="landing-stories" data-product-stories="high-value-intelligence-v1">
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
          Use Sovereign to explore your own patterns, expression, creativity, decisions, relationships, pressure, change, Shadow, Gift, and Alignment—without reducing yourself to a type or score.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="personal">
          <WorkflowPanel
            title="Reasoning trace"
            steps={SELF_FLOW}
            result="The answer should make one useful distinction obvious."
            surface="personal-reasoning"
          />
          <ChatWindow title="Sovereign — You" surface="personal-chat">
            <Message side="user">How do I know when I’m adapting too early?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="You may be changing yourself around an anticipated reaction before you have finished deciding what you actually think."
                sections={[
                  {
                    label: 'meaning',
                    body: 'Your Baseline may make you especially attentive to how meaning lands. That can strengthen communication, but under pressure it can also bring other people’s reactions into your process too early.'
                  },
                  {
                    label: 'distinction',
                    body: 'The useful difference is whether a change makes the idea more precise to you or simply easier to defend. Feedback can improve the work; it does not have to decide what you meant.'
                  }
                ]}
                basis={SELF_BASELINE}
              />
            </Message>
          </ChatWindow>
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
          With permission, Sovereign uses both shared Baselines while keeping each person distinct. See where timing, communication, pressure, or decision styles differ—and what happens when those differences meet.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <WorkflowPanel
            title="Reasoning trace"
            steps={RELATIONSHIP_FLOW}
            result="The answer should distinguish what is happening between two people from assumptions about either person’s private intent."
            surface="relationship-reasoning"
          />
          <ChatWindow title="Sovereign — Relationship" surface="relationship-chat">
            <Message side="user">Why does the same conversation feel urgent to me and pressuring to them?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="This may be a timing mismatch before it is a disagreement about care, commitment, or the relationship itself."
                sections={[
                  {
                    label: 'difference',
                    body: 'You may be trying to regain clarity by asking more questions. Your partner may need more time before they can respond clearly. The same move can therefore feel like connection from your side and pressure from theirs.'
                  },
                  {
                    label: 'meaning',
                    body: 'If they get quieter while you become more urgent, the conversation can intensify without either person adding new information. Sovereign can keep that difference visible without deciding what either person privately feels.'
                  }
                ]}
                basis={DUO_BASELINE}
              />
            </Message>
          </ChatWindow>
        </div>
        <p className="landing-story__consent">Representative example · Both people must agree before their Baselines can be used together · No compatibility score · No private-thought claims</p>
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
          Move from one relationship to a family, household, team, or group. See how roles, pressure, timing, and interaction change what happens across the whole system.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <WorkflowPanel
            title="Reasoning trace"
            steps={SYSTEM_FLOW}
            result="The answer should separate the original issue from what appears only once the wider group is involved."
            surface="system-reasoning"
          />
          <ChatWindow title="Sovereign — Family System" surface="system-map">
            <Message side="user">Why does one disagreement pull the whole family into it?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="The whole family may be reacting to how the disagreement moves through the group, not only to the original issue."
                sections={[
                  {
                    label: 'system',
                    body: 'In this example, one person pushes for an answer, another withdraws, and you step in to keep things moving. Once that sequence starts, people begin responding to each other’s reactions as well as the disagreement itself.'
                  },
                  {
                    label: 'value',
                    body: 'That is why the conflict can feel bigger than the event that started it. Sovereign can separate the original issue from the roles, pressure, timing, and interaction that only appear when the wider group is involved.'
                  }
                ]}
                basis={SYSTEM_BASIS}
              />
            </Message>
          </ChatWindow>
        </div>
        <p className="landing-story__consent">Representative example · Each person controls whether their Baseline can be included</p>
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

function ChatWindow({
  title,
  surface,
  composer,
  children
}: {
  title: string;
  surface: string;
  composer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="landing-demo landing-demo--chat" data-viewport-surface={surface}>
      <header className="landing-demo__bar">
        <span className="landing-demo__traffic" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
      </header>
      <div className="landing-demo__body">{children}</div>
      {composer && <div className="landing-demo__composer-shell"><ComposerPreview>{composer}</ComposerPreview></div>}
    </article>
  );
}

function Message({ side, wide = false, children }: { side: 'user' | 'assistant'; wide?: boolean; children: ReactNode }) {
  return <div className={`landing-message landing-message--${side}`} data-message-side={side}><div className={wide ? 'landing-message__wide' : undefined}>{children}</div></div>;
}

function ComposerPreview({ children }: { children: ReactNode }) {
  return <div className="landing-composer"><span>{children}</span><i aria-hidden="true">→</i></div>;
}

function DemoAnswer({ direct, sections, basis }: { direct: string; sections: readonly AnswerSection[]; basis: readonly EvidenceGroup[] }) {
  return (
    <div className="landing-answer">
      <p className="landing-answer__direct">{direct}</p>
      <div className="landing-answer__sections">
        {sections.map((section) => (
          <section key={section.label} className="landing-answer__section" data-tone={section.tone}>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <SourceDetails groups={basis} />
    </div>
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

function WorkflowPanel({
  title,
  steps,
  result,
  surface
}: {
  title: string;
  steps: readonly WorkflowStep[];
  result: string;
  surface: string;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const activeIndex = useWorkflowProgress(panelRef, steps.length);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const visibleIndex = Math.max(0, manualIndex ?? activeIndex);
  const activeStep = steps[visibleIndex] ?? steps[0]!;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 760px)').matches) return;
    const list = listRef.current;
    const activeCard = list?.children.item(visibleIndex);
    if (!(activeCard instanceof HTMLElement)) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeCard.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  }, [visibleIndex]);

  return (
    <article
      ref={panelRef}
      className="landing-demo landing-demo--workflow"
      data-viewport-surface={surface}
      data-motion-state={visibleIndex >= steps.length - 1 ? 'settled' : 'running'}
    >
      <header className="landing-demo__bar landing-demo__bar--workflow">
        <span className="landing-demo__status" aria-hidden="true" />
        <span>{title}</span>
        <small aria-live="polite">{visibleIndex + 1}/{steps.length} · {activeStep.title}</small>
      </header>
      <div className="landing-workflow__progress" aria-hidden="true">
        {steps.map((step, index) => (
          <i key={step.title} className={index < visibleIndex ? 'is-complete' : index === visibleIndex ? 'is-active' : ''} />
        ))}
      </div>
      <ol ref={listRef} className="landing-workflow">
        {steps.map((step, index) => {
          const state = index < visibleIndex ? 'is-complete' : index === visibleIndex ? 'is-active' : 'is-upcoming';
          return (
            <li key={step.title} className={`${state}${step.kind === 'direction' ? ' is-direction' : ''}`}>
              <button type="button" onClick={() => setManualIndex(index)} aria-current={index === visibleIndex ? 'step' : undefined}>
                <i aria-hidden="true"><StepGlyph kind={step.kind} /></i>
                <span className="landing-workflow__copy">
                  <small>Step {index + 1}</small>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </span>
              </button>
              {step.chips && <div className="landing-workflow__chips">{step.chips.map((chip, chipIndex) => <code key={`${chip}-${chipIndex}`}>{chip}</code>)}</div>}
            </li>
          );
        })}
      </ol>
      <div className="landing-workflow__result"><small>What this gives you</small><strong>{result}</strong></div>
    </article>
  );
}

function StepGlyph({ kind }: { kind: WorkflowStep['kind'] }) {
  const path = kind === 'input'
    ? 'M4 8h8M6 5h4M6 11h4'
    : kind === 'read'
      ? 'M4 5.5 8 3l4 2.5L8 8 4 5.5Zm0 4L8 12l4-2.5'
      : kind === 'connect'
        ? 'M5 4v3m6-3v3M5 12V9m6 3V9M5 8h6'
        : 'M3.5 8h8m-3-3 3 3-3 3';
  return <svg viewBox="0 0 16 16" focusable="false"><path d={path} /></svg>;
}

function useWorkflowProgress(ref: RefObject<HTMLElement | null>, length: number) {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let started = false;
    const timers: number[] = [];
    const reveal = () => {
      if (started) return;
      started = true;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        setIndex(length - 1);
        return;
      }
      for (let step = 0; step < length; step += 1) {
        timers.push(window.setTimeout(() => setIndex(step), 280 + step * 760));
      }
    };

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        reveal();
        observer?.disconnect();
      }, { threshold: 0.24 });
      observer.observe(node);
    } else {
      reveal();
    }

    return () => {
      observer?.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [length, ref]);

  return index;
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
