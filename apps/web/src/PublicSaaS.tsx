import React from 'react';

function Nav() {
  return (
    <nav className="sov-nav">
      <a href="/" className="sov-nav-brand">✦ Sovereign</a>
      <div className="sov-nav-links">
        <a href="/how-it-works">How it works</a>
        <a href="/pricing">Pricing</a>
        <a href="/faq">FAQ</a>
        <a href="/login" className="sov-btn sov-btn-ghost sov-btn-sm">Sign in</a>
        <a href="/signup" className="sov-btn sov-btn-primary sov-btn-sm">Get started</a>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="sov-footer">
      <p>Built on Cloudflare Workers · D1 · Workers AI · NASA JPL Horizons</p>
      <p className="sov-footer-links">
        <a href="/about">About</a> · <a href="/faq">FAQ</a> · <a href="/login">Sign in</a> · <a href="/signup">Get started</a>
      </p>
    </footer>
  );
}

function Home() {
  return (
    <div className="sov-page">
      <Nav />
      <section className="sov-hero">
        <h1>Know yourself. <span className="sov-gradient">Understand your design.</span></h1>
        <p className="sov-hero-sub">
          Input your natal data and chat with AI grounded in your unique blueprint.
          Sovereign turns your birth chart into a living conversation.
        </p>
        <div className="sov-hero-cta">
          <a href="/signup" className="sov-btn sov-btn-primary sov-btn-lg">Start free</a>
          <a href="/how-it-works" className="sov-btn sov-btn-ghost sov-btn-lg">Learn more</a>
        </div>
      </section>

      <section className="sov-section">
        <h2>How it works</h2>
        <div className="sov-feature-grid">
          <div className="sov-card">
            <div className="sov-card-icon">🌟</div>
            <h3>Input your natal data</h3>
            <p>Enter your birth date, time, and location. We fetch ephemeris data from NASA JPL Horizons to build your Baseline.</p>
          </div>
          <div className="sov-card">
            <div className="sov-card-icon">🤖</div>
            <h3>AI grounded in your chart</h3>
            <p>Every conversation is contextualized with your blueprint. The AI understands your design, not just your question.</p>
          </div>
          <div className="sov-card">
            <div className="sov-card-icon">💬</div>
            <h3>Threaded conversations</h3>
            <p>Save and revisit readings. Each thread maintains full context of your ongoing exploration.</p>
          </div>
          <div className="sov-card">
            <div className="sov-card-icon">🔒</div>
            <h3>Private &amp; secure</h3>
            <p>Your data stays on Cloudflare's edge. Magic-link auth, HttpOnly sessions, no third-party tracking.</p>
          </div>
          <div className="sov-card">
            <div className="sov-card-icon">⚡</div>
            <h3>Edge-native performance</h3>
            <p>Everything runs on Cloudflare's global network — AI responses stream in real-time from the nearest data center.</p>
          </div>
          <div className="sov-card">
            <div className="sov-card-icon">💳</div>
            <h3>Simple tiered pricing</h3>
            <p>Free tier with 10 AI turns/month. Upgrade to Sovereign+ for 300 turns and unlimited threads.</p>
          </div>
        </div>
      </section>

      <section className="sov-section">
        <h2>Pricing</h2>
        <div className="sov-pricing-grid">
          <div className="sov-pricing-card">
            <h3>Free</h3>
            <div className="sov-price">$0<span>/mo</span></div>
            <ul>
              <li>10 AI turns per month</li>
              <li>3 chat threads</li>
              <li>Natal data intake</li>
              <li>Community support</li>
            </ul>
            <a href="/signup" className="sov-btn sov-btn-ghost sov-btn-block">Get started</a>
          </div>
          <div className="sov-pricing-card sov-pricing-featured">
            <div className="sov-badge">Most popular</div>
            <h3>Sovereign+</h3>
            <div className="sov-price">$20<span>/mo</span></div>
            <ul>
              <li>300 AI turns per month</li>
              <li>Unlimited chat threads</li>
              <li>Streaming responses</li>
              <li>Priority support</li>
            </ul>
            <a href="/signup" className="sov-btn sov-btn-primary sov-btn-block">Start Sovereign+</a>
          </div>
          <div className="sov-pricing-card">
            <h3>Sovereign+ Annual</h3>
            <div className="sov-price">$200<span>/yr</span></div>
            <ul>
              <li>Everything in Sovereign+</li>
              <li>2 months free</li>
              <li>3600 AI turns per year</li>
              <li>Priority support</li>
            </ul>
            <a href="/signup" className="sov-btn sov-btn-ghost sov-btn-block">Save with annual</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="sov-page">
      <Nav />
      <div className="sov-content">
        <h1>How it works</h1>
        <p>Sovereign is an AI platform that contextualizes conversations with your natal blueprint — the unique pattern of planetary positions at the moment and location of your birth.</p>

        <h2>1. Create your account</h2>
        <p>Sign up with your email. We send a magic link — no password to remember or leak. Click it and you're in.</p>

        <h2>2. Enter your natal data</h2>
        <p>Provide your birth date, time, and location. Sovereign fetches precise ephemeris data from NASA JPL Horizons to calculate the planetary positions at your birth moment. This becomes your <strong>Baseline</strong> — stored in D1 and bound to your account.</p>

        <h2>3. Chat with AI grounded in your chart</h2>
        <p>When you start a conversation, your Baseline is injected into the AI's system context. The model doesn't just answer your questions — it answers them through the lens of your unique design. Every response is personal, not generic.</p>

        <h2>4. Threaded conversations</h2>
        <p>Each conversation is saved as a thread. Revisit past readings, continue ongoing explorations, or start fresh. Threads auto-clean after 30 days of inactivity.</p>

        <h2>5. Upgrade when you're ready</h2>
        <p>Free tier gives you 10 AI turns per month. Upgrade to Sovereign+ for 300 turns, unlimited threads, and streaming responses. Manage your subscription through the Stripe customer portal.</p>

        <div className="sov-content-cta">
          <a href="/signup" className="sov-btn sov-btn-primary sov-btn-lg">Start free</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Pricing() {
  return (
    <div className="sov-page">
      <Nav />
      <section className="sov-section">
        <h2>Pricing</h2>
        <div className="sov-pricing-grid">
          <div className="sov-pricing-card">
            <h3>Free</h3>
            <div className="sov-price">$0<span>/mo</span></div>
            <ul>
              <li>10 AI turns per month</li>
              <li>3 chat threads</li>
              <li>Natal data intake</li>
              <li>Community support</li>
            </ul>
            <a href="/signup" className="sov-btn sov-btn-ghost sov-btn-block">Get started</a>
          </div>
          <div className="sov-pricing-card sov-pricing-featured">
            <div className="sov-badge">Most popular</div>
            <h3>Sovereign+</h3>
            <div className="sov-price">$20<span>/mo</span></div>
            <ul>
              <li>300 AI turns per month</li>
              <li>Unlimited chat threads</li>
              <li>Streaming responses</li>
              <li>Priority support</li>
            </ul>
            <a href="/signup" className="sov-btn sov-btn-primary sov-btn-block">Start Sovereign+</a>
          </div>
          <div className="sov-pricing-card">
            <h3>Sovereign+ Annual</h3>
            <div className="sov-price">$200<span>/yr</span></div>
            <ul>
              <li>Everything in Sovereign+</li>
              <li>2 months free</li>
              <li>3600 AI turns per year</li>
              <li>Priority support</li>
            </ul>
            <a href="/signup" className="sov-btn sov-btn-ghost sov-btn-block">Save with annual</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function FAQ() {
  const faqs = [
    { q: 'What natal data do I need to provide?', a: 'You need your birth date, approximate birth time, and birth location (city + country). If you don\'t know your exact birth time, enter your best estimate — the AI can still work with approximate data, though house positions will be less precise.' },
    { q: 'How accurate is the ephemeris data?', a: 'Sovereign fetches planetary positions from NASA JPL Horizons, the same ephemeris system used by professional astronomers and space missions. Positions are calculated to arcsecond precision for the exact moment and coordinates of your birth.' },
    { q: 'What AI model powers the readings?', a: 'Sovereign uses Workers AI models on Cloudflare\'s global network, routed through an AI Gateway. The model receives your natal blueprint as system context, so every response is grounded in your specific chart.' },
    { q: 'How do the AI turns work?', a: 'Each message you send counts as one AI turn. Free accounts get 10 turns per month. Sovereign+ subscribers get 300 turns per month (or 3600 per year on annual). Turns reset monthly.' },
    { q: 'Are my conversations private?', a: 'Yes. Your data lives in a Cloudflare D1 database tied to your account. Conversations are not shared with third parties. Threads auto-delete after 30 days of inactivity. You can manually remove any thread.' },
    { q: 'Can I edit my natal data after signing up?', a: 'Yes — you can update your birth information at any time from the onboarding page. Your Baseline will be recalculated on the next AI interaction.' },
    { q: 'What happens when I cancel my subscription?', a: 'You keep Sovereign+ features until the end of your billing period. After that, your account reverts to the free tier. Your natal data and threads are preserved.' },
    { q: 'Do I need to know astrology to use this?', a: 'No. Sovereign translates technical data into plain-language insights. You ask in natural language, and the AI responds grounded in your chart.' },
    { q: 'Is this a replacement for a professional astrologer?', a: 'No. Sovereign is a tool for exploration and self-reflection. It\'s not medical, psychological, or financial advice.' },
    { q: 'How do I get support?', a: 'Email info@sovereign.defrag.app. Sovereign+ subscribers receive priority response.' },
  ];

  return (
    <div className="sov-page">
      <Nav />
      <div className="sov-content">
        <h1>Frequently Asked Questions</h1>
        {faqs.map((faq, i) => (
          <div className="sov-faq-item" key={i}>
            <h3>{faq.q}</h3>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function About() {
  return (
    <div className="sov-page">
      <Nav />
      <div className="sov-content">
        <h1>About Sovereign</h1>
        <p>Sovereign is an AI platform that contextualizes conversations with your natal blueprint — the unique pattern of planetary positions at the moment and location of your birth. By feeding this data as context to a large language model, every reading becomes personal rather than generic.</p>

        <h2>Technology</h2>
        <ul>
          <li><strong>Cloudflare Workers</strong> — entire app runs as a single Worker on the edge</li>
          <li><strong>D1 (SQLite)</strong> — users, sessions, natal data, threads, messages</li>
          <li><strong>Workers AI</strong> — streaming LLM responses via AI Gateway</li>
          <li><strong>Durable Objects</strong> — ThreadCoordinator manages thread state</li>
          <li><strong>NASA JPL Horizons API</strong> — ephemeris data for natal chart calculation</li>
          <li><strong>Stripe</strong> — subscription billing and customer portal</li>
          <li><strong>Resend</strong> — transactional email</li>
          <li><strong>Cloudflare Turnstile</strong> — bot protection on auth forms</li>
        </ul>

        <h2>Privacy</h2>
        <p>Your data is stored in your Cloudflare account's D1 database. No data is shared with third parties. Sessions are cookie-based with HttpOnly flags. Threads auto-delete after 30 days of inactivity.</p>

        <h2>Contact</h2>
        <p>Questions? Email info@sovereign.defrag.app</p>
      </div>
      <Footer />
    </div>
  );
}

export function PublicSaaS() {
  const path = location.pathname;
  if (path === '/' || path === '/home') return <Home />;
  if (path === '/how-it-works') return <HowItWorks />;
  if (path === '/pricing') return <Pricing />;
  if (path === '/faq') return <FAQ />;
  if (path === '/about') return <About />;
  return null;
}
