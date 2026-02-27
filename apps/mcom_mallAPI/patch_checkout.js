const fs = require('fs');
let content = fs.readFileSync('src/resources/checkout/checkout.service.spec.ts', 'utf8');

content = content.replace(
  "import { PaymentProviderService } from '../payments/services/payment-provider.service';",
  "import { PaymentProviderService } from '../payments/services/payment-provider.service';\nimport { ProductService } from '../product/product.service';\nimport { CouponService } from '../coupon/coupon.service';"
).replace(
  "        { provide: DataSource, useValue: mockDataSource },\n      ],\n    }).compile();",
  "        { provide: DataSource, useValue: mockDataSource },\n        { provide: ProductService, useValue: { calculatePromotionalPrice: jest.fn().mockReturnValue(10), calculatePrice: jest.fn().mockReturnValue(10) } },\n        { provide: CouponService, useValue: { validateCoupon: jest.fn() } },\n      ],\n    }).compile();"
).replace(
  "        { provide: getRepositoryToken(User), useFactory: mockRepository },",
  "        { provide: getRepositoryToken(User), useValue: {\n            findOne: jest.fn().mockResolvedValue({ id: 'user-1' }),\n            create: jest.fn(),\n            save: jest.fn(),\n          } },"
).replace(
  "expect(giftCardService.redeem).toHaveBeenCalledWith(\n        { code: 'GC123', amount: 20 },\n        expect.any(Object),\n        'business-1',\n      );",
  "expect(giftCardService.redeem).toHaveBeenCalledWith(\n        { code: 'GC123', amount: 20 },\n        expect.any(Object),\n        'business-1',\n        expect.any(Object)\n      );"
);

fs.writeFileSync('src/resources/checkout/checkout.service.spec.ts', content);
