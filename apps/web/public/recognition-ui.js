const nativeFetch = window.fetch.bind(window);
let latestOffer = null;
let shareFrameworkEvidence = false;
let latestMirror = null;
let mirrorRevision = 0;
let mirrorState = { roleIndex: 0, orientation: 'pressure', confirmed: false, browsing: false };

const mirrorRoles = [
  {
    id: 'preserving_connection', numeral: 'I', title: 'Preserving connection',
    line: 'The part of you that tries to keep an important connection intact.',
    protects: 'Belonging, closeness, and the hope that understanding will keep the relationship safe.',
    clear: 'You can care about the connection without making your own needs harder to see.',
    pressure: 'You may be adding more explanation because being understood feels connected to being valued.',
    automatic: 'The need to preserve the connection may be choosing the words before you have named your own limit.',
    returning: 'You can make one clear request and allow the response to give you information.',
    action: 'Say the request once. Remove any sentence that repeats the same need in a different form.'
  },
  {
    id: 'creating_order', numeral: 'II', title: 'Creating order',
    line: 'The part of you that tries to make uncertainty manageable.',
    protects: 'Safety, predictability, and a sense that the situation will not fall apart.',
    clear: 'You can create a plan, limit, or agreement without deciding for everyone else.',
    pressure: 'You may be trying to settle another person’s timing or response because uncertainty feels unsafe.',
    automatic: 'Managing the outcome can begin to replace choosing your own position.',
    returning: 'You can decide what belongs to you and leave the other person’s choice with them.',
    action: 'Name your own action or limit. Stop before turning it into a rule for someone else.'
  },
  {
    id: 'seeking_support', numeral: 'III', title: 'Seeking support',
    line: 'The part of you that wants care, reassurance, and recognition.',
    protects: 'Connection, comfort, and the need to know that you do not have to carry everything alone.',
    clear: 'You can ask for support while keeping hold of the choices that remain yours.',
    pressure: 'You may be waiting for another person’s response before allowing yourself to move.',
    automatic: 'Reassurance can begin to feel like permission to trust your own importance or direction.',
    returning: 'You can ask clearly for support and still identify the next step you can take yourself.',
    action: 'Make one direct request, then choose one action that does not depend on the answer.'
  },
  {
    id: 'creating_change', numeral: 'IV', title: 'Creating change',
    line: 'The part of you that knows something can no longer remain the same.',
    protects: 'Truth, movement, honesty, and the possibility of a different future.',
    clear: 'You can name exactly what is not working and ask for a specific change.',
    pressure: 'You may be making the whole situation larger because a precise request feels too easy to ignore.',
    automatic: 'Urgency can turn the entire person or relationship into the problem.',
    returning: 'You can separate the needed change from the fear that nothing will ever move.',
    action: 'Name the exact behavior, agreement, or decision that needs to change.'
  },
  {
    id: 'protecting_space', numeral: 'V', title: 'Protecting space',
    line: 'The part of you that needs room to know what it wants.',
    protects: 'Independence, privacy, time, and the ability to choose without being crowded.',
    clear: 'You can take space while explaining what the space means and when you will return.',
    pressure: 'You may be becoming less available because a clear answer feels like it will remove your choices.',
    automatic: 'Distance can become a substitute for saying what you know or what you still need time to learn.',
    returning: 'You can state whether you need time, limited contact, a conversation, or an ending.',
    action: 'Give one clear position instead of leaving the distance undefined.'
  },
  {
    id: 'defending_a_limit', numeral: 'VI', title: 'Defending a limit',
    line: 'The part of you that knows something important has been crossed.',
    protects: 'Dignity, fairness, safety, and the right to decide what you will accept.',
    clear: 'You can use anger as information and take action without trying to frighten or punish.',
    pressure: 'Your anger may be carrying a limit that has not yet been said clearly.',
    automatic: 'The need to protect yourself can become an attempt to force distance, submission, or regret.',
    returning: 'You can name what happened, what must stop, and what you will do next.',
    action: 'State the crossed limit and the action you will take if it happens again.'
  }
];

window.fetch = async (...args) => {
  const input = args[0];
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const nextArgs = addFrameworkScopeWhenSelected(url, args);
  const response = await nativeFetch(...nextArgs);

  if (/\/api\/v1\/today(?:\?|$)/.test(url)) {
    response.clone().json().then((data) => {
      const mirror = normalizeMirror(data?.today?.mirror);
      if (!mirror) return;
      latestMirror = mirror;
      const roleIndex = mirrorRoles.findIndex((role) => role.id === mirror.id);
      if (roleIndex >= 0) mirrorState.roleIndex = roleIndex;
      mirrorState.orientation = normalizeOrientation(mirror.orientation);
      mirrorState.confirmed = Boolean(mirror.confirmed);
      mirrorState.browsing = false;
      mirrorRevision += 1;
      queueMicrotask(renderEnhancements);
    }).catch(() => undefined);
  }

  const match = url.match(/\/api\/v1\/threads\/([^/]+)\/messages(?:\?|$)/);
  if (match) {
    const offered = response.headers.get('x-sovereign-module-offer') === '1';
    const encodedTitle = response.headers.get('x-sovereign-module-title') || '';
    latestOffer = offered ? { threadId: decodeURIComponent(match[1]), title: decodeTitle(encodedTitle) } : null;
    queueMicrotask(renderEnhancements);
  }
  return response;
};

