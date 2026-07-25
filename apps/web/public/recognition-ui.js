const nativeFetch = window.fetch.bind(window);

const visualMeta = {
  fool: { title: 'The Fool', numeral: '0', motif: 'A beginning still becoming itself.' },
  magician: { title: 'The Magician', numeral: 'I', motif: 'Ability gathered into deliberate action.' },
  three_of_cups: { title: 'Three of Cups', numeral: 'III', motif: 'Belonging created through shared experience.' },
  hermit: { title: 'The Hermit', numeral: 'IX', motif: 'Distance used to recover inner direction.' },
  strength: { title: 'Strength', numeral: 'VIII', motif: 'Power held without force.' },
  tower: { title: 'The Tower', numeral: 'XVI', motif: 'A structure changing because it can no longer hold.' }
};

const phaseMeta = {
  origin: { tab: 'Past protection', label: 'WHAT THIS ROLE MAY HAVE LEARNED', card: 'Past protection' },
  shadow: { tab: 'Under pressure', label: 'HOW IT MAY ACT UNDER PRESSURE', card: 'Under pressure' },
  gift: { tab: 'Clear expression', label: 'THE CAPACITY INSIDE THE ROLE', card: 'Clear expression' }
};

let latestOffer = null;
let latestVisual = null;
let visualPhase = 'shadow';
let feedbackState = 'idle';
let shareFrameworkEvidence = false;
let renderFrame = 0;
let playTimeout = 0;
let playbackToken = 0;

window.fetch = async (...args) => {
  const input = args[0];
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const response = await nativeFetch(...addFrameworkScopeWhenSelected(url, args));
  const match = url.match(/\/api\/v1\/threads\/([^/]+)\/messages(?:\?|$)/);

  if (match && response.ok) {
    const threadId = decodeURIComponent(match[1]);
    const offered = response.headers.get('x-sovereign-module-offer') === '1';
    latestOffer = offered
      ? { threadId, title: decodeTitle(response.headers.get('x-sovereign-module-title') || '') }
      : null;
    latestVisual = decodeVisualPayload(response.headers.get('x-sovereign-visual-story') || '', threadId);
    visualPhase = latestVisual?.story?.primary?.phase || 'shadow';
    feedbackState = 'idle';
    stopPlayback();
    scheduleEnhancements();
  }

  return response;
};

const mutationObserver = new MutationObserver(scheduleEnhancements);
mutationObserver.observe(document.documentElement, { childList: true, subtree: true });

const visibilityObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle('visual-story-offscreen', !entry.isIntersecting);
    }, { rootMargin: '180px 0px' })
  : null;

scheduleEnhancements();

function scheduleEnhancements() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(renderEnhancements);
}

function renderEnhancements() {
  renderThreadVisualStory();
  renderOffer();
  renderFrameworkConsentControl();
}

function latestResultPanel() {
  const panels = [...document.querySelectorAll('.result-panel')];
  return panels.reverse().find((panel) => panel.querySelector('.streamed-copy')) || null;
}

function renderThreadVisualStory() {
  const targetPanel = latestResultPanel();
  const existingSections = [...document.querySelectorAll('[data-thread-visual-story]')];

  if (!targetPanel || !latestVisual) {
    existingSections.forEach((section) => section.remove());
    return;
  }

  existingSections.forEach((section) => {
    if (!targetPanel.contains(section)) section.remove();
  });

  const section = targetPanel.querySelector('[data-thread-visual-story]') || document.createElement('section');
  const renderKey = visualRenderKey(latestVisual, visualPhase, feedbackState);

  section.dataset.threadVisualStory = 'true';
  section.dataset.visualContract = 'interpretation-first-artwork-second';
  section.dataset.phase = visualPhase;
  section.dataset.feedback = feedbackState;
  section.className = 'thread-visual-story';

  if (section.dataset.renderKey !== renderKey) {
    section.dataset.renderKey = renderKey;
    section.innerHTML = renderVisualStory(latestVisual);
    bindVisualStoryControls(section);
  }

  if (!section.isConnected) {
    const moduleOffer = targetPanel.querySelector('[data-recognition-module-offer]');
    if (moduleOffer) moduleOffer.insertAdjacentElement('beforebegin', section);
    else targetPanel.append(section);
    visibilityObserver?.observe(section);
  }
}

