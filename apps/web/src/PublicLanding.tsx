import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

type QuestionExample = {
  label: string;
  question: string;
  mode: string;
  direct: string;
  steady: string;
  active: string;
  contextLabel: string;
  context: string;
  unknown: string;
  action: string;
};

const questionExamples: readonly QuestionExample[] = [
  {
    label: 'Responsibility',
    question: 'Why do I keep taking responsibility for everyone else?',
    mode: 'Personal + system',
    direct: 'Your ability to create direction is real. The problem begins when responsibility reaches you without matching authority.',
    steady: 'You may naturally notice what is missing and create enough structure for people to move.',
    active: 'Responsibility may feel louder when a situation is uncertain or no one is naming ownership.',
    contextLabel: 'What the system contributes',
    context: 'The wider group may rely on you to stabilize what other people have not agreed to carry.',
    unknown: 'Whether anyone has explicitly asked you to own the outcome.',
    action: 'Look at my role in this system'
  },
  {
    label: 'Decision',
    question: 'Does this decision fit who I am now?',
    mode: 'Alignment',
    direct: 'The direction may fit. The terms determine whether the role does.',
    steady: 'You may work best when responsibility and the ability to shape an outcome stay connected.',
    active: 'Stability may be more attractive right now, even when it requires less autonomy.',
    contextLabel: 'What the choice changes',
    context: 'The decision affects more than preference; it changes who can decide and who carries the consequence.',
    unknown: 'Whether the actual decision rights match the accountability being offered.',
    action: 'Examine the real tradeoff'
  },
  {
    label: 'Relationship',
    question: 'Why does the same moment land differently for us?',
    mode: 'Relationship',
    direct: 'You may reach clarity by naming the issue. They may reach clarity after space. The conflict begins when either route is treated as the only valid one.',
    steady: 'You may reduce uncertainty through direct language and visible movement.',
    active: 'A need for resolution can make your clarity feel urgent.',
    contextLabel: 'What happens between you',
    context: 'Urgency can shorten their processing time; silence can increase the uncertainty driving your urgency.',
    unknown: 'What their pause means until they explain it themselves.',
    action: 'Look at what happens between us'
  },
  {
    label: 'System',
    question: 'Why does this role keep landing with me?',
    mode: 'Family or team',
    direct: 'Responsibility may be concentrating with you while authority remains somewhere else.',
    steady: 'You may be able to hold several moving parts together without losing the main objective.',
    active: 'Pressure increases when the group depends on your coordination but withholds decision power.',
    contextLabel: 'What the system contributes',
    context: 'The structure stays stable while you continue absorbing the gap between responsibility and authority.',
    unknown: 'Who will decide and who will participate when you stop carrying the gap automatically.',
    action: 'See the responsibility structure'
  }
] as const;

const basisFixture = [
  { compact: 'U✓', label: 'User-confirmed experience', time: 'Demonstration fixture', uncertainty: 'confirmed' },
  { compact: 'HD G13.1', label: 'Human Design personality gate 13, line 1', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'GK ACT13', label: 'Gene Keys activation number 13', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'N LP1', label: 'Numerology life path 1', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: '☉ CAN 04.2°', label: 'Natal Sun, Cancer, 4.2 degrees', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'LIVE ♄ ARI 02.3°R', label: 'Live Saturn, Aries, 2.3 degrees, retrograde', time: 'Demonstration fixture', uncertainty: 'low' }
] as const;

