import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LandingExpressionFieldPreview } from './expression-field/LandingExpressionFieldPreview';
import {
  landingExpressionFieldFixture,
  landingRelationshipExpressionFieldFixtures,
  landingSystemExpressionFieldFixtures
} from './expression-field/expression-field.fixture';
import type { ExpressionFieldSubject } from './expression-field/expression-field-view-contract';

type EvidencePoint = { code: string; label: string };
type EvidenceGroup = { name?: string; accent?: string; points: readonly EvidencePoint[] };
type FlowStep = {
  kind: 'input' | 'read' | 'connect' | 'direction';
  title: string;
  body: string;
  chips?: readonly string[];
  branches?: readonly { name: string; accent: string; chips: readonly string[] }[];
};

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const QUESTIONS = [
  'Does this decision fit who I am now?',
  'Why does the same moment land differently for us?',
  'How do I keep showing up differently with different people?',
  'What is it I actually want here?',
  'Why does this keep happening to me?'
] as const;

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

const SELF_FLOW: readonly FlowStep[] = [
  { kind: 'input', title: 'Reading your Baseline', body: 'Sovereign starts with the stable qualities most relevant to responsibility, boundaries, and pressure.' },
  { kind: 'read', title: 'Finding the pattern', body: 'Stepping in may create stability when uncertainty rises.', chips: ['GK 13.4', 'MARS · CANCER'] },
  { kind: 'connect', title: 'Building the distinction', body: 'The capacity to lead is real. Carrying outcomes without matching authority is where it can become over-responsibility.' },
  { kind: 'direction', title: 'Answering the real question', body: 'The question is not whether you care. It is whether this responsibility is actually yours.' }
] as const;

const DUO_FLOW: readonly FlowStep[] = [
  { kind: 'input', title: 'Keeping both people distinct', body: 'Your need for time and Maya’s quicker recognition remain separate. Neither person becomes the explanation for the other.' },
  {
    kind: 'read',
    title: 'Reading each perspective',
    body: 'Sovereign checks how each person may naturally reach clarity, using only permitted information.',
    branches: [
      { name: 'You', accent: '#e8ddd0', chips: ['GATE 22.4', 'Needs time to settle'] },
      { name: 'Maya', accent: '#7f9a8f', chips: ['GATE 57.2', 'Recognizes quickly'] }
    ]
  },
  { kind: 'connect', title: 'Finding the interaction', body: 'The tension may be a timing gap rather than a values gap. Neither person has to be reduced to wrong.' },
  { kind: 'direction', title: 'Showing what happens between you', body: 'Name the decision and agree on a return time. One person can share an initial sense; the other can confirm after processing.' }
] as const;

const SYSTEM_FLOW = [
  { title: 'Mapping the people', body: 'Keep every permitted person visible as a distinct participant.' },
  { title: 'Reading roles and responsibility', body: 'Separate who acts, who decides, and who carries the outcome.' },
  { title: 'Tracing the recurring pattern', body: 'Look for where the same delay or pressure keeps moving through the group.' },
  { title: 'Showing the whole system', body: 'Make the shared pattern visible without turning it into a verdict about anyone.' }
] as const;

const FAMILY = [
  { name: 'You', role: 'Parent', chips: ['SUN · LEO', 'GATE 22.4'], shares: true },
  { name: 'Maya', role: 'Partner', chips: ['SUN · VIRGO', 'GATE 57.2'], shares: false },
  { name: 'Noa', role: 'Child', chips: ['SUN · PISCES', 'GATE 22.2'], shares: true },
  { name: 'Ruth', role: 'Grandparent', chips: ['SUN · CAP', 'GATE 22.6'], shares: true }
] as const;

