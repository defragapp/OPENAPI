import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

const heroAnswer = {
  question: 'Why do I keep taking responsibility for everyone else?',
  direct: 'Your capacity is real. The question is whether the responsibility is actually yours.',
  connection: 'You may create direction quickly when ownership is unclear. That can be a genuine strength. The cost begins when you carry the outcome without matching authority.',
  experiment: 'Before taking it on, ask: “Am I being asked to lead—or only to absorb the uncertainty?”'
} as const;

const basisFixture = [
  { compact: 'U✓', label: 'User-confirmed experience', time: 'Demonstration fixture', uncertainty: 'confirmed' },
  { compact: 'HD G13.1', label: 'Human Design personality gate 13, line 1', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'GK ACT13', label: 'Gene Keys activation number 13', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'N LP1', label: 'Numerology life path 1', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: '☉ CAN 04.2°', label: 'Natal Sun, Cancer, 4.2 degrees', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'LIVE ♄ ARI 02.3°R', label: 'Live Saturn, Aries, 2.3 degrees, retrograde', time: 'Demonstration fixture', uncertainty: 'low' }
] as const;

const questionAnswers = [
  {
    question: 'Why do I respond this way when pressure rises?',
    mode: 'ABOUT ME',
    headline: 'A useful strength can become too much responsibility under pressure.',
    direct: 'Creating direction may be one of your steady capacities. Pressure changes the way you use it: what normally creates clarity can become an attempt to remove uncertainty for everyone.',
    sections: [['STEADY', 'You can create direction without needing every variable settled.'], ['SHADOW', 'You may take over responsibility before authority has been agreed.'], ['GIFT', 'You can name the decision, the owner, and the next step without carrying every person inside it.'], ['ALIGNMENT', 'The role fits when authority, responsibility, and consequences match.']]
  },
  {
    question: 'Does this decision fit who I am now?',
    mode: 'A DECISION',
    headline: 'The choice may fit; the terms determine whether the role does.',
    direct: 'This choice may use your ability to create direction, but the title alone is not enough. Fit depends on whether you can shape the conditions you will be accountable for.',
    sections: [['SUPPORTS THE FIT', 'Meaningful authority and room to establish structure.'], ['PULLS AGAINST IT', 'Responsibility for outcomes you cannot influence.'], ['THE REAL TRADEOFF', 'You would accept less autonomy in exchange for stability.'], ['STILL NEEDED', 'A direct answer about decision rights.']]
  },
  {
    question: 'Why does the same moment land differently for us?',
    mode: 'A RELATIONSHIP',
    headline: 'You may reach clarity through movement while they reach it through space.',
    direct: 'Your permitted Baseline may make uncertainty easier once the question is named. Their permitted Baseline may need time before language becomes reliable. Your attempt to create clarity can therefore feel like pressure, while their pause can feel like withdrawal.',
    sections: [['YOU MAY BE BRINGING', 'Directness that becomes more urgent when the relationship feels unclear.'], ['THEY MAY BE BRINGING', 'A slower route to language; their actual motive remains unknown.'], ['WHAT HAPPENS BETWEEN YOU', 'Urgency shortens their processing time, while silence increases the uncertainty driving your urgency.'], ['WHAT STILL MUST BE ASKED', 'What the pause means to them and when they are willing to return.']]
  },
  {
    question: 'Why does this responsibility keep landing with me?',
    mode: 'A FAMILY OR TEAM',
    headline: 'Responsibility may be concentrating with you while authority remains elsewhere.',
    direct: 'People may bring uncertainty to you because you organize it, while final decisions remain somewhere else. That can make you responsible for continuity without the power to change the conditions creating the pressure.',
    sections: [['ROLE', 'You notice what is disconnected and create enough structure for the group to keep moving.'], ['PRESSURE FIELD', 'Responsibility concentrates with you while formal authority stays elsewhere.'], ['MOVEMENT', 'When you stop stabilizing automatically, the system has to reveal who will decide and who will participate.'], ['UNKNOWN', 'Each person must participate or confirm how they understand the arrangement.']]
  }
] as const;

