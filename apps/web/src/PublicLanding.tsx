import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

const heroAnswer = {
  question: 'Why do I keep taking responsibility for everyone else?',
  direct: 'You are good at creating order. That does not make every problem yours to carry.',
  connection: 'You may step in quickly when nobody knows who owns the decision. That can help a group move forward. It becomes costly when you are held responsible for an outcome you do not have the authority to shape.',
  experiment: 'Before taking it on, ask: “Do I have the authority to make this decision, or am I only being asked to carry the pressure?”'
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
    mode: 'ABOUT YOU',
    headline: 'A real strength may turn into taking over when pressure rises.',
    direct: 'You may be naturally good at creating direction. Under pressure, that same strength can become an attempt to remove uncertainty for everyone—even when the responsibility is not yours.',
    sections: [['WHAT STAYS TRUE', 'You can create direction without having every detail settled.'], ['UNDER PRESSURE', 'You may take responsibility before anyone has agreed that you have the authority.'], ['AT YOUR BEST', 'You can name the decision, the owner, and the next step without carrying every person’s part.'], ['WHAT MAY WORK BETTER', 'The role works when authority, responsibility, and consequences belong to the same person.']]
  },
  {
    question: 'Does this decision actually work for me?',
    mode: 'A DECISION',
    headline: 'The opportunity may suit you, but the terms still matter.',
    direct: 'This choice may use your ability to create direction. The title alone does not make it right for you. You also need enough authority to shape the outcomes you will be responsible for.',
    sections: [['WHAT SUPPORTS THE CHOICE', 'You would have real decision-making authority and room to create structure.'], ['WHAT MAKES IT DIFFICULT', 'You would be responsible for results you cannot influence.'], ['THE TRADEOFF', 'You would give up some autonomy in exchange for stability.'], ['WHAT YOU STILL NEED TO KNOW', 'A direct answer about who has final decision rights.']]
  },
  {
    question: 'Why do we keep misunderstanding each other?',
    mode: 'A RELATIONSHIP',
    headline: 'You may need to talk sooner. They may need more time before they can respond clearly.',
    direct: 'You may feel better once the question is named. They may need time before their words feel reliable. Your push for clarity can feel like pressure to them, while their silence can make you feel even more uncertain.',
    sections: [['WHAT YOU MAY BE BRINGING', 'Directness that becomes more urgent when the relationship feels unclear.'], ['WHAT THEY MAY BE BRINGING', 'A slower route to words. Their actual reason still has to come from them.'], ['HOW YOU AFFECT EACH OTHER', 'Your urgency reduces their processing time. Their silence increases the uncertainty behind your urgency.'], ['WHAT STILL NEEDS TO BE DISCUSSED', 'What the pause means to them and when they are willing to return to the conversation.']]
  },
  {
    question: 'Why does this responsibility keep ending up with me?',
    mode: 'A FAMILY OR TEAM',
    headline: 'You may be carrying the responsibility while someone else still holds the authority.',
    direct: 'People may bring uncertainty to you because you know how to organize it. But if final decisions remain elsewhere, you can become responsible for keeping things together without the power to change the conditions causing the pressure.',
    sections: [['YOUR ROLE', 'You notice what is disconnected and create enough structure for the group to keep moving.'], ['WHERE PRESSURE BUILDS', 'Responsibility keeps reaching you while formal authority stays somewhere else.'], ['WHAT CHANGES', 'When you stop stabilizing automatically, the group has to show who will decide and who will participate.'], ['WHAT STILL NEEDS CONFIRMATION', 'Each person still needs to explain how they understand the arrangement.']]
  }
] as const;

