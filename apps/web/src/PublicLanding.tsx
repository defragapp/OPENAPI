import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingProductStories } from './LandingProductStories';

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

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
      className="sovereign-landing v0-landing-port v0-single-example-landing public-approved-v7"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-visual-contract="v0-landing-selective-port"
      data-v0-archive-sha={V0_ARCHIVE_SHA}
      data-viewport-contract="v0-public-landing-v3"
      data-layout-release="v0-motion-workflows-v7"
      data-public-release="approved-public-v7"
    >
      <V0Navigation />
      <V0Hero />
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
        <a className="v0-wordmark" href="/" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
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
          <span>Healing isn’t optional.</span>
          <em>Holding onto the pain is.</em>
        </h1>
        <p className="sovereign-opening-copy">
          Sovereign builds your Baseline, then uses it to help you understand what is happening within you, between people, and across the systems around you.
        </p>
        <div className="sovereign-opening-actions">
          <a className="landing-control landing-control--primary" href="/signup">
            <span>Build my Baseline</span><ArrowIcon />
          </a>
          <a className="landing-inline-link" href="#how">
            <span>See how it works</span><ArrowIcon direction="down" />
          </a>
        </div>
        <p className="sovereign-opening-trust">Private by design. Correctable by you. Shared only with permission.</p>
      </div>
      <LandingExpressionSlice />
    </section>
  );
}

function ComparisonStory() {
  return (
    <section className="v0-comparison" data-viewport-section="comparison">
      <div className="v0-shell">
        <header className="v0-story-heading v0-story-heading-left">
          <p>The difference</p>
          <h2>Generic AI sees the prompt.<br /><span>Sovereign sees the context.</span></h2>
        </header>
        <div className="v0-comparison-grid" data-viewport-surface="comparison">
          <ComparisonPanel title="Other AI answers" items={COMPARISON.others} positive={false} />
          <ComparisonPanel title="SOVEREIGN.OS" items={COMPARISON.sovereign} positive />
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="v0-final">
      <h2>Your thoughts deserve<br />a better place to live.</h2>
      <p>Build your Baseline. Bring your real questions. See what changes when the answer begins with who you are.</p>
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
        <a href="/" className="v0-wordmark" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
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

function ComparisonPanel({ title, items, positive }: { title: string; items: readonly string[]; positive: boolean }) {
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
