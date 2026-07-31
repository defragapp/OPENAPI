import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { installPublicLandingViewportContract } from './PublicLandingViewportContract';

type EvidenceItem = { compact: string; label: string };
type FlowKind = 'feeling' | 'baseline' | 'pattern' | 'next';
type FlowStep = {
  kind: FlowKind;
  label: string;
  title: string;
  body: string;
  evidence?: readonly EvidenceItem[];
  branches?: readonly { name: string; note: string; evidence: readonly EvidenceItem[]; tone: 'you' | 'other' }[];
};

const personalBasis = [
  { compact: 'SUN · LEO', label: 'Natal Sun in Leo' },
  { compact: 'GK 13.4', label: 'Gene Key 13, line 4' },
  { compact: 'GATE 4.11', label: 'Baseline gate 4, line 11' },
  { compact: 'GK 9', label: 'Gene Key 9' },
  { compact: 'MARS · CANCER', label: 'Natal Mars in Cancer' }
] as const;

const relationshipBasis = {
  you: [
    { compact: 'AUTH · EMO', label: 'Your permitted emotional authority' },
    { compact: 'NEEDS TIME', label: 'Your permitted decision timing' }
  ],
  maya: [
    { compact: 'AUTH · SPLENIC', label: 'Maya’s permitted splenic authority' },
    { compact: 'DECIDES NOW', label: 'Maya’s permitted decision timing' }
  ]
} as const;

const systemMembers = [
  { id: 'you', name: 'You', role: 'Parent', basis: 'SUN · LEO · AUTH · EMO', position: 'member-you' },
  { id: 'ruth', name: 'Ruth', role: 'Grandparent', basis: 'SUN · CAP · AUTH · EMO', position: 'member-ruth' },
  { id: 'maya', name: 'Maya', role: 'Partner', basis: 'SUN · VIRGO · AUTH · SPLENIC', position: 'member-maya' },
  { id: 'noa', name: 'Noa', role: 'Child', basis: 'SUN · PISCES · AUTH · EMO', position: 'member-noa' }
] as const;

const personalFlow: readonly FlowStep[] = [
  { kind: 'feeling', label: 'STEP 1', title: 'What you’re feeling', body: 'The pull to fix everyone’s problems—often before your own.' },
  { kind: 'baseline', label: 'STEP 2', title: 'What your Baseline shows', body: 'Stability may be a core value. Under pressure, protecting others can become a way to create safety.', evidence: personalBasis.slice(1, 3) },
  { kind: 'pattern', label: 'STEP 3', title: 'The pattern, named', body: 'Taking control is not a flaw. It may be a useful capacity that has moved beyond the situations where it belongs.' },
  { kind: 'next', label: 'YOUR NEXT STEP', title: 'Start here', body: 'At the first pull to step in, ask: do I have the authority, information, and consent to carry this?' }
];

const relationshipFlow: readonly FlowStep[] = [
  { kind: 'feeling', label: 'STEP 1', title: 'The friction you feel', body: 'The same conversation lands calm for one person and urgent for the other.' },
  {
    kind: 'baseline',
    label: 'STEP 2',
    title: 'Each Baseline, read in parallel',
    body: 'Sovereign keeps both decision processes visible before interpreting the interaction.',
    branches: [
      { name: 'You', note: 'May need time before confirming', evidence: relationshipBasis.you, tone: 'you' },
      { name: 'Maya', note: 'May recognize an immediate response', evidence: relationshipBasis.maya, tone: 'other' }
    ]
  },
  { kind: 'pattern', label: 'STEP 3', title: 'What happens between you', body: 'This may be a timing gap rather than a values gap. Neither person has to be reduced to wrong.' },
  { kind: 'next', label: 'YOUR NEXT STEP', title: 'A return time works for both', body: 'Name the decision, choose when to return, and let each person arrive by the route that fits them.' }
];

