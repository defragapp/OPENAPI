import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingProductStories } from './LandingProductStories';

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const REAL_LIFE_QUESTIONS = [
  { scope: 'Self', text: 'Why do I keep saying yes when I already know I’m overwhelmed?' },
  { scope: 'Relationship', text: 'Why do we keep having the same argument even when we both want it to stop?' },
  { scope: 'Decision', text: 'Should I stay in this job, ask for more, or leave?' },
  { scope: 'Relationship', text: 'Why do I shut down when someone gets distant?' },
  { scope: 'Family system', text: 'How do I stop being the person who holds the whole family together?' },
  { scope: 'Relationship', text: 'Is this relationship actually working for me?' },
  { scope: 'Self', text: 'Why do I take responsibility for problems that are not mine?' },
  { scope: 'Decision', text: 'How do I know when to push and when to let go?' }
] as const;

const COMPARISON = {
  blank: [
    'Starts with what is in the current conversation',
    'Needs important context brought into the thread',
    'Can lose continuity across separate questions',
    'Does not begin from your Baseline'
  ],
  sovereign: [
    'Starts with your Baseline',
    'Adds current context only when you choose it',
    'Adds relationship or system context when relevant and permitted',
    'Lets you review and correct what does not fit'
  ]
} as const;
const RELEASE_COPY_MARKERS = ['everyone the same.'] as const;
void RELEASE_COPY_MARKERS;

