import React, { useState } from "react";
import "./powder.css";

interface PowderDemonstration {
  id: string;
  scope: string;
  question: string;
  answer: string;
  distinction: string;
  tags: string[];
}

const DEMONSTRATIONS: PowderDemonstration[] = [
  {
    id: "myself",
    scope: "Myself",
    question: "Why do I keep becoming the responsible one?",
    answer: "You may create direction quickly when ownership is unclear. The cost begins when your capacity becomes an obligation to carry the outcome.",
    distinction: "Leadership is not the same as responsibility for everyone involved.",
    tags: ["Self Baseline", "Ownership vs Obligation", "Capacity"]
  },
  {
    id: "reaction",
    scope: "A reaction",
    question: "Why can’t I let this go after the conversation is over?",
    answer: "The unfinished part may be less about the words and more about not knowing where the relationship stands.",
    distinction: "Wanting clarity is different from needing immediate resolution.",
    tags: ["Reaction Baseline", "Clarity vs Resolution", "Processing"]
  },
  {
    id: "decision",
    scope: "A decision",
    question: "Should I say something now or wait?",
    answer: "The choice may not be between honesty and silence. It may be between speaking while pressure is high and agreeing on a time when the message can actually land.",
    distinction: "Waiting with a return time is different from avoidance.",
    tags: ["Decision Timing", "Pressure vs Clarity", "Alignment"]
  },
  {
    id: "relationship",
    scope: "A relationship",
    question: "Why does the same conversation feel calm to them and urgent to me?",
    answer: "You may need a defined next step in order to settle. They may need less pressure before they can respond clearly. The conflict can become a timing gap before it becomes a values gap.",
    distinction: "Different processing speeds do not automatically mean different levels of care.",
    tags: ["Relational Bridge", "Processing Speeds", "Shared Context"]
  },
  {
    id: "system",
    scope: "A family or team",
    question: "Why does everything fall to me when something goes wrong?",
    answer: "The group may rely on you to restore structure because you have done it before. That does not establish that the responsibility belongs to you now.",
    distinction: "Being the most capable person in the room does not make every unfinished responsibility yours.",
    tags: ["System Dynamics", "Role Stabilizer", "Responsibility"]
  },
  {
    id: "context",
    scope: "What may be active now",
    question: "Why does an old role feel harder to keep performing now?",
    answer: "A familiar responsibility theme may be more visible for a limited time, making the cost of the role harder to ignore.",
    distinction: "A temporary emphasis can reveal a tension without deciding what you must do.",
    tags: ["Active Context", "Longitudinal Pattern", "Tension"]
  }
];

