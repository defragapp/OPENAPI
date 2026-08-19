import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingProductStories } from './LandingProductStories';

const V0_ARCHIVE_SHA = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const REAL_LIFE_QUESTIONS = [
  { scope: 'Self', text: 'How do I make decisions that actually fit me?' },
  { scope: 'Reaction', text: 'Why did their tone affect me more than their words?' },
  { scope: 'Creativity', text: 'How do I know when I’m adapting too early?' },
  { scope: 'Decision', text: 'Should I say something now or wait?' },
  { scope: 'Relationship', text: 'Why does the same conversation feel urgent to me and pressuring to them?' },
  { scope: 'Family', text: 'Why does everything fall to me when something goes wrong?' },
  { scope: 'Team', text: 'How does pressure move through this team?' },
  { scope: 'System', text: 'What changes when I stop playing the role everyone expects?' }
] as const;

const COMPARISON = {
  blank: [
    'Starts from the prompt and what you explain in that conversation',
    'Your history and recurring patterns must be explained again or inferred from the thread',
    'Another person’s information is not automatically protected by Sovereign’s sharing permissions',
    'Does not show Sovereign’s exact source details for an interpretation'
  ],
  sovereign: [
    'Carries your private Baseline across conversations',
    'Uses what is happening now, another person’s shared Baseline, or the wider family or team situation only when it helps answer the question',
    'Keeps each person separate and uses only what they chose to share',
    'Lets you inspect source details and review, correct, or reject interpretations'
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
      data-layout-release="high-value-intelligence-v1"
      data-public-release="approved-public-v8"
      data-public-narrative="self-people-systems-v1"
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
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <div className="v0-nav-actions">
          <a className="v0-sign-in" href="/login">Sign in</a>
          <a className="v0-get-started" href="/signup">Get started</a>
          <details className="v0-mobile-menu">
            <summary aria-label="Open navigation"><MenuIcon /></summary>
            <nav className="v0-mobile-menu__panel" aria-label="Mobile navigation">
              <a href="/how-it-works">How it works</a>
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
          Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you. Build your Baseline once, then explore how you think, decide, communicate, create, connect, respond under pressure, and change.
        </p>
        <p className="sovereign-opening-copy sovereign-opening-copy--mobile">
          Private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.
        </p>
        <p className="sovereign-opening-trust">
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
        <strong>Explore yourself</strong>
        <small>Decisions, expression,<br />connection, Alignment.</small>
      </a>
      <a href="#relationship">
        <strong>Understand your people</strong>
        <small>See why the same moment<br />can land differently.</small>
      </a>
      <a href="#system">
        <strong>See the whole system</strong>
        <small>From 1:1 to family,<br />team, or group.</small>
      </a>
      <a href="/login">
        <strong>Keep what matters</strong>
        <small>Return to what changed<br />your understanding.</small>
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
        <p className="landing-question-orbit__kicker">You → your people → the whole system</p>
        <h2 id="landing-question-orbit-title">Start with yourself. Expand outward when it matters.</h2>
        <p className="landing-question-orbit__note">
          Explore how you think, decide, communicate, create, and respond. Add another person with permission, or step back to see the family, team, or group when the wider situation changes what is happening.
        </p>
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
          <h2 aria-label="Most AI starts with the prompt. Sovereign starts with you.">
            Most AI starts<br />with the prompt.<br />
            <span>Sovereign<br />starts with you.</span>
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
      <h2 aria-label="Know yourself. Understand your people. See the whole system.">
        Know yourself.<br />Understand your people.<br />See the whole system.
      </h2>
      <p>Start free. Build your Baseline, then explore what you want to understand next.</p>
    </section>
  );
}

function V0Footer() {
  return (
    <footer className="v0-footer">
      <div className="v0-shell">
        <a href="/" className="v0-wordmark" aria-label="Sovereign.OS home"><BrandMark /></a>
        <nav aria-label="Footer navigation">
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
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
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}

function MenuIcon() {
  return (
    <svg className="v0-mobile-menu__icon" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
      <path d="M1 2h30M1 12h30M1 22h30" />
    </svg>
  );
}