const scaleStories = [
  {
    label: 'Yourself',
    title: 'Understand what stays consistent and what changes under pressure.',
    body: 'Explore how you decide, communicate, connect, lead, and respond without reducing yourself to a label.',
    prompt: 'Why do I keep taking responsibility for everyone else?'
  },
  {
    label: 'Relationship',
    title: 'Understand what each person brings and how you affect each other.',
    body: 'Compare personal context only after both people agree. Keep your experience, their experience, and the interaction distinct.',
    prompt: 'Why do we keep misunderstanding each other?'
  },
  {
    label: 'Family or team',
    title: 'See where decisions, responsibility, and pressure become unclear.',
    body: 'Examine roles, authority, responsibility, reliance, and missing perspectives across a family, household, or team.',
    prompt: 'Why does this responsibility keep ending up with me?'
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
          <a className="landing-nav-cta" href="/signup">Create my personal foundation</a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-kicker">PRIVATE PERSONAL AND RELATIONAL INTELLIGENCE</p>
          <h1 id="landing-title">Understand yourself.<br /><em>Make clearer decisions. Navigate relationships with context.</em></h1>
          <p>Sovereign.OS keeps a private personal foundation behind every question, so the answer can reflect how you decide, communicate, respond under pressure, and relate to other people.</p>
          <div className="landing-actions"><a className="landing-primary" href="/signup">Create my personal foundation</a><a className="landing-secondary" href="#answer">See how Sovereign answers</a></div>
          <small>Start free · No card required · You control what is used and saved</small>
        </div>
        <HeroIntelligenceStage />
      </section>

      <section className="landing-foundation" aria-labelledby="foundation-title">
        <header>
          <p className="landing-kicker">YOUR PERSONAL FOUNDATION</p>
          <h2 id="foundation-title">Your context should carry forward.</h2>
          <p>Most AI only knows the current conversation. Sovereign keeps the personal context you choose to create, so future answers can reflect how you decide, communicate, relate, and respond under pressure.</p>
        </header>
        <BaselineContextStage />
      </section>

      <section className="landing-section scale-section" aria-labelledby="scale-title">
        <SectionHeader kicker="PERSONAL CLARITY · RELATIONSHIPS · GROUPS" title="Use the same private context across the questions that matter." id="scale-title">
          Start with yourself. Include another person, family, or team only when the question requires it and the right permission exists.
        </SectionHeader>
        <div className="scale-experience">
          <nav aria-label="Ways Sovereign can help" role="tablist">
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
        <SectionHeader kicker="SEE HOW SOVEREIGN ANSWERS" title="Start with the answer. Open the reasoning when you need it." id="questions-title">
          Choose a question to see how Sovereign handles personal, decision, relationship, and group context while keeping interpretation and uncertainty visible.
        </SectionHeader>
        <div className="landing-question-rail" role="tablist" aria-label="Questions Sovereign can help with">
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
        <SectionHeader kicker="PRIVATE BY DESIGN" title="Relationships work only when both people choose what they share." id="permission-title">
          Each person connects their own account and approves the information used for a relationship or group question. Those choices can be changed later.
        </SectionHeader>
        <PermissionField />
      </section>

      <section className="landing-section pricing-preview" aria-labelledby="pricing-title">
        <SectionHeader kicker="START FREE · ADD SHARED CONTEXT WITH SOVEREIGN+" title="Use Free for personal clarity. Add relationships and groups when you need them." id="pricing-title" />
        <div className="pricing-options">
          <article><span>FREE</span><h3>Personal clarity and decision support.</h3><p>Create your personal foundation and explore what is steady, what may matter more now, and what deserves attention before you decide.</p><strong>$0 <small>permanent · no card</small></strong><ul><li>10 Sovereign AI turns each month</li><li>Personal foundation, current context, pressure, strengths, and decision clarity</li><li>Review and correct what does not fit</li></ul><a href="/signup">Create my personal foundation</a></article>
          <article><span>SOVEREIGN+</span><h3>Relationship and group intelligence with permission.</h3><p>Compare approved personal context, understand family or team roles, save useful insights, and add a Christian Scripture perspective when you choose.</p><strong>$20 <small>/ month</small></strong><p className="annual-price">or $99 / year</p><ul><li>300 Sovereign AI turns each month</li><li>Relationships, groups, saved insights, and Christian Scripture perspective</li><li>Consent-aware invitations and sharing controls</li></ul><a href="/pricing">Compare plans</a></article>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <p className="landing-kicker">PERSONAL CONTEXT THAT DOES NOT RESET</p>
        <h2 id="final-title">Create the foundation your future questions can use.</h2>
        <p>Start with private personal context. Add relationship, group, or temporary context only when it helps answer the question in front of you.</p>
        <div className="landing-actions"><a className="landing-primary" href="/signup">Create my personal foundation</a><a className="landing-secondary" href="/how-it-works">See how it works</a></div>
        <small>Interpretation stays visible · Permission stays specific · Your judgment stays central</small>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Private personal and relational intelligence</span>
        <nav aria-label="Footer navigation"><a href="/how-it-works">How it works</a><a href="/pricing">Pricing</a><a href="/faq">Questions</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      </footer>
    </main>
  );
}

function HeroIntelligenceStage() {
  return (
    <article className="hero-intelligence-stage" aria-label="Sovereign answer demonstration">
      <div className="hero-baseline-core" aria-label="Conceptual personal foundation and temporary context">
        <span className="baseline-orbit orbit-one" aria-hidden="true" />
        <span className="baseline-orbit orbit-two" aria-hidden="true" />
        <span className="baseline-orbit orbit-three" aria-hidden="true" />
        <div><small>YOUR PERSONAL FOUNDATION</small><strong>Creates direction</strong><em>when nobody owns the decision</em></div>
        <p className="baseline-signal signal-one"><b>Communication</b> changes under pressure</p>
        <p className="baseline-signal signal-two"><b>Responsibility</b> may feel more urgent</p>
        <p className="baseline-signal signal-three"><b>Relationship</b> needs a clearer agreement</p>
      </div>
      <section className="hero-answer">
        <header><span>EXAMPLE ANSWER</span><strong>Sovereign · Personal</strong></header>
        <p className="fixture-label hero-fixture-scope">Sanitized demonstration · Not your personal foundation</p>
        <p className="fixture-label">YOUR QUESTION</p>
        <p className="living-question">“{heroAnswer.question}”</p>
        <div className="living-answer-body">
          <span>THE ANSWER</span>
          <h2>{heroAnswer.direct}</h2>
          <div className="living-connection"><strong>WHY THIS MATTERS</strong><p>{heroAnswer.connection}</p></div>
          <aside><strong>THINGS TO CONSIDER</strong>{heroAnswer.experiment}</aside>
        </div>
        <details className="living-answer-basis">
          <summary>See what this is based on · {basisFixture.length} details</summary>
          <BasisSourceList values={basisFixture} />
        </details>
      </section>
    </article>
  );
}

