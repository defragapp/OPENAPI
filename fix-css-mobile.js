const fs = require('fs');
const cssPath = 'apps/web/src/public.css';
let css = fs.readFileSync(cssPath, 'utf8');

css += `
@media (max-width: 760px) {
  .landing-hero-product-preview {
    margin-top: 40px;
    margin-left: -12px;
    margin-right: -12px;
    width: calc(100% + 24px);
  }

  .landing-demo-stage__window {
    border-radius: 20px;
    border-left: 0;
    border-right: 0;
  }
}
`;

fs.writeFileSync(cssPath, css);