const SYSTEM_FIELD: readonly ExpressionFieldSubject[] = FAMILY.map((member, index) => ({
  id: member.name.toLowerCase(),
  label: member.name,
  meta: member.role,
  axes: landingSystemExpressionFieldFixtures[index]!.axes,
  selectedAxisId: 'responsibility',
  detail: member.shares
    ? `${member.name} shares the supported slower-settling facet in this example. Their actual experience still belongs to them to confirm.`
    : `${member.name} follows a different supported route to clarity in this example. That difference is context, not a verdict.`
}));

const SELF_FIELD: ExpressionFieldSubject = {
  id: 'self-baseline',
  label: 'Your Baseline',
  meta: 'Responsibility · boundaries',
  detail: 'Stable qualities stay distinct from the temporary pressure surrounding the question.',
  axes: landingExpressionFieldFixture.axes,
  selectedAxisId: 'responsibility'
};

const RELATIONSHIP_FIELD: readonly ExpressionFieldSubject[] = [
  {
    id: 'you',
    label: 'You',
    meta: 'Needs time to settle',
    detail: 'Your permitted Baseline may support clarity that forms through time and conversation.',
    axes: landingRelationshipExpressionFieldFixtures.you.axes,
    selectedAxisId: 'clarity'
  },
  {
    id: 'maya',
    label: 'Maya',
    meta: 'Recognizes quickly',
    detail: 'Maya’s permitted Baseline may support a quicker first recognition that remains hers to confirm.',
    axes: landingRelationshipExpressionFieldFixtures.maya.axes,
    selectedAxisId: 'clarity'
  }
] as const;

const COMPARISON = {
  others: [
    'Same generic answer for everyone',
    'Forgets who you are between chats',
    'Advice pulled from an average user',
    'You adapt your question to the tool',
    'Context disappears when the chat ends'
  ],
  sovereign: [
    'Answers grounded in your Baseline',
    'Keeps your permitted context connected',
    'Reasoning built around the person asking',
    'You ask naturally—it adapts to you',
    'Private, correctable, and consent-aware'
  ]
} as const;

export function PublicLanding() {
  return (
    <main
      className="sovereign-landing v0-landing-port"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-visual-contract="v0-landing-selective-port"
      data-v0-archive-sha={V0_ARCHIVE_SHA}
      data-viewport-contract="v0-public-landing-v1"
    >
      <V0Navigation />
      <V0Hero />
      <RotatingQuestions />
      <PersonalStory />
      <RelationshipStory />
      <SystemStory />
      <ComparisonStory />
      <FinalCallToAction />
      <V0Footer />
    </main>
  );
}

function V0Navigation() {
  return (
    <header className="v0-nav">
      <div className="v0-shell v0-nav-inner">
        <a className="v0-wordmark" href="/" aria-label="Sovereign home">Sovereign</a>
        <nav aria-label="Public navigation">
          <a href="#how">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <div className="v0-nav-actions">
          <a className="v0-sign-in" href="/login">Sign in</a>
          <a className="v0-button v0-button-primary v0-button-small" href="/signup">Get started</a>
        </div>
      </div>
    </header>
  );
}

function V0Hero() {
  return (
    <section className="v0-hero" data-viewport-section="hero">
      <div className="v0-hero-atmosphere" aria-hidden="true"><i /><i /><i /><span /></div>
      <div className="v0-hero-content" data-viewport-surface="hero">
        <p className="v0-badge"><span />Personal AI for real life</p>
        <h1>
          <span>Healing isn’t optional.</span>
          <em style={{ color: 'rgba(15, 15, 15, 0.96)', WebkitTextStroke: '1.25px rgba(232, 221, 208, 0.58)', textShadow: '0 0 1px rgba(232, 221, 208, 0.14), 0 0 38px rgba(232, 221, 208, 0.04)' }}>Holding onto the pain is.</em>
        </h1>
        <p className="v0-hero-copy">
          Sovereign is a personal AI that builds your <strong>Baseline</strong>—a stable, correctable model of how you may naturally operate—then answers real questions about yourself, your relationships, and your family. Grounded in you, never generic.
        </p>
        <div className="v0-actions">
          <a className="v0-button v0-button-primary" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a>
          <a className="v0-button v0-button-secondary" href="#how">See a Sovereign answer</a>
        </div>
        <ul className="v0-trust" aria-label="Getting started details">
          <li>Start free</li>
          <li>No card required</li>
          <li>Review any interpretation</li>
        </ul>
      </div>
      <span className="v0-scroll-cue" aria-hidden="true" />
    </section>
  );
}

