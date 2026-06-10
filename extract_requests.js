const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d553cfb1-8455-45b3-b3c1-538841ceffd2\\.system_generated\\logs\\transcript.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  let userReqCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.source === 'USER_EXPLICIT' && obj.type === 'USER_INPUT') {
        userReqCount++;
        const userContent = obj.content || '';
        console.log(`Request #${userReqCount} (line ${i+1}):`);
        // Check if there is an HTML template inside
        if (userContent.includes('<!DOCTYPE html>')) {
          const htmlStart = userContent.indexOf('<!DOCTYPE html>');
          const htmlEnd = userContent.lastIndexOf('</html>');
          if (htmlStart !== -1 && htmlEnd !== -1) {
            const html = userContent.substring(htmlStart, htmlEnd + 7);
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : `template_${userReqCount}`;
            const fileName = title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.html';
            const outPath = path.join(__dirname, fileName);
            fs.writeFileSync(outPath, html, 'utf8');
            console.log(`  -> Extracted HTML template into: ${fileName}`);
          } else {
            console.log('  -> Found <!DOCTYPE html> but no closing </html>');
          }
        } else {
          console.log(`  -> Non-HTML request preview: "${userContent.substring(0, 100).replace(/\n/g, ' ')}..."`);
        }
      }
    } catch (e) {
      // Ignore invalid JSON lines
    }
  }
} catch (err) {
  console.error('Error reading log file:', err);
}
