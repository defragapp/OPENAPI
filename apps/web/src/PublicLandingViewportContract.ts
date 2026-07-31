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
  permissionStacked: boolean;
};

export type PublicLandingViewportResult = {
  ok: boolean;
  failures: string[];
  snapshot: PublicLandingViewportSnapshot;
};

const requiredSurfaces = [
  'hero-answer',
  'baseline',
  'personal-chat',
  'personal-reasoning',
  'relationship-chat',
  'relationship-reasoning',
  'system-map',
  'permission'
] as const;

export function evaluatePublicLandingViewport(snapshot: PublicLandingViewportSnapshot): PublicLandingViewportResult {
  const failures: string[] = [];

  if (snapshot.scrollWidth > snapshot.viewportWidth + 1) {
    failures.push(`horizontal overflow ${snapshot.scrollWidth}px > ${snapshot.viewportWidth}px`);
  }

  for (const id of requiredSurfaces) {
    const surface = snapshot.surfaces.find((item) => item.id === id);
    if (!surface) {
      failures.push(`missing surface ${id}`);
      continue;
    }
    const minimumSurfaceWidth = id === 'baseline' ? snapshot.viewportWidth - 82 : snapshot.viewportWidth - 42;
    if (surface.width < minimumSurfaceWidth) failures.push(`${id} width ${surface.width}px < ${minimumSurfaceWidth}px`);
    if (surface.left < 12) failures.push(`${id} left gutter ${surface.left}px < 12px`);
    if (snapshot.viewportWidth - surface.right < 12) failures.push(`${id} right gutter ${snapshot.viewportWidth - surface.right}px < 12px`);
    if (surface.layoutWidth > 0) {
      const scale = surface.width / surface.layoutWidth;
      if (scale < .98 || scale > 1.02) failures.push(`${id} rendered scale ${scale.toFixed(3)} is not 1`);
    }
  }

  snapshot.stageGaps.forEach((gap, index) => {
    if (gap > 76) failures.push(`stage gap ${index + 1} is ${gap}px`);
    if (gap < 18) failures.push(`stage gap ${index + 1} is ${gap}px`);
  });

  if (!snapshot.permissionStacked) failures.push('permission section is not stacked');

  return { ok: failures.length === 0, failures, snapshot };
}

export function measurePublicLandingViewport(doc: Document = document, viewportWidth = window.innerWidth): PublicLandingViewportSnapshot {
  const root = doc.querySelector<HTMLElement>('.sovereign-landing');
  if (!root) {
    return { viewportWidth, scrollWidth: doc.documentElement.scrollWidth, surfaces: [], stageGaps: [], permissionStacked: false };
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
    const heading = section?.querySelector<HTMLElement>('.story-heading, .landing-hero-copy');
    if (!heading) return 32;
    return Math.round(stage.getBoundingClientRect().top - heading.getBoundingClientRect().bottom);
  });

  const permission = root.querySelector<HTMLElement>('[data-viewport-section="permission"]');
  const permissionHeader = permission?.querySelector<HTMLElement>('.landing-section-header');
  const permissionBoundary = permission?.querySelector<HTMLElement>('[data-viewport-surface="permission"]');
  const permissionStacked = Boolean(permissionHeader && permissionBoundary && permissionBoundary.getBoundingClientRect().top >= permissionHeader.getBoundingClientRect().bottom + 18);

  return {
    viewportWidth,
    scrollWidth: doc.documentElement.scrollWidth,
    surfaces,
    stageGaps,
    permissionStacked
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
