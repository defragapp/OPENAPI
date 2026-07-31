import { useState } from 'react';

const personalBasis = [
  { compact: 'SUN · LEO', label: 'Natal Sun in Leo' },
  { compact: 'GK 13.4', label: 'Gene Key 13, line 4' },
  { compact: 'GATE 4.11', label: 'Baseline gate 4, line 11' },
  { compact: 'GK 9', label: 'Gene Key 9' },
  { compact: 'MARS · CANCER', label: 'Natal Mars in Cancer' }
] as const;

const relationshipBasis = [
  { compact: 'YOU · AUTH EMO', label: 'Your permitted emotional authority' },
  { compact: 'YOU · NEEDS TIME', label: 'Your permitted decision timing' },
  { compact: 'MAYA · AUTH SPLENIC', label: 'Maya’s permitted splenic authority' },
  { compact: 'MAYA · DECIDES NOW', label: 'Maya’s permitted decision timing' }
] as const;

const systemBasis = [
  { compact: 'AUTH · EMO ×3', label: 'Three permitted emotional-authority profiles' },
  { compact: 'SPLENIC ×1', label: 'One permitted splenic-authority profile' },
  { compact: 'ROLE · PARENT', label: 'User-confirmed parent role' },
  { compact: 'SYSTEM · FAMILY', label: 'User-created family system' }
] as const;

const systemMembers = [
  { id: 'you', name: 'You', role: 'Parent', detail: 'SUN · LEO · AUTH · EMO', position: 'node-you' },
  { id: 'ruth', name: 'Ruth', role: 'Grandparent', detail: 'SUN · CAP · AUTH · EMO', position: 'node-ruth' },
  { id: 'maya', name: 'Maya', role: 'Partner', detail: 'SUN · VIRGO · AUTH · SPLENIC', position: 'node-maya' },
  { id: 'noa', name: 'Noa', role: 'Child', detail: 'SUN · PISCES · AUTH · EMO', position: 'node-noa' }
] as const;

type EvidenceItem = { compact: string; label: string };
type ReasoningStep = { label: string; title: string; body: string; evidence?: readonly EvidenceItem[] };

