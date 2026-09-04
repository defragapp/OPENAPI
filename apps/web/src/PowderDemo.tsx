import React from 'react';
import './powder-demo.css';

export function PowderDemo() {
  return (
    <div className="powder-app">
      <header className="powder-header">
        <div className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
          <span>SOVEREIGN.OS</span>
        </div>
        <nav className="header-nav">
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <a href="/signup" className="btn-get-started">Get started</a>
      </header>

      <main className="powder-main">
        {/* Left Pane: Marketing & Baseline Introduction */}
        <section className="powder-hero">
          <div className="try-badge">
            <span className="dot"></span> Personal Intelligence
          </div>
          <h1>Private intelligence for real life.</h1>
          <p>
            Understand yourself, your relationships, your decisions,<br />
            and the systems around you.
          </p>
          
          <form className="email-capture" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Start Free</button>
          </form>

          <div className="client-logos">
            <span className="mock-logo">YOU</span>
            <span className="mock-logo">PEOPLE</span>
            <span className="mock-logo">SYSTEMS</span>
          </div>
        </section>

        {/* Right Pane: App Interface Mockup */}
        <section className="powder-interface">
          <div className="interface-card">
            <div className="card-top-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
            </div>
            
            <div className="card-welcome">
              <h2>Your Baseline</h2>
              <p>Explore what is more relevant now.</p>
            </div>

            <div className="prompt-box">
              <input type="text" placeholder="Ask about a decision, a reaction, a relationship, or a system…" readOnly />
              <div className="prompt-tools">
                <div className="tools-left">
                  <span className="chip-indicator">You</span>
                  <span className="chip-indicator">Baseline</span>
                  <span className="chip-indicator">Context</span>
                </div>
                <div className="tools-right">
                  <button type="button" className="send-btn" aria-label="Submit prompt">↑</button>
                </div>
              </div>
            </div>

            <div className="category-filters">
              <div className="filters-left">
                <button type="button" className="active">You</button>
                <button type="button">People</button>
                <button type="button">Systems</button>
                <button type="button">Library</button>
              </div>
            </div>

            <ul className="suggestion-list">
              <li>
                <span>Why does the same conversation feel calm to them and urgent to me?</span>
                <span className="arrow">→</span>
              </li>
              <li>
                <span>How do I know whether I’m refining an idea or anticipating everyone else’s reaction?</span>
                <span className="arrow">→</span>
              </li>
              <li>
                <span>What role do I keep ending up in across this team?</span>
                <span className="arrow">→</span>
              </li>
              <li>
                <span>Where does my Baseline support taking space here?</span>
                <span className="arrow">→</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Landscape background overlay */}
      <div className="landscape-background"></div>
    </div>
  );
}

export default PowderDemo;
