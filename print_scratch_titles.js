const fs = require('fs');
const path = require('path');

const scratchDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\scratch';

fs.readdir(scratchDir, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (file.endsWith('_decoded.txt')) {
      const filePath = path.join(scratchDir, file);
      try {
        const decoded = fs.readFileSync(filePath, 'utf8');
        if (decoded.includes('DOCTYPE html') || decoded.includes('<html')) {
          const idx = decoded.indexOf('DOCTYPE html');
          const titleMatch = decoded.match(/<title>([\s\S]*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : 'NO TITLE';
          console.log(`File: ${file} | Title: "${title}" | Size: ${decoded.length}`);
        }
      } catch (ex) {
        // Ignore
      }
    }
  });
});
