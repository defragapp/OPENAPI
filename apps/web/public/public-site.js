document.documentElement.classList.add('js');

const observer = new MutationObserver(() => renderMarketingHome());
observer.observe(document.documentElement, { childList: true, subtree: true });
renderMarketingHome();

function renderMarketingHome() {
  if (location.pathname !== '/') return;
  const shell = document.querySelector('.entry-shell');
  if (!shell || shell.dataset.sovereignMarketing === 'true') return;

  shell.dataset.sovereignMarketing = 'true';
  shell.className = 'marketing-page marketing-home';
  document.title = 'Sovereign.OS — Personal AI built around your Baseline';
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Sovereign.OS uses your private Baseline, what is current, the people you choose, and what you save to make AI guidance more relevant from the start.'
  );

  ensureMarketingStyles();

  shell.innerHTML = `
    <div class="marketing-shell">
      <header class="marketing-nav">
        <a class="marketing-wordmark" href="/" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
        <nav class="marketing-nav-links" aria-label="Public navigation">
          <a href="/how-it-works.html">How it works</a>
          <a href="/login">Sign in</a>
          <a class="nav-cta" href="/signup">Create my Baseline</a>
        </nav>
      </header>

      <section class="marketing-hero">
        <div class="marketing-hero-copy reveal">
          <p class="marketing-kicker">Personal AI, built around your Baseline</p>
          <h1 class="marketing-display">Start with context. <em>Not a blank box.</em></h1>
          <p class="marketing-lede">
            Sovereign.OS starts with a private picture of how you make decisions, communicate, learn,
            connect, and respond to pressure. It adds what is current, the people you choose to include,
            and what you decide to save—then shows what may be useful now.
          </p>
          <div class="marketing-actions">
            <a class="marketing-button primary" href="/signup">Create my Baseline</a>
            <a class="marketing-button secondary" href="#capabilities">See what it can do</a>
          </div>
          <ul class="marketing-trust" aria-label="Product principles">
            <li>Private by design</li>
            <li>Nothing shared without permission</li>
            <li>You decide what fits</li>
          </ul>
        </div>

        <div class="product-preview-wrap reveal" aria-label="Preview of the Sovereign Today experience">
          <div class="product-device">
            <div class="product-screen">
              <div class="product-status">
                <span>9:41</span>
                <span class="product-status-icons" aria-hidden="true">● ● <i></i></span>
              </div>
              <div class="product-topbar">
                <strong>SOVEREIGN</strong>
                <span class="product-avatar">CO</span>
              </div>
              <div class="product-content">
                <p class="product-date">Today · Friday</p>
                <h2 class="product-title">A fast answer may feel clearer than it is.</h2>
                <p class="product-summary">
                  You usually reach better decisions after seeing how the pieces connect. Today may make the
                  first complete answer feel final before you have checked the whole picture.
                </p>
                <section class="product-focus">
                  <span class="product-focus-label">A better next move</span>
                  <h3>Give the decision one more pass.</h3>
                  <p>Notice what changes after the pressure to finish has passed.</p>
                </section>
                <div class="product-details">
                  <article class="product-detail">
                    <span>What stays true</span>
                    <strong>You work best when the full picture is visible.</strong>
                  </article>
                  <article class="product-detail warm">
                    <span>What may be stronger today</span>
                    <strong>The need to reach a conclusion quickly.</strong>
                  </article>
                </div>
              </div>
              <nav class="product-bottom-nav" aria-label="Preview navigation">
                <span class="active">Today</span>
                <span>Explore</span>
                <span>People</span>
                <span>Library</span>
                <span>You</span>
              </nav>
            </div>
          </div>
          <aside class="product-caption">
            <strong>Useful before you ask.</strong>
            Open Sovereign and see what may deserve your attention today.
          </aside>
        </div>
      </section>
    </div>

    <section class="marketing-band">
      <div class="marketing-shell marketing-band-inner">
        <div class="reveal">
          <p class="marketing-kicker">A better starting point</p>
          <h2 class="marketing-section-title">It already has a place to begin.</h2>
        </div>
        <div class="marketing-section-copy reveal">
          <p>
            Most AI starts with whatever you type into an empty box. Sovereign.OS starts with the private
            information you chose to build around yourself. That means it can show useful themes before you
            explain a problem from the beginning.
          </p>
          <div class="context-stack">
            <div class="context-row"><span>Your Baseline</span><p>How you tend to decide, communicate, learn, connect, and handle pressure.</p></div>
            <div class="context-row"><span>Today</span><p>What may feel stronger, easier, or harder right now.</p></div>
            <div class="context-row"><span>People</span><p>Differences between two people, only when both people have chosen to share.</p></div>
            <div class="context-row"><span>Groups</span><p>Roles and expectations inside a family, household, friendship, or team.</p></div>
            <div class="context-row"><span>What you save</span><p>Only the useful understanding you choose to keep for later.</p></div>
          </div>
        </div>
      </div>
    </section>

    <div class="marketing-shell">
      <section class="marketing-section" id="capabilities">
        <header class="marketing-section-head reveal">
          <div>
            <p class="marketing-kicker">What Sovereign can help with</p>
            <h2 class="marketing-section-title">Clearer decisions. Better conversations. Less guesswork.</h2>
          </div>
          <p>
            Sovereign turns a large amount of private context into plain language. It does not tell you what
            must be true. It gives you a useful place to look and keeps the final choice with you.
          </p>
        </header>

        <div class="capability-layout reveal">
          <div class="capability-tabs" role="tablist" aria-label="Sovereign capabilities">
            <button class="capability-tab active" type="button" data-capability="today" role="tab" aria-selected="true">
              <span>Today</span><strong>What matters now</strong>
            </button>
            <button class="capability-tab" type="button" data-capability="decision" role="tab" aria-selected="false">
              <span>Decisions</span><strong>Act, wait, or clarify</strong>
            </button>
            <button class="capability-tab" type="button" data-capability="people" role="tab" aria-selected="false">
              <span>People</span><strong>Understand the difference</strong>
            </button>
            <button class="capability-tab" type="button" data-capability="groups" role="tab" aria-selected="false">
              <span>Groups</span><strong>See the role you carry</strong>
            </button>
          </div>
          <article class="capability-output" aria-live="polite">
            <span class="capability-output-label" data-capability-label>Example · Today</span>
            <blockquote class="capability-output-copy" data-capability-copy>
              The urge to finish may be stronger than the need to be certain.
            </blockquote>
            <div>
              <p class="capability-output-action" data-capability-action>
                Give the decision one more pass after the pressure has settled.
              </p>
              <div class="capability-output-meta" data-capability-meta>
                <span>Your usual approach</span><span>What is current</span><span>Your choice stays yours</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="marketing-section">
        <header class="marketing-section-head reveal">
          <div>
            <p class="marketing-kicker">One product. Five useful views.</p>
            <h2 class="marketing-section-title">Built for the parts of life that are hard to read.</h2>
          </div>
          <p>
            Every part of Sovereign uses the same private context. You do not have to rebuild the story each
            time you move from a decision to a relationship or from one day to the next.
          </p>
        </header>

        <div class="feature-rail">
          <article class="feature-row reveal">
            <span>01 · TODAY</span>
            <h3>See what may deserve your attention now.</h3>
            <p>Separate what is usually true for you from what may feel unusually strong today.</p>
          </article>
          <article class="feature-row reveal">
            <span>02 · EXPLORE</span>
            <h3>Understand how you work at your best.</h3>
            <p>Look at decisions, communication, learning, work, connection, pressure, and recovery in ordinary language.</p>
          </article>
          <article class="feature-row reveal">
            <span>03 · PEOPLE</span>
            <h3>See why the same moment can feel different to two people.</h3>
            <p>Compare only what each person has chosen to share. No blame, hidden motives, or labels.</p>
          </article>
          <article class="feature-row reveal">
            <span>04 · GROUPS</span>
            <h3>Notice the role you are being pulled into.</h3>
            <p>See who is expected to calm, fix, explain, decide, or carry the pressure in a family or team.</p>
          </article>
          <article class="feature-row reveal">
            <span>05 · LIBRARY</span>
            <h3>Keep the useful part. Leave the rest behind.</h3>
            <p>Save a short understanding, next step, card, audio, or visual only when you choose to keep it.</p>
          </article>
        </div>
      </section>

      <section class="marketing-section">
        <header class="marketing-section-head reveal">
          <div>
            <p class="marketing-kicker">Why it feels different</p>
            <h2 class="marketing-section-title">You should not have to explain yourself from zero every time.</h2>
          </div>
        </header>
        <div class="value-split reveal">
          <article class="value-column">
            <span class="value-label">Most AI</span>
            <h3>Starts with the latest message.</h3>
            <ul class="value-list">
              <li>You repeat the background.</li>
              <li>The answer depends on one version of the story.</li>
              <li>Relationships are viewed from one side.</li>
              <li>Useful understanding is buried in chat history.</li>
            </ul>
          </article>
          <article class="value-column">
            <span class="value-label">Sovereign.OS</span>
            <h3>Starts with the context you chose to build.</h3>
            <ul class="value-list">
              <li>Your Baseline is ready when you open the app.</li>
              <li>Today is kept separate from what is usually true.</li>
              <li>Other people stay private until they give permission.</li>
              <li>You decide what becomes part of your Library.</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="marketing-section">
        <p class="marketing-statement reveal">See more clearly, <em>from the start.</em></p>
      </section>

      <section class="marketing-closing">
        <div class="reveal">
          <p class="marketing-kicker">Sovereign.OS</p>
          <h2 class="marketing-statement">Live a life you would choose to watch again.</h2>
          <p>
            Create your Baseline once. Use it to make better sense of today, your choices, your relationships,
            and the groups around you.
          </p>
          <div class="marketing-actions">
            <a class="marketing-button primary" href="/signup">Create my Baseline</a>
            <a class="marketing-button secondary" href="/how-it-works.html">See how Sovereign works</a>
          </div>
        </div>
      </section>

      <footer class="marketing-footer">
        <span>Private by design · Permission before sharing · Clear human language</span>
        <nav aria-label="Legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/login">Sign in</a>
        </nav>
      </footer>
    </div>
  `;

  activateMarketingInteractions();
}

