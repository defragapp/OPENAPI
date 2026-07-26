const WORKSPACE_PATH = '/app';
const MODE_LABELS = {
  baseline: 'My Baseline',
  shadow_light: 'Shadow and Light',
  alignment: 'Alignment',
  relationship: 'A Relationship',
  system: 'My Role in a System',
  covenant: 'Christian Perspective'
};

const MODE_COPY = {
  baseline: 'Explore identity, qualities, roles, communication, creativity, leadership, pressure, and development.',
  shadow_light: 'See what one quality protects, how it contracts under pressure, and how it becomes useful with awareness.',
  alignment: 'Examine what a choice supports, what it may cost, and what would need to change for a closer fit.',
  relationship: 'Bring two permitted Baselines together without turning the relationship into a score.',
  system: 'See your role inside a family, household, team, or group without reducing the system to one person.',
  covenant: 'Bring clearly cited biblical teaching into a question only when you intentionally choose the Covenant lens.'
};

const RESPONSE_LABELS = {
  'WHAT I NOTICE': 'Direct answer',
  'LOOK INWARD': 'Explore further',
  'WHAT THIS MAY BE SHOWING': 'What may be interacting',
  'A CLEARER FORM': 'Aligned expression',
  'WHAT TO DO': 'One way to continue',
  'EXPLORE LATER': 'Continue exploring'
};

let todayData = null;
let todayRequested = false;
let activeMode = 'baseline';
let scheduled = false;
let lastSurface = '';
const rawResponses = new WeakMap();

if (location.pathname === WORKSPACE_PATH) {
  install();
}

function install() {
  const render = () => {
    scheduled = false;
    renderWorkspaceEnhancements();
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(render);
  };

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('sovereign:today-updated', schedule);
  schedule();
}

function renderWorkspaceEnhancements() {
  const surfaceMain = document.querySelector('.surface-main');
  const composer = document.querySelector('.composer');
  const surface = currentSurface();
  if (!surfaceMain || !composer || !surface) return;

  if (!todayRequested) void loadToday();
  if (surface !== lastSurface) {
    lastSurface = surface;
    if (surface !== 'Explore') activeMode = modeForSurface(surface);
  }

  renderContextBar(composer, surface);
  renderIntelligenceCanvas(surfaceMain, surface);
  enhanceCompletedResponse();
}

