const fs = require('fs');
const content = fs.readFileSync('src/resources/voucher/test/voucher.service.reload.spec.ts', 'utf8');

const newContent = content.replace(
  "import { DigitalValueService } from '../../digital-value/digital-value.service';",
  "import { DigitalValueService } from '../../digital-value/digital-value.service';\nimport { CentralIntegrationService } from '../../../resources/payments/services/central-integration.service';"
).replace(
  "          provide: DataSource,",
  "          provide: CentralIntegrationService,\n          useValue: { processCashback: jest.fn() },\n        },\n        {\n          provide: DataSource,"
).replace(
  ".mockImplementation((callback) => callback({})),",
  ".mockImplementation((callback) => callback({ findOne: jest.fn().mockResolvedValue({ id: 'user-1' }), save: jest.fn(), create: jest.fn() })),"
).replace(
  "        getRepository: jest.fn().mockReturnValue({",
  "        findOne: jest.fn().mockResolvedValue({ id: 'user-id' }),\n        getRepository: jest.fn().mockReturnValue({"
);

fs.writeFileSync('src/resources/voucher/test/voucher.service.reload.spec.ts', newContent);