function RotatingQuestions() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % QUESTIONS.length), 3800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="v0-question-band" aria-labelledby="v0-question-band-title">
      <div className="v0-question-inner">
        <p id="v0-question-band-title">The questions people actually bring</p>
        <blockquote key={QUESTIONS[index]}>“{QUESTIONS[index]}”</blockquote>
        <div className="v0-question-dots" role="tablist" aria-label="Example questions">
          {QUESTIONS.map((question, questionIndex) => (
            <button
              key={question}
              type="button"
              role="tab"
              aria-selected={index === questionIndex}
              aria-label={`Show question ${questionIndex + 1}`}
              onClick={() => setIndex(questionIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonalStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} id="how" className="v0-story v0-story-self" data-viewport-section="personal">
      <StoryHeading step="Step 01 · You" title="Ask about your life." outline="Get an answer built for you.">
        You ask a real question. Sovereign reads your Baseline, then works through it step by step—turning a vague feeling into a useful distinction.
      </StoryHeading>
      <div className="v0-story-grid" data-viewport-stage="personal">
        <ChatWindow title="Sovereign — Chat" surface="personal-chat">
          <Message side="user">Why do I keep taking on responsibility for everyone around me?</Message>
          <Message side="assistant">
            Your Baseline suggests stability may matter deeply to you. When someone around you is struggling, stepping in can become how you reduce uncertainty. The capacity is real; the question is whether the responsibility is actually yours.
            <BaselineTrace groups={SELF_BASELINE} />
          </Message>
          <Message side="user">That’s exactly it. How do I start to change it?</Message>
          <ComposerPreview>Ask a question…</ComposerPreview>
        </ChatWindow>
        <ProcessingFlow
          title="How Sovereign works it through"
          steps={SELF_FLOW}
          surface="personal-reasoning"
          field={<LandingExpressionFieldPreview
            mode="self"
            subject={SELF_FIELD}
            context={{
              label: 'Your current expression field',
              meta: 'Based on your Baseline and current context',
              detail: 'The stable field remains yours. Temporary context changes which expressions are more visible, not who you are.',
              selectedAxisId: 'responsibility'
            }}
            compact
          />}
        />
      </div>
      <a className="v0-story-action" href="/signup">Try it free <span aria-hidden="true">→</span></a>
    </section>
  );
}

function RelationshipStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} className="v0-story v0-story-relationship" data-viewport-section="relationship">
      <StoryHeading step="Step 02 · You + 1" title="Understand what happens" outline="between you.">
        With permission, Sovereign keeps both Baselines distinct, then shows how different routes to clarity may interact.
      </StoryHeading>
      <div className="v0-story-grid" data-viewport-stage="relationship">
        <ChatWindow title="Sovereign — Shared Chat" surface="relationship-chat">
          <Message side="user">Why does the same conversation land so differently for me and Maya?</Message>
          <Message side="assistant">
            You may need time to talk something through before you are sure. Maya may recognize an immediate response. The clash may be about timing—not how much either of you cares.
            <BaselineTrace groups={DUO_BASELINE} />
          </Message>
          <ComposerPreview>Ask about the two of you…</ComposerPreview>
        </ChatWindow>
        <ProcessingFlow
          title="How Sovereign reads both of you"
          steps={DUO_FLOW}
          surface="relationship-reasoning"
          field={<LandingExpressionFieldPreview
            mode="relationship"
            subjects={RELATIONSHIP_FIELD}
            context={{
              label: 'Selected interaction',
              meta: 'Timing · Decision pace',
              detail: 'The fields briefly orient around the same expression. The engagement shows a timing interaction without turning either person into the cause.',
              selectedAxisId: 'clarity'
            }}
            compact
          />}
        />
      </div>
      <p className="v0-consent-note">Illustrative permitted Baselines · No compatibility score · No private-thought claims</p>
      <a className="v0-story-action v0-story-action-secondary" href="/signup">Explore a relationship <span aria-hidden="true">→</span></a>
    </section>
  );
}

