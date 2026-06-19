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
          
          // Look for "page X" in the decoded payload
          const match = decoded.match(/page\s+(\d+)\s*([\s\S]+)/i);
          if (match) {
            const pageNum = match[1];
            // Split by next USER_REQUEST tag or next metadata tag, or just keep the html
            let html = match[2];
            
            // Clean up the html by cutting off metadata or user request closing tags
            const cutoffIndices = [
              html.indexOf('</USER_REQUEST>'),
              html.indexOf('<ADDITIONAL_METADATA>')
            ].filter(idx => idx !== -1);
            
            if (cutoffIndices.length > 0) {
              const minCutoff = Math.min(...cutoffIndices);
              html = html.substring(0, minCutoff);
            }
            
            const outPath = path.join(outputDir, `page_${pageNum}_full.html`);
            fs.writeFileSync(outPath, html.trim());
            console.log(`Successfully extracted FULL page ${pageNum} to ${outPath}`);
          }
        }
      } catch (ex) {
        console.error(`Error processing file ${file}:`, ex.message);
      }
    }
  });
});
