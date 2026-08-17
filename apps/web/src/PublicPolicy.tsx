import { BrandMark } from './BrandMark';
import { POLICY_METADATA, PRIVACY_SECTIONS, TERMS_SECTIONS } from '../../../config/policies';

type PolicyKind = 'privacy' | 'terms';

export function PublicPolicy({ kind }: { kind: PolicyKind }) {
  const privacy = kind === 'privacy';
  const sections = privacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const metadata = POLICY_METADATA[kind];

  return (
    <main
      className="sovereign-policy public-approved-v8 public-secondary-page"
      data-secondary-visual-contract="founder-v0-locked-v1"
      data-policy-version={metadata.version}
    >
      <header className="v0-nav">
        <div className="v0-shell v0-nav-inner">
          <a className="v0-wordmark v0-wordmark--desktop" href="/"><BrandMark /></a>
          <a className="v0-wordmark v0-wordmark--mobile" href="/" aria-label="Sovereign.OS home">Sovereign</a>
          <nav aria-label="Public navigation">
            <a href="/how-it-works">How it works</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
          </nav>
          <div className="v0-nav-actions">
            <a className="v0-sign-in" href="/login">Sign in</a>
            <a className="landing-control landing-control--nav" href="/signup">Get started <span aria-hidden="true">→</span></a>
            <details className="v0-mobile-menu">
              <summary aria-label="Open navigation"><PolicyMenuIcon /></summary>
              <nav className="v0-mobile-menu__panel" style={{ display: 'grid' }} aria-label="Mobile navigation">
                <a href="/how-it-works">How it works</a>
                <a href="/pricing">Pricing</a>
                <a href="/faq">FAQ</a>
                <a href="/login">Sign in</a>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <section className="policy-hero">
        <p className="policy-kicker"><span />{privacy ? 'PRIVACY' : 'TERMS'}</p>
        <h1>{privacy ? 'How Sovereign.OS handles your information.' : 'Terms for using Sovereign.OS.'}</h1>
        <p>
          {privacy
            ? 'This page explains what the product collects, what reaches the language model, how long information is kept, which service providers are involved, and the choices you control.'
            : 'These terms explain the product’s interpretive limits, account and billing rules, consent requirements, and where your own judgment remains essential.'}
        </p>
        <p className="policy-effective">Effective {metadata.effectiveDate} · Version {metadata.version}</p>
      </section>

      <section className="policy-grid prose prose-invert max-w-none" aria-label={privacy ? 'Privacy details' : 'Terms details'}>
        {sections.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h2>{section.title}</h2><p>{section.copy}</p></div>
          </article>
        ))}
      </section>

      <section className="policy-contact">
        <div>
          <p className="policy-kicker"><span />QUESTIONS OR REQUESTS</p>
          <h2>Talk to a person.</h2>
          <p>Send privacy requests, account questions, billing concerns, public inquiries, or safety feedback to info@defrag.app.</p>
        </div>
        <a className="landing-control" href="mailto:info@defrag.app">Email Sovereign.OS <span aria-hidden="true">→</span></a>
      </section>

      <footer className="v0-footer">
        <div className="v0-shell">
          <a href="/" className="v0-wordmark"><BrandMark /></a>
          <nav aria-label="Footer navigation">
            <a aria-current={privacy ? 'page' : undefined} href="/privacy">Privacy</a>
            <a aria-current={!privacy ? 'page' : undefined} href="/terms">Terms</a>
            <a href="/pricing">Pricing</a>
            <a href="mailto:info@defrag.app">Contact</a>
          </nav>
          <p>© 2026 Sovereign.OS</p>
        </div>
      </footer>
    </main>
  );
}

function PolicyMenuIcon() {
  return (
    <svg className="v0-mobile-menu__icon" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
      <path d="M1 2h30M1 12h30M1 22h30" />
    </svg>
  );
}
