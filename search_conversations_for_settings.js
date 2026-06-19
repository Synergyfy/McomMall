const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain';
const outputDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\scratch';

const conversations = fs.readdirSync(brainDir).filter(f => {
  return fs.statSync(path.join(brainDir, f)).isDirectory() && f !== 'lost+found';
});

console.log('Conversations found:', conversations);

conversations.forEach(convId => {
  const transcriptPath = path.join(brainDir, convId, '.system_generated', 'logs', 'transcript.jsonl');
  if (fs.existsSync(transcriptPath)) {
    console.log(`Scanning transcript for ${convId}...`);
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      try {
        const json = JSON.parse(line);
        if (json.content && json.content.includes('DOCTYPE html')) {
          // Check if it's user input or assistant output
          const match = json.content.match(/(page|screen)\s+(\d+)/i);
          const pageNum = match ? match[2] : 'unknown';
          const titleMatch = json.content.match(/<title>([\s\S]*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : 'no_title';
          
          if (json.content.includes('Settings') || json.content.includes('Password') || json.content.includes('Invoice') || json.content.includes('Team') || json.content.includes('Integration')) {
            console.log(`  Found HTML in ${convId} at step ${json.step_index || index}: Page ${pageNum} (${title}) - size: ${json.content.length}`);
            
            const htmlStart = json.content.indexOf('<!DOCTYPE html>');
            const htmlEnd = json.content.lastIndexOf('</html>') + 7;
            if (htmlStart !== -1 && htmlEnd > htmlStart) {
              const htmlContent = json.content.substring(htmlStart, htmlEnd);
              const filename = `conv_${convId}_page_${pageNum}_${title.replace(/[^a-z0-9]/gi, '_')}.html`;
              fs.writeFileSync(path.join(outputDir, filename), htmlContent);
              console.log(`    Saved to ${filename}`);
            }
          }
        }
      } catch (ex) {
        // Ignore
      }
    });
  }
});
