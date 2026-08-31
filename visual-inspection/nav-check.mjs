import { chromium } from 'playwright';
const b = await chromium.launch();
for (const vp of [{width:1440,height:900},{width:390,height:844},{width:1280,height:800},{width:430,height:932}]) {
  const p = await (await b.newContext({viewport:vp})).newPage();
  await p.goto('https://app.defrag.app/login',{waitUntil:'load',timeout:30000});
  const r = await p.evaluate(() => {
    const nav=document.querySelector('.account-shell .account-nav');
    const links=[...document.querySelectorAll('.launch-page .launch-links a, .launch-footer nav a')];
    const cs=nav?getComputedStyle(nav):null;
    return {display:cs?.display, justifyContent:cs?.justifyContent, gap:cs?.gap,
      smallTargets:links.filter(a=>a.getBoundingClientRect().height<44).length};
  });
  console.log(vp.width, JSON.stringify(r));
}
await b.close();
