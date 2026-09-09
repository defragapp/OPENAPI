import { useEffect, useState } from 'react';
import './template-design.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
];

const FAQS = [
  {
    q: 'What is Sovereign.OS?',
    a: 'Sovereign.OS is an AI platform that starts with you. It builds a private Baseline from what you share and returns direct, source-backed answers — without dashboards, scores, or noise.',
  },
  {
    q: 'How is Sovereign different from ChatGPT or Claude?',
    a: 'Sovereign is Baseline-first. The product is useful before you explain an incident. It distinguishes stable facets, temporary context, observed behavior, and unknown state — and it never presents interpretation as deterministic proof.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your Baseline is private, generated on demand from account-owned data, and never retained as an export artifact. Exact source values stay server-approved.',
  },
  {
    q: 'Does Sovereign diagnose conditions?',
    a: 'No. Sovereign does not diagnose, assign hidden motives, claim exact emotions, or predict with certainty. It is a structured reference, not a clinical tool.',
  },
  {
    q: 'What can I ask Sovereign?',
    a: 'Anything. One text thread, any question. Sovereign returns a direct answer with relevant sections and quiet source details. You can continue the thread or correct the record.',
  },
  {
    q: 'How does Sovereign handle relationships and systems?',
    a: 'The same Baseline-first lens extends outward. Relationship and system intelligence keep each person distinct and permission-bound. Alignment is a structured comparison, never a score.',
  },
  {
    q: 'What is Covenant?',
    a: 'Covenant is an internal reasoning lens offered contextually. It stays beneath the primary experience until you choose to bring it forward for a specific question or thread.',
  },
  {
    q: 'How do I get started?',
    a: 'Sign up at app.defrag.app with passkey-based authentication. No passwords. Your account is private from the start.',
  },
];

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/', label: 'Home' },
  { href: 'mailto:info@sovereign.defrag.app', label: 'Contact' },
];

export default function PublicFAQ() {
  const [releaseSha, setReleaseSha] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'FAQ — Sovereign.OS';
    fetch('/ready', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.sha && setReleaseSha(j.sha))
      .catch(() => {});
  }, []);

  return (
    <div data-page="faq" data-visual-system="sovereign-template" data-release-sha={releaseSha ?? ''}>
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
        <p className="td-hero-kicker">FAQ</p>
        <h1 className="td-hero-title">Frequently asked questions.</h1>
        <p className="td-hero-subtitle">
          Everything you need to know about Sovereign.OS.
        </p>
      </header>

      <section className="td-section td-shell">
        <div className="td-faq">
          {FAQS.map((f) => (
            <details key={f.q} className="td-faq-item">
              <summary>{f.q}</summary>
              <p className="td-faq-answer">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="td-shell">
        <div className="td-callout">
          <h2 className="td-section-title">Still have questions?</h2>
          <p className="td-section-lede">Reach out or explore the platform.</p>
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
