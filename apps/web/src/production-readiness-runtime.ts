let productionReadinessRuntimeInstalled = false;
let compactFrame = 0;

const compactGeometry = {
  panelWidth: '132',
  panelHeight: '34',
  panelRadius: '6',
  titleY: '16',
  valueY: '16',
  metaY: '28'
} as const;

function setAttributeIfChanged(element: Element | null, name: string, value: string): void {
  if (!element || element.getAttribute(name) === value) return;
  element.setAttribute(name, value);
}

function compactLandingTooltips(): void {
  document.querySelectorAll<SVGGElement>('.landing-expression-slice__tooltip').forEach((tooltip) => {
    const panel = tooltip.querySelector<SVGRectElement>('.landing-expression-slice__tooltip-panel');
    const title = tooltip.querySelector<SVGTextElement>('.landing-expression-slice__tooltip-title');
    const value = tooltip.querySelector<SVGTextElement>('.landing-expression-slice__tooltip-value');
    const meta = tooltip.querySelector<SVGTextElement>('.landing-expression-slice__tooltip-meta');

    setAttributeIfChanged(panel, 'width', compactGeometry.panelWidth);
    setAttributeIfChanged(panel, 'height', compactGeometry.panelHeight);
    setAttributeIfChanged(panel, 'rx', compactGeometry.panelRadius);
    setAttributeIfChanged(title, 'y', compactGeometry.titleY);
    setAttributeIfChanged(value, 'y', compactGeometry.valueY);
    setAttributeIfChanged(meta, 'y', compactGeometry.metaY);
    tooltip.dataset.compactEndpointTooltip = 'true';
  });
}

function scheduleCompaction(): void {
  window.cancelAnimationFrame(compactFrame);
  compactFrame = window.requestAnimationFrame(compactLandingTooltips);
}

export function installProductionReadinessRuntime(): void {
  if (productionReadinessRuntimeInstalled || typeof document === 'undefined') return;
  productionReadinessRuntimeInstalled = true;

  document.documentElement.dataset.sovereignProductionReadiness = 'desktop-ios-v1';
  scheduleCompaction();

  const observer = new MutationObserver(scheduleCompaction);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height', 'rx', 'y']
  });

  window.addEventListener('resize', scheduleCompaction, { passive: true });
  window.addEventListener('pageshow', scheduleCompaction, { passive: true });
}
