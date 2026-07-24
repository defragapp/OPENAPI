const nativeFetch = window.fetch.bind(window);
let latestOffer = null;

window.fetch = async (...args) => {
  const response = await nativeFetch(...args);
  const input = args[0];
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const match = url.match(/\/api\/v1\/threads\/([^/]+)\/messages(?:\?|$)/);
  if (match) {
    const offered = response.headers.get('x-sovereign-module-offer') === '1';
    const encodedTitle = response.headers.get('x-sovereign-module-title') || '';
    latestOffer = offered ? { threadId: decodeURIComponent(match[1]), title: decodeTitle(encodedTitle) } : null;
    queueMicrotask(renderOffer);
  }
  return response;
};

const observer = new MutationObserver(() => renderOffer());
observer.observe(document.documentElement, { childList: true, subtree: true });

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

function decodeTitle(value) {
  try { return decodeURIComponent(value); } catch { return value || 'This recognition'; }
}
