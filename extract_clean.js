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
        
        if (userContent.includes('<!DOCTYPE html>')) {
          const htmlStart = userContent.indexOf('<!DOCTYPE html>');
          const htmlEnd = userContent.lastIndexOf('</html>');
          if (htmlStart !== -1 && htmlEnd !== -1) {
            let html = userContent.substring(htmlStart, htmlEnd + 7);
            
            // Clean up backslashes/escaped characters if any
            html = html.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\t/g, '\t');
            
            // Formatter that only inserts newlines outside tags
            let formatted = '';
            let inTag = false;
            for (let char of html) {
              if (char === '<') {
                formatted += '\n<';
                inTag = true;
              } else if (char === '>') {
                formatted += '>\n';
                inTag = false;
              } else {
                formatted += char;
              }
            }
            
            // Clean up duplicate newlines
            formatted = formatted
              .split('\n')
              .map(l => l.trim())
              .filter(l => l.length > 0)
              .join('\n');
              
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : `template_${userReqCount}`;
            const fileName = 'clean_' + title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.html';
            fs.writeFileSync(path.join(__dirname, fileName), formatted, 'utf8');
            console.log(`Extracted clean HTML: ${fileName}`);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }
} catch (err) {
  console.error('Error reading log file:', err);
}
