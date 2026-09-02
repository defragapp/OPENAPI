const fs = require('fs');
const cssPath = 'apps/web/src/public.css';
let css = fs.readFileSync(cssPath, 'utf8');

css += `
.landing-hero-atmosphere {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.4;
  mask-image: radial-gradient(circle, black 40%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle, black 40%, transparent 70%);
}

.landing-hero-product-preview {
  position: relative;
  z-index: 10;
  margin-top: 60px;
  width: 100%;
}
`;

fs.writeFileSync(cssPath, css);
