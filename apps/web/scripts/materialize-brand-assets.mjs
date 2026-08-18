import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const webRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(webRoot, '../..');
const publicDir = resolve(webRoot, 'public');
const distDir = resolve(webRoot, 'dist');

mkdirSync(distDir, { recursive: true });

const jobs = [
  {
    source: resolve(publicDir, 'og-sovereign.svg'),
    target: resolve(distDir, 'og-sovereign.png'),
    width: 1200,
    height: 630
  },
  {
    source: resolve(publicDir, 'app-icon.svg'),
    target: resolve(distDir, 'app-icon.png'),
    width: 512,
    height: 512
  },
  {
    source: resolve(publicDir, 'app-icon.svg'),
    target: resolve(distDir, 'apple-touch-icon.png'),
    width: 180,
    height: 180
  }
];

for (const job of jobs) {
  await sharp(job.source, { density: 288 })
    .resize(job.width, job.height, { fit: 'fill' })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
    .toFile(job.target);
}

console.log(`Materialized ${jobs.length} raster brand assets in ${distDir}`);
