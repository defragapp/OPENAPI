const fs = require('fs');
let code = fs.readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');

code = code.replace(
  /<MobileCapabilityRail \/>\n      <div className="landing-hero-product-preview">\n        <LandingDemonstrationStage \/>\n      <\/div>/,
  `<div className="landing-hero-atmosphere">
        <LandingExpressionSlice />
      </div>
      <MobileCapabilityRail />
      <div className="landing-hero-product-preview">
        <LandingDemonstrationStage />
      </div>`
);

fs.writeFileSync('apps/web/src/PublicLanding.tsx', code);