const scaleStories = [
  {
    label: 'Yourself',
    title: 'See what remains true—and what pressure changes.',
    body: 'Explore your Baseline, current context, Shadow, Gift, and Alignment without reducing yourself to a label.',
    prompt: 'Why do I keep taking responsibility for everyone else?'
  },
  {
    label: 'Relationship',
    title: 'Understand the interaction from both sides.',
    body: 'Bring two permitted Baselines together. Keep You, Them, and What Happens Between You distinct.',
    prompt: 'Why does the same moment land differently for us?'
  },
  {
    label: 'System',
    title: 'See who decides. See who carries the result.',
    body: 'Map roles, authority, responsibility, reliance, pressure, and missing perspectives across a family or team.',
    prompt: 'Why does this responsibility keep landing with me?'
  }
] as const;

export function PublicLanding() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [selectedScale, setSelectedScale] = useState(0);
  const currentAnswer = questionAnswers[selectedQuestion]!;
  const currentScale = scaleStories[selectedScale]!;

  return (
    <main className="sovereign-landing" data-product-contract="baseline-first" data-answer-contract="sovereign-answer.v2">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home"><span aria-hidden="true" /><strong>SOVEREIGN.OS</strong></a>
        <nav aria-label="Public navigation">
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">Questions</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Build my Baseline</a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <h1 id="landing-title">Know yourself.<br />Understand the system.<br /><em>Choose what fits.</em></h1>
          <p>Sovereign.OS is a private AI for understanding yourself, your relationships, and the systems around you. Build your Baseline once, then ask naturally and receive an answer grounded in the person asking.</p>
          <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="#answer">See a Sovereign answer</a></div>
          <small>Start free · No card required · Review, correct, or reject any interpretation</small>
        </div>
        <HeroIntelligenceStage />
      </section>

      <section className="landing-foundation" aria-labelledby="foundation-title">
        <header>
          <p className="landing-kicker">A BETTER STARTING POINT</p>
          <h2 id="foundation-title">Your intelligence begins with your Baseline.</h2>
          <p>Most AI begins with whatever you type into a blank box. Sovereign begins with a lasting reference for how you may decide, communicate, learn, connect, lead, and respond under pressure.</p>
        </header>
        <BaselineContextStage />
      </section>

      <section className="landing-section scale-section" aria-labelledby="scale-title">
        <SectionHeader kicker="ONE INTELLIGENCE · THREE CONNECTED SCALES" title="The question changes. The environment stays the same." id="scale-title">
          Move from yourself to a relationship or wider system without rebuilding context from the beginning. Sovereign uses only the context that belongs to the question.
        </SectionHeader>
        <div className="scale-experience">
          <nav aria-label="Sovereign intelligence scales" role="tablist">
            {scaleStories.map((story, index) => <button
              key={story.label}
              id={`scale-tab-${index}`}
              role="tab"
              aria-selected={selectedScale === index}
              aria-controls="scale-panel"
              tabIndex={selectedScale === index ? 0 : -1}
              onClick={() => setSelectedScale(index)}
              onKeyDown={(event) => moveTabFocus(event, index, scaleStories.length, setSelectedScale)}
            ><span>0{index + 1}</span><strong>{story.label}</strong></button>)}
          </nav>
          <article id="scale-panel" role="tabpanel" aria-labelledby={`scale-tab-${selectedScale}`}>
            <p>{currentScale.label.toUpperCase()}</p>
            <h3>{currentScale.title}</h3>
            <span>{currentScale.body}</span>
            <blockquote>“{currentScale.prompt}”</blockquote>
          </article>
        </div>
      </section>

      <section className="landing-section question-section" id="answer" aria-labelledby="questions-title">
        <SectionHeader kicker="A REAL QUESTION · A PERSONAL ANSWER" title="Useful language first. Exact support when you want it." id="questions-title">
          Select a question to see how the answer changes across self, decisions, relationships, and systems while keeping possibility, confirmation, and unknowns separate.
        </SectionHeader>
        <div className="landing-question-rail" role="tablist" aria-label="Questions Sovereign can answer">
          {questionAnswers.map((item, index) => (
            <button
              key={item.question}
              id={`question-tab-${index}`}
              role="tab"
              aria-selected={selectedQuestion === index}
              aria-controls="question-answer-stage"
              tabIndex={selectedQuestion === index ? 0 : -1}
              onClick={() => setSelectedQuestion(index)}
              onKeyDown={(event) => moveTabFocus(event, index, questionAnswers.length, setSelectedQuestion)}
            >{item.question}</button>
          ))}
        </div>
        <PublicAnswerStage answer={currentAnswer} tabId={`question-tab-${selectedQuestion}`} />
      </section>

      <section className="landing-section permission-section" aria-labelledby="permission-title">
        <SectionHeader kicker="PERMISSION BEFORE COMPARISON" title="Another person remains a person—not a data source you control." id="permission-title">
          Invitations are identity-bound and use-specific. Each person chooses what Sovereign may use. The product can show interaction, responsibility, and missing perspective without claiming access to private thoughts.
        </SectionHeader>
        <PermissionField />
      </section>

      <section className="landing-section pricing-preview" aria-labelledby="pricing-title">
        <SectionHeader kicker="START FREE · EXPAND WITH PERMISSION" title="Begin with yourself. Add relationships and systems when they matter." id="pricing-title" />
        <div className="pricing-options">
          <article><span>FREE</span><h3>Understand yourself.</h3><p>Build and explore your own Baseline. Ask about yourself, what may be more relevant now, and the decisions in front of you.</p><strong>$0 <small>permanent · no card</small></strong><ul><li>10 Sovereign AI turns each month</li><li>Baseline, Today, Shadow, Gift, and Alignment</li><li>Review and correct what does not fit</li></ul><a href="/signup">Build my Baseline</a></article>
          <article><span>SOVEREIGN+</span><h3>Understand the people and systems around you.</h3><p>Bring permitted Baselines together, explore relationships and groups, keep useful understanding, and add Covenant when you choose.</p><strong>$20 <small>/ month</small></strong><p className="annual-price">or $99 / year</p><ul><li>300 Sovereign AI turns each month</li><li>People, Systems, Library, and Covenant</li><li>Consent-aware invitations and sharing controls</li></ul><a href="/pricing">Compare plans</a></article>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <p className="landing-kicker">CLARITY IS LEVERAGE</p>
        <h2 id="final-title">Give your questions a foundation built around you.</h2>
        <p>Build your Baseline, then ask Sovereign about yourself, a decision, a relationship, or the system around you.</p>
        <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="/how-it-works">See how it works</a></div>
        <small>Interpretation stays visible · Consent stays specific · You keep the final say</small>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Private personal, relationship, and system intelligence</span>
        <nav aria-label="Footer navigation"><a href="/how-it-works">How it works</a><a href="/pricing">Pricing</a><a href="/faq">Questions</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      </footer>
    </main>
  );
}

