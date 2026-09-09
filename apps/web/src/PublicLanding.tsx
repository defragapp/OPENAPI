import { useEffect, useState } from 'react';
import './template-design.css';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

const VIEW_CARDS = [
  {
    icon: '◆',
    label: '01 — Baseline',
    title: 'A private reference built around you',
    body: 'Sovereign builds a structured Baseline from what you share — not a diagnosis, not a score. A living reference for your decisions, relationships, and systems.',
  },
  {
    icon: '◇',
    label: '02 — Alignment',
    title: 'Structured comparison, not a score',
    body: 'See how two perspectives relate — without turning interpretation into fact. Alignment keeps each person distinct and permission-bound.',
  },
  {
    icon: '○',
    label: '03 — Covenant',
    title: 'Offered contextually, never assumed',
    body: 'Covenant is available when the question calls for it. It stays beneath the primary experience until you choose to bring it forward.',
  },
];

const INTELLIGENCE_QA = [
  {
    question: 'What makes Sovereign different from other AI platforms?',
    answer:
      'Sovereign is Baseline-first. The product is useful before you explain an incident. One text thread, a direct answer, relevant sections, and quiet source details — no dashboards, no cards, no noise.',
  },
  {
    question: 'How does Sovereign handle my data?',
    answer:
      'Your Baseline is private, generated on demand from account-owned data, and never retained as an export artifact. Exact source values stay server-approved. You control what is shared and with whom.',
  },
  {
    question: 'What can I actually do with Sovereign?',
    answer:
      'Ask anything. Get a direct answer with source-backed reasoning. Explore relationships and systems through the same Baseline-first lens. Continue the thread or correct the record.',
  },
  {
    question: 'Is Sovereign a diagnostic tool?',
    answer:
      'No. Sovereign does not diagnose, assign hidden motives, claim exact emotions, or present interpretation as deterministic proof. It distinguishes stable facets, temporary context, observed behavior, and unknown state.',
  },
];

const FEATURE_PILLS = [
  'One text thread',
  'Direct answer',
  'Source details',
  'Baseline-first',
  'Relationship intelligence',
  'System intelligence',
  'Private by design',
  'No dashboards',
];

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/faq', label: 'FAQ' },
  { href: 'mailto:info@sovereign.defrag.app', label: 'Contact' },
];