export function PublicLanding() {
  useEffect(() => {
    installPublicLandingViewportContract();
  }, []);

  return (
    <main className="sovereign-public" data-product-contract="baseline-first" data-answer-contract="sovereign-answer.v2" data-visual-contract="v0-editorial-reconciliation">
      <PublicNav />
      <Hero />
      <BaselineHinge />

      <section id="how-it-works" className="public-story-sequence" aria-label="How Sovereign works">
        <p className="public-fixture-note">Sanitized product demonstrations · Illustrative Baseline values · Not your personal result</p>
        <PersonalStory />
        <RelationshipStory />
        <SystemStory />
      </section>

      <ConsentSection />
      <PricingSection />
      <FinalSection />
      <PublicFooter />
    </main>
  );
}

function PublicNav() {
  return (
    <header className="public-nav">
      <div className="public-nav-inner">
        <a className="public-wordmark" href="/" aria-label="Sovereign home">Sovereign</a>
        <nav aria-label="Public navigation">
          <a href="#how-it-works">How it works</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>
        <div className="public-nav-actions">
          <a className="public-sign-in" href="/login">Sign in</a>
          <a className="public-nav-cta" href="/signup">Get started</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="public-hero" aria-labelledby="public-hero-title" data-viewport-section="hero">
      <div className="hero-atmosphere" aria-hidden="true"><span /><span /><span /></div>
      <div className="public-hero-content" data-viewport-surface="hero-content">
        <p className="hero-positioning"><i aria-hidden="true" />Personal AI for real life</p>
        <h1 id="public-hero-title">
          <span>Know yourself.</span>
          <span className="outlined">Understand the system.</span>
          <span className="final-line">Choose what fits.</span>
        </h1>
        <p className="hero-summary">Sovereign is a private AI that builds your <strong>Baseline</strong>—a stable, correctable model of how you may decide, communicate, connect, lead, and respond under pressure—then grounds your real questions in the person asking.</p>
        <div className="public-actions">
          <a className="public-primary" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a>
          <a className="public-secondary" href="#how-it-works">See a Sovereign answer</a>
        </div>
        <div className="hero-trust" aria-label="Plan and privacy notes">
          <span>Start free</span><span>No card required</span><span>Review any interpretation</span>
        </div>
      </div>
      <a className="hero-scroll" href="#baseline" aria-label="Continue to the Baseline section"><span aria-hidden="true" /></a>
    </section>
  );
}

function BaselineHinge() {
  return (
    <section id="baseline" className="baseline-hinge" aria-labelledby="baseline-title" data-viewport-section="baseline">
      <div className="baseline-hinge-inner">
        <header className="baseline-editorial">
          <p className="public-kicker">THE BASELINE</p>
          <h2 id="baseline-title">Your intelligence begins with your Baseline.</h2>
          <p>Most AI begins with whatever you type into a blank box. Sovereign begins with a stable reference you can inspect, correct, and keep—then separates what is steady from what may be more active now.</p>
          <a href="/signup">Build yours <span aria-hidden="true">→</span></a>
        </header>
        <article className="baseline-artifact" aria-label="Baseline product example" data-viewport-surface="baseline-artifact">
          <div className="baseline-artifact-head"><span>BASELINE · PERSONAL</span><small>Correctable reference</small></div>
          <div className="baseline-artifact-grid">
            <section className="baseline-core">
              <p>CORE ORIENTATION</p>
              <h3>Creates direction when ownership is unclear.</h3>
              <span>Stable · explorable · correctable</span>
            </section>
            <section className="baseline-layer">
              <p>ACTIVE NOW</p><strong>Responsibility may deserve attention for a limited time.</strong><small>Temporary context does not determine behavior.</small>
            </section>
            <section className="baseline-layer confirmed">
              <p>YOUR CONFIRMATION</p><strong>“Yes, this is louder this week.”</strong>
            </section>
            <section className="baseline-layer unknown">
              <p>STILL UNKNOWN</p><strong>How you are actually responding today.</strong>
            </section>
          </div>
          <EvidenceStrip label="BASIS" values={personalBasis} />
        </article>
      </div>
    </section>
  );
}

