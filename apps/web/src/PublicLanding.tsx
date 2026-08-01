import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

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
      { code: 'AUTH · EMO', label: 'Illustrative permitted decision timing' },
      { code: 'GK 13', label: 'Illustrative Gene Key activation' }
    ]
  },
  {
    name: 'Maya',
    accent: '#7f9a8f',
    points: [
      { code: 'SUN · VIRGO', label: 'Illustrative natal Sun placement' },
      { code: 'AUTH · SPLENIC', label: 'Illustrative permitted decision timing' },
      { code: 'GK 25', label: 'Illustrative Gene Key activation' }
    ]
  }
] as const;

const SELF_FLOW: readonly FlowStep[] = [
  { kind: 'input', title: 'What you’re feeling', body: 'The pull to fix everyone’s problems—often before your own.' },
  { kind: 'read', title: 'What your Baseline shows', body: 'Stability may be a core value, and under stress protecting others can become a way to create safety.', chips: ['GK 13.4', 'MARS · CANCER'] },
  { kind: 'connect', title: 'The pattern, named', body: 'Taking control is not a flaw. It may be a useful capacity that becomes over-responsibility when ownership is unclear.' },
  { kind: 'direction', title: 'Start here', body: 'Notice the first moment responsibility moves toward you, then ask: is this actually mine to carry?' }
] as const;

const DUO_FLOW: readonly FlowStep[] = [
  { kind: 'input', title: 'The friction you feel', body: 'The same conversation lands calm for one person and urgent for the other.' },
  {
    kind: 'read',
    title: 'Each Baseline, read in parallel',
    body: 'Sovereign checks how each person may naturally reach clarity, using only permitted information.',
    branches: [
      { name: 'You', accent: '#e8ddd0', chips: ['AUTH · EMO', 'Needs time'] },
      { name: 'Maya', accent: '#7f9a8f', chips: ['AUTH · SPLENIC', 'Recognizes now'] }
    ]
  },
  { kind: 'connect', title: 'What may be happening', body: 'The tension may be a timing gap rather than a values gap. Neither person has to be reduced to wrong.' },
  { kind: 'direction', title: 'What may work for both', body: 'Name the decision and agree on a return time. One person can share an initial sense; the other can confirm after processing.' }
] as const;

const FAMILY = [
  { name: 'You', role: 'Parent', chips: ['SUN · LEO', 'AUTH · EMO'], shares: true, x: 50, y: 15 },
  { name: 'Maya', role: 'Partner', chips: ['SUN · VIRGO', 'AUTH · SPLENIC'], shares: false, x: 84, y: 50 },
  { name: 'Noa', role: 'Child', chips: ['SUN · PISCES', 'AUTH · EMO'], shares: true, x: 50, y: 85 },
  { name: 'Ruth', role: 'Grandparent', chips: ['SUN · CAP', 'AUTH · EMO'], shares: true, x: 16, y: 50 }
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
          <em>Holding onto the pain is.</em>
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
  return (
    <section id="how" className="v0-story v0-story-self" data-viewport-section="personal">
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
        <ProcessingFlow title="How Sovereign works it through" steps={SELF_FLOW} surface="personal-reasoning" />
      </div>
      <a className="v0-story-action" href="/signup">Try it free <span aria-hidden="true">→</span></a>
    </section>
  );
}

function RelationshipStory() {
  return (
    <section className="v0-story v0-story-relationship" data-viewport-section="relationship">
      <StoryHeading step="Step 02 · You + 1" title="See the space" outline="between you.">
        Bring another person’s permitted Baseline into the room. Sovereign keeps both people distinct, then shows what the interaction may create between them.
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
        <ProcessingFlow title="How Sovereign reads both of you" steps={DUO_FLOW} surface="relationship-reasoning" />
      </div>
      <p className="v0-consent-note">Illustrative permitted Baselines · No compatibility score · No private-thought claims</p>
      <a className="v0-story-action v0-story-action-secondary" href="/signup">Explore a relationship <span aria-hidden="true">→</span></a>
    </section>
  );
}

function SystemStory() {
  return (
    <section className="v0-story v0-story-system" data-viewport-section="system">
      <StoryHeading step="Step 03 · Your whole system" title="From one person" outline="to the whole system.">
        Bring permitted Baselines, roles, and responsibility into one view. The system map appears inside the same conversation, where the pattern becomes useful.
      </StoryHeading>
      <div className="v0-system-stage" data-viewport-stage="system">
        <ChatWindow title="Sovereign — Family System" surface="system-map" wide>
          <Message side="user">Can you map my whole family? Decisions around here always seem to take forever.</Message>
          <Message side="assistant" wide>
            Three of the four illustrative profiles share emotional decision timing, so important choices may need time to settle. That is a possible structural pattern—not a verdict about any person.
            <FamilyMap />
            <p className="v0-system-followup">Maya’s route to clarity may differ, which can make the mismatch feel personal when it is partly about timing. The actual experience still belongs to each person to confirm.</p>
            <BaselineTrace groups={[{ points: [{ code: 'AUTH · EMO ×3', label: 'Three illustrative emotional-timing profiles' }, { code: 'SPLENIC ×1', label: 'One illustrative immediate-recognition profile' }] }]} />
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

function ProcessingFlow({ title, steps, surface }: { title: string; steps: readonly FlowStep[]; surface: string }) {
  return (
    <article className="v0-window v0-flow" data-viewport-surface={surface}>
      <header><b aria-hidden="true" /><span>{title}</span><small>Baseline Design</small></header>
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
  );
}

function FamilyMap() {
  return (
    <div className="v0-family-map" aria-label="Illustrative family system map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {FAMILY.map((member) => <line key={member.name} x1="50" y1="50" x2={member.x} y2={member.y} className={member.shares ? 'shared' : 'different'} />)}
      </svg>
      <div className="v0-family-center"><span>Shared pattern</span><strong>Emotional<br />Authority</strong><small>3 of 4</small></div>
      {FAMILY.map((member) => (
        <article key={member.name} className={member.shares ? 'shares' : ''} style={{ left: `${member.x}%`, top: `${member.y}%` }}>
          <header><b>{member.name.slice(0, 1)}</b><strong>{member.name}</strong><small>{member.role}</small></header>
          <div>{member.chips.map((chip) => <code key={chip} className={chip === 'AUTH · EMO' ? 'shared-chip' : ''}>{chip}</code>)}</div>
        </article>
      ))}
      <footer><span><i />Shares the pattern</span><span><i />Different route</span></footer>
    </div>
  );
}

function ComparisonPanel({ title, items, positive }: { title: string; items: readonly string[]; positive: boolean }) {
  return (
    <article className={positive ? 'v0-comparison-positive' : ''}>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}><span aria-hidden="true">{positive ? '✓' : '×'}</span>{item}</li>)}</ul>
    </article>
  );
}
