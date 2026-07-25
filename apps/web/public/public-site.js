document.documentElement.classList.add('js');

const publicObserver = new MutationObserver(renderLaunchHome);
publicObserver.observe(document.documentElement, { childList: true, subtree: true });
renderLaunchHome();

function renderLaunchHome() {
  if (location.pathname !== '/') return;
  const shell = document.querySelector('.entry-shell');
  if (!shell || shell.dataset.sovereignMarketing === 'true') return;

  shell.dataset.sovereignMarketing = 'true';
  shell.className = 'marketing-page marketing-home launch-page';
  document.title = 'Sovereign.OS — Personal AI with context';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Create one private Baseline. Use it for today, decisions, relationships, and groups without starting from zero each time.');
  ensureStyle('/marketing.css', 'sovereign-marketing');
  ensureStyle('/launch.css', 'sovereign-launch');

  shell.innerHTML = `
    <div class="launch-shell">
      <header class="launch-nav">
        <a class="launch-wordmark" href="/" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
        <nav class="launch-links" aria-label="Public navigation">
          <a href="/how-it-works.html">How it works</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/faq.html">FAQ</a>
          <a href="/login">Sign in</a>
          <a class="launch-cta" href="/signup">Create account</a>
        </nav>
      </header>

      <main>
        <section class="hero-v4 launch-hero-main">
          <div class="hero-v4-copy reveal">
            <p class="marketing-kicker">Personal AI with context</p>
            <h1>Start with who you are. Not a blank box.</h1>
            <p class="hero-v4-lede">Create one private Baseline. Sovereign uses it to help with decisions, conversations, relationships, and groups—without making you explain yourself from the beginning each time.</p>
            <div class="marketing-actions">
              <a class="marketing-button primary" href="/signup">Create free account</a>
              <a class="marketing-button secondary" href="#product">See the product</a>
            </div>
            <div class="trust-row"><span>Free plan available</span><span>Permission before sharing</span><span>Save only what helps</span></div>
          </div>

          <div class="hero-product reveal" id="product" aria-label="Sovereign product preview">
            <div class="app-frame app-frame-phone">
              <div class="app-frame-bar"><strong>SOVEREIGN</strong><span class="app-avatar">YOU</span></div>
              <div class="app-frame-body">
                <p class="app-overline">Today · Current view</p>
                <h2>The answer may feel urgent before it feels settled.</h2>
                <p class="app-intro">Your Baseline suggests that clarity improves when the whole picture is visible. Today may make finishing feel more important than checking the choice.</p>
                <article class="app-primary-card"><span>Next move</span><h3>Give the decision one more pass.</h3><p>Return after the pressure to finish has eased.</p></article>
                <div class="app-state-grid"><article><span>Usually true</span><strong>You decide better with the full picture.</strong></article><article class="warm"><span>Stronger now</span><strong>The need to finish may be louder today.</strong></article></div>
                <p class="app-uncertainty">Still unknown · You decide whether this fits.</p>
              </div>
              <nav class="app-frame-nav"><span class="active">Today</span><span>Explore</span><span>People</span><span>Systems</span><span>Library</span></nav>
            </div>
          </div>
        </section>

        <section class="launch-section">
          <div class="launch-heading reveal"><div><p class="launch-kicker">One workspace</p><h2>Use the same context in four ways.</h2></div><p>The source stays private. The visible answer stays short, useful, and open to correction.</p></div>
          <div class="launch-grid reveal">
            <article class="launch-card"><span>Today</span><h3>See what may matter now.</h3><p>Separate what is usually true from what may feel unusually strong today.</p></article>
            <article class="launch-card"><span>Decisions</span><h3>Separate clarity from pressure.</h3><p>Check whether the choice is settled or simply urgent.</p></article>
            <article class="launch-card"><span>People & systems</span><h3>See differences and roles.</h3><p>Use only consented information. Keep motives, responsibility, and unknowns separate.</p></article>
          </div>
        </section>
      </main>
    </div>

    <section class="baseline-section">
      <div class="marketing-shell baseline-layout">
        <div class="baseline-copy reveal"><p class="marketing-kicker dark">How it works</p><h2>Set it up once. Correct it as you go.</h2><p>Your Baseline gives Sovereign a steady place to begin. Your answers, corrections, current timing, and chosen Library items add context without turning you into a fixed type.</p></div>
        <div class="baseline-list reveal"><article><span>01</span><strong>Create</strong><p>Build a private Baseline.</p></article><article><span>02</span><strong>Use</strong><p>Open Today or ask a direct question.</p></article><article><span>03</span><strong>Correct</strong><p>Confirm, adjust, or reject what does not fit.</p></article><article><span>04</span><strong>Keep</strong><p>Save only the understanding you choose.</p></article></div>
      </div>
    </section>

    <div class="launch-shell">
      <section class="launch-section">
        <div class="launch-heading reveal"><div><p class="launch-kicker">Your control</p><h2>Private context has clear limits.</h2></div><p>Useful context should not require unlimited storage or access to another person.</p></div>
        <div class="launch-grid reveal"><article class="launch-card"><span>Private details</span><h3>Reduced before AI use.</h3><p>Raw birth input and exact private location stay outside the language model.</p></article><article class="launch-card"><span>Other people</span><h3>Permission is required.</h3><p>Each invited person chooses what may be used and can revoke it later.</p></article><article class="launch-card"><span>Your Library</span><h3>Nothing saves itself.</h3><p>Keep a short understanding only when you deliberately choose to save it.</p></article></div>
      </section>

      <section class="launch-section"><div class="launch-callout reveal"><div><p class="launch-kicker">Plans</p><h2>Start free. Add more when it becomes useful.</h2><p>Free includes Baseline, Today, Explore, and 10 AI turns each month. Sovereign+ adds People, Systems, Library continuity, Covenant, and export for $20 monthly or $99 annually.</p></div><div class="launch-actions"><a class="launch-button primary" href="/signup">Create free account</a><a class="launch-button" href="/pricing.html">Compare plans</a></div></div></section>

      <footer class="launch-footer"><span>Private by default · Non-diagnostic · Permission before sharing</span><nav><a href="/how-it-works.html">How it works</a><a href="/pricing.html">Pricing</a><a href="/faq.html">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer>
    </div>
  `;

  activateReveal();
}

function ensureStyle(href, key) {
  if (document.querySelector(`link[data-${key}]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset[key.replace('sovereign-', '')] = 'true';
  document.head.append(link);
}

function activateReveal() {
  const items = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .1 });
  items.forEach((item) => revealObserver.observe(item));
}
