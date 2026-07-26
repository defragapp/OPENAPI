type PolicyKind = 'privacy' | 'terms';

const privacySections = [
  {
    title: 'What the workspace handles',
    copy: 'Sovereign.OS processes account details, reduced Baseline context, location-precision choices, consent decisions, AI requests routed through Cloudflare, Stripe billing status, and the understandings you deliberately save.'
  },
  {
    title: 'What stays outside the language model',
    copy: 'Raw birth input and exact private location stay inside the private computation boundary. They are not sent to the language model or exposed to another invited account.'
  },
  {
    title: 'What is retained',
    copy: 'Unsaved thread content and complete AI responses are scheduled for deletion after 30 days. Minimal non-content security and operational metadata may remain for up to 90 days. Saved Library items remain until you delete them or close the account.'
  },
  {
    title: 'What you control',
    copy: 'You can correct an answer, choose what enters Library, revoke consent, manage billing, and request account deletion. Private account export is not available at launch; public sharing never includes private workspace data.'
  }
] as const;

const termsSections = [
  {
    title: 'A tool, not a verdict',
    copy: 'Sovereign.OS is non-diagnostic software. It does not establish another person’s motive, mental state, future behavior, or God’s exact intent. You remain responsible for your decisions and for seeking qualified support when appropriate.'
  },
  {
    title: 'Plans and usage',
    copy: 'Free is a permanent plan with Baseline, Today, Explore, and 10 Sovereign AI turns per UTC calendar month. Sovereign+ is $20 monthly or $99 annually and includes 300 monthly AI turns plus consented People, Systems, Library continuity, and the optional Covenant lens.'
  },
  {
    title: 'Permission before shared context',
    copy: 'Invited-person information requires identity-bound, scope-specific consent. A person may deny or revoke a requested use. Sovereign does not treat one account’s description as certainty about another person.'
  },
  {
    title: 'Billing and cancellation',
    copy: 'Stripe manages checkout, payment methods, subscriptions, and the billing portal. Ending Sovereign+ returns paid features to Free without deleting the workspace.'
  },
  {
    title: 'Covenant remains optional',
    copy: 'Covenant is an explicit biblical lens. It never automatically requires contact, estrangement, reconciliation, forgiveness, submission, or continued exposure to harm.'
  }
] as const;

export function PublicPolicy({ kind }: { kind: PolicyKind }) {
  const privacy = kind === 'privacy';
  const sections = privacy ? privacySections : termsSections;

  return (
    <main className="sovereign-policy">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home">
          <span className="landing-mark" aria-hidden="true">S</span>
          <span>SOVEREIGN.OS</span>
        </a>
        <nav aria-label="Public navigation">
          <a href="/how-it-works.html">How it works</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/faq.html">FAQ</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Start free</a>
        </nav>
      </header>

      <section className="policy-hero">
        <p className="landing-kicker"><span /> {privacy ? 'PRIVACY' : 'TERMS'}</p>
        <h1>{privacy ? 'Your private context stays yours.' : 'Clear terms for a private workspace.'}</h1>
        <p>
          {privacy
            ? 'The product is designed to reduce what reaches AI, keep permission visible, and make saved understanding a deliberate choice.'
            : 'These terms explain what Sovereign does, what it does not claim, how access works, and where your own judgment remains essential.'}
        </p>
        <p className="policy-effective">Effective July 26, 2026</p>
      </section>

      <section className="policy-grid" aria-label={privacy ? 'Privacy details' : 'Terms details'}>
        {sections.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h2>{section.title}</h2><p>{section.copy}</p></div>
          </article>
        ))}
      </section>

      <section className="policy-contact">
        <div>
          <p className="landing-kicker"><span /> QUESTIONS OR REQUESTS</p>
          <h2>Contact the Sovereign.OS team.</h2>
          <p>Privacy requests, account questions, billing concerns, and safety feedback can be sent to support@defrag.app.</p>
        </div>
        <a className="landing-button landing-button-primary" href="mailto:support@defrag.app">Email support</a>
      </section>

      <footer className="landing-footer">
        <span>Private by default · Permission before sharing · Open to correction</span>
        <nav aria-label="Footer navigation">
          <a aria-current={privacy ? 'page' : undefined} href="/privacy">Privacy</a>
          <a aria-current={!privacy ? 'page' : undefined} href="/terms">Terms</a>
          <a href="/pricing.html">Pricing</a>
        </nav>
      </footer>
    </main>
  );
}
