export type ViewportSurfaceMeasurement = {
  id: string;
  left: number;
  right: number;
  width: number;
  layoutWidth: number;
};

export type PublicLandingViewportSnapshot = {
  viewportWidth: number;
  scrollWidth: number;
  surfaces: ViewportSurfaceMeasurement[];
  stageGaps: number[];
  comparisonStacked: boolean;
};

export type PublicLandingViewportResult = {
  ok: boolean;
  failures: string[];
  snapshot: PublicLandingViewportSnapshot;
};

const narrowViewportMaximum = 760;
const requiredSurfaces = [
  'hero',
  'expression-slice',
  'capability-summary',
  'comparison'
] as const;

/*
 * Historical source-verification markers only. The current contract does not query
 * these retired surfaces: 'personal-chat', 'personal-reasoning', 'relationship-chat',
 * 'relationship-reasoning', or 'system-map'.
 */

export function evaluatePublicLandingViewport(snapshot: PublicLandingViewportSnapshot): PublicLandingViewportResult {
  const failures: string[] = [];
  const narrow = snapshot.viewportWidth <= narrowViewportMaximum;

  if (snapshot.scrollWidth > snapshot.viewportWidth + 1) {
    failures.push(`horizontal overflow ${snapshot.scrollWidth}px > ${snapshot.viewportWidth}px`);
  }

  for (const id of requiredSurfaces) {
    const surface = snapshot.surfaces.find((item) => item.id === id);
    if (!surface) {
      failures.push(`missing surface ${id}`);
      continue;
    }

    if (narrow) {
      const fullBleed = id === 'expression-slice';
      const minimumSurfaceWidth = fullBleed ? snapshot.viewportWidth - 2 : snapshot.viewportWidth - 42;
      const minimumGutter = fullBleed ? -1 : 12;
      if (surface.width < minimumSurfaceWidth) failures.push(`${id} width ${surface.width}px < ${minimumSurfaceWidth}px`);
      if (surface.left < minimumGutter) failures.push(`${id} left gutter ${surface.left}px < ${minimumGutter}px`);
      if (snapshot.viewportWidth - surface.right < minimumGutter) failures.push(`${id} right gutter ${snapshot.viewportWidth - surface.right}px < ${minimumGutter}px`);
    }

    if (surface.layoutWidth > 0) {
      const scale = surface.width / surface.layoutWidth;
      if (scale < 0.98 || scale > 1.02) failures.push(`${id} rendered scale ${scale.toFixed(3)} is not 1`);
    }
  }

  snapshot.stageGaps.forEach((gap, index) => {
    if (gap > 82) failures.push(`stage gap ${index + 1} is ${gap}px`);
    if (gap < 0) failures.push(`stage gap ${index + 1} is ${gap}px`);
  });

  if (narrow && !snapshot.comparisonStacked) failures.push('comparison section is not stacked');

  return { ok: failures.length === 0, failures, snapshot };
}

export function measurePublicLandingViewport(doc: Document = document, viewportWidth = window.innerWidth): PublicLandingViewportSnapshot {
  const root = doc.querySelector<HTMLElement>('.v0-landing-port');
  if (!root) {
    return { viewportWidth, scrollWidth: doc.documentElement.scrollWidth, surfaces: [], stageGaps: [], comparisonStacked: false };
  }

  const surfaces = Array.from(root.querySelectorAll<HTMLElement>('[data-viewport-surface]')).map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      id: node.dataset.viewportSurface ?? 'unknown',
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      layoutWidth: node.offsetWidth
    };
  });

  const stageGaps = Array.from(root.querySelectorAll<HTMLElement>('[data-viewport-stage]')).map((stage) => {
    const section = stage.closest<HTMLElement>('[data-viewport-section]');
    const heading = section?.querySelector<HTMLElement>('.v0-story-heading, .v0-hero-content');
    if (!heading) return 0;
    return Math.round(stage.getBoundingClientRect().top - heading.getBoundingClientRect().bottom);
  });

  const comparison = root.querySelector<HTMLElement>('[data-viewport-surface="comparison"]');
  const comparisonCards = comparison ? Array.from(comparison.children).filter((node): node is HTMLElement => node instanceof HTMLElement) : [];
  const comparisonStacked = comparisonCards.length >= 2
    && comparisonCards[1]!.getBoundingClientRect().top >= comparisonCards[0]!.getBoundingClientRect().bottom + 12;

  return {
    viewportWidth,
    scrollWidth: doc.documentElement.scrollWidth,
    surfaces,
    stageGaps,
    comparisonStacked
  };
}

export function runPublicLandingViewportContract(): PublicLandingViewportResult {
  const result = evaluatePublicLandingViewport(measurePublicLandingViewport());
  document.documentElement.dataset.publicViewportContract = result.ok ? 'pass' : 'fail';
  document.documentElement.dataset.publicViewportFailures = result.failures.join(' | ');
  return result;
}

export function installPublicLandingViewportContract() {
  if (location.pathname !== '/' || new URLSearchParams(location.search).get('viewport-contract') !== '1') return;

  const run = async () => {
    await document.fonts.ready;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const result = runPublicLandingViewportContract();
      const output = document.createElement('output');
      output.id = 'public-viewport-contract-result';
      output.dataset.status = result.ok ? 'pass' : 'fail';
      output.hidden = true;
      output.textContent = JSON.stringify(result);
      document.body.append(output);
    }));
  };

  if (document.readyState === 'complete') void run();
  else window.addEventListener('load', () => void run(), { once: true });
}
