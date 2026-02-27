const fs = require('fs');
const content = fs.readFileSync('src/resources/grouping/grouping.service.spec.ts', 'utf8');
const newContent = "import { CentralIntegrationService } from '../payments/services/central-integration.service';\nimport { DigitalValueService } from '../digital-value/digital-value.service';\nimport { CapabilityService } from '../capability/capability.service';\n" + content.replace(
  "const baseMockUser: User = {",
  "const baseMockUser = { fullName: 'Test User',"
).replace(
  /coupons: \[\],\s*purchasedCoupons: \[\],\s*savedCoupons: \[\],\s*couponProducts: \[\],\s*couponTransactions: \[\],/g,
  ""
).replace(
  "        {\n          provide: PaymentProviderService,\n          useValue: mockPaymentProviderService,\n        },",
  "        {\n          provide: PaymentProviderService,\n          useValue: mockPaymentProviderService,\n        },\n        { provide: CentralIntegrationService, useValue: { processCashback: jest.fn(), validateDigitalValue: jest.fn() } },\n        { provide: DigitalValueService, useValue: { createVoucher: jest.fn() } },\n        { provide: CapabilityService, useValue: { checkPermission: jest.fn() } },"
);
fs.writeFileSync('src/resources/grouping/grouping.service.spec.ts', newContent);
