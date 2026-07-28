import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BaselineOrbit } from './BaselineOrbit';

const examples = [
  {
    label: 'A decision',
    prompt: 'I have two good opportunities. Which one fits how I actually work best?',
    notice: 'One option gives you more authority and room to initiate. The other offers more security inside a role that asks you to defer more often.',
    question: 'Which part of you would each option strengthen—and what would each option repeatedly ask you to override?',
    answer: 'I keep calling the safer option practical, but I would have very little authority there.',
    result: 'The real tension may be security versus the level of self-direction your Baseline consistently needs—not a good choice versus a bad one.',
    move: 'Compare the real tradeoffs without treating fear as wisdom or freedom as recklessness.'
  },
  {
    label: 'A relationship',
    prompt: 'Is this relationship helping me grow, or asking me to become less like myself?',
    notice: 'Your Baseline may need directness and shared responsibility, while this relationship repeatedly leaves you carrying uncertainty alone.',
    question: 'What becomes stronger in you here—and what becomes smaller?',
    answer: 'I am more compassionate, but I also doubt myself and avoid saying what I need.',
    result: 'Growth can be uncomfortable. It should not require permanent self-erasure. The relationship may be developing one strength while suppressing another essential part of you.',
    move: 'Separate the discomfort of honest growth from the cost of repeatedly abandoning your own boundaries.'
  },
  {
    label: 'A family system',
    prompt: 'Why does everyone depend on me, then resist me when I stop fixing everything?',
    notice: 'The family may rely on you as the stabilizer while also depending on you to preserve roles that keep everyone else from changing.',
    question: 'What does the system avoid facing when you continue carrying the pressure?',
    answer: 'Other people would have to make decisions, tolerate conflict, and take responsibility for their part.',
    result: 'The resistance may be less about one disagreement and more about what your changed role requires from the entire family.',
    move: 'Clarify what belongs to you, what belongs to others, and what the family must now learn to hold together.'
  }
] as const;

const intelligenceLevels = [
  {
    number: '01',
    label: 'PERSONAL',
    title: 'See how you naturally function.',
    prompt: 'How do I process, communicate, choose, and respond under pressure?',
    copy: 'Explore your core qualities, needs, learning style, ways of showing care, protective responses, shadow and light, and alignment.'
  },
  {
    number: '02',
    label: 'RELATIONSHIP',
    title: 'See where two people differ.',
    prompt: 'What are we each bringing into this connection?',
    copy: 'With permission from both people, compare processing, communication, needs, roles, tension, and mutual influence without choosing a winner.'
  },
  {
    number: '03',
    label: 'SYSTEM',
    title: 'See how the whole group works.',
    prompt: 'What role does each person occupy in this family or team?',
    copy: 'Map roles, pressure, authority, responsibility, missing perspectives, and what changes when one person stops carrying an assigned role.'
  }
] as const;

const baselineDimensions = [
  ['Core orientation', 'The steady qualities, needs, and ways of processing that form your personal foundation.'],
  ['Communication & connection', 'How you make sense of experience, show care, learn, collaborate, and ask for what you need.'],
  ['Pressure · shadow · light', 'How the same quality can become protective or distorted under pressure—and how it looks when more fully expressed.'],
  ['Alignment & current emphasis', 'What supports your design across decisions and relationships, plus what may be receiving more attention now.']
] as const;

