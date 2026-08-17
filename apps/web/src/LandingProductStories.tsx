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

const SELF_BASELINE: readonly EvidenceGroup[] = [
  {
    points: [
      { code: 'GK 13.4', label: 'Illustrative Gene Key activation' },
      { code: 'GATE 4.11', label: 'Illustrative Baseline gate and line' },
      { code: 'MARS · CANCER', label: 'Illustrative natal Mars placement' }
    ]
  }
] as const;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [{ code: 'GATE 22.4', label: 'Illustrative personality gate and line' }]
  },
  {
    name: 'Partner',
    points: [{ code: 'GATE 57.2', label: 'Illustrative personality gate and line' }]
  }
] as const;

const SELF_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'What your Baseline supports',
    body: 'Steadiness and responsibility are relevant to this question, so Sovereign starts there instead of treating the prompt in isolation.'
  },
  {
    kind: 'read',
    title: 'What changes under pressure',
    body: 'When uncertainty rises, steadiness can become taking responsibility for whether everyone else is okay.',
    chips: ['GK 13.4', 'MARS · CANCER']
  },
  {
    kind: 'connect',
    title: 'Where responsibility shifts',
    body: 'Helping is different from owning another person’s outcome. Repeatedly resolving uncertainty can teach the group to return it to you.'
  },
  {
    kind: 'direction',
    title: 'A cleaner boundary',
    body: 'Care can remain while the outcome stays with the person who actually owns it.'
  }
] as const;

const FAMILY = [
  {
    id: 'you',
    name: 'You',
    context: 'Often resolves',
    route: 'Unresolved decisions return here',
    effect: 'Responsibility concentrates around the person who usually closes the loop.'
  },
  {
    id: 'partner',
    name: 'Partner',
    context: 'Moves toward action',
    route: 'Pushes the decision forward',
    effect: 'Speed can increase pressure before everyone has reached clarity.'
  },
  {
    id: 'child',
    name: 'Child',
    context: 'Waits for direction',
    route: 'Defers when uncertainty rises',
    effect: 'Waiting leaves more of the unresolved decision in the shared system.'
  },
  {
    id: 'elder',
    name: 'Elder',
    context: 'Holds expectation',
    route: 'Reinforces the familiar route',
    effect: 'Existing expectations make the usual resolver feel like the obvious destination.'
  }
] as const;

export function LandingProductStories() {
  return (
    <div className="landing-stories" data-product-stories="v0-motion-workflows">
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
        <StoryHeading step="01 · You" title="Separate helping from carrying the outcome.">
          Sovereign uses your Baseline to distinguish what is genuinely yours to bring from what pressure may be pulling you to take over.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="personal">
          <ChatWindow title="Sovereign — Personal" surface="personal-chat">
            <Message side="user">Why do I keep becoming responsible for everyone else’s stability?</Message>
            <Message side="assistant">
              Your Baseline supports steadiness and responsibility. Under pressure, that strength can turn into carrying outcomes you do not control. The useful distinction is between helping and becoming responsible for whether everyone is okay.
              <BaselineTrace groups={SELF_BASELINE} />
            </Message>
            <Message side="user">How do I stop without feeling selfish?</Message>
            <ComposerPreview>What changes if I stop carrying the outcome?</ComposerPreview>
          </ChatWindow>
          <WorkflowPanel title="How Sovereign gets there" steps={SELF_FLOW} surface="personal-reasoning" />
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
        <StoryHeading step="02 · You + 1" title="Understand what happens between you.">
          With permission, Sovereign keeps each person’s supplied context distinct, then examines the interaction without claiming motives or private feelings.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <ChatWindow title="Sovereign — Relationship" surface="relationship-chat">
            <Message side="user">Why does the same conversation feel urgent to my partner and unfinished to me?</Message>
            <Message side="assistant">
              You may need time to settle into clarity. Your partner may recognize a position quickly. The friction is not necessarily about commitment; it may be about pace.
              <BaselineTrace groups={DUO_BASELINE} />
            </Message>
            <ComposerPreview>What keeps happening between us?</ComposerPreview>
          </ChatWindow>
          <RelationshipContext />
        </div>
        <p className="landing-story__consent">Illustrative shared context · Permission required · No compatibility score · No private-thought claims</p>
      </div>
    </section>
  );
}

function SystemStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="system" className="landing-story landing-story--system" data-viewport-section="system">
      <div className="landing-story__shell">
        <StoryHeading step="03 · Your people" title="See where responsibility keeps landing.">
          Sovereign keeps roles, responsibility, authority, pressure, and unknown perspectives separate so the recurring route becomes easier to see.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <ChatWindow title="Sovereign — Family System" surface="system-map">
            <Message side="user">Why does every family decision eventually become my job to resolve?</Message>
            <Message side="assistant">
              In this supplied example, uncertainty changes the route of the decision: one person pushes toward action, one waits, one reinforces the familiar expectation, and unresolved decisions keep returning to you. That is a system pattern—not proof that any one person is the cause.
            </Message>
            <FamilySystemMap />
            <ComposerPreview>What changes if the next decision stays with its actual owner?</ComposerPreview>
          </ChatWindow>
          <SystemContext />
        </div>
        <p className="landing-story__consent">Sanitized supplied system context · Each person controls what may be included</p>
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

function ChatWindow({ title, surface, children }: { title: string; surface: string; children: ReactNode }) {
  return (
    <article className="landing-demo landing-demo--chat" data-viewport-surface={surface}>
      <header className="landing-demo__bar">
        <span className="landing-demo__traffic" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
      </header>
      <div className="landing-demo__body">{children}</div>
    </article>
  );
}

