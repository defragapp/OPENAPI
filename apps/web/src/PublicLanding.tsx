import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

const heroAnswer = {
  question: 'Why do I keep taking responsibility for everyone else?',
  direct: 'You may be quick to create direction when responsibility is unclear. That can be a real leadership strength. The cost appears when you carry the outcome without matching authority. You are not being asked to become less capable. The question is whether your responsibility, decision power, and exposure to the outcome actually match.',
  shadow: 'Under pressure, you may end the uncertainty by taking over, then experience other people’s dependence as abandonment.',
  gift: 'At its best, the same capacity helps you clarify the decision, name who owns it, and make a path forward visible without carrying everyone inside it.',
  alignment: 'The role fits when authority, responsibility, and consequences match. It pulls against you when you are expected to carry the outcome but cannot shape the terms.',
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
    sections: [['STEADY', 'You can create direction without needing every variable settled.'], ['UNDER PRESSURE', 'You may take over responsibility before authority has been agreed.'], ['STILL UNKNOWN', 'Whether this matches your actual experience remains yours to confirm.']]
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
    sections: [['YOU MAY BE BRINGING', 'Directness that becomes more urgent when the relationship feels unclear.'], ['THEY MAY BE BRINGING', 'A slower route to language; their actual motive remains unknown.'], ['WHAT HAPPENS BETWEEN YOU', 'Urgency shortens their processing time, while silence increases the uncertainty driving your urgency.']]
  },
  {
    question: 'Why does this responsibility keep landing with me?',
    mode: 'A FAMILY OR TEAM',
    headline: 'Responsibility may be concentrating with you while authority remains elsewhere.',
    direct: 'People may bring uncertainty to you because you organize it, while final decisions remain somewhere else. That can make you responsible for continuity without the power to change the conditions creating the pressure.',
    sections: [['ROLE', 'You notice what is disconnected and create enough structure for the group to keep moving.'], ['PRESSURE', 'Responsibility concentrates with you while formal authority stays elsewhere.'], ['UNKNOWN', 'Each person must participate or confirm how they understand the arrangement.']]
  }
] as const;

const expressionStates = {
  Shadow: 'You end uncertainty by deciding for everyone, then experience their dependence as abandonment.',
  Gift: 'You clarify the decision, name who owns it, and make a path forward visible.',
  Alignment: 'You lead where authority and responsibility match, and leave shared responsibility visible.'
} as const;

type ExpressionState = keyof typeof expressionStates;

