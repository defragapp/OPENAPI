document.documentElement.classList.add('js');

const recognitionScenarios = [
  {
    tab: 'The silence',
    input: '“I asked if something was wrong. They said they were fine, then went quiet.”',
    insight: 'You may be moving toward reassurance while they move toward space. The silence does not prove rejection; it does show pressure rising in different directions.',
    next: 'Lower the pressure: “I noticed the distance. We do not have to solve it right now. I am open when you are.”'
  },
  {
    tab: 'The decision',
    input: '“I need to decide today, but every option feels wrong.”',
    insight: 'Urgency may be louder than clarity. Your Baseline suggests that decisions improve after the whole picture is visible—not while the need to finish is in control.',
    next: 'Name what truly expires today. Pause everything else until the pressure drops.'
  },
  {
    tab: 'The same fight',
    input: '“We keep arguing about the same small thing.”',
    insight: 'The subject may be small while the roles underneath it are familiar: one person presses for resolution, the other protects space. The loop matters more than choosing a villain.',
    next: 'Name the loop before debating the subject: “I push when I feel distance. You pull back when you feel pressured.”'
  }
];

const publicObserver = new MutationObserver(renderPublicSurface);
publicObserver.observe(document.documentElement, { childList: true, subtree: true });
renderPublicSurface();

function renderPublicSurface() {
  if (location.pathname === '/') renderLaunchHome();
  else if (location.pathname === '/privacy' || location.pathname === '/terms') renderPolicyPage();
}

