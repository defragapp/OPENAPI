import { useState } from 'react';
import type { KeyboardEvent } from 'react';

const examples = [
  {
    label: 'A decision',
    prompt: 'I have two good job offers. Why does choosing one feel impossible?',
    notice: 'The deadline may be asking you to feel certain before the information is complete.',
    question: 'Which missing fact would actually change your choice?',
    answer: 'I need to know how much authority I would have in the new role.',
    result: 'The decision may be less about choosing the perfect company and more about whether the role gives you enough autonomy.',
    move: 'Ask both hiring managers the same direct question about decision authority, then compare the answers.'
  },
  {
    label: 'A relationship',
    prompt: 'We both think we are being clear. Why do we keep missing each other?',
    notice: 'You may be trying to reach clarity through conversation while the other person needs time before responding.',
    question: 'What would let the conversation pause without feeling abandoned?',
    answer: 'Knowing when we will return to it would help.',
    result: 'The conflict may be less about whether either person cares and more about two different ways of reaching clarity.',
    move: 'Agree on a return time before taking space, so silence does not have to carry the whole meaning.'
  },
  {
    label: 'A system',
    prompt: 'Everyone calls me when something goes wrong, but no one follows my decisions.',
    notice: 'Responsibility may be landing with you while decision authority remains somewhere else.',
    question: 'Which decisions are you expected to carry without the authority to make?',
    answer: 'I handle every crisis, but my manager makes the final call.',
    result: 'The strain may be coming from a role mismatch—not from a personal failure to lead.',
    move: 'Name the decisions you own, the decisions your manager owns, and what happens when an urgent call cannot wait.'
  }
] as const;

const intelligenceLevels = [
  {
    number: '01',
    label: 'PERSONAL',
    title: 'Understand your own response.',
    prompt: 'Why does this decision feel harder for me than it looks?',
    copy: 'Sovereign separates your steady tendencies from temporary pressure and the facts of the situation.'
  },
  {
    number: '02',
    label: 'RELATIONAL',
    title: 'See two perspectives at once.',
    prompt: 'Why do we both think we are being clear?',
    copy: 'With permission from both people, Sovereign compares how each person may process the same interaction.'
  },
  {
    number: '03',
    label: 'SYSTEM',
    title: 'See the structure around the conflict.',
    prompt: 'Why does responsibility keep falling to one person?',
    copy: 'Family, household, friendship, and team views add roles, authority, dependence, and shared goals.'
  }
] as const;

const baselineDimensions = [
  ['Decision style', 'What you may need before a choice feels settled.'],
  ['Communication', 'How you tend to find and express clarity.'],
  ['Connection', 'What supports trust, closeness, and repair.'],
  ['Pressure response', 'What may become louder when the stakes rise.']
] as const;