export default function PublicLanding() {
  const [releaseSha, setReleaseSha] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Sovereign.OS — AI that starts with you';
    fetch('/ready', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.sha && setReleaseSha(j.sha))
      .catch(() => {});
  }, []);

  return (
    <div data-page="landing" data-visual-system="sovereign-template" data-public-narrative="self-people-systems-v1" data-release-sha={releaseSha ?? ''} data-landing-marker="You → your people → the whole system" data-landing-marker-2="Start with yourself. Expand outward when it matters." data-landing-marker-3="How do I make decisions that actually fit me?" data-landing-marker-4="Most AI starts with the prompt. Sovereign starts with you." data-landing-marker-5="Know yourself. Understand your people. See the whole system.">
      <nav className="td-nav">
        <div className="td-shell td-nav-inner">
          <a href="/" className="td-wordmark">SOVEREIGN.OS</a>
          <div className="td-nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </div>
          <div className="td-nav-actions">
            <a href="https://app.defrag.app/login" className="td-nav-signin">Sign in</a>
            <a href="https://app.defrag.app/signup" className="td-go td-go--primary">Enter Sovereign.OS</a>
          </div>
          <details className="td-mobile-menu">
            <summary aria-label="Open menu"><span className="td-mobile-menu-icon" /></summary>
            <div className="td-mobile-menu-panel">
              {NAV_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
              <a href="https://app.defrag.app/signup" className="td-go td-go--primary">Enter Sovereign.OS</a>
            </div>
          </details>
        </div>
      </nav>

      <header className="td-hero td-shell">
        <p className="td-hero-kicker">Sovereign.OS</p>
        <h1 className="td-hero-title">Healing isn't optional. Holding onto the pain is.</h1>
        <p className="td-hero-subtitle">
          Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you. A private Baseline, structured answers, and intelligence that extends outward — without turning interpretation into fact.
        </p>
        <div className="td-hero-actions">
          <a href="https://app.defrag.app/signup" className="td-go td-go--primary">Enter Sovereign.OS</a>
          <a href="/how-it-works" className="td-go">See how it works</a>
        </div>
      </header>
      <section className="td-section td-shell">
        <p className="td-section-kicker">Why Sovereign</p>
        <h2 className="td-section-title">The product is useful before you explain an incident.</h2>
        <p className="td-section-lede">
          One text thread. A direct answer. Relevant sections. Quiet source details. Then a correction or continuation — on your terms.
        </p>
      </section>

      <section className="td-section td-shell" style={{ paddingTop: 0 }}>
        <p className="td-section-kicker">The Sovereign View</p>
        <h2 className="td-section-title">Three lenses. One private reference.</h2>
        <div className="td-card-grid">
          {VIEW_CARDS.map((c) => (
            <article key={c.label} className="td-card">
              <span className="td-card-icon" aria-hidden="true">{c.icon}</span>
              <p className="td-card-label">{c.label}</p>
              <h3 className="td-card-title">{c.title}</h3>
              <p className="td-card-body">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="td-section td-shell">
        <p className="td-spaced-text">
          <span className="highlight">Self</span> → <span className="highlight">People</span> → <span className="highlight">Systems</span>
        </p>
      </section>

      <section className="td-section td-shell" id="how-it-works">
        <p className="td-section-kicker">How Sovereign Works</p>
        <h2 className="td-section-title">From question to answer in four steps.</h2>
        <div className="td-steps">
          <div className="td-step">
            <span className="td-step-number">01</span>
            <div>
              <h3 className="td-step-title">You ask</h3>
              <p className="td-step-body">One text thread. Any question. Sovereign meets you where you are — no setup, no forms, no dashboards.</p>
            </div>
          </div>
          <div className="td-step">
            <span className="td-step-number">02</span>
            <div>
              <h3 className="td-step-title">Sovereign answers</h3>
              <p className="td-step-body">A direct answer with relevant sections and quiet source details. Not a score, not a gauge, not a sentiment calculation.</p>
            </div>
          </div>
          <div className="td-step">
            <span className="td-step-number">03</span>
            <div>
              <h3 className="td-step-title">Your Baseline grows</h3>
              <p className="td-step-body">Sovereign builds a structured Baseline from what you share — a living reference for decisions, relationships, and systems.</p>
            </div>
          </div>
          <div className="td-step">
            <span className="td-step-number">04</span>
            <div>
              <h3 className="td-step-title">You continue or correct</h3>
              <p className="td-step-body">The thread stays open. Correct the record, go deeper, or bring in a new question. Sovereign remembers what you have shared.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="td-section td-shell">
        <p className="td-section-kicker">The Intelligence</p>
        <h2 className="td-section-title">What Sovereign can do — and what it will not.</h2>
        <div className="td-qa">
          {INTELLIGENCE_QA.map((qa) => (
            <div key={qa.question} className="td-qa-item">
              <p className="td-qa-question">{qa.question}</p>
              <p className="td-qa-answer">{qa.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="td-section td-shell" style={{ paddingBottom: 0 }}>
        <div className="td-pills">
          {FEATURE_PILLS.map((p) => (
            <span key={p} className="td-pill">{p}</span>
          ))}
        </div>
      </section>

      <section className="td-shell">
        <div className="td-callout">
          <h2 className="td-section-title">Start with your Baseline.</h2>
          <p className="td-section-lede">Sovereign is text-first, private by design, and useful from the first question.</p>
          <div className="td-hero-actions" style={{ marginTop: 32 }}>
            <a href="https://app.defrag.app/signup" className="td-go td-go--primary">Enter Sovereign.OS</a>
          </div>
        </div>
      </section>

      <footer className="td-footer" style={{ marginTop: 'clamp(60px, 8vw, 100px)' }}>
        <div className="td-shell td-footer-inner">
          <a href="/" className="td-footer-wordmark">SOVEREIGN.OS</a>
          <div className="td-footer-links">
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </div>
          <p className="td-footer-copy">© {new Date().getFullYear()} Sovereign.OS</p>
        </div>
      </footer>
    </div>
  );
}
