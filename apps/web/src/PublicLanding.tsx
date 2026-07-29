import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

const heroAnswer = {
  question: 'Why do I become more certain when everyone else hesitates—and then resent being the one who decides?',
  direct: 'Your Baseline may make you quick to create direction when a situation has no clear owner. That can be a real leadership capacity. Under pressure, uncertainty can start to feel like responsibility: if nobody decides, you may assume you must. The resentment often arrives later, when the consequences become yours but the authority never fully did.',
  shadow: 'You may end the uncertainty by taking over the decision, then feel abandoned by people who never agreed to carry it with you.',
  gift: 'You can turn ambiguity into structure without becoming responsible for everyone inside it.',
  alignment: 'The role fits when authority, responsibility, and consequences match. It pulls against you when you are expected to carry the outcome but cannot shape the terms.',
  experiment: 'Before deciding, ask: “Am I being asked to lead, or only to absorb the uncertainty?”'
} as const;

const basisFixture = [
  { compact: 'U✓', label: 'User-confirmed experience', time: 'Demonstration fixture', uncertainty: 'confirmed' },
  { compact: 'HD G13.1', label: 'Human Design personality gate 13, line 1', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'GK ACT13', label: 'Gene Keys activation number 13', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'N LP1', label: 'Numerology life path 1', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: '☉ CAN 04.2°', label: 'Natal Sun, Cancer, 4.2 degrees', time: 'Demonstration fixture', uncertainty: 'low' },
  { compact: 'LIVE ♄ ARI 02.3°R', label: 'Live Saturn, Aries, 2.3 degrees, retrograde', time: 'Demonstration fixture', uncertainty: 'low' }
] as const;

const answerTabs = ['Direct answer', 'Shadow', 'Gift', 'Alignment', 'Basis'] as const;
type AnswerTab = typeof answerTabs[number];

