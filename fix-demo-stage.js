const fs = require('fs');
const cssPath = 'apps/web/src/public.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
  /\.landing-demo-stage__window \{([\s\S]*?)\}/,
  `.landing-demo-stage__window {
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border-highlight);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .018), transparent 30%),
    rgba(12, 14, 18, 0.95);
  box-shadow: 0 30px 82px rgba(0, 0, 0, .24);
  overflow: hidden;
}`
);

fs.writeFileSync(cssPath, css);