function ensureMarketingStyles() {
  if (document.querySelector('link[data-sovereign-marketing]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/marketing.css';
  link.dataset.sovereignMarketing = 'true';
  document.head.append(link);
}

function activateMarketingInteractions() {
  const capabilities = {
    today: {
      label: 'Example · Today',
      copy: 'The urge to finish may be stronger than the need to be certain.',
      action: 'Give the decision one more pass after the pressure has settled.',
      meta: ['Your usual approach', 'What is current', 'Your choice stays yours']
    },
    decision: {
      label: 'Example · Decisions',
      copy: 'You may already know the answer. The pressure is about acting before you feel ready.',
      action: 'Separate the choice itself from the timing of the choice.',
      meta: ['How you decide', 'What creates pressure', 'A practical next step']
    },
    people: {
      label: 'Example · People',
      copy: 'One person may want a clear answer while the other still needs time to understand the question.',
      action: 'Agree on when to return to the conversation instead of forcing the same pace.',
      meta: ['Both people included', 'Permission checked', 'No motive assumed']
    },
    groups: {
      label: 'Example · Groups',
      copy: 'You may be expected to fix the tension because you have done it before.',
      action: 'Name what belongs to you and what the group needs to carry together.',
      meta: ['Roles', 'Shared pressure', 'Responsibility kept separate']
    }
  };

  const tabs = [...document.querySelectorAll('.capability-tab')];
  const label = document.querySelector('[data-capability-label]');
  const copy = document.querySelector('[data-capability-copy]');
  const action = document.querySelector('[data-capability-action]');
  const meta = document.querySelector('[data-capability-meta]');

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-capability');
      const item = key ? capabilities[key] : null;
      if (!item || !label || !copy || !action || !meta) return;
      for (const candidate of tabs) {
        const active = candidate === tab;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-selected', String(active));
      }
      label.textContent = item.label;
      copy.textContent = item.copy;
      action.textContent = item.action;
      meta.innerHTML = item.meta.map((value) => `<span>${value}</span>`).join('');
    });
  }

  const reveal = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    reveal.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.12 }
  );
  reveal.forEach((element) => revealObserver.observe(element));
}
