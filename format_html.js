const fs = require('fs');
const path = require('path');

const files = [
  'mcommall___local_borough_detected.html',
  'mcommall___select_your_borough.html',
  'add_your_storefront___mcommall.html',
  'template_6.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Basic formatting: insert newlines around HTML tags
  html = html
    .replace(/>\s*</g, '>\n<')
    .replace(/(<\/[a-zA-Z0-9]+>)/g, '$1\n')
    .replace(/(<[a-zA-Z0-9]+[^>]*>)/g, '\n$1')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
    
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Formatted ${file}`);
});
