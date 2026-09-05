import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load wrangler config
const wranglerPath = path.resolve('wrangler.jsonc');
let wranglerConfig = {};
try {
  const raw = fs.readFileSync(wranglerPath, 'utf-8');
  wranglerConfig = JSON.parse(raw);
} catch (e) {
  console.error('Failed to read wrangler.jsonc', e);
}

// Extract routes from wrangler config
const routes = (wranglerConfig.routes || []).map((r) => r.pattern);

// Scan Next.js/Pages routes (app router) in apps/web/src
function scanAppRoutes(dir) {
  const routes = [];
  const walk = (p, base = '') => {
    const entries = fs.readdirSync(p, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(p, entry.name);
      if (entry.isDirectory()) {
        walk(full, path.join(base, entry.name));
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
          // Compute route path based on file location relative to src
          let routePath = '/' + base;
          if (routePath.endsWith('index')) {
            routePath = routePath.replace(/index$/, '');
          }
          routePath = routePath.replace(/\\/g, '/');
          routes.push(routePath);
        }
      }
    }
  };
  if (fs.existsSync(dir)) {
    walk(dir);
  }
  return routes;
}

const webSrcDir = path.resolve('apps/web/src');
const appRoutes = scanAppRoutes(webSrcDir);

// Gather environment variables from wrangler vars
const vars = wranglerConfig.vars || {};

// Generate report
const lines = [];
lines.push('# LAUNCH GAP ANALYSIS');
lines.push('');
lines.push('## Repository Info');
lines.push(`- Remote URL: ${wranglerConfig.account_id ? 'Cloudflare Account ID ' + wranglerConfig.account_id : 'N/A'}`);
lines.push('');
lines.push('## Wrangler Routes');
lines.push(...routes.map((r) => `- ${r}`));
lines.push('');
lines.push('## Detected App Routes (src)');
lines.push(...appRoutes.map((r) => `- ${r}`));
lines.push('');
lines.push('## Environment Variables');
for (const [k, v] of Object.entries(vars)) {
  lines.push(`- ${k}: ${v}`);
}
lines.push('');
lines.push('## Detected Gaps (Manual Review)');
lines.push('- Auth flow: verify OAuth callbacks and session handling');
lines.push('- Stripe integration: ensure checkout & webhook implementation');
lines.push('- Baseline generation: confirm endpoint and DB schema');
lines.push('- AI chat wiring: verify baseline context fetch');
lines.push('- UI refactor: `/how-it-works` page requires redesign to Powder spec');

const reportPath = path.resolve('LAUNCH_GAP_ANALYSIS.md');
fs.writeFileSync(reportPath, lines.join('\n'));
console.log('Audit completed. Report written to', reportPath);
