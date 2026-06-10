const fs = require('fs');
const path = require('path');

const files = [
  'mcommall___local_borough_detected.html',
  'mcommall___select_your_borough.html',
  'add_your_storefront___mcommall.html',
  'template_6.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split lines and wrap anything longer than 100 chars
  const lines = content.split('\n');
  const newLines = [];
  for (let line of lines) {
    while (line.length > 100) {
      // Find a space to split if possible, otherwise hard split
      let splitIdx = line.lastIndexOf(' ', 100);
      if (splitIdx <= 20) {
        splitIdx = 100;
      }
      newLines.push(line.substring(0, splitIdx));
      line = line.substring(splitIdx);
    }
    newLines.push(line);
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Wrapped ${file}`);
});
