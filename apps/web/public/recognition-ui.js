const nativeFetch = window.fetch.bind(window);
let latestOffer = null;
let latestVisual = null;
let visualPhase = 'shadow';
let shareFrameworkEvidence = false;

const visualLabels = {
  fool: { title: 'The Fool', numeral: '0', motif: 'A beginning still becoming itself.' },
  magician: { title: 'The Magician', numeral: 'I', motif: 'Ability gathered into deliberate action.' },
  three_of_cups: { title: 'Three of Cups', numeral: 'III', motif: 'Belonging created through shared experience.' },
  hermit: { title: 'The Hermit', numeral: 'IX', motif: 'Distance used to recover inner direction.' },
  strength: { title: 'Strength', numeral: 'VIII', motif: 'Power held without force.' },
  tower: { title: 'The Tower', numeral: 'XVI', motif: 'A structure changing because it can no longer hold.' }
};

window.fetch = async (...args) => {
  const input = args[0];
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const nextArgs = addFrameworkScopeWhenSelected(url, args);
  const response = await nativeFetch(...nextArgs);
  const match = url.match(/\/api\/v1\/threads\/([^/]+)\/messages(?:\?|$)/);
  if (match) {
    const threadId = decodeURIComponent(match[1]);
    const offered = response.headers.get('x-sovereign-module-offer') === '1';
    const encodedTitle = response.headers.get('x-sovereign-module-title') || '';
    latestOffer = offered ? { threadId, title: decodeTitle(encodedTitle) } : null;
    latestVisual = decodeVisualPayload(response.headers.get('x-sovereign-visual-story') || '', threadId);
    visualPhase = latestVisual?.story?.primary?.phase || 'shadow';
    queueMicrotask(renderEnhancements);
  }
  return response;
};

const observer = new MutationObserver(() => renderEnhancements());
observer.observe(document.documentElement, { childList: true, subtree: true });

function renderEnhancements() {
  renderThreadVisualStory();
  renderOffer();
  renderFrameworkConsentControl();
}

function renderThreadVisualStory() {
  const panel = document.querySelector('.result-panel');
  const existing = panel?.querySelector('[data-thread-visual-story]');
  if (!panel || !latestVisual || !panel.querySelector('.streamed-copy')) {
    existing?.remove();
    return;
  }

  const section = existing || document.createElement('section');
  section.dataset.threadVisualStory = 'true';
  section.dataset.visualContract = 'interpretation-first-artwork-second';
  section.className = 'thread-visual-story';
  section.innerHTML = renderVisualStory(latestVisual);
  if (!existing) panel.append(section);
  bindVisualStoryControls(section);
}

function renderVisualStory(payload) {
  const story = payload.story;
  const cards = [story.primary, story.secondary, story.tertiary].filter(Boolean);
  const phaseCopy = visualPhase === 'origin' ? story.origin : visualPhase === 'gift' ? story.gift : story.shadow;
  return `
    <header class="thread-visual-header">
      <div>
        <p class="eyebrow">VISUAL EXPLANATION</p>
        <h3>See the role inside the answer.</h3>
        <p>The interpretation was completed first from your confirmed experience, Baseline, current timing, and permitted context. The artwork only makes that result easier to see.</p>
      </div>
      <span class="thread-visual-rule">Interpreted first · Illustrated second</span>
    </header>

    <div class="thread-visual-layout" data-mode="${story.mode}">
      <div class="thread-card-stage thread-card-stage-${story.mode}" aria-label="Archetype visualization">
        ${cards.map((card, index) => renderVisualCard(card, index, cards.length)).join('')}
        ${cards.length > 1 ? '<div class="thread-role-connection" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}
      </div>

      <div class="thread-visual-copy">
        <div class="thread-phase-control" aria-label="View the role through three expressions">
          ${[['origin', 'Past protection'], ['shadow', 'Shadow'], ['gift', 'Gift']].map(([phase, label]) => `<button type="button" data-visual-phase="${phase}" class="${visualPhase === phase ? 'active' : ''}">${label}</button>`).join('')}
        </div>

        <div class="thread-visual-state">
          <span>${visualPhase === 'origin' ? 'WHAT THIS ROLE MAY HAVE LEARNED' : visualPhase === 'gift' ? 'THE CAPACITY INSIDE THE ROLE' : 'HOW IT MAY ACT UNDER PRESSURE'}</span>
          <h4>${escapeVisual(story.primary.title)}</h4>
          <p>${escapeVisual(phaseCopy)}</p>
        </div>

        <div class="thread-visual-summary-grid">
          <article><span>ACTIVE NOW</span><p>${escapeVisual(story.current)}</p></article>
          <article class="thread-next-step"><span>ONE NEXT STEP</span><p>${escapeVisual(story.next_step)}</p></article>
        </div>

        <details class="thread-visual-basis">
          <summary>Why this visual was used</summary>
          <p>${escapeVisual(story.visual_reason)}</p>
          <div>
            <article><span>Baseline / natal design</span><strong>${escapeVisual(sourceLine(payload.basis, ['human_design', 'gene_keys', 'astrology'], 'Only verified Baseline factors used in the answer appear here.'))}</strong></article>
            <article><span>Current timing</span><strong>${escapeVisual(sourceLine(payload.basis, ['live'], 'No current timing factor was required for this answer.'))}</strong></article>
            ${story.mode !== 'self' ? `<article><span>Permitted relationship context</span><strong>${escapeVisual(sourceLine(payload.basis, ['relationship'], 'No other person is shown without active permission.'))}</strong></article>` : ''}
            <article><span>Your confirmation</span><strong>${payload.basis.user_confirmed ? 'Confirmed in this thread.' : 'Not confirmed.'}</strong></article>
          </div>
        </details>

        <div class="thread-visual-actions">
          <button type="button" class="primary-button" data-visual-confirm>This fits</button>
          <button type="button" class="secondary-button" data-visual-partly>Partly</button>
          <button type="button" class="quiet-button" data-visual-not-today>Not today</button>
        </div>
        <p class="thread-visual-status" aria-live="polite">The archetype is a temporary visual role, not an identity or a source of truth.</p>
      </div>
    </div>
  `;
}

