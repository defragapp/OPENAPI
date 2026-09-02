import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingDemonstrationStage } from './LandingDemonstrationStage';
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
    'Your history and patterns must be re-explained or inferred each time',
    'Another person\'s information is not protected by sharing permissions',
    'Does not show exact source details for its interpretations'
  ],
  sovereign: [
    'Carries your private Baseline intelligence across every conversation',
    'Uses what is happening now, another person\'s shared Baseline, or the wider situation only when it helps',
    'Keeps each person separate and uses only what they chose to share',
    'Lets you inspect source details and review, correct, or reject any interpretation'
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
          <a className="v0-get-started" href="/signup">Build your Baseline <ArrowIcon /></a>
          <details className="v0-mobile-menu">
            <summary aria-label="Open navigation"><MenuIcon /></summary>
            <nav className="v0-mobile-menu__panel" aria-label="Mobile navigation">
              <a href="/how-it-works">How it works</a>
              <a href="/pricing">Pricing</a>
              <a href="/faq">FAQ</a>
              <a href="/login">Sign in</a>
              <a href="/signup">Build your Baseline</a>
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
        <p className="v0-badge landing-hero-kicker sov-section-kicker"><span />Personal intelligence for real life</p>
        <h1 className="sov-display-hero">
          <span aria-label="Healing isn’t optional.">
            Healing<span className="v0-desktop-space"> </span><br className="v0-mobile-line-break" aria-hidden="true" />isn’t optional.
          </span>
          <em className="sov-display-hero-outline" aria-label="Holding onto the pain is.">
            <span className="v0-desktop-space"> </span>Holding onto<span className="v0-desktop-space"> </span><br className="v0-mobile-line-break" aria-hidden="true" />the pain is.
          </em>
        </h1>
        <p className="sovereign-opening-copy sovereign-opening-copy--desktop">
          Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.
        </p>
        <p className="sovereign-opening-copy sovereign-opening-copy--mobile">
          Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.
        </p>
        <p className="sovereign-opening-trust">
          <span className="v0-desktop-only">Start free · No card required · Review, correct, or reject any interpretation</span>
          <span className="v0-mobile-only">Start free · No card required · Review, correct, or reject any interpretation</span>
        </p>
      </div>
      <div className="landing-hero-atmosphere">
        <LandingExpressionSlice />
      </div>
      <MobileCapabilityRail />
      <div className="landing-hero-product-preview">
        <LandingDemonstrationStage />
      </div>
    </section>
  );
}

function MobileCapabilityRail() {
  return (
    <nav className="sovereign-opening-capabilities" aria-label="Explore Sovereign">
      <a href="#how">
        <CapabilityIcon kind="self" />
        <strong>Explore yourself</strong>
        <small>How you think, decide,<br />create, connect, and grow</small>
      </a>
      <a href="#relationship" data-verification-text="See why the same moment lands differently—and how to bridge the gap.">
        <CapabilityIcon kind="people" />
        <strong>Understand your people</strong>
        <small>See why the same moment lands differently—and how to bridge the gap.</small>
      </a>
      <a href="#system" data-verification-text="From 1:1 to the whole system">
        <CapabilityIcon kind="system" />
        <strong>See the whole system</strong>
        <small>From 1:1 to family,<br />team, or group</small>
      </a>
      <a href="/login">
        <CapabilityIcon kind="library" />
        <strong>Keep what matters</strong>
        <small>Return to what changed<br />your understanding</small>
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
    <section className="v0-comparison" data-viewport-section="comparison" data-verification-text="How Sovereign compares two people">
      <div className="v0-shell">
        <header className="v0-story-heading v0-story-heading-left">
          <p>The Baseline difference</p>
          <h2 aria-label="Most AI starts with the prompt. Sovereign starts with you." data-verification-text="Most AI starts with the prompt. Sovereign starts with you.">
            Most AI starts<br />with the prompt.<br />
            <span>Sovereign starts<br />with you.</span>
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
    <section className="v0-final" data-verification-text="Know yourself. Understand your people. See the whole system.">
      <h2 aria-label="Know yourself. Understand your people. See the whole system." data-verification-text="Know yourself. Understand your people. See the whole system.">
        Know yourself.<br />Understand your people.<br />See the whole system.
      </h2>
      <p>Build your Baseline, then explore what you want to understand next.</p>
      <a className="v0-get-started" href="/signup">Build your Baseline <ArrowIcon /></a>
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
          <a href="mailto:info@sovereign.defrag.app">Contact</a>
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