export function PublicLanding() {
  return (
    <main className="sovereign-landing" data-product-contract="baseline-first" data-answer-contract="sovereign-answer.v2">
      <header className="landing-nav">
        <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home"><span aria-hidden="true" /><strong>SOVEREIGN.OS</strong></a>
        <nav aria-label="Public navigation">
          <a href="#how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">Questions</a>
          <a href="/login">Sign in</a>
          <a className="landing-nav-cta" href="/signup">Build my Baseline</a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <h1 id="landing-title">Know yourself.<br />Understand the system.<br /><em>Choose what fits.</em></h1>
          <p>Sovereign.OS is a private AI for understanding yourself, your relationships, and the systems around you. Build your Baseline once, then ask naturally and receive an answer grounded in the person asking.</p>
          <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="#how-it-works">See how it works</a></div>
          <small>Start free · No card required · Review, correct, or reject any interpretation</small>
        </div>
        <HeroAnswerPreview />
      </section>

      <section className="landing-foundation" aria-labelledby="foundation-title">
        <header>
          <p className="landing-kicker">A BETTER STARTING POINT</p>
          <h2 id="foundation-title">Your intelligence begins with your Baseline.</h2>
          <p>Most AI begins with whatever you type into a blank box. Sovereign begins with a stable, correctable reference for how you may decide, communicate, connect, lead, and respond under pressure.</p>
        </header>
        <div className="baseline-context-stage">
          <div className="baseline-context-core"><span>YOUR BASELINE</span><strong>Creates direction when ownership is unclear</strong><small>Stable · explorable · correctable</small></div>
          <div className="baseline-context-line current"><span>WHAT MAY BE ACTIVE NOW</span><strong>Responsibility may deserve attention for a limited time.</strong><small>Temporary context does not determine behavior.</small></div>
          <div className="baseline-context-line confirmed"><span>YOUR CONFIRMATION</span><strong>“Yes, this is louder this week.”</strong></div>
          <div className="baseline-context-line unknown"><span>STILL UNKNOWN</span><strong>How you are actually responding today.</strong></div>
          <EvidenceChips values={personalBasis} label="BASIS" />
        </div>
      </section>

      <section id="how-it-works" className="sovereign-story-sequence" aria-label="How Sovereign works">
        <PersonalStory />
        <RelationshipStory />
        <SystemStory />
      </section>

      <section className="landing-section permission-section" aria-labelledby="permission-title">
        <header className="landing-section-header">
          <p className="landing-kicker">PERMISSION BEFORE COMPARISON</p>
          <h2 id="permission-title">Another person remains a person—not a data source you control.</h2>
          <p>Invitations are identity-bound and use-specific. Each person chooses what Sovereign may use. The product can show interaction, responsibility, and missing perspective without claiming access to private thoughts.</p>
        </header>
        <div className="permission-boundary">
          <span>No compatibility score.</span>
          <span>No mind-reading.</span>
          <span>No one-sided access.</span>
          <strong>Consent stays visible at every scale.</strong>
        </div>
      </section>

      <section className="landing-section pricing-preview" aria-labelledby="pricing-title">
        <header className="landing-section-header">
          <p className="landing-kicker">START FREE · EXPAND WITH PERMISSION</p>
          <h2 id="pricing-title">Begin with yourself. Add relationships and systems when they matter.</h2>
        </header>
        <div className="pricing-options">
          <article><span>FREE</span><h3>Understand yourself.</h3><p>Build and explore your own Baseline. Ask about yourself, what may be more relevant now, and the decisions in front of you.</p><strong>$0 <small>permanent · no card</small></strong><ul><li>10 Sovereign AI turns each month</li><li>Baseline, Today, Shadow, Gift, and Alignment</li><li>Review and correct what does not fit</li></ul><a href="/signup">Build my Baseline</a></article>
          <article><span>SOVEREIGN+</span><h3>Understand the people and systems around you.</h3><p>Bring permitted Baselines together, explore relationships and groups, keep useful understanding, and add Covenant when you choose.</p><strong>$20 <small>/ month</small></strong><p className="annual-price">or $99 / year</p><ul><li>300 Sovereign AI turns each month</li><li>People, Systems, Library, and Covenant</li><li>Consent-aware invitations and sharing controls</li></ul><a href="/pricing">Compare plans</a></article>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <p className="landing-kicker">CLARITY IS LEVERAGE</p>
        <h2 id="final-title">Give your questions a foundation built around you.</h2>
        <p>Build your Baseline, then ask Sovereign about yourself, a decision, a relationship, or the system around you.</p>
        <div className="landing-actions"><a className="landing-primary" href="/signup">Build my Baseline</a><a className="landing-secondary" href="/how-it-works">See how it works</a></div>
        <small>Interpretation stays visible · Consent stays specific · You keep the final say</small>
      </section>

      <footer className="landing-footer">
        <span>Sovereign.OS · Private personal, relationship, and system intelligence</span>
        <nav aria-label="Footer navigation"><a href="/how-it-works">How it works</a><a href="/pricing">Pricing</a><a href="/faq">Questions</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      </footer>
    </main>
  );
}

function HeroAnswerPreview() {
  return (
    <article className="hero-intelligence-stage" aria-label="Sovereign answer demonstration">
      <section className="hero-answer">
        <header><span>EXAMPLE ANSWER</span><strong>Sovereign · Personal</strong></header>
        <p className="fixture-label hero-fixture-scope">Sanitized demonstration · Not your Baseline</p>
        <p className="fixture-label">YOU ASKED</p>
        <p className="living-question">“Why do I keep taking responsibility for everyone else?”</p>
        <div className="living-answer-body">
          <span>DIRECT ANSWER</span>
          <h2>Your capacity is real. The question is whether the responsibility is actually yours.</h2>
          <div className="living-connection"><strong>THE PERSONAL CONNECTION</strong><p>You may create direction quickly when ownership is unclear. The cost begins when you carry the outcome without matching authority.</p></div>
          <aside><strong>A PRACTICAL NEXT STEP</strong>Ask whether you are being asked to lead—or only to absorb the uncertainty.</aside>
        </div>
        <EvidenceChips values={personalBasis} label="Why this is personal" />
      </section>
    </article>
  );
}

