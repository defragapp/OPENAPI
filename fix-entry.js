const fs = require('fs');

const filePath = 'scripts/verify-production-release-v3.mjs';
let content = fs.readFileSync(filePath, 'utf8');

// Find the entry that contains "One private reference beneath every question."
// The entry starts with "assert(!field.includes" and contains the long string

// Find the start of the problematic entry
const startMarker = 'assert(!field.includes(\'<div className="landing-expression-slice__tooltip"\'';
const startIdx = content.indexOf(startMarker, 1000);

if (startIdx === -1) {
  console.log('Start marker not found');
  process.exit(1);
}

console.log('Found assert at:', startIdx);

// Find the start of this array entry (the '[' that begins this entry)
let bracketIdx = content.lastIndexOf('[', startIdx);
if (bracketIdx === -1) {
  console.log('Could not find start of array entry');
  process.exit(1);
}

console.log('Found start of entry at:', bracketIdx);

// Find the end of this array entry by finding the matching '],'
let braceCount = 0;
let inString = false;
let escapeNext = false;
let endIdx = -1;

for (let i = bracketIdx; i < content.length; i++) {
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
        endIdx = i + 1;
        
        // Check if next non-whitespace is a comma
        let nextIdx = endIdx;
        while (nextIdx < content.length && content[nextIdx] === ' ') nextIdx++;
        if (content[nextIdx] === ',') {
          // Include the comma in the removal
          const beforeEntry = content.substring(0, content.lastIndexOf(',\n', bracketIdx) + 1);
          const afterEntry = content.substring(content.indexOf('\n', endIdx) + 1);
          const newContent = beforeEntry + afterEntry;
          
          fs.writeFileSync('scripts/verify-production-release-v3.mjs', newContent);
          console.log('File updated successfully');
          process.exit(0);
        }
      }
    }
  }
}

console.log('Could not find end of entry');
process.exit(1);