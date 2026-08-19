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

/*
 * Public examples use sanitized representative fixture values, not visitor data.
 * Each answer below is authored against the same exact example sources available
 * inside its collapsed source-details disclosure.
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

const SELF_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with the question',
    body: 'What changed because the idea became clearer, and what changed mainly because you anticipated someone else’s reaction?'
  },
  {
    kind: 'connect',
    title: 'Find the useful difference',
    body: 'Sovereign uses only the Baseline context that helps separate clarity from pre-emptive editing.'
  },
  {
    kind: 'direction',
    title: 'Give you something you can try',
    body: 'Compare a pre-feedback version with the revision and notice what became clearer versus easier to defend.'
  }
] as const;

const RELATIONSHIP_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with what happened',
    body: 'You want resolution now. Your partner gets quieter. Urgency rises for you while pressure rises for them.'
  },
  {
    kind: 'connect',
    title: 'Show what happens between you',
    body: 'More urgency can create more pressure; less response can create more uncertainty; each move can intensify the next one.'
  },
  {
    kind: 'direction',
    title: 'Find a lower-pressure next step',
    body: 'Make care clear now, then agree on a specific time to return to the unresolved part.'
  }
] as const;

const SYSTEM_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with what you told Sovereign',
    body: 'One person pushes for resolution, another pulls back, and you repeatedly become the mediator.'
  },
  {
    kind: 'connect',
    title: 'Show how pressure moves',
    body: 'Mediation lowers tension quickly, which can make the same route easier for the group to reuse later.'
  },
  {
    kind: 'direction',
    title: 'Change one thing and watch what happens',
    body: 'Show why the role keeps returning, then test one change: stop carrying messages for one cycle.'
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
          Ask a real question. Sovereign uses only the Baseline context that matters, then gives you a clear distinction and a next step.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="personal">
          <WorkflowPanel
            title="How Sovereign builds the answer"
            steps={SELF_FLOW}
            result="A simple test: is the change making the idea clearer to you, or mainly easier to defend?"
            surface="personal-reasoning"
          />
          <ChatWindow title="Sovereign — You" surface="personal-chat" composer="What changes when feedback comes too early?">
            <Message side="user">Am I refining this idea—or editing myself to avoid other people’s reactions?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="You may be editing for acceptance before the idea is finished. A useful test is simple: if the change makes the idea clearer to you, keep it. If it mainly makes the idea easier to defend, wait."
                sections={[
                  { label: 'What may be happening', body: 'You notice how work will land. Under pressure, that strength can turn into pre-emptive editing.' },
                  { label: 'Try this', body: 'Save one version before feedback. Compare revisions: what became clearer, and what changed mainly to avoid a reaction?', tone: 'bridge' },
                  { label: 'Still unknown', body: 'Good feedback can improve the work. Sovereign cannot judge the quality of a specific edit for you.', tone: 'unknown' }
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
          With permission, Sovereign keeps both people separate, shows the interaction loop, and suggests a next move without guessing private motives.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <WorkflowPanel
            title="How Sovereign compares two people"
            steps={RELATIONSHIP_FLOW}
            result="Name the loop, then lower pressure without leaving the issue indefinite."
            surface="relationship-reasoning"
          />
          <ChatWindow title="Sovereign — Relationship" surface="relationship-chat" composer="What would make the next conversation easier?">
            <Message side="user">I want to resolve things now. My partner goes quiet. Why does that make us both feel worse?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="You may be stuck in a timing loop: your need for clarity adds urgency; their need for space reduces response; less response raises your uncertainty, so you push harder."
                sections={[
                  { label: 'The loop', body: 'You ask for more definition → they pull back → uncertainty rises → you ask with more urgency → pressure rises.', tone: 'distinction' },
                  { label: 'A bridge', body: 'Separate reassurance from resolution: “I care about this. Can we come back at 7 and decide only what happens next?”', tone: 'bridge' },
                  { label: 'Still unknown', body: 'Silence does not tell us what your partner privately feels or intends. That remains theirs to name.', tone: 'unknown' }
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
          Map the people, roles, and pressure sequence. Sovereign shows where the pattern repeats and what changes when you stop carrying one part of it.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <WorkflowPanel
            title="How Sovereign reads a system"
            steps={SYSTEM_FLOW}
            result="See why mediation keeps returning, then remove one relay point and watch what the system does next."
            surface="system-reasoning"
          />
          <ChatWindow title="Sovereign — Family System" surface="system-map" composer="What changes if I stop carrying messages?">
            <Message side="user">Why do I keep ending up as the mediator in my family?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="Because mediation works in the short term. One person pushes, another pulls back, and you become the fastest route to relief—so the group keeps reusing that route."
                sections={[
                  { label: 'The pattern', body: 'Pressure rises → participation drops → you step between positions → tension falls for the moment.', tone: 'distinction' },
                  { label: 'Change one thing', body: 'Do not carry one message between people. Ask each person to state their own position and next step directly.', tone: 'bridge' },
                  { label: 'Still unknown', body: 'Sovereign does not know what an absent person privately feels or why they withdraw unless they tell you.', tone: 'unknown' }
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
  composer: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="landing-demo landing-demo--chat" data-viewport-surface={surface}>
      <header className="landing-demo__bar">
        <span className="landing-demo__traffic" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
      </header>
      <div className="landing-demo__body">{children}</div>
      <div className="landing-demo__composer-shell"><ComposerPreview>{composer}</ComposerPreview></div>
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
            <small>{section.label}</small>
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
