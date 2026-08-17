import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'scripts/verify-live-route-cohesion.mjs');
const generatedPath = resolve(root, 'scripts/.verify-live-route-cohesion-v2.generated.mjs');

let generated = readFileSync(sourcePath, 'utf8');

const importMarker = "import { readFileSync } from 'node:fs';";
const importReplacement = "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';";
const selectorMarker = "const auditMarkerSelector = `html[${auditAttribute}]`;";
const selectorReplacement = `${selectorMarker}\nconst routeScreenshotDirectory = resolve('.visual-release-audit/routes');`;
const captureMarker = "  const snapshot = await browserSnapshot(request, `${route.name}/${profileName}`);";
const captureReplacement = `${captureMarker}\n  mkdirSync(routeScreenshotDirectory, { recursive: true });\n  const screenshotPath = resolve(routeScreenshotDirectory, `${'${route.name}'}-${'${profileName}'}.png`);\n  if (snapshot.screenshot.length) writeFileSync(screenshotPath, snapshot.screenshot);`;
const resultMarker = "    screenshotSha256: snapshot.screenshot.length ? createHash('sha256').update(snapshot.screenshot).digest('hex') : '',\n    audit";
const resultReplacement = "    screenshotSha256: snapshot.screenshot.length ? createHash('sha256').update(snapshot.screenshot).digest('hex') : '',\n    screenshotPath: screenshotPath.replace(`${root}/`, ''),\n    audit";
const reportMarker = `  console.log(JSON.stringify({
    ok: true,
    release: 'sovereign-deployed-route-cohesion-v1',
    commitSha,
    stylesheet: routeStylesheet,
    auditScript: auditScriptPath,
    browserTransportPreflight: true,
    pages: routes.map((route) => route.name),
    results: results.map((result) => ({
      route: result.route,
      family: result.family,
      profile: result.profile,
      screenshotSha256: result.screenshotSha256,
      document: result.audit.document,
      boxes: result.audit.boxes,
      typography: result.audit.typography
    }))
  }, null, 2));`;
const reportReplacement = `  const report = {
    ok: true,
    release: 'sovereign-deployed-route-cohesion-v1',
    commitSha,
    stylesheet: routeStylesheet,
    auditScript: auditScriptPath,
    browserTransportPreflight: true,
    screenshotDirectory: routeScreenshotDirectory.replace(\`${root}/\`, ''),
    pages: routes.map((route) => route.name),
    results: results.map((result) => ({
      route: result.route,
      family: result.family,
      profile: result.profile,
      screenshotSha256: result.screenshotSha256,
      screenshotPath: result.screenshotPath,
      document: result.audit.document,
      boxes: result.audit.boxes,
      typography: result.audit.typography
    }))
  };
  mkdirSync(routeScreenshotDirectory, { recursive: true });
  writeFileSync(resolve(routeScreenshotDirectory, 'report.json'), \`${'${JSON.stringify(report, null, 2)}'}\\n\`);
  console.log(JSON.stringify(report, null, 2));`;

const replacements = [
  [importMarker, importReplacement],
  [selectorMarker, selectorReplacement],
  [captureMarker, captureReplacement],
  [resultMarker, resultReplacement],
  [reportMarker, reportReplacement]
];

for (const [from] of replacements) {
  if (!generated.includes(from)) {
    throw new Error(`Route cohesion v2 could not locate required v1 marker: ${from.slice(0, 120)}`);
  }
}
for (const [from, to] of replacements) generated = generated.replace(from, to);
for (const [, marker] of replacements) {
  if (!generated.includes(marker)) {
    throw new Error(`Route cohesion v2 did not apply required persistence hardening: ${marker.slice(0, 120)}`);
  }
}

writeFileSync(generatedPath, generated);
try {
  await import(pathToFileURL(generatedPath).href);
} finally {
  rmSync(generatedPath, { force: true });
}
