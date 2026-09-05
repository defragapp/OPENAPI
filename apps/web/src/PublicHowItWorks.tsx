import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { GlassCard } from './GlassCard';
import { PillBadge } from './PillBadge';
import { PrimaryButton } from './PrimaryButton';

const HOW_IT_WORKS_CONTENT = {
  hero: {
    kicker: 'HOW SOVEREIGN WORKS · KNOW YOURSELF. UNDERSTAND YOUR PEOPLE. SEE THE WHOLE SYSTEM.',
    title: 'Start with yourself. Add another person or the wider situation only when it helps.',
    subtitle: 'Your Baseline gives Sovereign a consistent reference for how you may think, decide, communicate, create, connect, respond under pressure, and grow.',
  },
  steps: [
    {
      number: '01',
      title: 'Explore yourself.',
      description: 'Look at how you decide, communicate, create, connect, respond under pressure, and recognize what feels aligned.',
      badge: 'SELF BASELINE',
    },
    {
      number: '02',
      title: 'See what may be more relevant now.',
      description: 'Temporary current conditions can make part of your Baseline more relevant for a limited time without defining you or determining what you will do.',
      badge: 'ACTIVE CONTEXT',
    },
    {
      number: '03',
      title: 'Understand what happens between two people.',
      description: 'When another person chooses to share, Sovereign can use both Baselines while keeping each person separate. It can show where timing, communication, pressure, or decision styles differ without pretending to know private thoughts.',
      badge: 'RELATIONAL BRIDGE',
    },
    {
      number: '04',
      title: 'See the wider system.',
      description: 'For a family, team, household, or group, Sovereign can help you see who is involved, where pressure builds, what roles keep repeating, how people respond to one another, and what may change when one person responds differently.',
      badge: 'SYSTEM DYNAMICS',
    },
    {
      number: '05',
      title: 'Get the answer first.',
      description: 'The useful answer stays primary. You can inspect source details, correct an interpretation, or continue the conversation when you want to go deeper.',
      badge: 'DIRECT ANSWERS',
    },
  ],
  baselineExplainer: {
    title: 'Your Baseline is a private reference Sovereign can return to across self, decisions, relationships, and systems.',
    details: [
      { title: 'Calculated baseline', description: 'Derived from your birth date, time, and place for deep individual resonance.' },
      { title: 'Multi-framework synthesis', description: 'Combines astronomical data with interpretive frameworks (astrology, partial Human Design, partial Gene Keys, numerology).' },
      { title: 'Flexible input precision', description: 'Unknown birth time is supported—some facets will be unavailable or less precise.' },
      { title: 'Interpretive & correctable', description: 'Designed for personal discernment and sovereign reflection, not clinical labels or destiny claims.' },
    ],
  },
  sourceDetailExplainer: {
    title: 'See the source information used for an answer when you want to inspect it.',
    details: [
      { title: 'Transparent inspection', description: 'Open "See source details" beneath any answer whenever you choose.' },
      { title: 'Exact source values', description: 'Includes natal placements, verified aspects, partial Human Design/Gene Keys activations, numerology, and current planetary contacts.' },
      { title: 'Reflective foundation', description: 'Source details support reflection. They do not prove personality or current state.' },
      { title: 'Quiet by default', description: 'Exact codes remain collapsed until you choose to inspect them.' },
    ],
  },
  cta: {
    title: 'Start with yourself.',
    description: 'Know yourself. Understand your people. See the whole system. Build your Baseline, then explore what you want to understand next.',
    buttonText: 'Build your Baseline',
    buttonHref: '/signup',
  },
};

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={`how-section ${className ?? ''}`}>{children}</section>;
}