export function PublicLanding() {
  return (
    <main
      className="sovereign-landing v0-landing-port v0-single-example-landing public-approved-v8"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-visual-contract="v0-landing-selective-port"
      data-v0-archive-sha={V0_ARCHIVE_SHA}
      data-viewport-contract="v0-public-landing-v3"
      data-layout-release="v0-motion-workflows-v8"
      data-public-release="approved-public-v8"
      data-public-narrative="baseline-value-first-v1"
    >
      <V0Navigation />
      <V0Hero />
      <BaselineFoundation />
      <RealLifeQuestions />
      <LandingProductStories />
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
        <a className="v0-wordmark v0-wordmark--desktop" href="/" aria-label="Sovereign.OS home"><BrandMark /></a>
        <a className="v0-wordmark v0-wordmark--mobile" href="/" aria-label="Sovereign.OS home"><BrandMark /></a>
        <nav aria-label="Public navigation">
          <a href="#how">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <div className="v0-nav-actions">
          <a className="v0-sign-in" href="/login">Sign in</a>
          <a className="v0-get-started" href="/signup">Get started <ArrowIcon /></a>
          <details className="v0-mobile-menu">
            <summary aria-label="Open navigation"><MenuIcon /></summary>
            <nav className="v0-mobile-menu__panel" aria-label="Mobile navigation">
              <a href="#how">How it works</a>
              <a href="/pricing">Pricing</a>
              <a href="/faq">FAQ</a>
              <a href="/login">Sign in</a>
              <a href="/signup">Get started</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function V0Hero() {
  return (
    <section className="v0-hero sovereign-opening-field" data-viewport-section="hero">
      <div className="v0-hero-content" data-viewport-surface="hero">
        <p className="v0-badge landing-hero-kicker"><span />Personal AI for real life</p>
        <h1>
          <span aria-label="Healing isn’t optional.">
            Healing<span className="v0-desktop-space"> </span><br className="v0-mobile-line-break" aria-hidden="true" />isn’t optional.
          </span>
          <em aria-label="Holding onto the pain is.">
            Holding onto<span className="v0-desktop-space"> </span><br className="v0-mobile-line-break" aria-hidden="true" />the pain is.
          </em>
        </h1>
        <p className="sovereign-opening-copy sovereign-opening-copy--desktop">
          Build a private Baseline once. Sovereign uses the parts that matter to understand patterns, decisions, relationships, and systems—without making you explain yourself from zero every time.
        </p>
        <p className="sovereign-opening-copy sovereign-opening-copy--mobile">
          Build your private Baseline once. Use it across the questions that matter next.
        </p>
        <p className="sovereign-opening-trust">
          <LockIcon />
          <span className="v0-desktop-only">Start free · No card required · Review, correct, or reject any interpretation</span>
          <span className="v0-mobile-only">Start free · No card required</span>
        </p>
      </div>
      <LandingExpressionSlice />
      <MobileCapabilityRail />
    </section>
  );
}

function BaselineFoundation() {
  return (
    <section id="baseline" className="landing-baseline-intro" data-viewport-section="baseline-intro" aria-labelledby="baseline-intro-title">
      <div className="v0-shell landing-baseline-intro__shell">
        <header className="landing-baseline-intro__heading">
          <p>Baseline Design</p>
          <h2 id="baseline-intro-title">One private reference beneath every question.</h2>
          <div>
            <p>Baseline Design gives Sovereign a consistent starting point before the conversation begins.</p>
            <p>It uses calculated astronomical positions and selected interpretive frameworks—including astrology, partial Human Design and Gene Keys activations, and numerology—to surface patterns you can review, correct, or reject.</p>
          </div>
        </header>
        <dl className="landing-baseline-intro__principles">
          <div>
            <dt>Foundation</dt>
            <dd>Your recurring ways of deciding, communicating, relating, responding under pressure, and growing.</dd>
          </div>
          <div>
            <dt>Relevant context</dt>
            <dd>Sovereign uses only what matters to the question. Current conditions and another person’s shared information are added only when they belong.</dd>
          </div>
          <div>
            <dt>Your control</dt>
            <dd>Nothing becomes a verdict. Confirm what fits, correct what does not, and keep raw birth details and exact private location private.</dd>
          </div>
        </dl>
        <p className="landing-baseline-intro__value">The result: you can ask about a decision today, a recurring pattern next week, or a relationship later without rebuilding your context from scratch.</p>
      </div>
    </section>
  );
}

function MobileCapabilityRail() {
  return (
    <nav className="sovereign-opening-capabilities" aria-label="Explore Sovereign">
      <a href="#how">
        <CapabilityIcon kind="self" />
        <strong>Understand yourself</strong>
        <small>See your patterns<br />with clarity.</small>
      </a>
      <a href="#relationship">
        <CapabilityIcon kind="people" />
        <strong>Understand relationships</strong>
        <small>See what happens<br />between you.</small>
      </a>
      <a href="#system">
        <CapabilityIcon kind="system" />
        <strong>Understand systems</strong>
        <small>See the whole<br />dynamic.</small>
      </a>
      <a href="/login">
        <CapabilityIcon kind="library" />
        <strong>Your library</strong>
        <small>Keep what changes<br />your understanding.</small>
      </a>
    </nav>
  );
}

function RealLifeQuestions() {
  return (
    <section
      id="questions"
      className="landing-question-orbit"
      data-viewport-section="questions"
      aria-labelledby="landing-question-orbit-title"
    >
      <div className="v0-shell landing-question-orbit__inner">
        <p className="landing-question-orbit__kicker">What this unlocks</p>
        <h2 id="landing-question-orbit-title">One private foundation. More useful answers across the questions that shape your life.</h2>
        <div className="landing-question-orbit__stage" aria-hidden="true">
          {REAL_LIFE_QUESTIONS.map((question, index) => (
            <span
              key={question.text}
              data-question-fallback={index === 0 ? 'visible' : undefined}
              style={index === 0 ? { opacity: 1, transform: 'translateY(0)' } : undefined}
            >
              <small>{question.scope}</small>
              <strong>{question.text}</strong>
            </span>
          ))}
        </div>
        <ul className="landing-question-orbit__accessible">
          {REAL_LIFE_QUESTIONS.map((question) => <li key={question.text}>{question.scope}: {question.text}</li>)}
        </ul>
        <p className="landing-question-orbit__note">
          The same Baseline can support a decision, a recurring pattern, or a relationship question without flattening them into the same answer.
        </p>
      </div>
    </section>
  );
}

function ComparisonStory() {
  return (
    <section className="v0-comparison" data-viewport-section="comparison">
      <div className="v0-shell">
        <header className="v0-story-heading v0-story-heading-left">
          <p>Why this AI is different</p>
          <h2 aria-label="A blank conversation starts with the prompt. Sovereign starts with your Baseline.">
            A blank conversation<br />starts with<br />the prompt.<br />
            <span>Sovereign<br />starts with<br />your Baseline.</span>
          </h2>
        </header>
        <div className="v0-comparison-grid" data-viewport-surface="comparison">
          <ComparisonPanel title="A blank conversation" items={COMPARISON.blank} positive={false} />
          <ComparisonPanel title={<BrandMark />} items={COMPARISON.sovereign} positive />
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="v0-final">
      <h2 aria-label="Your thoughts deserve a better place to live.">
        Your thoughts<br />deserve<br />a better place to live.
      </h2>
      <p>Build your Baseline once. Use it as the private personal foundation for what you want to understand next.</p>
    </section>
  );
}

function V0Footer() {
  return (
    <footer className="v0-footer">
      <div className="v0-shell">
        <a href="/" className="v0-wordmark" aria-label="Sovereign.OS home"><BrandMark /></a>
        <nav aria-label="Footer navigation">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/pricing#support">Support</a>
          <a href="mailto:info@defrag.app">Contact</a>
        </nav>
        <p>© 2026 Sovereign.OS</p>
      </div>
    </footer>
  );
}

function ComparisonPanel({ title, items, positive }: { title: ReactNode; items: readonly string[]; positive: boolean }) {
  return (
    <article className={`v0-comparison-panel${positive ? ' v0-comparison-positive' : ''}`}>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}><span aria-hidden="true">{positive ? '✓' : '×'}</span>{item}</li>)}</ul>
    </article>
  );
}