function SystemStory() {
  const sectionRef = useRevealOnce();
  return (
    <section ref={sectionRef} className="v0-story v0-story-system" data-viewport-section="system">
      <StoryHeading step="Step 03 · Your whole system" title="From one person" outline="to the whole system.">
        Bring permitted Baselines, roles, and responsibility into one view. Each person stays distinct; the system appears through how the fields interact around the same question.
      </StoryHeading>
      <div className="v0-system-stage" data-viewport-stage="system">
        <ChatWindow title="Sovereign — Family System" surface="system-map" wide>
          <Message side="user">Can you map my whole family? Decisions around here always seem to take forever.</Message>
          <BaselineTrace groups={[{ points: [{ code: 'GATE 22 ×3', label: 'Three illustrative personality gate activations' }, { code: 'GATE 57 ×1', label: 'One illustrative personality gate activation' }] }]} />
          <FamilyMap />
          <Message side="assistant" wide>
            Three of the four illustrative profiles share a supported slower-settling decision facet, while one points toward quicker recognition. That is a possible coordination pattern—not a verdict about any person.
            <ol className="v0-system-flow" aria-label="How Sovereign interprets the whole system">
              {SYSTEM_FLOW.map((step, index) => <li key={step.title}><i aria-hidden="true">{index + 1}</i><div><strong>{step.title}</strong><span>{step.body}</span></div></li>)}
            </ol>
            <p className="v0-system-followup">Maya’s route to clarity may differ, which can make the mismatch feel personal when it is partly about timing. The actual experience still belongs to each person to confirm.</p>
          </Message>
          <ComposerPreview>Ask about your family…</ComposerPreview>
        </ChatWindow>
      </div>
      <p className="v0-consent-note">Sanitized system demonstration · Each person controls what may be included</p>
    </section>
  );
}

function ComparisonStory() {
  return (
    <section className="v0-comparison" data-viewport-section="comparison">
      <div className="v0-shell">
        <StoryHeading step="The difference" title="Other AI answers" outline="everyone the same." align="left" />
        <div className="v0-comparison-grid" data-viewport-surface="comparison">
          <ComparisonPanel title="Other AI" items={COMPARISON.others} positive={false} />
          <ComparisonPanel title="Sovereign" items={COMPARISON.sovereign} positive />
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="v0-final">
      <div aria-hidden="true" />
      <h2>Your thoughts deserve<br />a better place to live.</h2>
      <p>Build your Baseline. Ask your real questions. Start free.</p>
      <a className="v0-button v0-button-primary" href="/signup">Get started free <span aria-hidden="true">→</span></a>
    </section>
  );
}

function V0Footer() {
  return (
    <footer className="v0-footer">
      <div className="v0-shell">
        <a href="/" className="v0-wordmark">Sovereign</a>
        <nav aria-label="Footer navigation">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:info@defrag.app">Contact</a>
        </nav>
        <p>© 2026 Sovereign.OS</p>
      </div>
    </footer>
  );
}

function StoryHeading({ step, title, outline, children, align = 'center' }: {
  step: string;
  title: string;
  outline: string;
  children?: ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <header className={`v0-story-heading ${align === 'left' ? 'v0-story-heading-left' : ''}`}>
      <p>{step}</p>
      <h2>{title}<br /><span>{outline}</span></h2>
      {children && <div>{children}</div>}
    </header>
  );
}

