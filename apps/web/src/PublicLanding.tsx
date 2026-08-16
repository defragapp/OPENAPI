import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingProductStories } from './LandingProductStories';

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const REAL_LIFE_QUESTIONS = [
  'Why do I keep taking responsibility for everyone around me?',
  'Why do we keep having the same fight?',
  'Should I say something now or wait?',
  'Why does their silence affect me so strongly?',
  'What is mine, what is theirs, and what happens between us?',
  'Is this a timing mismatch or a values mismatch?',
  'What changes when I stop playing the role everyone expects?',
  'Does this choice fit me, or does it cost too much of me?'
] as const;

const COMPARISON = {
  others: [
    'Starts with the latest message',
    'Gives advice for an average user',
    'Treats every chat as a new beginning',
    'Loses the relationship and system around the question'
  ],
  sovereign: [
    'Starts with your Baseline',
    'Keeps permitted context connected',
    'Distinguishes you, the relationship, and the system',
    'Answers the question underneath the question'
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
    >
      <V0Navigation />
      <V0Hero />
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
          <a className="landing-control landing-control--nav" href="/signup">
            <span>Get started</span><ArrowIcon />
          </a>
          <details className="v0-mobile-menu">
            <summary aria-label="Open navigation"><MenuIcon /></summary>
            <nav className="v0-mobile-menu__panel" aria-label="Mobile navigation">
              <a href="#how">How it works</a>
              <a href="/pricing">Pricing</a>
              <a href="/faq">FAQ</a>
              <a href="/login">Sign in</a>
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
          Sovereign begins with the capacity beneath a pattern. It shows how that capacity may be expressing, what happens between people, and what may be keeping the pattern in place—so you can see what could change.
        </p>
        <p className="sovereign-opening-copy sovereign-opening-copy--mobile">
          See the capacity beneath a pattern, how it may be expressing, what happens between people, and what could change.
        </p>
        <div className="sovereign-opening-actions">
          <a className="landing-control landing-control--primary" href="/signup">
            <SparkIcon />
            <span>Build my Baseline</span>
            <ArrowIcon />
          </a>
          <a className="landing-inline-link" href="#how">
            <span>See a Sovereign answer</span><ArrowIcon direction="down" />
          </a>
        </div>
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
      className="landing-question-orbit"
      data-viewport-section="questions"
      aria-labelledby="landing-question-orbit-title"
    >
      <div className="v0-shell landing-question-orbit__inner">
        <p className="landing-question-orbit__kicker">Bring the question you already have</p>
        <h2 id="landing-question-orbit-title">Ask about your life. Get an answer built around you.</h2>
        <div className="landing-question-orbit__stage" aria-hidden="true">
          {REAL_LIFE_QUESTIONS.map((question) => <span key={question}>{question}</span>)}
        </div>
        <ul className="landing-question-orbit__accessible">
          {REAL_LIFE_QUESTIONS.map((question) => <li key={question}>{question}</li>)}
        </ul>
        <p className="landing-question-orbit__note">
          Sovereign keeps what is steady, what may be active now, what you have observed, and what is still unknown separate.
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
          <h2 aria-label="Generic AI sees the prompt. Sovereign sees the context.">
            Generic AI<br />sees the<br />prompt.<br />
            <span>Sovereign<br />sees the<br />context.</span>
          </h2>
        </header>
        <div className="v0-comparison-grid" data-viewport-surface="comparison">
          <ComparisonPanel title="Other AI answers" items={COMPARISON.others} positive={false} />
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
      <p>Build your Baseline. Bring the question you actually have. Keep the answer, the context, and what is still unknown connected.</p>
      <a className="landing-control landing-control--primary" href="/signup">
        <span>Build my Baseline</span><ArrowIcon />
      </a>
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

function SparkIcon() {
  return (
    <svg className="v0-mobile-spark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.75c.86 6.35 3.9 9.39 10.25 10.25C15.9 12.86 12.86 15.9 12 22.25 11.14 15.9 8.1 12.86 1.75 12 8.1 11.14 11.14 8.1 12 1.75Z" />
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