function PersonalStory() {
  const steps: ReasoningStep[] = [
    { label: 'STEP 1', title: 'What you’re feeling', body: 'The pull to fix everyone’s problems—often before your own.' },
    { label: 'STEP 2', title: 'What your Baseline shows', body: 'Stability is a core value, and under stress you may protect others to feel safe.', evidence: personalBasis.slice(1, 3) },
    { label: 'STEP 3', title: 'The pattern, named', body: 'Taking control is not a flaw. It may be an old safety habit that no longer belongs in every situation.' },
    { label: 'YOUR NEXT STEP', title: 'Start here', body: 'Notice the first moment responsibility moves toward you, then ask: is this actually mine to carry?' }
  ];
  return (
    <article className="sovereign-story-step story-self" aria-labelledby="story-self-title">
      <StoryHeading step="STEP 01 · YOU" title="Ask about your life." outline="Get an answer built for you." id="story-self-title">
        You ask a real question. Sovereign reads your Baseline, then works through it step by step—turning a vague feeling into a clearer distinction.
      </StoryHeading>
      <div className="visual-story-grid">
        <DemoWindow title="Sovereign — Chat" className="story-chat-window">
          <div className="story-conversation">
            <p className="story-user-message">Why do I keep taking on responsibility for everyone around me?</p>
            <div className="story-assistant-message">
              <p>Your Baseline shows you value stability almost above everything. When someone around you is struggling, stepping in can become how you make yourself feel safe. It is not weakness—it is a useful capacity that needs the right boundary.</p>
              <EvidenceChips values={personalBasis} label="GROUNDED IN" />
            </div>
            <p className="story-user-message follow-up">That’s exactly it. How do I start to change it?</p>
            <StoryComposer placeholder="Ask a question…" />
          </div>
        </DemoWindow>
        <ReasoningPanel title="How Sovereign works it through" steps={steps} />
      </div>
      <a className="story-action" href="/signup">Try it free <span aria-hidden="true">→</span></a>
    </article>
  );
}

function RelationshipStory() {
  const steps: ReasoningStep[] = [
    { label: 'STEP 1', title: 'The friction you feel', body: 'The same conversation lands calm for one of you and urgent for the other.' },
    { label: 'STEP 2', title: 'Each Baseline, read in parallel', body: 'Sovereign checks how each of you may naturally reach a decision.', evidence: relationshipBasis },
    { label: 'STEP 3', title: 'What’s really happening', body: 'This may be a timing gap rather than a values gap. Neither person has to be reduced to wrong.' },
    { label: 'YOUR NEXT STEP', title: 'What may work for both', body: 'Name the decision, then agree on a return time. One person can share an initial sense; the other can confirm after processing.' }
  ];
  return (
    <article className="sovereign-story-step story-relationship" aria-labelledby="story-relationship-title">
      <StoryHeading step="STEP 02 · YOU + 1" title="See the space" outline="between you." id="story-relationship-title">
        Bring another person’s permitted Baseline into the room. Sovereign reads both, then shows what each person may be bringing and what the relationship creates between them.
      </StoryHeading>
      <div className="visual-story-grid">
        <DemoWindow title="Sovereign — Shared Chat" className="story-chat-window">
          <div className="story-conversation">
            <p className="story-user-message">Why does the same conversation land so differently for me and Maya?</p>
            <div className="story-assistant-message">
              <p>You may need time to talk things through before you are sure. Maya may recognize an immediate response. The clash may be about timing—not how much either of you cares.</p>
              <EvidenceChips values={relationshipBasis} label="GROUNDED IN" />
            </div>
            <StoryComposer placeholder="Ask about the two of you…" />
          </div>
        </DemoWindow>
        <ReasoningPanel title="How Sovereign reads both of you" steps={steps} relationship />
      </div>
      <a className="story-action secondary" href="/signup">Explore a relationship <span aria-hidden="true">→</span></a>
    </article>
  );
}

