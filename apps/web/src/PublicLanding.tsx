import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BaselineOrbit } from './BaselineOrbit';

const examples = [
  {
    label: 'A decision',
    prompt: 'I have two good opportunities. Which one is more aligned with who I am?',
    notice: 'One option may reward your natural independence while the other offers security through a role that asks you to defer more often.',
    question: 'Which part of yourself would each option strengthen—and which part would it ask you to silence?',
    answer: 'I keep calling the safer option practical, but I would have very little authority there.',
    result: 'The tension may not be between a good choice and a bad one. It may be between security and the level of self-direction your Baseline consistently needs.',
    move: 'Compare the real tradeoffs without treating fear as wisdom or freedom as recklessness.'
  },
  {
    label: 'A relationship',
    prompt: 'Is this relationship asking me to grow, or asking me to become less like myself?',
    notice: 'Your Baseline may need directness and mutual responsibility, while this relationship repeatedly asks you to carry uncertainty alone.',
    question: 'What becomes stronger in you here—and what becomes smaller?',
    answer: 'I am more compassionate, but I also doubt myself and avoid saying what I need.',
    result: 'Growth can be uncomfortable, but alignment should not require permanent self-erasure. The relationship may be developing one strength while suppressing another essential part of you.',
    move: 'Separate the discomfort of honest growth from the cost of repeatedly abandoning your own boundaries.'
  },
  {
    label: 'A family system',
    prompt: 'Why does everyone depend on me, then resist me when I stop fixing everything?',
    notice: 'Your family may rely on you as the stabilizer while also depending on you to preserve roles that keep everyone else from changing.',
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
    title: 'Understand the whole person.',
    prompt: 'What are the light and shadow expressions of this part of me?',
    copy: 'Explore your qualities, strengths, protective responses, choices, relationships, and growth.'
  },
  {
    number: '02',
    label: 'RELATIONAL',
    title: 'See the relationship from both sides.',
    prompt: 'What are we each bringing into this connection?',
    copy: 'With permission from both people, compare needs, roles, communication, tension, and mutual influence.'
  },
  {
    number: '03',
    label: 'SYSTEM',
    title: 'Understand how the whole group functions.',
    prompt: 'What role does each person occupy in this family?',
    copy: 'Map roles, pressure, authority, and responsibility across a family, household, team, or community.'
  }
] as const;

