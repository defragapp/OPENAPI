const WORKSPACE_PATH = '/app';
let scheduled = false;

if (location.pathname === WORKSPACE_PATH) installUxAuditPass();

function installUxAuditPass() {
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhanceWorkspace();
    });
  };

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
}

function enhanceWorkspace() {
  enhanceTodayOnboarding();
  enhanceTermDefinitions();
  enhanceExploreCards();
  enhancePeopleCanvas();
  enhanceSystemsCanvas();
  enhanceLibraryEmptyState();
}

function currentSurface() {
  return document.querySelector('.topbar h1')?.textContent?.trim() || '';
}

function clickSurface(label) {
  const button = Array.from(document.querySelectorAll('.side-rail nav button, .tabbar button'))
    .find((item) => item.textContent?.trim().endsWith(label));
  button?.click();
}

function focusField(labelPattern) {
  const label = Array.from(document.querySelectorAll('label.field'))
    .find((item) => labelPattern.test(item.textContent || ''));
  const control = label?.querySelector('input, select, textarea');
  if (!(control instanceof HTMLElement)) return false;
  control.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => control.focus({ preventScroll: true }), 240);
  return true;
}

function focusComposer(placeholder) {
  const textarea = document.querySelector('.composer textarea');
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  if (placeholder) textarea.placeholder = placeholder;
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => textarea.focus({ preventScroll: true }), 240);
}

function makeInteractive(element, label, action) {
  if (!(element instanceof HTMLElement) || element.dataset.uxInteractive === 'true') return;
  element.dataset.uxInteractive = 'true';
  element.classList.add('ux-interactive-object');
  element.setAttribute('role', 'button');
  element.setAttribute('tabindex', '0');
  element.setAttribute('aria-label', label);
  element.addEventListener('click', action);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  });
}

function enhanceTodayOnboarding() {
  if (currentSurface() !== 'Today') return;
  const canvas = document.querySelector('.today-intelligence');
  if (!(canvas instanceof HTMLElement)) return;
  const baselineCore = canvas.querySelector('.baseline-core-object strong')?.textContent || '';
  if (!/build your design/i.test(baselineCore) || canvas.querySelector('.first-run-guide')) return;

  const guide = document.createElement('section');
  guide.className = 'first-run-guide';
  guide.setAttribute('aria-label', 'Getting started');
  guide.innerHTML = `
    <div>
      <p class="eyebrow">START HERE</p>
      <h3>Understand your design before asking a question.</h3>
      <p>Build your Baseline once. Then explore yourself, a choice, a relationship, or a whole system in ordinary language.</p>
    </div>
    <ol>
      <li><span>1</span><strong>Build your Baseline</strong><small>Your stable personal framework</small></li>
      <li><span>2</span><strong>Choose what to explore</strong><small>Self, choice, relationship, or system</small></li>
      <li><span>3</span><strong>Ask naturally</strong><small>No specialized prompt required</small></li>
    </ol>
    <button type="button" class="primary-button">Build my Baseline</button>`;

  guide.querySelector('button')?.addEventListener('click', () => {
    clickSurface('You');
    window.setTimeout(() => focusField(/birth date/i), 180);
  });
  canvas.prepend(guide);
}

function enhanceTermDefinitions() {
  if (currentSurface() !== 'Today') return;
  const canvas = document.querySelector('.today-intelligence');
  const heading = canvas?.querySelector('.intelligence-heading');
  if (!(heading instanceof HTMLElement) || canvas.querySelector('.term-definition-row')) return;

  const definitions = document.createElement('div');
  definitions.className = 'term-definition-row';
  definitions.innerHTML = `
    <span><strong>Baseline Design</strong> Your stable personal framework.</span>
    <span><strong>Live Sky</strong> A separate timing layer showing what may be more active now.</span>`;
  heading.insertAdjacentElement('afterend', definitions);

  document.querySelectorAll('.context-chip').forEach((chip) => {
    const text = chip.textContent || '';
    if (/^Baseline\b/i.test(text)) chip.setAttribute('title', 'Your stable personal framework.');
    if (/^Live Sky\b/i.test(text)) chip.setAttribute('title', 'A separate timing layer showing what may be more active now.');
  });
}

function enhanceExploreCards() {
  document.querySelectorAll('.mode-object').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    card.classList.add('ux-clickable-card');
    if (!card.querySelector('.ux-card-action')) {
      const action = document.createElement('span');
      action.className = 'ux-card-action';
      action.textContent = 'Explore →';
      card.appendChild(action);
    }
  });
}

function enhancePeopleCanvas() {
  if (currentSurface() !== 'People') return;
  const split = document.querySelector('.perspective-split');
  if (!(split instanceof HTMLElement)) return;
  split.setAttribute('role', 'group');
  split.setAttribute('aria-label', 'Choose where to begin in this relationship');
  const parts = Array.from(split.children);

  makeInteractive(parts[0], 'Open your Baseline Design', () => clickSurface('You'));
  makeInteractive(parts[1], 'Choose the relationship or connected person', () => {
    if (!focusField(/choose a person/i)) focusField(/person’s name|person's name/i);
  });
  makeInteractive(parts[2], 'Add or choose the other person', () => {
    if (!focusField(/person’s name|person's name/i)) focusField(/choose a person/i);
  });
}

function enhanceSystemsCanvas() {
  if (currentSurface() !== 'Systems') return;
  const map = document.querySelector('.system-map-preview');
  if (map instanceof HTMLElement) {
    map.setAttribute('role', 'group');
    map.setAttribute('aria-label', 'Choose a part of the system to configure');
  }

  makeInteractive(document.querySelector('.system-node.node-you'), 'Ask about your role in this system', () => {
    focusComposer('What is my role in this system, and what may be changing?');
  });
  makeInteractive(document.querySelector('.system-node.node-system'), 'Choose or create a system', () => {
    if (!focusField(/selected system/i)) focusField(/system name/i);
  });
  makeInteractive(document.querySelector('.system-node.node-person'), 'Choose a permitted person', () => {
    focusField(/person with an active connection/i);
  });

  document.querySelectorAll('.system-overlay-list span').forEach((chip) => {
    if (!(chip instanceof HTMLElement)) return;
    makeInteractive(chip, `Ask about ${chip.textContent || 'this system layer'}`, () => {
      const topic = (chip.textContent || 'this part').toLowerCase();
      focusComposer(`Help me understand ${topic} in this system.`);
    });
  });
}

function enhanceLibraryEmptyState() {
  if (currentSurface() !== 'Library') return;
  const empty = document.querySelector('.empty-library');
  if (!(empty instanceof HTMLElement) || empty.dataset.guided === 'true') return;
  empty.dataset.guided = 'true';
  empty.classList.add('is-guided-empty');

  const steps = document.createElement('div');
  steps.className = 'empty-library-steps';
  steps.innerHTML = `
    <span><b>1</b> Explore something meaningful</span>
    <span><b>2</b> Save the understanding</span>
    <span><b>3</b> Return to it here</span>`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-button';
  button.textContent = 'Explore something';
  button.addEventListener('click', () => clickSurface('Explore'));
  empty.append(steps, button);
}
