const fs = require('fs');
const content = fs.readFileSync('src/resources/gift-card/gift-card.service.spec.ts', 'utf8');

const newContent = "import { DigitalValueService } from '../digital-value/digital-value.service';\n" + content.replace(
  "        { provide: getRepositoryToken(GiftCard), useFactory: mockRepository },",
  "        { provide: getRepositoryToken(GiftCard), useFactory: mockRepository },\n        {\n          provide: DigitalValueService,\n          useValue: {\n            create: jest.fn().mockResolvedValue({ id: 'dv-id' }),\n            fund: jest.fn(),\n            redeem: jest.fn(),\n            getByCode: jest.fn().mockResolvedValue({ id: 'dv-id' }),\n          },\n        },"
);

fs.writeFileSync('src/resources/gift-card/gift-card.service.spec.ts', newContent);
