import { existsSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicRoots = [
  resolve(root, 'apps/web/public'),
  resolve(root, 'apps/web/dist')
];

function collectSourceMaps(directory, found = []) {
  if (!existsSync(directory)) return found;
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) collectSourceMaps(path, found);
    else if (entry.toLowerCase().endsWith('.map')) found.push(relative(root, path));
  }
  return found;
}

const distRoot = publicRoots[1];
if (!existsSync(distRoot)) {
  throw new Error('Public source-map verification requires apps/web/dist; run the production build first.');
}

const exposed = publicRoots.flatMap((directory) => collectSourceMaps(directory));
if (exposed.length > 0) {
  throw new Error(`Public source maps are forbidden:\n${exposed.map((path) => `- ${path}`).join('\n')}`);
}

console.log('Public source-map verification passed: no .map files in apps/web/public or apps/web/dist.');
