import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type EvidencePoint = { code: string; label: string };
type EvidenceGroup = { name?: string; accent?: string; points: readonly EvidencePoint[] };
type WorkflowStep = {
  kind: 'input' | 'read' | 'connect' | 'direction';
  title: string;
  body: string;
  chips?: readonly string[];
  branches?: readonly { name: string; accent: string; chips: readonly string[] }[];
};

const SELF_BASELINE: readonly EvidenceGroup[] = [
  {
    points: [
      { code: 'SUN · LEO', label: 'Illustrative natal Sun placement' },
      { code: 'GK 13.4', label: 'Illustrative Gene Key activation' },
      { code: 'GATE 4.11', label: 'Illustrative Baseline gate and line' },
      { code: 'GK 9', label: 'Illustrative Gene Key activation' },
      { code: 'MARS · CANCER', label: 'Illustrative natal Mars placement' }
    ]
  }
] as const;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    accent: '#e8ddd0',
    points: [
      { code: 'SUN · LEO', label: 'Illustrative natal Sun placement' },
      { code: 'GATE 22.4', label: 'Illustrative personality gate and line' },
      { code: 'GK 13', label: 'Illustrative Gene Key activation' }
    ]
  },
  {
    name: 'Maya',
    accent: '#7f9a8f',
    points: [
      { code: 'SUN · VIRGO', label: 'Illustrative natal Sun placement' },
      { code: 'GATE 57.2', label: 'Illustrative personality gate and line' },
      { code: 'GK 25', label: 'Illustrative Gene Key activation' }
    ]
  }
] as const;

const SELF_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Reading your Baseline',
    body: 'Sovereign starts with the stable qualities most relevant to responsibility, boundaries, and pressure.'
  },
  {
    kind: 'read',
    title: 'Finding the pattern',
    body: 'Stepping in may create stability when uncertainty rises.',
    chips: ['GK 13.4', 'MARS · CANCER']
  },
  {
    kind: 'connect',
    title: 'Building the distinction',
    body: 'The capacity to lead is real. Carrying outcomes without matching authority is where it can become over-responsibility.'
  },
  {
    kind: 'direction',
    title: 'Answering the real question',
    body: 'The question is not whether you care. It is whether this responsibility is actually yours.'
  }
] as const;

const RELATIONSHIP_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Keeping both people distinct',
    body: 'Your need for time and Maya’s quicker recognition remain separate. Neither person becomes the explanation for the other.'
  },
  {
    kind: 'read',
    title: 'Reading each perspective',
    body: 'Sovereign checks how each person may naturally reach clarity, using only permitted information.',
    branches: [
      { name: 'You', accent: '#e8ddd0', chips: ['GATE 22.4', 'Needs time to settle'] },
      { name: 'Maya', accent: '#7f9a8f', chips: ['GATE 57.2', 'Recognizes quickly'] }
    ]
  },
  {
    kind: 'connect',
    title: 'Finding the interaction',
    body: 'The tension may be a timing gap rather than a values gap. Neither person has to be reduced to wrong.'
  },
  {
    kind: 'direction',
    title: 'Showing what happens between you',
    body: 'Name the decision and agree on a return time. One person can share an initial sense; the other can confirm after processing.'
  }
] as const;

const SYSTEM_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Mapping the people',
    body: 'Keep every permitted person visible as a distinct participant.'
  },
  {
    kind: 'read',
    title: 'Reading roles and responsibility',
    body: 'Separate who acts, who decides, and who carries the outcome.'
  },
  {
    kind: 'connect',
    title: 'Tracing the recurring pattern',
    body: 'Look for where the same delay or pressure keeps moving through the group.'
  },
  {
    kind: 'direction',
    title: 'Showing the whole system',
    body: 'Make the shared pattern visible without turning it into a verdict about anyone.'
  }
] as const;

const FAMILY = [
  { id: 'you', name: 'You', role: 'Parent', route: 'Needs time to settle', chips: ['SUN · LEO', 'GATE 22.4'] },
  { id: 'maya', name: 'Maya', role: 'Partner', route: 'Recognizes quickly', chips: ['SUN · VIRGO', 'GATE 57.2'] },
  { id: 'noa', name: 'Noa', role: 'Child', route: 'Needs time to settle', chips: ['SUN · PISCES', 'GATE 22.2'] },
  { id: 'ruth', name: 'Ruth', role: 'Grandparent', route: 'Needs time to settle', chips: ['SUN · CAP', 'GATE 22.6'] }
] as const;

