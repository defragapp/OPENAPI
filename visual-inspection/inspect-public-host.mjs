import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Public product host (landing authority). app.defrag.app was covered by
// prod-route-inspection-report.json; this sweep covers the public host.
const BASE = 'https://sovereign.defrag.app';
const VIEWPORTS = {
  desktop1440: { width: 1440, height: 900 },
  desktop1280: { width: 1280, height: 800 },
  mobile390: { width: 390, height: 844 },
  mobile430: { width: 430, height: 932 }
};
const ROUTES = ['/', '/how-it-works', '/pricing', '/faq', '/privacy', '/terms'];

const REPORT = [];
mkdirSync(resolve(ROOT, 'qa/public-host'), { recursive: true });

for (const route of ROUTES) {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message.slice(0, 300)}`));
    page.on('requestfailed', (r) => failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`));
    page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`HTTP ${r.status()} ${r.url()}`); });
    const entry = { surface: `${route} (${name})`, viewport: `${viewport.width}x${viewport.height}` };
    try {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 30000 });
      entry.httpStatus = response?.status() ?? null;
      entry.title = await page.title();
      entry.h1 = await page.locator('h1').first().textContent().catch(() => null);
      entry.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      entry.consoleErrors = consoleErrors;
      entry.failedRequests = failedRequests;
      entry.defect = [
        consoleErrors.length ? `${consoleErrors.length} console errors` : null,
        failedRequests.length ? `${failedRequests.length} failed requests` : null,
        entry.overflowX > 2 ? `horizontal overflow ${entry.overflowX}px` : null,
        entry.httpStatus && entry.httpStatus >= 400 ? `HTTP ${entry.httpStatus}` : null
      ].filter(Boolean).join('; ') || 'PASS';
      entry.screenshot = resolve(ROOT, `qa/public-host/pub-${name}${route === '/' ? '-root' : route.replace(/\//g, '-')}.png`.replace(/\/$/, ''));
      await page.screenshot({ path: entry.screenshot, fullPage: false });
      entry.status = entry.defect === 'PASS' ? 'GREEN' : 'DEFECT';
    } catch (error) {
      entry.status = 'BLOCKED';
      entry.defect = String(error.message).slice(0, 300);
    }
    REPORT.push(entry);
    console.log(`[${entry.status}] ${entry.surface}: ${entry.defect}`);
    await browser.close();
  }
}
writeFileSync(resolve(ROOT, 'public-host-inspection-report.json'), JSON.stringify(REPORT, null, 2));
