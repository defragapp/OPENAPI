import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BaselineOrbit } from './BaselineOrbit';

const explorations = [
  { label: 'A decision', question: 'This offer makes sense. Why does accepting it feel wrong?', connection: 'Your Baseline may favor meaningful authority. This role offers security, but asks you to defer on decisions you would carry.', insight: 'The tension may not be fear versus courage. It may be whether the responsibility is truly yours when the authority is not.', basis: ['Baseline tendency · self-direction', 'Current amplification · pressure to choose the sensible option', 'User-confirmed experience · not yet confirmed'] },
  { label: 'A conversation', question: 'Why does the same conversation keep breaking down?', connection: 'You may reach clarity by speaking directly. The other person may need time before responding; their actual experience remains unknown.', insight: 'Prepare for the next conversation by separating your need for an answer from the timing required for a considered one.', basis: ['Baseline tendency · direct communication', 'Current amplification · urgency around an unresolved issue', 'Observed behavior · only what you confirm'] },
  { label: 'A family role', question: 'Why does everything reach me before anyone else acts?', connection: 'Care may be one of your gifts. In this family, it may also have become responsibility that was never yours alone.', insight: 'The next step may be to name what you will carry—and return decisions to the people with the authority to make them.', basis: ['Baseline tendency · care and responsibility', 'Current amplification · pressure concentrates with you', 'Unknown · how others understand their roles'] }
] as const;

const scopes = {
  self: { kicker: 'BASELINE DESIGN', title: 'Know your reference point.', copy: 'See how you tend to process, communicate, decide, connect, learn, lead, create, carry responsibility, and respond under pressure.' },
  relationship: { kicker: 'PEOPLE · EXPLICIT PERMISSION', title: 'See how the same moment may land differently.', copy: 'Use only what each person permits. Perspective can prepare a better conversation; it is never proof of another person’s inner world.' },
  system: { kicker: 'SYSTEMS · FAMILY, GROUP, AND TEAM', title: 'See the conditions carrying the problem.', copy: 'Examine roles, authority, responsibility, loyalty, expectation, dependence, and current pressure without assigning a villain.' }
} as const;

type Scope = keyof typeof scopes;