async function loadToday() {
  todayRequested = true;
  try {
    const response = await fetch('/api/v1/today', { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('Today unavailable');
    const payload = await response.json();
    todayData = payload.today ?? null;
  } catch {
    todayData = null;
  } finally {
    window.dispatchEvent(new Event('sovereign:today-updated'));
  }
}

function currentSurface() {
  return document.querySelector('.topbar h1')?.textContent?.trim() || '';
}

function modeForSurface(surface) {
  if (surface === 'People') return 'relationship';
  if (surface === 'Systems') return 'system';
  if (surface === 'You') return 'baseline';
  return 'baseline';
}

function renderContextBar(composer, surface) {
  let bar = composer.querySelector('.sovereign-context-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'sovereign-context-bar';
    bar.setAttribute('aria-label', 'Context Sovereign is considering');
    composer.prepend(bar);
  }

  const contextLine = document.querySelector('.context-line')?.textContent?.trim();
  const baseline = todayData?.baseline;
  const current = todayData?.current;
  const baselineReady = baseline?.status === 'completed' || baseline?.status === 'partial';
  const liveReady = current?.status === 'ready' || current?.providerStatus === 'computed';
  const covenantOn = Array.from(document.querySelectorAll('label')).some((label) =>
    /covenant/i.test(label.textContent || '') && label.querySelector('input:checked')
  );

  const chips = [
    `<span class="context-chip context-chip-mode">${escapeHtml(surface)}</span>`,
    `<span class="context-chip ${baselineReady ? 'is-ready' : ''}">Baseline ${baselineReady ? 'included' : 'not built'}</span>`,
    `<span class="context-chip ${liveReady ? 'is-live' : ''}">Live Sky ${liveReady ? 'included' : 'off'}</span>`,
    contextLine && contextLine !== 'Self' ? `<span class="context-chip">${escapeHtml(contextLine)}</span>` : '',
    `<span class="context-chip ${covenantOn ? 'is-covenant' : ''}">Covenant ${covenantOn ? 'on' : 'off'}</span>`
  ].filter(Boolean);

  const next = chips.join('');
  if (bar.innerHTML !== next) bar.innerHTML = next;
}

function renderIntelligenceCanvas(surfaceMain, surface) {
  let host = surfaceMain.querySelector('#sovereign-intelligence-layer');
  if (!host) {
    host = document.createElement('section');
    host.id = 'sovereign-intelligence-layer';
    host.className = 'sovereign-intelligence-layer';
    host.setAttribute('aria-live', 'polite');
    surfaceMain.prepend(host);
  }

  const html = surface === 'Today'
    ? todayCanvas()
    : surface === 'Explore'
      ? exploreCanvas()
      : surface === 'People'
        ? peopleCanvas()
        : surface === 'Systems'
          ? systemsCanvas()
          : surface === 'Library'
            ? libraryCanvas()
            : youCanvas();

  const signature = `${surface}:${activeMode}:${Boolean(todayData)}:${selectedContextLabel()}`;
  if (host.dataset.signature !== signature) {
    host.dataset.signature = signature;
    host.innerHTML = html;
    bindCanvasActions(host, surface);
  }
}

function todayCanvas() {
  const baseline = todayData?.baseline;
  const current = todayData?.current;
  const reduced = baseline?.reducedContext ?? {};
  const live = current?.reduced ?? {};
  const signals = normalizeStrings(reduced.interpretiveSignals).slice(0, 5);
  const activeFactors = Array.isArray(live.activeFactors) ? live.activeFactors.slice(0, 6) : [];
  const dimensions = normalizeStrings(live.affectedBaselineDimensions).slice(0, 4);
  const baselineReady = baseline?.status === 'completed' || baseline?.status === 'partial';
  const liveReady = current?.status === 'ready' || current?.providerStatus === 'computed';
  const baselineStatement = readable(
    reduced.baselineTendency,
    baselineReady
      ? 'Your Baseline is ready to explore.'
      : 'Build your Baseline to create the stable personal foundation for this workspace.'
  );
  const liveStatement = readable(
    live.amplification?.quality ?? live.possibleCurrentAmplification,
    liveReady
      ? 'Current timing is available as a separate layer around your Baseline.'
      : 'Live Sky context is off until permitted timing information is available.'
  );

  const points = activeFactors.map((factor, index) => {
    const angle = Math.round((360 / Math.max(activeFactors.length, 1)) * index - 90);
    const strength = Math.max(36, Math.min(100, Number(factor.relativeStrength ?? 50)));
    return `<button class="live-sky-point" style="--angle:${angle}deg;--strength:${strength}%" title="${escapeHtml(factor.label || factor.body || 'Current influence')}" aria-label="${escapeHtml(factor.label || factor.body || 'Current influence')}"></button>`;
  }).join('');

  const qualityChips = signals.length
    ? signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join('')
    : `<span>${baselineReady ? 'Baseline qualities available' : 'Baseline not built'}</span>`;

  const dimensionChips = dimensions.length
    ? dimensions.map((dimension) => `<span>${escapeHtml(humanize(dimension))}</span>`).join('')
    : '<span>Choose a part of life to explore</span>';

  return `
    <div class="intelligence-canvas today-intelligence">
      <div class="intelligence-heading">
        <div>
          <p class="eyebrow">YOUR BASELINE, ALIVE TODAY</p>
          <h2>What remains yours. What is louder now.</h2>
        </div>
        <p>Baseline Design stays at the center. The Live Sky appears as a separate timing layer and never becomes proof of your behavior.</p>
      </div>
      <div class="today-visual-layout">
        <div class="baseline-orbit" role="img" aria-label="Baseline Core with separate Live Sky influences">
          <div class="live-sky-halo ${liveReady ? 'is-active' : ''}">${points}</div>
          <div class="baseline-core-object">
            <span>BASELINE CORE</span>
            <strong>${baselineReady ? 'Your design' : 'Build your design'}</strong>
            <small>${escapeHtml(signals[0] || 'A stable personal foundation')}</small>
          </div>
        </div>
        <div class="today-meaning-grid">
          <article>
            <span>WHAT REMAINS YOURS</span>
            <p>${escapeHtml(baselineStatement)}</p>
          </article>
          <article>
            <span>WHAT IS LOUDER NOW</span>
            <p>${escapeHtml(liveStatement)}</p>
          </article>
          <article>
            <span>ACTIVE BASELINE QUALITIES</span>
            <div class="meaning-chip-list">${qualityChips}</div>
          </article>
          <article>
            <span>WHERE THIS MAY MATTER</span>
            <div class="meaning-chip-list">${dimensionChips}</div>
          </article>
        </div>
      </div>
      <div class="intelligence-note">Shadow and light open from the same quality. Neither side is a fixed identity or moral score.</div>
    </div>`;
}

function exploreCanvas() {
  const cards = Object.entries(MODE_LABELS).map(([mode, label]) => `
    <button class="mode-object ${activeMode === mode ? 'is-active' : ''}" data-intelligence-mode="${mode}" aria-pressed="${activeMode === mode}">
      <span>${escapeHtml(label)}</span>
      <small>${escapeHtml(MODE_COPY[mode])}</small>
    </button>`).join('');

  return `
    <div class="intelligence-canvas explore-intelligence">
      <div class="intelligence-heading">
        <div><p class="eyebrow">OPEN ANY PART OF YOURSELF</p><h2>Choose the kind of understanding you need.</h2></div>
        <p>Sovereign begins with your Baseline and adapts the composer to the selected mode. You do not need specialized prompting.</p>
      </div>
      <div class="mode-object-grid" role="group" aria-label="Explore modes">${cards}</div>
      ${activeMode === 'alignment' ? alignmentInstrument() : activeMode === 'shadow_light' ? shadowLightInstrument() : modeExplanation(activeMode)}
    </div>`;
}

function alignmentInstrument() {
  return `
    <div class="alignment-instrument" data-alignment-state="neutral">
      <div class="instrument-heading"><span>ALIGNMENT NEEDLE</span><strong>Bring a choice into view.</strong><small>Limited context</small></div>
      <div class="alignment-arc" role="img" aria-label="Alignment is neutral until enough context is available">
        <span>Shadow pull</span><span>Mixed or conditional</span><span>Aligned expression</span>
        <i aria-hidden="true"></i>
      </div>
      <p>The position and confidence remain separate. Sovereign will explain what supports the choice, what conflicts with it, and what may need to change.</p>
    </div>`;
}

function shadowLightInstrument() {
  return `
    <div class="shadow-light-instrument">
      <div class="instrument-heading"><span>SHADOW–LIGHT RAIL</span><strong>One quality. Different expressions.</strong><small>Not a permanent score</small></div>
      <div class="shadow-light-rail" role="img" aria-label="A quality can move from compressed protection toward integrated expression">
        <span>Protective</span><i></i><span>Reactive under pressure</span><i></i><span>Integrated expression</span>
      </div>
      <p>Choose a quality below. Sovereign will separate what it protects, how it contracts, and how the same energy can become useful.</p>
    </div>`;
}

function modeExplanation(mode) {
  return `<div class="mode-explanation"><span>${escapeHtml(MODE_LABELS[mode] || 'Explore')}</span><p>${escapeHtml(MODE_COPY[mode] || '')}</p></div>`;
}

function peopleCanvas() {
  const selected = selectedContextLabel('person') || 'Choose a person';
  return `
    <div class="intelligence-canvas relational-intelligence">
      <div class="intelligence-heading">
        <div><p class="eyebrow">TWO PEOPLE · TWO BASELINES</p><h2>See both sides—and the relationship between them.</h2></div>
        <p>Each person remains equal and distinct. The center shows shared dynamics, responsibility boundaries, consent, and what still cannot be known.</p>
      </div>
      <div class="perspective-split" role="img" aria-label="Two equal Baseline fields connected by a permission-based relationship center">
        <article><span>YOU</span><strong>Your Baseline</strong><small>Your perspective remains yours.</small></article>
        <div><span>RELATIONSHIP</span><strong>${escapeHtml(selected)}</strong><small>Permission determines what may be compared.</small></div>
        <article><span>OTHER PERSON</span><strong>${escapeHtml(selected)}</strong><small>Possible perspective—not private thoughts.</small></article>
      </div>
      <div class="perspective-controls" aria-label="Perspective choices"><span>My perspective</span><span>Their possible perspective</span><span>The relationship as a whole</span></div>
    </div>`;
}

function systemsCanvas() {
  const system = selectedContextLabel('system') || 'Choose a system';
  const person = selectedContextLabel('person') || 'Permitted people';
  return `
    <div class="intelligence-canvas system-intelligence">
      <div class="intelligence-heading">
        <div><p class="eyebrow">SEE THE WHOLE SYSTEM</p><h2>Roles, pressure, authority, and change in one view.</h2></div>
        <p>The map stays stable. Line styles show what is confirmed, user-described, permission-limited, or only a Baseline possibility.</p>
      </div>
      <div class="system-map-preview" role="img" aria-label="Stable example system map with three person nodes">
        <article class="system-node node-you"><span>YOU</span><strong>Your role</strong></article>
        <article class="system-node node-system"><span>SYSTEM</span><strong>${escapeHtml(system)}</strong></article>
        <article class="system-node node-person"><span>PERSON</span><strong>${escapeHtml(person)}</strong></article>
        <i class="system-edge edge-confirmed"></i><i class="system-edge edge-limited"></i>
      </div>
      <div class="system-overlay-list"><span>Roles</span><span>Pressure</span><span>Perspective</span><span>Authority</span><span>Change</span><span>Alignment</span></div>
    </div>`;
}

function libraryCanvas() {
  return `
    <div class="intelligence-canvas library-intelligence">
      <div class="intelligence-heading">
        <div><p class="eyebrow">KEEP WHAT CHANGES HOW YOU UNDERSTAND</p><h2>Saved objects—not an endless transcript.</h2></div>
        <p>Every saved understanding keeps its type, people or system, Baseline quality, timing context, Covenant state, and correction history.</p>
      </div>
      <div class="library-type-grid"><span>Baseline quality</span><span>Shadow & light</span><span>Alignment</span><span>Relationship</span><span>System</span><span>Covenant</span><span>Decision</span><span>Correction</span></div>
    </div>`;
}

function youCanvas() {
  return `
    <div class="intelligence-canvas you-intelligence">
      <div class="intelligence-heading">
        <div><p class="eyebrow">YOUR DESIGN · YOUR PEOPLE · YOUR CONTROL</p><h2>The private boundary stays visible.</h2></div>
        <p>Raw birth information and exact private location remain separate from the reduced context used for interpretation.</p>
      </div>
      <div class="privacy-flow" role="img" aria-label="Raw private inputs are reduced before any AI interpretation">
        <article><span>PRIVATE INPUT</span><strong>Birth and location data</strong></article><i></i><article><span>DETERMINISTIC SERVICES</span><strong>Baseline + Live Sky</strong></article><i></i><article><span>REDUCED CONTEXT</span><strong>Only what the question needs</strong></article>
      </div>
    </div>`;
}

function bindCanvasActions(host, surface) {
  if (surface !== 'Explore') return;
  host.querySelectorAll('[data-intelligence-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      activeMode = button.dataset.intelligenceMode || 'baseline';
      applyMode(activeMode);
      host.dataset.signature = '';
      renderWorkspaceEnhancements();
    });
  });
}

