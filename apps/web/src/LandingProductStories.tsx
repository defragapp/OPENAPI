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
    title: 'How you tend to create',
    body: 'Sovereign starts with the parts of your Baseline that relate to creativity, expression, and decision-making instead of treating the question as generic.'
  },
  {
    kind: 'read',
    title: 'What changes under pressure',
    body: 'When outside expectations arrive too early, expression may narrow into explaining, defending, or refining the idea before it has room to develop.',
    chips: ['GK 13.4', 'MARS · CANCER']
  },
  {
    kind: 'connect',
    title: 'What feels aligned',
    body: 'Alignment may look like enough room to recognize the direction as yours before adapting it to other people, constraints, or expectations.'
  },
  {
    kind: 'direction',
    title: 'What to explore next',
    body: 'Compare the conditions where your work becomes clearer with the conditions where it becomes harder to recognize as your own.'
  }
] as const;

const FAMILY = [
  {
    id: 'you',
    name: 'You',
    context: 'Moves toward mediation',
    route: 'Tries to keep the group connected',
    effect: 'Conflict can pull you toward stabilizing the relationship between other people.'
  },
  {
    id: 'parent',
    name: 'Parent',
    context: 'Pushes for resolution',
    route: 'Sets the pace when pressure rises',
    effect: 'Formal or informal authority can make one person’s urgency shape the whole group.'
  },
  {
    id: 'sibling',
    name: 'Sibling',
    context: 'Creates distance',
    route: 'Participates less when tension rises',
    effect: 'Withdrawal changes what everyone else has to interpret without revealing the reason for it.'
  },
  {
    id: 'partner',
    name: 'Partner',
    context: 'Sees the family from outside',
    route: 'Notices patterns the family treats as normal',
    effect: 'An outside perspective can make familiar expectations easier to see.'
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
        <StoryHeading step="01 · You" title="Explore how you think, decide, create, connect, and grow.">
          Use Sovereign to explore your own expression, creativity, decisions, relationships, pressure, change, Shadow, Gift, and Alignment—without reducing yourself to a type or score.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="personal">
          <ChatWindow title="Sovereign — You" surface="personal-chat">
            <Message side="user">What does Alignment look like for me when I’m creating something new?</Message>
            <Message side="assistant">
              Alignment may show up less as instant certainty and more as coherence: the idea becomes easier to shape when you have enough room to explore it before adapting it to other people’s expectations.
              <BaselineTrace groups={SELF_BASELINE} />
            </Message>
            <Message side="user">What changes in me when I’m under pressure?</Message>
            <ComposerPreview>How do I create when I’m most like myself?</ComposerPreview>
          </ChatWindow>
          <WorkflowPanel title="How Sovereign explores the question" steps={SELF_FLOW} surface="personal-reasoning" />
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
        <StoryHeading step="02 · You + your people" title="Understand what happens between you.">
          With permission, Sovereign keeps each person distinct so you can see where you differ, what you share, and how the interaction changes between you.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <ChatWindow title="Sovereign — Relationship" surface="relationship-chat">
            <Message side="user">Why does the same situation land differently for us?</Message>
            <Message side="assistant">
              You may need more time to settle into clarity while your partner may recognize a position quickly. The difference does not have to mean one person cares more; it may be a difference in pace and processing.
              <BaselineTrace groups={DUO_BASELINE} />
            </Message>
            <ComposerPreview>What happens between us when pressure rises?</ComposerPreview>
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
        <StoryHeading step="03 · From 1:1 to the whole system" title="See the whole system.">
          Move from one relationship to a family, household, team, or group. See roles, expectations, authority, responsibility, pressure, and different perspectives together.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <ChatWindow title="Sovereign — Family System" surface="system-map">
            <Message side="user">Why does everyone fall back into the same roles when my family is under pressure?</Message>
            <Message side="assistant">
              In this supplied example, pressure changes how each person participates: one moves toward mediation, one pushes for resolution, one creates distance, and one sees the family from outside. The useful view is the whole arrangement—not one person as the cause.
            </Message>
            <FamilySystemMap />
            <ComposerPreview>What changes if one person stops returning to the familiar role?</ComposerPreview>
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
          <span>The distinction is pace, not who cares more.</span>
        </div>
      </div>
    </article>
  );
}

function SystemContext() {
  return (
    <article className="landing-demo landing-demo--context landing-demo--system-context" data-viewport-surface="system-reasoning">
      <header className="landing-demo__bar landing-demo__bar--context">
        <span>Seeing the whole system</span>
        <small>Illustrative supplied context</small>
      </header>
      <div className="landing-context-view landing-context-view--system">
        <section>
          <small>Roles</small>
          <strong>Who moves toward, away from, or around the pressure.</strong>
        </section>
        <section>
          <small>Authority + expectations</small>
          <strong>Who sets the pace, who gets listened to, and what the group expects each person to do.</strong>
        </section>
        <section>
          <small>Missing perspective</small>
          <strong>Whose experience or information is not represented yet.</strong>
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
                  <small>{step.kind === 'direction' ? 'Explore next' : `Step ${index + 1}`}</small>
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
    <div className="landing-system-map" aria-label="Illustrative family system map showing how familiar roles reappear under pressure">
      <div className="landing-system-map__condition">
        <small>When family pressure rises</small>
        <strong>Familiar roles become easier to see.</strong>
      </div>
      <svg viewBox="0 0 720 360" aria-hidden="true" focusable="false">
        <path className={activeId === 'parent' ? 'is-active' : ''} d="M 585 82 C 510 115 452 146 378 180" />
        <path className={activeId === 'sibling' ? 'is-active' : ''} d="M 585 278 C 500 252 450 220 378 180" />
        <path className={activeId === 'partner' ? 'is-active' : ''} d="M 135 82 C 220 110 275 144 342 180" />
        <path className="is-primary" d="M 360 180 C 300 220 228 250 135 278" />
        <path className="is-secondary" d="M 135 82 C 260 28 470 30 585 82" />
      </svg>
      <div className="landing-system-map__core" aria-hidden="true">
        <span>Family pressure</span>
        <strong>Familiar roles reappear</strong>
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
        <small>Selected perspective</small>
        <strong>{active.name} · {active.route}</strong>
        <span>{active.effect}</span>
      </div>
      <div className="landing-system-map__test">
        <small>Explore next</small>
        <strong>What changes when one person does not automatically return to the familiar role?</strong>
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