import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingProductStories } from './LandingProductStories';

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const PRODUCT_STORY_LAYOUT_AUTHORITY = `
.v0-landing-port .v0-restored-product-stories .v0-story-grid {
  display: grid !important;
  grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr) !important;
  grid-auto-rows: auto !important;
  align-items: start !important;
  gap: clamp(20px, 3vw, 36px) !important;
}

.v0-landing-port .v0-restored-product-stories .v0-story-grid > .v0-window,
.v0-landing-port .v0-restored-product-stories .v0-window,
.v0-landing-port .v0-restored-product-stories .v0-flow,
.v0-landing-port .v0-restored-product-stories .v0-workflow-panel,
.v0-landing-port .v0-restored-product-stories .v0-window-body,
.v0-landing-port .v0-restored-product-stories .v0-workflow-panel ol {
  height: auto !important;
  min-height: 0 !important;
  align-self: start !important;
}

.v0-landing-port .v0-restored-product-stories .v0-workflow-panel ol {
  display: block !important;
}

.v0-landing-port .v0-restored-product-stories .v0-composer-preview {
  margin-top: 18px !important;
}

@media (max-width: 1100px) {
  .v0-landing-port .v0-restored-product-stories .v0-story-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 18px !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-story-grid > .v0-window {
    width: 100% !important;
    max-width: 860px !important;
    margin-inline: auto !important;
  }
}

@media (max-width: 760px) {
  .v0-landing-port .v0-restored-product-stories .v0-story {
    padding-block: 58px !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-story > *,
  .v0-landing-port .v0-restored-product-stories .v0-story-heading {
    width: calc(100vw - 24px) !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-story-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 14px !important;
    margin-top: 28px !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-window {
    width: 100% !important;
    max-width: none !important;
    border-radius: 6px !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-window-body {
    gap: 12px !important;
    padding: 14px !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-workflow-panel ol {
    padding: 16px 14px 14px !important;
  }

  .v0-landing-port .v0-restored-product-stories .v0-family-system-map {
    min-height: 360px !important;
  }
}
`;

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

export function PublicLanding() {
  return (
    <main
      className="sovereign-landing v0-landing-port v0-single-example-landing"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-visual-contract="v0-landing-selective-port"
      data-v0-archive-sha={V0_ARCHIVE_SHA}
      data-viewport-contract="v0-public-landing-v3"
      data-layout-release="compact-product-stories-v2"
    >
      <style data-product-story-layout-authority="compact-v2">{PRODUCT_STORY_LAYOUT_AUTHORITY}</style>
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
        <a className="v0-wordmark" href="/" aria-label="Sovereign home">Sovereign</a>
        <nav aria-label="Public navigation">
          <a href="#how">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <div className="v0-nav-actions">
          <a className="v0-sign-in" href="/login">Sign in</a>
          <a className="v0-button v0-button-primary v0-button-small" href="/signup">Get started</a>
        </div>
      </div>
    </header>
  );
}

function V0Hero() {
  return (
    <section className="v0-hero" data-viewport-section="hero">
      <div className="v0-hero-atmosphere" aria-hidden="true"><i /><i /><i /><span /></div>
      <div className="v0-hero-content" data-viewport-surface="hero">
        <p className="v0-badge"><span />Personal AI for real life</p>
        <h1>
          <span>Healing isn’t optional.</span>
          <em>Holding onto the pain is.</em>
        </h1>
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
          <h2>Other AI answers<br /><span>everyone the same.</span></h2>
        </header>
        <div className="v0-comparison-grid" data-viewport-surface="comparison">
          <ComparisonPanel title="Other AI" items={COMPARISON.others} positive={false} />
          <ComparisonPanel title="Sovereign" items={COMPARISON.sovereign} positive />
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
      <a className="v0-button v0-button-primary" href="/signup">Get started free <span aria-hidden="true">→</span></a>
    </section>
  );
}

function V0Footer() {
  return (
    <footer className="v0-footer">
      <div className="v0-shell">
        <a href="/" className="v0-wordmark">Sovereign</a>
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
    <article className={positive ? 'v0-comparison-positive' : ''}>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}><span aria-hidden="true">{positive ? '✓' : '×'}</span>{item}</li>)}</ul>
    </article>
  );
}