const observer = new MutationObserver(() => renderEnhancements());
observer.observe(document.documentElement, { childList: true, subtree: true });
queueMicrotask(renderEnhancements);

function renderEnhancements() {
  renderOffer();
  renderFrameworkConsentControl();
  renderMirrorExperience();
}

function renderMirrorExperience() {
  const existing = document.querySelector('[data-sovereign-mirror]');
  const app = document.querySelector('.app-shell');
  const currentSurface = document.querySelector('.topbar h1')?.textContent?.trim();
  const stack = document.querySelector('.surface-main > .stack');

  if (!app || currentSurface !== 'Today' || !stack) {
    existing?.remove();
    return;
  }

  if (existing) {
    if (existing.dataset.mirrorRevision !== String(mirrorRevision)) paintMirror(existing);
    return;
  }

  const section = document.createElement('section');
  section.dataset.sovereignMirror = 'true';
  section.dataset.mirrorContract = 'baseline-current-user-confirmed';
  stack.insertAdjacentElement('afterend', section);
  paintMirror(section);
}

function paintMirror(section) {
  const role = currentMirrorRole();
  const orientation = normalizeOrientation(mirrorState.orientation);
  const personalized = Boolean(latestMirror && !mirrorState.browsing);
  const orientationCopy = role[orientation] || role.pressure;
  const basis = personalized && Array.isArray(latestMirror.basis) ? latestMirror.basis : [];

  section.className = 'mirror-experience';
  section.dataset.mirrorRevision = String(mirrorRevision);
  section.innerHTML = `
    <header class="mirror-header">
      <div>
        <p class="eyebrow">YOUR MIRROR</p>
        <h2>See which part of your design may be speaking now.</h2>
      </div>
      <p>Natal potential gives the role a foundation. Current context may change how strongly it appears. You decide whether the reflection fits.</p>
    </header>

    <div class="mirror-layout">
      <div class="mirror-object-column">
        <div class="mirror-card-stage">
          <article class="mirror-card" data-orientation="${orientation}" aria-label="${escapeHtml(role.title)}, ${orientationLabel(orientation)}">
            <div class="mirror-card-frame">
              <div class="mirror-card-topline"><span>MIRROR ${role.numeral}</span><span>${orientationLabel(orientation)}</span></div>
              <div class="mirror-card-mark" aria-hidden="true"><i></i><i></i><i></i></div>
              <div class="mirror-card-copy">
                <span>${personalized ? 'POTENTIAL ROLE' : 'EXAMPLE ROLE'}</span>
                <h3>${escapeHtml(role.title)}</h3>
                <p>${escapeHtml(role.line)}</p>
              </div>
              <div class="mirror-card-footer"><span>Baseline</span><span>Current context</span><span>Your confirmation</span></div>
            </div>
          </article>
        </div>

        <div class="mirror-state-control" aria-label="View role states">
          ${['clear', 'pressure', 'automatic', 'returning'].map((state) => `<button type="button" data-mirror-state="${state}" class="${orientation === state ? 'active' : ''}">${orientationLabel(state)}</button>`).join('')}
        </div>
      </div>

      <article class="mirror-story">
        <div class="mirror-story-status"><span>${personalized ? 'YOUR CURRENT MIRROR' : 'PRESENTATION PREVIEW'}</span><strong>${orientationLabel(orientation)}</strong></div>
        <h3>${escapeHtml(orientationCopy)}</h3>

        <div class="mirror-story-grid">
          <section><span>WHAT IT MAY BE PROTECTING</span><p>${escapeHtml(role.protects)}</p></section>
          <section><span>CLEARER EXPRESSION</span><p>${escapeHtml(role.returning)}</p></section>
        </div>

        <section class="mirror-next-step">
          <span>ONE NEXT STEP</span>
          <strong>${escapeHtml(role.action)}</strong>
        </section>

        <div class="mirror-actions">
          <button type="button" class="primary-button" data-mirror-confirm>${mirrorState.confirmed ? 'Confirmed' : 'This feels close'}</button>
          <button type="button" class="secondary-button" data-mirror-partly>Partly</button>
          <button type="button" class="quiet-button" data-mirror-next>Show another role</button>
        </div>
        <p class="mirror-confirmation-note">${mirrorState.confirmed ? 'U✓ Your confirmation is now part of this reflection. Your enduring Baseline was not rewritten.' : 'The card is a possible role—not a fixed identity or a verdict.'}</p>

        <details class="mirror-basis">
          <summary>Why Sovereign showed this</summary>
          <div class="mirror-basis-list">
            ${basis.length ? basis.map((item) => `<div><span>${escapeHtml(item.label || 'Support')}</span><strong>${escapeHtml(item.value || '')}</strong></div>`).join('') : `
              <div><span>Natal foundation</span><strong>Exact verified natal factors appear here when available.</strong></div>
              <div><span>Current context</span><strong>Timing may change the expression; it does not prove the role.</strong></div>
              <div><span>Your confirmation</span><strong>${mirrorState.confirmed ? 'Confirmed for this reflection.' : 'Not confirmed yet.'}</strong></div>
            `}
          </div>
        </details>
      </article>
    </div>

    <div class="mirror-deck" aria-label="Potential roles in your design">
      ${mirrorRoles.map((item, index) => `
        <button type="button" data-mirror-role="${index}" class="${mirrorState.roleIndex === index ? 'active' : ''}">
          <span>${item.numeral}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.line.replace('The part of you that ', ''))}</small>
        </button>
      `).join('')}
    </div>

    <aside class="mirror-pair-note">
      <span>CONSENTED RELATIONSHIP VIEW</span>
      <p>When both people confirm their own card, Sovereign can place the two roles together and show the loop between them—without choosing a villain or claiming hidden motives.</p>
    </aside>
  `;

  bindMirrorControls(section);
}