function applyMode(mode) {
  if (mode === 'relationship') return clickSurface('People');
  if (mode === 'system') return clickSurface('Systems');
  if (mode === 'covenant') return clickSurface('You');

  const surfaceMain = document.querySelector('.surface-main');
  const select = surfaceMain?.querySelector('select');
  const textarea = surfaceMain?.querySelector('textarea');
  const topic = mode === 'alignment' ? 'decisions' : mode === 'shadow_light' ? 'pressure response' : 'identity';
  if (select && Array.from(select.options).some((option) => option.value === topic || option.text === topic)) {
    select.value = topic;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (textarea) {
    textarea.placeholder = mode === 'alignment'
      ? 'Describe the choice, relationship, behavior, opportunity, or direction you want to examine.'
      : mode === 'shadow_light'
        ? 'Name the quality or response you want to understand through shadow and light.'
        : 'Ask about any part of your Baseline Design.';
    textarea.focus({ preventScroll: true });
  }
}

function clickSurface(label) {
  const button = Array.from(document.querySelectorAll('.side-rail nav button, .tabbar button')).find((item) => item.textContent?.trim().endsWith(label));
  button?.click();
}

function selectedContextLabel(kind) {
  const context = document.querySelector('.context-line')?.textContent?.trim() || '';
  if (!context || context === 'Self') return '';
  const parts = context.split('·').map((part) => part.trim()).filter(Boolean);
  if (kind === 'person') return parts.find((part) => !['People', 'Systems', 'Explore', 'Today', 'Library', 'You'].includes(part)) || '';
  if (kind === 'system') return parts[parts.length - 1] || '';
  return context;
}

function enhanceCompletedResponse() {
  const copy = document.querySelector('.streamed-copy');
  const status = document.querySelector('.result-status')?.textContent || '';
  if (!copy || !/answer complete|saved to your library|marked/i.test(status)) return;
  if (copy.dataset.structured === 'true') return;

  const raw = copy.textContent?.trim() || '';
  if (!raw) return;
  const parsed = parseSections(raw);
  if (parsed.sections.length < 2) return;
  rawResponses.set(copy, raw);

  const cards = parsed.sections.map((section) => `
    <article class="structured-response-card">
      <span>${escapeHtml(RESPONSE_LABELS[section.heading] || humanize(section.heading))}</span>
      <p>${escapeHtml(section.body)}</p>
    </article>`).join('');
  const basis = parsed.basis ? `<footer class="structured-response-basis"><span>SUPPORTING CONTEXT</span><p>${escapeHtml(parsed.basis)}</p></footer>` : '';
  copy.innerHTML = `<div class="structured-response-grid">${cards}</div>${basis}`;
  copy.dataset.structured = 'true';
}

function parseSections(raw) {
  const lines = raw.split(/\r?\n/);
  const sections = [];
  let heading = '';
  let body = [];
  let basis = '';
  const flush = () => {
    const text = body.join('\n').trim();
    if (heading && text) sections.push({ heading, body: text });
    body = [];
  };

  for (const line of lines) {
    const clean = line.trim();
    if (/^BASIS\s*·/i.test(clean)) {
      basis = clean.replace(/^BASIS\s*·\s*/i, '');
      continue;
    }
    if (/^[A-Z][A-Z\s&·/–—-]{3,}$/.test(clean)) {
      flush();
      heading = clean;
      continue;
    }
    if (clean || body.length) body.push(clean);
  }
  flush();
  return { sections, basis };
}

function normalizeStrings(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' || typeof item === 'number').map(String);
}

function readable(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function humanize(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