function PersonalStory() {
  return (
    <article className="public-story public-story-personal" aria-labelledby="personal-title" data-viewport-section="personal">
      <StoryHeading eyebrow="STEP 01 · YOU" title="Ask about your life." outline="Get an answer built for you." id="personal-title">
        You ask a real question. Sovereign reads your Baseline, keeps the evidence visible, and works toward a practical distinction.
      </StoryHeading>
      <div className="story-product-frame" data-viewport-stage="personal">
        <div className="story-grid">
          <ChatWindow title="Sovereign — Chat" mode="personal" />
          <WorkflowWindow title="How Sovereign works it through" steps={personalFlow} />
        </div>
      </div>
      <a className="story-cta filled" href="/signup">Try it free <span aria-hidden="true">→</span></a>
    </article>
  );
}

function RelationshipStory() {
  return (
    <article className="public-story public-story-relationship" aria-labelledby="relationship-title" data-viewport-section="relationship">
      <StoryHeading eyebrow="STEP 02 · YOU + 1" title="See the space" outline="between you." id="relationship-title">
        Bring another person’s permitted Baseline into the room. Sovereign keeps each person distinct, then shows what the interaction may create between them.
      </StoryHeading>
      <div className="story-product-frame" data-viewport-stage="relationship">
        <div className="story-grid">
          <ChatWindow title="Sovereign — Shared Chat" mode="relationship" />
          <WorkflowWindow title="How Sovereign reads both of you" steps={relationshipFlow} relationship />
        </div>
      </div>
      <a className="story-cta" href="/signup">Explore a relationship <span aria-hidden="true">→</span></a>
    </article>
  );
}

function SystemStory() {
  const [activeId, setActiveId] = useState<(typeof systemMembers)[number]['id']>('you');
  const active = systemMembers.find((member) => member.id === activeId) ?? systemMembers[0];

  return (
    <article className="public-story public-story-system" aria-labelledby="system-title" data-viewport-section="system">
      <StoryHeading eyebrow="STEP 03 · YOUR WHOLE SYSTEM" title="From one person" outline="to the whole system." id="system-title">
        Overlay permitted Baselines and the shared structure becomes visible—without claiming private motives, emotions, or one-sided access.
      </StoryHeading>
      <div className="system-instrument" data-viewport-stage="system" data-viewport-surface="system-instrument">
        <header className="window-chrome"><WindowDots /><span>Sovereign — Family System</span><small>PERMISSION-AWARE MAP</small></header>
        <div className="system-instrument-body">
          <div className="system-map" aria-label="Interactive family system example">
            <svg className="system-links" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M50 50 L50 15" /><path d="M50 50 L86 50" /><path d="M50 50 L50 85" /><path d="M50 50 L14 50" />
            </svg>
            <div className="system-center"><span>SHARED DECISION PATTERN</span><strong>Emotional<br />Authority</strong><small>3 of 4 permitted profiles</small></div>
            {systemMembers.map((member) => (
              <button key={member.id} type="button" className={`system-member ${member.position}`} aria-pressed={activeId === member.id} onClick={() => setActiveId(member.id)}>
                <span>{member.name.slice(0, 1)}</span><strong>{member.name}</strong><small>{member.role}</small>
              </button>
            ))}
          </div>
          <aside className="system-detail" aria-live="polite">
            <p>SELECTED PERSON</p>
            <h3>{active.name}</h3>
            <span>{active.role}</span>
            <strong>{active.basis}</strong>
            <div><p>WHAT THIS ADDS</p><span>This permitted Baseline can be compared with the shared decision pattern without claiming current emotion or hidden intent.</span></div>
          </aside>
        </div>
        <footer className="system-instrument-foot"><EvidenceStrip label="SYSTEM BASIS" values={[
          { compact: 'AUTH · EMO ×3', label: 'Three permitted emotional-authority profiles' },
          { compact: 'SPLENIC ×1', label: 'One permitted splenic-authority profile' },
          { compact: 'ROLE · PARENT', label: 'User-confirmed parent role' },
          { compact: 'SYSTEM · FAMILY', label: 'User-created family system' }
        ]} /></footer>
      </div>
    </article>
  );
}

