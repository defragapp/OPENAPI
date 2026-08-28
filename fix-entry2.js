const fs = require('fs');

const content = fs.readFileSync('scripts/verify-production-release-v3.mjs', 'utf8');

// Find the entry with "One private reference beneath every question."
const search = 'One private reference beneath every question';
const idx = content.indexOf(search);

if (idx === -1) {
  console.log('Not found');
  process.exit(1);
}

console.log('Found at:', idx);

// Find the start of this entry (the '[' that begins this replacement pair)
let bracketIdx = content.lastIndexOf('[', content.lastIndexOf('[', content.lastIndexOf('[', content.indexOf('One private reference beneath every question')) - 1));
console.log('Entry starts at:', bracketIdx);

// Find the end of this entry
const afterIdx = content.indexOf('],\n  [', content.indexOf('One private reference beneath every question'));
console.log('Entry ends at:', afterIdx + 2);

// Find the preceding comma and newline
const beforeIdx = content.lastIndexOf(',\n', bracketIdx);
console.log('Before entry at:', beforeIdx);

// Find the end of the entry (after the closing '],')
const endIdx = content.indexOf('],', content.indexOf('One private reference beneath every question')) + 2;
const afterIdx = content.indexOf('\n', endIdx) + 1;

console.log('Entry from', bracketIdx, 'to', afterIdx);

// Remove the entry
const before = content.substring(0, content.lastIndexOf(',\n', content.lastIndexOf('[', content.indexOf('One private reference beneath every question')) - 1) + 1);
const after = content.substring(content.indexOf('\n', content.indexOf('],', content.indexOf('One private reference beneath every question')) + 2) + 1);

const newContent = content.substring(0, content.lastIndexOf(',\n', content.lastIndexOf('[', content.indexOf('One private reference beneath every question')) - 1) + 1) + content.substring(content.indexOf('\n', content.indexOf('],', content.indexOf('One private reference beneath every question')) + 2) + 1);

console.log('New content length:', newContent.length);

fs.writeFileSync('scripts/verify-production-release-v3.mjs', newContent);
console.log('File updated');