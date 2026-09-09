import { useEffect, useState } from 'react';
import './template-design.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
];

const PLANS = [
  {
    name: 'Explorer',
    price: 'Free',
    cadence: 'forever',
    description: 'Get started with your Baseline and one text thread.',
    features: [
      'One text thread',
      'Direct answer with source details',
      'Private Baseline',
      'Passkey authentication',
    ],
    cta: 'Start free',
    primary: false,
  },
  {
    name: 'Sovereign',
    price: '$19',
    cadence: '/ month',
    description: 'Full access to Baseline, Alignment, and system intelligence.',
    features: [
      'Unlimited threads',
      'Baseline-first reasoning',
      'Relationship intelligence',
      'System intelligence',
      'Priority support',
    ],
    cta: 'Subscribe',
    primary: true,
  },
  {
    name: 'Covenant',
    price: '$49',
    cadence: '/ month',
    description: 'Everything in Sovereign, plus contextual Covenant reasoning.',
    features: [
      'Everything in Sovereign',
      'Covenant reasoning lens',
      'Advanced source inspection',
      'Export your Baseline',
      'Dedicated support',
    ],
    cta: 'Subscribe',
    primary: false,
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
        <p className="td-hero-kicker">Pricing</p>
        <h1 className="td-hero-title">Simple, transparent pricing.</h1>
        <p className="td-hero-subtitle">
          Start free. Upgrade when you are ready to go deeper.
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
                className={`td-cta ${p.primary ? 'td-cta--primary' : ''}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {p.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="td-shell">
        <div className="td-callout">
          <h2 className="td-section-title">Need something custom?</h2>
          <p className="td-section-lede">Reach out for team or enterprise plans.</p>
          <div className="td-hero-actions" style={{ marginTop: 32 }}>
            <a href="mailto:support@sovereign.defrag.app" className="td-cta">Contact us</a>
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
