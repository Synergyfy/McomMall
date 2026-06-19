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
            console.log(`File ${file} contains DOCTYPE html, size: ${decoded.length}`);
            // Let's search for "page" near it
            const idx = decoded.indexOf('DOCTYPE html');
            console.log('Context before:');
            console.log(decoded.substring(Math.max(0, idx - 50), idx));
            console.log('Context after (first 100 chars):');
            console.log(decoded.substring(idx, idx + 100));
          }
        }
      } catch (ex) {
        // Ignore
      }
    }
  });
});
