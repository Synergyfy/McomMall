const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');
const regex = /const start = new Date\(Date\.now\(\) \+ ([\d\*]+)\); \/\/ (.*) ahead\n\s*start\.setHours\((\d+), 0, 0, 0\);/g;
content = content.replace(regex, (match, p1, p2, p3) => {
    return `const start = new Date();
    // find next Wednesday to ensure it's a weekday
    while (start.getDay() !== 3) start.setDate(start.getDate() + 1);
    start.setDate(start.getDate() + 14); // Next next Wednesday
    start.setHours(${p3}, 0, 0, 0);`;
});
fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
