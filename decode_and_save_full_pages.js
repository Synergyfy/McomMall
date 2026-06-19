const fs = require('fs');
const path = require('path');

const messagesDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\.system_generated\\messages';
const outputDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\scratch';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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
            const cleanName = file.replace('.json', '');
            const titleMatch = decoded.match(/<title>([\s\S]*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : 'no_title';
            const pageMatch = decoded.match(/(?:page|screen)\s+(\d+)/i);
            const pageNum = pageMatch ? pageMatch[1] : 'unknown';
            
            // Extract the HTML content (from <!DOCTYPE html> to </html>)
            const htmlStart = decoded.indexOf('<!DOCTYPE html>');
            const htmlEnd = decoded.lastIndexOf('</html>') + 7;
            if (htmlStart !== -1 && htmlEnd > htmlStart) {
              const htmlContent = decoded.substring(htmlStart, htmlEnd);
              const outPath = path.join(outputDir, `extracted_page_${pageNum}_${cleanName}.html`);
              fs.writeFileSync(outPath, htmlContent);
              console.log(`Saved ${file} -> page_${pageNum} (${title}) to ${outPath}`);
            }
          }
        }
      } catch (ex) {
        // Ignore
      }
    }
  });
});
