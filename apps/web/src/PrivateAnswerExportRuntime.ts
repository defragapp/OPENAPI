let installed = false;
let observer: MutationObserver | null = null;

const EXPORT_ATTRIBUTE = 'data-private-answer-export';

function latestAnswer(): HTMLElement | null {
  const answers = document.querySelectorAll<HTMLElement>('.sovereign-answer');
  return answers.length ? answers[answers.length - 1] ?? null : null;
}

function syncExportControl() {
  const latest = latestAnswer();
  document.querySelectorAll<HTMLButtonElement>(`button[${EXPORT_ATTRIBUTE}]`).forEach((button) => {
    if (!latest || !latest.contains(button)) button.remove();
  });

  if (!latest) return;
  const actions = latest.querySelector<HTMLElement>('.answer-continuations');
  if (!actions || actions.querySelector(`[${EXPORT_ATTRIBUTE}]`)) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'answer-export-action';
  button.setAttribute(EXPORT_ATTRIBUTE, 'true');
  button.setAttribute('aria-label', 'Print this Sovereign answer or save it as a PDF');
  button.textContent = 'Print or save PDF';
  button.addEventListener('click', () => window.print());
  actions.append(button);
}

export function installPrivateAnswerExportRuntime() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      syncExportControl();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }

  observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('beforeprint', () => document.documentElement.setAttribute('data-private-answer-print', 'true'));
  window.addEventListener('afterprint', () => document.documentElement.removeAttribute('data-private-answer-print'));
}

export function uninstallPrivateAnswerExportRuntimeForTest() {
  observer?.disconnect();
  observer = null;
  installed = false;
}
