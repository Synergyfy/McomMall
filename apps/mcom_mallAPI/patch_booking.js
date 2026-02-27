const fs = require('fs');
let content = fs.readFileSync('src/resources/booking/booking.service.spec.ts', 'utf8');

content = content.replace(
  "import { PaymentProviderService } from '../payments/services/payment-provider.service';",
  "import { PaymentProviderService } from '../payments/services/payment-provider.service';\nimport { CentralIntegrationService } from '../payments/services/central-integration.service';"
).replace(
  "        {\n          provide: PaymentProviderService,\n          useValue: mockPaymentProviderService,\n        },",
  "        {\n          provide: PaymentProviderService,\n          useValue: mockPaymentProviderService,\n        },\n        {\n          provide: CentralIntegrationService,\n          useValue: { processCashback: jest.fn() },\n        },"
).replace(
  "      const booking = {\n        id: '1',\n        service: { business: { user: { id: '2' } } },\n      } as ServiceBooking;",
  "      const booking = {\n        id: '1',\n        user: { email: 'test@test.com' },\n        service: { business: { user: { id: '2' } } },\n      } as any;"
);

fs.writeFileSync('src/resources/booking/booking.service.spec.ts', content);
