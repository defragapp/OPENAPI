const fs = require('fs');
let code = fs.readFileSync('apps/web/src/LandingProductStories.tsx', 'utf8');

code = code.replace("import { LandingDemonstrationStage } from './LandingDemonstrationStage';\n", "");
code = code.replace("      <LandingDemonstrationStage />\n", "");

fs.writeFileSync('apps/web/src/LandingProductStories.tsx', code);
