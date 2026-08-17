export const POLICY_CONTRACT = 'sovereign-policy.v1' as const;

export const POLICY_METADATA = {
  terms: {
    version: '2026-08-17',
    path: '/terms',
    effectiveDate: 'August 17, 2026'
  },
  privacy: {
    version: '2026-08-17',
    path: '/privacy',
    effectiveDate: 'August 17, 2026'
  }
} as const;

export const PRIVACY_SECTIONS = [
  {
    title: 'Information you provide',
    copy: 'Sovereign.OS uses your name and email to create and operate your account. To build a Baseline, you may provide a birth date, birthplace, birthplace timezone, birth-time certainty, and a birth time when known. You choose whether to add temporary current context and what location precision to use. Security requests may also use privacy-safe technical evidence such as hashed IP address and user-agent values to prevent abuse and verify account access.'
  },
  {
    title: 'How Baseline details are used',
    copy: 'Your birth details are used to calculate the Baseline and remain outside language-model context. Sovereign receives only the reduced plain-language themes and approved Basis needed for the request you make. Another invited account does not receive your raw birth details or exact private location.'
  },
  {
    title: 'AI requests and answers',
    copy: 'Sovereign sends only the context permitted and needed for your question. Raw birth details, exact private location, authentication material, billing identifiers, invitation tokens, and unrelated account history are excluded from model context. Unsaved thread content and complete AI responses are scheduled for deletion after 30 days.'
  },
  {
    title: 'People, relationships, and permission',
    copy: 'Adding a person to your workspace does not give you access to their Baseline. Shared comparisons require an invitation connected to that person’s account and a separate decision for each requested use. Permission can be denied or revoked, and future relationship or system use is rechecked against the current permission state.'
  },
  {
    title: 'Cookies and local storage',
    copy: 'Sovereign uses a first-party secure session cookie to keep an authenticated account signed in. The cookie is HttpOnly, Secure, SameSite=Lax, and expires after up to 30 days unless the session is ended sooner. Local storage is used for a navigation-rail display preference. Session storage is used for temporary onboarding, plan-choice, and upgrade-continuity state. These storage mechanisms are used to operate the product, not for behavioral advertising.'
  },
  {
    title: 'Service providers',
    copy: 'Cloudflare provides application hosting, security controls including Turnstile, D1 data services, Workers AI, and AI Gateway routing. Stripe processes checkout, subscription, and billing-portal activity. Resend delivers operational email. Optional video rendering is disabled unless the product explicitly enables it; when enabled, the separate Worlds notice describes the reduced visual instructions sent to that renderer.'
  },
  {
    title: 'Tracking and advertising',
    copy: 'Sovereign.OS does not currently run behavioral-advertising pixels or third-party analytics SDKs in the public site, account flow, or private workspace, and does not sell personal information or share it for cross-context behavioral advertising. Because those activities are not currently used, browser Do Not Track or Global Privacy Control signals do not change current product behavior. If those practices change, the required controls and disclosures must be in place before they are enabled.'
  },
  {
    title: 'What is kept and for how long',
    copy: 'Minimal security and operational metadata without conversation content may remain for up to 90 days. Understandings you explicitly save to Library remain until you delete them or close the account. Policy-acceptance receipts remain with the account as an audit history. Billing records are retained only as needed for subscription operation, fraud prevention, accounting, and applicable law.'
  },
  {
    title: 'Your controls',
    copy: 'You can correct a response, decide what enters Library, revoke shared-context permission, manage billing, and request account deletion with a 14-day grace period. Private account export is not yet available in the current release. Public sharing sends only the public Sovereign.OS link.'
  },
  {
    title: 'Optional Worlds video',
    copy: 'When private Worlds video is enabled and you choose to generate one, Sovereign reduces permitted Expression Field values to coarse visual instructions such as visibility, tempo, weight, thresholds, traversability, reconnection, and stability. The renderer does not receive your raw Baseline, birth details, exact private location, account identity, Basis values, conversations, or another person’s data. Sovereign proxies the generated video to your authenticated browser and does not store the video at launch.'
  }
] as const;

export const TERMS_SECTIONS = [
  {
    title: 'What Sovereign.OS provides',
    copy: 'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the groups around you. It uses an interpretive Baseline, permitted current context, user-confirmed information, and consented relationship or system context to form responses.'
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
    copy: 'Stripe manages checkout, payment methods, subscriptions, and the customer billing portal. Sovereign+ access is enabled only from the server-confirmed Stripe subscription state. Ending Sovereign+ returns paid features to Free without deleting your workspace. Account deletion has a 14-day grace period and cancels active subscriptions before private workspace data is removed.'
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

export function policyHashPayload(): string {
  return JSON.stringify({
    contract: POLICY_CONTRACT,
    terms: POLICY_METADATA.terms,
    privacy: POLICY_METADATA.privacy,
    privacySections: PRIVACY_SECTIONS,
    termsSections: TERMS_SECTIONS
  });
}

export const POLICY_CONTENT_HASH = 'fa4258363c34fa6e6f735dd9045f32b302106d4a8cd583de4519f3d6a135197e' as const;
