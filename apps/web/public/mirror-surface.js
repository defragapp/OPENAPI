const archetypeArtwork = {
  fool: { title: 'The Fool', numeral: '0', motif: 'A beginning still becoming itself.' },
  magician: { title: 'The Magician', numeral: 'I', motif: 'Ability gathered into deliberate action.' },
  three_of_cups: { title: 'Three of Cups', numeral: 'III', motif: 'Belonging created through shared experience.' },
  hermit: { title: 'The Hermit', numeral: 'IX', motif: 'Distance used to recover inner direction.' },
  strength: { title: 'Strength', numeral: 'VIII', motif: 'Power held without force.' },
  tower: { title: 'The Tower', numeral: 'XVI', motif: 'A structure changing because it can no longer hold.' }
};

const previewRoles = [
  {
    id: 'beginning_again', title: 'Beginning again', visualArchetypeId: 'fool',
    origin: 'This role may have learned that movement was safer than remaining inside uncertainty.',
    shadow: 'It can move before enough is known, using the next beginning to escape what still needs an answer.',
    gift: 'It brings openness, trust, experimentation, and the courage to enter a life that has not been rehearsed.',
    current: 'A new direction may be asking for movement without demanding that every detail be settled first.',
    nextStep: 'Choose one reversible first step. Let experience provide the next piece of information.'
  },
  {
    id: 'shaping_the_outcome', title: 'Shaping the outcome', visualArchetypeId: 'magician',
    origin: 'This role may have learned to rely on skill, language, or competence when the environment felt uncertain.',
    shadow: 'It can begin managing every variable, trying to make the response safe before anyone else has chosen.',
    gift: 'It turns available tools into focused action and makes an idea real without needing to control every result.',
    current: 'Your ability to organize, explain, or initiate may be unusually available right now.',
    nextStep: 'Use one skill deliberately. Leave the final response outside your control.'
  },
  {
    id: 'preserving_belonging', title: 'Preserving belonging', visualArchetypeId: 'three_of_cups',
    origin: 'This role may have learned that connection depended on keeping the group together or the atmosphere calm.',
    shadow: 'It can make personal needs smaller, overjoin the group, or treat harmony as proof that the connection is safe.',
    gift: 'It creates genuine belonging, shared joy, mutual support, and a place where more than one person can matter.',
    current: 'Belonging, friendship, or the need to feel included may be more noticeable in the present cycle.',
    nextStep: 'Name one need without withdrawing your warmth from the relationship.'
  },
  {
    id: 'protecting_space', title: 'Protecting space', visualArchetypeId: 'hermit',
    origin: 'This role may have learned that private space was the only reliable place to hear its own direction.',
    shadow: 'It can disappear, delay clarity, or use distance in place of saying what it knows.',
    gift: 'It creates thoughtful independence, discernment, and the ability to return with a more honest answer.',
    current: 'You may need less outside input before deciding what belongs to you.',
    nextStep: 'State what the space is for and when you will communicate again.'
  },
  {
    id: 'defending_a_limit', title: 'Defending a limit', visualArchetypeId: 'strength',
    origin: 'This role may have learned that dignity or safety required becoming stronger than the pressure around it.',
    shadow: 'It can hold too tightly, turn anger into force, or treat softness as the loss of protection.',
    gift: 'It brings grounded courage, clean boundaries, and power that does not need to humiliate or dominate.',
    current: 'A crossed limit may need a direct response rather than more endurance.',
    nextStep: 'Name what must stop and the action you will take if it continues.'
  },
  {
    id: 'creating_change', title: 'Creating change', visualArchetypeId: 'tower',
    origin: 'This role may have learned that nothing changed until the situation became impossible to ignore.',
    shadow: 'It can make the whole relationship or system collapse when a specific change would have been clearer.',
    gift: 'It tells the truth about what no longer works and makes room for a structure that can actually hold reality.',
    current: 'A familiar structure may be showing its limits more clearly than usual.',
    nextStep: 'Name the exact behavior, agreement, or condition that needs to change.'
  }
];

const mirrorState = {
  open: false,
  mode: 'self',
  phase: 'shadow',
  roleIndex: 0,
  confirmed: false,
  data: null,
  people: [],
  systems: []
};

