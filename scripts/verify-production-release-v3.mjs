import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve(process.argv[2] || 'scripts/verify-production-release-v2.mjs');
const temporaryPath = resolve(`scripts/.verify-production-release-v3-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  [
    "\"import './public-landing-approved-v8.css';\",\n  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"",
    "\"import './public-landing-approved-v8.css';\",\n  \"import './landing-hero-field-v4.css';\",\n  \"import './landing-ios-parity-density-v1.css';\",\n  \"import './public-secondary-pages-locked.css';\",\n  \"import './passkey-auth.css';\",\n  \"import './deployed-route-cohesion.css';\""
  ],
  [
    "\"import './landing-hero-field-v4.css'\",\n  \"import './passkey-auth.css'\"",
    "\"import './landing-hero-field-v4.css'\",\n  \"import './landing-ios-parity-density-v1.css'\",\n  \"import './public-secondary-pages-locked.css'\",\n  \"import './passkey-auth.css'\",\n  \"import './deployed-route-cohesion.css'\""
  ],
  [
    "['--v0-page:#0f0f0f', '--v0-cream:#e8ddd0', 'body{min-width:320px', '.launch-nav', '.launch-hero', '.journey-steps', '.pricing-grid', '.faq-list', '.launch-footer']",
    "['--v0-page: #090b0e', '--v0-cream: #f1e9de', '--v0-blue: #2f93ff', '--v0-blue-bright: #78c7ff', '--v0-shell: min(1120px', 'body.launch-page {', '.launch-nav-inner', '.launch-mobile-menu-panel', '.launch-hero', '.journey-steps', '.pricing-grid', '.product-proof-window', '.support-note-section', '.faq-list', '.launch-footer']"
  ],
  [
    "['data-visual-contract=\"founder-v0-static\"', '/v0-public-static.css?v=20260801-v0-global', 'Release compatibility marker only; the retired stylesheet is not loaded']",
    "['data-visual-contract=\"founder-v0-static\"', 'data-secondary-visual-contract=\"founder-v0-locked-v1\"', 'data-route-cohesion=\"v1\"', '/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', 'class=\"launch-nav-inner\"', 'class=\"launch-mobile-menu-panel\"', 'Release compatibility marker only; the retired stylesheet is not loaded']"
  ],
  [
    "'A visual layer loads after passkey auth authority'",
    "'A visual layer loads after deployed route cohesion authority'"
  ]
];

for (const [retiredContract, currentContract] of replacements) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Production release v3 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 96)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

if (source.includes('/v0-public-static.css?v=20260801-v0-global')) {
  throw new Error('Production release v3 still contains the retired static public stylesheet contract.');
}
if (source.includes('/v0-public-static.css?v=20260803-locked-v1')) {
  throw new Error('Production release v3 still contains the pre-refinement secondary stylesheet contract.');
}
if (source.includes("'--v0-page:#0f0f0f'")) {
  throw new Error('Production release v3 still contains the retired standalone public page token.');
}
if (!source.includes("import './deployed-route-cohesion.css'")) {
  throw new Error('Production release v3 is missing the final deployed route visual authority.');
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
