import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-visual-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-visual-intelligence-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  [
    "const passkeyCss = read('apps/web/src/passkey-auth.css');\nconst staticAuthority = read('apps/web/public/premium-public-release.css');",
    "const passkeyCss = read('apps/web/src/passkey-auth.css');\nconst routeCohesionCss = read('apps/web/src/deployed-route-cohesion.css');\nconst staticAuthority = read('apps/web/public/premium-public-release.css');"
  ],
  [
    "  'apps/web/src/landing-hero-field-v4.css',\n  'apps/web/src/passkey-auth.css'\n])",
    "  'apps/web/src/landing-hero-field-v4.css',\n  'apps/web/src/passkey-auth.css',\n  'apps/web/src/deployed-route-cohesion.css'\n])"
  ],
  [
    "  \"import './landing-hero-field-v4.css'\",\n  \"import './passkey-auth.css'\",\n  \"dataset.sovereignProductStories = 'isolated-mobile-first-v2'\"",
    "  \"import './landing-hero-field-v4.css'\",\n  \"import './passkey-auth.css'\",\n  \"import './deployed-route-cohesion.css'\",\n  \"dataset.sovereignProductStories = 'isolated-mobile-first-v2'\""
  ],
  [
    "const passkeyImport = \"import './passkey-auth.css';\";\nassert(main.indexOf(fieldImport) < main.indexOf(integrationImport), 'Field integration must load after field geometry.');\nassert(main.indexOf(integrationImport) < main.indexOf(storyImport), 'Isolated story styling must load after the opening field.');\nassert(main.indexOf(storyImport) < main.indexOf(heroImport), 'Hero field extension must load after isolated story styling.');\nassert(main.indexOf(heroImport) < main.indexOf(passkeyImport), 'Passkey styling must remain the final platform authority.');\nassert(!main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes(\"import './\"), 'A local visual file loads after passkey authority.');",
    "const passkeyImport = \"import './passkey-auth.css';\";\nconst routeCohesionImport = \"import './deployed-route-cohesion.css';\";\nassert(main.indexOf(fieldImport) < main.indexOf(integrationImport), 'Field integration must load after field geometry.');\nassert(main.indexOf(integrationImport) < main.indexOf(storyImport), 'Isolated story styling must load after the opening field.');\nassert(main.indexOf(storyImport) < main.indexOf(heroImport), 'Hero field extension must load after isolated story styling.');\nassert(main.indexOf(heroImport) < main.indexOf(passkeyImport), 'Passkey styling must load after hero interaction authority.');\nassert(main.indexOf(passkeyImport) < main.indexOf(routeCohesionImport), 'The final non-landing route authority must load after passkey-specific styling.');\nassert(!main.slice(main.indexOf(routeCohesionImport) + routeCohesionImport.length).includes(\"import './\"), 'A local visual file loads after the final deployed route authority.');"
  ],
  [
    "  ['passkey authority', passkeyCss],\n  ['standalone authority', staticV0],",
    "  ['passkey authority', passkeyCss],\n  ['final route authority', routeCohesionCss],\n  ['standalone authority', staticV0],"
  ]
];

for (const [retiredContract, currentContract] of replacements) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Visual intelligence release v2 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

for (const retiredMessage of [
  'Passkey styling must remain the final platform authority.',
  'A local visual file loads after passkey authority.'
]) {
  if (source.includes(retiredMessage)) {
    throw new Error(`Visual intelligence release v2 still contains retired ordering contract: ${retiredMessage}`);
  }
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
