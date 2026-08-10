import { BrandMark } from './BrandMark';
type PolicyKind = 'privacy' | 'terms';

const privacySections = [
  {
    title: 'Information you provide',
    copy: 'Sovereign.OS uses your name and email to operate your account. To build a Baseline, you may provide a birth date, birthplace, birthplace timezone, birth-time certainty, and a birth time when known. You choose the location precision used for current context.'
  },
  {
    title: 'How Baseline details are used',
    copy: 'Your birth details are used to calculate the Baseline and are not sent to the language model. Sovereign receives the plain-language themes needed for your request. Another invited account does not receive your raw birth details or exact private location.'
  },
  {
    title: 'AI requests and answers',
    copy: 'Sovereign sends only the context permitted for your question. Raw birth details, exact private location, and unrelated account history are excluded. Unsaved thread content and complete AI responses are scheduled for deletion after 30 days.'
  },
  {
    title: 'Optional Worlds video',
    copy: 'When private Worlds video is enabled and you choose to generate one, Sovereign reduces permitted Expression Field values to coarse visual instructions such as visibility, tempo, weight, thresholds, traversability, reconnection, and stability. Cloudflare AI Gateway routes those sanitized instructions to a supported third-party video model. The renderer does not receive your raw Baseline, birth details, exact private location, account identity, Basis values, conversations, or another person’s data. Sovereign proxies the generated video to your authenticated browser and does not store the video at launch; the third-party model processes the sanitized request and output under its applicable service terms.'
  },
  {
    title: 'People, relationships, and permission',
    copy: 'Adding a person to your workspace does not give you access to their Baseline. Shared comparisons require an invitation connected to that person’s account and a separate decision for each requested use. They can deny or revoke permission at any time.'
  },
  {
    title: 'What is kept and for how long',
    copy: 'Minimal security and operational metadata without conversation content may remain for up to 90 days. Understandings you explicitly save to Library remain until you delete them or close the account. Billing records are retained only as needed for subscription operation, fraud prevention, accounting, and applicable law.'
  },
  {
    title: 'Your controls',
    copy: 'You can correct a response, decide what enters Library, revoke shared-context permission, manage billing, and request account deletion with a 14-day grace period. Private account export is not available at launch. Public sharing sends only the public Sovereign.OS link.'
  }
] as const;

const termsSections = [
  {
    title: 'What Sovereign.OS provides',
    copy: 'Sovereign.OS is a private intelligence platform for understanding yourself, your relationships, and the groups around you. It uses an interpretive Baseline, permitted current context, user-confirmed information, and consented relationship or system context to form responses.'
  },
  {
    title: 'Interpretive limits',
    copy: 'The Baseline may draw on astrology, partial Human Design and Gene Keys signals, and numerology. These are symbolic interpretive frameworks, not scientifically verified psychological measurements. Sovereign.OS does not diagnose, predict, establish hidden motives, or determine what another person feels.'
  },
  {
    title: 'Worlds is illustrative',
    copy: 'Worlds is an optional visualization mode derived from your permitted Expression Field. A generated environment is an illustrative representation, not a prediction, diagnosis, emotional measurement, literal account of your life, or statement about another person. Worlds is self-only at launch.'
  },
  {
    title: 'Your judgment and safety',
    copy: 'Sovereign.OS can offer reflection, questions, and practical options, but it does not replace medical, mental-health, legal, financial, emergency, or other qualified professional support. You remain responsible for decisions made with or without the product.'
  },
  {
    title: 'Plans and usage',
    copy: 'Free is a permanent plan with Baseline, Today, Explore, and 10 Sovereign responses per UTC calendar month. Sovereign+ is $20 monthly or $99 annually and includes 300 monthly responses plus consented People, Systems, Library continuity, and the optional Covenant lens. When Worlds video is enabled, the interface shows its AI-turn cost before each generation.'
  },
  {
    title: 'Billing and cancellation',
    copy: 'Stripe manages checkout, payment methods, subscriptions, and the customer billing portal. Ending Sovereign+ returns paid features to Free without deleting your workspace. Account deletion has a 14-day grace period and cancels active subscriptions before private workspace data is removed.'
  },
  {
    title: 'Another person’s information',
    copy: 'You may not grant permission on behalf of someone else. Using another person’s Baseline requires account-bound, use-specific permission that they can deny or revoke. One person’s description is never treated as verified truth about another person’s inner state.'
  },
  {
    title: 'Covenant is optional',
    copy: 'Covenant is a separate biblical lens that activates only when you choose it. It does not establish God’s exact intent or automatically require contact, estrangement, reconciliation, forgiveness, submission, or continued exposure to harm.'
  }
] as const;

export function PublicPolicy({ kind }: { kind: PolicyKind }) {
  const privacy = kind === 'privacy';
  const sections = privacy ? privacySections : termsSections;

  return (
    <main
      className="sovereign-policy public-approved-v8 public-secondary-page"
      data-secondary-visual-contract="founder-v0-locked-v1"
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
            ? 'This page explains what the product collects, what reaches the language model or optional renderer, how long information is kept, and the choices you control.'
            : 'These terms explain the product’s interpretive limits, account and billing rules, consent requirements, and where your own judgment remains essential.'}
        </p>
        <p className="policy-effective">Effective August 9, 2026</p>
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