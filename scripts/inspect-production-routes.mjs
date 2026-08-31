import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PRODUCTION_BASE = 'https://app.defrag.app';
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 }
};

const ROUTES_TO_INSPECT = [
  '/',
  '/how-it-works',
  '/pricing',
  '/faq',
  '/privacy',
  '/terms',
  '/login',
  '/signup',
  '/invitation',
  '/onboarding-gate',
  '/workspace-gate',
  '/404'
];

const REPORT = [];

async function inspectRoute(route) {
  console.log(`\n[INSPECT] ${route}`);

  for (const [deviceType, viewport] of Object.entries(VIEWPORTS)) {
    const snapshot = await captureRoute(route, deviceType, viewport);
    const status = snapshot.valid ? 'DONE' : (snapshot.error ? 'BLOCKED' : 'FOUND');

    REPORT.push({
      surface: `${route} (${deviceType})`,
      defect_or_gap: snapshot.defect || snapshot.error || 'Minimal visual issues found',
      change_made: snapshot.made || 'No changes needed',
      test_performed: snapshot.checked || 'No test performed',
      live_evidence: snapshot.screenshotUrl || `${PRODUCTION_BASE}${route}`,
      status,
      snapshot_result: snapshot
    });

    console.log(`[${status}] ${route} - ${deviceType}: ${snapshot.defect || 'PASS'}`);
  }
}

async function captureRoute(route, deviceType, viewport) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport,
      userAgent: deviceType === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`  [CONSOLE] ${route}/${deviceType}: ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      console.log(`  [PAGE ERROR] ${route}/${deviceType}: ${err.message}`);
    });

    let error = null;
    try {
      await page.goto(`${PRODUCTION_BASE}${route}`, {
        waitUntil: 'load',
        timeout: 30000
      });

      await page.waitForTimeout(1000);

      const audit = await page.evaluate((device) => {
        const out = {
          dimension: `${device.width}x${device.height}`,
          title: document.title,
          contentType: document.body?.textContent?.trim().charAt(0) || 'HTML',
          hasH1: !!document.querySelector('h1'),
          h1Text: document.querySelector('h1')?.textContent?.trim().slice(0, 100) || '(none)',
          hasTitleTag: document.title.length > 5,
          viewportWidth: Math.max(window.innerWidth, document.documentElement.clientWidth),
          overflowCheck: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          forms: document.querySelectorAll('form, input, button').length,
          emptyElements: 0,
          smallTouchTargets: []
        };

        if (device.width < 500) {
          for (const el of document.querySelectorAll('a, button, input, [role="button"]')) {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            if (r.width < 44 && r.width > 0 && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none') {
              out.smallTouchTargets.push(`${el.tagName}.${el.className?.split(' ')[0]?.slice(0, 15)} ${Math.round(r.width)}x${Math.round(r.height)}`);
            }
          }
        }

        out.badImages = document.querySelectorAll('img[alt=""], img:not([alt])').length;
        out.noformLabels = [...document.querySelectorAll('input, textarea')].filter(
          i => !i.previousElementSibling?.textContent?.trim().includes('label')
        ).length;

        return out;
      }, viewport);

      audit.valid = audit.contentType !== 'HTML' && audit.hasTitleTag && !error;

      if (audit.contentType === 'HTML' || (audit.contentType === '' && !error)) {
        audit.defect = 'Returns HTML-only response, no client-side rendering';
      }
      if (audit.title.length < 5) {
        audit.defect = audit.defect || 'Missing or empty title tag';
      }
      if (audit.noformLabels > 0) {
        audit.defect = audit.defect || `Needs form labels: ${audit.noformLabels} inputs without nearby labels`;
      }
      if (audit.badImages > 0) {
        audit.defect = audit.defect || `Missing ALTs: ${audit.badImages} images without or empty alt text`;
      }

      const imagePath = resolve(ROOT, 'visual-inspection', 'qa', `prod-${deviceType}-${route.replace(/\//g, '-')}.png`);
      await page.screenshot({ path: imagePath, fullPage: true });
      audit.screenshotUrl = imagePath;

      return {
        ...audit,
        checked: 'Document audit completed, screenshot saved',
        made: audit.defect ? 'Check attached screenshot and review UX copy/UI layer' : 'No visual issues found'
      };

    } catch (err) {
      error = err.message;
      console.log(`  [CATCH] ${route}/${deviceType}: ${error}`);
      const imagePath = resolve(ROOT, 'visual-inspection', 'qa', `prod-${deviceType}-${route.replace(/\//g, '-')}-FATAL.png`);
      await page.screenshot({ path: imagePath, fullPage: false }).catch(() => {});
      return { error, valid: false, defect: `Capture failed: ${error}`, made: 'Investigate network/timeout', checked: 'Failed capture attempt' };
    } finally {
      await context.close();
    }

  } finally {
    await browser.close();
  }
}

async function main() {
  mkdirSync(resolve(ROOT, 'visual-inspection', 'qa'), { recursive: true });

  console.log(`\n🚀 SOVEREIGN.OS PRODUCTION ROUTE VISUAL INSPECTION`);
  console.log(`📍 Base URL: ${PRODUCTION_BASE}`);
  console.log(`🎯 Routes to inspect: ${ROUTES_TO_INSPECT.length}`);
  console.log(`📊 Devices: Desktop (1920x1080), Mobile (375x667)`);
  console.log(`⏱️  Starting inspection...\n`);

  for (const route of ROUTES_TO_INSPECT) {
    await inspectRoute(route);
  }

  const reportPath = resolve(ROOT, 'visual-inspection', 'prod-route-inspection-report.json');
  writeFileSync(reportPath, JSON.stringify(REPORT, null, 2));

  const summary = {};
  REPORT.forEach(item => {
    if (!summary[item.status]) summary[item.status] = [];
    summary[item.status].push(item.surface);
  });

  console.log(`\n✅ INSPECTION COMPLETE`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`\n📊 SUMMARY:`);
  console.log(`   DONE: ${summary['DONE']?.length || 0}`);
  console.log(`   FIXED: ${summary['FIXED']?.length || 0}`);
  console.log(`   FOUND: ${summary['FOUND']?.length || 0}`);
  console.log(`   BLOCKED: ${summary['BLOCKED']?.length || 0}`);
  console.log(`\nDetailed findings:`);
  REPORT.forEach(item => {
    console.log(`   [${item.status}] ${item.surface}\n     ▸ ${item.defect_or_gap}`);
  });
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});