function visualRenderKey(payload, phase, feedback) {
  const story = payload.story;
  return [
    payload.threadId,
    story.mode,
    story.primary.archetype,
    story.primary.title,
    story.secondary?.archetype || '',
    story.tertiary?.archetype || '',
    phase,
    feedback
  ].join(':');
}

function renderVisualStory(payload) {
  const story = payload.story;
  const cards = [story.primary, story.secondary, story.tertiary].filter(Boolean);
  const phaseCopy = phaseText(story, visualPhase);
  const phase = phaseMeta[visualPhase] || phaseMeta.shadow;
  const modeLabel = story.mode === 'interaction'
    ? 'Consented interaction'
    : story.mode === 'family'
      ? 'Permitted family system'
      : 'Personal role';

  return `
    <header class="thread-visual-header">
      <div>
        <p class="eyebrow">ARCHETYPE IN MOTION · ${escapeVisual(modeLabel.toUpperCase())}</p>
        <h3>See how the role moves.</h3>
        <p>The answer comes from your confirmed experience and Baseline. The artwork shows the same role protecting, tightening under pressure, and returning to a clearer use.</p>
      </div>
      <span class="thread-visual-rule">Answer first · Art second</span>
    </header>

    <div class="thread-visual-layout" data-mode="${story.mode}">
      <div class="thread-card-column">
        <div class="thread-card-stage thread-card-stage-${story.mode}" aria-label="Animated archetype visualization">
          ${cards.map((card, index) => renderVisualCard(card, index, cards.length)).join('')}
          ${cards.length > 1 ? '<div class="thread-role-connection" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}
        </div>
        <p class="thread-card-context">${escapeVisual(modeCaption(story.mode))}</p>
      </div>

      <div class="thread-visual-copy">
        <div class="thread-movement-toolbar">
          <button type="button" class="thread-play-button" data-visual-play aria-label="Play the movement from past protection through clear expression">
            <span aria-hidden="true">${feedbackState === 'playing' ? '■' : '▶'}</span>
            ${feedbackState === 'playing' ? 'Playing movement' : 'Play the movement'}
          </button>
          <span class="thread-phase-progress">${phaseIndex(visualPhase)} of 3 · ${escapeVisual(phase.tab)}</span>
        </div>

        <div class="thread-phase-control" aria-label="View three expressions of the same role">
          ${Object.entries(phaseMeta).map(([key, value], index) => `
            <button type="button" data-visual-phase="${key}" class="${visualPhase === key ? 'active' : ''}" aria-pressed="${visualPhase === key}">
              <span>${index + 1}</span>${escapeVisual(value.tab)}
            </button>
          `).join('')}
        </div>

        <div class="thread-visual-state" aria-live="polite">
          <span>${escapeVisual(phase.label)}</span>
          <h4>${escapeVisual(story.primary.title)}</h4>
          <p>${escapeVisual(phaseCopy)}</p>
        </div>

        <div class="thread-visual-summary-grid">
          <article><span>ACTIVE NOW</span><p>${escapeVisual(story.current)}</p></article>
          <article class="thread-next-step"><span>ONE NEXT STEP</span><p>${escapeVisual(story.next_step)}</p></article>
        </div>

        <details class="thread-visual-basis">
          <summary>What shaped this view</summary>
          <p>${escapeVisual(story.visual_reason)}</p>
          <div>
            <article><span>Baseline / natal design</span><strong>${escapeVisual(sourceLine(payload.basis, ['human_design', 'gene_keys', 'astrology'], 'No Baseline detail was required for this answer.'))}</strong></article>
            <article><span>Current timing</span><strong>${escapeVisual(sourceLine(payload.basis, ['live'], 'No timing factor was required for this answer.'))}</strong></article>
            ${story.mode !== 'self' ? `<article><span>Permitted relationship context</span><strong>${escapeVisual(sourceLine(payload.basis, ['relationship'], 'No other person is shown without active permission.'))}</strong></article>` : ''}
            <article><span>Your confirmation</span><strong>${payload.basis.user_confirmed ? 'Confirmed in this thread.' : 'Not confirmed.'}</strong></article>
          </div>
        </details>

        <div class="thread-visual-actions">
          <button type="button" class="primary-button" data-visual-confirm>This fits</button>
          <button type="button" class="secondary-button" data-visual-partly>Partly</button>
          <button type="button" class="quiet-button" data-visual-not-today>Not today</button>
        </div>
        <p class="thread-visual-status" aria-live="polite">${escapeVisual(feedbackMessage())}</p>
      </div>
    </div>
  `;
}