function SystemStory() {
  const [activeId, setActiveId] = useState<(typeof systemMembers)[number]['id']>('you');
  const active = systemMembers.find((member) => member.id === activeId) ?? systemMembers[0];
  return (
    <article className="sovereign-story-step story-system" aria-labelledby="story-system-title">
      <StoryHeading step="STEP 03 · YOUR WHOLE SYSTEM" title="From one person" outline="to the whole system." id="story-system-title">
        Overlay everyone’s permitted Baseline and the shared dynamic becomes visible—mapped inside the same conversation, exactly where it becomes useful.
      </StoryHeading>
      <DemoWindow title="Sovereign — Family System" className="story-system-window">
        <div className="story-conversation">
          <p className="story-user-message">Can you map my whole family? Decisions around here always seem to take forever.</p>
          <div className="story-assistant-message system-message">
            <p>Three of the four permitted people share Emotional Authority, so decisions may carry more weight and need more time to settle. That is structural, not personal.</p>
            <div className="story-system-map" aria-label="Permitted family system map">
              <span className="system-map-line line-top" aria-hidden="true" />
              <span className="system-map-line line-left" aria-hidden="true" />
              <span className="system-map-line line-right" aria-hidden="true" />
              <span className="system-map-line line-bottom" aria-hidden="true" />
              <div className="story-system-center"><span>SHARED PATTERN</span><strong>Emotional<br />Authority</strong><small>3 of 4</small></div>
              {systemMembers.map((member) => (
                <button key={member.id} className={`story-person-node ${member.position}`} aria-pressed={activeId === member.id} onClick={() => setActiveId(member.id)}>
                  <span>{member.name.slice(0, 1)}</span><strong>{member.name}</strong><small>{member.role}</small><em>{member.detail}</em>
                </button>
              ))}
            </div>
            <p className="system-focus"><strong>{active.name} · {active.role}</strong>{active.id === 'maya' ? 'Maya’s permitted Baseline may reach a decision sooner, so the mismatch can feel like values when it may be timing.' : 'This person’s role and permitted Baseline are shown without claiming their private motive or current emotional state.'}</p>
            <EvidenceChips values={systemBasis} label="GROUNDED IN" />
          </div>
          <StoryComposer placeholder="Ask about your family…" />
        </div>
      </DemoWindow>
      <p className="system-pressure-note"><span>PRESSURE FIELD</span><strong>See where decisions slow, responsibility gathers, and one person’s change affects everyone else.</strong></p>
    </article>
  );
}

function StoryHeading({ step, title, outline, id, children }: { step: string; title: string; outline: string; id: string; children: string }) {
  return (
    <header className="story-heading">
      <p>{step}</p>
      <h2 id={id}>{title}<br /><span>{outline}</span></h2>
      <div>{children}</div>
    </header>
  );
}

function DemoWindow({ title, className, children }: { title: string; className: string; children: React.ReactNode }) {
  return (
    <section className={`visual-demo-window ${className}`}>
      <header><i aria-hidden="true"><b /><b /><b /></i><span>{title}</span></header>
      {children}
    </section>
  );
}

function ReasoningPanel({ title, steps, relationship = false }: { title: string; steps: ReasoningStep[]; relationship?: boolean }) {
  return (
    <section className={`visual-reasoning-panel ${relationship ? 'relationship-reasoning' : ''}`}>
      <header><span>{title}</span><small>BASELINE DESIGN</small></header>
      <ol>
        {steps.map((step) => (
          <li key={`${step.label}-${step.title}`}>
            <i aria-hidden="true" />
            <div><small>{step.label}</small><strong>{step.title}</strong><p>{step.body}</p>{step.evidence && <EvidenceChips values={step.evidence} label="" />}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EvidenceChips({ values, label }: { values: readonly EvidenceItem[]; label: string }) {
  return (
    <div className="visual-evidence-chips" aria-label={label || 'Baseline support'}>
      {label && <strong>{label}</strong>}
      <div>{values.map((value) => <span key={value.compact} title={value.label}>{value.compact}</span>)}</div>
    </div>
  );
}

function StoryComposer({ placeholder }: { placeholder: string }) {
  return <div className="story-composer"><span>{placeholder}</span><i aria-hidden="true">→</i></div>;
}