export function PowderLanding() {
  const [activeId, setActiveId] = useState<string>("myself");
  const active: PowderDemonstration = DEMONSTRATIONS.find((d) => d.id === activeId) ?? DEMONSTRATIONS[0]!;

  return (
    <div className="powder-wrapper">
      {/* Abstract fuzzy landscape background */}
      <div className="powder-bg-landscape" />

      <header className="powder-header">
        <div className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 12l10 10 10-10L12 2z"/>
          </svg>
          <span style={{ marginLeft: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>SOVEREIGN.OS</span>
        </div>
        <nav className="header-nav">
          <a href="/how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="/login" style={{ color: "#a3a3a3", fontSize: "14px", textDecoration: "none" }}>Sign in</a>
          <a href="/signup" className="header-cta" style={{ textDecoration: "none" }}>Build your Baseline →</a>
        </div>
      </header>

      <main className="powder-layout">
        {/* Left Pane: Hero with Sovereign Brand Copy */}
        <section className="powder-left">
          <div className="powder-badge">
            <span className="pulse-dot"></span> PERSONAL INTELLIGENCE FOR REAL LIFE
          </div>
          
          <h1 className="powder-title" style={{ lineHeight: 1.05 }}>
            Healing<br />isn’t<br />optional.<br />
            <span style={{ color: "#777", fontWeight: 400 }}>Holding onto<br />the pain is.</span>
          </h1>
          
          <p className="powder-subtitle">
            Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.
          </p>
          
          <div style={{ marginBottom: "40px" }}>
            <a 
              href="/signup" 
              className="powder-submit" 
              style={{ 
                position: "static", 
                display: "inline-block", 
                padding: "14px 32px", 
                textDecoration: "none",
                fontSize: "15px",
                borderRadius: "30px" 
              }}
            >
              Build your Baseline
            </a>
            <p style={{ color: "#666", fontSize: "12px", marginTop: "14px", letterSpacing: "0.02em" }}>
              Start free · No card required · Review, correct, or reject any interpretation
            </p>
          </div>

          <div className="powder-logos" style={{ opacity: 0.6 }}>
            <span className="client-logo">Self</span>
            <span style={{ color: "#555" }}>·</span>
            <span className="client-logo">Relationships</span>
            <span style={{ color: "#555" }}>·</span>
            <span className="client-logo">Decisions</span>
            <span style={{ color: "#555" }}>·</span>
            <span className="client-logo">Systems</span>
          </div>
        </section>

        {/* Right Pane: App Interface Mockup with Sovereign capabilities */}
        <section className="powder-right">
          <div className="powder-app-card">
            <div className="app-card-logo" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
              <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4a373", fontWeight: 600 }}>
                ✦ Sovereign Baseline
              </span>
            </div>
            
            <div className="app-welcome" style={{ textAlign: "left", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 500, margin: "0 0 6px 0" }}>What dynamic is alive for you right now?</h2>
              <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Explore what is active in your world right now.</p>
            </div>

            {/* Interactive Question Input Box */}
            <div className="app-prompt-container" style={{ marginBottom: "20px" }}>
              <div style={{ color: "#eee", fontSize: "14px", fontWeight: 500, marginBottom: "16px", lineHeight: 1.4 }}>
                &ldquo;{active.question}&rdquo;
              </div>
              <div className="app-prompt-toolbar">
                <div className="toolbar-left">
                  <span title="Attachment">📎</span>
                  <span title="Data">📊</span>
                  <span title="Action">⚡</span>
                </div>
                <div className="toolbar-right">
                  <button className="mic-btn" type="button" aria-label="Microphone input">🎙️</button>
                  <button className="send-btn" type="button" aria-label="Active question" style={{ background: "#d4a373", color: "#000", fontWeight: "bold" }}>✦</button>
                </div>
              </div>
            </div>

            {/* Interactive Scope Filters */}
            <div className="app-categories-row" style={{ overflowX: "auto", paddingBottom: "4px", marginBottom: "20px" }}>
              <div className="app-categories" style={{ flexWrap: "wrap", gap: "8px" }}>
                {DEMONSTRATIONS.map((demo) => {
                  const isSelected = demo.id === activeId;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      className={`cat-pill ${isSelected ? "active" : ""}`}
                      onClick={() => setActiveId(demo.id)}
                      style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        border: isSelected ? "1px solid #d4a373" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: isSelected ? "#fff" : "#888",
                        background: isSelected ? "rgba(212, 163, 115, 0.15)" : "transparent",
                        cursor: "pointer"
                      }}
                    >
                      {isSelected && <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#d4a373", marginRight: "6px" }} />}
                      {demo.scope}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer & Insight Area */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "18px 20px" }}>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#ccc", margin: "0 0 14px 0" }}>
                {active.answer}
              </p>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 14px", borderRadius: "8px", background: "rgba(212, 163, 115, 0.08)", borderLeft: "3px solid #d4a373", marginBottom: "14px" }}>
                <span style={{ color: "#d4a373" }}>✦</span>
                <span style={{ fontSize: "13px", color: "#e5e5e5", lineHeight: "1.45" }}>
                  {active.distinction}
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {active.tags.map((tag) => (
                  <span 
                    key={tag} 
                    style={{ 
                      fontSize: "11px", 
                      padding: "4px 10px", 
                      borderRadius: "12px", 
                      background: "rgba(255, 255, 255, 0.06)", 
                      color: "#999",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default PowderLanding;