export function PublicLanding() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [expression, setExpression] = useState<ExpressionState>('Gift');
  const currentAnswer = questionAnswers[selectedQuestion]!;

  return (
    <main className="sovereign-landing" data-product-contract="baseline-first" data-answer-contract="sovereign-answer.v2">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home"><span aria-hidden="true">S</span><strong>SOVEREIGN.OS</strong></a>
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
          <p className="landing-kicker">PERSONAL AI FOR REAL LIFE</p>
          <h1 id="landing-title">Ask about your life.<br /><em>Get an answer built around you.</em></h1>
          <p>Sovereign.OS is a private personal AI for understanding yourself, your relationships, and the decisions in front of you. Build your Baseline once, then ask naturally and receive answers grounded in the person asking.</p>
          <p className="landing-support">See what is supported, what is only possible, and what remains unknown. You decide what fits.</p>
          <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="#questions">See a Sovereign answer</a></div>
          <small>Start free · No card required · Review, correct, or reject any interpretation</small>
        </div>
        <LivingSovereignAnswer />
      </section>

      <section className="landing-section" aria-labelledby="purpose-title">
        <SectionHeader kicker="WHY SOVEREIGN EXISTS" title="Healing isn’t optional. Holding the pain is." id="purpose-title">
          Understanding does not erase what happened. It helps you see what is yours, what was created between people, what the wider system reinforced, and what can change without turning pain into identity or another person into a diagnosis. Sovereign does not decide for you. It gives you a clearer place to begin.
        </SectionHeader>
      </section>

      <section className="landing-section question-section" id="questions" aria-labelledby="questions-title">
        <SectionHeader
          kicker="BRING THE QUESTION YOU ALREADY HAVE"
          title="One AI for the parts of life that are hardest to understand from inside them."
          id="questions-title"
        >
          Ask about yourself, a decision, a relationship, a family, or a team. Select a real question to see how one Sovereign answer changes with the context that matters.
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

      <section className="landing-section baseline-now-section" aria-labelledby="baseline-now-title">
        <SectionHeader kicker="WHY THIS AI IS DIFFERENT" title="Most AI starts with a blank prompt. Sovereign starts with you." id="baseline-now-title">
          Sovereign.OS turns Baseline Design into a private AI for personal, relationship, and system intelligence. Your Baseline gives Sovereign a lasting reference for how you may communicate, decide, connect, learn, lead, and respond under pressure. Current context is added only when you choose and never determines your behavior.
        </SectionHeader>
        <div className="baseline-now-visual">
          <div className="baseline-steady"><span>YOUR BASELINE</span><strong>Creates direction when ownership is unclear</strong><small>Stable, explorable, and correctable</small></div>
          <div className="current-layer"><span>WHAT MAY BE ACTIVE NOW</span><strong>Responsibility may deserve attention now</strong><small>Temporary context · six-hour window</small></div>
          <div className="confirmation-state"><span>YOUR CONFIRMATION</span><strong>“Yes, this is louder this week.”</strong></div>
          <div className="unknown-state"><span>STILL UNKNOWN</span><strong>How you are actually responding</strong></div>
          <PublicBasisStrip values={basisFixture.slice(0, 5)} />
        </div>
      </section>

      <section className="landing-section expression-section" aria-labelledby="expression-title">
        <SectionHeader kicker="ONE QUALITY · MORE THAN ONE EXPRESSION" title="The same strength can protect you, limit you, or become something you can use well." id="expression-title">
          See what a quality may look like under pressure, what it makes possible at its best, and how to recognize when the way you are using it actually fits.
        </SectionHeader>
        <div className="expression-visual">
          <div className="central-quality"><span>CORE QUALITY</span><strong>Creating direction</strong><small>when a situation has no clear owner</small></div>
          <div className="expression-tabs" role="tablist" aria-label="Expressions of creating direction">
            {(Object.keys(expressionStates) as ExpressionState[]).map((state, index, states) => <button
              key={state}
              id={`expression-tab-${state.toLowerCase()}`}
              role="tab"
              aria-selected={expression === state}
              aria-controls="expression-panel"
              tabIndex={expression === state ? 0 : -1}
              onClick={() => setExpression(state)}
              onKeyDown={(event) => moveTabFocus(event, index, states.length, (next) => setExpression(states[next]!))}
            >{state}</button>)}
          </div>
          <p id="expression-panel" role="tabpanel" aria-labelledby={`expression-tab-${expression.toLowerCase()}`} aria-live="polite">{expressionStates[expression]}</p>
        </div>
      </section>

      <section className="landing-section relationship-section" aria-labelledby="relationship-title">
        <SectionHeader kicker="TWO PEOPLE · SHARED WITH PERMISSION" title="Two people can experience the same moment differently." id="relationship-title">
          Sovereign helps show what each person may bring, what happens between them, and what still has to be asked directly—without reducing either person to a score or claiming access to private thoughts.
        </SectionHeader>
        <ol className="permission-journey" aria-label="Private relationship comparison">
          <li><span>1</span>Invite a person</li>
          <li><span>2</span>They choose what to share</li>
          <li><span>3</span>Sovereign uses only permitted context</li>
          <li><span>4</span>Both perspectives remain distinct</li>
          <li><span>5</span>The interaction becomes visible</li>
        </ol>
        <div className="relationship-visual">
          <article><span>YOU MAY BE BRINGING</span><strong>Clarity through naming the question</strong><p>Uncertainty becomes easier when movement begins.</p></article>
          <article><span>THEY MAY BE BRINGING</span><strong>Clarity after time to process</strong><p>Language may become reliable after intensity settles.</p></article>
          <article><span>WHAT HAPPENS BETWEEN YOU</span><strong>Your urgency shortens their time. Their silence increases your urgency.</strong><p>Each person’s response can make sense from one side and become harder to understand from the other.</p></article>
          <article><span>WHAT EACH PERSON CAN OWN</span><strong>Directness without demanding an immediate conclusion. Space without indefinite suspension.</strong></article>
          <article><span>WHAT STILL MUST BE ASKED DIRECTLY</span><strong>What the pause means to them and when they are willing to return.</strong><p>“I do not need the answer now. I do need us to choose when we will return to this.”</p></article>
        </div>
        <p className="landing-trust-line">No compatibility score. No mind-reading. No one-sided access to another person’s Baseline.</p>
      </section>

      <section className="landing-section system-section" aria-labelledby="system-title">
        <SectionHeader kicker="FAMILIES · TEAMS · HUMAN SYSTEMS" title="See who decides. See who carries the result." id="system-title">
          A family or team is more than a list of people. Sovereign helps you see how roles, authority, responsibility, care, pressure, and missing perspectives shape the way the whole group functions.
        </SectionHeader>
        <SystemMap />
      </section>

      <section className="landing-section basis-section" aria-labelledby="basis-title">
        <SectionHeader kicker="CLEAR ANSWER FIRST" title="See what shaped the answer when you want the detail." id="basis-title">
          Sovereign gives you the useful explanation first. Basis keeps the exact approved values available beneath it without asking you to decode them before understanding the answer. Basis supports an interpretation; it does not prove personality, motive, behavior, or outcome.
        </SectionHeader>
        <div className="exact-support-demo"><PublicBasisStrip values={basisFixture} showSource /></div>
      </section>

      <section className="landing-section pricing-preview" aria-labelledby="pricing-title">
        <SectionHeader kicker="START FREE · EXPAND WITH PERMISSION" title="Start free. Bring in relationships and systems when you need them." id="pricing-title" />
        <div className="pricing-options">
          <article><span>FREE</span><h3>A personal AI built around you.</h3><p>Build and explore your own Baseline. Ask about yourself, what may be more relevant now, and the decisions in front of you.</p><strong>$0 <small>permanent · no card</small></strong><ul><li>10 Sovereign AI turns each month</li><li>Baseline, Today, Shadow, Gift, and Alignment</li><li>Review and correct what does not fit</li></ul><a href="/signup">Build my Baseline</a></article>
          <article><span>SOVEREIGN+</span><h3>Understand the people and systems around you.</h3><p>Bring permitted Baselines together, explore relationships and groups, save what remains useful, and add Christian Scripture when you choose.</p><strong>$20 <small>/ month</small></strong><p className="annual-price">or $99 / year</p><ul><li>300 Sovereign AI turns each month</li><li>People, Systems, Library, and Covenant</li><li>Consent-aware shared use</li></ul><a href="/pricing">See Sovereign+</a></article>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <p className="landing-kicker">GIVE SOVEREIGN A REAL PLACE TO BEGIN</p>
        <h2 id="final-title">Your questions are already here. Build the foundation your AI will use to understand them.</h2>
        <p>Create your Baseline, then ask Sovereign about yourself, a relationship, a decision, or the people around you.</p>
        <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="/how-it-works">See how it works</a></div>
        <small>Start free · No card required · You decide what fits</small>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Know yourself. Understand the system. Choose what fits.</span>
        <nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/faq">Questions</a></nav>
      </footer>
    </main>
  );
}

