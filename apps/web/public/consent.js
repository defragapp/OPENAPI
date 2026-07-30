const labels = {
  'pair.compare': 'Compare our Baselines',
  'system.include': 'Include me in a group view',
  'trait.display': 'Use the Baseline details I share',
  'framework.display': 'Show supporting source details',
  'current_conditions.use': 'Use my temporary current context',
  'library.link': 'Use an insight I saved',
  'covenant.include': 'Include me in a Covenant answer'
};

const descriptions = {
  'pair.compare': 'Compare the parts of each Baseline that both people agreed to share.',
  'system.include': 'Include you in a family, household, friendship, or team view.',
  'trait.display': 'Use only the plain-language Baseline details you chose to share.',
  'framework.display': 'Show the exact source details behind shared Baseline information when requested.',
  'current_conditions.use': 'Use your temporary current context for this shared question.',
  'library.link': 'Use a saved insight as shared context for this connection.',
  'covenant.include': 'Include you only when the optional Christian Scripture perspective is turned on.'
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
    status.textContent = 'We could not load your permissions. Try again.';
    return;
  }
  const data = await response.json();
  render(data.invitations || []);
}

function render(invitations) {
  container.replaceChildren();
  if (!invitations.length) {
    status.textContent = 'No accepted invitations are connected to this account.';
    container.innerHTML = '<p class="consent-empty">After you accept an invitation, its requested permissions and your choices will appear here.</p>';
    return;
  }

  status.textContent = 'Choose Allow or Do not allow for each permission.';
  for (const invitation of invitations) {
    const article = document.createElement('article');
    article.className = 'consent-invitation';

    const heading = document.createElement('h3');
    heading.textContent = invitation.displayName || 'Private connection';
    article.append(heading);

    const note = document.createElement('p');
    note.textContent = 'Only the permissions listed below are being requested.';
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
  const decisionLabel = decision === 'granted' ? 'Currently allowed.' : decision === 'denied' ? 'Not allowed.' : 'No choice yet.';
  detail.textContent = `${decisionLabel} ${descriptions[scope] || 'Use only the information covered by this specific permission.'}`;
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
  status.textContent = granted ? 'Saving permission…' : 'Saving your choice not to share…';
  const response = await fetch(`/api/v1/invitations/${encodeURIComponent(invitationId)}/consent/${encodeURIComponent(scope)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ granted })
  });
  if (!response.ok) {
    status.textContent = 'We could not save that choice. Nothing changed.';
    for (const button of row.querySelectorAll('button')) button.disabled = false;
    return;
  }
  status.textContent = granted ? 'Permission allowed.' : 'Permission not allowed.';
  await load();
}

load().catch(() => { status.textContent = 'We could not load your permissions. Try again.'; });