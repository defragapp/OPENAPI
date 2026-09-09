const labels = {
  'pair.compare': 'Compare Baselines',
  'system.include': 'Include in family/team view',
  'trait.display': 'Share Baseline Design themes',
  'framework.display': 'Show source details',
  'current_conditions.use': 'Include what\'s active now',
  'library.link': 'Link saved understandings',
  'covenant.include': 'Include in Covenant exploration'
};

const descriptions = {
  'pair.compare': 'Compare both Baselines while keeping each person distinct.',
  'system.include': 'Include this person in a family, household, friendship, or team view.',
  'trait.display': 'Share the plain-language Baseline Design themes you chose.',
  'framework.display': 'Show optional source details.',
  'current_conditions.use': 'Include what\'s active now without treating it as confirmed fact.',
  'library.link': 'Use a saved understanding as shared context for this connection.',
  'covenant.include': 'Include this person only when the optional Covenant lens is on.'
};

const status = document.querySelector('#status');
const container = document.querySelector('#invitations');

async function load() {
  const response = await fetch('/api/v1/invitations/mine', { headers: { accept: 'application/json' } });
  if (response.status === 401) {
    status.textContent = 'Sign in to review your permissions.';
    container.innerHTML = '<p class="consent-empty">Your permission choices are connected to your account. <a class="launch-button primary" href="/login">Sign in</a></p>';
    return;
  }
  if (!response.ok) {
    status.textContent = 'Your permissions could not be loaded safely.';
    return;
  }
  const data = await response.json();
  render(data.invitations || []);
}

function render(invitations) {
  container.replaceChildren();
  if (!invitations.length) {
    status.textContent = 'No accepted invitations are connected to this account.';
    container.innerHTML = '<p class="consent-empty">When you accept a Sovereign.OS invitation, its requested uses and your decisions will appear here.</p>';
    return;
  }

  status.textContent = 'Choose each permission independently.';
  for (const invitation of invitations) {
    const article = document.createElement('article');
    article.className = 'consent-invitation';

    const heading = document.createElement('h3');
    heading.textContent = invitation.displayName || 'Shared relationship';
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
  title.textContent = labels[scope] || scope;
  const detail = document.createElement('small');
  const decision = invitation.decisions?.[scope];
  const decisionLabel = decision === 'granted' ? 'Currently allowed.' : decision === 'denied' ? 'Not allowed.' : 'No decision yet.';
  detail.textContent = `${decisionLabel} ${descriptions[scope] || 'Use only the context covered by this permission.'}`;
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
  status.textContent = granted ? 'Saving permission…' : 'Revoking permission…';
  const response = await fetch(`/api/v1/invitations/${encodeURIComponent(invitationId)}/consent/${encodeURIComponent(scope)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ granted })
  });
  if (!response.ok) {
    status.textContent = 'That decision could not be saved safely.';
    for (const button of row.querySelectorAll('button')) button.disabled = false;
    return;
  }
  status.textContent = granted ? 'Permission allowed for future use.' : 'Permission revoked for future use.';
  await load();
}

load().catch(() => { status.textContent = 'Your permissions could not be loaded safely.'; });
