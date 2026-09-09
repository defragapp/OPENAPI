import { useEffect, useState } from 'react';
import './template-design.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

const STEPS = [
  {
    n: '01',
    title: 'Create your account',
    body: 'Sign up with passkey-based authentication. No passwords. Your account is private from the start.',
  },
  {
    n: '02',
    title: 'Build your Baseline',
    body: 'Sovereign constructs a structured Baseline from what you choose to share — a living reference, not a diagnosis.',
  },
  {
    n: '03',
    title: 'Ask anything',
    body: 'One text thread. Any question. Sovereign returns a direct answer with relevant sections and quiet source details.',
  },
  {
    n: '04',
    title: 'Explore outward',
    body: 'Extend the same Baseline-first lens to relationships and systems. Each person stays distinct and permission-bound.',
  },
  {
    n: '05',
    title: 'Continue or correct',
    body: 'The thread stays open. Correct the record, go deeper, or bring in a new question. Your Baseline grows with you.',
  },
];

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/', label: 'Home' },
];

export default function PublicHowItWorks() {
  const [releaseSha, setReleaseSha] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'How it works — Sovereign.OS';
    fetch('/ready', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.sha && setReleaseSha(j.sha))
      .catch(() => {});
  }, []);

  return (
    <div data-page="how-it-works" data-visual-system="sovereign-template" data-release-sha={releaseSha ?? ''}>
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
            <a href="https://app.defrag.app/signup" className="td-cta td-cta--primary">Enter Sovereign.OS</a>
          </div>
          <details className="td-mobile-menu">
            <summary aria-label="Open menu"><span className="td-mobile-menu-icon" /></summary>
            <div className="td-mobile-menu-panel">
              {NAV_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
              <a href="https://app.defrag.app/signup" className="td-cta td-cta--primary">Enter Sovereign.OS</a>
            </div>
          </details>
        </div>
      </nav>

      <header className="td-hero td-shell">
        <p className="td-hero-kicker">How it works</p>
        <h1 className="td-hero-title">From question to answer in five steps.</h1>
        <p className="td-hero-subtitle">
          Sovereign is designed to be useful from the first question. No dashboards, no cards, no noise — just a direct answer and a private Baseline that grows with you.
        </p>
      </header>

      <section className="td-section td-shell">
        <div className="td-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="td-step">
              <span className="td-step-number">{s.n}</span>
              <div>
                <h3 className="td-step-title">{s.title}</h3>
                <p className="td-step-body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="td-shell">
        <div className="td-callout">
          <h2 className="td-section-title">Ready to start?</h2>
          <p className="td-section-lede">Create your account and build your Baseline today.</p>
          <div className="td-hero-actions" style={{ marginTop: 32 }}>
            <a href="https://app.defrag.app/signup" className="td-cta td-cta--primary">Enter Sovereign.OS</a>
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