function renderVisualCard(card, index, count) {
  const meta = visualLabels[card.archetype] || visualLabels.fool;
  const sizeClass = count === 1 ? 'primary' : count === 2 ? 'pair' : 'family';
  return `
    <article class="thread-visual-card thread-visual-card-${sizeClass}" data-card-index="${index}" data-archetype="${card.archetype}" data-phase="${visualPhase}" data-motion-engine="layered-svg">
      <div class="thread-card-frame">
        <div class="thread-card-heading"><span>${meta.numeral}</span><strong>${escapeVisual(meta.title)}</strong></div>
        <div class="thread-card-art">
          ${renderArchetypeSvg(card.archetype, index)}
          <div class="thread-card-light" aria-hidden="true"></div>
        </div>
        <div class="thread-card-caption">
          <span>${phaseLabel(visualPhase)}</span>
          <h5>${escapeVisual(card.title)}</h5>
          <p>${escapeVisual(meta.motif)}</p>
        </div>
      </div>
    </article>
  `;
}

function renderArchetypeSvg(archetype, index) {
  const commonStart = `<svg viewBox="0 0 300 430" role="img" aria-label="${escapeVisual(visualLabels[archetype]?.title || 'Archetype')} visual" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="paper-${index}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efe6cf"/><stop offset=".58" stop-color="#dccaa9"/><stop offset="1" stop-color="#c6aa80"/></linearGradient><radialGradient id="glow-${index}"><stop stop-color="#f2c675" stop-opacity=".82"/><stop offset="1" stop-color="#f2c675" stop-opacity="0"/></radialGradient></defs><rect x="8" y="8" width="284" height="414" rx="9" fill="url(#paper-${index})" stroke="#35261f" stroke-width="4"/><rect x="19" y="20" width="262" height="388" rx="5" fill="none" stroke="#6d4b37" stroke-width="1.6"/><g class="visual-grain" opacity=".16"><path d="M22 62h254M22 114h254M22 166h254M22 218h254M22 270h254M22 322h254M22 374h254" stroke="#604737" stroke-dasharray="2 9"/></g>`;
  const commonEnd = '</svg>';
  const art = {
    fool: `<circle class="visual-halo" cx="238" cy="74" r="42" fill="url(#glow-${index})"/><circle cx="238" cy="74" r="24" fill="#e6b95a" stroke="#35261f" stroke-width="3"/><path class="visual-ground" d="M34 354c55-25 116-8 153-22 34-12 48-42 80-37v78H34Z" fill="#83906d" stroke="#35261f" stroke-width="3"/><path d="M201 328l50-43 27 2-10 67Z" fill="#a98662" stroke="#35261f" stroke-width="3"/><g class="visual-figure"><circle cx="139" cy="111" r="19" fill="#e8c59b" stroke="#35261f" stroke-width="3"/><path d="M116 97c7-27 40-31 53-8-17-2-35 4-53 8Z" fill="#c96342" stroke="#35261f" stroke-width="3"/><path d="M123 132c22-8 40-3 51 14l20 96-85 8 2-83Z" fill="#d45f3e" stroke="#35261f" stroke-width="4"/><path d="M113 159 78 215" stroke="#35261f" stroke-width="13" stroke-linecap="round"/><path class="visual-arm" d="M168 157l48 44" stroke="#35261f" stroke-width="13" stroke-linecap="round"/><path d="M123 249 104 327M171 248l28 77" stroke="#35261f" stroke-width="14" stroke-linecap="round"/><path d="m74 220 24 15" stroke="#d0a05f" stroke-width="9" stroke-linecap="round"/></g><g class="visual-prop"><path d="M181 119 222 79" stroke="#35261f" stroke-width="5"/><path d="M194 105c18 7 30 18 35 34-17-1-31-8-43-20Z" fill="#c38a52" stroke="#35261f" stroke-width="3"/></g><g class="visual-secondary"><circle cx="80" cy="306" r="13" fill="#ead1a3" stroke="#35261f" stroke-width="3"/><path d="M70 317c-12 7-17 20-15 35 18-4 31-15 37-31Z" fill="#f2efe3" stroke="#35261f" stroke-width="3"/></g>`,
    magician: `<circle class="visual-halo" cx="150" cy="93" r="62" fill="url(#glow-${index})"/><path class="visual-halo-line" d="M112 70c18-24 58-24 76 0-18 24-58 24-76 0Z" fill="none" stroke="#9d633d" stroke-width="5"/><g class="visual-figure"><circle cx="150" cy="112" r="20" fill="#e6c094" stroke="#35261f" stroke-width="3"/><path d="M124 99c13-22 39-25 55-5-17-2-35 0-55 5Z" fill="#d5a44f" stroke="#35261f" stroke-width="3"/><path d="M119 140c22-10 48-8 64 10l12 104H104l12-85Z" fill="#526d7b" stroke="#35261f" stroke-width="4"/><path class="visual-arm" d="M120 158 78 213" stroke="#35261f" stroke-width="13" stroke-linecap="round"/><path class="visual-wand-arm" d="M181 157 210 83" stroke="#35261f" stroke-width="13" stroke-linecap="round"/><path class="visual-wand" d="M216 79 232 31" stroke="#b4543d" stroke-width="7" stroke-linecap="round"/></g><g class="visual-table"><path d="M61 251h178l-10 26H72Z" fill="#b7794b" stroke="#35261f" stroke-width="4"/><path d="M82 276 67 363M219 276l14 87" stroke="#35261f" stroke-width="8"/><circle class="visual-prop" cx="103" cy="237" r="13" fill="#d8ab51" stroke="#35261f" stroke-width="3"/><path class="visual-prop" d="M143 224h29v24h-29Z" fill="#b34e38" stroke="#35261f" stroke-width="3"/><path class="visual-prop" d="M196 244c0-22 25-22 25 0Z" fill="#70846e" stroke="#35261f" stroke-width="3"/></g><path class="visual-ground" d="M39 365c58-20 158-17 222 0" fill="none" stroke="#58725e" stroke-width="8" stroke-linecap="round"/>`,
    three_of_cups: `<circle class="visual-halo" cx="150" cy="92" r="70" fill="url(#glow-${index})"/><path class="visual-ground" d="M31 345c60-22 174-22 238 0v43H31Z" fill="#76845f" stroke="#35261f" stroke-width="3"/><g class="visual-figure"><circle cx="83" cy="151" r="17" fill="#e7c197" stroke="#35261f" stroke-width="3"/><path d="M61 177c16-11 35-10 49 3l18 134H52l2-99Z" fill="#e5dfc9" stroke="#35261f" stroke-width="4"/><circle cx="150" cy="136" r="18" fill="#d7aa83" stroke="#35261f" stroke-width="3"/><path d="M123 164c19-13 41-11 57 5l23 150h-94l3-111Z" fill="#b94f3a" stroke="#35261f" stroke-width="4"/><circle cx="220" cy="151" r="17" fill="#dfb68c" stroke="#35261f" stroke-width="3"/><path d="M196 177c17-11 37-9 50 5l12 132h-75l2-98Z" fill="#cb6847" stroke="#35261f" stroke-width="4"/></g><g class="visual-cups"><path d="M70 111h25c0 22-25 22-25 0Z" fill="#e2b653" stroke="#35261f" stroke-width="3"/><path d="M79 130v18m-10 0h21" stroke="#35261f" stroke-width="4"/><path d="M137 86h27c0 23-27 23-27 0Z" fill="#e2b653" stroke="#35261f" stroke-width="3"/><path d="M147 106v19m-10 0h22" stroke="#35261f" stroke-width="4"/><path d="M207 111h25c0 22-25 22-25 0Z" fill="#e2b653" stroke="#35261f" stroke-width="3"/><path d="M216 130v18m-10 0h21" stroke="#35261f" stroke-width="4"/></g><path class="visual-prop" d="M58 352c34-28 53 14 83-8s49-12 75 8 32 8 52-4" fill="none" stroke="#d29b47" stroke-width="8" stroke-linecap="round"/>`,
    hermit: `<circle class="visual-halo" cx="205" cy="91" r="54" fill="url(#glow-${index})"/><path class="visual-ground" d="M34 366 118 250l55 70 43-50 54 96Z" fill="#73808a" stroke="#35261f" stroke-width="4"/><g class="visual-figure"><path d="M105 126c24-34 62-30 77 5-10 31-31 46-64 42Z" fill="#d7c5a3" stroke="#35261f" stroke-width="4"/><circle cx="142" cy="130" r="16" fill="#ddb78d" stroke="#35261f" stroke-width="3"/><path d="M104 164c34-17 66-4 78 25l19 139H84l7-105Z" fill="#536778" stroke="#35261f" stroke-width="4"/><path class="visual-arm" d="M173 190 214 237" stroke="#35261f" stroke-width="13" stroke-linecap="round"/></g><g class="visual-lantern"><path d="M206 224h38v48h-38Z" fill="#d7aa4c" stroke="#35261f" stroke-width="4"/><path d="M214 224c0-19 22-19 22 0" fill="none" stroke="#35261f" stroke-width="4"/><circle class="visual-prop" cx="225" cy="247" r="24" fill="url(#glow-${index})"/></g><path class="visual-wand" d="M88 181 66 355" stroke="#6b4937" stroke-width="7"/>`,
    strength: `<circle class="visual-halo" cx="148" cy="83" r="58" fill="url(#glow-${index})"/><path class="visual-halo-line" d="M120 54c13-18 43-18 56 0-13 18-43 18-56 0Z" fill="none" stroke="#9d633d" stroke-width="5"/><path class="visual-ground" d="M31 353c56-21 174-21 238 0v37H31Z" fill="#7f8d67" stroke="#35261f" stroke-width="3"/><g class="visual-figure"><circle cx="128" cy="122" r="18" fill="#e5bd90" stroke="#35261f" stroke-width="3"/><path d="M106 109c14-25 43-25 57-3-20-2-39 2-57 3Z" fill="#d7aa51" stroke="#35261f" stroke-width="3"/><path d="M93 153c25-15 54-8 70 15l15 111H79l4-88Z" fill="#e1d8c2" stroke="#35261f" stroke-width="4"/><path class="visual-arm" d="M97 173 154 228M158 171l31 52" stroke="#35261f" stroke-width="13" stroke-linecap="round"/></g><g class="visual-secondary"><path d="M147 240c14-39 64-47 89-15 26 34 1 102-54 107-48 4-66-49-35-92Z" fill="#c68b4c" stroke="#35261f" stroke-width="4"/><circle cx="207" cy="251" r="8" fill="#35261f"/><path d="M231 273c18 8 22 24 14 38" fill="none" stroke="#35261f" stroke-width="4"/></g><circle class="visual-prop" cx="166" cy="235" r="20" fill="url(#glow-${index})"/>`,
    tower: `<circle class="visual-halo" cx="214" cy="75" r="52" fill="url(#glow-${index})"/><path class="visual-lightning" d="M226 22 173 108h33l-30 67 78-101h-36Z" fill="#e0b34f" stroke="#35261f" stroke-width="4"/><path class="visual-ground" d="M34 360c55-18 165-18 232 0v30H34Z" fill="#6f777d" stroke="#35261f" stroke-width="3"/><g class="visual-tower"><path d="M91 144h118l-10 203H101Z" fill="#9a7561" stroke="#35261f" stroke-width="5"/><path d="M82 143h137l-14-36h-25v17h-24v-17h-24v17h-25v-17h-18Z" fill="#b69270" stroke="#35261f" stroke-width="5"/><path d="M137 274h28v73h-28Z" fill="#47322a"/><path d="M111 184h24v35h-24Zm54 0h24v35h-24Z" fill="#e6c06b" stroke="#35261f" stroke-width="3"/></g><g class="visual-debris"><path d="m76 174-28 22 24 15m157-39 30 18-23 17M77 258l-35 7 30 22m158-25 32 11-28 16" fill="none" stroke="#b34f3b" stroke-width="8" stroke-linecap="round"/></g>`
  }[archetype] || '';
  return commonStart + art + commonEnd;
}

