const phaseLanguage = {
  origin: {
    stage: 'PAST PROTECTION',
    tab: 'Past protection',
    sub: 'WOUND / HISTORY',
    label: 'WHAT THIS ROLE LEARNED TO PROTECT',
    card: 'PAST PROTECTION'
  },
  shadow: {
    stage: 'SHADOW',
    tab: 'Shadow',
    sub: 'UNDER PRESSURE',
    label: 'HOW THE ROLE TIGHTENS UNDER PRESSURE',
    card: 'SHADOW'
  },
  gift: {
    stage: 'GIFT',
    tab: 'Gift',
    sub: 'CLEAR EXPRESSION',
    label: 'HOW THE SAME ENERGY BECOMES USEFUL',
    card: 'GIFT'
  }
};

let clarityFrame = 0;
const clarityObserver = new MutationObserver(scheduleArchetypeClarity);
clarityObserver.observe(document.documentElement, { childList: true, subtree: true });
scheduleArchetypeClarity();

function scheduleArchetypeClarity() {
  cancelAnimationFrame(clarityFrame);
  clarityFrame = requestAnimationFrame(enhanceArchetypeStories);
}

function enhanceArchetypeStories() {
  document.querySelectorAll('[data-thread-visual-story]').forEach(enhanceArchetypeStory);
}

function enhanceArchetypeStory(section) {
  const phase = Object.hasOwn(phaseLanguage, section.dataset.phase) ? section.dataset.phase : 'shadow';
  const language = phaseLanguage[phase];
  const roleTitle = section.querySelector('.thread-visual-state h4')?.textContent?.trim() || 'Current role';
  const key = `${phase}:${roleTitle}`;
  if (section.dataset.clarityKey === key && section.querySelector('[data-role-map]')) return;

  section.dataset.clarityKey = key;
  section.dataset.clarityPhase = phase;

  const header = section.querySelector('.thread-visual-header');
  const headerTitle = header?.querySelector('h3');
  const headerCopy = header?.querySelector('p:last-child');
  const rule = header?.querySelector('.thread-visual-rule');
  if (headerTitle) headerTitle.textContent = 'One role. Three expressions.';
  if (headerCopy) headerCopy.textContent = 'Your Baseline and confirmed experience identify the role. The visual shows how it can move from past protection, through shadow, toward gift.';
  if (rule) rule.textContent = 'Baseline → timing → visual';

  const phaseButtons = [...section.querySelectorAll('[data-visual-phase]')];
  const order = ['origin', 'shadow', 'gift'];
  phaseButtons.forEach((button, index) => {
    const keyName = button.dataset.visualPhase || order[index] || 'shadow';
    const copy = phaseLanguage[keyName] || phaseLanguage.shadow;
    if (button.dataset.clarityLabel !== keyName) {
      button.dataset.clarityLabel = keyName;
      button.innerHTML = `<span>${index + 1}</span><b>${escapeClarity(copy.tab)}</b><small>${escapeClarity(copy.sub)}</small>`;
    }
    button.setAttribute('aria-label', `${copy.tab}: ${copy.sub.toLowerCase()}`);
  });

  const progress = section.querySelector('.thread-phase-progress');
  if (progress) progress.textContent = `${phaseIndex(phase)} of 3 · ${language.stage}`;

  const state = section.querySelector('.thread-visual-state');
  const stateLabel = state?.querySelector(':scope > span');
  if (stateLabel) stateLabel.textContent = language.label;
  state?.setAttribute('data-state-name', language.stage);

  const cardCaption = section.querySelector('.thread-card-caption > span');
  if (cardCaption) cardCaption.textContent = language.card;

  const summary = section.querySelector('.thread-visual-summary-grid');
  if (summary) {
    summary.dataset.roleMap = 'true';
    let roleCard = summary.querySelector('[data-role-summary]');
    if (!roleCard) {
      roleCard = document.createElement('article');
      roleCard.dataset.roleSummary = 'true';
      summary.prepend(roleCard);
    }
    roleCard.innerHTML = `<span>ROLE</span><p>${escapeClarity(roleTitle)}</p>`;

    const cards = [...summary.querySelectorAll('article:not([data-role-summary])')];
    const pressureLabel = cards[0]?.querySelector('span');
    const movementLabel = cards[1]?.querySelector('span');
    if (pressureLabel) pressureLabel.textContent = 'PRESSURE NOW';
    if (movementLabel) movementLabel.textContent = 'NEXT MOVEMENT';
  }

  const archetypeName = section.querySelector('.thread-card-heading strong')?.textContent?.trim();
  const context = section.querySelector('.thread-card-context');
  if (context && archetypeName) context.textContent = `Visual archetype · ${archetypeName} · one possible role, not a fixed identity.`;
}

function phaseIndex(phase) {
  return phase === 'origin' ? 1 : phase === 'gift' ? 3 : 2;
}

function escapeClarity(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}
