const fs = require('fs');
const content = fs.readFileSync('apps/web/src/sovereign-custom-theme.css', 'utf-8');

const publicContent = [];
const workspaceContent = [];
const designContent = [];

let currentSection = 'public'; // default first part (landing-demo-stage)

const lines = content.split('\n');
for (let line of lines) {
    if (line.includes('Group 1: Pricing & Public Static Routes')) {
        currentSection = 'public';
    } else if (line.includes('Group 2 & 3: Onboarding & Account Shell') || line.includes('Group 4: Authenticated Workspace Hierarchy')) {
        currentSection = 'workspace';
    } else if (line.includes('Reduced Motion Accessibility')) {
        currentSection = 'design';
    } else if (line.includes('@media (max-width: 860px)')) {
        currentSection = 'public'; // For landing-demo-stage
    }
    
    if (currentSection === 'public') publicContent.push(line);
    else if (currentSection === 'workspace') workspaceContent.push(line);
    else if (currentSection === 'design') designContent.push(line);
}

fs.appendFileSync('apps/web/src/public.css', '\n' + publicContent.join('\n'));
fs.appendFileSync('apps/web/src/workspace.css', '\n' + workspaceContent.join('\n'));
fs.appendFileSync('apps/web/src/design-system.css', '\n' + designContent.join('\n'));

// Remove from main.tsx
let mainTsx = fs.readFileSync('apps/web/src/main.tsx', 'utf-8');
mainTsx = mainTsx.replace("import './sovereign-custom-theme.css';\n", "");
fs.writeFileSync('apps/web/src/main.tsx', mainTsx);

fs.unlinkSync('apps/web/src/sovereign-custom-theme.css');
console.log('CSS merged successfully and custom theme removed.');