function ConsentSection() {
  return (
    <section className="consent-editorial" aria-labelledby="consent-title" data-viewport-section="consent">
      <div className="consent-editorial-inner">
        <header>
          <p className="public-kicker">PERMISSION BEFORE COMPARISON</p>
          <h2 id="consent-title">Another person remains a person—not a data source you control.</h2>
        </header>
        <div className="consent-explanation" data-viewport-surface="consent">
          <p>Invitations are identity-bound and use-specific. Each person chooses what Sovereign may use. The product can describe interaction, responsibility, and missing perspective without pretending to know private thoughts.</p>
          <dl>
            <div><dt>01</dt><dd>No compatibility score.</dd></div>
            <div><dt>02</dt><dd>No mind-reading.</dd></div>
            <div><dt>03</dt><dd>No one-sided access.</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="pricing-editorial" aria-labelledby="pricing-title">
      <div className="pricing-editorial-inner">
        <header>
          <p className="public-kicker">START FREE · EXPAND WITH PERMISSION</p>
          <h2 id="pricing-title">Begin with yourself. Add relationships and systems when they matter.</h2>
        </header>
        <div className="pricing-rail">
          <article>
            <span>FREE</span><h3>Understand yourself.</h3><p>Build and explore your own Baseline. Ask about yourself, what may be more relevant now, and the decisions in front of you.</p><strong>$0</strong><small>Permanent · no card</small><a href="/signup">Build my Baseline <b aria-hidden="true">→</b></a>
          </article>
          <article>
            <span>SOVEREIGN+</span><h3>Understand people and systems.</h3><p>Bring permitted Baselines together, explore relationships and groups, and keep the understanding that remains useful.</p><strong>$20 <small>/ month</small></strong><em>or $99 / year</em><a href="/pricing">Compare plans <b aria-hidden="true">→</b></a>
          </article>
        </div>
      </div>
    </section>
  );
}

function FinalSection() {
  return (
    <section className="public-final" aria-labelledby="final-title">
      <div className="public-final-glow" aria-hidden="true" />
      <p className="public-kicker">A FOUNDATION FOR THE REAL QUESTION</p>
      <h2 id="final-title">Give your questions a foundation built around you.</h2>
      <p>Build your Baseline, then ask Sovereign about yourself, a decision, a relationship, or the system around you.</p>
      <div className="public-actions"><a className="public-primary" href="/signup">Build my Baseline <span aria-hidden="true">→</span></a><a className="public-secondary" href="#how-it-works">See how it works</a></div>
      <small>Interpretation stays visible · Consent stays specific · You keep the final say</small>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <span>Sovereign.OS</span>
      <nav aria-label="Footer navigation"><a href="/how-it-works">How it works</a><a href="/pricing">Pricing</a><a href="/faq">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
    </footer>
  );
}

function StoryHeading({ eyebrow, title, outline, id, children }: { eyebrow: string; title: string; outline: string; id: string; children: ReactNode }) {
  return (
    <header className="story-heading">
      <p>{eyebrow}</p>
      <h2 id={id}><span>{title}</span><span className="outlined">{outline}</span></h2>
      <div>{children}</div>
    </header>
  );
}

