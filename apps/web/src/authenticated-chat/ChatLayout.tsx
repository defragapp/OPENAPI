import React from 'react';
import { Navigation } from './Navigation';
import { SovereignIntelligenceWorkspace } from '../SovereignIntelligenceWorkspace';

// Wrapper layout for authenticated chat experience
export function ChatLayout() {
  return (
    <div className="chat-layout" style={{ display: 'flex', height: '100vh' }}>
      {/* Left navigation pane */}
      <aside style={{ width: '240px', borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
        <Navigation />
      </aside>
      {/* Main conversation area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Conversation canvas */}
        <section style={{ flex: 1, overflowY: 'auto' }}>
          <SovereignIntelligenceWorkspace onboardingVerified />
        </section>
        {/* Composer is already part of SovereignIntelligenceWorkspace; if needed, we could expose it separately. */}
      </main>
    </div>
  );
}