function renderLaunchHome() {
  const shell = document.querySelector('.entry-shell');
  if (!shell || shell.dataset.sovereignMarketing === 'true') return;

  shell.dataset.sovereignMarketing = 'true';
  shell.className = 'marketing-page marketing-home launch-page';
  document.title = 'Sovereign.OS — See what is really happening';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Bring the decision, the silence, the reaction, or the pressure. Sovereign starts with one private Baseline and helps you choose a cleaner next move.');
  ensureStyle('/marketing.css', 'sovereign-marketing');
  ensureStyle('/launch.css', 'sovereign-launch');
  ensureStyle('/launch-polish.css', 'sovereign-launch-polish');

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
        <section class="hero-v4 launch-hero-main sovereign-hero">
          <div class="hero-v4-copy reveal">
            <p class="marketing-kicker">Sovereign.OS · Human understanding system</p>
            <h1>See what is really happening.</h1>
            <p class="hero-v4-lede">Bring the decision, the silence, the reaction, or the pressure. Sovereign starts with your private Baseline, separates what is known from what is assumed, and helps you choose a cleaner next move.</p>
            <div class="marketing-actions">
              <a class="marketing-button primary" href="/signup">Build my Baseline</a>
              <a class="marketing-button secondary" href="#recognition-demo">See it work</a>
            </div>
            <div class="trust-row"><span>Start free</span><span>Private by design</span><span>No decoding required</span></div>
          </div>

          <div class="hero-product reveal" id="recognition-demo" aria-label="Interactive Sovereign product example">
            <div class="baseline-field" aria-hidden="true">
              <span class="baseline-ring ring-one"></span>
              <span class="baseline-ring ring-two"></span>
              <span class="baseline-ring ring-three"></span>
              <span class="baseline-axis axis-one"></span>
              <span class="baseline-axis axis-two"></span>
              <span class="baseline-core"></span>
              <span class="baseline-node node-one"></span>
              <span class="baseline-node node-two"></span>
              <span class="baseline-node node-three"></span>
            </div>

            <div class="recognition-frame">
              <div class="recognition-bar">
                <div><span class="recognition-status"></span><strong>SOVEREIGN · LIVE UNDERSTANDING</strong></div>
                <span>PRIVATE</span>
              </div>

              <div class="recognition-tabs" role="tablist" aria-label="Example moments">
                ${recognitionScenarios.map((scenario, index) => `<button type="button" role="tab" data-recognition-tab="${index}" aria-selected="${index === 0 ? 'true' : 'false'}" class="${index === 0 ? 'active' : ''}">${scenario.tab}</button>`).join('')}
              </div>

              <div class="recognition-body" data-recognition-panel aria-live="polite">
                <article class="recognition-input">
                  <span>What you described</span>
                  <p data-recognition-input>${recognitionScenarios[0].input}</p>
                </article>
                <article class="recognition-read">
                  <span>What may be happening</span>
                  <p data-recognition-insight>${recognitionScenarios[0].insight}</p>
                </article>
                <article class="recognition-next">
                  <span>Cleanest next move</span>
                  <p data-recognition-next>${recognitionScenarios[0].next}</p>
                </article>
                <footer class="recognition-basis"><span>Based on · Your Baseline + this moment</span><span>Unknowns remain unknown</span></footer>
              </div>
            </div>
          </div>
        </section>

        <section class="launch-section experience-section">
          <div class="launch-heading reveal"><div><p class="launch-kicker">Start with the lived moment</p><h2>People do not arrive with clean categories. They arrive with experiences.</h2></div><p>Sovereign turns the confusing moment into a grounded read of pressure, roles, responsibility, and what remains unknown.</p></div>
          <div class="experience-grid reveal">
            <article class="experience-card"><span>01</span><h3>Why do I keep reacting this way?</h3><p>Separate your Baseline tendency from the pressure that may be amplifying it now.</p></article>
            <article class="experience-card"><span>02</span><h3>Why did that land so hard?</h3><p>Look at the meaning, timing, and older context without turning one interpretation into certainty.</p></article>
            <article class="experience-card"><span>03</span><h3>Why do we keep having the same fight?</h3><p>Map the loop, the roles, and the point where each person begins protecting something different.</p></article>
          </div>
        </section>

        <section class="launch-section journey-section">
          <div class="launch-heading reveal"><div><p class="launch-kicker">One Sovereign workspace</p><h2>Understanding should move with you.</h2></div><p>The same private context supports the day, the decision, the relationship, and the system—without flattening them into the same answer.</p></div>
          <div class="journey-grid reveal">
            <article><span>01 · Baseline</span><h3>Who am I before the pressure?</h3><p>Build the private starting point for how you tend to decide, communicate, connect, and respond.</p></article>
            <article><span>02 · Today & Explore</span><h3>What is louder right now?</h3><p>Separate what is steady from what may be temporarily amplified.</p></article>
            <article><span>03 · People & Systems</span><h3>What happens between us?</h3><p>Use consented context to see differences, roles, friction, and repair without assigning hidden motives.</p></article>
            <article><span>04 · Library & Covenant</span><h3>What is worth carrying forward?</h3><p>Save only the understanding you choose. Explore agreements or Scripture only when you explicitly invite that lens.</p></article>
          </div>
        </section>
      </main>
    </div>

    <section class="baseline-section baseline-story">
      <div class="marketing-shell baseline-layout">
        <div class="baseline-copy reveal"><p class="marketing-kicker dark">Your Baseline</p><h2>Set it up once. Correct it as you go.</h2><p>Sovereign begins with a private model of your tendencies—not a fixed identity. Your corrections, current timing, and chosen Library items make the guidance more useful over time.</p></div>
        <div class="baseline-list reveal"><article><span>01</span><strong>Create</strong><p>Build one private Baseline.</p></article><article><span>02</span><strong>Bring</strong><p>Open Today or bring the real moment.</p></article><article><span>03</span><strong>Clarify</strong><p>Separate what is known, possible, and still unknown.</p></article><article><span>04</span><strong>Choose</strong><p>Leave with words, timing, a boundary, a repair, or a pause.</p></article></div>
      </div>
    </section>

    <div class="launch-shell">
      <section class="launch-section control-story">
        <div class="launch-heading reveal"><div><p class="launch-kicker">Useful without overreach</p><h2>Clear enough to use. Careful enough to trust.</h2></div><p>Sovereign is built to help you see more—not to claim another person’s mind, diagnose a relationship, or save everything forever.</p></div>
        <div class="launch-grid reveal"><article class="launch-card"><span>Private details</span><h3>Reduced before AI use.</h3><p>Raw birth input and exact private location stay outside the language model.</p></article><article class="launch-card"><span>Other people</span><h3>Permission is required.</h3><p>Each invited person chooses what may be used and can revoke it later.</p></article><article class="launch-card"><span>Your authority</span><h3>A suggestion is not a verdict.</h3><p>Confirm, correct, or reject what does not fit. Unknowns remain visible.</p></article></div>
      </section>

      <section class="launch-section"><div class="launch-callout reveal"><div><p class="launch-kicker">Start here</p><h2>Bring the real moment. Leave with a cleaner next move.</h2><p>Free includes Baseline, Today, Explore, and 10 AI turns each month. Sovereign+ adds consented People, Systems, Library continuity, Covenant, and export for $20 monthly or $99 annually.</p></div><div class="launch-actions"><a class="launch-button primary" href="/signup">Build my Baseline</a><a class="launch-button" href="/pricing.html">Compare plans</a></div></div></section>

      <footer class="launch-footer"><span>Private by default · Non-diagnostic · Permission before sharing</span><nav><a href="/how-it-works.html">How it works</a><a href="/pricing.html">Pricing</a><a href="/faq.html">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer>
    </div>
  `;

  activateReveal();
  activateRecognitionDemo();
}

function activateRecognitionDemo() {
  const panel = document.querySelector('[data-recognition-panel]');
  const tabs = [...document.querySelectorAll('[data-recognition-tab]')];
  if (!panel || tabs.length === 0) return;

  let activeIndex = 0;
  let rotationTimer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderScenario(index, shouldFocus = false) {
    const scenario = recognitionScenarios[index];
    if (!scenario) return;
    activeIndex = index;
    panel.classList.remove('is-refreshing');
    void panel.offsetWidth;
    panel.classList.add('is-refreshing');
    panel.querySelector('[data-recognition-input]').textContent = scenario.input;
    panel.querySelector('[data-recognition-insight]').textContent = scenario.insight;
    panel.querySelector('[data-recognition-next]').textContent = scenario.next;
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (shouldFocus) tabs[index]?.focus();
  }

  function restartRotation() {
    clearInterval(rotationTimer);
    if (reducedMotion) return;
    rotationTimer = setInterval(() => renderScenario((activeIndex + 1) % recognitionScenarios.length), 6800);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      renderScenario(index);
      restartRotation();
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      renderScenario(next, true);
      restartRotation();
    });
  });

  panel.closest('.recognition-frame')?.addEventListener('mouseenter', () => clearInterval(rotationTimer));
  panel.closest('.recognition-frame')?.addEventListener('mouseleave', restartRotation);
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(rotationTimer) : restartRotation());
  restartRotation();
}

function renderPolicyPage() {
  const shell = document.querySelector('.policy-shell');
  if (!shell || shell.dataset.launchPolicy === 'true') return;
  ensureStyle('/marketing.css', 'sovereign-marketing');
  ensureStyle('/launch.css', 'sovereign-launch');
  ensureStyle('/launch-polish.css', 'sovereign-launch-polish');
  shell.dataset.launchPolicy = 'true';
  shell.classList.add('launch-page', 'launch-shell', 'launch-policy');
  shell.querySelector('.wordmark')?.remove();
  const active = location.pathname === '/privacy' ? 'Privacy' : 'Terms';
  shell.insertAdjacentHTML('afterbegin', `
    <header class="launch-nav">
      <a class="launch-wordmark" href="/">SOVEREIGN.OS</a>
      <nav class="launch-links" aria-label="Public navigation">
        <a href="/how-it-works.html">How it works</a>
        <a href="/pricing.html">Pricing</a>
        <a href="/faq.html">FAQ</a>
        <a aria-current="page" href="${location.pathname}">${active}</a>
        <a class="launch-cta" href="/login">Sign in</a>
      </nav>
    </header>
  `);
  shell.insertAdjacentHTML('beforeend', `
    <footer class="launch-footer"><span>Questions: support@defrag.app</span><nav><a href="/">Overview</a><a href="/faq.html">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer>
  `);
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
