import { useEffect, useState } from 'react';
import './template-design.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
];

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/', label: 'Home' },
  { href: 'mailto:info@sovereign.defrag.app', label: 'Contact' },
];

interface PolicyProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function PolicyPage({ title, subtitle, children }: PolicyProps) {
  const [releaseSha, setReleaseSha] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${title} — Sovereign.OS`;
    fetch('/ready', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.sha && setReleaseSha(j.sha))
      .catch(() => {});
  }, [title]);

  return (
    <div data-page="policy" data-visual-system="sovereign-template" data-release-sha={releaseSha ?? ''}>
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
        <p className="td-hero-kicker">Legal</p>
        <h1 className="td-hero-title">{title}</h1>
        <p className="td-hero-subtitle">{subtitle}</p>
      </header>

      <section className="td-section td-shell">
        <div style={{ maxWidth: '70ch', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--td-ink-soft)' }}>
          {children}
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


export function PrivacyPolicy() {
  return (
    <PolicyPage title="Privacy Policy" subtitle="How we handle your data.">
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', marginBottom: 16 }}>Your data is yours.</h2>
      <p style={{ marginBottom: 16 }}>Sovereign.OS builds a private Baseline from what you choose to share. Your data is account-owned, generated on demand, and never retained as an export artifact.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>What we collect</h2>
      <p style={{ marginBottom: 16 }}>We collect only what you provide through the platform — your questions, your Baseline inputs, and your account credentials (passkey-based, no passwords).</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>How we use it</h2>
      <p style={{ marginBottom: 16 }}>Your data is used solely to provide the Sovereign experience. We do not sell your data. We do not use it to train third-party models.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Your rights</h2>
      <p style={{ marginBottom: 16 }}>You can export your Baseline at any time. You can delete your account and all associated data.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Contact</h2>
      <p>For privacy inquiries, contact support@sovereign.defrag.app.</p>
    </PolicyPage>
  );
}

export function TermsOfService() {
  return (
    <PolicyPage title="Terms of Service" subtitle="The rules for using Sovereign.OS.">
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', marginBottom: 16 }}>Use of the platform</h2>
      <p style={{ marginBottom: 16 }}>Sovereign.OS is a private AI platform. You must be 18 or older to use it. You are responsible for maintaining the security of your account.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>What Sovereign is not</h2>
      <p style={{ marginBottom: 16 }}>Sovereign does not diagnose, assign hidden motives, claim exact emotions, or present interpretation as deterministic proof.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Your content</h2>
      <p style={{ marginBottom: 16 }}>You retain ownership of your content. Sovereign processes it only to provide the service.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Account termination</h2>
      <p style={{ marginBottom: 16 }}>You may delete your account at any time. We may terminate accounts that violate these terms.</p>
      <h2 style={{ fontFamily: 'var(--td-display)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Contact</h2>
      <p>For legal inquiries, contact support@sovereign.defrag.app.</p>
    </PolicyPage>
  );
}

export default PolicyPage;