export function PublicLanding() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const current = questionExamples[selectedQuestion]!;

  return (
    <main className="sovereign-landing product-v2" data-product-contract="baseline-first" data-answer-contract="sovereign-answer.v2">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home"><span aria-hidden="true">S</span><strong>SOVEREIGN.OS</strong></a>
        <nav aria-label="Public navigation">
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">Questions</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <h1 id="landing-title">Ask about your life.<br />Get an answer built around you.</h1>
          <p>Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the groups around you. Build your Baseline once, then ask naturally and receive an answer grounded in the person asking.</p>
          <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a><a className="landing-secondary" href="#answer">See a Sovereign answer</a></div>
          <small>Start free · No card required · Review, correct, or reject any interpretation</small>
        </div>
        <PublicAnswerStage answer={current} selected={selectedQuestion} onSelect={setSelectedQuestion} compact />
      </section>

      <section className="landing-section context-architecture" aria-labelledby="context-title">
        <SectionHeader kicker="ONE QUESTION · THE RIGHT CONTEXT" title="Sovereign keeps different kinds of information separate—then brings together only what helps." id="context-title">
          A stable Baseline, temporary current context, permission-bound people or systems, and what only you can confirm remain visibly distinct.
        </SectionHeader>
        <div className="context-sequence">
          <article><span>01</span><h3>Your Baseline</h3><p>A stable, explorable, correctable reference for how you may decide, communicate, connect, lead, and respond under pressure.</p></article>
          <article><span>02</span><h3>What may be active now</h3><p>A temporary layer that can make a theme more relevant without determining your behavior.</p></article>
          <article><span>03</span><h3>People and systems</h3><p>Permission-bound relationship context and supplied roles, responsibility, authority, care, reliance, and missing perspectives.</p></article>
          <article><span>04</span><h3>Your answer</h3><p>A direct understanding first, with support, interpretation, confirmation, and unknowns kept visible.</p></article>
        </div>
      </section>

      <section className="landing-section question-section" id="answer" aria-labelledby="questions-title">
        <SectionHeader kicker="REAL QUESTIONS · CLEAR ANSWERS" title="The same intelligence can help with you, a decision, a relationship, or a wider system." id="questions-title">
          Select a real-life question. The useful explanation stays primary while exact Basis remains available underneath it.
        </SectionHeader>
        <PublicAnswerStage answer={current} selected={selectedQuestion} onSelect={setSelectedQuestion} />
      </section>

      <section className="landing-section permission-section" aria-labelledby="permission-title">
        <SectionHeader kicker="PERMISSION BEFORE COMPARISON" title="Understand the interaction without pretending to know another person’s mind." id="permission-title">
          Another person connects their own account and chooses what Sovereign may use. Relationship and system context remains specific, identity-bound, and reversible.
        </SectionHeader>
        <PermissionField />
      </section>

      <section className="landing-section system-section" aria-labelledby="system-title">
        <SectionHeader kicker="FAMILIES · TEAMS · HUMAN SYSTEMS" title="See where authority, responsibility, and pressure stop matching." id="system-title">
          A system can stay stable because one person keeps carrying the gap. Sovereign makes the structure visible without turning one person into the problem.
        </SectionHeader>
        <SystemMap />
      </section>

      <section className="landing-section pricing-preview" aria-labelledby="pricing-title">
        <SectionHeader kicker="SIMPLE PRICING" title="Use Sovereign for yourself. Add shared context when the question includes other people." id="pricing-title" />
        <div className="pricing-options">
          <article><span>FREE</span><h3>A personal AI built around you.</h3><p>Build and explore your own Baseline. Ask about yourself, what may be more relevant now, and the decisions in front of you.</p><strong>$0 <small>permanent · no card</small></strong><ul><li>10 Sovereign AI turns each month</li><li>Baseline, Today, Shadow, Gift, and Alignment</li><li>Review and correct what does not fit</li></ul><a href="/signup">Start free</a></article>
          <article><span>SOVEREIGN+</span><h3>Relationship and system intelligence with permission.</h3><p>Bring permitted Baselines together, explore groups, keep useful understanding, and add Covenant when you choose.</p><strong>$20 <small>/ month</small></strong><p className="annual-price">or $99 / year</p><ul><li>300 Sovereign AI turns each month</li><li>People, Systems, Library, and Covenant</li><li>Consent-aware invitations and sharing controls</li></ul><a href="/pricing">Compare plans</a></article>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <h2 id="final-title">Bring the question you already have.</h2>
        <p>Sovereign gives it a foundation, keeps the relevant people and systems in view, and leaves the final judgment with you.</p>
        <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a><a className="landing-secondary" href="/how-it-works">See how it works</a></div>
        <small>Interpretation stays visible · Consent stays specific · You keep the final say</small>
      </section>

      <footer className="landing-footer"><span>Sovereign.OS · Private personal, relationship, and system intelligence</span><nav aria-label="Footer navigation"><a href="/how-it-works">How it works</a><a href="/pricing">Pricing</a><a href="/faq">Questions</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer>
    </main>
  );
}

function PublicAnswerStage({ answer, selected, onSelect, compact = false }: {
  answer: QuestionExample;
  selected: number;
  onSelect: (index: number) => void;
  compact?: boolean;
}) {
  return (
    <article className={`public-answer-stage answer-product ${compact ? 'compact' : ''}`} aria-label="Sanitized Sovereign answer demonstration">
      <header className="answer-toolbar"><div><span aria-hidden="true" />Sovereign answer</div><strong>Sanitized demonstration · Not your Baseline</strong></header>
      <div className="answer-question-tabs" role="tablist" aria-label="Questions Sovereign can answer">
        {questionExamples.map((item, index) => <button key={item.label} id={`${compact ? 'hero-' : ''}question-tab-${index}`} role="tab" aria-selected={selected === index} aria-controls={`${compact ? 'hero-' : ''}question-panel`} tabIndex={selected === index ? 0 : -1} onClick={() => onSelect(index)} onKeyDown={(event) => moveTabFocus(event, index, questionExamples.length, onSelect)}>{item.label}</button>)}
      </div>
      <div id={`${compact ? 'hero-' : ''}question-panel`} role="tabpanel" aria-labelledby={`${compact ? 'hero-' : ''}question-tab-${selected}`} aria-live="polite">
        <div className="answer-question"><span>YOU ASKED</span><p>“{answer.question}”</p></div>
        <section className="answer-direct"><span>DIRECT ANSWER</span><h2>{answer.direct}</h2></section>
        <div className="answer-context-ribbon"><span>Considering</span><b>Your Baseline</b><b>Active now</b><b>{answer.mode}</b></div>
        <div className="answer-insight-grid">
          <section><span>WHAT MAY BE STEADY</span><p>{answer.steady}</p></section>
          <section><span>WHAT MAY BE ACTIVE NOW</span><p>{answer.active}</p></section>
          <section><span>{answer.contextLabel.toUpperCase()}</span><p>{answer.context}</p></section>
          <section className="answer-unknown"><span>STILL UNKNOWN</span><p>{answer.unknown}</p></section>
        </div>
        <footer className="answer-product-footer"><PublicBasisStrip values={basisFixture} /><a href="/signup">{answer.action} <span aria-hidden="true">→</span></a></footer>
      </div>
    </article>
  );
}

