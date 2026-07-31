import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifactDir = resolve(root, 'apps/web/visual-regression');
const manifest = JSON.parse(readFileSync(resolve(artifactDir, 'public-landing-manifest.json'), 'utf8'));
const assert = (value, message) => { if (!value) throw new Error(message); };

function decodeJpeg(path) {
  const bytes = Buffer.from(readFileSync(path, 'utf8').trim(), 'base64');
  assert(bytes[0] === 0xff && bytes[1] === 0xd8, `${path} is not a JPEG capture.`);
  let offset = 2;
  while (offset < bytes.length) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = bytes.readUInt16BE(offset); offset += 2;
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return { bytes, height: bytes.readUInt16BE(offset + 1), width: bytes.readUInt16BE(offset + 3) };
    }
    offset += length - 2;
  }
  throw new Error(`${path} has no JPEG size marker.`);
}

assert(manifest.contract === 'v0-editorial-reconciliation', 'Visual manifest contract is stale.');
assert(Array.isArray(manifest.captures) && manifest.captures.length === 2, 'Desktop and mobile browser captures are required.');
for (const capture of manifest.captures) {
  const decoded = decodeJpeg(resolve(artifactDir, capture.file));
  const hash = createHash('sha256').update(decoded.bytes).digest('hex');
  assert(hash === capture.sha256, `${capture.file} does not match the approved browser capture.`);
  assert(decoded.bytes.length >= capture.minimumBytes, `${capture.file} is unexpectedly small.`);
  assert(decoded.width === capture.viewport.width && decoded.height === capture.viewport.height, `${capture.file} has the wrong viewport dimensions.`);
  assert(capture.heroHeading.width >= capture.viewport.width * .74, `${capture.file} hero headline is not visually dominant.`);
  assert(capture.nextSectionY >= capture.viewport.height * .95, `${capture.file} first viewport no longer preserves the cinematic hero.`);
}

const landing = readFileSync(resolve(root, 'apps/web/src/PublicLanding.tsx'), 'utf8');
const css = readFileSync(resolve(root, 'apps/web/src/public-landing.css'), 'utf8');
assert(landing.includes('data-visual-contract="v0-editorial-reconciliation"'), 'Public landing is not tied to the approved visual contract.');
assert(landing.includes('className="sovereign-public"'), 'Public landing route is not isolated.');
for (const value of ['Know yourself.', 'Understand the system.', 'Choose what fits.', 'className="baseline-artifact"', 'className="system-instrument"']) assert(landing.includes(value), `Public landing lost ${value}.`);
for (const value of ['.sovereign-public .public-hero', '.sovereign-public .baseline-hinge', '.sovereign-public .product-window', '.sovereign-public .system-instrument', '@media (max-width:720px)']) assert(css.includes(value), `Public landing CSS lost ${value}.`);

console.log(JSON.stringify({ ok: true, contract: manifest.contract, captures: manifest.captures.map(({ file, viewport, sha256 }) => ({ file, viewport, sha256 })) }, null, 2));
