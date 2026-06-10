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
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract body content
  const bodyStart = content.indexOf('<body');
  const bodyEnd = content.lastIndexOf('</body>');
  if (bodyStart !== -1 && bodyEnd !== -1) {
    const bodyWithTag = content.substring(bodyStart, bodyEnd + 7);
    // Remove the body tag itself
    const innerStart = bodyWithTag.indexOf('>') + 1;
    const innerEnd = bodyWithTag.lastIndexOf('</body>');
    const innerBody = bodyWithTag.substring(innerStart, innerEnd).trim();
    
    const outName = file.replace('.html', '_body.txt');
    fs.writeFileSync(path.join(__dirname, outName), innerBody, 'utf8');
    console.log(`Extracted inner body for ${file} into ${outName}`);
  } else {
    console.log(`Could not find body tags in ${file}`);
  }
});
