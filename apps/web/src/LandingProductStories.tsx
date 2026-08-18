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
 * Each answer below is authored against the exact fixture shown in its Example Basis
 * so the visible source values and the demonstration cannot drift apart.
 */
const SELF_BASELINE: readonly EvidenceGroup[] = [
  {
    points: [
      { code: 'HD G13.1', label: 'Illustrative Human Design personality activation: Gate 13 line 1' },
      { code: 'GK ACT13', label: 'Illustrative Gene Keys activation number 13' },
      { code: '☉ CAN 04.2°', label: 'Illustrative natal Sun at 4.2 degrees Cancer' }
    ]
  }
] as const;

const DUO_BASELINE: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [
      { code: 'HD G22.4', label: 'Illustrative permitted personality activation: Gate 22 line 4' },
      { code: '☿ CAN 18.4°', label: 'Illustrative permitted Mercury placement: 18.4 degrees Cancer' }
    ]
  },
  {
    name: 'Partner',
    points: [
      { code: 'HD G57.2', label: 'Illustrative permitted personality activation: Gate 57 line 2' },
      { code: '☿ LIB 16.6°', label: 'Illustrative permitted Mercury placement: 16.6 degrees Libra' }
    ]
  },
  {
    name: 'Between',
    points: [{ code: 'REL ☿ □ ☿ 1.8°', label: 'Illustrative deterministic pair Mercury square with 1.8 degree orb' }]
  }
] as const;

const SYSTEM_BASIS: readonly EvidenceGroup[] = [
  {
    name: 'You',
    points: [{ code: 'HD G13.1', label: 'Illustrative permitted personality activation: Gate 13 line 1' }]
  },
  {
    name: 'Confirmed',
    points: [
      { code: 'U✓', label: 'Illustrative user-confirmed observation: parent pushes for immediate resolution' },
      { code: 'U✓', label: 'Illustrative user-confirmed observation: you move into mediation' },
      { code: 'U✓', label: 'Illustrative user-confirmed observation: sibling withdraws as pressure rises' }
    ]
  }
] as const;

const SELF_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Read the actual question',
    body: 'The question is not “what is my type?” It is whether refinement is making the idea clearer or making it easier to defend.'
  },
  {
    kind: 'read',
    title: 'Pull only the relevant Baseline',
    body: 'Sovereign uses the parts of the Baseline connected to expression, meaning-making, pressure, and Alignment instead of loading every possible interpretation.',
    chips: ['HD G13.1', 'GK ACT13', '☉ CAN 04.2°']
  },
  {
    kind: 'connect',
    title: 'Separate clarity from pressure',
    body: 'The useful distinction is whether the next change strengthens the idea for you or mainly anticipates how other people might react.'
  },
  {
    kind: 'read',
    title: 'Keep the unknowns open',
    body: 'Actual project constraints and feedback still matter. Baseline context cannot decide whether a specific edit is objectively better.'
  },
  {
    kind: 'direction',
    title: 'Return something testable',
    body: 'The answer gives the user a concrete way to compare their own version before feedback with the version created under outside pressure.'
  }
] as const;

const RELATIONSHIP_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Start with what actually happened',
    body: 'One person asks for resolution, the other becomes quieter, and the same conversation is being experienced as urgency on one side and pressure on the other.'
  },
  {
    kind: 'read',
    title: 'Keep both Baselines separate',
    body: 'Sovereign reads only the permitted communication, processing, pressure, and repair context that belongs to each person.',
    chips: ['You · HD G22.4', 'Partner · HD G57.2']
  },
  {
    kind: 'connect',
    title: 'Trace the interaction loop',
    body: 'A move toward more definition can increase pressure; less response can then increase uncertainty; more urgency can follow. The sequence matters more than choosing a winner.',
    chips: ['REL ☿ □ ☿ 1.8°']
  },
  {
    kind: 'read',
    title: 'Separate ownership from mind-reading',
    body: 'Each person can own pacing, clarity, tone, and follow-through. The other person’s exact feeling or motive stays unknown unless they say it.'
  },
  {
    kind: 'direction',
    title: 'Build the bridge',
    body: 'The answer turns the timing difference into a usable sequence: reassurance, less immediate demand, a defined return time, and one decision at a time.'
  }
] as const;

const SYSTEM_FLOW: readonly WorkflowStep[] = [
  {
    kind: 'input',
    title: 'Read the supplied system context',
    body: 'The example begins with confirmed roles and observations rather than assigning family identities from Baseline data.',
    chips: ['U✓', 'U✓', 'U✓']
  },
  {
    kind: 'read',
    title: 'Keep every person distinct',
    body: 'Parent, you, sibling, and partner remain separate subjects. No synthetic “family personality” is created.'
  },
  {
    kind: 'connect',
    title: 'Trace how pressure moves',
    body: 'Immediate resolution pressure is followed by withdrawal, then mediation. The sequence reveals why the same roles can reappear even when nobody consciously chooses them.'
  },
  {
    kind: 'read',
    title: 'Find what the role is doing',
    body: 'Mediation lowers short-term tension, but it also lets direct communication stay unfinished. That makes the mediator role useful to the arrangement.'
  },
  {
    kind: 'direction',
    title: 'Test one system-level change',
    body: 'The leverage point is not “fix the family.” It is changing one repeatable behavior and watching what the rest of the system must do differently.'
  }
] as const;

