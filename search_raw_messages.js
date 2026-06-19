const fs = require('fs');
const path = require('path');

const messagesDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\7aba00b1-d9aa-4636-8ff7-bc34903bfe0c\\.system_generated\\messages';

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
          const titles = [
            'Team Access Dashboard',
            'Integrations Dashboard',
            'Account Settings Overview',
            'Billing Dashboard',
            'Team Member List',
            'Notification Settings',
            'Change Password',
            'Update Payment Method',
            'Invoice List'
          ];
          titles.forEach(title => {
            if (decoded.includes(title)) {
              console.log(`Match for "${title}" in file: ${file} (length: ${decoded.length})`);
            }
          });
        }
      } catch (ex) {
        // Ignore
      }
    }
  });
});
