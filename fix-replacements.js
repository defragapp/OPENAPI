const fs = require('fs');
const filePath = 'scripts/verify-production-release-v3.mjs';
let content = fs.readFileSync('scripts/verify-production-release-v3.mjs', 'utf8');

// Find the problematic entry that contains "One private reference beneath every question."
// The entry starts with 'assert(!field.includes' and contains the long string with 'One private reference beneath every question'

// Find the start of the problematic entry
const startMarker = 'assert(!field.includes';
const startIdx = content.indexOf('assert(!field.includes', 1000); // Skip first few entries

if (startIdx === -1) {
  console.log('Start marker not found');
  process.exit(1);
}

console.log('Found assert at:', startIdx);

// Find the end of this entry by parsing brackets
let idx = content.indexOf('[', content.lastIndexOf('[', content.indexOf('assert(!field.includes'))));
if (idx === -1) {
  console.log('Could not find start of array');
  process.exit(1);
}

let braceCount = 0;
let inString = false;
let escapeNext = false;
let endIdx = -1;

for (let i = idx; i < content.length; i++) {
  const char = content[i];
  
  if (escapeNext) {
    escapeNext = false;
    continue;
  }
  
  if (char === '\\') {
    escapeNext = true;
    continue;
  }
  
  if (char === '"' && !inString) {
    inString = true;
  } else if (char === '"' && inString) {
    inString = false;
  }
  
  if (!inString) {
    if (char === '[') braceCount++;
    if (char === ']') {
      braceCount--;
      if (braceCount === 0) {
        // Found the end of this array entry
        const endIdx = i + 1;
        // Check if next non-whitespace is a comma
        let nextIdx = i + 1;
        while (nextIdx < content.length && content[nextIdx] === ' ') nextIdx++;
        if (content[nextIdx] === ',') {
          // Include the comma in the removal
          const before = content.substring(0, content.lastIndexOf(',\n', idx) + 1);
          const after = content.substring(content.indexOf('\n', i) + 1);
          const newContent = content.substring(0, content.lastIndexOf(',\n', idx) + 1) + content.substring(content.indexOf('\n', i) + 1);
          
          // Actually, let's be more careful
          const beforeEntry = content.substring(0, content.lastIndexOf(',\n', idx) + 1);
          const afterEntry = content.substring(content.indexOf('\n', i) + 1);
          const newContent = beforeEntry + afterEntry;
          
          require('fs').writeFileSync('scripts/verify-production-release-v3.mjs', newContent);
          console.log('File updated successfully');
          process.exit(0);
        }
      }
    }
  }

console.log('Could not find end of entry');
process.exit(1);
"