const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');

// We have two 'const start = new Date(Date.now() + ...)'
// Let's replace the SECOND occurrence to use + 21 days instead of 14, or replace the first.

let occurrences = 0;
content = content.replace(/const start = new Date\(Date\.now\(\) \+ ([\d\* ]+)\);/g, (match, p1) => {
    occurrences++;
    if (occurrences === 1) {
       return `const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);`;
    } else {
       return `const start = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);`;
    }
});

fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
