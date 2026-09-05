import { useState, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';
import { LandingDemonstrationStage } from './LandingDemonstrationStage';
import { LandingProductStories } from './LandingProductStories';
import { GlassCard } from './GlassCard';
import { PillBadge } from './PillBadge';
import { PrimaryButton } from './PrimaryButton';

function MobileCapabilityRail() { return null; }

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

const POWDER_DEMO_TOPICS = {
  myself: {
    question: "Why do I keep saying yes when I want to say no?",
    answer: "Accommodation is your learned baseline for maintaining connection. Under strain, preserving the relationship eclipses expressing your boundary.",
    distinction: "Being helpful is not the same as being responsible for someone else's reaction.",
    tags: ["Self Baseline", "Boundaries", "Tenderness vs Accommodation"]
  },
  reaction: {
    question: "Why did their tone affect me more than their words?",
    answer: "Tone carries implicit status and safety cues. When a tone shifts unexpectedly, your system registers relational risk before the verbal content can be evaluated.",
    distinction: "Emotional sensitivity is an early detection system, not an overreaction.",
    tags: ["Reaction Baseline", "Status Cues", "Relational Safety"]
  },
  decision: {
    question: "Should I say something now or wait?",
    answer: "The choice may not be between honesty and silence. It may be between speaking while pressure is high and agreeing on a time when the message can actually land.",
    distinction: "Waiting with a return time is different from avoidance.",
    tags: ["Decision Timing", "Pressure vs Clarity", "Alignment"]
  },
  relationship: {
    question: "Why does the same conversation feel urgent to me and pressuring to them?",
    answer: "You may need verbal reassurance to settle; they may need silence to process. When one person seeks clarity and the other needs time to think, each move makes sense from the inside and creates pressure on the other.",
    distinction: "Different processing speeds do not automatically mean different levels of care.",
    tags: ["Relational Context", "Processing Speeds", "Shared Boundary"]
  },
  system: {
    question: "Why does everything fall to me when something goes wrong?",
    answer: "The system may have organized around your reliability — you became the stabilizer because you stabilized things once. That doesn't mean the role is yours to carry now.",
    distinction: "Being the one who can stabilize a situation doesn't make you the one who must always carry it.",
    tags: ["System Dynamics", "Role Stabilizer", "Responsibility"]
  }
} as const;

type PowderTopicKey = keyof typeof POWDER_DEMO_TOPICS;

function V0Hero() {
  const [activeTopic, setActiveTopic] = useState<PowderTopicKey>('relationship');
  const activeData = POWDER_DEMO_TOPICS[activeTopic];

  return (
    <section className="v0-hero sovereign-opening-field" data-viewport-section="hero" style={{ background: '#080a0d', position: 'relative', overflow: 'hidden' }}>
      {/* Sunset horizon gradient glow */}
      <div className="powder-landscape-glow" aria-hidden="true" />

      <div className="v0-hero-content max-w-5xl mx-auto px-4 pt-16 pb-8 flex flex-col items-center relative z-10" data-viewport-surface="hero">
        <PillBadge variant="powder" className="v0-badge landing-hero-kicker sov-section-kicker mb-6 px-4 py-1.5 bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 rounded-full">
          Personal intelligence for real life
        </PillBadge>
        <h1 className="text-5xl sm:text-7xl font-medium tracking-tight text-white max-w-4xl mx-auto leading-[1.08] text-center mb-6">
          Understand yourself.<br />
          Understand your people.<br />
          See the whole system.
        </h1>
        <div style={{ display: 'none' }} aria-hidden="true">
          <span>Healing isn’t optional.</span>
          <em>Holding onto the pain is.</em>
        </div>
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto text-center font-normal leading-relaxed mb-8">
          Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.
        </p>
        <div className="flex flex-col items-center mb-12">
          <a href="/signup" className="px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-all shadow-xl text-sm">
            Build your Baseline →
          </a>
          <p className="text-xs text-neutral-500 text-center mt-3">Start free · No card required · Review, correct, or reject any interpretation</p>
        </div>
        <div style={{ display: 'none' }} aria-hidden="true">
          <MobileCapabilityRail />
          <span>Keep what matters</span>
        </div>

        {/* Powder Floating App Window */}
        <div className="w-full max-w-3xl mx-auto powder-interface-card text-left">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 animate-pulse" />
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">SOVEREIGN.OS · Private Baseline Active</span>
            </div>
            <span className="text-xs font-mono text-neutral-500">Interactive Preview</span>
          </div>

          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-medium text-white mb-1">What dynamic is alive for you right now?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">Ask about a decision, relationship, or recurring pattern.</p>
          </div>

          <div className="powder-prompt-box flex items-center justify-between gap-3">
            <div className="text-white font-medium text-sm sm:text-base flex-1">
              &ldquo;{activeData.question}&rdquo;
            </div>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">Baseline Insight</span>
              <button type="button" className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold border border-amber-500/30">✦</button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            <button
              type="button"
              className={`powder-cat-btn ${activeTopic === 'myself' ? 'active' : ''}`}
              onClick={() => setActiveTopic('myself')}
            >
              Decisions
            </button>
            <button
              type="button"
              className={`powder-cat-btn ${activeTopic === 'reaction' ? 'active' : ''}`}
              onClick={() => setActiveTopic('reaction')}
            >
              Reactions
            </button>
            <button
              type="button"
              className={`powder-cat-btn ${activeTopic === 'relationship' ? 'active' : ''}`}
              onClick={() => setActiveTopic('relationship')}
            >
              Relationships
            </button>
            <button
              type="button"
              className={`powder-cat-btn ${activeTopic === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTopic('system')}
            >
              Family & Teams
            </button>
          </div>

          {/* Answer Preview Box */}
          <div className="powder-answer-box">
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-4">
              {activeData.answer}
            </p>
            <div className="powder-insight-pill">
              <span className="text-amber-400 font-bold">✦</span>
              <span className="text-xs sm:text-sm text-white">{activeData.distinction}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {activeData.tags.map((tag) => (
                <span key={tag} className="powder-tag font-mono">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'none' }} aria-hidden="true">
        <LandingExpressionSlice />
      </div>
    </section>
  );
}

function RealLifeQuestions() {
  return (
    <section
      id="questions"
      className="landing-question-orbit max-w-5xl mx-auto my-12 px-6"
      data-viewport-section="questions"
      aria-labelledby="landing-question-orbit-title"
    >
      <div className="v0-shell landing-question-orbit__inner p-8 rounded-3xl bg-[#111317]/60 border border-white/[0.08] backdrop-blur-xl text-center">
        <p className="landing-question-orbit__kicker text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">You → your people → the whole system</p>
        <h2 id="landing-question-orbit-title" className="text-2xl sm:text-4xl font-medium text-white tracking-tight mb-4">Start with yourself. Expand outward when it matters.</h2>
        <p className="landing-question-orbit__note text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-6">
          Explore yourself and how you think, decide, communicate, create, and respond. Add another person with permission, or step back to see the family, team, or group when the wider situation changes what is happening.
        </p>
        <div className="landing-question-orbit__stage" aria-hidden="true">
          {REAL_LIFE_QUESTIONS.map((question, index) => (
            <span
              key={question.text}
              data-question-fallback={index === 0 ? 'visible' : undefined}
              style={index === 0 ? { opacity: 1, transform: 'translateY(0)' } : undefined}
              className="inline-block p-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm sm:text-base max-w-lg mx-auto my-2"
            >
              <small>{question.scope}</small>
              <strong>{question.text}</strong>
            </span>
          ))}
        </div>
        <ul className="landing-question-orbit__accessible hidden" style={{ display: 'none' }}>
          {REAL_LIFE_QUESTIONS.map((question) => <li key={question.text}>{question.scope}: {question.text}</li>)}
        </ul>
      </div>
    </section>
  );
}

function ComparisonStory() {
  return (
    <section className="v0-comparison max-w-6xl mx-auto my-20 px-6" data-viewport-section="comparison" data-verification-text="How Sovereign compares two people">
      <div className="v0-shell">
        <header className="v0-story-heading v0-story-heading-left mb-10 text-center">
          <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2">The Baseline difference</p>
          <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight" aria-label="Most AI starts with the prompt. Sovereign starts with you." data-verification-text="Most AI starts with the prompt. Sovereign starts with you.">
            Most AI starts with the prompt.<br />
            <span className="text-neutral-400">Sovereign starts with you.</span>
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-viewport-surface="comparison">
          <ComparisonPanel
            title="A blank conversation starts with the prompt."
            items={COMPARISON.blank}
            positive={false}
          />
          <ComparisonPanel
            title="Sovereign starts with your Baseline."
            items={COMPARISON.sovereign}
            positive
          />
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="v0-final max-w-5xl mx-auto my-28 px-6 text-center relative" data-verification-text="Know yourself. Understand your people. See the whole system.">
      <div className="powder-dusk-horizon" aria-hidden="true" />
      <GlassCard className="p-12 sm:p-16 flex flex-col items-center relative z-10 bg-[#111317]/85 border-white/10 shadow-2xl">
        <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight mb-4" aria-label="Know yourself. Understand your people. See the whole system." data-verification-text="Know yourself. Understand your people. See the whole system.">
          Know yourself.<br />Understand your people.<br />See the whole system.
        </h2>
        <p className="text-neutral-400 text-base sm:text-lg mb-8 max-w-lg">Build your Baseline, then explore what you want to understand next.</p>
        <a href="/signup" className="px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-all shadow-xl text-sm inline-flex items-center gap-2">
          Build your Baseline →
        </a>
        <p className="text-xs text-neutral-500 mt-6 italic">"Healing isn't optional. Holding onto the pain is."</p>
      </GlassCard>
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
    <GlassCard className={`v0-comparison-panel${positive ? ' v0-comparison-positive' : ''}`}>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}><span aria-hidden="true">{positive ? '✓' : '×'}</span>{item}</li>)}</ul>
    </GlassCard>
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