function ChatWindow({ title, mode }: { title: string; mode: 'personal' | 'relationship' }) {
  const relationship = mode === 'relationship';
  return (
    <section className="product-window chat-window" aria-label={title} data-viewport-surface={mode === 'personal' ? 'personal-chat' : 'relationship-chat'}>
      <header className="window-chrome"><WindowDots /><span>{title}</span></header>
      <div className="chat-stream">
        <p className="chat-user">{relationship ? 'Why does the same conversation land so differently for me and Maya?' : 'Why do I keep taking on responsibility for everyone around me?'}</p>
        <div className="chat-answer">
          <p>{relationship ? 'You may need time to talk things through before you are sure. Maya may recognize an immediate response. The clash may be about timing—not how much either of you cares.' : 'Your Baseline suggests that creating stability can be one of your real capacities. Under pressure, stepping in may become how you create safety. The useful question is whether this responsibility actually belongs to you.'}</p>
          {relationship ? (
            <div className="relationship-evidence">
              <EvidenceGroup name="You" tone="you" values={relationshipBasis.you} />
              <EvidenceGroup name="Maya" tone="other" values={relationshipBasis.maya} />
            </div>
          ) : <EvidenceStrip label="GROUNDED IN" values={personalBasis} />}
        </div>
        {!relationship && <p className="chat-user follow-up">That’s exactly it. How do I start to change it?</p>}
      </div>
      <div className="chat-composer"><span>{relationship ? 'Ask about the two of you…' : 'Ask a question…'}</span><i aria-hidden="true">→</i></div>
    </section>
  );
}

function WorkflowWindow({ title, steps, relationship = false }: { title: string; steps: readonly FlowStep[]; relationship?: boolean }) {
  return (
    <section className="product-window workflow-window" aria-label={title} data-viewport-surface={relationship ? 'relationship-workflow' : 'personal-workflow'}>
      <header className="window-chrome"><span className="workflow-live" aria-hidden="true" /> <span>{title}</span><small>BASELINE DESIGN</small></header>
      <ol className="workflow-list">
        {steps.map((step, index) => (
          <li key={step.title} className={step.kind === 'next' ? 'next-step' : ''} style={{ '--step-index': index } as CSSProperties}>
            <span className="workflow-node"><FlowIcon kind={step.kind} /></span>
            <div className="workflow-copy"><small>{step.label}</small><h3>{step.title}</h3><p>{step.body}</p>
              {step.evidence && <EvidenceStrip values={step.evidence} />}
              {step.branches && <div className="workflow-branches">{step.branches.map((branch) => <EvidenceGroup key={branch.name} name={branch.name} note={branch.note} values={branch.evidence} tone={branch.tone} />)}</div>}
            </div>
          </li>
        ))}
      </ol>
      {relationship && <p className="between-field"><span>BETWEEN YOU</span>The shared adjustment is visible without collapsing either person into the relationship.</p>}
    </section>
  );
}

function EvidenceStrip({ label, values }: { label?: string; values: readonly EvidenceItem[] }) {
  return <div className="evidence-strip">{label && <strong>{label}</strong>}{values.map((value) => <span key={value.compact} title={value.label}>{value.compact}</span>)}</div>;
}

function EvidenceGroup({ name, note, values, tone }: { name: string; note?: string; values: readonly EvidenceItem[]; tone: 'you' | 'other' }) {
  return <div className={`evidence-group ${tone}`}><header><i aria-hidden="true" /><strong>{name}</strong>{note && <span>{note}</span>}</header><EvidenceStrip values={values} /></div>;
}

function WindowDots() {
  return <i className="window-dots" aria-hidden="true"><span /><span /><span /></i>;
}

function FlowIcon({ kind }: { kind: FlowKind }) {
  if (kind === 'feeling') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8c2-2 4-2 6 0s4 2 6 0 4-2 4-2M4 12c2-2 4-2 6 0s4 2 6 0 4-2 4-2M4 16c2-2 4-2 6 0s4 2 6 0 4-2 4-2" /></svg>;
  if (kind === 'baseline') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 8-4 8 4-8 4-8-4Zm0 4 8 4 8-4M4 16l8 4 8-4" /></svg>;
  if (kind === 'pattern') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="7" r="2" /><circle cx="18" cy="17" r="2" /><circle cx="6" cy="17" r="2" /><path d="M8 7h4a3 3 0 0 1 3 3v5M8 17h8" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="m14.8 9.2-2 5.6-3.6 1.2 2-5.6 3.6-1.2Z" /></svg>;
}