export function PublicLanding() {
  const [activeExample, setActiveExample] = useState(0);
  const example = examples[activeExample]!;

  function moveExample(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? examples.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + examples.length) % examples.length;
    setActiveExample(next);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }

  return (
    <main className="sovereign-landing">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home">
          <span aria-hidden="true">S</span>
          <strong>SOVEREIGN.OS</strong>
        </a>
        <nav aria-label="Public navigation">
          <a href="/how-it-works.html">How it works</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/faq.html">Questions</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Build my Baseline</a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">PERSONAL · RELATIONAL · SYSTEM INTELLIGENCE</p>
          <h1>Understand your life in context.</h1>
          <p className="landing-lede">
            Sovereign.OS is a private intelligence platform for understanding yourself, your relationships,
            and the groups you live and work inside.
          </p>
          <p className="landing-support">
            It begins with Baseline Design—a starting map of how you tend to decide, communicate, connect,
            and respond under pressure—then adds the moment, people, and facts you choose.
          </p>
          <div className="landing-actions">
            <a className="landing-button landing-button-primary" href="/signup">Build my Baseline</a>
            <a className="landing-button landing-button-secondary" href="#product-example">See how it helps</a>
          </div>
          <div className="landing-trust">
            <span>Start free</span>
            <span>Useful before you explain a problem</span>
            <span>You decide what carries forward</span>
          </div>
        </div>

        <div className="context-console" aria-label="Example of Sovereign.OS using Baseline and current context">
          <header>
            <div><span className="console-mark">S</span><strong>TODAY</strong></div>
            <span>EXAMPLE · NOT YOUR READING</span>
          </header>
          <div className="context-map" aria-hidden="true">
            <div className="context-ring context-ring-outer" />
            <div className="context-ring context-ring-inner" />
            <div className="context-node context-node-baseline"><span>BASELINE</span><strong>Decision style</strong></div>
            <div className="context-node context-node-current"><span>CURRENT</span><strong>Deadline pressure</strong></div>
            <div className="context-node context-node-known"><span>KNOWN</span><strong>Offer expires Friday</strong></div>
            <div className="context-core"><span>YOU</span><strong>Context stays distinct</strong></div>
          </div>
          <article className="console-question">
            <span>YOU ASK</span>
            <p>Why can’t I choose when both options are good?</p>
          </article>
          <article className="console-answer">
            <span>SOVEREIGN NOTICES</span>
            <p>The deadline may be forcing certainty before the information is complete.</p>
            <strong>Which missing fact would actually change your choice?</strong>
          </article>
          <footer>
            <span>Baseline</span><i>+</i><span>current pressure</span><i>+</i><span>confirmed facts</span>
          </footer>
        </div>
      </section>

      <section className="intelligence-section" id="product-example" aria-labelledby="intelligence-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">ONE PLATFORM · THREE LEVELS</p>
            <h2 id="intelligence-title">See the person, the interaction, and the system.</h2>
          </div>
          <p>
            Most advice sees only the sentence you typed. Sovereign can keep your individual context,
            another person’s permitted context, and the structure around both of you visible at the same time.
          </p>
        </div>
        <div className="intelligence-grid">
          {intelligenceLevels.map((level) => (
            <article key={level.label}>
              <div><span>{level.number}</span><strong>{level.label}</strong></div>
              <h3>{level.title}</h3>
              <blockquote>{level.prompt}</blockquote>
              <p>{level.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="baseline-section" aria-labelledby="baseline-title">
        <div className="baseline-copy">
          <p className="landing-kicker">BASELINE DESIGN</p>
          <h2 id="baseline-title">A starting map—not a verdict about who you are.</h2>
          <p>
            You enter your birth date, birthplace, and birth time if known. Sovereign.OS uses astronomical
            positions and selected symbolic frameworks to build an interpretive Baseline, then translates it
            into ordinary language.
          </p>
          <p>
            The frameworks stay in the supporting layer. The product shows what may be useful for reflection,
            keeps the present moment separate, and asks you to confirm what actually fits.
          </p>
          <a href="/how-it-works.html">See the complete process <span aria-hidden="true">→</span></a>
        </div>
        <div className="baseline-card">
          <header><span>EXAMPLE BASELINE</span><strong>Ready before the first question</strong></header>
          {baselineDimensions.map(([label, copy], index) => (
            <article key={label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{label}</strong><p>{copy}</p></div>
            </article>
          ))}
          <footer>Interpretive · correctable · private by default</footer>
        </div>
      </section>

      <section className="conversation-section" aria-labelledby="conversation-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">WHAT USING IT FEELS LIKE</p>
            <h2 id="conversation-title">Bring a real question. Leave with a clearer next move.</h2>
          </div>
          <p>
            Sovereign does not begin with a lecture or a verdict. It notices one useful distinction,
            asks one inward question, and develops the answer after you respond.
          </p>
        </div>

        <div className="example-tabs" role="tablist" aria-label="Example conversations">
          {examples.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              id={`example-tab-${index}`}
              aria-controls="example-panel"
              aria-selected={activeExample === index}
              className={activeExample === index ? 'active' : ''}
              onClick={() => setActiveExample(index)}
              onKeyDown={(event) => moveExample(event, index)}
              tabIndex={activeExample === index ? 0 : -1}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className="example-thread"
          id="example-panel"
          role="tabpanel"
          aria-labelledby={`example-tab-${activeExample}`}
          aria-live="polite"
        >
          <div className="example-thread-rail">
            <span>01</span><i /><span>02</span><i /><span>03</span>
          </div>
          <article className="example-user">
            <span>YOUR QUESTION</span>
            <p>“{example.prompt}”</p>
          </article>
          <article className="example-sovereign">
            <div><span>WHAT I NOTICE</span><p>{example.notice}</p></div>
            <div><span>LOOK INWARD</span><strong>{example.question}</strong></div>
          </article>
          <article className="example-user-answer">
            <span>YOU ANSWER</span>
            <p>“{example.answer}”</p>
          </article>
          <article className="example-integration">
            <div><span>WHAT THIS MAY BE SHOWING</span><p>{example.result}</p></div>
            <div><span>ONE NEXT MOVE</span><strong>{example.move}</strong></div>
          </article>
          <footer>Example only. Your answer uses your permitted context and the facts you provide.</footer>
        </div>
      </section>

      <section className="permission-section" aria-labelledby="permission-title">
        <div>
          <p className="landing-kicker">PEOPLE AND SYSTEMS</p>
          <h2 id="permission-title">More context never means less agency.</h2>
          <p>
            Add a person privately, invite them when you want to compare perspectives, and let them choose what
            their Baseline may contribute. Families and teams keep every person, role, and unknown distinct.
          </p>
        </div>
        <div className="permission-visual" aria-label="Example permission-based relationship comparison">
          <article><span>YOU</span><strong>Clarity through conversation</strong><small>Baseline shared</small></article>
          <div><i /><strong>PERMISSION ACTIVE</strong><i /></div>
          <article><span>ALEX</span><strong>Clarity through reflection</strong><small>Baseline shared</small></article>
          <p><strong>POSSIBLE FRICTION</strong> One person asks sooner while the other answers later.</p>
          <p><strong>STILL UNKNOWN</strong> Why either person is quiet and what either person will choose.</p>
        </div>
      </section>

      <section className="control-section" aria-label="Privacy and control">
        <article><span>01</span><h3>Your inputs stay behind the calculation boundary.</h3><p>Raw birth details and exact private location do not enter the language model.</p></article>
        <article><span>02</span><h3>Another person controls their own context.</h3><p>Adding a name is not permission. Shared analysis starts only after they choose.</p></article>
        <article><span>03</span><h3>Nothing becomes memory by accident.</h3><p>Correct the moment freely. Save an understanding only when you want it to carry forward.</p></article>
      </section>

      <section className="landing-final-callout">
        <div>
          <p className="landing-kicker">START WITH YOU</p>
          <h2>Live a life you’d choose to watch again.</h2>
          <p>Build your Baseline, open Today, and bring the next decision, relationship, or pressure point.</p>
        </div>
        <div className="landing-actions">
          <a className="landing-button landing-button-primary" href="/signup">Build my Baseline</a>
          <a className="landing-button landing-button-secondary" href="/pricing.html">Compare plans</a>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Personal, relational, and system intelligence</span>
        <nav aria-label="Footer navigation">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/faq.html">Questions</a>
        </nav>
      </footer>
    </main>
  );
}
