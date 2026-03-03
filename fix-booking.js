const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');

content = content.replace(/const start = new Date\(Date.now\(\) \+ 14 \* 24 \* 60 \* 60 \* 1000\); \/\/ 14 days ahead\n\s*start.setHours\(9, 0, 0, 0\);/g,
`const start = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days ahead
    start.setHours(9, 0, 0, 0);`);

fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