function HeroIntelligenceStage() {
  return (
    <article className="hero-intelligence-stage" aria-label="Sovereign answer demonstration">
      <div className="hero-baseline-core" aria-label="Conceptual Baseline and current context">
        <span className="baseline-orbit orbit-one" aria-hidden="true" />
        <span className="baseline-orbit orbit-two" aria-hidden="true" />
        <span className="baseline-orbit orbit-three" aria-hidden="true" />
        <div><small>YOUR BASELINE</small><strong>Creating direction</strong><em>when ownership is unclear</em></div>
        <p className="baseline-signal signal-one"><b>Communication</b> under pressure</p>
        <p className="baseline-signal signal-two"><b>Responsibility</b> more active</p>
        <p className="baseline-signal signal-three"><b>Relationship</b> asking for clarity</p>
      </div>
      <section className="hero-answer">
        <header><span>EXAMPLE ANSWER</span><strong>Sovereign · Personal</strong></header>
        <p className="fixture-label hero-fixture-scope">Sanitized demonstration · Not your Baseline</p>
        <p className="fixture-label">YOU ASKED</p>
        <p className="living-question">“{heroAnswer.question}”</p>
        <div className="living-answer-body">
          <span>DIRECT ANSWER</span>
          <h2>{heroAnswer.direct}</h2>
          <div className="living-connection"><strong>THE PERSONAL CONNECTION</strong><p>{heroAnswer.connection}</p></div>
          <aside><strong>A PRACTICAL NEXT STEP</strong>{heroAnswer.experiment}</aside>
        </div>
        <details className="living-answer-basis">
          <summary>Why this is personal · {basisFixture.length} supporting values</summary>
          <BasisSourceList values={basisFixture} />
        </details>
      </section>
    </article>
  );
}

