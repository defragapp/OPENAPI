import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '8b1954d216d65077c6480d62583fe2c2').trim();
const apiToken = String(
  process.env.CLOUDFLARE_BROWSER_API_TOKEN
  || process.env.CLOUDFLARE_API_TOKEN
  || process.env.CF_API_TOKEN
  || ''
).trim();
const commitSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || process.env.APP_VERSION || '').trim();
const publicBase = String(process.env.PUBLIC_SITE_URL || 'https://sovereign.defrag.app').replace(/\/$/, '');
const referencePath = resolve(root, 'tests/visual/sovereign-landing-reference-192x507.jpg.base64');
const outputDirectory = resolve(root, '.visual-release-audit');
const expectedSequence = 'sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

const profiles = [
  {
    name: 'desktop-1440x900',
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    minimumScore: 0.55,
    minimumBandCorrelation: 0.42,
    maximumDarkRatioDelta: 0.20
  },
  {
    name: 'mobile-390x844',
    viewport: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    minimumScore: 0.42,
    minimumBandCorrelation: 0.18,
    maximumDarkRatioDelta: 0.24
  }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function redact(value) {
  return String(value || '')
    .replace(/cfat_[A-Za-z0-9_-]+/g, '[redacted-cloudflare-token]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]');
}

function renderedAuditScript() {
  return `(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const selectors = [
      '.v0-hero',
      '.landing-story--personal',
      '.landing-story--relationship',
      '.landing-story--system',
      '.v0-comparison',
      '.v0-final'
    ];
    const sections = selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return { selector, present: false };
      const rect = element.getBoundingClientRect();
      return {
        selector,
        present: true,
        top: Math.round(rect.top + scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
    const controls = [...document.querySelectorAll('a,button,input,textarea,select')]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
    const root = document.querySelector('.public-approved-v8');
    const heading = document.querySelector('.v0-hero h1');
    const rootStyle = root ? getComputedStyle(root) : null;
    const headingStyle = heading ? getComputedStyle(heading) : null;
    const payload = {
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        width: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
        height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
        overflowX: Math.max(0, Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0) - innerWidth)
      },
      rootPresent: Boolean(root),
      sections,
      controls: {
        count: controls.length,
        minimumWidth: controls.length ? Math.min(...controls.map((item) => item.width)) : 0,
        minimumHeight: controls.length ? Math.min(...controls.map((item) => item.height)) : 0,
        below44: controls.filter((item) => item.width < 44 || item.height < 44).length
      },
      typography: {
        headingFontFamily: headingStyle?.fontFamily || '',
        headingFontSize: headingStyle?.fontSize || '',
        headingLineHeight: headingStyle?.lineHeight || ''
      },
      color: {
        rootBackground: rootStyle?.backgroundColor || '',
        bodyBackground: getComputedStyle(document.body).backgroundColor
      },
      release: {
        contract: document.documentElement.dataset.sovereignPublicLanding || '',
        field: document.documentElement.dataset.sovereignLandingField || '',
        sequence: document.documentElement.dataset.sovereignV0Sequence || ''
      },
      text: document.body.innerText.replace(/\\s+/g, ' ').trim()
    };
    const node = document.createElement('script');
    node.id = '__sovereign_visual_audit';
    node.type = 'application/json';
    node.textContent = JSON.stringify(payload);
    document.head.appendChild(node);
  })();`;
}

async function snapshot(profile) {
  const url = `${publicBase}/?release=${encodeURIComponent(commitSha)}&viewport=${profile.name}`;
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/snapshot?timeout=120000&waitForTimeout=2200&cacheTTL=0`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiToken}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        url,
        viewport: profile.viewport,
        gotoOptions: { waitUntil: 'networkidle0', timeout: 45_000 },
        waitForTimeout: 2_200,
        actionTimeout: 120_000,
        screenshotOptions: { fullPage: true, type: 'png', captureBeyondViewport: true },
        addStyleTag: [{
          content: `html { scroll-behavior: auto !important; }
            *, *::before, *::after {
              animation-delay: 0s !important;
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
            }`
        }],
        addScriptTag: [{ content: renderedAuditScript() }]
      }),
      signal: AbortSignal.timeout(120_000)
    }
  );

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = undefined; }
  if (!response.ok || payload?.success === false) {
    const detail = JSON.stringify(payload?.errors || payload || text);
    throw new Error(
      `Cloudflare Browser Run snapshot failed (${response.status}). `
      + `The release token must include Browser Rendering Write. ${redact(detail).slice(0, 900)}`
    );
  }

  const result = payload?.result || payload;
  const screenshotBase64 = result?.screenshot;
  const content = result?.content;
  assert(typeof screenshotBase64 === 'string' && screenshotBase64.length > 1000, `${profile.name}: snapshot screenshot is missing`);
  assert(typeof content === 'string' && content.includes('<html'), `${profile.name}: snapshot rendered HTML is missing`);
  return {
    url,
    screenshot: Buffer.from(screenshotBase64, 'base64'),
    content
  };
}

function parseRenderedAudit(html) {
  const match = String(html).match(/<script[^>]+id=["']__sovereign_visual_audit["'][^>]*>([\s\S]*?)<\/script>/i);
  assert(match, 'Browser-rendered DOM audit payload is missing');
  return JSON.parse(match[1]);
}

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    const pnpmDirectory = resolve(root, 'node_modules/.pnpm');
    const entry = readdirSync(pnpmDirectory).find((name) => name.startsWith('sharp@'));
    assert(entry, 'sharp is required for deterministic screenshot comparison but is not installed');
    const modulePath = resolve(pnpmDirectory, entry, 'node_modules/sharp/lib/index.js');
    return (await import(pathToFileURL(modulePath).href)).default;
  }
}

function correlation(left, right) {
  assert(left.length === right.length && left.length > 1, 'Correlation inputs must have equal non-zero length');
  let sumLeft = 0;
  let sumRight = 0;
  for (let index = 0; index < left.length; index += 1) {
    sumLeft += left[index];
    sumRight += right[index];
  }
  const meanLeft = sumLeft / left.length;
  const meanRight = sumRight / right.length;
  let numerator = 0;
  let leftSquare = 0;
  let rightSquare = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - meanLeft;
    const rightDelta = right[index] - meanRight;
    numerator += leftDelta * rightDelta;
    leftSquare += leftDelta * leftDelta;
    rightSquare += rightDelta * rightDelta;
  }
  const denominator = Math.sqrt(leftSquare * rightSquare);
  return denominator > 0 ? numerator / denominator : 0;
}

function imageFeatures(raw, width, height) {
  const luma = new Float64Array(width * height);
  let dark = 0;
  let cream = 0;
  let blue = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 3;
    const red = raw[offset] / 255;
    const green = raw[offset + 1] / 255;
    const blueValue = raw[offset + 2] / 255;
    const value = 0.2126 * red + 0.7152 * green + 0.0722 * blueValue;
    luma[pixel] = value;
    if (value < 0.12) dark += 1;
    if (red > 0.55 && green > 0.50 && blueValue > 0.43) cream += 1;
    if (blueValue > 0.16 && blueValue > red * 1.22 && blueValue > green * 1.05) blue += 1;
  }

  const edges = new Float64Array(width * height);
  let edgePixels = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const horizontal = x + 1 < width ? Math.abs(luma[index] - luma[index + 1]) : 0;
      const vertical = y + 1 < height ? Math.abs(luma[index] - luma[index + width]) : 0;
      const edge = horizontal + vertical;
      edges[index] = edge;
      if (edge > 0.08) edgePixels += 1;
    }
  }

  const bands = 64;
  const bandProfile = new Float64Array(bands);
  for (let band = 0; band < bands; band += 1) {
    const startY = Math.floor((band * height) / bands);
    const endY = Math.max(startY + 1, Math.floor(((band + 1) * height) / bands));
    let total = 0;
    let count = 0;
    for (let y = startY; y < Math.min(endY, height); y += 1) {
      for (let x = 0; x < width; x += 1) {
        total += luma[y * width + x];
        count += 1;
      }
    }
    bandProfile[band] = count ? total / count : 0;
  }

  const count = width * height;
  return {
    luma,
    edges,
    bandProfile,
    darkRatio: dark / count,
    creamRatio: cream / count,
    blueRatio: blue / count,
    edgeDensity: edgePixels / count
  };
}

async function normalizedFeatures(sharp, buffer) {
  const width = 192;
  const height = 507;
  const { data, info } = await sharp(buffer)
    .resize(width, height, { fit: 'fill' })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert(info.channels === 3, `Expected RGB screenshot data, received ${info.channels} channels`);
  return imageFeatures(data, width, height);
}

function compareFeatures(reference, actual) {
  let absoluteError = 0;
  for (let index = 0; index < reference.luma.length; index += 1) {
    absoluteError += Math.abs(reference.luma[index] - actual.luma[index]);
  }
  const meanAbsoluteError = absoluteError / reference.luma.length;
  const lumaCorrelation = correlation(reference.luma, actual.luma);
  const edgeCorrelation = correlation(reference.edges, actual.edges);
  const bandCorrelation = correlation(reference.bandProfile, actual.bandProfile);
  const darkRatioDelta = Math.abs(reference.darkRatio - actual.darkRatio);
  const creamRatioDelta = Math.abs(reference.creamRatio - actual.creamRatio);
  const blueRatioDelta = Math.abs(reference.blueRatio - actual.blueRatio);
  const edgeDensityRatio = actual.edgeDensity / Math.max(reference.edgeDensity, 0.0001);

  const normalizedCorrelation = (value) => Math.max(0, Math.min(1, (value + 1) / 2));
  const score = (
    normalizedCorrelation(lumaCorrelation) * 0.16
    + normalizedCorrelation(edgeCorrelation) * 0.14
    + normalizedCorrelation(bandCorrelation) * 0.30
    + Math.max(0, 1 - meanAbsoluteError / 0.35) * 0.16
    + Math.max(0, 1 - darkRatioDelta / 0.25) * 0.14
    + Math.max(0, 1 - Math.abs(Math.log(Math.max(edgeDensityRatio, 0.01))) / Math.log(5)) * 0.10
  );

  return {
    score,
    meanAbsoluteError,
    lumaCorrelation,
    edgeCorrelation,
    bandCorrelation,
    darkRatioDelta,
    creamRatioDelta,
    blueRatioDelta,
    edgeDensityRatio,
    actual: {
      darkRatio: actual.darkRatio,
      creamRatio: actual.creamRatio,
      blueRatio: actual.blueRatio,
      edgeDensity: actual.edgeDensity
    }
  };
}

function assertDom(profile, dom) {
  assert(dom.rootPresent, `${profile.name}: approved landing root is missing in the rendered page`);
  assert(dom.document.overflowX <= 2, `${profile.name}: rendered page overflows horizontally by ${dom.document.overflowX}px`);
  assert(dom.document.height > profile.viewport.height * 3, `${profile.name}: full landing height is unexpectedly short`);
  assert(dom.release.contract === 'v0-public-landing-v3', `${profile.name}: rendered contract is ${dom.release.contract || 'missing'}`);
  assert(dom.release.field === 'landing-expression-field-v3', `${profile.name}: rendered field contract is ${dom.release.field || 'missing'}`);
  assert(dom.release.sequence === expectedSequence, `${profile.name}: rendered sequence fingerprint is stale`);
  assert(dom.sections.every((section) => section.present), `${profile.name}: one or more canonical visual sections are missing`);
  const tops = dom.sections.map((section) => section.top);
  assert(tops.every((top, index) => index === 0 || top > tops[index - 1]), `${profile.name}: canonical visual sections are out of order`);
  for (const requiredText of [
    'Healing isn’t optional.',
    'Holding onto the pain is.',
    'See what keeps happening.',
    'Understand what happens between you.',
    'See the whole system.',
    'Generic AI sees the prompt.',
    'Your thoughts deserve a better place to live.'
  ]) {
    assert(dom.text.includes(requiredText), `${profile.name}: rendered page is missing “${requiredText}”`);
  }
}

function assertComparison(profile, comparison) {
  assert(comparison.score >= profile.minimumScore, `${profile.name}: visual similarity ${comparison.score.toFixed(3)} is below ${profile.minimumScore}`);
  assert(
    comparison.bandCorrelation >= profile.minimumBandCorrelation,
    `${profile.name}: section-rhythm correlation ${comparison.bandCorrelation.toFixed(3)} is below ${profile.minimumBandCorrelation}`
  );
  assert(
    comparison.darkRatioDelta <= profile.maximumDarkRatioDelta,
    `${profile.name}: warm-black surface ratio drift ${comparison.darkRatioDelta.toFixed(3)} exceeds ${profile.maximumDarkRatioDelta}`
  );
  assert(
    comparison.edgeDensityRatio >= 0.25 && comparison.edgeDensityRatio <= 4,
    `${profile.name}: rendered detail density ratio ${comparison.edgeDensityRatio.toFixed(3)} indicates a blank or over-dense page`
  );
}

assert(accountId, 'CLOUDFLARE_ACCOUNT_ID is required for visual release verification');
assert(apiToken, 'A Cloudflare API token with Browser Rendering Write is required for visual release verification');
assert(/^[0-9a-f]{40}$/i.test(commitSha), 'A full deployed commit SHA is required for visual release verification');

mkdirSync(outputDirectory, { recursive: true });
const reference = Buffer.from(readFileSync(referencePath, 'utf8').trim(), 'base64');
assert(reference.length > 8_000, 'Approved visual reference is missing or unexpectedly small');
const referenceSha256 = sha256(reference);
const sharp = await loadSharp();
const referenceMetadata = await sharp(reference).metadata();
assert(referenceMetadata.width === 192 && referenceMetadata.height === 507, 'Approved visual reference dimensions must remain 192x507');
const referenceFeatures = await normalizedFeatures(sharp, reference);

const results = [];
for (const profile of profiles) {
  const captured = await snapshot(profile);
  assert(captured.screenshot.length > 10_000, `${profile.name}: Browser Run returned an empty screenshot`);
  const screenshotPath = resolve(outputDirectory, `${profile.name}.png`);
  writeFileSync(screenshotPath, captured.screenshot);
  const dom = parseRenderedAudit(captured.content);
  const actualFeatures = await normalizedFeatures(sharp, captured.screenshot);
  const comparison = compareFeatures(referenceFeatures, actualFeatures);
  assertDom(profile, dom);
  assertComparison(profile, comparison);
  results.push({
    name: profile.name,
    viewport: profile.viewport,
    url: captured.url,
    screenshot: {
      sha256: sha256(captured.screenshot),
      bytes: captured.screenshot.length,
      path: screenshotPath.replace(`${root}/`, '')
    },
    rendered: {
      document: dom.document,
      sections: dom.sections,
      typography: dom.typography,
      color: dom.color,
      controls: dom.controls
    },
    comparison
  });
}

const report = {
  ok: true,
  release: 'sovereign-v0-public-landing-v3-rendered-visual-audit',
  commitSha,
  reference: {
    source: 'founder-approved screenshot supplied 2026-08-02',
    size: { width: 192, height: 507 },
    sha256: referenceSha256
  },
  method: 'Cloudflare Browser Run snapshot with full-page PNG plus deterministic normalized pixel, edge, color, and section-rhythm comparison',
  results
};
writeFileSync(resolve(outputDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