const mirrorObserver = new MutationObserver(installMirrorSurface);
mirrorObserver.observe(document.documentElement, { childList: true, subtree: true });
queueMicrotask(installMirrorSurface);

function installMirrorSurface() {
  const app = document.querySelector('.app-shell');
  if (!app) return;
  installMirrorNavigation(app);
  if (!app.querySelector('[data-mirror-visual-workspace]')) {
    const workspace = document.createElement('section');
    workspace.dataset.mirrorVisualWorkspace = 'true';
    workspace.dataset.mirrorContract = 'interpretation-first-visual-second';
    workspace.className = 'mirror-visual-workspace';
    workspace.hidden = true;
    app.append(workspace);
  }
  if (location.hash === '#mirror' && !mirrorState.open) openMirrorSurface();
}

function installMirrorNavigation(app) {
  const desktopNav = app.querySelector('.side-rail nav');
  const mobileNav = app.querySelector('.tabbar');
  addMirrorButton(desktopNav, 'desktop');
  addMirrorButton(mobileNav, 'mobile');

  for (const nav of [desktopNav, mobileNav]) {
    if (!nav || nav.dataset.mirrorCloseBound === 'true') continue;
    nav.dataset.mirrorCloseBound = 'true';
    nav.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('[data-open-mirror]')) return;
      if (mirrorState.open) closeMirrorSurface(false);
    });
  }
}

