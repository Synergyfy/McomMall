const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');

let counter = 0;
// find occurrences of start = new Date(Date.now()...)
content = content.replace(/const start = new Date\(\);[^;]*;[^;]*;[^;]*;[^;]*;/g, () => {
    counter++;
    if (counter === 1) {
       return `const start = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
       while(start.getDay() !== 3) start.setDate(start.getDate() + 1);
       start.setHours(9, 0, 0, 0);`;
    } else {
       return `const start = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
       while(start.getDay() !== 4) start.setDate(start.getDate() + 1);
       start.setHours(10, 0, 0, 0);`;
    }
});

fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
