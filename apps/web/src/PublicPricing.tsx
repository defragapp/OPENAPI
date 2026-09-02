import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';

const PRICING_CONTENT = {
  hero: {
    kicker: 'PRICING',
    title: 'Free: your personal Baseline Design. Sovereign+: your people, your systems, your Library.',
    subtitle: 'Free includes your complete Baseline Design and 10 Sovereign AI turns each month. Sovereign+ adds relationship and system intelligence, Library, optional Covenant exploration, and 300 turns.',
  },
  plans: {
    free: {
      tag: 'FREE',
      title: 'Your personal Baseline Design.',
      audience: 'You',
      price: '$0',
      priceNote: 'Permanent. No card required.',
      features: [
        'Complete Baseline Design',
        'Explore yourself — decisions, communication, creativity, connection, pressure, shadow and light, Alignment',
        'Today and what may be more relevant now',
        '10 Sovereign AI turns each month',
        'Review, correct, or reject any interpretation',
      ],
    },
    sovereignPlus: {
      tag: 'SOVEREIGN+',
      title: 'Your people, your systems, your Library.',
      audience: 'People + systems',
      monthlyPrice: '$20',
      monthlyNote: 'per month',
      annualPrice: '$99 / year',
      annualNote: 'One annual payment',
      features: [
        'Everything in Free',
        '300 Sovereign AI turns each month',
        'Understand another person with their permission',
        'Family, household, friendship, workplace, and team Systems',
        'Library and optional Covenant exploration',
        'Private invitations and sharing controls',
      ],
    },
  },
  comparison: [
    { label: 'Your Baseline Design', free: 'Complete Baseline Design', plus: 'Everything in Free' },
    { label: 'Sovereign AI turns', free: '10 each month', plus: '300 each month' },
    {
      label: 'People + Systems',
      free: 'Explore yourself',
      plus: 'Understand another person with their permission; explore families, households, friendships, workplaces, and teams',
    },
    { label: 'Library', free: 'Review and correct what does not fit', plus: 'Keep the understandings you want to return to' },
    { label: 'Covenant', free: 'Not included', plus: 'Optional Christian teaching and cited Scripture when you intentionally choose it' },
  ],
  billing: {
    title: 'Billing, simply',
    description: 'Stripe securely handles checkout, invoices, payment methods, and subscription changes. Sovereign+ stays active while your paid subscription is active. If paid access ends, your account stays open and returns to Free.',
  },
  support: {
    title: 'Support Sovereign.OS',
    description: 'Support is separate from a subscription. Choose any one-time amount from $1. Support does not unlock paid features or change your plan.',
    buttonText: 'Support Sovereign.OS',
    buttonHref: 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02',
  },
  cta: {
    title: 'Start with yourself.',
    description: 'No card required. Upgrade only when you want People, Systems, Library, Covenant, or more monthly use.',
    buttonText: 'Build your Baseline',
    buttonHref: '/signup',
  },
};

interface Plan {
  tag: string;
  title: string;
  audience: string;
  price?: string;
  priceNote?: string;
  monthlyPrice?: string;
  monthlyNote?: string;
  annualPrice?: string;
  annualNote?: string;
  features: string[];
}

