import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 1280, height: 800, name: 'desktop-1280' },
    { width: 1440, height: 900, name: 'desktop-1440' },
    { width: 375, height: 667, name: 'mobile-375' },
    { width: 390, height: 844, name: 'mobile-390' },
    { width: 430, height: 932, name: 'mobile-430' },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    console.log(`Navigating for ${vp.name}...`);
    await page.goto('https://sovereign.defrag.app/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `scratch/screenshot-${vp.name}.png`, fullPage: true });
    await context.close();
  }
  await browser.close();
  console.log('Screenshots saved.');
})();
