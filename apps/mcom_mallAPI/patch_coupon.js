const fs = require('fs');
const content = fs.readFileSync('src/resources/coupon/coupon.service.spec.ts', 'utf8');
const newContent = content.replace(
  "import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';",
  "import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';\nimport { SavedCoupon } from './entities/saved-coupon.entity';"
).replace(
  "CouponService,",
  "CouponService,\n        {\n          provide: getRepositoryToken(SavedCoupon),\n          useValue: {\n            findOne: jest.fn(),\n            find: jest.fn(),\n            create: jest.fn(),\n            save: jest.fn(),\n            remove: jest.fn(),\n          },\n        },"
);
fs.writeFileSync('src/resources/coupon/coupon.service.spec.ts', newContent);
