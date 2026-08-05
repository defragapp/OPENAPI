let releaseInteractionRuntimeInstalled = false;

const inspectedSelector = '.landing-expression-slice[data-inspecting="true"]';

function clearInspectedFields(): void {
  document.querySelectorAll<HTMLElement>(inspectedSelector).forEach((field) => {
    field.removeAttribute('data-inspecting');
  });
}

function markInspected(target: EventTarget | null): boolean {
  const element = target instanceof Element ? target : null;
  const vector = element?.closest('.landing-expression-slice__vector');
  const field = vector?.closest<HTMLElement>('.landing-expression-slice');
  if (!field) return false;
  field.dataset.inspecting = 'true';
  return true;
}

export function installReleaseInteractionRuntime(): void {
  if (releaseInteractionRuntimeInstalled || typeof document === 'undefined') return;
  releaseInteractionRuntimeInstalled = true;

  document.addEventListener('click', (event) => {
    if (markInspected(event.target)) return;
    const element = event.target instanceof Element ? event.target : null;
    if (!element?.closest('.landing-expression-slice')) clearInspectedFields();
  });

  document.addEventListener('focusin', (event) => {
    markInspected(event.target);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') clearInspectedFields();
  });
}