function ChatWindow({ title, surface, children, wide = false }: {
  title: string;
  surface: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={`v0-window ${wide ? 'v0-window-wide' : ''}`} data-viewport-surface={surface}>
      <header><i /><i /><i /><span>{title}</span></header>
      <div className="v0-window-body">{children}</div>
    </article>
  );
}

function Message({ side, children, wide = false }: { side: 'user' | 'assistant'; children: ReactNode; wide?: boolean }) {
  return <div className={`v0-message-row v0-message-${side}`}><div className={wide ? 'v0-message-wide' : ''}>{children}</div></div>;
}

function ComposerPreview({ children }: { children: ReactNode }) {
  return <div className="v0-composer-preview"><span>{children}</span><i aria-hidden="true">→</i></div>;
}

function BaselineTrace({ groups }: { groups: readonly EvidenceGroup[] }) {
  return (
    <div className="v0-baseline-trace">
      <p>Grounded in</p>
      <div>
        {groups.map((group, groupIndex) => (
          <span className="v0-baseline-group" key={`${group.name ?? 'self'}-${groupIndex}`}>
            {group.name && <strong><i style={{ background: group.accent }} />{group.name}</strong>}
            {group.points.map((point) => <abbr key={point.code} title={point.label}>{point.code}</abbr>)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProcessingFlow({ title, steps, surface, field }: { title: string; steps: readonly FlowStep[]; surface: string; field?: ReactNode }) {
  return (
    <div className={`v0-flow-stack${field ? ' v0-flow-stack-with-field' : ''}`} data-viewport-surface={surface}>
      {field && <div className="v0-flow-field">{field}</div>}
      <article className="v0-window v0-flow">
        <header><b aria-hidden="true" /><span>{title}</span><small>AI interpretation</small></header>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title} className={step.kind === 'direction' ? 'v0-flow-direction' : ''}>
              <i aria-hidden="true">{index + 1}</i>
              <p>{step.kind === 'direction' ? 'Your next step' : `Step ${index + 1}`}</p>
              <h3>{step.title}</h3>
              <span>{step.body}</span>
              {step.branches && <div className="v0-flow-branches">{step.branches.map((branch) => <section key={branch.name}><strong><i style={{ background: branch.accent }} />{branch.name}</strong><div>{branch.chips.map((chip) => <code key={chip}>{chip}</code>)}</div></section>)}</div>}
              {step.chips && <div className="v0-flow-chips">{step.chips.map((chip) => <code key={chip}>{chip}</code>)}</div>}
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}

function FamilyMap() {
  const [activeId, setActiveId] = useState('interaction');
  const activeMember = FAMILY.find((member) => member.name.toLowerCase() === activeId);
  return (
    <div className="v0-family-map" aria-label="Illustrative family system map">
      <LandingExpressionFieldPreview
        mode="system"
        subjects={SYSTEM_FIELD}
        context={{
          label: 'System interaction',
          meta: 'Decision pace across four Baselines',
          detail: 'Three people share one supported route to clarity while one differs. The useful question is how the group coordinates the difference.',
          selectedAxisId: 'responsibility'
        }}
        onSelectionChange={setActiveId}
      />
      <div className="v0-family-evidence" aria-live="polite">
        <span>{activeMember ? `Grounded in · ${activeMember.name}` : 'Grounded in · Shared pattern'}</span>
        <div>{(activeMember?.chips ?? ['GATE 22 ×3', 'GATE 57 ×1']).map((chip) => <code key={chip} className={chip.startsWith('GATE 22') ? 'shared-chip' : ''}>{chip}</code>)}</div>
      </div>
    </div>
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
    }, { threshold: 0.18, rootMargin: '0px 0px -8%' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ComparisonPanel({ title, items, positive }: { title: string; items: readonly string[]; positive: boolean }) {
  return (
    <article className={positive ? 'v0-comparison-positive' : ''}>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}><span aria-hidden="true">{positive ? '✓' : '×'}</span>{item}</li>)}</ul>
    </article>
  );
}
