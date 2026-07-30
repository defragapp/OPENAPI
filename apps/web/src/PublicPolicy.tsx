type PolicyKind = 'privacy' | 'terms';

const privacySections = [
  {
    title: 'Information you provide',
    copy: 'Sovereign.OS uses your name and email to operate your account. To build a Baseline, you may provide a birth date, birthplace, birthplace timezone, birth-time certainty, and a birth time when known. You choose the location precision used for temporary current context.'
  },
  {
    title: 'How your Baseline is created',
    copy: 'Your birth details are used to calculate the Baseline and are not sent to the language model. Sovereign receives only the reduced, plain-language context needed for your request. Another account never receives your raw birth details or exact private location.'
  },
  {
    title: 'What reaches the AI model',
    copy: 'Sovereign sends only the information permitted for the current question. Raw birth details, exact private location, and unrelated account history are excluded. Unsaved thread content and complete AI responses are scheduled for deletion after 30 days.'
  },
  {
    title: 'People, relationships, and permission',
    copy: 'Adding a person to your workspace does not give you access to their Baseline. Shared comparisons require an invitation connected to that person’s account and a separate choice for each requested permission. They can deny or revoke permission at any time.'
  },
  {
    title: 'What is kept and for how long',
    copy: 'Minimal security and operational metadata without conversation content may remain for up to 90 days. Insights you explicitly save to Library remain until you delete them or close the account. Billing records are retained only as needed for subscription operation, fraud prevention, accounting, and applicable law.'
  },
  {
    title: 'Your controls',
    copy: 'You can correct a response, decide what enters Library, revoke shared permission, manage billing, and request account deletion with a 14-day grace period. Private account export is not available at launch. Public sharing sends only the public Sovereign.OS link.'
  }
] as const;

const termsSections = [
  {
    title: 'What Sovereign.OS provides',
    copy: 'Sovereign.OS is a private AI for understanding yourself, a decision, a relationship, or a group. It uses an interpretive Baseline, optional temporary current context, information you confirm, and permission-based relationship or group context to form responses.'
  },
  {
    title: 'Interpretive limits',
    copy: 'The Baseline may draw on astrology, partial Human Design and Gene Keys signals, and numerology. These are symbolic interpretive frameworks, not scientifically verified psychological measurements. Sovereign.OS does not diagnose, predict, establish hidden motives, or determine what another person feels.'
  },
  {
    title: 'Your judgment and safety',
    copy: 'Sovereign.OS can offer reflection, questions, and practical options, but it does not replace medical, mental-health, legal, financial, emergency, or other qualified professional support. You remain responsible for decisions made with or without the product.'
  },
  {
    title: 'Plans and usage',
    copy: 'Free is a permanent plan with Baseline, Today, Explore, and 10 Sovereign AI turns per UTC calendar month. Sovereign+ is $20 monthly or $99 annually and includes 300 monthly turns plus permission-based People, Systems, saved Library insights, and optional Covenant.'
  },
  {
    title: 'Billing and cancellation',
    copy: 'Stripe manages checkout, payment methods, subscriptions, and the customer billing portal. Ending Sovereign+ returns paid features to Free without deleting your workspace. Account deletion has a 14-day grace period and cancels active subscriptions before private workspace data is removed.'
  },
  {
    title: 'Another person’s information',
    copy: 'You may not grant permission on behalf of someone else. Using another person’s Baseline requires account-bound, use-specific permission that they can deny or revoke. One person’s description is never treated as verified truth about another person’s private experience.'
  },
  {
    title: 'Covenant is optional',
    copy: 'Covenant is a separate Christian Scripture perspective that activates only when you choose it. It does not establish God’s exact intent or automatically require contact, estrangement, reconciliation, forgiveness, submission, or continued exposure to harm.'
  }
] as const;

export function PublicPolicy({ kind }: { kind: PolicyKind }) {
  const privacy = kind === 'privacy';
  const sections = privacy ? privacySections : termsSections;

  return (
    <main className="sovereign-policy">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home"><span aria-hidden="true" /><strong>SOVEREIGN.OS</strong></a>
        <nav aria-label="Public navigation">
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">Questions</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Build my Baseline</a>
        </nav>
      </header>

      <section className="policy-hero">
        <p className="landing-kicker"><span /> {privacy ? 'PRIVACY' : 'TERMS'}</p>
        <h1>{privacy ? 'What Sovereign.OS collects, uses, and keeps.' : 'The rules and limits for using Sovereign.OS.'}</h1>
        <p>
          {privacy
            ? 'See what information you provide, what reaches the AI model, how long information is kept, and which choices you control.'
            : 'See how interpretation, billing, consent, safety, and your own judgment are handled.'}
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
          <h2>Contact a person.</h2>
          <p>Send privacy requests, account questions, billing concerns, public inquiries, or safety feedback to info@defrag.app.</p>
        </div>
        <a className="landing-button landing-button-primary" href="mailto:info@defrag.app">Email Sovereign.OS</a>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Private AI for personal, relationship, and group questions</span>
        <nav aria-label="Footer navigation">
          <a aria-current={privacy ? 'page' : undefined} href="/privacy">Privacy</a>
          <a aria-current={!privacy ? 'page' : undefined} href="/terms">Terms</a>
          <a href="/pricing">Pricing</a>
          <a href="mailto:info@defrag.app">Contact</a>
        </nav>
      </footer>
    </main>
  );
}