const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');

const importReplacement = `import { MailerService } from '@nestjs-modules/mailer';
import { PaymentProviderService } from '../src/resources/payments/services/payment-provider.service';`;
content = content.replace(/import { MailerService } from '@nestjs-modules\/mailer';/, importReplacement);

const mockPaymentProviderService = `
const mockPaymentProviderService = {
  createStripePaymentIntent: jest.fn().mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret',
    status: 'succeeded',
    currency: 'gbp',
    amount: 1000,
  }),
  createPaypalOrder: jest.fn().mockResolvedValue({
    id: 'ORDER-123',
    status: 'CREATED',
    links: [
      { href: 'https://paypal.com/checkout?token=ORDER-123', rel: 'approve' },
    ],
  }),
  capturePaypalOrder: jest.fn().mockResolvedValue({
    status: 'COMPLETED',
    purchase_units: [
      {
        payments: {
          captures: [
            {
              amount: { value: '10.00', currency_code: 'GBP' },
            },
          ],
        },
      },
    ],
  }),
  verifyStripePaymentIntent: jest.fn().mockResolvedValue({
    ok: true,
    details: { status: 'succeeded' },
  }),
  captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({
    ok: true,
    details: { status: 'COMPLETED' },
  }),
};

describe('Booking Lifecycle (e2e)', () => {
`;
content = content.replace(/describe\('Booking Lifecycle \(e2e\)', \(\) => \{/, mockPaymentProviderService);

const overrideReplacement = `      .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
      .overrideProvider(PaymentProviderService)
      .useValue(mockPaymentProviderService)
      .compile();`;
content = content.replace(/\.overrideProvider\(MailerService\)\n\s*\.useValue\(\{ sendMail: jest\.fn\(\)\.mockResolvedValue\(\{\}\) \}\)\n\s*\.compile\(\);/, overrideReplacement);

fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