const questionAnswers = [
  {
    question: 'What is most active in me right now?',
    mode: 'NOW',
    headline: 'Direction may feel more urgent without becoming your permanent identity.',
    direct: 'Your steady capacity is creating structure when ownership is unclear. A temporary current factor may make that theme more noticeable now. It can explain why the question is louder; it cannot establish how you are behaving.',
    sections: [['STEADY', 'You can create direction without needing every variable settled.'], ['ACTIVE NOW', 'Responsibility and authority may deserve closer attention for a limited time.'], ['STILL UNKNOWN', 'Whether this urgency fits your actual experience remains yours to confirm.']]
  },
  {
    question: 'What is the shadow and gift of this quality?',
    mode: 'SHADOW & GIFT',
    headline: 'The capacity is direction. Pressure changes how you use it.',
    direct: 'Creating structure is not the problem. The distinction is whether you make direction available to the group or silently become responsible for everyone inside it.',
    sections: [['SHADOW', 'You end uncertainty by taking over, then resent the responsibility you accepted without agreement.'], ['GIFT', 'You make the choice visible, clarify who owns it, and help movement begin.'], ['ALIGNMENT', 'Your authority, responsibility, and exposure to the consequences stay in proportion.']]
  },
  {
    question: 'Does this decision fit who I am now?',
    mode: 'ALIGNMENT',
    headline: 'The choice may fit; the terms determine whether the role does.',
    direct: 'This uses your ability to create direction, but the title alone is not enough. Fit depends on whether you can shape the conditions you will be accountable for.',
    sections: [['SUPPORTS THE FIT', 'Meaningful authority and room to establish structure.'], ['PULLS AGAINST IT', 'Responsibility for outcomes you cannot influence.'], ['THE REAL TRADEOFF', 'You would accept less autonomy in exchange for stability.'], ['STILL NEEDED', 'A direct answer about decision rights.']]
  },
  {
    question: 'Why does the same moment land differently for us?',
    mode: 'RELATIONSHIP',
    headline: 'You may reach clarity through movement while they reach it through space.',
    direct: 'Your permitted Baseline may make uncertainty easier once the question is named. Their permitted Baseline may need time before language becomes reliable. Your attempt to create clarity can therefore feel like pressure, while their pause can feel like withdrawal.',
    sections: [['YOU MAY BE BRINGING', 'Directness that becomes more urgent when the relationship feels unclear.'], ['THEY MAY BE BRINGING', 'A slower route to language; their actual motive remains unknown.'], ['WHAT HAPPENS BETWEEN YOU', 'Urgency shortens their processing time, while silence increases the uncertainty driving your urgency.']]
  },
  {
    question: 'What role am I carrying in my family?',
    mode: 'SYSTEM',
    headline: 'You may be functioning as the informal stabilizer without matching authority.',
    direct: 'People may bring uncertainty to you because you organize it, while decisions remain elsewhere. That makes you responsible for continuity without the power to change the conditions creating the pressure.',
    sections: [['ROLE', 'You notice what is disconnected and create enough structure for the family to keep moving.'], ['PRESSURE', 'Responsibility concentrates with you while formal authority stays elsewhere.'], ['UNKNOWN', 'Each person must participate or confirm how they understand the arrangement.']]
  },
  {
    question: 'What changes if I stop playing it?',
    mode: 'SYSTEM',
    headline: 'The system may feel less stable before hidden responsibilities become visible.',
    direct: 'When you stop filling every gap, tension can rise because work that lived inside your role returns to the group. That reaction does not prove the change is wrong; it reveals what the arrangement depended on.',
    sections: [['SYSTEM EFFECT', 'Unmade decisions and unowned responsibilities become easier to see.'], ['YOUR RESPONSIBILITY', 'Name what you will carry and what now requires explicit agreement.'], ['EXPERIMENT', 'Choose one recurring task and return its decision to the person with authority.']]
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
          <a href="/how-it-works.html">How it works</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/faq.html">Questions</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Build my Baseline</a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-kicker">PRIVATE AI, BUILT AROUND YOUR BASELINE</p>
          <h1 id="landing-title">Know yourself.<br />Understand the system.<br /><em>Choose what fits.</em></h1>
          <p>Sovereign.OS turns your Baseline Design into a living reference for how you decide, communicate, connect, respond under pressure, and grow. Ask what is active now. Examine a choice. Invite someone to compare perspectives. Map a family or team.</p>
          <p className="landing-support">Plain-language insight first. Exact supporting data beneath it. You decide what fits.</p>
          <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="#questions">See what Sovereign can answer</a></div>
          <small>Start free · No card required · Confirm, correct, or reject any interpretation</small>
        </div>
        <LivingSovereignAnswer />
      </section>

      <section className="landing-section question-section" id="questions" aria-labelledby="questions-title">
        <SectionHeader
          kicker="START WITH THE QUESTION YOU ALREADY HAVE"
          title="Your Baseline is not one report. It is a way to keep exploring."
          id="questions-title"
        >
          Explore identity, purpose, communication, learning, love, leadership, boundaries, decision-making, pressure, change, shadow, gift, and alignment—then apply what you learn to a real choice, relationship, family, or team.
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
        <SectionHeader kicker="WHAT IS YOURS · WHAT IS ACTIVE NOW" title="See the difference between a lasting quality and a temporary emphasis." id="baseline-now-title">
          Your Baseline stays steady. Current conditions add a time-sensitive layer. Sovereign uses both to show why a quality may feel more relevant now without pretending current data determines your behavior.
        </SectionHeader>
        <div className="baseline-now-visual">
          <div className="baseline-steady"><span>STEADY BASELINE FACET</span><strong>Creates direction when ownership is unclear</strong><small>Persistent, explorable reference</small></div>
          <div className="current-layer"><span>TEMPORARY CURRENT LAYER</span><strong>Responsibility may deserve attention now</strong><small>Exact factor · six-hour window</small></div>
          <div className="confirmation-state"><span>USER CONFIRMATION</span><strong>“Yes, this is louder this week.”</strong></div>
          <div className="unknown-state"><span>STILL UNKNOWN</span><strong>How you are actually responding</strong></div>
          <PublicBasisStrip values={basisFixture.slice(0, 5)} />
        </div>
      </section>

      <section className="landing-section expression-section" aria-labelledby="expression-title">
        <SectionHeader kicker="ONE QUALITY · MORE THAN ONE EXPRESSION" title="The same strength can protect you, limit you, or become something you can use well." id="expression-title">
          Explore what a quality is trying to protect, how it may distort under pressure, what its gift makes possible, and how to recognize an aligned expression in real behavior.
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
        <SectionHeader kicker="TWO PEOPLE · TWO BASELINES · ONE INTERACTION" title="Understand each other without reducing either person to a score." id="relationship-title">
          Invite someone into a private comparison. Sovereign can show how each of you may communicate, decide, protect, connect, and respond—and what the interaction creates between you. Each person controls what is shared.
        </SectionHeader>
        <ol className="permission-journey" aria-label="Private relationship comparison">
          <li><span>1</span>Add a person</li>
          <li><span>2</span>Send a private invitation</li>
          <li><span>3</span>They select permission</li>
          <li><span>4</span>Two permitted Baselines appear</li>
          <li><span>5</span>The relationship field resolves</li>
        </ol>
        <div className="relationship-visual">
          <article><span>YOU MAY BE BRINGING</span><strong>Clarity through naming the question</strong><p>Uncertainty becomes easier when movement begins.</p></article>
          <article><span>THEY MAY BE BRINGING</span><strong>Clarity through processing time</strong><p>Language may become reliable after intensity settles.</p></article>
          <article><span>WHAT HAPPENS BETWEEN YOU</span><strong>Urgency shortens their time; silence increases your urgency.</strong><p>Each person’s response makes sense from one side and becomes harder to understand from the other.</p></article>
          <article><span>WHAT EACH PERSON CAN OWN</span><strong>Directness without an immediate conclusion. Space without indefinite suspension.</strong></article>
          <article><span>WHAT STILL NEEDS TO BE ASKED DIRECTLY</span><strong>What the pause means to them and when they are willing to return.</strong></article>
        </div>
        <p className="landing-trust-line">No compatibility score. No mind-reading. No one-sided access to another person’s Baseline.</p>
      </section>

      <section className="landing-section system-section" aria-labelledby="system-title">
        <SectionHeader kicker="SEE THE WHOLE SYSTEM" title="A family or team is more than a list of people." id="system-title">
          See how roles, pressure, authority, responsibility, care, loyalty, and dependence move across the group. Understand who stabilizes, who challenges, who carries too much, and what changes when one person stops performing a familiar role.
        </SectionHeader>
        <SystemMap />
      </section>

      <section className="landing-section exact-support-section" aria-labelledby="support-title">
        <SectionHeader kicker="SEE WHAT SHAPED THE ANSWER" title="Plain language above. Exact supporting data below." id="support-title">
          Sovereign translates the relevant parts of your Baseline and current conditions into language you can use. The Basis line keeps the exact values available without making you decode them first.
        </SectionHeader>
        <div className="exact-support-demo"><PublicBasisStrip values={basisFixture} showSource /></div>
      </section>

      <section className="landing-section pricing-preview" aria-labelledby="pricing-title">
        <SectionHeader kicker="START FREE · EXPAND WITH PERMISSION" title="Begin with yourself. Add people and systems when they matter." id="pricing-title" />
        <div className="pricing-options">
          <article><span>FREE</span><h3>Understand yourself.</h3><p>Build and explore your own Baseline.</p><strong>$0 <small>permanent · no card</small></strong><ul><li>10 Sovereign AI turns each month</li><li>Baseline, Today, Shadow, Gift, and Alignment</li><li>Fit corrections</li></ul><a href="/signup">Build my Baseline</a></article>
          <article><span>SOVEREIGN+</span><h3>Understand the people and systems around you.</h3><p>Bring permitted Baselines together and keep what remains useful.</p><strong>$20 <small>/ month</small></strong><p className="annual-price">or $99 / year</p><ul><li>300 Sovereign AI turns each month</li><li>People, Systems, Library, and Covenant</li><li>Consent-aware shared use</li></ul><a href="/pricing.html">See Sovereign+</a></article>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <p className="landing-kicker">YOUR BASELINE · YOUR JUDGMENT</p>
        <h2 id="final-title">Begin with yourself. Expand when another person or the wider system matters.</h2>
        <p>Build your Baseline, ask what is real for you now, and keep exploring without starting over.</p>
        <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="/pricing.html">See plans</a></div>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Private personal, relationship, and system intelligence</span>
        <nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/faq.html">Questions</a></nav>
      </footer>
    </main>
  );
}

