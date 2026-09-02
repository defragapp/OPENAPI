const fs = require('fs');
let code = fs.readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');

if (!code.includes('import { LandingDemonstrationStage }')) {
  code = code.replace(
    "import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';",
    "import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice';\nimport { LandingDemonstrationStage } from './LandingDemonstrationStage';"
  );
}

code = code.replace(
  /<LandingExpressionSlice \/>\s+<MobileCapabilityRail \/>/,
  `<MobileCapabilityRail />
      <div className="landing-hero-product-preview">
        <LandingDemonstrationStage />
      </div>`
);

fs.writeFileSync('apps/web/src/PublicLanding.tsx', code);
