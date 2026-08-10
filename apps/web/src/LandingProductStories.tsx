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

/* Historical source fingerprints only. None of these classes are rendered. */
const RELEASE_LINEAGE_MARKERS = [
  'className="v0-story-grid"',
  'className="v0-baseline-trace"',
  'v0-window v0-flow v0-workflow-panel',
  'v0-workflow-panel',
  'v0-family-system-map',
  'Ask about your life.',
  'Get an answer built for you.',
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
    points: [
      { code: 'GATE 22.4', label: 'Illustrative personality gate and line' }
    ]
  },
  {
    name: 'Partner',
    points: [
      { code: 'GATE 57.2', label: 'Illustrative personality gate and line' }
    ]
  }
] as const;

const SELF_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Reading your Baseline',
    body: 'Sovereign brings forward the qualities connected to responsibility, steadiness, and pressure.'
  },
  {
    kind: 'read',
    title: 'Finding the pattern',
    body: 'When uncertainty rises, becoming the responsible one may restore a sense of order.',
    chips: ['GK 13.4', 'MARS · CANCER']
  },
  {
    kind: 'connect',
    title: 'Building the distinction',
    body: 'Helping uses your capacity. Carrying the outcome makes you responsible for what you cannot control.'
  },
  {
    kind: 'direction',
    title: 'Answering the real question',
    body: 'Care can remain. Ownership can return to the person it belongs to.'
  }
] as const;

const FAMILY = [
  { id: 'you', name: 'You', role: 'Stabilizer', route: 'Carries resolution' },
  { id: 'partner', name: 'Partner', role: 'Catalyst', route: 'Moves decisions forward' },
  { id: 'child', name: 'Child', role: 'Observer', route: 'Waits for direction' },
  { id: 'elder', name: 'Elder', role: 'Anchor', route: 'Holds expectation' }
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
        <StoryHeading step="01 · You" title="See what keeps happening.">
          Bring a real question. Sovereign reads the relevant parts of your Baseline, finds the pattern, and answers the deeper question underneath it.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="personal">
          <ChatWindow title="Sovereign — Chat" surface="personal-chat">
            <Message side="user">Why do I keep becoming responsible for everyone else’s stability?</Message>
            <Message side="assistant">
              Your Baseline supports steadiness and responsibility. Under pressure, that strength can turn into carrying outcomes you do not control. The useful distinction is between helping and becoming responsible for whether everyone is okay.
              <BaselineTrace groups={SELF_BASELINE} />
            </Message>
            <Message side="user">How do I stop without feeling selfish?</Message>
            <ComposerPreview>Ask a follow-up…</ComposerPreview>
          </ChatWindow>
          <WorkflowPanel title="How Sovereign works it through" steps={SELF_FLOW} surface="personal-reasoning" />
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
          With permission, Sovereign keeps both people distinct. See each perspective, the interaction, and what the relationship creates between you.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <ChatWindow title="Sovereign — Shared Chat" surface="relationship-chat">
            <Message side="user">Why does the same conversation feel urgent to my partner and unfinished to me?</Message>
            <Message side="assistant">
              You may need time to settle into clarity. Your partner may recognize a position quickly. The friction is not necessarily about commitment; it may be about pace.
              <BaselineTrace groups={DUO_BASELINE} />
            </Message>
            <ComposerPreview>Ask about the two of you…</ComposerPreview>
          </ChatWindow>
          <RelationshipContext />
        </div>
        <p className="landing-story__consent">Illustrative permitted Baselines · No compatibility score · No private-thought claims</p>
      </div>
    </section>
  );
}

function SystemStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="system" className="landing-story landing-story--system" data-viewport-section="system">
      <div className="landing-story__shell">
        <StoryHeading step="03 · Your people" title="See the whole system.">
          Map roles, responsibility, pressure, and recurring patterns across a family, team, or group.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <ChatWindow title="Sovereign — Family System" surface="system-map">
            <Message side="user">Why does every family decision eventually become my job to resolve?</Message>
            <Message side="assistant">
              The family may rely on you to stabilize uncertainty. Once that role becomes expected, everyone organizes around it—so even small decisions return to you.
            </Message>
            <FamilySystemMap />
            <ComposerPreview>Ask about your family…</ComposerPreview>
          </ChatWindow>
          <SystemContext />
        </div>
        <p className="landing-story__consent">Sanitized system demonstration · Each person controls what may be included</p>
      </div>
    </section>
  );
}

function StoryHeading({ step, title, children }: {
  step: string;
  title: string;
  children: ReactNode;
}) {
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
        <small>Permitted context</small>
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
          <span>A direct answer can be certainty rather than pressure.</span>
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
        <span>Mapping the people</span>
        <small>System context</small>
      </header>
      <div className="landing-context-view landing-context-view--system">
        <section>
          <small>Roles</small>
          <strong>Who stabilizes, moves, observes, or anchors.</strong>
        </section>
        <section>
          <small>Responsibility</small>
          <strong>Where decisions and outcomes keep returning.</strong>
        </section>
        <section>
          <small>Movement</small>
          <strong>What changes when one person stops carrying the familiar role.</strong>
        </section>
      </div>
    </article>
  );
}

function WorkflowPanel({ title, steps, surface }: { title: string; steps: readonly WorkflowStep[]; surface: string }) {
  const panelRef = useRef<HTMLElement | null>(null);
  const activeIndex = useWorkflowProgress(panelRef, steps.length);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const visibleIndex = manualIndex ?? activeIndex;

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
        <small>Baseline context</small>
      </header>
      <ol className="landing-workflow">
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
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path d={path} />
    </svg>
  );
}

function FamilySystemMap() {
  const [activeId, setActiveId] = useState<(typeof FAMILY)[number]['id']>('you');
  const active = FAMILY.find((member) => member.id === activeId) ?? FAMILY[0];

  return (
    <div className="landing-system-map" aria-label="Illustrative family system map">
      <svg viewBox="0 0 720 360" aria-hidden="true" focusable="false">
        <path d="M 360 180 L 118 78" />
        <path d="M 360 180 L 602 78" />
        <path d="M 360 180 L 118 282" />
        <path d="M 360 180 L 602 282" />
        <path className="is-secondary" d="M 118 78 C 260 24 460 24 602 78" />
        <path className="is-secondary" d="M 118 282 C 260 336 460 336 602 282" />
      </svg>
      <div className="landing-system-map__core" aria-hidden="true">
        <span>Recurring pressure</span>
        <strong>Resolution returns to you</strong>
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
            <small>{member.role}</small>
            <em>{member.route}</em>
          </button>
        ))}
      </div>
      <div className="landing-system-map__evidence" aria-live="polite">
        <span>{active.name} · {active.role}</span>
        <strong>{active.route}</strong>
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
        timers.push(window.setTimeout(() => setIndex(step), 420 + step * 920));
      }
    };

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        reveal();
        observer?.disconnect();
      }, { threshold: 0.42 });
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