function renderVisualCard(card, index, count) {
  const meta = visualMeta[card.archetype] || visualMeta.fool;
  const sizeClass = count === 1 ? 'primary' : count === 2 ? 'pair' : 'family';
  const phase = phaseMeta[visualPhase] || phaseMeta.shadow;
  const titleId = `visual-card-${index}-${card.archetype}`;

  return `
    <article class="thread-visual-card thread-visual-card-${sizeClass}" data-card-index="${index}" data-archetype="${card.archetype}" data-phase="${visualPhase}" data-motion-engine="layered-svg">
      <div class="thread-card-frame">
        <div class="thread-card-heading"><span>${escapeVisual(meta.numeral)}</span><strong>${escapeVisual(meta.title)}</strong></div>
        <div class="thread-card-art">
          ${renderArchetypeSvg(card.archetype, index, titleId)}
          <div class="thread-card-light" aria-hidden="true"></div>
          <div class="thread-card-vignette" aria-hidden="true"></div>
        </div>
        <div class="thread-card-caption">
          <span>${escapeVisual(phase.card)}</span>
          <h5 id="${titleId}">${escapeVisual(card.title)}</h5>
          <p>${escapeVisual(meta.motif)}</p>
        </div>
      </div>
    </article>
  `;
}

function renderArchetypeSvg(archetype, index, titleId) {
  const title = visualMeta[archetype]?.title || 'Archetype';
  const start = `<svg viewBox="0 0 300 430" role="img" aria-labelledby="${titleId}-svg-title" xmlns="http://www.w3.org/2000/svg"><title id="${titleId}-svg-title">${escapeVisual(title)} visual</title><defs><linearGradient id="paper-${index}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1e8d3"/><stop offset=".62" stop-color="#dcc9a7"/><stop offset="1" stop-color="#c4a77d"/></linearGradient><radialGradient id="glow-${index}"><stop stop-color="#f1c774" stop-opacity=".9"/><stop offset="1" stop-color="#f1c774" stop-opacity="0"/></radialGradient><filter id="rough-${index}"><feTurbulence baseFrequency=".72" numOctaves="2" seed="${index + 3}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale=".45"/></filter></defs><rect x="8" y="8" width="284" height="414" rx="10" fill="url(#paper-${index})" stroke="#34251f" stroke-width="4"/><rect x="19" y="20" width="262" height="388" rx="5" fill="none" stroke="#6c4a36" stroke-width="1.7"/><g class="visual-grain" opacity=".14"><path d="M23 61h254M23 113h254M23 165h254M23 217h254M23 269h254M23 321h254M23 373h254" stroke="#5d4334" stroke-dasharray="2 9"/></g><g filter="url(#rough-${index})">`;
  const end = '</g></svg>';
  const scenes = {
    fool: `<circle class="visual-halo" cx="238" cy="74" r="44" fill="url(#glow-${index})"/><circle cx="238" cy="74" r="24" fill="#e5b957" stroke="#34251f" stroke-width="3"/><path class="visual-environment" d="M32 355c54-26 116-8 154-22 34-12 48-43 80-37v78H32Z" fill="#81906e" stroke="#34251f" stroke-width="3"/><path d="M202 329l49-44 27 2-10 68Z" fill="#a88461" stroke="#34251f" stroke-width="3"/><g class="visual-figure"><circle cx="139" cy="111" r="19" fill="#e6c397" stroke="#34251f" stroke-width="3"/><path d="M116 97c7-27 40-31 53-8-17-2-35 4-53 8Z" fill="#c85f41" stroke="#34251f" stroke-width="3"/><path d="M123 132c22-8 40-3 51 14l20 96-85 8 2-83Z" fill="#d35e3d" stroke="#34251f" stroke-width="4"/><path d="M113 159 78 215" stroke="#34251f" stroke-width="13" stroke-linecap="round"/><path class="visual-arm" d="M168 157l48 44" stroke="#34251f" stroke-width="13" stroke-linecap="round"/><path d="M123 249 104 327M171 248l28 77" stroke="#34251f" stroke-width="14" stroke-linecap="round"/></g><g class="visual-symbol"><path d="M181 119 222 79" stroke="#34251f" stroke-width="5"/><path d="M194 105c18 7 30 18 35 34-17-1-31-8-43-20Z" fill="#c28950" stroke="#34251f" stroke-width="3"/></g><g class="visual-secondary"><circle cx="80" cy="306" r="13" fill="#ead1a3" stroke="#34251f" stroke-width="3"/><path d="M70 317c-12 7-17 20-15 35 18-4 31-15 37-31Z" fill="#eee9db" stroke="#34251f" stroke-width="3"/></g>`,
    magician: `<circle class="visual-halo" cx="150" cy="92" r="64" fill="url(#glow-${index})"/><path class="visual-halo-line" d="M111 70c18-25 59-25 78 0-19 25-60 25-78 0Z" fill="none" stroke="#9c623d" stroke-width="5"/><g class="visual-figure"><circle cx="150" cy="112" r="20" fill="#e5bf93" stroke="#34251f" stroke-width="3"/><path d="M124 99c13-22 39-25 55-5-17-2-35 0-55 5Z" fill="#d3a34e" stroke="#34251f" stroke-width="3"/><path d="M119 140c22-10 48-8 64 10l12 104H104l12-85Z" fill="#526d7b" stroke="#34251f" stroke-width="4"/><path class="visual-arm" d="M120 158 78 213" stroke="#34251f" stroke-width="13" stroke-linecap="round"/><path class="visual-symbol" d="M181 157 210 83" stroke="#34251f" stroke-width="13" stroke-linecap="round"/><path class="visual-wand" d="M216 79 232 31" stroke="#b3543d" stroke-width="7" stroke-linecap="round"/></g><g class="visual-environment"><path d="M61 251h178l-10 26H72Z" fill="#b7794b" stroke="#34251f" stroke-width="4"/><path d="M82 276 67 363M219 276l14 87" stroke="#34251f" stroke-width="8"/></g><g class="visual-secondary"><circle cx="103" cy="237" r="13" fill="#d8ab51" stroke="#34251f" stroke-width="3"/><path d="M143 224h29v24h-29Z" fill="#b34e38" stroke="#34251f" stroke-width="3"/><path d="M196 244c0-22 25-22 25 0Z" fill="#70846e" stroke="#34251f" stroke-width="3"/></g><path d="M39 365c58-20 158-17 222 0" fill="none" stroke="#58725e" stroke-width="8" stroke-linecap="round"/>`,
    three_of_cups: `<circle class="visual-halo" cx="150" cy="92" r="72" fill="url(#glow-${index})"/><path class="visual-environment" d="M31 345c60-22 174-22 238 0v43H31Z" fill="#76845f" stroke="#34251f" stroke-width="3"/><g class="visual-figure"><circle cx="83" cy="151" r="17" fill="#e6c096" stroke="#34251f" stroke-width="3"/><path d="M61 177c16-11 35-10 49 3l18 134H52l2-99Z" fill="#e4dec8" stroke="#34251f" stroke-width="4"/><circle cx="150" cy="136" r="18" fill="#d7aa83" stroke="#34251f" stroke-width="3"/><path d="M123 164c19-13 41-11 57 5l23 150h-94l3-111Z" fill="#b94f3a" stroke="#34251f" stroke-width="4"/><circle cx="220" cy="151" r="17" fill="#dfb68c" stroke="#34251f" stroke-width="3"/><path d="M196 177c17-11 37-9 50 5l12 132h-75l2-98Z" fill="#cb6847" stroke="#34251f" stroke-width="4"/></g><g class="visual-symbol"><path d="M70 111h25c0 22-25 22-25 0Z" fill="#e2b653" stroke="#34251f" stroke-width="3"/><path d="M79 130v18m-10 0h21" stroke="#34251f" stroke-width="4"/><path d="M137 86h27c0 23-27 23-27 0Z" fill="#e2b653" stroke="#34251f" stroke-width="3"/><path d="M147 106v19m-10 0h22" stroke="#34251f" stroke-width="4"/><path d="M207 111h25c0 22-25 22-25 0Z" fill="#e2b653" stroke="#34251f" stroke-width="3"/><path d="M216 130v18m-10 0h21" stroke="#34251f" stroke-width="4"/></g><path class="visual-secondary" d="M58 352c34-28 53 14 83-8s49-12 75 8 32 8 52-4" fill="none" stroke="#d29b47" stroke-width="8" stroke-linecap="round"/>`,
    hermit: `<circle class="visual-halo" cx="205" cy="91" r="55" fill="url(#glow-${index})"/><path class="visual-environment" d="M34 366 118 250l55 70 43-50 54 96Z" fill="#73808a" stroke="#34251f" stroke-width="4"/><g class="visual-figure"><path d="M105 126c24-34 62-30 77 5-10 31-31 46-64 42Z" fill="#d7c5a3" stroke="#34251f" stroke-width="4"/><circle cx="142" cy="130" r="16" fill="#ddb78d" stroke="#34251f" stroke-width="3"/><path d="M104 164c34-17 66-4 78 25l19 139H84l7-105Z" fill="#536778" stroke="#34251f" stroke-width="4"/><path class="visual-arm" d="M173 190 214 237" stroke="#34251f" stroke-width="13" stroke-linecap="round"/></g><g class="visual-symbol"><path d="M206 224h38v48h-38Z" fill="#d7aa4c" stroke="#34251f" stroke-width="4"/><path d="M214 224c0-19 22-19 22 0" fill="none" stroke="#34251f" stroke-width="4"/><circle cx="225" cy="247" r="24" fill="url(#glow-${index})"/></g><path d="M88 181 66 355" stroke="#6b4937" stroke-width="7"/>`,
    strength: `<circle class="visual-halo" cx="148" cy="83" r="59" fill="url(#glow-${index})"/><path class="visual-halo-line" d="M120 54c13-18 43-18 56 0-13 18-43 18-56 0Z" fill="none" stroke="#9c623d" stroke-width="5"/><path class="visual-environment" d="M31 353c56-21 174-21 238 0v37H31Z" fill="#7f8d67" stroke="#34251f" stroke-width="3"/><g class="visual-figure"><circle cx="128" cy="122" r="18" fill="#e5bd90" stroke="#34251f" stroke-width="3"/><path d="M106 109c14-25 43-25 57-3-20-2-39 2-57 3Z" fill="#d7aa51" stroke="#34251f" stroke-width="3"/><path d="M93 153c25-15 54-8 70 15l15 111H79l4-88Z" fill="#e1d8c2" stroke="#34251f" stroke-width="4"/><path class="visual-arm" d="M97 173 154 228M158 171l31 52" stroke="#34251f" stroke-width="13" stroke-linecap="round"/></g><g class="visual-secondary"><path d="M147 240c14-39 64-47 89-15 26 34 1 102-54 107-48 4-66-49-35-92Z" fill="#c68b4c" stroke="#34251f" stroke-width="4"/><circle cx="207" cy="251" r="8" fill="#34251f"/><path d="M231 273c18 8 22 24 14 38" fill="none" stroke="#34251f" stroke-width="4"/></g><circle class="visual-symbol" cx="166" cy="235" r="20" fill="url(#glow-${index})"/>`,
    tower: `<circle class="visual-halo" cx="214" cy="75" r="53" fill="url(#glow-${index})"/><path class="visual-symbol visual-lightning" d="M226 22 173 108h33l-30 67 78-101h-36Z" fill="#e0b34f" stroke="#34251f" stroke-width="4"/><path class="visual-environment" d="M34 360c55-18 165-18 232 0v30H34Z" fill="#6f777d" stroke="#34251f" stroke-width="3"/><g class="visual-figure visual-tower"><path d="M91 144h118l-10 203H101Z" fill="#9a7561" stroke="#34251f" stroke-width="5"/><path d="M82 143h137l-14-36h-25v17h-24v-17h-24v17h-25v-17h-18Z" fill="#b69270" stroke="#34251f" stroke-width="5"/><path d="M137 274h28v73h-28Z" fill="#47322a"/><path d="M111 184h24v35h-24Zm54 0h24v35h-24Z" fill="#e6c06b" stroke="#34251f" stroke-width="3"/></g><g class="visual-secondary visual-debris"><path d="m76 174-28 22 24 15m157-39 30 18-23 17M77 258l-35 7 30 22m158-25 32 11-28 16" fill="none" stroke="#b34f3b" stroke-width="8" stroke-linecap="round"/></g>`
  };

  return start + (scenes[archetype] || scenes.fool) + end;
}

