import React from "react";
import "./powder.css";

export function PowderLanding() {
  return (
    <div className="powder-wrapper">
      {/* Abstract fuzzy landscape background */}
      <div className="powder-bg-landscape" />

      <header className="powder-header">
        <div className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
        </div>
        <nav className="header-nav">
          <a href="#about">About</a>
          <a href="#changelog">Changelog</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
        </nav>
        <button className="header-cta" type="button">Get started</button>
      </header>

      <main className="powder-layout">
        {/* Left Pane: Hero & Lead Gen */}
        <section className="powder-left">
          <div className="powder-badge">
            <span className="pulse-dot"></span> Try Powder
          </div>
          
          <h1 className="powder-title">Get a demo</h1>
          
          <p className="powder-subtitle">
            See how Powder can help you today<br/>
            (it might just blow your mind a little)
          </p>
          
          <form className="powder-email-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="What's your work email?" 
              className="powder-input"
            />
            <button type="submit" className="powder-submit">Submit</button>
          </form>

          <div className="powder-logos">
            <div className="client-logo mock-figma">Figma</div>
            <div className="client-logo mock-logoipsum">logoipsum</div>
            <div className="client-logo mock-maze">Maze</div>
            <div className="client-logo mock-cubes">Linear</div>
          </div>
        </section>

        {/* Right Pane: App Interface Mockup */}
        <section className="powder-right">
          <div className="powder-app-card">
            <div className="app-card-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
            </div>
            
            <div className="app-welcome">
              <h2>Welcome back</h2>
              <p>How can I help you today, Alex?</p>
            </div>

            <div className="app-prompt-container">
              <input 
                type="text" 
                className="app-prompt-input" 
                placeholder="Ask anything. Type @ for mentions and / for shortcuts." 
              />
              <div className="app-prompt-toolbar">
                <div className="toolbar-left">
                  <span>📎</span>
                  <span>📊</span>
                  <span>⚡</span>
                </div>
                <div className="toolbar-right">
                  <button className="mic-btn" type="button" aria-label="Microphone input">🎙️</button>
                  <button className="send-btn" type="submit" aria-label="Send prompt">↑</button>
                </div>
              </div>
            </div>

            <div className="app-categories-row">
              <div className="app-categories">
                <button className="cat-pill active" type="button">Research</button>
                <button className="cat-pill" type="button">Support Ops</button>
                <button className="cat-pill" type="button">Writing</button>
                <button className="cat-pill" type="button">Actions</button>
              </div>
              <button className="search-btn" type="button" aria-label="Search">🔍</button>
            </div>

            <ul className="app-suggestions">
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
    </div>
  );
}
export default PowderLanding;