export function LandingProductStories() {
  return (
    <div className="landing-stories" data-product-stories="restored-workflows">
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
        <StoryHeading step="Step 01 · You" title="Ask about your life." outline="Get an answer built for you.">
          You ask a real question. Sovereign reads your Baseline and turns the relevant context into a useful distinction.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="personal">
          <ChatWindow title="Sovereign — Chat" surface="personal-chat">
            <Message side="user">Why do I keep taking on responsibility for everyone around me?</Message>
            <Message side="assistant">
              Your Baseline suggests stability may matter deeply to you. When someone around you is struggling, stepping in can become how you reduce uncertainty. The capacity is real; the question is whether the responsibility is actually yours.
              <BaselineTrace groups={SELF_BASELINE} />
            </Message>
            <Message side="user">That’s exactly it. How do I start to change it?</Message>
            <ComposerPreview>Ask a question…</ComposerPreview>
          </ChatWindow>
          <WorkflowPanel title="How Sovereign works it through" steps={SELF_FLOW} surface="personal-reasoning" />
        </div>
        <a className="landing-story__action" href="/signup">Try it free <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

function RelationshipStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} className="landing-story landing-story--relationship" data-viewport-section="relationship">
      <div className="landing-story__shell">
        <StoryHeading step="Step 02 · You + 1" title="Understand what happens" outline="between you.">
          With permission, Sovereign keeps both people distinct and shows how different routes to clarity may interact.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="relationship">
          <ChatWindow title="Sovereign — Shared Chat" surface="relationship-chat">
            <Message side="user">Why does the same conversation land so differently for me and Maya?</Message>
            <Message side="assistant">
              You may need time to talk something through before you are sure. Maya may recognize an immediate response. The clash may be about timing—not how much either of you cares.
              <BaselineTrace groups={DUO_BASELINE} />
            </Message>
            <ComposerPreview>Ask about the two of you…</ComposerPreview>
          </ChatWindow>
          <WorkflowPanel title="How Sovereign reads both of you" steps={RELATIONSHIP_FLOW} surface="relationship-reasoning" />
        </div>
        <p className="landing-story__consent">Illustrative permitted Baselines · No compatibility score · No private-thought claims</p>
        <a className="landing-story__action landing-story__action--secondary" href="/signup">Explore a relationship <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

function SystemStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} className="landing-story landing-story--system" data-viewport-section="system">
      <div className="landing-story__shell">
        <StoryHeading step="Step 03 · Your people" title="From one person" outline="to the whole system.">
          Bring permitted Baselines, roles, and responsibility into one view. Each person stays distinct while the shared pattern becomes visible.
        </StoryHeading>
        <div className="landing-story__stage" data-viewport-stage="system">
          <ChatWindow title="Sovereign — Family System" surface="system-map">
            <Message side="user">Can you map my family? Decisions around here always seem to take forever.</Message>
            <BaselineTrace groups={[{ points: [
              { code: 'GATE 22 ×3', label: 'Three illustrative slower-settling activations' },
              { code: 'GATE 57 ×1', label: 'One illustrative quicker-recognition activation' }
            ] }]} />
            <FamilySystemMap />
            <Message side="assistant" wide>
              Three people share a supported slower-settling decision pattern while one points toward quicker recognition. The pressure is not one person. It is the group trying to coordinate different timing without a clear return point.
            </Message>
            <ComposerPreview>Ask about your family…</ComposerPreview>
          </ChatWindow>
          <WorkflowPanel title="How Sovereign maps the system" steps={SYSTEM_FLOW} surface="system-reasoning" />
        </div>
        <p className="landing-story__consent">Sanitized system demonstration · Each person controls what may be included</p>
      </div>
    </section>
  );
}

function StoryHeading({ step, title, outline, children }: {
  step: string;
  title: string;
  outline: string;
  children: ReactNode;
}) {
  return (
    <header className="landing-story__heading">
      <p>{step}</p>
      <h2>{title}<br /><span>{outline}</span></h2>
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

function Message({ side, children, wide = false }: { side: 'user' | 'assistant'; children: ReactNode; wide?: boolean }) {
  return <div className={`landing-message landing-message--${side}`}><div className={wide ? 'landing-message__wide' : ''}>{children}</div></div>;
}

function ComposerPreview({ children }: { children: ReactNode }) {
  return <div className="landing-composer"><span>{children}</span><i aria-hidden="true">→</i></div>;
}

function BaselineTrace({ groups }: { groups: readonly EvidenceGroup[] }) {
  return (
    <div className="landing-evidence">
      <p>Grounded in</p>
      <div>
        {groups.map((group, groupIndex) => (
          <span className="landing-evidence__group" key={`${group.name ?? 'self'}-${groupIndex}`}>
            {group.name && <strong><i style={{ background: group.accent }} />{group.name}</strong>}
            {group.points.map((point) => <abbr key={point.code} title={point.label}>{point.code}</abbr>)}
          </span>
        ))}
      </div>
    </div>
  );
}

function WorkflowPanel({ title, steps, surface }: { title: string; steps: readonly WorkflowStep[]; surface: string }) {
  const activeIndex = useWorkflowProgress(steps.length);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const visibleIndex = manualIndex ?? activeIndex;

  return (
    <article className="landing-demo landing-demo--workflow" data-viewport-surface={surface}>
      <header className="landing-demo__bar landing-demo__bar--workflow">
        <span className="landing-demo__status" aria-hidden="true" />
        <span>{title}</span>
        <small>Visible context</small>
      </header>
      <ol className="landing-workflow">
        {steps.map((step, index) => {
          const state = index < visibleIndex ? 'is-complete' : index === visibleIndex ? 'is-active' : 'is-upcoming';
          return (
            <li key={step.title} className={`${state}${step.kind === 'direction' ? ' is-direction' : ''}`}>
              <button type="button" onClick={() => setManualIndex(index)} aria-current={index === visibleIndex ? 'step' : undefined}>
                <i aria-hidden="true">{index + 1}</i>
                <span className="landing-workflow__copy">
                  <small>{step.kind === 'direction' ? 'Useful direction' : `Context ${index + 1}`}</small>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </span>
              </button>
              {step.branches && (
                <div className="landing-workflow__branches">
                  {step.branches.map((branch) => (
                    <section key={branch.name}>
                      <strong><i style={{ background: branch.accent }} />{branch.name}</strong>
                      <div>{branch.chips.map((chip) => <code key={chip}>{chip}</code>)}</div>
                    </section>
                  ))}
                </div>
              )}
              {step.chips && <div className="landing-workflow__chips">{step.chips.map((chip) => <code key={chip}>{chip}</code>)}</div>}
            </li>
          );
        })}
      </ol>
    </article>
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
        <span>Shared pressure</span>
        <strong>Decision pace</strong>
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
        <div>{active.chips.map((chip) => <code key={chip}>{chip}</code>)}</div>
      </div>
    </div>
  );
}

function useWorkflowProgress(length: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % length), 2400);
    return () => window.clearInterval(timer);
  }, [length]);
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
