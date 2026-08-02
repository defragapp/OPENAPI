import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';

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

const CAPABILITIES = [
  {
    label: 'You',
    title: 'Understand yourself',
    body: 'Ask about a decision, a recurring pattern, pressure, boundaries, or what may be more active now.'
  },
  {
    label: 'You + 1',
    title: 'Understand a relationship',
    body: 'With permission, keep both people distinct and see what may be happening between you.'
  },
  {
    label: 'Your people',
    title: 'Understand a system',
    body: 'Map roles, responsibility, pressure, and recurring interaction across a family or team.'
  }
] as const;

export function PublicLanding() {
  return (
    <main
      className="sovereign-landing v0-landing-port v0-single-example-landing"
      data-product-contract="baseline-first"
      data-answer-contract="sovereign-answer.v2"
      data-visual-contract="v0-landing-single-example"
      data-v0-archive-sha={V0_ARCHIVE_SHA}
      data-viewport-contract="v0-public-landing-v2"
    >
      <V0Navigation />
      <V0Hero />
      <CapabilitySummary />
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
          <a href="#expression">How it works</a>
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
        <p className="v0-hero-copy">
          Sovereign builds your <strong>Baseline</strong>—a stable, correctable understanding of how you may naturally operate—then uses it to answer real questions without treating you like an average user.
        </p>
        <div className="v0-actions">
          <a className="v0-button v0-button-primary" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a>
          <a className="v0-button v0-button-secondary" href="#expression">Explore the field</a>
        </div>
      </div>
      <LandingExpressionSlice />
    </section>
  );
}

function CapabilitySummary() {
  return (
    <section className="v0-capability-summary" data-viewport-section="capabilities">
      <div className="v0-capability-summary__inner" data-viewport-surface="capability-summary">
        <header className="v0-capability-summary__heading">
          <h2>One place to understand what keeps happening.</h2>
          <p>
            Start with one question. Sovereign brings forward only the Baseline qualities, current context, and permitted relationship or system information that matter to that question.
          </p>
        </header>
        <div className="v0-capability-summary__modes">
          {CAPABILITIES.map((capability) => (
            <article key={capability.label}>
              <span>{capability.label}</span>
              <h3>{capability.title}</h3>
              <p>{capability.body}</p>
            </article>
          ))}
        </div>
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