function PermissionField() {
  return (
    <div className="permission-field permission-v2">
      <article><span>YOU MAY BE BRINGING</span><h3>Clarity through naming the issue</h3><p>Uncertainty may become easier when the question is visible.</p></article>
      <div className="between-field"><span>WHAT HAPPENS BETWEEN YOU</span><h3>Urgency shortens their time. Silence increases your urgency.</h3><p>The interaction becomes visible without deciding who is right or claiming access to private motive.</p></div>
      <article><span>THEY MAY BE BRINGING</span><h3>Clarity after time to process</h3><p>Their actual motive remains unknown until they explain it themselves.</p></article>
      <p className="landing-trust-line">No compatibility score. No mind-reading. No one-sided access to another person’s Baseline.</p>
    </div>
  );
}

function SystemMap() {
  const [active, setActive] = useState(0);
  const connections = [
    ['You → Parent', 'Responsibility', 'You coordinate continuity while the parent retains final authority. Responsibility and decision power do not currently match.'],
    ['Parent → Sibling', 'Authority', 'The parent supplies the formal decision context. The sibling’s actual response remains unknown.'],
    ['Sibling → Group', 'Change pressure', 'The sibling challenges a familiar expectation. The supplied role is visible; motive remains unknown.']
  ] as const;
  const current = connections[active]!;
  return (
    <div className="public-system-map system-v2">
      <div className="system-members" aria-label="Demonstration system participants"><button className="stabilizer" aria-pressed={active === 0} onClick={() => setActive(0)}><strong>You</strong><small>Informal stabilizer · supplied</small></button><button aria-pressed={active === 1} onClick={() => setActive(1)}><strong>Parent</strong><small>Formal authority · confirmed</small></button><button aria-pressed={active === 2} onClick={() => setActive(2)}><strong>Sibling</strong><small>Change role · supplied</small></button></div>
      <div className="system-connections" role="tablist" aria-label="Supported system relationships">{connections.map((connection, index) => <button key={connection[0]} id={`system-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="system-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => moveTabFocus(event, index, connections.length, setActive)}><span>{connection[1]}</span>{connection[0]}</button>)}</div>
      <article id="system-panel" className="active-connection" role="tabpanel" aria-labelledby={`system-tab-${active}`}><span>{current[1].toUpperCase()}</span><h3>{current[0]}</h3><p>{current[2]}</p></article>
      <aside className="pressure-field"><span>PRESSURE FIELD</span><strong>Responsibility reaches you. Final authority remains with the parent.</strong><small>Supported by supplied roles and observations; each person’s private motive remains unknown.</small></aside>
      <div className="system-answer-actions"><PublicBasisStrip values={basisFixture.slice(0, 4)} /><button type="button">Explore this through Covenant?</button></div>
    </div>
  );
}

function PublicBasisStrip({ values }: { values: ReadonlyArray<typeof basisFixture[number]> }) {
  const [open, setOpen] = useState(false);
  const mobile = usePublicMediaQuery('(max-width: 640px)');
  const limit = mobile ? 3 : 5;
  const visible = values.slice(0, limit);
  return <div className="public-basis"><button className="public-basis-strip" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><strong>BASIS</strong>{visible.map((value) => <span key={value.compact} aria-label={value.label}>{value.compact}</span>)}{values.length > visible.length && <b>+{values.length - visible.length}</b>}</button>{open && <dl className="public-basis-source" aria-label="Exact source details">{values.map((value) => <div key={value.compact}><dt>{value.compact}</dt><dd><span>{value.label}</span><small>{value.time} · {value.uncertainty} uncertainty</small></dd></div>)}</dl>}</div>;
}

function SectionHeader({ kicker, title, id, children }: { kicker: string; title: string; id: string; children?: string }) {
  return <header className="landing-section-header"><p className="landing-kicker">{kicker}</p><h2 id={id}>{title}</h2>{children && <p>{children}</p>}</header>;
}

function usePublicMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function moveTabFocus(event: KeyboardEvent<HTMLButtonElement>, index: number, count: number, select: (next: number) => void) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
  select(next);
  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
}