export function PublicLanding() {
  const [activeExample, setActiveExample] = useState(0);
  const [scope, setScope] = useState<Scope>('relationship');
  const [fit, setFit] = useState<'yes' | 'partly' | 'not-yet' | null>(null);
  const example = explorations[activeExample]!;

  function moveExample(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? explorations.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + explorations.length) % explorations.length;
    setActiveExample(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return <main className="sovereign-landing landing-v2" data-release-fingerprint="Understand yourself—and everyone your life includes." data-experience="Baseline intelligence you can examine and correct.">
    <header className="landing-nav">
      <a className="landing-wordmark" href="/" aria-label="Sovereign.OS home"><span aria-hidden="true" /><strong>SOVEREIGN.OS</strong></a>
      <nav aria-label="Public navigation"><a href="/how-it-works.html">How it works</a><a href="/pricing.html">Pricing</a><a href="/faq.html">Questions</a><a href="/login">Sign in</a><a className="landing-nav-cta" href="/signup">Build my Baseline</a></nav>
    </header>

    <section className="v2-hero">
      <div className="v2-hero-copy">
        <p className="v2-kicker">A PRIVATE INTELLIGENCE WORKSPACE</p>
        <h1>Understand what is happening.<br /><em>Choose what is yours to carry.</em></h1>
        <p>Sovereign.OS begins with a private reference point for how you tend to process, communicate, decide, connect, and respond under pressure. Apply it to a decision, conversation, relationship, or wider system—without giving up your judgment.</p>
        <div className="v2-actions"><a href="/signup" className="v2-primary">Build my Baseline</a><a href="#live-exploration" className="v2-secondary">See an example <span>↓</span></a></div>
        <small>Create your account, verify your email once, and build your Baseline in a few minutes. Free. No card required.</small>
      </div>
      <BaselineOrbit />
    </section>

    <section className="v2-difference" aria-labelledby="difference-title">
      <p className="v2-kicker">BASELINE FIRST</p>
      <h2 id="difference-title">A chatbot starts with your prompt. Sovereign starts with a reference point.</h2>
      <div className="difference-flow" aria-label="Sovereign retains personal context between questions">
        <span className="difference-prompt">A new question</span><i aria-hidden="true" />
        <span className="difference-foundation"><b>Your Baseline</b><small>steady · explorable · correctable</small></span><i aria-hidden="true" />
        <span className="difference-result">A more relevant place to begin</span>
      </div>
    </section>

    <section className="v2-exploration" id="live-exploration" aria-labelledby="exploration-title">
      <header><p className="v2-kicker">ALIGNMENT · APPLY YOUR BASELINE NOW</p><h2 id="exploration-title">Make a decision you can recognize as your own.</h2></header>
      <div className="v2-question-tabs" role="tablist" aria-label="Example questions">
        {explorations.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={activeExample === index} tabIndex={activeExample === index ? 0 : -1} onClick={() => { setActiveExample(index); setFit(null); }} onKeyDown={(event) => moveExample(event, index)}>{item.label}</button>)}
      </div>
      <div className="v2-insight-stage" role="tabpanel" aria-live="polite">
        <div className="insight-question"><span>YOU ASK</span><p>“{example.question}”</p></div>
        <div className="insight-connection"><span>SOVEREIGN CONNECTS</span><p>{example.connection}</p><i aria-hidden="true" /></div>
        <div className="insight-result"><span>POSSIBLE INSIGHT</span><h3>{example.insight}</h3></div>
        <details className="v2-evidence"><summary>Why this appears <span>Open the basis</span></summary><div>{example.basis.map((item) => <p key={item}>{item}</p>)}<p>Actual current state · unknown until you confirm</p></div></details>
        <div className="v2-confirm"><span>Does this fit your experience?</span><div>{(['yes','partly','not-yet'] as const).map((value) => <button type="button" key={value} aria-pressed={fit === value} onClick={() => setFit(value)}>{value === 'yes' ? 'Yes' : value === 'partly' ? 'Partly' : 'Not today'}</button>)}</div></div>
        <p className="v2-continuity" role="status">{fit ? 'In your workspace, this correction stays with the exploration and can inform future context.' : 'You remain the authority. Confirm what fits, correct what does not.'}</p>
      </div>
    </section>

    <section className="v2-scopes" aria-labelledby="scopes-title">
      <div className="scope-copy"><p className="v2-kicker">{scopes[scope].kicker}</p><h2 id="scopes-title">{scopes[scope].title}</h2><p>{scopes[scope].copy}</p><div className="scope-switch" role="group" aria-label="Intelligence scale">{(Object.keys(scopes) as Scope[]).map((item) => <button key={item} type="button" aria-pressed={scope === item} onClick={() => setScope(item)}>{item === 'self' ? 'Self' : item === 'relationship' ? 'Relationship' : 'System'}</button>)}</div></div>
      <div className={`scope-field scope-mode-${scope}`} aria-label={scope === 'relationship' ? 'See the relationship from both sides.' : `${scope} intelligence example`}>
        <div className="scope-person scope-person-one"><i>YOU</i><strong>Direct clarity</strong><small>{scope === 'self' ? 'steady tendency' : 'seeks response now'}</small></div>
        <div className="scope-person scope-person-two"><i>AL</i><strong>Reflective clarity</strong><small>needs time before response</small></div>
        <div className="scope-person scope-person-three"><i>MK</i><strong>Formal authority</strong><small>decision owner</small></div>
        <div className="scope-person scope-person-four"><i>JA</i><strong>Informal responsibility</strong><small>pressure concentrates here</small></div>
        <div className="scope-relationship"><span>SHARED NEED</span><strong>Understanding</strong><small>different route</small></div>
        <div className="scope-pressure"><span>PRESSURE</span><strong>Responsibility without matching authority</strong></div>
      </div>
    </section>

    <section className="v2-trust" aria-labelledby="trust-title">
      <div><p className="v2-kicker">CLEAR ABOUT WHAT IT KNOWS</p><h2 id="trust-title">See why an insight appears. Keep the final say.</h2></div>
      <dl><div><dt>Known</dt><dd>Your reduced Baseline and the context you selected.</dd></div><div><dt>Interpreted</dt><dd>A possibility to examine, never proof of motive or behavior.</dd></div><div><dt>Confirmed</dt><dd>Only what you choose to recognize or correct.</dd></div><div><dt>Private</dt><dd>Raw birth inputs and exact private location stay out of the model.</dd></div></dl>
    </section>

    <section className="v2-final"><p className="v2-kicker">CONTINUITY WITHOUT THE ARCHIVE</p><h2>Keep what remains useful.<br /><em>Return without starting over.</em></h2><p>Library is a private, intentional reference—not a journal or transcript archive. Save an insight, boundary, decision principle, or relationship distinction when it is worth carrying forward.</p><div className="v2-actions"><a href="/signup" className="v2-primary">Build my Baseline</a><a href="/pricing.html" className="v2-secondary">See plans</a></div></section>

    <footer className="landing-footer"><span>Sovereign.OS · Private personal, relationship, and system intelligence</span><nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/faq.html">Questions</a></nav></footer>
  </main>;
}
