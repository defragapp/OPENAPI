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
  document.title = 'Sovereign.OS — Personal AI that starts with context';
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Create one private Baseline. Sovereign uses it to make guidance for today, decisions, relationships, and groups more relevant from the start.'
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

      <main>
        <section class="hero-v4">
          <div class="hero-v4-copy reveal">
            <p class="marketing-kicker">Personal AI with a better starting point</p>
            <h1>Personal AI that doesn’t make you start over.</h1>
            <p class="hero-v4-lede">
              Create one private Baseline of how you tend to decide, communicate, learn, and handle pressure.
              Sovereign uses it to make today’s guidance more relevant—without asking you to explain everything again.
            </p>
            <div class="marketing-actions">
              <a class="marketing-button primary" href="/signup">Create my Baseline</a>
              <a class="marketing-button secondary" href="#experience">See a real example</a>
            </div>
            <div class="trust-row" aria-label="Product principles">
              <span>Private by default</span>
              <span>Sharing needs permission</span>
              <span>Save only what you choose</span>
            </div>
          </div>

          <div class="hero-product reveal" aria-label="Preview of the Sovereign Today screen">
            <div class="app-frame app-frame-phone">
              <div class="app-frame-bar">
                <strong>SOVEREIGN</strong>
                <span class="app-avatar">CO</span>
              </div>
              <div class="app-frame-body">
                <p class="app-overline">Today · Friday</p>
                <h2>A fast answer may feel clearer than it is.</h2>
                <p class="app-intro">
                  Your Baseline suggests that seeing the whole picture may help you decide. Today may make the
                  first complete answer feel final too quickly.
                </p>
                <article class="app-primary-card">
                  <span>Try this</span>
                  <h3>Give the decision one more pass.</h3>
                  <p>Return after the pressure to finish has eased.</p>
                </article>
                <div class="app-state-grid">
                  <article><span>Baseline tendency</span><strong>Clarity improves when the full picture is visible.</strong></article>
                  <article class="warm"><span>Current amplification</span><strong>The need to finish may feel stronger today.</strong></article>
                </div>
                <p class="app-uncertainty">Unknown actual state · You decide whether this fits.</p>
              </div>
              <nav class="app-frame-nav" aria-label="Product preview navigation">
                <span class="active">Today</span><span>Explore</span><span>People</span><span>Systems</span><span>Library</span>
              </nav>
            </div>
          </div>
        </section>

        <section class="showcase-section" id="experience">
          <div class="section-heading reveal">
            <p class="marketing-kicker">See it work</p>
            <h2>One private starting point. Different kinds of help.</h2>
            <p>Choose a view to see how the same Baseline can support today, a decision, another person, or a group.</p>
          </div>

          <div class="showcase-layout reveal">
            <div class="showcase-tabs" role="tablist" aria-label="Sovereign examples">
              <button class="showcase-tab active" type="button" role="tab" aria-selected="true" data-view="today">
                <span>Today</span><strong>What may deserve attention now</strong>
              </button>
              <button class="showcase-tab" type="button" role="tab" aria-selected="false" data-view="decision">
                <span>Decisions</span><strong>Separate the choice from the pressure</strong>
              </button>
              <button class="showcase-tab" type="button" role="tab" aria-selected="false" data-view="people">
                <span>People</span><strong>Understand where two approaches differ</strong>
              </button>
              <button class="showcase-tab" type="button" role="tab" aria-selected="false" data-view="systems">
                <span>Groups</span><strong>See the role you are expected to play</strong>
              </button>
            </div>

            <div class="showcase-product">
              <div class="desktop-app">
                <aside class="desktop-app-nav">
                  <strong>S</strong>
                  <span class="active">Today</span>
                  <span>Explore</span>
                  <span>People</span>
                  <span>Systems</span>
                  <span>Library</span>
                </aside>
                <article class="desktop-app-main" aria-live="polite">
                  <div class="desktop-app-topline">
                    <span data-view-label>Today · Current view</span>
                    <span>Private workspace</span>
                  </div>
                  <h3 data-view-title>A fast answer may feel clearer than it is.</h3>
                  <p data-view-summary>
                    Your Baseline suggests that seeing the whole picture may help you decide. Today may make the
                    first complete answer feel final too quickly.
                  </p>
                  <article class="desktop-app-action">
                    <span>Try this</span>
                    <strong data-view-action>Give the decision one more pass after the pressure has eased.</strong>
                  </article>
                  <div class="desktop-app-states">
                    <article><span data-state-one-label>Baseline tendency</span><strong data-state-one>Clarity improves when the full picture is visible.</strong></article>
                    <article class="warm"><span data-state-two-label>Current amplification</span><strong data-state-two>The need to finish may feel stronger today.</strong></article>
                    <article class="quiet"><span>Unknown actual state</span><strong data-state-three>You decide whether this description fits.</strong></article>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <section class="baseline-section">
      <div class="marketing-shell baseline-layout">
        <div class="baseline-copy reveal">
          <p class="marketing-kicker dark">Your Baseline</p>
          <h2>Set it up once. Use it whenever you need clarity.</h2>
          <p>
            Your Baseline is a private description of how you tend to work. It gives Sovereign a consistent
            place to begin, while leaving room for change, context, and your own judgment.
          </p>
        </div>
        <div class="baseline-list reveal">
          <article><span>01</span><strong>Decisions</strong><p>How clarity tends to arrive for you.</p></article>
          <article><span>02</span><strong>Communication</strong><p>How you take in information and express what matters.</p></article>
          <article><span>03</span><strong>Connection</strong><p>What helps you work well with other people.</p></article>
          <article><span>04</span><strong>Pressure</strong><p>What can change when time, expectations, or emotion rise.</p></article>
        </div>
      </div>
    </section>

    <div class="marketing-shell">
      <section class="control-section">
        <div class="section-heading reveal">
          <p class="marketing-kicker">Your information</p>
          <h2>Your information stays under your control.</h2>
          <p>Private context is useful only when the rules are clear.</p>
        </div>
        <div class="control-grid reveal">
          <article><span>Private details</span><h3>Reduced before AI use.</h3><p>The model receives only the relevant result, not the raw details used to create it.</p></article>
          <article><span>Other people</span><h3>Included only with permission.</h3><p>Each person chooses what may be shared and can remove access later.</p></article>
          <article><span>Your Library</span><h3>Saved only when you choose.</h3><p>Keep the useful understanding without keeping every private conversation forever.</p></article>
        </div>
      </section>

      <section class="closing-v4">
        <div class="closing-v4-inner reveal">
          <p class="marketing-kicker">Sovereign.OS</p>
          <h2>Give your personal AI a better place to begin.</h2>
          <p>Create your private Baseline, then use it across today, decisions, relationships, and groups.</p>
          <div class="marketing-actions centered">
            <a class="marketing-button primary" href="/signup">Create my Baseline</a>
            <a class="marketing-button secondary" href="/how-it-works.html">See how it works</a>
          </div>
        </div>
      </section>

      <footer class="marketing-footer">
        <span>Private by default · Permission before sharing · Clear human language</span>
        <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/login">Sign in</a></nav>
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
  const examples = {
    today: {
      label: 'Today · Current view',
      title: 'A fast answer may feel clearer than it is.',
      summary: 'Your Baseline suggests that seeing the whole picture may help you decide. Today may make the first complete answer feel final too quickly.',
      action: 'Give the decision one more pass after the pressure has eased.',
      oneLabel: 'Baseline tendency',
      one: 'Clarity improves when the full picture is visible.',
      twoLabel: 'Current amplification',
      two: 'The need to finish may feel stronger today.',
      three: 'You decide whether this description fits.'
    },
    decision: {
      label: 'Decision · Current question',
      title: 'The choice may be clear. The timing may not be.',
      summary: 'Your Baseline suggests that a settled answer matters more than a fast one. Outside pressure may be asking you to move before your own reasoning is complete.',
      action: 'Name what changes if the answer waits until tomorrow.',
      oneLabel: 'What usually helps',
      one: 'Time to compare the choice with the whole picture.',
      twoLabel: 'What may be adding pressure',
      two: 'The wish to stop carrying the open question.',
      three: 'Sovereign cannot know whether you are ready until you decide.'
    },
    people: {
      label: 'People · Shared with permission',
      title: 'You may be solving the conversation at different speeds.',
      summary: 'One person may want a clear answer now. The other may need more time before speaking. Difference in pace does not prove a difference in care.',
      action: 'Agree on when the conversation will continue instead of forcing an answer now.',
      oneLabel: 'Your usual approach',
      one: 'Understanding improves through a complete conversation.',
      twoLabel: 'Their shared approach',
      two: 'Clarity may arrive after private processing time.',
      three: 'Neither person’s exact feelings or motives are assumed.'
    },
    systems: {
      label: 'Groups · Family or team',
      title: 'You may be doing the work because everyone expects you to.',
      summary: 'A group can become used to one person calming, fixing, explaining, or deciding. That expectation can continue even when it no longer works.',
      action: 'Choose one part that can be returned to the person or group it belongs to.',
      oneLabel: 'Role you often take',
      one: 'Turning uncertainty into a workable next step.',
      twoLabel: 'What the group may expect',
      two: 'That you will carry the unfinished part.',
      three: 'The group is not labeled, and responsibility stays separate.'
    }
  };

  const tabs = [...document.querySelectorAll('.showcase-tab')];
  const bindings = {
    label: document.querySelector('[data-view-label]'),
    title: document.querySelector('[data-view-title]'),
    summary: document.querySelector('[data-view-summary]'),
    action: document.querySelector('[data-view-action]'),
    oneLabel: document.querySelector('[data-state-one-label]'),
    one: document.querySelector('[data-state-one]'),
    twoLabel: document.querySelector('[data-state-two-label]'),
    two: document.querySelector('[data-state-two]'),
    three: document.querySelector('[data-state-three]')
  };

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const key = tab.dataset.view;
      const example = key ? examples[key] : null;
      if (!example) return;
      for (const item of tabs) {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      }
      for (const [name, node] of Object.entries(bindings)) {
        if (node) node.textContent = example[name];
      }
    });
  }

  const reveal = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    reveal.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  reveal.forEach((item) => revealObserver.observe(item));
}
