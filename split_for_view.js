const fs = require('fs');
const path = require('path');

const files = [
  'clean_add_your_storefront___mcommall.html',
  'clean_mcommall___local_borough_detected.html',
  'clean_template_6.html',
  'clean_mcommall___select_your_borough.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove all existing newlines first to get one long string
  const flat = content.replace(/\r?\n/g, ' ');
  
  // Split into chunks of exactly 80 characters
  const chunks = [];
  for (let i = 0; i < flat.length; i += 80) {
    chunks.push(flat.substring(i, i + 80));
  }
  
  const outName = 'view_' + file;
  fs.writeFileSync(path.join(__dirname, outName), chunks.join('\n'), 'utf8');
  console.log(`Created ${outName} with size ${fs.statSync(outName).size}`);
});
