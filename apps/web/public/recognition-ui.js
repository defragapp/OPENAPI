const nativeFetch = window.fetch.bind(window);
let latestOffer = null;
let shareFrameworkEvidence = false;

window.fetch = async (...args) => {
  const input = args[0];
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const nextArgs = addFrameworkScopeWhenSelected(url, args);
  const response = await nativeFetch(...nextArgs);
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

function renderEnhancements() {
  renderOffer();
  renderFrameworkConsentControl();
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