function BaselineContextStage() {
  return (
    <div className="baseline-context-stage">
      <div className="baseline-context-core"><span>YOUR BASELINE</span><strong>Creates direction when ownership is unclear</strong><small>Stable · explorable · correctable</small></div>
      <div className="baseline-context-line current"><span>WHAT MAY BE ACTIVE NOW</span><strong>Responsibility may deserve attention for a limited time.</strong><small>Temporary context does not determine behavior.</small></div>
      <div className="baseline-context-line confirmed"><span>YOUR CONFIRMATION</span><strong>“Yes, this is louder this week.”</strong></div>
      <div className="baseline-context-line unknown"><span>STILL UNKNOWN</span><strong>How you are actually responding today.</strong></div>
      <PublicBasisStrip values={basisFixture.slice(0, 5)} />
    </div>
  );
}

function PublicAnswerStage({ answer, tabId }: { answer: typeof questionAnswers[number]; tabId: string }) {
  return (
    <article id="question-answer-stage" className="public-answer-stage" role="tabpanel" aria-labelledby={tabId} aria-live="polite">
      <header><span>{answer.mode}</span><small>EXPLORATORY</small><h3>{answer.headline}</h3></header>
      <p>{answer.direct}</p>
      <div>{answer.sections.map(([label, body]) => <section key={label}><span>{label}</span><p>{body}</p></section>)}</div>
      <PublicBasisStrip values={basisFixture.slice(0, 4)} />
    </article>
  );
}

function PermissionField() {
  const [active, setActive] = useState<'relationship' | 'system'>('relationship');
  return (
    <div className="permission-field">
      <nav aria-label="Permission demonstration"><button aria-pressed={active === 'relationship'} onClick={() => setActive('relationship')}>Relationship</button><button aria-pressed={active === 'system'} onClick={() => setActive('system')}>System</button></nav>
      {active === 'relationship' ? (
        <div className="relationship-field-public">
          <article><span>YOU MAY BE BRINGING</span><strong>Clarity through naming the question</strong><p>Uncertainty becomes easier when movement begins.</p></article>
          <div className="between-field"><span>WHAT HAPPENS BETWEEN YOU</span><strong>Urgency shortens their time. Silence increases your urgency.</strong><p>The interaction becomes visible without deciding who is right.</p></div>
          <article><span>THEY MAY BE BRINGING</span><strong>Clarity after time to process</strong><p>Their actual motive remains unknown until they speak for themselves.</p></article>
        </div>
      ) : <SystemMap />}
      <p className="landing-trust-line">No compatibility score. No mind-reading. No one-sided access to another person’s Baseline.</p>
    </div>
  );
}

