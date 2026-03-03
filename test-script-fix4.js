const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');

// Replace the Date.now() logic with static dates that don't overlap and are guaranteed to be "open" according to the mock business hours (M-F)
// Let's use 2030-05-02 (Thursday) and 2030-05-03 (Friday).
content = content.replace(/const startTime = new Date\(\);\n\s*startTime.setFullYear\(2030\);\s*\/\/ Future\n\s*const endTime = new Date\(startTime.getTime\(\) \+ 2 \* 60 \* 60 \* 1000\); \/\/ 2 hours/g,
`const startTime = new Date(2030, 4, 2, 10, 0); // May 2, 2030, 10:00 AM (Thursday)
const endTime = new Date(2030, 4, 2, 12, 0); // 12:00 PM`);

content = content.replace(/const start = new Date\(2030, 5, 1, 10, 0\); \/\/ 10:00/g, `const start = new Date(2030, 4, 3, 10, 0); // May 3, 2030, 10:00 AM (Friday)`);
content = content.replace(/const end = new Date\(2030, 5, 1, 14, 0\); \/\/ 14:00 \(4 hours\)/g, `const end = new Date(2030, 4, 3, 14, 0); // 14:00 (4 hours)`);

fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