function bindVisualStoryControls(section) {
  section.querySelectorAll('[data-visual-phase]').forEach((button) => {
    button.addEventListener('click', () => {
      stopPlayback();
      setVisualPhase(button.dataset.visualPhase || 'shadow');
    });
  });

  section.querySelector('[data-visual-play]')?.addEventListener('click', () => {
    if (feedbackState === 'playing') stopPlayback();
    else playMovement();
  });

  section.querySelector('[data-visual-confirm]')?.addEventListener('click', () => saveVisualCorrection('yes'));
  section.querySelector('[data-visual-partly]')?.addEventListener('click', () => saveVisualCorrection('partly'));
  section.querySelector('[data-visual-not-today]')?.addEventListener('click', () => saveVisualCorrection('not_today'));
}

function setVisualPhase(phase) {
  visualPhase = Object.hasOwn(phaseMeta, phase) ? phase : 'shadow';
  feedbackState = feedbackState === 'playing' ? 'playing' : 'idle';
  scheduleEnhancements();
}

function playMovement() {
  stopPlayback();
  feedbackState = 'playing';
  const token = ++playbackToken;
  const phases = ['origin', 'shadow', 'gift'];

  const advance = (index) => {
    if (token !== playbackToken) return;
    visualPhase = phases[index] || 'gift';
    feedbackState = index === phases.length - 1 ? 'idle' : 'playing';
    scheduleEnhancements();
    if (index < phases.length - 1) playTimeout = window.setTimeout(() => advance(index + 1), 1800);
  };

  advance(0);
}