const baselineDimensions = [
  ['Core qualities', 'The archetypal strengths, needs, and orientations that shape how you move through life.'],
  ['Shadow & light', 'How the same quality can protect, limit, distort, mature, or become a strength.'],
  ['Alignment', 'What supports your deeper design across decisions, behaviors, relationships, and direction.'],
  ['Current emphasis', 'Which roles, qualities, or inner tensions may be becoming more relevant now.']
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
          <a className="landing-nav-cta" href="/signup">Explore my Baseline</a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">PERSONAL · RELATIONAL · SYSTEM INTELLIGENCE</p>
          <h1>Understand yourself—and everyone your life includes.</h1>
          <p className="landing-lede">
            Sovereign.OS turns your Baseline Design into a private AI for personal, relationship, and system intelligence.
          </p>
          <p className="landing-support">
            Baseline Design is your personal starting point: an explorable view of your qualities, needs, strengths, shadow and light, and alignment.
          </p>
          <div className="landing-actions">
            <a className="landing-button landing-button-primary" href="/signup">Explore my Baseline</a>
            <a className="landing-button landing-button-secondary" href="#product-example">Discover the platform</a>
          </div>
          <div className="landing-trust">
            <span>Start free</span>
            <span>Useful across your whole life</span>
            <span>You control what is shared</span>
          </div>
        </div>

        <BaselineOrbit />
      </section>

      <section className="intelligence-section" id="product-example" aria-labelledby="intelligence-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">ONE PLATFORM · THREE LEVELS</p>
            <h2 id="intelligence-title">One platform. Three levels of understanding.</h2>
          </div>
          <p>
            Understand yourself. See the other side. Map the whole system—without reducing anyone to a label.
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
          <h2 id="baseline-title">Your starting point for every question.</h2>
          <p>
            Baseline Design turns your natal framework into a clear view of your qualities, roles, strengths, tensions, choices, and relationships. Explore each part through shadow and light, alignment, and the life you are actually living.
          </p>
          <a href="/how-it-works.html">See everything you can explore <span aria-hidden="true">→</span></a>
        </div>
        <div className="baseline-card">
          <header><span>YOUR BASELINE DESIGN</span><strong>A connected understanding of you</strong></header>
          {baselineDimensions.map(([label, copy], index) => (
            <article key={label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{label}</strong><p>{copy}</p></div>
            </article>
          ))}
          <footer>Personal · explorable · correctable · private by default</footer>
        </div>
      </section>

      <section className="conversation-section" aria-labelledby="conversation-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">APPLY IT ANYWHERE</p>
            <h2 id="conversation-title">Ask naturally. Sovereign brings the right context.</h2>
          </div>
          <p>
            Ask about a decision, relationship, behavior, family role, or part of yourself. Your Baseline stays underneath the conversation.
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
            <span>YOU EXPLORE</span>
            <p>“{example.prompt}”</p>
          </article>
          <article className="example-sovereign">
            <div><span>WHAT MAY BE INTERACTING</span><p>{example.notice}</p></div>
            <div><span>LOOK DEEPER</span><strong>{example.question}</strong></div>
          </article>
          <article className="example-user-answer">
            <span>YOU RECOGNIZE</span>
            <p>“{example.answer}”</p>
          </article>
          <article className="example-integration">
            <div><span>A WIDER UNDERSTANDING</span><p>{example.result}</p></div>
            <div><span>WHAT ALIGNMENT MAY LOOK LIKE</span><strong>{example.move}</strong></div>
          </article>
          <footer>Examples show possibilities, not verdicts. Your experience remains yours to confirm and correct.</footer>
        </div>
      </section>

      <section className="permission-section" aria-labelledby="permission-title">
        <div>
          <p className="landing-kicker">RELATIONSHIPS · FAMILIES · TEAMS</p>
          <h2 id="permission-title">Bring people together—with permission.</h2>
          <p>
            Compare two permitted Baselines or map the roles and pressure shaping a family, team, or community.
          </p>
        </div>
        <div className="permission-visual" aria-label="Example permission-based relationship and system comparison">
          <article><span>YOU</span><strong>Clarity through conversation</strong><small>Baseline shared</small></article>
          <div><i /><strong>CONSENT ACTIVE</strong><i /></div>
          <article><span>ALEX</span><strong>Clarity through reflection</strong><small>Baseline shared</small></article>
          <p><strong>RELATIONSHIP</strong> One person seeks connection sooner while the other needs time to organize what they feel.</p>
          <p><strong>SYSTEM</strong> Both responses may be shaped by the roles each person learned to occupy in the family.</p>
        </div>
      </section>

      <section className="control-section" aria-label="Choice, faith, privacy, and control">
        <article><span>01</span><h3>Your private inputs stay protected.</h3><p>Raw birth details and exact private location do not enter the language model.</p></article>
        <article><span>02</span><h3>Every person controls their own context.</h3><p>Adding a name is not permission. Shared comparisons use only what each person agrees to contribute.</p></article>
        <article><span>03</span><h3>Bring faith in when it belongs.</h3><p>Choose the optional Covenant lens to explore personal and relational questions through Christian teachings and clearly cited biblical scripture.</p></article>
      </section>

      <section className="landing-final-callout">
        <div>
          <p className="landing-kicker">START WITH YOU · EXPAND WHEN READY</p>
          <h2>Start with you. Expand when the wider system matters.</h2>
          <p>Explore your design, check what fits, and understand the people and systems shaping your life.</p>
        </div>
        <div className="landing-actions">
          <a className="landing-button landing-button-primary" href="/signup">Explore my Baseline</a>
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