function LivingSovereignAnswer() {
  return (
    <article className="living-answer" aria-label="Sovereign answer demonstration">
      <header><span>EXAMPLE ANSWER</span><strong>Sovereign · Personal</strong></header>
      <p className="fixture-label hero-fixture-scope">Sanitized demonstration · Not your Baseline</p>
      <p className="fixture-label">YOU ASKED</p>
      <p className="living-question">“{heroAnswer.question}”</p>
      <section className="living-answer-body">
        <span>DIRECT ANSWER</span>
        <h2>Your capacity is real. The question is whether the responsibility is actually yours.</h2>
        <p>{heroAnswer.direct}</p>
        <div className="living-connection"><strong>THE PERSONAL CONNECTION</strong><p>{heroAnswer.shadow} {heroAnswer.gift}</p></div>
        <aside><strong>A PRACTICAL NEXT STEP</strong>{heroAnswer.experiment}</aside>
      </section>
      <details className="living-answer-basis">
        <summary>Why this is personal · {basisFixture.length} supporting values</summary>
        <BasisSourceList values={basisFixture} />
      </details>
    </article>
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

function PublicBasisStrip({ values, onOpen, expanded = false, showSource = false }: {
  values: ReadonlyArray<typeof basisFixture[number]>;
  onOpen?: () => void;
  expanded?: boolean;
  showSource?: boolean;
}) {
  const [open, setOpen] = useState(showSource);
  const mobile = usePublicMediaQuery('(max-width: 640px)');
  const limit = mobile ? 3 : 5;
  const visible = values.slice(0, limit);
  function activate() {
    setOpen((value) => !value);
    onOpen?.();
  }
  return (
    <div className="public-basis">
      <button className="public-basis-strip" type="button" onClick={activate} aria-expanded={expanded || open}>
        <strong>BASIS</strong>
        {visible.map((value) => <span key={value.compact} aria-label={value.label}>{value.compact}</span>)}
        {values.length > visible.length && <b>+{values.length - visible.length}</b>}
      </button>
      {(expanded || open) && <BasisSourceList values={values} />}
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
      <aside className="pressure-field"><span>PRESSURE FIELD</span><strong>Responsibility reaches Maya. Final authority remains with Leon.</strong><small>The arrangement depends on Maya coordinating outcomes she does not fully control. Supported by supplied roles and current observations; each member’s private motive remains unknown.</small></aside>
      <div className="system-answer-actions"><PublicBasisStrip values={basisFixture.slice(0, 4)} /><button type="button">Explore through Christian Scripture</button></div>
      <p className="covenant-note">Optional after confirmation · Grounded answer remains separate</p>
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
