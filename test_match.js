const fs = require('fs');
const path = require('path');

const scratchDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\scratch';

fs.readdir(scratchDir, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (file.endsWith('_decoded.txt')) {
      const filePath = path.join(scratchDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (let i = 1; i <= 10; i++) {
        if (content.toLowerCase().includes(`page ${i}`)) {
          console.log(`File ${file} contains "page ${i}"`);
          // Let's print the location where "page i" is found and 200 chars after it
          const index = content.toLowerCase().indexOf(`page ${i}`);
          console.log(content.substring(index, index + 300));
        }
      }
    }
  });
});
