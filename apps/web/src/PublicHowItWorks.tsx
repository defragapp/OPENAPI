import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';

const HOW_IT_WORKS_CONTENT = {
  hero: {
    kicker: 'HOW SOVEREIGN WORKS',
    title: 'Start with yourself. Add another person or the wider situation only when it helps.',
  },
  steps: [
    {
      number: '01',
      title: 'Ask about what you actually want to understand.',
      description: 'No special prompting required. Ask in your own words: a decision, a reaction, a recurring pattern, a family dynamic.',
    },
    {
      number: '02',
      title: 'Your Baseline gives Sovereign a consistent reference.',
      description: 'Built once from the birth details you provide. It helps Sovereign understand how you may think, decide, communicate, create, connect, respond under pressure, and grow.',
    },
    {
      number: '03',
      title: 'Add another person or the wider system only when it helps.',
      description: 'Invite someone to share their Baseline. You each choose what to share. Sovereign keeps you distinct and shows what happens between you. Expand to a family, team, or household when the wider situation matters.',
    },
    {
      number: '04',
      title: 'Get the answer first. Go deeper when you want.',
      description: 'Direct answer first. Relevant explanation second. Source details available on demand. Correction and continuation built in.',
    },
    {
      number: '05',
      title: 'Keep what changes your understanding.',
      description: 'Save insights to your Library. Return to them. They carry the context that made them useful.',
    },
  ],
  baselineExplainer: {
    title: 'Your Baseline is a private reference Sovereign can return to across self, decisions, relationships, and systems.',
    details: [
      'Calculated from your birth date, time, and place.',
      'Combines astronomical data with interpretive frameworks (astrology, partial Human Design, partial Gene Keys, numerology).',
      'Unknown birth time is supported—some facets will be unavailable or less precise.',
      'Interpretive and correctable. Not a measured psychological fact, diagnosis, or destiny claim.',
    ],
  },
  sourceDetailExplainer: {
    title: 'See the source information used for an answer when you want to inspect it.',
    details: [
      'Open "See source details" beneath any answer.',
      'Exact values include natal placements, verified aspects, partial Human Design/Gene Keys activations, numerology, and current planetary contacts.',
      'Source details support reflection. They do not prove personality or current state.',
      'Exact codes remain collapsed until you choose to inspect them.',
    ],
  },
  cta: {
    title: 'Start with yourself.',
    description: 'Build your Baseline, then explore what you want to understand next.',
    buttonText: 'Build your Baseline',
    buttonHref: '/signup',
  },
};

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={`how-section ${className ?? ''}`}>{children}</section>;
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <article className="how-step">
      <span className="step-number">{number}</span>
      <div className="step-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

function DefinitionList({ items, className }: { items: { term: string; definition: string }[]; className?: string }) {
  return (
    <dl className={`definition-list ${className ?? ''}`}>
      {items.map((item, index) => (
        <div key={index} className="definition-item">
          <dt>{item.term}</dt>
          <dd>{item.definition}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PublicHowItWorks() {
  return (
    <main className="how-page public-page" data-visual-contract="founder-v0-static" data-route-cohesion="v1">
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
            <a className="public-cta" href="/signup">Build your Baseline <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </header>

      <main>
        <section className="how-hero">
          <p className="how-kicker">{HOW_IT_WORKS_CONTENT.hero.kicker}</p>
          <h1>{HOW_IT_WORKS_CONTENT.hero.title}</h1>
        </section>

        <Section className="how-steps">
          <header className="section-header">
            <p className="section-kicker">THE FIVE STEPS</p>
            <h2>How Sovereign works</h2>
          </header>
          <div className="steps-grid">
            {HOW_IT_WORKS_CONTENT.steps.map((step) => (
              <Step key={step.number} number={step.number} title={step.title} description={step.description} />
            ))}
          </div>
        </Section>

        <Section className="baseline-explainer">
          <header className="section-header">
            <p className="section-kicker">YOUR BASELINE</p>
            <h2>{HOW_IT_WORKS_CONTENT.baselineExplainer.title}</h2>
          </header>
          <DefinitionList
            items={HOW_IT_WORKS_CONTENT.baselineExplainer.details.map((d) => ({ term: '', definition: d }))}
            className="baseline-details"
          />
        </Section>

        <Section className="source-detail-section">
          <header className="section-header">
            <p className="section-kicker">SOURCE DETAILS</p>
            <h2>{HOW_IT_WORKS_CONTENT.sourceDetailExplainer.title}</h2>
          </header>
          <DefinitionList
            items={HOW_IT_WORKS_CONTENT.sourceDetailExplainer.details.map((d) => ({ term: '', definition: d }))}
            className="source-details"
          />
        </Section>

        <section className="how-cta-section">
          <div className="cta-content">
            <h2>{HOW_IT_WORKS_CONTENT.cta.title}</h2>
            <p>{HOW_IT_WORKS_CONTENT.cta.description}</p>
            <a className="public-cta" href={HOW_IT_WORKS_CONTENT.cta.buttonHref}>
              {HOW_IT_WORKS_CONTENT.cta.buttonText} <span aria-hidden="true">→</span>
            </a>
          </div>
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