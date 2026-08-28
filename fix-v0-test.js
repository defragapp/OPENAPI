const fs = require("fs");
const content = fs.readFileSync("apps/web/src/V0EvidenceContract.test.ts", "utf8");
const newContent = content.replace("not a diagnosis, score, or claim about anyone's internal state", "not a diagnosis, score, or claim about anyone\u2019s internal state");
fs.writeFileSync("apps/web/src/V0EvidenceContract.test.ts", newContent);
console.log("Fixed");