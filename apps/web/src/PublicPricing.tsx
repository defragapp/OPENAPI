import { useEffect, useState } from 'react';
import './template-design.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'Permanent. No card required.',
    description: 'Free: your personal Baseline Design.',
    features: [
      'Complete Baseline Design',
      'Explore yourself — decisions, communication, creativity, connection, pressure, Shadow, Gift, Alignment',
      'Today and what may be more relevant now',
      '10 Sovereign AI turns each month',
      'Review, correct, or reject any interpretation',
    ],
    cta: 'Build your Baseline',
    primary: false,
  },
  {
    name: 'Sovereign+',
    price: '$20',
    cadence: 'per month — or $99 / year, one annual payment',
    description: 'Sovereign+: your people, your systems, your Library.',
    features: [
      'Everything in Free',
      '300 Sovereign AI turns each month',
      'Understand another person with their permission',
      'Family, household, friendship, workplace, and team Systems',
      'Library and optional Covenant exploration',
      'Private invitations and sharing controls',
    ],
    cta: 'Subscribe',
    primary: true,
  },
];

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/', label: 'Home' },
];

export default function PublicPricing() {
  const [releaseSha, setReleaseSha] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Pricing — Sovereign.OS';
    fetch('/ready', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.sha && setReleaseSha(j.sha))
      .catch(() => {});
  }, []);

  return (
    <div data-page="pricing" data-visual-system="sovereign-template" data-release-sha={releaseSha ?? ''}>
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
        <p className="td-hero-kicker">Pricing</p>
        <h1 className="td-hero-title">Simple, transparent pricing.</h1>
        <p className="td-hero-subtitle">
          Free includes your complete Baseline Design and 10 Sovereign AI turns each month. Sovereign+ adds
          relationship and system intelligence, Library, optional Covenant exploration, and 300 turns.
        </p>
      </header>

      <section className="td-section td-shell">
        <div className="td-card-grid">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className="td-card"
              style={p.primary ? { borderColor: 'var(--td-clay-line)', background: 'var(--td-surface-raised)' } : undefined}
            >
              <p className="td-card-label">{p.name}</p>
              <h3 className="td-card-title" style={{ fontSize: '2rem', marginBottom: 4 }}>
                {p.price}
                <span style={{ fontSize: '0.9rem', color: 'var(--td-muted)', fontWeight: 400 }}>{p.cadence}</span>
              </h3>
              <p className="td-card-body" style={{ marginBottom: 24 }}>{p.description}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12, marginBottom: 32 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.9rem', color: 'var(--td-ink-soft)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--td-clay)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://app.defrag.app/signup"
                className={`td-go ${p.primary ? 'td-go--primary' : ''}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {p.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="td-section td-shell">
        <p className="td-section-kicker">Billing, simply</p>
        <h2 className="td-section-title">Stripe securely handles checkout, invoices, payment methods, and subscription changes.</h2>
        <p className="td-section-lede">
          Sovereign+ stays active while your paid subscription is active. If paid access ends, your account stays
          open and returns to Free. Support is separate from a subscription. Choose any one-time amount from $1.
          Support does not unlock paid features or change your plan.
        </p>
        <div className="td-hero-actions" style={{ marginTop: 32 }}>
          <a href="https://app.defrag.app/signup" className="td-go td-go--primary">Build your Baseline</a>
          <a href="mailto:support@sovereign.defrag.app" className="td-go">Contact support</a>
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
