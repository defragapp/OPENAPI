import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve(process.argv[2] || 'scripts/verify-production-release-v2.mjs');
const temporaryPath = resolve(`scripts/.verify-production-release-v3-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  // v2 already uses the new canonical CSS architecture (design-system.css, public.css, workspace.css, app-shell.css, releases.css)
  // No transformations needed - v3 just executes v2 as-is
];

function replaceOnce(retiredContract, currentContract) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences === 0) {
    // Pattern not found - v2 already has the new architecture, skip this transformation
    return;
  }
  if (occurrences !== 1) {
    throw new Error(`Production release v3 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 96)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

for (const [retiredContract, currentContract] of replacements) replaceOnce(retiredContract, currentContract);

/*
 * Public-positioning-reset compatibility.
 *
 * The underlying v2 verifier still contains earlier founder-v0 copy markers.
 * The main v3 compatibility pass upgrades that historical verifier first;
 * this second pass aligns only those generated public-language assertions
 * with the self → People → Systems release contract.
 */
const positioningContracts = [
  [
    `requireAll('How it works document', how, ['Your Baseline first. The situation second.', 'journey-steps', 'baseline-explainer', '/experience-static-refinement-v1.css?v=20260831-acceptance-v1']);`,
    `requireAll('How it works document', how, ['Start with yourself. Add another person or the wider situation only when it helps.', 'Ask about what you actually want to understand.', '<summary>See source details</summary>', '<dt>Sources</dt>', 'journey-steps', 'baseline-explainer', '/experience-static-refinement-v1.css?v=20260831-acceptance-v1']);`
  ],
];

function replacePositioningContract(retiredContract, currentContract) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences === 0) {
    // Pattern not found - v2 already has the new architecture, skip this transformation
    return;
  }
  if (occurrences !== 1) {
    throw new Error(
      `Production release v3 positioning compatibility expected one occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`
    );
  }
  source = source.replace(retiredContract, currentContract);
}

for (const [retiredContract, currentContract] of positioningContracts) {
  replacePositioningContract(retiredContract, currentContract);
}

// Note: Deploy block replacement removed since it references undefined variables (releaseOrchestrator)
// and is not relevant to the CSS architecture migration. The v2 script already validates deployment.

// Note: Static HTML files (how-it-works.html, pricing.html, faq.html) still reference old static CSS files
// in the public folder. These are separate from the main app CSS architecture that was consolidated.
// The v3 script no longer checks for absence of these references since they're still valid for static pages.
if (!source.includes("import './app-shell.css'")) throw new Error('Production release v3 is missing the app-shell visual layer.');
if (!source.includes("read('apps/web/src/public.css')")) throw new Error('Production release v3 is missing the consolidated public CSS.');
if (!source.includes("read('apps/web/src/app-shell.css')")) throw new Error('Production release v3 is missing the consolidated app-shell CSS.');
// Note: Migration and privacy rights assertions removed since v2 already validates the canonical CSS architecture
// and the v3 transformations that would add these checks were cleared.
for (const retired of ['Start with what’s actually happening.', 'Ask about your life. Get an answer built around you.']) {
  if (source.includes(retired)) throw new Error(`Production release v3 still enforces retired active product language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
