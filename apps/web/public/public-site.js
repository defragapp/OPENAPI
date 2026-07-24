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
  document.title = 'Sovereign.OS — Baseline-aware intelligence for real life';
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'A private AI operating system that begins with your Baseline Design, current conditions, consented relationships, and saved understanding.'
  );

  ensureMarketingStyles();

  shell.innerHTML = `
    <div class="marketing-shell">
      <header class="marketing-nav">
        <a class="marketing-wordmark" href="/" aria-label="Sovereign.OS home">SOVEREIGN.OS</a>
        <nav class="marketing-nav-links" aria-label="Public navigation">
          <a href="/how-it-works.html">How it works</a>
          <a href="/login">Sign in</a>
          <a class="nav-cta" href="/signup">Enter Sovereign</a>
        </nav>
      </header>

      <section class="marketing-hero">
        <div class="marketing-hero-copy reveal">
          <p class="marketing-kicker">Baseline-aware intelligence</p>
          <h1 class="marketing-display">An AI that already knows <em>where to begin.</em></h1>
          <p class="marketing-lede">
            Sovereign.OS starts with your Baseline Design, what is active now, the people you have invited,
            and what you have chosen to remember. It turns that living context into clear guidance for
            decisions, relationships, pressure, timing, and the next move.
          </p>
          <div class="marketing-actions">
            <a class="marketing-button primary" href="/signup">Build my Baseline</a>
            <a class="marketing-button secondary" href="#living-intelligence">See the intelligence</a>
          </div>
          <ul class="marketing-trust" aria-label="Product principles">
            <li>Private by design</li>
            <li>Permission before comparison</li>
            <li>No diagnosis or destiny claims</li>
          </ul>
        </div>

        <div class="signal-stage reveal" aria-label="Conceptual map of the Sovereign.OS living context">
          <div class="signal-grid"></div>
          <div class="signal-glow"></div>
          <div class="signal-orbit">
            <div class="signal-axis"></div>
            <div class="signal-core"><span>Living Baseline</span></div>
            <div class="signal-dot one"></div>
            <div class="signal-dot two"></div>
            <div class="signal-dot three"></div>
            <div class="signal-dot four"></div>
            <div class="signal-node baseline"><span>Baseline</span><strong>Who you are</strong></div>
            <div class="signal-node today"><span>Today</span><strong>What is active</strong></div>
            <div class="signal-node people"><span>People</span><strong>Who is connected</strong></div>
            <div class="signal-node systems"><span>Systems</span><strong>What the group carries</strong></div>
            <div class="signal-node memory"><span>Library</span><strong>What you kept</strong></div>
          </div>
        </div>
      </section>
    </div>

    <section class="marketing-band">
      <div class="marketing-shell marketing-band-inner">
        <div class="reveal">
          <p class="marketing-kicker">It starts before you type</p>
          <h2 class="marketing-section-title">Most AI waits for a prompt. Sovereign begins with a map.</h2>
        </div>
        <div class="marketing-section-copy reveal">
          <p>
            A blank chat box makes you explain yourself from zero. Sovereign.OS is different.
            <strong>Your private context is already organized around you</strong>—so the first useful thing
            it can show you is not a question about what happened. It is what may be relevant now.
          </p>
          <div class="context-stack">
            <div class="context-row"><span>Baseline</span><p>How you naturally decide, communicate, learn, connect, and respond under pressure.</p></div>
            <div class="context-row"><span>Live context</span><p>What may be amplified today without treating timing as fate or proof.</p></div>
            <div class="context-row"><span>People</span><p>Consented relationship context that never assumes another person’s hidden state.</p></div>
            <div class="context-row"><span>Systems</span><p>Family, friendship, household, and team roles viewed without assigning a villain.</p></div>
            <div class="context-row"><span>Continuity</span><p>Only the understandings you deliberately keep—not an endless archive of private conversation.</p></div>
          </div>
        </div>
      </div>
    </section>

    <div class="marketing-shell">
      <section class="marketing-section" id="living-intelligence">
        <header class="marketing-section-head reveal">
          <div>
            <p class="marketing-kicker">A living intelligence</p>
            <h2 class="marketing-section-title">See what is active before it becomes the whole decision.</h2>
          </div>
          <p>
            Sovereign translates a large private context into ordinary language. The systems remain in the
            background. The guidance stays readable, specific, and open to your correction.
          </p>
        </header>

        <div class="intelligence-layout reveal">
          <div class="intelligence-tabs" role="tablist" aria-label="Example Sovereign themes">
            <button class="intelligence-tab active" type="button" data-insight="today" role="tab" aria-selected="true">
              <span>Today</span><strong>Current signal</strong>
            </button>
            <button class="intelligence-tab" type="button" data-insight="decision" role="tab" aria-selected="false">
              <span>Decisions</span><strong>How clarity arrives</strong>
            </button>
            <button class="intelligence-tab" type="button" data-insight="relationship" role="tab" aria-selected="false">
              <span>People</span><strong>Where pace differs</strong>
            </button>
            <button class="intelligence-tab" type="button" data-insight="system" role="tab" aria-selected="false">
              <span>Systems</span><strong>What you are carrying</strong>
            </button>
          </div>
          <article class="intelligence-output" aria-live="polite">
            <span class="intelligence-label" data-insight-label>Example · Today</span>
            <blockquote class="intelligence-quote" data-insight-copy>
              Urgency may be louder than importance today. Let the second answer matter more than the first.
            </blockquote>
            <div class="intelligence-meta" data-insight-meta>
              <span>Baseline tendency</span><span>Current amplification</span><span>Unknown state preserved</span>
            </div>
          </article>
        </div>
      </section>

      <section class="marketing-section">
        <header class="marketing-section-head reveal">
          <div>
            <p class="marketing-kicker">One intelligence. Multiple views.</p>
            <h2 class="marketing-section-title">Your life is not divided into separate apps.</h2>
          </div>
          <p>
            Today, Explore, People, Systems, Library, and You are different views of the same private
            intelligence—not a collection of disconnected tools.
          </p>
        </header>

        <div class="lens-grid">
          <article class="lens-item is-accent reveal">
            <span class="lens-number">01 · TODAY</span>
            <h3>What is asking for your attention now?</h3>
            <p>See the difference between your usual way of operating and what may be unusually active today.</p>
          </article>
          <article class="lens-item reveal">
            <span class="lens-number">02 · EXPLORE</span>
            <h3>Understand yourself without reducing yourself.</h3>
            <p>Explore decisions, communication, learning, love, pressure, expression, and the return to clarity.</p>
          </article>
          <article class="lens-item reveal">
            <span class="lens-number">03 · PEOPLE</span>
            <h3>See two designs without deciding who is wrong.</h3>
            <p>Compare only what has been shared with permission, keeping each person’s responsibility separate.</p>
          </article>
          <article class="lens-item is-accent reveal">
            <span class="lens-number">04 · SYSTEMS</span>
            <h3>Notice what a family or team has learned to place on you.</h3>
            <p>Map roles, pressure, authority, dependence, and missing information without turning the group into a diagnosis.</p>
          </article>
        </div>
      </section>

      <section class="marketing-section">
        <header class="marketing-section-head reveal">
          <div>
            <p class="marketing-kicker">Not another chatbot</p>
            <h2 class="marketing-section-title">Stop starting from zero.</h2>
          </div>
        </header>
        <div class="comparison reveal">
          <article class="comparison-column">
            <span class="comparison-label">Typical AI</span>
            <h3>A blank box with no memory of who you are.</h3>
            <ul class="comparison-list">
              <li>You supply the context again.</li>
              <li>The advice begins with the latest paragraph.</li>
              <li>Relationships are flattened into one person’s account.</li>
              <li>Useful insight disappears into conversation history.</li>
            </ul>
          </article>
          <article class="comparison-column">
            <span class="comparison-label">Sovereign.OS</span>
            <h3>A living private context that becomes more useful over time.</h3>
            <ul class="comparison-list">
              <li>Your Baseline is already available.</li>
              <li>Current timing is separated from enduring tendency.</li>
              <li>People and systems require explicit consent.</li>
              <li>You choose which understandings become part of your Library.</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="marketing-section">
        <p class="marketing-statement reveal">The goal is not to tell you who you are. It is to help you see <em>what is available now.</em></p>
      </section>

      <section class="marketing-closing">
        <div class="reveal">
          <p class="marketing-kicker">Sovereign.OS</p>
          <h2 class="marketing-statement">Live a life you would choose to watch again.</h2>
          <p>
            Begin with an intelligence that remembers who you are—not only what you typed today.
          </p>
          <div class="marketing-actions">
            <a class="marketing-button primary" href="/signup">Start with my Baseline</a>
            <a class="marketing-button secondary" href="/how-it-works.html">Explore how it works</a>
          </div>
        </div>
      </section>

      <footer class="marketing-footer">
        <span>Private context · Consent-aware relationships · Clear human language</span>
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
  const insights = {
    today: {
      label: 'Example · Today',
      copy: 'Urgency may be louder than importance today. Let the second answer matter more than the first.',
      meta: ['Baseline tendency', 'Current amplification', 'Unknown state preserved']
    },
    decision: {
      label: 'Example · Decisions',
      copy: 'Your clearest choices arrive when pressure is separated from importance. Time is part of the decision.',
      meta: ['Decision pattern', 'Pressure response', 'Practical next move']
    },
    relationship: {
      label: 'Example · People',
      copy: 'The friction may be less about care than timing: one person seeks resolution while the other is still processing.',
      meta: ['Two Baselines', 'Consent checked', 'Motive not inferred']
    },
    system: {
      label: 'Example · Systems',
      copy: 'You may be carrying repair because the group has learned to wait for you to do it. Responsibility can be redistributed.',
      meta: ['Role context', 'Shared constraints', 'No group diagnosis']
    }
  };

  const tabs = [...document.querySelectorAll('.intelligence-tab')];
  const label = document.querySelector('[data-insight-label]');
  const copy = document.querySelector('[data-insight-copy]');
  const meta = document.querySelector('[data-insight-meta]');

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-insight');
      const item = key ? insights[key] : null;
      if (!item || !label || !copy || !meta) return;
      for (const candidate of tabs) {
        const active = candidate === tab;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-selected', String(active));
      }
      label.textContent = item.label;
      copy.textContent = item.copy;
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
    { threshold: 0.13 }
  );
  reveal.forEach((element) => revealObserver.observe(element));
}