function stopPlayback() {
  playbackToken += 1;
  window.clearTimeout(playTimeout);
  playTimeout = 0;
  if (feedbackState === 'playing') feedbackState = 'idle';
}

async function saveVisualCorrection(correction) {
  if (!latestVisual || feedbackState === 'saving') return;

  stopPlayback();
  feedbackState = 'saving';
  scheduleEnhancements();

  try {
    const response = await nativeFetch(`/api/v1/threads/${encodeURIComponent(latestVisual.threadId)}/corrections`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({ correction })
    });

    if (!response.ok) throw new Error('save_failed');

    if (correction === 'yes') {
      visualPhase = 'gift';
      feedbackState = 'confirmed';
    } else if (correction === 'partly') {
      visualPhase = 'shadow';
      feedbackState = 'partly';
    } else {
      latestVisual = null;
      feedbackState = 'idle';
    }
  } catch {
    feedbackState = 'error';
  }

  scheduleEnhancements();
}

function feedbackMessage() {
  if (feedbackState === 'saving') return 'Saving this correction for the current thread…';
  if (feedbackState === 'confirmed') return 'Confirmed for this moment. Your enduring Baseline was not rewritten.';
  if (feedbackState === 'partly') return 'Saved as partly fitting for this thread.';
  if (feedbackState === 'error') return 'That correction could not be saved safely. Try again.';
  if (feedbackState === 'playing') return 'Showing how one role can change expression without becoming a fixed identity.';
  return 'A temporary visual role—not an identity, diagnosis, prediction, or source of truth.';
}