function Message({ side, children }: { side: 'user' | 'assistant'; children: ReactNode }) {
  return <div className={`landing-message landing-message--${side}`} data-message-side={side}><div>{children}</div></div>;
}

function ComposerPreview({ children }: { children: ReactNode }) {
  return <div className="landing-composer"><span>{children}</span><i aria-hidden="true">→</i></div>;
}

function BaselineTrace({ groups }: { groups: readonly EvidenceGroup[] }) {
  const entries = groups.flatMap((group) => [
    ...(group.name ? [{ text: group.name, label: `${group.name} Baseline`, subject: true }] : []),
    ...group.points.map((point) => ({ text: point.code, label: point.label, subject: false }))
  ]);
  return (
    <div className="landing-evidence" aria-label={`Basis. ${entries.map((entry) => entry.text).join('. ')}`}>
      <strong>Basis</strong>
      <span className="landing-evidence__values">
        {entries.map((entry, index) => (
          <span key={`${entry.text}-${index}`} className={entry.subject ? 'landing-evidence__subject' : 'landing-evidence__code'} title={entry.label}>
            <i aria-hidden="true"> · </i>{entry.text}
          </span>
        ))}
      </span>
    </div>
  );
}

function RelationshipContext() {
  return (
    <article className="landing-demo landing-demo--context landing-demo--relationship-context" data-viewport-surface="relationship-reasoning">
      <header className="landing-demo__bar landing-demo__bar--context">
        <span>Keeping both people distinct</span>
        <small>Shared with permission</small>
      </header>
      <div className="landing-context-view landing-context-view--relationship">
        <section>
          <small>You</small>
          <strong>Clarity may take time.</strong>
          <span>A pause can be part of processing rather than disengagement.</span>
        </section>
        <section>
          <small>Partner</small>
          <strong>Clarity may arrive quickly.</strong>
          <span>A direct answer can reflect certainty rather than pressure.</span>
        </section>
        <div className="landing-context-distinction">
          <small>Between you</small>
          <strong>Different timing can be mistaken for different commitment.</strong>
          <span>The useful distinction is pace, not who cares more.</span>
        </div>
      </div>
    </article>
  );
}

function SystemContext() {
  return (
    <article className="landing-demo landing-demo--context landing-demo--system-context" data-viewport-surface="system-reasoning">
      <header className="landing-demo__bar landing-demo__bar--context">
        <span>What Sovereign separates</span>
        <small>Illustrative supplied context</small>
      </header>
      <div className="landing-context-view landing-context-view--system">
        <section>
          <small>Observed route</small>
          <strong>Where the unresolved decision moves when pressure rises.</strong>
        </section>
        <section>
          <small>Responsibility</small>
          <strong>Who is expected to close the loop versus who actually owns the outcome.</strong>
        </section>
        <section>
          <small>Testable change</small>
          <strong>What happens if resolution no longer defaults to one person.</strong>
        </section>
      </div>
    </article>
  );
}

function WorkflowPanel({ title, steps, surface }: { title: string; steps: readonly WorkflowStep[]; surface: string }) {
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
                  <small>{step.kind === 'direction' ? 'Useful direction' : `Step ${index + 1}`}</small>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </span>
              </button>
              {step.chips && <div className="landing-workflow__chips">{step.chips.map((chip) => <code key={chip}>{chip}</code>)}</div>}
            </li>
          );
        })}
      </ol>
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

function FamilySystemMap() {
  const [activeId, setActiveId] = useState<(typeof FAMILY)[number]['id']>('you');
  const active = FAMILY.find((member) => member.id === activeId) ?? FAMILY[0];

  return (
    <div className="landing-system-map" aria-label="Illustrative family system map showing how unresolved decisions move under pressure">
      <div className="landing-system-map__condition">
        <small>When uncertainty rises</small>
        <strong>The route of the decision changes.</strong>
      </div>
      <svg viewBox="0 0 720 360" aria-hidden="true" focusable="false">
        <path className={activeId === 'partner' ? 'is-active' : ''} d="M 585 82 C 510 115 452 146 378 180" />
        <path className={activeId === 'child' ? 'is-active' : ''} d="M 585 278 C 500 252 450 220 378 180" />
        <path className={activeId === 'elder' ? 'is-active' : ''} d="M 135 82 C 220 110 275 144 342 180" />
        <path className="is-primary" d="M 360 180 C 300 220 228 250 135 278" />
        <path className="is-secondary" d="M 135 82 C 260 28 470 30 585 82" />
      </svg>
      <div className="landing-system-map__core" aria-hidden="true">
        <span>Decision pressure</span>
        <strong>Unresolved choices converge</strong>
      </div>
      <div className="landing-system-map__nodes">
        {FAMILY.map((member, index) => (
          <button
            key={member.id}
            type="button"
            className={member.id === activeId ? 'is-active' : ''}
            data-position={index + 1}
            onClick={() => setActiveId(member.id)}
            aria-pressed={member.id === activeId}
          >
            <span>{member.name}</span>
            <small>{member.context}</small>
          </button>
        ))}
      </div>
      <div className="landing-system-map__evidence" aria-live="polite">
        <small>Selected observation</small>
        <strong>{active.name} · {active.route}</strong>
        <span>{active.effect}</span>
      </div>
      <div className="landing-system-map__test">
        <small>What to test</small>
        <strong>Leave the next unresolved decision with its actual owner.</strong>
      </div>
    </div>
  );
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
        timers.push(window.setTimeout(() => setIndex(step), 360 + step * 900));
      }
    };

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        reveal();
        observer?.disconnect();
      }, { threshold: 0.28 });
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
