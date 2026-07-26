import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const moments = [
  {
    label: 'The decision',
    prompt: '“I need to decide today, but every option feels wrong.”',
    baseline: 'You tend to decide better once the whole picture is visible.',
    pressure: 'Urgency may be louder than clarity right now.',
    move: 'Name what truly expires today. Pause everything else.'
  },
  {
    label: 'The silence',
    prompt: '“I asked what was wrong. They said nothing, then went quiet.”',
    baseline: 'You may move toward reassurance when connection feels uncertain.',
    pressure: 'Their need for space and your need for clarity may be raising pressure in opposite directions.',
    move: 'Lower the demand for an immediate answer without abandoning the conversation.'
  },
  {
    label: 'The reaction',
    prompt: '“I know this is small. Why did it land so hard?”',
    baseline: 'Certain meanings may matter more to you than the surface event suggests.',
    pressure: 'Today’s context may be amplifying the speed or intensity of your response.',
    move: 'Separate what happened, what it meant to you, and what remains unknown.'
  }
] as const;

const workspaceAreas = [
  {
    label: 'Today',
    title: 'Start with a useful read of now.',
    copy: 'See your enduring Baseline beside current pressure, confirmed observations, and the parts nobody can honestly know yet.'
  },
  {
    label: 'Explore',
    title: 'Ask in ordinary language.',
    copy: 'Work through decisions, communication, learning, love, expression, identity, or pressure without decoding a framework first.'
  },
  {
    label: 'People & Systems',
    title: 'Understand what happens between you.',
    copy: 'Use identity-bound consent to compare people or examine families, households, friendships, workplaces, and teams.'
  },
  {
    label: 'Library & Covenant',
    title: 'Keep only what you choose.',
    copy: 'Save useful understanding deliberately. Add the optional biblical Covenant lens only when you explicitly invite it.'
  }
] as const;

type Feedback = 'yes' | 'partly' | 'not_today';

const feedbackCopy: Record<Feedback, string> = {
  yes: 'Marked as fitting this example.',
  partly: 'Marked as partly fitting. A real answer would ask what needs correction.',
  not_today: 'Marked as not fitting today. Sovereign is built to accept correction.'
};