function bindMirrorControls(section) {
  section.querySelectorAll('[data-mirror-state]').forEach((button) => {
    button.addEventListener('click', () => {
      mirrorState.orientation = button.dataset.mirrorState || 'pressure';
      mirrorState.confirmed = false;
      paintMirror(section);
    });
  });
  section.querySelectorAll('[data-mirror-role]').forEach((button) => {
    button.addEventListener('click', () => {
      mirrorState.roleIndex = Number(button.dataset.mirrorRole || 0);
      mirrorState.orientation = 'pressure';
      mirrorState.confirmed = false;
      mirrorState.browsing = true;
      paintMirror(section);
    });
  });
  section.querySelector('[data-mirror-confirm]')?.addEventListener('click', () => {
    mirrorState.orientation = 'returning';
    mirrorState.confirmed = true;
    paintMirror(section);
  });
  section.querySelector('[data-mirror-partly]')?.addEventListener('click', () => {
    mirrorState.orientation = 'pressure';
    mirrorState.confirmed = false;
    paintMirror(section);
  });
  section.querySelector('[data-mirror-next]')?.addEventListener('click', () => {
    mirrorState.roleIndex = (mirrorState.roleIndex + 1) % mirrorRoles.length;
    mirrorState.orientation = 'pressure';
    mirrorState.confirmed = false;
    mirrorState.browsing = true;
    paintMirror(section);
  });
}

function currentMirrorRole() {
  const fallback = mirrorRoles[mirrorState.roleIndex] || mirrorRoles[0];
  if (!latestMirror || mirrorState.browsing) return fallback;
  return { ...fallback, ...latestMirror };
}

function normalizeMirror(value) {
  if (!value || typeof value !== 'object') return null;
  const id = typeof value.roleId === 'string' ? value.roleId : typeof value.id === 'string' ? value.id : '';
  const fallback = mirrorRoles.find((role) => role.id === id) || mirrorRoles[0];
  return {
    ...fallback,
    id: id || fallback.id,
    title: typeof value.title === 'string' ? value.title : fallback.title,
    line: typeof value.line === 'string' ? value.line : fallback.line,
    protects: typeof value.protects === 'string' ? value.protects : fallback.protects,
    clear: typeof value.clear === 'string' ? value.clear : fallback.clear,
    pressure: typeof value.current === 'string' ? value.current : typeof value.pressure === 'string' ? value.pressure : fallback.pressure,
    automatic: typeof value.automatic === 'string' ? value.automatic : fallback.automatic,
    returning: typeof value.clearer === 'string' ? value.clearer : typeof value.returning === 'string' ? value.returning : fallback.returning,
    action: typeof value.action === 'string' ? value.action : fallback.action,
    orientation: normalizeOrientation(value.orientation),
    confirmed: Boolean(value.confirmed),
    basis: Array.isArray(value.basis) ? value.basis : []
  };
}

function normalizeOrientation(value) {
  const state = String(value || '').toLowerCase();
  if (state === 'upright' || state === 'clear') return 'clear';
  if (state === 'reversed' || state === 'automatic') return 'automatic';
  if (state === 'returning') return 'returning';
  return 'pressure';
}

function orientationLabel(value) {
  return ({ clear: 'Clear', pressure: 'Under pressure', automatic: 'Automatic', returning: 'Returning' })[value] || 'Under pressure';
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

function decodeTitle(value) {
  try { return decodeURIComponent(value); } catch { return value || 'This recognition'; }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