function bindVisualStoryControls(section) {
  section.querySelectorAll('[data-visual-phase]').forEach((button) => button.addEventListener('click', () => {
    visualPhase = button.dataset.visualPhase || 'shadow';
    section.innerHTML = renderVisualStory(latestVisual);
    bindVisualStoryControls(section);
  }));
  section.querySelector('[data-visual-confirm]')?.addEventListener('click', () => saveVisualCorrection('yes', section));
  section.querySelector('[data-visual-partly]')?.addEventListener('click', () => saveVisualCorrection('partly', section));
  section.querySelector('[data-visual-not-today]')?.addEventListener('click', () => saveVisualCorrection('not_today', section));
}

async function saveVisualCorrection(correction, section) {
  const status = section.querySelector('.thread-visual-status');
  const buttons = section.querySelectorAll('.thread-visual-actions button');
  buttons.forEach((button) => { button.disabled = true; });
  if (status) status.textContent = 'Saving your correction for this thread…';
  try {
    const response = await nativeFetch(`/api/v1/threads/${encodeURIComponent(latestVisual.threadId)}/corrections`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({ correction })
    });
    if (!response.ok) throw new Error('save_failed');
    if (correction === 'yes') {
      visualPhase = 'gift';
      if (status) status.textContent = 'Confirmed for this moment. Your enduring Baseline was not rewritten.';
      section.innerHTML = renderVisualStory(latestVisual);
      bindVisualStoryControls(section);
    } else if (correction === 'partly') {
      visualPhase = 'shadow';
      if (status) status.textContent = 'Saved as partly fitting for this thread.';
    } else {
      latestVisual = null;
      section.remove();
    }
  } catch {
    if (status) status.textContent = 'That correction could not be saved safely.';
    buttons.forEach((button) => { button.disabled = false; });
  }
}

