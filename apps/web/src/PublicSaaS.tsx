import React from 'react';

function Home() {
  return (
    <div className="public-home" style={{ padding: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Know yourself. Understand your people. See the whole system.</h1>
        <p>An AI that starts with you.</p>
      </header>
      <section>
        <h2>Product Overview</h2>
        <p>Baseline = A private reference built around you.</p>
        <p>Healing isn’t optional. Holding onto the pain is.</p>
      </section>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="public-how-it-works" style={{ padding: '2rem' }}>
      <h2>How It Works</h2>
      <p>Explain the SaaS workflow in simple terms.</p>
    </div>
  );
}

function Pricing() {
  return (
    <div className="public-pricing" style={{ padding: '2rem' }}>
      <h2>Pricing</h2>
      <p>Simple transparent pricing information.</p>
    </div>
  );
}

function FAQ() {
  return (
    <div className="public-faq" style={{ padding: '2rem' }}>
      <h2>FAQ</h2>
      <p>Common questions and answers.</p>
    </div>
  );
}

export function PublicSaaS() {
  const path = location.pathname;
  if (path === '/' || path === '/home') return <Home />;
  if (path === '/how-it-works') return <HowItWorks />;
  if (path === '/pricing') return <Pricing />;
  if (path === '/faq') return <FAQ />;
  return null;
}
