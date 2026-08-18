const labels = {
  'pair.compare': 'Compare your two Baselines',
  'system.include': 'Include you in a family, household, friendship, or team view',
  'trait.display': 'Use the plain-language themes you chose to share',
  'framework.display': 'Show optional source details',
  'current_conditions.use': 'Use your temporary current conditions',
  'library.link': 'Use a saved understanding',
  'covenant.include': 'Include you in a Scripture lens'
};

const descriptions = {
  'pair.compare': 'Use the two Baselines together for this connection while keeping each person distinct.',
  'system.include': 'Allow what you chose to share to be included in one named group view.',
  'trait.display': 'Show only the plain-language themes you chose to share.',
  'framework.display': 'Show optional source details you chose to share with this connection.',
  'current_conditions.use': 'Include temporary current conditions without treating them as proof of how you feel or what you will do.',
  'library.link': 'Use a saved understanding you chose to share with this connection.',
  'covenant.include': 'Include what you shared only when the optional Covenant lens is on.'
};

const status = document.querySelector('#status');
const container = document.querySelector('#invitations');

async function load() {
  const response = await fetch('/api/v1/invitations/mine', { headers: { accept: 'application/json' } });
  if (response.status === 401) {
    status.textContent = 'Sign in to review your sharing choices.';
    container.innerHTML = '<p class="consent-empty">Your sharing choices are connected to your account. <a class="launch-button primary" href="/login">Sign in</a></p>';
    return;
  }
  if (!response.ok) {
    status.textContent = 'Your sharing choices could not be loaded. Try again.';
    return;
  }
  const data = await response.json();
  render(data.invitations || []);
}

function render(invitations) {
  container.replaceChildren();
  if (!invitations.length) {
    status.textContent = 'No accepted invitations are connected to this account.';
    container.innerHTML = '<p class="consent-empty">When you accept a Sovereign.OS invitation, the requested uses and your choices will appear here.</p>';
    return;
  }

  status.textContent = 'Choose each use independently.';
  for (const invitation of invitations) {
    const article = document.createElement('article');
    article.className = 'consent-invitation';

    const heading = document.createElement('h3');
    heading.textContent = invitation.displayName || 'Private connection';
    article.append(heading);

    const note = document.createElement('p');
    note.textContent = 'Only the uses listed below are being requested.';
    article.append(note);

    for (const scope of invitation.requestedScopes || []) article.append(scopeRow(invitation, scope));
    container.append(article);
  }
}

function scopeRow(invitation, scope) {
  const row = document.createElement('div');
  row.className = 'consent-scope';

  const copy = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = labels[scope] || 'Requested use';
  const detail = document.createElement('small');
  const decision = invitation.decisions?.[scope];
  const decisionLabel = decision === 'granted' ? 'Currently allowed.' : decision === 'denied' ? 'Not allowed.' : 'No decision yet.';
  detail.textContent = `${decisionLabel} ${descriptions[scope] || 'Use only what this choice allows.'}`;
  copy.append(title, detail);

  const actions = document.createElement('div');
  actions.className = 'consent-actions';

  const allow = document.createElement('button');
  allow.textContent = decision === 'granted' ? 'Allowed' : 'Allow';
  allow.disabled = decision === 'granted';
  allow.addEventListener('click', () => decide(invitation.id, scope, true, row));

  const deny = document.createElement('button');
  deny.className = 'secondary';
  deny.textContent = decision === 'denied' ? 'Not allowed' : 'Do not allow';
  deny.disabled = decision === 'denied';
  deny.addEventListener('click', () => decide(invitation.id, scope, false, row));

  actions.append(allow, deny);
  row.append(copy, actions);
  return row;
}

async function decide(invitationId, scope, granted, row) {
  for (const button of row.querySelectorAll('button')) button.disabled = true;
  status.textContent = 'Saving your choice…';
  const response = await fetch(`/api/v1/invitations/${encodeURIComponent(invitationId)}/consent/${encodeURIComponent(scope)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ granted })
  });
  if (!response.ok) {
    status.textContent = 'That choice could not be saved. Nothing changed.';
    for (const button of row.querySelectorAll('button')) button.disabled = false;
    return;
  }
  status.textContent = granted ? 'This use is now allowed.' : 'This use is now off.';
  await load();
}

load().catch(() => { status.textContent = 'Your sharing choices could not be loaded. Try again.'; });