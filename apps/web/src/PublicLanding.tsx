import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BaselineOrbit } from './BaselineOrbit';

const explorations = [
  { label: 'A decision', question: 'Which opportunity fits how I actually work?', connection: 'Your Baseline consistently favors meaningful authority over safety inside a role that requires repeated deference.', insight: 'The choice may not be freedom versus responsibility. It may be which kind of responsibility lets you remain fully present.', basis: ['Baseline tendency · self-direction', 'Current question · work and authority', 'Possible pressure · choosing safety to quiet uncertainty'] },
  { label: 'A relationship', question: 'Am I growing here, or becoming smaller?', connection: 'You may need directness and shared responsibility, while this relationship currently leaves important needs unspoken.', insight: 'Growth can be uncomfortable without requiring permanent self-erasure. What happens when your needs become visible?', basis: ['Baseline tendency · direct connection', 'Current question · growth and self-trust', 'Observed behavior · not yet confirmed'] },
  { label: 'A family role', question: 'Why does everyone resist when I stop fixing things?', connection: 'The system may rely on your stabilizing role while distributing less responsibility to everyone else.', insight: 'The resistance may concern what your changed role asks the whole family to carry—not proof of anyone’s hidden motive.', basis: ['Baseline tendency · responsibility', 'System context · familiar stabilizer role', 'Unknown · how others actually experience the change'] }
] as const;

const scopes = {
  self: { kicker: 'ONE BASELINE', title: 'See the pattern in one life.', copy: 'Keep steady qualities, pressure responses, current emphasis, and lived experience distinct.' },
  relationship: { kicker: 'TWO BASELINES · WITH PERMISSION', title: 'See the space between two people.', copy: 'Compare different routes to clarity without motive claims, compatibility scores, or choosing a winner.' },
  system: { kicker: 'A WHOLE HUMAN SYSTEM', title: 'See where pressure collects.', copy: 'Bring roles, authority, responsibility, and missing perspective into one legible view.' }
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
        <p className="v2-kicker">PERSONAL INTELLIGENCE, WITH A FOUNDATION</p>
        <h1>Know what is <em>yours</em> to carry.</h1>
        <p>Sovereign begins with your Baseline Design, then shows which parts may matter in a choice, relationship, or system—and why.</p>
        <div className="v2-actions"><a href="/signup" className="v2-primary">Build my Baseline</a><a href="#live-exploration" className="v2-secondary">Experience an insight <span>↓</span></a></div>
        <small>Begin free · exact birth time optional · private by default</small>
      </div>
      <BaselineOrbit />
    </section>

    <section className="v2-difference" aria-labelledby="difference-title">
      <p className="v2-kicker">NOT ANOTHER BLANK CHAT</p>
      <h2 id="difference-title">The conversation starts before the prompt.</h2>
      <div className="difference-flow" aria-label="Sovereign retains personal context between questions">
        <span className="difference-prompt">A new question</span><i aria-hidden="true" />
        <span className="difference-foundation"><b>Your Baseline</b><small>steady · explorable · correctable</small></span><i aria-hidden="true" />
        <span className="difference-result">A more relevant place to begin</span>
      </div>
    </section>

    <section className="v2-exploration" id="live-exploration" aria-labelledby="exploration-title">
      <header><p className="v2-kicker">TRY A REAL EXPLORATION</p><h2 id="exploration-title">Watch the relevant intelligence come forward.</h2></header>
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
      <div className={`scope-field scope-${scope}`} aria-label={scope === 'relationship' ? 'See the relationship from both sides.' : `${scope} intelligence example`}>
        <div className="scope-person scope-person-one"><i>YOU</i><strong>Direct clarity</strong><small>{scope === 'self' ? 'steady tendency' : 'seeks response now'}</small></div>
        <div className="scope-person scope-person-two"><i>AL</i><strong>Reflective clarity</strong><small>needs time before response</small></div>
        <div className="scope-person scope-person-three"><i>MK</i><strong>Formal authority</strong><small>decision owner</small></div>
        <div className="scope-person scope-person-four"><i>JA</i><strong>Informal responsibility</strong><small>pressure concentrates here</small></div>
        <div className="scope-relationship"><span>SHARED NEED</span><strong>Understanding</strong><small>different route</small></div>
        <div className="scope-pressure"><span>PRESSURE</span><strong>Responsibility without matching authority</strong></div>
      </div>
    </section>

    <section className="v2-trust" aria-labelledby="trust-title">
      <div><p className="v2-kicker">INTELLIGENCE YOU CAN QUESTION</p><h2 id="trust-title">See the basis. Keep the authority.</h2></div>
      <dl><div><dt>Known</dt><dd>Your reduced Baseline and the context you selected.</dd></div><div><dt>Interpreted</dt><dd>A possibility to examine, never proof of motive or behavior.</dd></div><div><dt>Confirmed</dt><dd>Only what you choose to recognize or correct.</dd></div><div><dt>Private</dt><dd>Raw birth inputs and exact private location stay out of the model.</dd></div></dl>
    </section>

    <section className="v2-final"><p className="v2-kicker">YOUR FOUNDATION, BUILT ONCE</p><h2>Begin with yourself.<br /><em>Let the context expand when it matters.</em></h2><p>Build your Baseline in a few minutes. Review what fits. Keep exploring free, and add People, Systems, or continuity when you choose.</p><div className="v2-actions"><a href="/signup" className="v2-primary">Build my Baseline</a><a href="/pricing.html" className="v2-secondary">See plans</a></div></section>

    <footer className="landing-footer"><span>Sovereign.OS · Private personal, relationship, and system intelligence</span><nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/faq.html">Questions</a></nav></footer>
  </main>;
}
