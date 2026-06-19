const fs = require('fs');
const path = require('path');

const messagesDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\.system_generated\\messages';
const outputDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\scratch';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(messagesDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(messagesDir, file);
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        if (json.stepPayload) {
          const buffer = Buffer.from(json.stepPayload, 'base64');
          const decoded = buffer.toString('utf8');
          
          // Match any occurrence of "page X" followed by "<html" or "<!DOCTYPE"
          // We can use regex to find "page [1-10]" and extract from there
          const pageRegex = /page\s+(\d+)\s*(<!DOCTYPE[\s\S]+?)(?:<\/USER_REQUEST>|<\/html>|$)/gi;
          let match;
          while ((match = pageRegex.exec(decoded)) !== null) {
            const pageNum = match[1];
            let html = match[2].trim();
            if (!html.includes('</html>') && html.includes('<html')) {
              html += '\n</html>';
            }
            const outPath = path.join(outputDir, `page_${pageNum}_full.html`);
            
            // If the file exists, only overwrite if the new one is larger
            if (fs.existsSync(outPath)) {
              const existingSize = fs.statSync(outPath).size;
              if (html.length <= existingSize) {
                continue;
              }
            }
            
            fs.writeFileSync(outPath, html);
            console.log(`Extracted full page ${pageNum} from ${file} to ${outPath} (size: ${html.length} bytes)`);
          }
        }
      } catch (ex) {
        // Ignore JSON or processing errors
      }
    }
  });
});