export function PublicLanding() {
  const [activeMoment, setActiveMoment] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moment = moments[activeMoment]!;

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveMoment((current) => (current + 1) % moments.length);
      setFeedback(null);
    }, 7200);
    return () => window.clearInterval(timer);
  }, []);

  function selectMoment(index: number, focus = false) {
    setActiveMoment(index);
    setFeedback(null);
    if (focus) queueMicrotask(() => tabRefs.current[index]?.focus());
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? moments.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + moments.length) % moments.length;
    selectMoment(next, true);
  }

  return (
    <main className="sovereign-landing">
      <div className="landing-atmosphere" aria-hidden="true">
        <span className="landing-glow landing-glow-one" />
        <span className="landing-glow landing-glow-two" />
      </div>

      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home">
          <span className="landing-mark" aria-hidden="true">S</span>
          <span>SOVEREIGN.OS</span>
        </a>
        <nav aria-label="Public navigation">
          <a href="/how-it-works.html">How it works</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/faq.html">FAQ</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Start free</a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker"><span /> PRIVATE DECISION INTELLIGENCE</p>
          <h1>See what is really happening. Choose without losing yourself.</h1>
          <p className="landing-lede">
            Sovereign starts with your private Baseline, separates enduring tendencies from today’s pressure,
            and keeps unknowns visible—so your next move can be clearer without turning an interpretation into a verdict.
          </p>
          <div className="landing-actions">
            <a className="landing-button landing-button-primary" href="/signup">Build my Baseline</a>
            <a className="landing-button landing-button-secondary" href="#product-preview">See it work</a>
          </div>
          <div className="landing-trust" aria-label="Product principles">
            <span>Start free</span>
            <span>Private by design</span>
            <span>Non-diagnostic</span>
          </div>
        </div>

        <div className="landing-product" id="product-preview">
          <div className="baseline-orbit" aria-hidden="true">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <span className="orbit orbit-three" />
            <span className="orbit-node node-one" />
            <span className="orbit-node node-two" />
            <span className="orbit-core" />
          </div>

          <section className="today-preview" aria-label="Sovereign Today example">
            <header className="preview-bar">
              <div><span className="preview-status" /> <strong>SOVEREIGN · TODAY</strong></div>
              <span>PRIVATE</span>
            </header>

            <div className="preview-tabs" role="tablist" aria-label="Example moments">
              {moments.map((item, index) => (
                <button
                  key={item.label}
                  ref={(element) => { tabRefs.current[index] = element; }}
                  type="button"
                  role="tab"
                  tabIndex={activeMoment === index ? 0 : -1}
                  aria-selected={activeMoment === index}
                  className={activeMoment === index ? 'active' : ''}
                  onClick={() => selectMoment(index)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="preview-content" key={activeMoment} aria-live="polite">
              <p className="preview-prompt">{moment.prompt}</p>
              <div className="preview-reading">
                <article>
                  <span>YOUR BASELINE</span>
                  <p>{moment.baseline}</p>
                </article>
                <article>
                  <span>CURRENT PRESSURE</span>
                  <p>{moment.pressure}</p>
                </article>
                <article className="preview-next">
                  <span>CLEANEST NEXT MOVE</span>
                  <p>{moment.move}</p>
                </article>
              </div>
              <footer className="preview-footer">
                <span>Unknowns remain unknown</span>
                <div aria-label="Does this example fit?">
                  <button className={feedback === 'yes' ? 'active' : ''} aria-pressed={feedback === 'yes'} type="button" onClick={() => setFeedback('yes')}>Yes</button>
                  <button className={feedback === 'partly' ? 'active' : ''} aria-pressed={feedback === 'partly'} type="button" onClick={() => setFeedback('partly')}>Partly</button>
                  <button className={feedback === 'not_today' ? 'active' : ''} aria-pressed={feedback === 'not_today'} type="button" onClick={() => setFeedback('not_today')}>Not today</button>
                </div>
              </footer>
              <p className="preview-feedback-note" role="status">{feedback ? feedbackCopy[feedback] : 'Confirm it, correct it, or reject it.'}</p>
            </div>
          </section>
        </div>
      </section>

      <section className="landing-workspace" aria-labelledby="workspace-title">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker"><span /> ONE PRIVATE WORKSPACE</p>
            <h2 id="workspace-title">Set it up once. Correct it as you go.</h2>
          </div>
          <p>One Baseline can support the day, the decision, the relationship, and the system without flattening them into the same answer.</p>
        </div>
        <div className="landing-module-grid">
          {workspaceAreas.map((area, index) => (
            <article key={area.label}>
              <span>{String(index + 1).padStart(2, '0')} · {area.label}</span>
              <h3>{area.title}</h3>
              <p>{area.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-principles" aria-label="How Sovereign works">
        <article>
          <span>01</span>
          <div><h2>Begin with you.</h2><p>Your Baseline is a private starting point, not a fixed identity or public label.</p></div>
        </article>
        <article>
          <span>02</span>
          <div><h2>Add context carefully.</h2><p>Today, people, and systems are layered in without pretending the unknown is known.</p></div>
        </article>
        <article>
          <span>03</span>
          <div><h2>Keep only what helps.</h2><p>Nothing becomes lasting memory unless you deliberately save it.</p></div>
        </article>
      </section>

      <section className="landing-final-callout">
        <div>
          <p className="landing-kicker"><span /> START WITH A REAL MOMENT</p>
          <h2>Free begins with Baseline, Today, Explore, and 10 AI turns each month.</h2>
          <p>Sovereign+ adds 300 monthly AI turns, consented People and Systems, Library continuity, and the optional Covenant lens for $20 monthly or $99 annually.</p>
        </div>
        <div className="landing-actions">
          <a className="landing-button landing-button-primary" href="/signup">Start free</a>
          <a className="landing-button landing-button-secondary" href="/pricing.html">Compare plans</a>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Consent-aware · Private by default · Built for correction</span>
        <nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/pricing.html">Pricing</a></nav>
      </footer>
    </main>
  );
}