function LivingSovereignAnswer() {
  const [tab, setTab] = useState<AnswerTab>('Direct answer');
  const [basisOpen, setBasisOpen] = useState(false);
  const body = tab === 'Direct answer'
    ? heroAnswer.direct
    : tab === 'Shadow'
      ? heroAnswer.shadow
      : tab === 'Gift'
        ? heroAnswer.gift
        : tab === 'Alignment'
          ? heroAnswer.alignment
          : '';
  return (
    <div className="living-answer" aria-label="Interactive Sovereign answer demonstration">
      <header><span>EXAMPLE · SOVEREIGN ANSWER</span><strong>Leadership · Responsibility</strong></header>
      <p className="living-question">“{heroAnswer.question}”</p>
      <div className="living-answer-tabs" role="tablist" aria-label="Answer sections">
        {answerTabs.map((item, index) => <button
          key={item}
          id={`hero-answer-tab-${index}`}
          role="tab"
          aria-selected={tab === item}
          aria-controls="hero-answer-panel"
          tabIndex={tab === item ? 0 : -1}
          onClick={() => { setTab(item); if (item === 'Basis') setBasisOpen(true); }}
          onKeyDown={(event) => moveTabFocus(event, index, answerTabs.length, (next) => {
            const nextTab = answerTabs[next]!;
            setTab(nextTab);
            if (nextTab === 'Basis') setBasisOpen(true);
          })}
        >{item}</button>)}
      </div>
      <section id="hero-answer-panel" className="living-answer-body" role="tabpanel" aria-labelledby={`hero-answer-tab-${answerTabs.indexOf(tab)}`} aria-live="polite">
        {tab === 'Basis'
          ? <BasisSourceList values={basisFixture} />
          : <><span>{tab.toUpperCase()}</span><p>{body}</p>{tab === 'Direct answer' && <aside><strong>TRY</strong>{heroAnswer.experiment}</aside>}</>}
      </section>
      <p className="fixture-label">Sanitized demonstration fixture</p>
      <PublicBasisStrip values={basisFixture} onOpen={() => { setTab('Basis'); setBasisOpen(true); }} expanded={basisOpen && tab === 'Basis'} />
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
    ['Maya → Leon', 'Responsibility', 'Maya coordinates care; Leon holds the formal decision. Authority and responsibility do not currently match.'],
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
      <aside className="pressure-field"><span>PRESSURE FIELD</span><strong>Care coordination concentrates with Maya while final authority remains with Leon.</strong><small>Supported by supplied roles and current observations; each member’s private motive remains unknown.</small></aside>
      <div className="system-answer-actions"><PublicBasisStrip values={basisFixture.slice(0, 4)} /><button type="button"><span aria-hidden="true">✝</span> Explore through Covenant</button></div>
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