function addMirrorButton(nav, kind) {
  if (!nav || nav.querySelector('[data-open-mirror]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.openMirror = kind;
  button.className = 'mirror-nav-button';
  button.innerHTML = kind === 'desktop' ? '<span>M</span>Mirror' : 'Mirror';
  button.addEventListener('click', openMirrorSurface);
  const first = nav.children[0];
  first?.insertAdjacentElement('afterend', button);
  if (!first) nav.append(button);
}

async function openMirrorSurface() {
  const app = document.querySelector('.app-shell');
  const workspace = app?.querySelector('[data-mirror-visual-workspace]');
  if (!app || !workspace) return;
  mirrorState.open = true;
  app.classList.add('mirror-surface-open');
  workspace.hidden = false;
  history.replaceState(null, '', `${location.pathname}${location.search}#mirror`);
  markMirrorNavigation(true);
  renderMirrorSurface(workspace);
  await loadMirrorContext();
  renderMirrorSurface(workspace);
}

function closeMirrorSurface(updateHash = true) {
  const app = document.querySelector('.app-shell');
  const workspace = app?.querySelector('[data-mirror-visual-workspace]');
  mirrorState.open = false;
  app?.classList.remove('mirror-surface-open');
  if (workspace) workspace.hidden = true;
  markMirrorNavigation(false);
  if (updateHash && location.hash === '#mirror') history.replaceState(null, '', `${location.pathname}${location.search}`);
}

function markMirrorNavigation(active) {
  document.querySelectorAll('[data-open-mirror]').forEach((button) => button.classList.toggle('active', active));
}

async function loadMirrorContext() {
  try {
    const [todayResponse, peopleResponse, systemsResponse] = await Promise.all([
      fetch('/api/v1/today'),
      fetch('/api/v1/people'),
      fetch('/api/v1/systems')
    ]);
    const today = todayResponse.ok ? await todayResponse.json() : {};
    const people = peopleResponse.ok ? await peopleResponse.json() : {};
    const systems = systemsResponse.ok ? await systemsResponse.json() : {};
    mirrorState.data = normalizeVisualMirror(today?.today?.mirrorVisual);
    mirrorState.people = Array.isArray(people.people) ? people.people : [];
    mirrorState.systems = Array.isArray(systems.systems) ? systems.systems : [];
    if (mirrorState.data?.interpretation?.roleId) {
      const roleIndex = previewRoles.findIndex((role) => role.id === mirrorState.data.interpretation.roleId);
      if (roleIndex >= 0) mirrorState.roleIndex = roleIndex;
    }
  } catch {
    mirrorState.data = null;
  }
}

function renderMirrorSurface(workspace) {
  const role = currentRole();
  const art = currentArtwork(role);
  workspace.innerHTML = `
    <div class="mirror-visual-shell">
      <header class="mirror-visual-header">
        <div>
          <p class="eyebrow">VISUAL STORY</p>
          <h1>See the role. Then see how it moves.</h1>
          <p>The interpretation comes from your Baseline, current timing, confirmed experience, and permitted relationship context. The card artwork gives that result a visible form.</p>
        </div>
        <button type="button" class="mirror-close-button" data-close-mirror aria-label="Return to Sovereign">Return to Sovereign</button>
      </header>

      <nav class="mirror-view-switcher" aria-label="Visual story view">
        ${['self', 'interaction', 'family'].map((mode) => `<button type="button" data-mirror-mode="${mode}" class="${mirrorState.mode === mode ? 'active' : ''}">${mode === 'self' ? 'Self' : mode === 'interaction' ? 'Interaction' : 'Family roles'}</button>`).join('')}
      </nav>

      ${mirrorState.mode === 'self' ? renderSelfView(role, art) : mirrorState.mode === 'interaction' ? renderInteractionView(role) : renderFamilyView(role)}

      <footer class="mirror-visual-footer">
        <strong>Interpretation first. Artwork second.</strong>
        <span>The visual archetype can explain the result, but it can never create the result by itself.</span>
      </footer>
    </div>
  `;
  bindMirrorSurfaceControls(workspace);
}

function renderSelfView(role, art) {
  const phaseCopy = mirrorState.phase === 'origin' ? role.origin : mirrorState.phase === 'gift' ? role.gift : role.shadow;
  return `
    <main class="mirror-self-view">
      <section class="mirror-art-column">
        ${renderArchetypeCard(role, art, 'primary')}
        <div class="mirror-phase-switcher" aria-label="View this archetype through three expressions">
          ${[['origin', 'Past protection'], ['shadow', 'Shadow'], ['gift', 'Gift']].map(([phase, label]) => `<button type="button" data-mirror-phase="${phase}" class="${mirrorState.phase === phase ? 'active' : ''}">${label}</button>`).join('')}
        </div>
      </section>

      <section class="mirror-meaning-column">
        <div class="mirror-current-state"><span>${mirrorState.data ? 'YOUR VISUAL STORY' : 'PRESENTATION PREVIEW'}</span><strong>${phaseLabel(mirrorState.phase)}</strong></div>
        <h2>${escapeMirror(role.title)}</h2>
        <p class="mirror-role-line">${escapeMirror(phaseCopy)}</p>

        <div class="mirror-meaning-grid">
          <article><span>WHAT MAY BE ACTIVE NOW</span><p>${escapeMirror(role.current)}</p></article>
          <article><span>WHAT THIS ROLE MAY PROTECT</span><p>${escapeMirror(role.origin)}</p></article>
          <article class="mirror-gift-panel"><span>THE GIFT INSIDE IT</span><p>${escapeMirror(role.gift)}</p></article>
          <article class="mirror-next-panel"><span>ONE NEXT STEP</span><p>${escapeMirror(role.nextStep)}</p></article>
        </div>

        <div class="mirror-confirm-controls">
          <button type="button" class="primary-button" data-mirror-confirm>${mirrorState.confirmed ? 'Confirmed for this moment' : 'This feels close'}</button>
          <button type="button" class="secondary-button" data-mirror-partly>Partly</button>
          <button type="button" class="quiet-button" data-mirror-next-role>Show another role</button>
        </div>

        <details class="mirror-source-drawer">
          <summary>What shaped this interpretation</summary>
          <div>
            <article><span>Baseline / natal design</span><strong>${escapeMirror(sourceValue('baseline', 'Verified Baseline factors appear here when available.'))}</strong></article>
            <article><span>Current timing</span><strong>${escapeMirror(sourceValue('timing', 'Cycles and transits may change the expression; they do not prove the role.'))}</strong></article>
            <article><span>Your confirmation</span><strong>${mirrorState.confirmed ? 'Confirmed for this visual story.' : 'Not confirmed yet.'}</strong></article>
          </div>
        </details>
      </section>

      <aside class="mirror-role-shelf" aria-label="Potential visual roles">
        ${previewRoles.map((item, index) => `<button type="button" data-mirror-role="${index}" class="${mirrorState.roleIndex === index ? 'active' : ''}"><span>${escapeMirror(archetypeArtwork[item.visualArchetypeId]?.numeral || '')}</span><strong>${escapeMirror(item.title)}</strong><small>${escapeMirror(archetypeArtwork[item.visualArchetypeId]?.title || '')}</small></button>`).join('')}
      </aside>
    </main>
  `;
}

function renderInteractionView(primaryRole) {
  const secondaryRole = previewRoles[(mirrorState.roleIndex + 3) % previewRoles.length];
  return `
    <main class="mirror-interaction-view">
      <header><p class="eyebrow">CONSENTED INTERACTION</p><h2>Two roles can create one repeating movement.</h2><p>Each person confirms their own role. Sovereign describes what happens between them without assigning hidden motives or choosing a villain.</p></header>
      <div class="mirror-pair-stage">
        ${renderArchetypeCard(primaryRole, currentArtwork(primaryRole), 'pair')}
        <article class="mirror-between-copy"><span>WHAT HAPPENS BETWEEN THEM</span><h3>${escapeMirror(interactionHeadline(primaryRole, secondaryRole))}</h3><p>${escapeMirror(interactionCopy(primaryRole, secondaryRole))}</p><strong>Both cards require identity-bound, active permission.</strong></article>
        ${renderArchetypeCard(secondaryRole, currentArtwork(secondaryRole), 'pair')}
      </div>
    </main>
  `;
}

function renderFamilyView(primaryRole) {
  const expected = previewRoles[(mirrorState.roleIndex + 2) % previewRoles.length];
  const emerging = previewRoles[(mirrorState.roleIndex + 4) % previewRoles.length];
  return `
    <main class="mirror-family-view">
      <header><p class="eyebrow">FAMILY ROLES</p><h2>One person can hold several positions inside the same system.</h2><p>This view begins with the user’s own confirmed experience. Other people appear only when their permitted context is available.</p></header>
      <div class="mirror-family-stage">
        <div><span>THE ROLE YOU TAKE</span>${renderArchetypeCard(primaryRole, currentArtwork(primaryRole), 'family')}</div>
        <div><span>THE ROLE THE SYSTEM EXPECTS</span>${renderArchetypeCard(expected, currentArtwork(expected), 'family')}</div>
        <div><span>THE ROLE ASKING TO EMERGE</span>${renderArchetypeCard(emerging, currentArtwork(emerging), 'family')}</div>
      </div>
      <article class="mirror-family-explanation"><span>THE STORY BETWEEN THE CARDS</span><p>${escapeMirror(primaryRole.shadow)} ${escapeMirror(expected.origin)} The emerging role offers another way forward: ${escapeMirror(emerging.gift)}</p></article>
    </main>
  `;
}

function renderArchetypeCard(role, art, size) {
  const artworkUrl = mirrorState.data?.visualArchetype?.artworkUrl && role.id === currentRole().id ? mirrorState.data.visualArchetype.artworkUrl : '';
  return `
    <article class="mirror-archetype-card mirror-card-${size}" data-art-key="${escapeMirror(role.visualArchetypeId)}" data-motion-engine="rive-ready" data-phase="${mirrorState.phase}">
      <div class="mirror-art-frame">
        <div class="mirror-art-heading"><span>${escapeMirror(art.numeral)}</span><strong>${escapeMirror(art.title)}</strong></div>
        <div class="mirror-artwork" ${artworkUrl ? `style="--mirror-art:url('${escapeMirror(artworkUrl)}')"` : ''}>
          ${artworkUrl ? '<img alt="" aria-hidden="true" />' : `<div class="mirror-art-placeholder"><i></i><span>${escapeMirror(art.numeral)}</span></div>`}
          <div class="mirror-motion-echo" aria-hidden="true"></div>
        </div>
        <div class="mirror-art-caption"><span>ACTIVE ROLE</span><h3>${escapeMirror(role.title)}</h3><p>${escapeMirror(art.motif)}</p></div>
      </div>
    </article>
  `;
}

function bindMirrorSurfaceControls(workspace) {
  workspace.querySelector('[data-close-mirror]')?.addEventListener('click', () => closeMirrorSurface());
  workspace.querySelectorAll('[data-mirror-mode]').forEach((button) => button.addEventListener('click', () => {
    mirrorState.mode = button.dataset.mirrorMode || 'self';
    renderMirrorSurface(workspace);
  }));
  workspace.querySelectorAll('[data-mirror-phase]').forEach((button) => button.addEventListener('click', () => {
    mirrorState.phase = button.dataset.mirrorPhase || 'shadow';
    renderMirrorSurface(workspace);
  }));
  workspace.querySelectorAll('[data-mirror-role]').forEach((button) => button.addEventListener('click', () => {
    mirrorState.roleIndex = Number(button.dataset.mirrorRole || 0);
    mirrorState.phase = 'shadow';
    mirrorState.confirmed = false;
    renderMirrorSurface(workspace);
  }));
  workspace.querySelector('[data-mirror-confirm]')?.addEventListener('click', () => {
    mirrorState.confirmed = true;
    mirrorState.phase = 'gift';
    renderMirrorSurface(workspace);
  });
  workspace.querySelector('[data-mirror-partly]')?.addEventListener('click', () => {
    mirrorState.confirmed = false;
    mirrorState.phase = 'shadow';
    renderMirrorSurface(workspace);
  });
  workspace.querySelector('[data-mirror-next-role]')?.addEventListener('click', () => {
    mirrorState.roleIndex = (mirrorState.roleIndex + 1) % previewRoles.length;
    mirrorState.phase = 'shadow';
    mirrorState.confirmed = false;
    renderMirrorSurface(workspace);
  });
}

function currentRole() {
  const fallback = previewRoles[mirrorState.roleIndex] || previewRoles[0];
  const interpretation = mirrorState.data?.interpretation;
  if (!interpretation || interpretation.roleId !== fallback.id) return fallback;
  return {
    ...fallback,
    ...Object.fromEntries(Object.entries(interpretation).filter(([, value]) => typeof value === 'string' && value.trim())),
    visualArchetypeId: mirrorState.data.visualArchetype?.id || fallback.visualArchetypeId
  };
}

function currentArtwork(role) {
  const fallback = archetypeArtwork[role.visualArchetypeId] || archetypeArtwork.fool;
  const provided = mirrorState.data?.visualArchetype;
  if (!provided || provided.id !== role.visualArchetypeId) return fallback;
  return {
    ...fallback,
    ...Object.fromEntries(Object.entries(provided).filter(([, value]) => typeof value === 'string' && value.trim()))
  };
}

function normalizeVisualMirror(value) {
  if (!value || typeof value !== 'object') return null;
  const interpretation = value.interpretation && typeof value.interpretation === 'object' ? value.interpretation : null;
  const visualArchetype = value.visualArchetype && typeof value.visualArchetype === 'object' ? value.visualArchetype : null;
  if (!interpretation || !visualArchetype) return null;
  return {
    interpretation: {
      roleId: String(interpretation.roleId || ''),
      title: String(interpretation.title || ''),
      origin: String(interpretation.origin || ''),
      shadow: String(interpretation.shadow || ''),
      gift: String(interpretation.gift || ''),
      current: String(interpretation.current || ''),
      nextStep: String(interpretation.nextStep || '')
    },
    visualArchetype: {
      id: String(visualArchetype.id || ''),
      title: String(visualArchetype.title || ''),
      numeral: String(visualArchetype.numeral || ''),
      motif: String(visualArchetype.motif || ''),
      artworkUrl: typeof visualArchetype.artworkUrl === 'string' ? visualArchetype.artworkUrl : ''
    },
    sources: Array.isArray(value.sources) ? value.sources : []
  };
}

function sourceValue(type, fallback) {
  const source = mirrorState.data?.sources?.find((item) => item?.type === type);
  return source?.value || fallback;
}

function phaseLabel(phase) {
  return ({ origin: 'Past protection', shadow: 'Shadow expression', gift: 'Gift expression' })[phase] || 'Shadow expression';
}

function interactionHeadline(first, second) {
  return `${first.title} meets ${second.title}.`;
}

function interactionCopy(first, second) {
  return `The more the first role protects through ${first.title.toLowerCase()}, the more the second may answer through ${second.title.toLowerCase()}. The useful question is where either person can change their own move.`;
}

function escapeMirror(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
