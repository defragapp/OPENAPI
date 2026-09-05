import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { GlassCard } from './GlassCard';
import { PillBadge } from './PillBadge';
import { PrimaryButton } from './PrimaryButton';

const PRICING_CONTENT = {
  hero: {
    kicker: 'PRICING · KNOW YOURSELF. UNDERSTAND YOUR PEOPLE. SEE THE WHOLE SYSTEM.',
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
        'Explore yourself — decisions, communication, creativity, connection, pressure, Shadow, Gift, Alignment',
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
    description: 'Know yourself. Understand your people. See the whole system. No card required. Upgrade only when you want People, Systems, Library, Covenant, or more monthly use.',
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
    <GlassCard className={`price-card ${featured ? 'featured border-white/20 bg-white/[0.04]' : ''} ${isPlus ? 'sovereign-plus' : 'free'} p-8`}>
      <header className="flex justify-between items-start mb-6">
        <div>
          <PillBadge variant={isPlus ? 'powder' : 'default'} className="mb-2">{plan.tag}</PillBadge>
          <h2 className="text-xl font-medium text-white">{plan.title}</h2>
        </div>
        <span className="plan-audience text-xs text-neutral-400 font-mono">{plan.audience}</span>
      </header>
      <div className="price-card-body">
        <div className="price-block mb-6">
          {plan.monthlyPrice ? (
            <div className="price-options" aria-label="Sovereign+ prices">
              <p className="monthly-price"><span className="price text-3xl font-medium text-white">{plan.monthlyPrice}</span> <small className="text-neutral-400">{plan.monthlyNote}</small></p>
              <p className="annual-price text-sm text-neutral-300 mt-1"><span className="price-or text-neutral-500 mr-1">or</span><strong>{plan.annualPrice}</strong> <small className="text-neutral-400">{plan.annualNote}</small></p>
            </div>
          ) : (
            <div className="price-block">
              <p className="price text-3xl font-medium text-white">{plan.price}</p>
              <p className="price-note text-sm text-neutral-400">{plan.priceNote}</p>
            </div>
          )}
        </div>
        <ul className="feature-list space-y-2 mb-6 text-sm text-neutral-300">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-amber-400">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <PrimaryButton href={isPlus ? '/signup?plan=sovereign_plus' : '/signup'} variant={isPlus ? 'powder' : 'primary'} className="w-full">
          {isPlus ? 'Upgrade to Plus →' : 'Start free'}
        </PrimaryButton>
      </div>
    </GlassCard>
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="pricing-hero text-center mb-16 flex flex-col items-center">
          <PillBadge variant="powder" className="mb-6">
            TRANSPARENT PRICING
          </PillBadge>
          <p className="pricing-kicker sov-section-kicker text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4">{PRICING_CONTENT.hero.kicker}</p>
          <h1 className="sov-display-hero text-4xl sm:text-6xl font-medium tracking-tight text-white max-w-4xl leading-tight mb-6">{PRICING_CONTENT.hero.title}</h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl leading-relaxed">{PRICING_CONTENT.hero.subtitle}</p>
        </section>

        <PricingSection className="pricing-plans mb-20" aria-label="Sovereign.OS plans">
          <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 gap-8">
            <PriceCard plan={PRICING_CONTENT.plans.free} />
            <PriceCard plan={PRICING_CONTENT.plans.sovereignPlus} featured />
          </div>
        </PricingSection>

        <PricingSection className="pricing-details mb-20" aria-labelledby="pricing-details-title">
          <GlassCard className="p-8 sm:p-10">
            <header className="pricing-details-heading mb-8">
              <div>
                <PillBadge variant="default" className="mb-3">WHAT CHANGES WITH PLUS</PillBadge>
                <h2 id="pricing-details-title" className="text-2xl sm:text-3xl font-medium text-white tracking-tight mb-4">
                  Your Baseline Design stays yours. Plus expands what you can explore.
                </h2>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">Free is for exploring yourself. Sovereign+ lets you understand another person with their permission, step back to see a family or team, keep what matters in Library, and ask more each month.</p>
            </header>
            <dl className="plan-comparison-list divide-y divide-white/10">
              {PRICING_CONTENT.comparison.map((item, index) => (
                <div key={index} className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <dt className="font-medium text-white text-sm">{item.label}</dt>
                  <dd className="text-neutral-400 text-sm"><span className="text-xs font-mono text-neutral-500 block md:hidden mb-1">Free</span>{item.free}</dd>
                  <dd className="text-neutral-300 text-sm font-medium"><span className="text-xs font-mono text-neutral-500 block md:hidden mb-1">Sovereign+</span>{item.plus}</dd>
                </div>
              ))}
            </dl>
          </GlassCard>
        </PricingSection>

        <PricingSection className="billing-section mb-16">
          <GlassCard className="p-6 sm:p-8">
            <div className="billing-note flex flex-col sm:flex-row gap-4 items-start">
              <strong className="text-white font-medium whitespace-nowrap text-lg">{PRICING_CONTENT.billing.title}:</strong>
              <p className="text-neutral-400 text-sm leading-relaxed">{PRICING_CONTENT.billing.description}</p>
            </div>
          </GlassCard>
        </PricingSection>

        <PricingSection id="support" className="support-note-section mb-16" aria-labelledby="support-pricing-title">
          <GlassCard className="p-8 sm:p-10">
            <div className="support-note flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <PillBadge variant="default" className="mb-3">SUPPORT SOVEREIGN.OS</PillBadge>
                <h2 id="support-pricing-title" className="text-2xl font-medium text-white mb-2">{PRICING_CONTENT.support.title}</h2>
                <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">{PRICING_CONTENT.support.description}</p>
              </div>
              <div className="support-links shrink-0">
                <PrimaryButton href={PRICING_CONTENT.support.buttonHref} target="_blank" rel="noopener noreferrer" variant="powder">
                  {PRICING_CONTENT.support.buttonText} <span aria-hidden="true">→</span>
                </PrimaryButton>
              </div>
            </div>
          </GlassCard>
        </PricingSection>

        <PricingSection className="pricing-cta my-16 text-center">
          <GlassCard className="launch-callout p-10 sm:p-14 flex flex-col items-center">
            <div className="flex flex-col items-center mb-6">
              <p className="pricing-kicker text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">{PRICING_CONTENT.cta.title}</p>
              <h2 className="text-2xl sm:text-4xl font-medium text-white max-w-xl leading-tight">{PRICING_CONTENT.cta.description}</h2>
            </div>
            <PrimaryButton href={PRICING_CONTENT.cta.buttonHref} variant="powder">
              {PRICING_CONTENT.cta.buttonText} <span aria-hidden="true">→</span>
            </PrimaryButton>
          </GlassCard>
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