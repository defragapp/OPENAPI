import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingProductStories } from './LandingProductStories';

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const COMPARISON = {
  others: [
    'Same generic answer for everyone',
    'Forgets who you are between chats',
    'Advice pulled from an average user',
    'Context disappears when the chat ends'
  ],
  sovereign: [
    'Answers grounded in your Baseline',
    'Keeps permitted context connected',
    'Reasoning built around the person asking',
    'Private, correctable, and consent-aware'
  ]
} as const;

const HERO_CAPABILITIES = [
  ['You', 'Understand yourself'],
  ['People', 'Understand each other'],
  ['Systems', 'See the whole dynamic'],
  ['Library', 'Keep what matters']
] as const;

export function PublicLanding() {
  return (
    <main
      className="sovereign-landing v0-landing-port v0-single-example-landing public-premium-v4 public-premium-v5"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-visual-contract="v0-landing-selective-port"
      data-v0-archive-sha={V0_ARCHIVE_SHA}
      data-viewport-contract="v0-public-landing-v3"
      data-layout-release="compact-product-stories-v3"
      data-public-release="premium-public-v5"
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
          <a className="v0-button v0-button-primary v0-button-small landing-control landing-control--nav" href="/signup">
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
      <div className="v0-hero-atmosphere" aria-hidden="true"><i /><i /><i /><span /></div>
      <div className="sovereign-opening-horizon" aria-hidden="true" />
      <div className="v0-hero-content" data-viewport-surface="hero">
        <p className="v0-badge landing-hero-kicker"><span />Personal AI for real life</p>
        <h1>
          <span>Healing isn’t optional.</span>
          <em>Holding onto the pain is.</em>
        </h1>
        <p className="sovereign-opening-copy">Sovereign helps you see what is actually happening—within you, between people, and across the systems you care about.</p>
        <div className="sovereign-opening-actions">
          <a className="v0-button v0-button-primary sovereign-opening-primary landing-control landing-control--primary" href="/signup">
            <span>Get started</span><ArrowIcon />
          </a>
          <a className="sovereign-opening-secondary landing-inline-link" href="#how">
            <span>See how it works</span><ArrowIcon direction="down" />
          </a>
        </div>
        <p className="sovereign-opening-trust">Private by design. Correctable by you. Shared only with permission.</p>
      </div>
      <LandingExpressionSlice />
      <div className="sovereign-opening-capabilities" aria-label="What Sovereign helps you understand">
        {HERO_CAPABILITIES.map(([label, description], index) => (
          <a href={index === 3 ? '/app/library' : '#how'} key={label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{label}</strong>
            <small>{description}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function ComparisonStory() {
  return (
    <section className="v0-comparison" data-viewport-section="comparison">
      <div className="v0-shell">
        <header className="v0-story-heading v0-story-heading-left">
          <p>The difference</p>
          <h2>Other AI answers<br /><span>everyone the same.</span></h2>
        </header>
        <div className="v0-comparison-grid" data-viewport-surface="comparison">
          <ComparisonPanel title="Other AI" items={COMPARISON.others} positive={false} />
          <ComparisonPanel title="SOVEREIGN.OS" items={COMPARISON.sovereign} positive />
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="v0-final">
      <div aria-hidden="true" />
      <h2>Your thoughts deserve<br />a better place to live.</h2>
      <p>Build your Baseline. Ask your real questions. Start free.</p>
      <a className="v0-button v0-button-primary landing-control landing-control--primary" href="/signup">
        <span>Get started free</span><ArrowIcon />
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