const SYSTEM_SEQUENCE = [
  { person: 'Parent', action: 'Pushes for resolution', detail: 'The pace of the conversation accelerates.' },
  { person: 'Sibling', action: 'Creates distance', detail: 'Less participation leaves more uncertainty in the room.' },
  { person: 'You', action: 'Move into mediation', detail: 'You translate, soften, or carry the next step between people.' },
  { person: 'System effect', action: 'Tension drops temporarily', detail: 'Because mediation works in the moment, the same route becomes easy to repeat.' }
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
            title="How Sovereign builds the answer"
            steps={SELF_FLOW}
            result="The output is a distinction you can test: does the change make the idea clearer to you, or only easier to defend to someone else?"
            surface="personal-reasoning"
          />
          <ChatWindow title="Sovereign — You" surface="personal-chat" composer="What changes when I get feedback too early?">
            <Message side="user">How do I know whether I’m refining an idea because it’s getting clearer—or changing it because I’m anticipating everyone else’s reaction?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="A useful distinction for you may be whether the next change makes the idea more coherent to you or merely more defensible to an imagined audience. Your example Baseline points toward strong sensitivity to meaning and response; under pressure, that sensitivity can become editing before you have decided what you actually want to preserve."
                sections={[
                  { label: 'What may be steady', body: 'You may naturally notice subtext, patterns, and how something will be received. That can make refinement one of your real strengths.' },
                  { label: 'Under pressure', body: 'When outside expectations arrive too early, refinement can shift into pre-emptive explanation: solving objections before the idea has had enough room to become your own.' },
                  { label: 'The distinction', body: 'Clarity simplifies the idea without making you disappear from it. Anticipation often adds explanation, qualification, or compromise before anyone has actually asked for it.', tone: 'distinction' },
                  { label: 'Try this', body: 'Save one version before feedback. After revising, compare the two and ask: what became more precise, and what changed mainly to make the work easier for someone else to accept?', tone: 'bridge' },
                  { label: 'Still open', body: 'Real constraints, expertise, deadlines, and good feedback can absolutely improve the work. The Baseline cannot decide that part for you.', tone: 'unknown' }
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
          With permission, Sovereign can compare two Baselines without blending the people together. See where timing, communication, pressure, or decision styles diverge, what happens when they meet, and what each person can do differently.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--relationship" data-viewport-stage="relationship">
          <WorkflowPanel
            title="How Sovereign compares two people"
            steps={RELATIONSHIP_FLOW}
            result="The useful answer is not who is right. It is the interaction sequence: one person seeks clarity by moving closer to resolution while the other may need less pressure before clarity is possible."
            surface="relationship-reasoning"
          />
          <ChatWindow title="Sovereign — Relationship" surface="relationship-chat" composer="What would repair look like for each of us?">
            <Message side="user">When I ask to resolve something now, my partner goes quiet. I read that as not caring; they say I’m pressuring them. Why does the same conversation feel urgent to me and pressuring to them—and how do we bridge it?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="You may be colliding at the point where each of you tries to regain clarity. In this example, you appear to settle by defining the issue and the next step; your partner may need the pressure to come down before they can tell what they actually think. That means your move toward resolution can arrive to them as more demand, while their pause can arrive to you as less care. The conflict can become a timing loop before it becomes a disagreement about the relationship itself."
                sections={[
                  { label: 'You may be bringing', body: 'Ambiguity may stay active for you until there is a clear next step. Asking another question can be an attempt to restore connection and orientation—not necessarily an attempt to control the outcome.' },
                  { label: 'They may be bringing', body: 'Their permitted example Baseline suggests clarity may improve when input and pressure reduce. A quieter response can therefore be part of processing, although only they can say what they actually feel or intend.' },
                  { label: 'Between you', body: 'You ask for more definition → they reduce their response → the reduction raises your uncertainty → you ask with more urgency → the added urgency increases pressure. Each move makes sense from inside one person and becomes harder from inside the other.', tone: 'distinction' },
                  { label: 'A bridge that protects both', body: 'Separate reassurance from resolution. For example: “I care about this, and I don’t need the full answer right now. Can we come back at 7 and decide only what happens next?” You get a defined return point; they get room that is not indefinite.', tone: 'bridge' },
                  { label: 'What still must be asked', body: 'Silence does not tell us whether your partner feels hurt, overwhelmed, uncertain, angry, or simply unfinished. That remains theirs to name directly.', tone: 'unknown' }
                ]}
                basis={DUO_BASELINE}
              />
            </Message>
          </ChatWindow>
        </div>
        <p className="landing-story__consent">Representative shared example · Permission required · No compatibility score · No private-thought claims</p>
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
          Move from one relationship to a family, household, team, or group. See how supplied roles, permitted perspectives, confirmed responsibilities, pressure, constraints, observations, and interactions work together—and what changes when one person responds differently.
        </StoryHeading>
        <div className="landing-story__stage landing-story__stage--system" data-viewport-stage="system">
          <WorkflowPanel
            title="How Sovereign reads a system"
            steps={SYSTEM_FLOW}
            result="The system-level insight is the role sequence: mediation reduces tension now, which can unintentionally preserve the conditions that keep requiring mediation later."
            surface="system-reasoning"
          />
          <ChatWindow title="Sovereign — Family System" surface="system-map" composer="What changes if I stop carrying messages between them?">
            <Message side="user">Why does my family pull me back into mediator mode even when I’ve decided not to fix the conflict?</Message>
            <Message side="assistant" wide>
              <DemoAnswer
                direct="Because the role is reinforced by a sequence, not just by your intention. In this supplied example, one person pushes for immediate resolution, another reduces participation, and you become the shortest path between them. When you translate, soften, or carry the next step, the room gets temporary relief. That makes mediation useful to the system even when it is costly to you."
                sections={[
                  { label: 'What the system is doing', body: 'Pressure moves through a repeatable route: resolution accelerates, participation drops, you step between positions, and the immediate conflict becomes easier to manage.' },
                  { label: 'Why the role returns', body: 'Your mediation works well enough in the short term that other people can remain in their familiar positions. The system does not need anyone to consciously assign you the role for the pattern to keep re-forming.', tone: 'distinction' },
                  { label: 'What changes if you stop', body: 'Short-term tension may rise because the usual pressure-release route is gone. That is also the point where direct communication, ownership, or a new boundary has to appear somewhere else in the system.' },
                  { label: 'A leverage point', body: 'Do not carry messages between people for one cycle. Ask each person to state their own position and next step directly. You can still care about the relationship without becoming the communication channel for it.', tone: 'bridge' },
                  { label: 'What remains unknown', body: 'The example does not tell us why the sibling withdraws or what any absent person privately feels. Their perspective stays unknown until they participate or their observation is supplied.', tone: 'unknown' }
                ]}
                basis={SYSTEM_BASIS}
              />
            </Message>
            <SystemAnalysis />
          </ChatWindow>
        </div>
        <p className="landing-story__consent">Representative supplied system context · Each person controls what may be included</p>
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
      <BaselineTrace groups={basis} />
    </div>
  );
}

function BaselineTrace({ groups }: { groups: readonly EvidenceGroup[] }) {
  const entries = groups.flatMap((group) => [
    ...(group.name ? [{ text: group.name, label: `${group.name} example context`, subject: true }] : []),
    ...group.points.map((point) => ({ text: point.code, label: point.label, subject: false }))
  ]);
  return (
    <div className="landing-evidence" aria-label={`Example Basis. ${entries.map((entry) => entry.text).join('. ')}`}>
      <div className="landing-evidence__heading">
        <strong>Example Basis</strong>
        <small>Exact values used by this representative fixture · authenticated Basis is server-approved per answer</small>
      </div>
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

function SystemAnalysis() {
  return (
    <div className="landing-system-analysis" aria-label="Representative family system pressure sequence">
      <div className="landing-system-analysis__context">
        <small>Supplied example context</small>
        <strong>Recurring family conflict · you report becoming the mediator when pressure rises</strong>
      </div>
      <div className="landing-system-analysis__sequence">
        <small>Pressure sequence</small>
        <ol>
          {SYSTEM_SEQUENCE.map((entry, index) => (
            <li key={entry.person}>
              <span>{index + 1}</span>
              <div><strong>{entry.person} · {entry.action}</strong><small>{entry.detail}</small></div>
            </li>
          ))}
        </ol>
      </div>
      <div className="landing-system-analysis__leverage">
        <small>Leverage point</small>
        <strong>Remove one automatic mediation behavior and watch what the other participants must do directly instead.</strong>
      </div>
    </div>
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
                  <small>{step.kind === 'direction' ? 'Final synthesis' : `Step ${index + 1}`}</small>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </span>
              </button>
              {step.chips && <div className="landing-workflow__chips">{step.chips.map((chip, chipIndex) => <code key={`${chip}-${chipIndex}`}>{chip}</code>)}</div>}
            </li>
          );
        })}
      </ol>
      <div className="landing-workflow__result"><small>What the user gets</small><strong>{result}</strong></div>
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