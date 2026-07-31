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
  consentStacked: boolean;
};

export type PublicLandingViewportResult = {
  ok: boolean;
  failures: string[];
  snapshot: PublicLandingViewportSnapshot;
};

const requiredSurfaces = [
  'hero-content',
  'baseline-artifact',
  'personal-chat',
  'personal-workflow',
  'relationship-chat',
  'relationship-workflow',
  'system-instrument',
  'consent'
] as const;

export function evaluatePublicLandingViewport(snapshot: PublicLandingViewportSnapshot): PublicLandingViewportResult {
  const failures: string[] = [];
  if (snapshot.scrollWidth > snapshot.viewportWidth + 1) failures.push(`horizontal overflow ${snapshot.scrollWidth}px > ${snapshot.viewportWidth}px`);

  for (const id of requiredSurfaces) {
    const surface = snapshot.surfaces.find((item) => item.id === id);
    if (!surface) {
      failures.push(`missing surface ${id}`);
      continue;
    }
    if (surface.left < 12) failures.push(`${id} left gutter ${surface.left}px < 12px`);
    if (snapshot.viewportWidth - surface.right < 12) failures.push(`${id} right gutter ${snapshot.viewportWidth - surface.right}px < 12px`);
    if (snapshot.viewportWidth <= 720 && !['hero-content', 'baseline-artifact', 'consent'].includes(id)) {
      const minimum = snapshot.viewportWidth - 42;
      if (surface.width < minimum) failures.push(`${id} width ${surface.width}px < ${minimum}px`);
    }
    if (surface.layoutWidth > 0) {
      const scale = surface.width / surface.layoutWidth;
      if (scale < .98 || scale > 1.02) failures.push(`${id} rendered scale ${scale.toFixed(3)} is not 1`);
    }
  }

  snapshot.stageGaps.forEach((gap, index) => {
    if (gap > 84) failures.push(`stage gap ${index + 1} is ${gap}px`);
    if (gap < 18) failures.push(`stage gap ${index + 1} is ${gap}px`);
  });
  if (!snapshot.consentStacked) failures.push('consent section is not stacked');
  return { ok: failures.length === 0, failures, snapshot };
}

export function measurePublicLandingViewport(doc: Document = document, viewportWidth = window.innerWidth): PublicLandingViewportSnapshot {
  const root = doc.querySelector<HTMLElement>('.sovereign-public');
  if (!root) return { viewportWidth, scrollWidth: doc.documentElement.scrollWidth, surfaces: [], stageGaps: [], consentStacked: false };

  const surfaces = Array.from(root.querySelectorAll<HTMLElement>('[data-viewport-surface]')).map((node) => {
    const rect = node.getBoundingClientRect();
    return { id: node.dataset.viewportSurface ?? 'unknown', left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), layoutWidth: node.offsetWidth };
  });

  const stageGaps = Array.from(root.querySelectorAll<HTMLElement>('[data-viewport-stage]')).map((stage) => {
    const section = stage.closest<HTMLElement>('[data-viewport-section]');
    const heading = section?.querySelector<HTMLElement>('.story-heading');
    if (!heading) return 38;
    return Math.round(stage.getBoundingClientRect().top - heading.getBoundingClientRect().bottom);
  });

  const consent = root.querySelector<HTMLElement>('[data-viewport-section="consent"]');
  const consentHeader = consent?.querySelector<HTMLElement>('header');
  const consentDetails = consent?.querySelector<HTMLElement>('[data-viewport-surface="consent"]');
  const consentStacked = viewportWidth > 980 || Boolean(consentHeader && consentDetails && consentDetails.getBoundingClientRect().top >= consentHeader.getBoundingClientRect().bottom + 18);

  return { viewportWidth, scrollWidth: doc.documentElement.scrollWidth, surfaces, stageGaps, consentStacked };
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