function BaselineContextStage() {
  return (
    <div className="baseline-context-stage">
      <div className="baseline-context-core"><span>YOUR PERSONAL FOUNDATION</span><strong>You often create direction when ownership is unclear.</strong><small>Available across future questions · open to correction</small></div>
      <div className="baseline-context-line current"><span>TEMPORARY CONTEXT</span><strong>Responsibility may deserve more attention for a limited time.</strong><small>This does not determine what you will do.</small></div>
      <div className="baseline-context-line confirmed"><span>WHAT YOU CONFIRMED</span><strong>“Yes, this has felt stronger this week.”</strong></div>
      <div className="baseline-context-line unknown"><span>WHAT STILL REQUIRES YOUR JUDGMENT</span><strong>How you are actually responding today.</strong></div>
      <PublicBasisStrip values={basisFixture.slice(0, 5)} />
    </div>
  );
}

function PublicAnswerStage({ answer, tabId }: { answer: typeof questionAnswers[number]; tabId: string }) {
  return (
    <article id="question-answer-stage" className="public-answer-stage" role="tabpanel" aria-labelledby={tabId} aria-live="polite">
      <header><span>{answer.mode}</span><small>REPRESENTATIVE EXAMPLE</small><h3>{answer.headline}</h3></header>
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
      <nav aria-label="Permission demonstration"><button aria-pressed={active === 'relationship'} onClick={() => setActive('relationship')}>Relationship</button><button aria-pressed={active === 'system'} onClick={() => setActive('system')}>Family or team</button></nav>
      {active === 'relationship' ? (
        <div className="relationship-field-public">
          <article><span>WHAT YOU MAY BE BRINGING</span><strong>You want to name the question quickly.</strong><p>Talking sooner may help you feel less uncertain.</p></article>
          <div className="between-field"><span>HOW YOU AFFECT EACH OTHER</span><strong>Your urgency gives them less time. Their silence makes you more urgent.</strong><p>Sovereign can explain the interaction while keeping each person’s private experience distinct.</p></div>
          <article><span>WHAT THEY MAY BE BRINGING</span><strong>They may need more time before they can answer clearly.</strong><p>Their actual reason remains theirs to explain.</p></article>
        </div>
      ) : <SystemMap />}
      <p className="landing-trust-line">Each person controls their own information. Shared insight uses only the context both people approved.</p>
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
        <strong>WHAT THIS IS BASED ON</strong>
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
    <dl className="public-basis-source" aria-label="Supporting source details">
      {values.map((value) => <div key={value.compact}><dt>{value.compact}</dt><dd><span>{value.label}</span><small>{value.time} · {value.uncertainty} uncertainty</small></dd></div>)}
    </dl>
  );
}

function SystemMap() {
  const [active, setActive] = useState(0);
  const connections = [
    ['Maya → Leon', 'Responsibility', 'Maya coordinates the work, but Leon makes the final decision. Responsibility and authority do not currently match.'],
    ['Leon → Eli', 'Authority', 'Leon provides the final decision. Eli has confirmed that reporting line.'],
    ['Rae → Maya', 'Reliance', 'Rae has confirmed that practical problems are usually brought to Maya.'],
    ['Eli → Group', 'Change pressure', 'Eli is challenging a familiar expectation. The role is known; the reason is not.']
  ] as const;
  const activeConnection = connections[active]!;
  return (
    <div className="public-system-map">
      <div className="system-members" aria-label="Approved group participants">
        <button className="stabilizer" aria-pressed={active === 0} onClick={() => setActive(0)}><strong>Maya</strong><small>Keeps things moving · approved</small></button>
        <button aria-pressed={active === 1} onClick={() => setActive(1)}><strong>Leon</strong><small>Final decision-maker · confirmed</small></button>
        <button aria-pressed={active === 2} onClick={() => setActive(2)}><strong>Rae</strong><small>Relies on support · approved</small></button>
        <button aria-pressed={active === 3} onClick={() => setActive(3)}><strong>Eli</strong><small>Challenges the usual pattern · supplied</small></button>
      </div>
      <div className="system-connections" role="tablist" aria-label="Confirmed group relationships">
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
      <aside className="pressure-field"><span>WHERE PRESSURE BUILDS</span><strong>Responsibility reaches Maya. Final authority remains with Leon.</strong><small>This is based on confirmed roles and observations. Each person’s private reason remains their own.</small></aside>
      <div className="system-answer-actions"><PublicBasisStrip values={basisFixture.slice(0, 4)} /><button type="button">Add a Christian Scripture perspective</button></div>
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
