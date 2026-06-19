const fs = require('fs');
const path = require('path');

const messagesDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\.system_generated\\messages';

fs.readdir(messagesDir, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(messagesDir, file);
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        if (json.stepPayload) {
          const buffer = Buffer.from(json.stepPayload, 'base64');
          const decoded = buffer.toString('utf8');
          if (decoded.includes('DOCTYPE html')) {
            const idx = decoded.indexOf('DOCTYPE html');
            const prefix = decoded.substring(Math.max(0, idx - 40), idx).replace(/\r?\n/g, ' ').trim();
            const titleMatch = decoded.match(/<title>([\s\S]*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : 'NO TITLE';
            console.log(`File: ${file} | Prefix: "${prefix}" | Title: "${title}" | Size: ${decoded.length}`);
          }
        }
      } catch (ex) {
        // Ignore
      }
    }
  });
});