function PriceCard({ plan, featured }: { plan: Plan; featured?: boolean }) {
  const isPlus = plan.tag === 'SOVEREIGN+';
  return (
    <article className={`price-card ${featured ? 'featured' : ''} ${plan.tag === 'SOVEREIGN+' ? 'sovereign-plus' : 'free'}`}>
      <header>
        <div>
          <span className="price-tag">{plan.tag}</span>
          <h2>{plan.title}</h2>
        </div>
        <span className="plan-audience">{plan.audience}</span>
      </header>
      <div className="price-card-body">
        <div className="price-block">
          {plan.monthlyPrice ? (
            <div className="price-options" aria-label="Sovereign+ prices">
              <p className="monthly-price"><span className="price">{plan.monthlyPrice}</span><small>{plan.monthlyNote}</small></p>
              <p className="annual-price"><span className="price-or">or</span><strong>{plan.annualPrice}</strong><small>{plan.annualNote}</small></p>
            </div>
          ) : (
            <div className="price-block">
              <p className="price">{plan.price}</p>
              <p className="price-note">{plan.priceNote}</p>
            </div>
          )}
        </div>
        <ul className="feature-list">
          {plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function PricingSection({ children, className, id, ariaLabelledBy }: { children: React.ReactNode; className?: string; id?: string; ariaLabelledBy?: string }) {
  return <section className={`pricing-section ${className ?? ''}`} id={id} aria-labelledby={ariaLabelledBy}>{children}</section>;
}

export function PublicPricing() {
  return (
    <main className="pricing-page public-page" data-visual-contract="founder-v0-static" data-route-cohesion="v1">
      <header className="public-nav">
        <div className="public-nav-inner">
          <a className="public-wordmark" href="/" aria-label="Sovereign.OS home">
            <BrandMark />
          </a>
          <nav className="public-nav-links" aria-label="Public navigation">
            <a href="/how-it-works">How it works</a>
            <a href="/pricing" aria-current="page">Pricing</a>
            <a href="/faq">FAQ</a>
          </nav>
          <div className="public-nav-actions">
            <a className="public-sign-in" href="/login">Sign in</a>
            <a className="public-cta" href="/signup">Get started <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </header>

      <main>
        <section className="pricing-hero">
          <p className="pricing-kicker sov-section-kicker">{PRICING_CONTENT.hero.kicker}</p>
          <h1 className="sov-display-hero">{PRICING_CONTENT.hero.title}</h1>
          <p>{PRICING_CONTENT.hero.subtitle}</p>
        </section>

        <PricingSection className="pricing-plans" aria-label="Sovereign.OS plans">
          <div className="pricing-grid">
            <PriceCard plan={PRICING_CONTENT.plans.free} />
            <PriceCard plan={PRICING_CONTENT.plans.sovereignPlus} featured />
          </div>
        </PricingSection>

        <PricingSection className="pricing-details" aria-labelledby="pricing-details-title">
          <header className="pricing-details-heading">
            <div>
              <p className="pricing-kicker">WHAT CHANGES WITH PLUS</p>
              <h2 id="pricing-details-title">{PRICING_CONTENT.billing.title}</h2>
            </div>
            <p>{PRICING_CONTENT.billing.description}</p>
          </header>
          <dl className="plan-comparison-list">
            {PRICING_CONTENT.comparison.map((item, index) => (
              <div key={index}>
                <dt>{item.label}</dt>
                <dd><span>Free</span>{item.free}</dd>
                <dd><span>Sovereign+</span>{item.plus}</dd>
              </div>
            ))}
          </dl>
        </PricingSection>

        <PricingSection className="billing-section">
          <div className="billing-note"><strong>{PRICING_CONTENT.billing.title}</strong><p>{PRICING_CONTENT.billing.description}</p></div>
        </PricingSection>

        <PricingSection id="support" className="support-note-section" aria-labelledby="support-pricing-title">
          <div className="support-note">
            <div>
              <p className="pricing-kicker">SUPPORT SOVEREIGN.OS</p>
              <h2 id="support-pricing-title">{PRICING_CONTENT.support.title}</h2>
              <p>{PRICING_CONTENT.support.description}</p>
            </div>
            <div className="support-links">
              <a href={PRICING_CONTENT.support.buttonHref} target="_blank" rel="noopener noreferrer">
                {PRICING_CONTENT.support.buttonText} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </PricingSection>

        <PricingSection className="pricing-cta">
          <div className="launch-callout">
            <div>
              <p className="pricing-kicker">{PRICING_CONTENT.cta.title}</p>
              <h2>{PRICING_CONTENT.cta.description}</h2>
            </div>
            <a className="public-cta" href={PRICING_CONTENT.cta.buttonHref}>
              {PRICING_CONTENT.cta.buttonText} <span aria-hidden="true">→</span>
            </a>
          </div>
        </PricingSection>
      </main>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <a className="public-footer-wordmark" href="/"><BrandMark /></a>
          <nav aria-label="Footer navigation">
            <a href="/how-it-works">How it works</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/pricing#support">Support</a>
          </nav>
          <p>© 2026 Sovereign.OS</p>
        </div>
      </footer>
    </main>
  );
}