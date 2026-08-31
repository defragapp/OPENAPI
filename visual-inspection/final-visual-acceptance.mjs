import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWPORTS = [
  ['desktop1440', { width: 1440, height: 900 }],
  ['desktop1280', { width: 1280, height: 800 }],
  ['mobile390', { width: 390, height: 844 }],
  ['mobile430', { width: 430, height: 932 }]
];
const TARGETS = [
  ['sovereign.defrag.app', '/'],
  ['sovereign.defrag.app', '/how-it-works'],
  ['sovereign.defrag.app', '/pricing'],
  ['sovereign.defrag.app', '/faq'],
  ['sovereign.defrag.app', '/privacy'],
  ['sovereign.defrag.app', '/terms'],
  ['sovereign.defrag.app', '/does-not-exist-xyz'],
  ['app.defrag.app', '/login'],
  ['app.defrag.app', '/signup'],
  ['app.defrag.app', '/onboarding'],
  ['app.defrag.app', '/invitation']
];

const REPORT = [];
mkdirSync(resolve(ROOT, 'qa/final-acceptance'), { recursive: true });

for (const [host, route] of TARGETS) {
  for (const [name, viewport] of VIEWPORTS) {
    const browser = await chromium.launch({ headless: true });
    const page = await (await browser.newContext({ viewport })).newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message.slice(0, 300)));
    page.on('requestfailed', (r) => failedRequests.push(r.method() + ' ' + r.url().slice(0, 160) + ' ' + (r.failure()?.errorText || '')));
    page.on('response', (r) => { if (r.status() >= 400) failedRequests.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 160)); });
    const entry = { surface: host + route + ' (' + name + ')', viewport: viewport.width + 'x' + viewport.height };
    try {
      const response = await page.goto('https://' + host + route, { waitUntil: 'load', timeout: 30000 });
      entry.httpStatus = response && response.status() !== null ? response.status() : null;
      entry.title = await page.title();
      entry.h1 = await page.locator('h1').first().textContent().catch(() => null);
      const h1s = entry.h1 ? entry.h1.trim().slice(0, 80) : null;
      entry.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      entry.emptySections = await page.evaluate(() => {
        return document.querySelectorAll('section, main > div').length
          ? [...document.querySelectorAll('section, main > div')].filter((s) => {
              const t = (s.textContent || '').trim();
              return t.length < 3 && !s.querySelector('img, svg');
            }).length
          : 0;
      }).catch(() => 0);
      entry.smallTargets = await page.evaluate(() => {
        return [...document.querySelectorAll('a, button')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.height < 40 && !e.closest('details');
          })
          .slice(0, 12)
          .map((e) => {
            const r = e.getBoundingClientRect();
            return (e.tagName + ':' + ((e.textContent || e.getAttribute('aria-label') || e.className || '').trim().slice(0, 16)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
          });
      }).catch(() => []);
      const defects = [];
      if (consoleErrors.length) defects.push(consoleErrors.length + ' console errors');
      if (failedRequests.length) defects.push(failedRequests.length + ' failed reqs');
      if (entry.overflowX > 2) defects.push('overflow ' + entry.overflowX + 'px');
      if (entry.emptySections > 0) defects.push(entry.emptySections + ' empty sections');
      if (entry.smallTargets.length) defects.push('small targets: ' + entry.smallTargets.join('; '));
      if (entry.httpStatus && entry.httpStatus >= 400) defects.push('HTTP ' + entry.httpStatus);
      const internalTerms = await page.evaluate(() => {
        const known = ['Baseline Design', 'Sovereign.OS'];
        const body = document.body.innerText || '';
        return known.filter((t) => body.includes(t));
      }).catch(() => []);
      entry.productTermsFound = internalTerms;
      if (defects.length === 0) {
        entry.status = 'GREEN';
        entry.defect = 'PASS';
      } else {
        entry.status = 'DEFECT';
        entry.defect = defects.join(' | ');
      }
      const safe = route === '/' ? 'root' : route.replace(/[^a-zA-Z0-9]+/g, '-');
      entry.screenshot = resolve(ROOT, 'qa/final-acceptance/final-' + host.split('.')[0] + '-' + name + '-' + safe + '.png');
      await page.screenshot({ path: entry.screenshot, fullPage: false });
      entry.consoleErrors = consoleErrors;
      entry.failedRequests = failedRequests;
    } catch (error) {
      entry.status = 'BLOCKED';
      entry.defect = String(error.message).slice(0, 300);
    }
    REPORT.push(entry);
    console.log('[' + entry.status + '] ' + entry.surface + ': ' + entry.defect);
    await browser.close();
  }
}
writeFileSync(resolve(ROOT, 'final-visual-acceptance-report.json'), JSON.stringify(REPORT, null, 2));