function renderOffer() {
  const panel = latestResultPanel();
  if (!panel) return;
  const existing = panel.querySelector('[data-recognition-module-offer]');
  if (!latestOffer) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const region = document.createElement('div');
  region.dataset.recognitionModuleOffer = 'true';
  region.className = 'action-row';
  region.setAttribute('aria-live', 'polite');

  const explanation = document.createElement('p');
  explanation.className = 'result-status';
  explanation.textContent = `Keep “${latestOffer.title}” as a short private reflection?`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button';
  button.textContent = 'Save reflection';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Saving…';
    const response = await nativeFetch(`/api/v1/threads/${encodeURIComponent(latestOffer.threadId)}/modules/latest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({ approved: true })
    });
    if (response.ok) {
      explanation.textContent = 'Saved to Library as a short private reflection.';
      button.remove();
      latestOffer = null;
    } else {
      explanation.textContent = 'The reflection could not be saved safely.';
      button.disabled = false;
      button.textContent = 'Try again';
    }
  });

  region.append(explanation, button);
  panel.append(region);
}

function renderFrameworkConsentControl() {
  const panels = [...document.querySelectorAll('.scope-panel')];
  const invitePanel = panels.find((panel) => panel.textContent?.includes('INVITE FOR SPECIFIC CONSENT'));
  const list = invitePanel?.querySelector('.scope-list');
  if (!list || list.querySelector('[data-framework-evidence-consent]')) return;

  const label = document.createElement('label');
  label.dataset.frameworkEvidenceConsent = 'true';
  const copy = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = 'Show exact supporting data';
  const detail = document.createElement('small');
  detail.textContent = 'framework.display · optional and revocable';
  copy.append(title, detail);
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = shareFrameworkEvidence;
  checkbox.addEventListener('change', () => { shareFrameworkEvidence = checkbox.checked; });
  label.append(copy, checkbox);
  list.append(label);
}

function addFrameworkScopeWhenSelected(url, args) {
  if (!url.includes('/invitations/send') || !shareFrameworkEvidence) return args;
  const init = args[1];
  if (!init || typeof init.body !== 'string') return args;
  try {
    const body = JSON.parse(init.body);
    const requestedScopes = Array.isArray(body.requestedScopes) ? body.requestedScopes : [];
    body.requestedScopes = [...new Set([...requestedScopes, 'framework.display'])];
    return [args[0], { ...init, body: JSON.stringify(body) }];
  } catch {
    return args;
  }
}

function decodeVisualPayload(value, threadId) {
  if (!value) return null;
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return normalizeVisualPayload(JSON.parse(new TextDecoder().decode(bytes)), threadId);
  } catch {
    return null;
  }
}

function normalizeVisualPayload(value, threadId) {
  const allowedArchetypes = new Set(Object.keys(visualMeta));
  const allowedModes = new Set(['self', 'interaction', 'family']);
  const allowedPhases = new Set(Object.keys(phaseMeta));
  const story = value?.story;
  if (!story?.should_show || !story.primary || !allowedArchetypes.has(story.primary.archetype)) return null;

  const normalizeCard = (card) => card && allowedArchetypes.has(card.archetype)
    ? { archetype: card.archetype, title: safeText(card.title, 120), phase: allowedPhases.has(card.phase) ? card.phase : 'shadow' }
    : null;

  const normalized = {
    should_show: true,
    mode: allowedModes.has(story.mode) ? story.mode : 'self',
    primary: normalizeCard(story.primary),
    secondary: normalizeCard(story.secondary),
    tertiary: normalizeCard(story.tertiary),
    origin: safeText(story.origin, 360),
    shadow: safeText(story.shadow, 360),
    gift: safeText(story.gift, 360),
    current: safeText(story.current, 360),
    next_step: safeText(story.next_step, 280),
    visual_reason: safeText(story.visual_reason, 240)
  };

  const required = [normalized.primary?.title, normalized.origin, normalized.shadow, normalized.gift, normalized.current, normalized.next_step, normalized.visual_reason];
  if (required.some((item) => !item)) return null;
  if (normalized.mode === 'interaction' && !normalized.secondary) return null;
  if (normalized.mode === 'family' && (!normalized.secondary || !normalized.tertiary)) return null;

  const basis = normalizeBasis(value?.basis);
  if (!basis.user_confirmed) return null;
  if (normalized.mode !== 'self' && basis.relationship.length === 0) return null;
  return { threadId, story: normalized, basis };
}

function normalizeBasis(value) {
  const output = { user_confirmed: Boolean(value?.user_confirmed) };
  for (const key of ['human_design', 'gene_keys', 'astrology', 'relationship', 'live', 'numerology']) {
    output[key] = Array.isArray(value?.[key]) ? value[key].map((item) => safeText(item, 120)).filter(Boolean).slice(0, 6) : [];
  }
  return output;
}

function phaseText(story, phase) {
  if (phase === 'origin') return story.origin;
  if (phase === 'gift') return story.gift;
  return story.shadow;
}

function phaseIndex(phase) {
  return phase === 'origin' ? 1 : phase === 'gift' ? 3 : 2;
}

function modeCaption(mode) {
  if (mode === 'interaction') return 'Two separately confirmed roles shown together.';
  if (mode === 'family') return 'Three permitted roles shown as one family-system movement.';
  return 'One possible role within your design, shown in three expressions.';
}

function sourceLine(basis, keys, fallback) {
  const values = keys.flatMap((key) => basis?.[key] || []);
  return values.length ? values.join(' · ') : fallback;
}

function safeText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function decodeTitle(value) {
  try { return decodeURIComponent(value); } catch { return value || 'This recognition'; }
}

function escapeVisual(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
