const fs = require('fs');
const files = ['apps/web/src/V0EvidenceContract.test.ts', 'apps/web/src/product-stage.test.ts'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let inBacktick = false;
  let result = '';
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '`') {
      inBacktick = !inBacktick;
      result += content[i];
    } else if (inBacktick && content[i] === '$' && content[i+1] === '{') {
      result += '\\$\\{';
      i++; // skip the {
    } else {
      result += content[i];
    }
  }
  fs.writeFileSync(file, result);
  console.log('Fixed:', file);
});