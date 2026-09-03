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
          <a href="/how-it-works">About</a>
          <a href="/pricing">Changelog</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">Blog</a>
        </nav>
        <a href="/signup" className="btn-get-started">Get started</a>
      </header>

      <main className="powder-main">
        {/* Left Pane: Marketing & Lead Gen */}
        <section className="powder-hero">
          <div className="try-badge">
            <span className="dot"></span> Try Powder
          </div>
          <h1>Get a demo</h1>
          <p>
            See how Sovereign.OS can help you today<br />
            (it might just blow your mind a little)
          </p>
          
          <form className="email-capture" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="What's your work email?" required />
            <button type="submit">Submit</button>
          </form>

          <div className="client-logos">
            <span className="mock-logo">logoipsum</span>
            <span className="mock-logo">◎</span>
            <span className="mock-logo">⬡</span>
          </div>
        </section>

        {/* Right Pane: App Interface Mockup */}
        <section className="powder-interface">
          <div className="interface-card">
            <div className="card-top-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
            </div>
            
            <div className="card-welcome">
              <h2>Welcome back</h2>
              <p>How can I help you today, Alex?</p>
            </div>

            <div className="prompt-box">
              <input type="text" placeholder="Ask anything. Type @ for mentions and / for shortcuts." readOnly />
              <div className="prompt-tools">
                <div className="tools-left">
                  <button type="button" aria-label="Attachment">📎</button>
                  <button type="button" aria-label="Analytics">📊</button>
                  <button type="button" aria-label="Quick Actions">⚡</button>
                </div>
                <div className="tools-right">
                  <button type="button" aria-label="Microphone">🎙️</button>
                  <button type="button" className="send-btn" aria-label="Submit prompt">↑</button>
                </div>
              </div>
            </div>

            <div className="category-filters">
              <div className="filters-left">
                <button type="button" className="active">Research</button>
                <button type="button">Support Ops</button>
                <button type="button">Writing</button>
                <button type="button">Actions</button>
              </div>
              <button type="button" className="search-icon" aria-label="Search">🔍</button>
            </div>

            <ul className="suggestion-list">
              <li>
                <span>Summarize our product in simple terms for new users</span>
                <span className="arrow">→</span>
              </li>
              <li>
                <span>Draft a friendly support reply using our help docs</span>
                <span className="arrow">→</span>
              </li>
              <li>
                <span>Write a concise follow-up email after a sales call</span>
                <span className="arrow">→</span>
              </li>
              <li>
                <span>Extract action items and owners from this meeting note</span>
                <span className="arrow">→</span>
              </li>
              <li className="faded">
                <span>Find the exact policy that covers...</span>
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
