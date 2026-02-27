const fs = require('fs');
const content = fs.readFileSync('src/resources/voucher/test/voucher-purchase.spec.ts', 'utf8');

const newContent = content.replace(
  "    const manager = {\n      getRepository: (entity) => {",
  "    const manager = {\n      findOne: jest.fn().mockResolvedValue({ id: 'user-id' }),\n      getRepository: (entity) => {"
);

fs.writeFileSync('src/resources/voucher/test/voucher-purchase.spec.ts', newContent);
