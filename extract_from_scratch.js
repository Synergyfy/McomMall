const fs = require('fs');
const path = require('path');

const scratchDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\scratch';

fs.readdir(scratchDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('_decoded.txt')) {
      const filePath = path.join(scratchDir, file);
      try {
        const decoded = fs.readFileSync(filePath, 'utf8');
        
        // Search for pattern: page X followed by <!DOCTYPE html>
        // Use a regex that searches for "page X" and then captures until the end of HTML or USER_REQUEST tag
        const regex = /page\s+(\d+)\s*(<!DOCTYPE html>[\s\S]+?)(?:<\/USER_REQUEST>|<\/html>|$)/gi;
        
        let match;
        while ((match = regex.exec(decoded)) !== null) {
          const pageNum = match[1];
          let html = match[2];
          
          if (!html.includes('</html>')) {
            html += '\n</html>';
          }
          
          const outPath = path.join(scratchDir, `page_${pageNum}_full.html`);
          // Check if page_X_full.html already exists and is larger, if so don't overwrite with a partial
          if (fs.existsSync(outPath)) {
            const existingStat = fs.statSync(outPath);
            if (existingStat.size > html.trim().length) {
              continue;
            }
          }
          
          fs.writeFileSync(outPath, html.trim());
          console.log(`Successfully extracted page ${pageNum} from ${file} to ${outPath} (size: ${html.length})`);
        }
      } catch (ex) {
        console.error(`Error processing file ${file}:`, ex.message);
      }
    }
  });
});