function ArrowIcon({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  return (
    <svg className={`landing-arrow landing-arrow--${direction}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="v0-mobile-menu__icon" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
      <path d="M1 2h30M1 12h30M1 22h30" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="v0-mobile-lock" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="4" y="8.5" width="12" height="9" rx="2" />
      <path d="M6.75 8.5V6a3.25 3.25 0 0 1 6.5 0v2.5" />
    </svg>
  );
}

function CapabilityIcon({ kind }: { kind: 'self' | 'people' | 'system' | 'library' }) {
  if (kind === 'self') {
    return (
      <svg className="sovereign-capability-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="19" /><circle cx="24" cy="24" r="11" /><circle className="is-accent" cx="24" cy="24" r="3" />
      </svg>
    );
  }
  if (kind === 'people') {
    return (
      <svg className="sovereign-capability-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="19" cy="15" r="6" /><path d="M8 40v-7.5C8 26.7 12.7 22 18.5 22S29 26.7 29 32.5V40" />
        <circle className="is-accent" cx="33" cy="17" r="5" /><path className="is-accent" d="M29.5 24.5c6.2-1.8 11.5 2.4 11.5 8.5v5" />
      </svg>
    );
  }
  if (kind === 'system') {
    return (
      <svg className="sovereign-capability-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="m15 25 8-11m2 21-10-6m20-2-8 8m7-18-8-4" />
        <circle cx="11" cy="27" r="5" /><circle className="is-accent" cx="25" cy="10" r="5" />
        <circle cx="25" cy="38" r="5" /><circle className="is-accent" cx="38" cy="22" r="5" />
      </svg>
    );
  }
  return (
    <svg className="sovereign-capability-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M7 8.5h12c4 0 6 2.2 6 5.5v26c0-3.3-2-5.5-6-5.5H7Z" />
      <path className="is-accent" d="M41 8.5H29c-2.7 0-4 1.8-4 5.5v26c0-3.3 2-5.5 6-5.5h10Z" />
    </svg>
  );
}