export function PublicLanding() {
  const [activeExample, setActiveExample] = useState(0);
  const [perspective, setPerspective] = useState<'mine' | 'theirs' | 'between'>('between');
  const [exampleFit, setExampleFit] = useState<'yes' | 'partly' | 'no' | null>(null);
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
    <main className="sovereign-landing" data-release-fingerprint="Understand yourself—and everyone your life includes.">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home">
          <span aria-hidden="true" />
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
          <p className="landing-kicker">A PERSONAL INTELLIGENCE FOUNDATION</p>
          <h1>Begin with how you work. See what life is asking of you.</h1>
          <p className="landing-lede">
            Sovereign builds a structured Baseline Design around you—then applies it to choices, relationships, families, and teams.
          </p>
          <p className="landing-support">
            Unlike an assistant that starts with a blank prompt, Sovereign keeps your steady tendencies distinct from current pressure, what you confirm, and what remains unknown.
          </p>
          <div className="landing-actions">
            <a className="landing-button landing-button-primary" href="/signup">Build my Baseline</a>
            <a className="landing-button landing-button-secondary" href="#product-example">See a real example</a>
          </div>
          <div className="landing-trust">
            <span>Free to begin</span>
            <span>Private by default</span>
            <span>You confirm what fits</span>
          </div>
        </div>

        <BaselineOrbit />
      </section>

      <section className="foundation-difference" aria-label="What makes Sovereign different">
        <p>A normal assistant starts with <strong>a blank prompt.</strong></p>
        <span aria-hidden="true">→</span>
        <p>Sovereign starts with <strong>your personal foundation.</strong></p>
      </section>

      <section className="intelligence-section" id="product-example" aria-labelledby="intelligence-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">START WITH ONE PERSON · EXPAND WITH PURPOSE</p>
            <h2 id="intelligence-title">One foundation. Three ways to understand what is happening.</h2>
          </div>
          <p>
            Begin with your own Baseline. Bring in another person with permission. Map the larger human system when roles and pressure matter.
          </p>
        </div>
        <div className="intelligence-path" aria-label="One Baseline expands to relationship and system intelligence">
          {intelligenceLevels.map((level) => (
            <article key={level.label}>
              <div><span>{level.number}</span><strong>{level.label}</strong></div>
              <h3>{level.title}</h3>
              <blockquote>{level.prompt}</blockquote>
              <p>{level.copy}</p>
              <div className={`path-object path-object-${level.number}`} aria-hidden="true">
                <i /><i /><i /><i />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="baseline-section" aria-labelledby="baseline-title">
        <div className="baseline-copy">
          <p className="landing-kicker">BASELINE DESIGN</p>
          <h2 id="baseline-title">Your design, explained in language you can use.</h2>
          <p>
            Baseline Design is not a score or a personality label. It is the personal foundation Sovereign uses to explain how your qualities may show up at their clearest, under pressure, in relationships, and in the choices you are making now.
          </p>
          <a href="/how-it-works.html">See how Baseline Design works <span aria-hidden="true">→</span></a>
        </div>
        <div className="baseline-card">
          <header><span>THE FOUNDATION UNDER EVERY EXPLORATION</span><strong>Personal · explorable · correctable</strong></header>
          {baselineDimensions.map(([label, copy], index) => (
            <article key={label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{label}</strong><p>{copy}</p></div>
            </article>
          ))}
          <footer>Your experience remains the final authority on what fits.</footer>
        </div>
      </section>

      <section className="conversation-section" aria-labelledby="conversation-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">BRING A REAL QUESTION</p>
            <h2 id="conversation-title">Keep the right context in view while you think.</h2>
          </div>
          <p>
            Ask about a decision, relationship, behavior, family role, or part of yourself. Sovereign keeps your Baseline, selected people, and selected system distinct underneath the conversation.
          </p>
        </div>

        <div className="example-tabs" role="tablist" aria-label="Example explorations">
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
            <div><span>WHAT MAY BE INTERACTING</span><p>{example.notice}</p></div>
            <div><span>WHAT TO EXAMINE</span><strong>{example.question}</strong></div>
          </article>
          <article className="example-user-answer">
            <span>WHAT YOU RECOGNIZE</span>
            <p>“{example.answer}”</p>
          </article>
          <article className="example-integration">
            <div><span>A CLEARER VIEW</span><p>{example.result}</p></div>
            <div><span>WHAT ALIGNMENT MAY REQUIRE</span><strong>{example.move}</strong></div>
          </article>
          <details className="example-provenance" open>
            <summary>Why this appears</summary>
            <dl>
              <div><dt>Baseline tendency</dt><dd>Self-direction and direct clarity</dd></div>
              <div><dt>Current question</dt><dd>{example.label}</dd></div>
              <div><dt>Possible pressure expression</dt><dd>Carrying responsibility alone</dd></div>
              <div><dt>User-confirmed experience</dt><dd>Not yet confirmed</dd></div>
              <div><dt>Unknown actual state</dt><dd>What is happening outside this example</dd></div>
            </dl>
          </details>
          <div className="example-confirm" aria-label="Example correction controls">
            <span>Does this example fit?</span>
            {(['yes', 'partly', 'no'] as const).map((fit) => (
              <button type="button" key={fit} aria-pressed={exampleFit === fit} onClick={() => setExampleFit(fit)}>{fit === 'yes' ? 'Yes' : fit === 'partly' ? 'Partly' : 'No'}</button>
            ))}
          </div>
          <p className="example-continuity" role="status" aria-live="polite">
            {exampleFit
              ? `Example marked ${exampleFit === 'yes' ? 'as fitting' : exampleFit === 'partly' ? 'as partly fitting' : 'as not fitting'}. In your workspace, corrections are saved with the exploration and remain available to future context.`
              : 'Example only. In your workspace, you can confirm or correct an insight and keep that understanding with the exploration.'}
          </p>
          <footer>Examples show possibilities, not verdicts. Your experience remains yours to confirm, correct, or reject.</footer>
        </div>
      </section>

      <section className="permission-section relationship-section" aria-labelledby="permission-title">
        <div>
          <p className="landing-kicker">TWO PEOPLE · TWO BASELINES · ONE RELATIONSHIP</p>
          <h2 id="permission-title">Different processing is not the same as different care.</h2>
          <p>
            Sovereign keeps each person’s way of processing visible, then explains what the difference may create between them—without deciding who is right.
          </p>
        </div>
        <div className="relationship-visual" aria-label="See the relationship from both sides.">
          <div className="perspective-switch" role="group" aria-label="Relationship perspective">
            <button type="button" className={perspective === 'mine' ? 'active' : ''} onClick={() => setPerspective('mine')}>My view</button>
            <button type="button" className={perspective === 'theirs' ? 'active' : ''} onClick={() => setPerspective('theirs')}>Their possible view</button>
            <button type="button" className={perspective === 'between' ? 'active' : ''} onClick={() => setPerspective('between')}>Relationship view</button>
          </div>
          <article className={`relationship-person ${perspective === 'mine' ? 'is-focused' : ''}`}>
            <header><span>YOU</span><small>BASELINE SHARED</small></header>
            <strong>Processes through conversation</strong>
            <p>Clarity develops by speaking, asking, and receiving a response.</p>
            <dl><div><dt>May reach for</dt><dd>Connection now</dd></div><div><dt>May hear silence as</dt><dd>Distance or avoidance</dd></div></dl>
          </article>
          <div className={`relationship-between ${perspective === 'between' ? 'is-focused' : ''}`}>
            <span>BETWEEN YOU</span>
            <strong>Same need: understanding. Different route: immediacy and time.</strong>
            <p>Friction begins when one person experiences waiting as abandonment while the other experiences urgency as pressure.</p>
          </div>
          <article className={`relationship-person ${perspective === 'theirs' ? 'is-focused' : ''}`}>
            <header><span>ALEX</span><small>BASELINE SHARED</small></header>
            <strong>Processes through reflection</strong>
            <p>Clarity develops through privacy, internal organization, and time.</p>
            <dl><div><dt>May reach for</dt><dd>Space before response</dd></div><div><dt>May hear urgency as</dt><dd>Pressure or loss of choice</dd></div></dl>
          </article>
          <footer>
            <div><span>WHAT SOVEREIGN KEEPS DISTINCT</span><strong>Each person’s needs, limits, responsibility, and permission.</strong></div>
            <div><span>WHAT THE RELATIONSHIP CAN PRACTICE</span><strong>A clear return time instead of forced immediacy or indefinite silence.</strong></div>
          </footer>
        </div>
      </section>

      <section className="system-section" aria-labelledby="system-title">
        <div>
          <p className="landing-kicker">FROM ONE PERSON TO THE WHOLE SYSTEM</p>
          <h2 id="system-title">See where pressure collects—not just who reacts.</h2>
          <p>A system view keeps individual Baselines distinct while showing formal roles, informal responsibility, and a perspective the group may be missing. It suggests patterns to examine; it does not diagnose the group.</p>
        </div>
        <div className="system-map" aria-label="Example team system map">
          <header><span>EXAMPLE · TEAM VIEW</span><strong>Launch decision</strong></header>
          <div className="system-stage">
            <article className="system-person system-lead"><i>MK</i><strong>Mika</strong><span>Formal lead</span></article>
            <article className="system-person system-stabilizer"><i>JA</i><strong>Jae</strong><span>Informal stabilizer</span></article>
            <article className="system-person system-challenger"><i>NO</i><strong>Noor</strong><span>Missing perspective</span></article>
            <article className="system-person system-builder"><i>EL</i><strong>Eli</strong><span>Delivery owner</span></article>
            <div className="pressure-field"><span>PRESSURE CONCENTRATION</span><strong>Jae is carrying coordination without matching authority.</strong></div>
          </div>
          <footer><span>SHIFT TO EXAMINE</span><strong>Move decision ownership back to the formal lead and invite Noor’s risk perspective before commitment.</strong></footer>
        </div>
      </section>

      <section className="control-section" aria-label="Privacy, permission, and optional faith controls">
        <article><span>01</span><h3>Your private inputs stay protected.</h3><p>Raw birth details and exact private location do not enter the language model.</p></article>
        <article><span>02</span><h3>Permission comes from each person.</h3><p>Adding a name is not consent. Shared comparisons use only what each connected person chooses to allow.</p></article>
        <article><span>03</span><h3>Faith is an optional lens—not the default.</h3><p>Turn on Covenant only when you choose to explore through Christian teaching and clearly cited biblical scripture.</p></article>
      </section>

      <section className="landing-final-callout">
        <div>
          <p className="landing-kicker">BUILD YOUR FOUNDATION · USE IT WHERE LIFE GETS COMPLICATED</p>
          <h2>Start with who you are. Expand only when the wider context matters.</h2>
          <p>Begin free in a few minutes. Add your birth date and place; exact time helps but is not required. Review what fits, correct what does not, and expand only when it matters.</p>
        </div>
        <div className="landing-actions">
          <a className="landing-button landing-button-primary" href="/signup">Build my Baseline</a>
          <a className="landing-button landing-button-secondary" href="/pricing.html">Compare plans</a>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Private personal, relationship, and system intelligence</span>
        <nav aria-label="Footer navigation">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/faq.html">Questions</a>
        </nav>
      </footer>
    </main>
  );
}