function PublicBasisStrip({ values, showSource = false }: {
  values: ReadonlyArray<typeof basisFixture[number]>;
  showSource?: boolean;
}) {
  const [open, setOpen] = useState(showSource);
  const mobile = usePublicMediaQuery('(max-width: 640px)');
  const limit = mobile ? 3 : 5;
  const visible = values.slice(0, limit);
  return (
    <div className="public-basis">
      <button className="public-basis-strip" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <strong>BASIS</strong>
        {visible.map((value) => <span key={value.compact} aria-label={value.label}>{value.compact}</span>)}
        {values.length > visible.length && <b>+{values.length - visible.length}</b>}
      </button>
      {open && <BasisSourceList values={values} />}
    </div>
  );
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

function BasisSourceList({ values }: { values: ReadonlyArray<typeof basisFixture[number]> }) {
  return (
    <dl className="public-basis-source" aria-label="Exact source details">
      {values.map((value) => <div key={value.compact}><dt>{value.compact}</dt><dd><span>{value.label}</span><small>{value.time} · {value.uncertainty} uncertainty</small></dd></div>)}
    </dl>
  );
}

function SystemMap() {
  const [active, setActive] = useState(0);
  const connections = [
    ['Maya → Leon', 'Responsibility', 'Maya coordinates outcomes; Leon holds the formal decision. Authority and responsibility do not currently match.'],
    ['Leon → Eli', 'Authority', 'Leon supplies the formal decision context. Eli has confirmed the reporting line.'],
    ['Rae → Maya', 'Reliance', 'Rae has confirmed that practical uncertainty is usually routed through Maya.'],
    ['Eli → Group', 'Change pressure', 'Eli is challenging a familiar expectation. The role is supplied; motive remains unknown.']
  ] as const;
  const activeConnection = connections[active]!;
  return (
    <div className="public-system-map">
      <div className="system-members" aria-label="Permitted system participants">
        <button className="stabilizer" aria-pressed={active === 0} onClick={() => setActive(0)}><strong>Maya</strong><small>Informal stabilizer · permitted</small></button>
        <button aria-pressed={active === 1} onClick={() => setActive(1)}><strong>Leon</strong><small>Formal authority · confirmed</small></button>
        <button aria-pressed={active === 2} onClick={() => setActive(2)}><strong>Rae</strong><small>Care recipient · permitted</small></button>
        <button aria-pressed={active === 3} onClick={() => setActive(3)}><strong>Eli</strong><small>Change role · supplied</small></button>
      </div>
      <div className="system-connections" role="tablist" aria-label="Supported system relationships">
        {connections.map((connection, index) => <button
          key={connection[0]}
          id={`system-connection-tab-${index}`}
          role="tab"
          aria-selected={active === index}
          aria-controls="system-connection-panel"
          tabIndex={active === index ? 0 : -1}
          onClick={() => setActive(index)}
          onKeyDown={(event) => moveTabFocus(event, index, connections.length, setActive)}
        ><span>{connection[1]}</span>{connection[0]}</button>)}
      </div>
      <article id="system-connection-panel" className="active-connection" role="tabpanel" aria-labelledby={`system-connection-tab-${active}`}><span>{activeConnection[1].toUpperCase()}</span><h3>{activeConnection[0]}</h3><p>{activeConnection[2]}</p></article>
      <aside className="pressure-field"><span>PRESSURE FIELD</span><strong>Responsibility reaches Maya. Final authority remains with Leon.</strong><small>Supported by supplied roles and current observations; each member’s private motive remains unknown.</small></aside>
      <div className="system-answer-actions"><PublicBasisStrip values={basisFixture.slice(0, 4)} /><button type="button">Explore this through Covenant?</button></div>
    </div>
  );
}

function SectionHeader({ kicker, title, id, children }: { kicker: string; title: string; id: string; children?: string }) {
  return <header className="landing-section-header"><p className="landing-kicker">{kicker}</p><h2 id={id}>{title}</h2>{children && <p>{children}</p>}</header>;
}

function moveTabFocus(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  count: number,
  select: (next: number) => void
) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? count - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
  select(next);
  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
}