export function PublicHowItWorks() {
  return (
    <main className="how-page public-page powder-theme" data-visual-contract="founder-v0-static" data-route-cohesion="v1">
      <header className="public-nav">
        <div className="public-nav-inner">
          <a className="public-wordmark" href="/" aria-label="Sovereign.OS home">
            <BrandMark />
          </a>
          <nav className="public-nav-links" aria-label="Public navigation">
            <a href="/how-it-works" aria-current="page">How it works</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
          </nav>
          <div className="public-nav-actions">
            <a className="public-sign-in" href="/login">Sign in</a>
            <PrimaryButton href="/signup" variant="powder">
              Build your Baseline <span aria-hidden="true">→</span>
            </PrimaryButton>
          </div>
        </div>
      </header>

      <main className="how-main-container max-w-5xl mx-auto px-6 py-12">
        <section className="how-hero text-center mb-16 flex flex-col items-center">
          <PillBadge variant="powder" className="hero-pill mb-6">
            <span className="pulse-dot" /> PERSONAL INTELLIGENCE FOR REAL LIFE
          </PillBadge>
          <p className="how-kicker text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4">{HOW_IT_WORKS_CONTENT.hero.kicker}</p>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white max-w-3xl leading-tight mb-6">{HOW_IT_WORKS_CONTENT.hero.title}</h1>
          <p className="how-hero-subtitle text-lg text-neutral-400 max-w-2xl leading-relaxed">{HOW_IT_WORKS_CONTENT.hero.subtitle}</p>
        </section>

        <Section className="how-steps mb-20">
          <header className="section-header text-center mb-12 flex flex-col items-center">
            <PillBadge variant="default" className="section-badge mb-4">THE FIVE STEPS</PillBadge>
            <h2 className="text-3xl font-medium text-white tracking-tight">How Sovereign works</h2>
          </header>
          
          <div className="timeline-container relative">
            <div className="timeline-track absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
            <div className="steps-timeline flex flex-col gap-6">
              {HOW_IT_WORKS_CONTENT.steps.map((step) => (
                <GlassCard key={step.number} className="timeline-step-card p-6 sm:p-8 relative z-10 transition-all hover:border-white/20">
                  <div className="step-card-header flex items-center justify-between mb-4">
                    <span className="step-number-badge font-mono text-xl text-neutral-400 font-medium">{step.number}</span>
                    <PillBadge variant="powder">{step.badge}</PillBadge>
                  </div>
                  <div className="step-card-body">
                    <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </Section>

        <Section className="baseline-explainer-section mb-20">
          <header className="section-header text-center mb-12 flex flex-col items-center">
            <PillBadge variant="default" className="section-badge mb-4">YOUR BASELINE</PillBadge>
            <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight max-w-2xl">{HOW_IT_WORKS_CONTENT.baselineExplainer.title}</h2>
          </header>
          <div className="explainer-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOW_IT_WORKS_CONTENT.baselineExplainer.details.map((item, idx) => (
              <GlassCard key={idx} className="explainer-card p-6 flex flex-col items-start gap-3">
                <div className="explainer-icon text-amber-400 text-lg">✦</div>
                <h4 className="text-lg font-medium text-white">{item.title}</h4>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Section className="source-detail-section mb-20">
          <header className="section-header text-center mb-12 flex flex-col items-center">
            <PillBadge variant="default" className="section-badge mb-4">SOURCE DETAILS</PillBadge>
            <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight max-w-2xl">{HOW_IT_WORKS_CONTENT.sourceDetailExplainer.title}</h2>
          </header>
          <div className="explainer-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOW_IT_WORKS_CONTENT.sourceDetailExplainer.details.map((item, idx) => (
              <GlassCard key={idx} className="explainer-card p-6 flex flex-col items-start gap-3">
                <div className="explainer-icon text-blue-400 text-lg">🔍</div>
                <h4 className="text-lg font-medium text-white">{item.title}</h4>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </Section>

        <section className="how-cta-section my-16 text-center">
          <GlassCard className="cta-glass-card p-10 sm:p-14 flex flex-col items-center">
            <div className="cta-content flex flex-col items-center">
              <PillBadge variant="powder" className="cta-pill mb-4">START FREE</PillBadge>
              <h2 className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-4">{HOW_IT_WORKS_CONTENT.cta.title}</h2>
              <p className="text-neutral-400 text-base mb-8 max-w-lg">{HOW_IT_WORKS_CONTENT.cta.description}</p>
              <PrimaryButton href={HOW_IT_WORKS_CONTENT.cta.buttonHref} variant="powder">
                {HOW_IT_WORKS_CONTENT.cta.buttonText} <span aria-hidden="true">→</span>
              </PrimaryButton>
            </div>
          </GlassCard>
        </section>
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
          </nav>
          <p>© 2026 Sovereign.OS</p>
        </div>
      </footer>
    </main>
  );
}