function renderOffer() {
  const panel = document.querySelector('.result-panel');
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
  } catch { return args; }
}

function decodeVisualPayload(value, threadId) {
  if (!value) return null;
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return normalizeVisualPayload(parsed, threadId);
  } catch { return null; }
}

function normalizeVisualPayload(value, threadId) {
  const allowedArchetypes = new Set(Object.keys(visualLabels));
  const allowedModes = new Set(['self', 'interaction', 'family']);
  const allowedPhases = new Set(['origin', 'shadow', 'gift']);
  const story = value?.story;
  if (!story?.should_show || !story.primary || !allowedArchetypes.has(story.primary.archetype)) return null;
  const normalizeCard = (card) => card && allowedArchetypes.has(card.archetype) ? {
    archetype: card.archetype,
    title: String(card.title || ''),
    phase: allowedPhases.has(card.phase) ? card.phase : 'shadow'
  } : null;
  const normalized = {
    should_show: true,
    mode: allowedModes.has(story.mode) ? story.mode : 'self',
    primary: normalizeCard(story.primary),
    secondary: normalizeCard(story.secondary),
    tertiary: normalizeCard(story.tertiary),
    origin: String(story.origin || ''),
    shadow: String(story.shadow || ''),
    gift: String(story.gift || ''),
    current: String(story.current || ''),
    next_step: String(story.next_step || ''),
    visual_reason: String(story.visual_reason || '')
  };
  if (normalized.mode === 'interaction' && !normalized.secondary) return null;
  if (normalized.mode === 'family' && (!normalized.secondary || !normalized.tertiary)) return null;
  return { threadId, story: normalized, basis: normalizeBasis(value?.basis) };
}

function normalizeBasis(value) {
  const output = { user_confirmed: Boolean(value?.user_confirmed) };
  for (const key of ['human_design', 'gene_keys', 'astrology', 'relationship', 'live', 'numerology']) {
    output[key] = Array.isArray(value?.[key]) ? value[key].map(String).slice(0, 6) : [];
  }
  return output;
}

function sourceLine(basis, keys, fallback) {
  const values = keys.flatMap((key) => basis?.[key] || []);
  return values.length ? values.join(' · ') : fallback;
}

function phaseLabel(phase) {
  return ({ origin: 'Past protection', shadow: 'Shadow expression', gift: 'Gift expression' })[phase] || 'Shadow expression';
}

function decodeTitle(value) {
  try { return decodeURIComponent(value); } catch { return value || 'This recognition'; }
}

function escapeVisual(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}