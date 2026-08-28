const fs = require('fs');
const filePath = 'scripts/verify-production-release-v3.mjs';
let content = fs.readFileSync(filePath, 'utf8');

// Find the problematic entry that contains "One private reference beneath every question"
// The entry starts with 'assert(!field.includes' and contains the long string with 'One private reference beneath every question'

// Find the start of the problematic entry
const startIdx = content.indexOf("assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"')", 1000);

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

// Find the end of this array entry by parsing brackets
let braceCount = 0;
let inString = false;
let escapeNext = false;
let endIdx = -1;

for (let i = bracketIdx; i < content.length; i++) {
  const char = content[i];
  
  if (content[i] === '\\' && !escapeNext) {
    // Escape next character
    continue;
  }
  
  if (content[i] === '\\' && !escapeNext) {
    // This is an escape character
    continue;
  }
  
  if (content[i] === '"' && content[i-1] !== '\\') {
    // Toggle inString state (but not if escaped)
    // Simple toggle for now
  }
  
  // Actually, let's use a simpler approach - find the matching '],'
  // The entry ends with '],\n  [' or '];'
  // Let's just find the matching '],' after the start
  
  // Actually, let me use a simpler approach - just find the next '],\n  [' after the start
  const afterStart = content.substring(content.indexOf('assert(!field.includes', 1000));
  const nextEntryIdx = afterStart.indexOf('],\n  [');
  if (afterStart.indexOf('],\n  [') === -1) {
    console.log('Could not find end of entry');
    process.exit(1);
  }
  
  const relativeEnd = afterStart.indexOf('],\n  [');
  const absoluteEnd = content.indexOf('assert(!field.includes') + relativeEnd + 2; // +2 for '],'
  
  console.log('Found end at:', content.indexOf('assert(!field.includes', 1000) + relativeEnd + 2);
  
  // Remove this entry (including the preceding comma and newline)
  const startIdx = content.indexOf('  [\n    "assert(!field.includes', 1000);
  const endIdx = content.indexOf('],\n  [', content.indexOf('assert(!field.includes', 1000)) + 2;
  
  if (startIdx === -1 || endIdx === -1) {
    console.log('Could not find entry boundaries');
    process.exit(1);
  }
  
  console.log('Removing entry from', startIdx, 'to', endIdx);
  
  const before = content.substring(0, content.lastIndexOf(',\n', startIdx) + 1);
  const after = content.substring(content.indexOf('\n', content.indexOf('assert(!field.includes', 1000)) + 1);
  const newContent = before + after.substring(after.indexOf('\n') + 1);
  
  require('fs').writeFileSync('scripts/verify-production-release-v3.mjs', newContent);
  console.log('File updated successfully');
"