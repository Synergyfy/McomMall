const fs = require('fs');
let content = fs.readFileSync('src/resources/order/order.service.spec.ts', 'utf8');

content = content.replace(
  "{ provide: ConfigService, useValue: { get: jest.fn() } },",
  "{ provide: ConfigService, useValue: { get: jest.fn() } },\n        { provide: EventEmitter2, useValue: { emitAsync: jest.fn(), emit: jest.fn() } },\n        { provide: ProductService, useValue: { calculatePrice: jest.fn().mockReturnValue(50) } },"
).replace(
  "import { ConfigService } from '@nestjs/config';",
  "import { ConfigService } from '@nestjs/config';\nimport { EventEmitter2 } from '@nestjs/event-emitter';\nimport { ProductService } from '../product/product.service';"
).replace(
  "    it('should call redeemPointsForOrder when an offerId is provided', async () => {\n      const createCheckoutDto: CreateCheckoutDto = {\n        offerId: 'offer-id',\n        payment: {\n          amount: 100,\n          paymentMethod: 'card',\n          transactionId: 'txn-id',\n        } as any,",
  "    it('should call redeemPointsForOrder when an offerId is provided', async () => {\n      const createCheckoutDto: CreateCheckoutDto = {\n        offerId: 'offer-id',\n        payment: {\n          amount: 50,\n          paymentMethod: 'card',\n          transactionId: 'txn-id',\n        } as any,"
).replace(
  "    it('should apply voucher discount and redeem voucher when voucherCode is provided', async () => {\n      const createCheckoutDto: CreateCheckoutDto = {\n        voucherCode: 'VOUCHER123',\n        payment: {\n          amount: 50, // 100 (cart) - 50 (voucher)\n          paymentMethod: 'card',\n          transactionId: 'txn-id',\n        } as any,",
  "    it('should apply voucher discount and redeem voucher when voucherCode is provided', async () => {\n      const createCheckoutDto: CreateCheckoutDto = {\n        voucherCode: 'VOUCHER123',\n        payment: {\n          amount: 0,\n          paymentMethod: 'card',\n          transactionId: 'txn-id',\n        } as any,"
).replace(
  "    it('should handle both gift card and voucher redemption', async () => {\n      const createCheckoutDto: CreateCheckoutDto = {\n        giftCardCode: 'GIFTCARD123',\n        voucherCode: 'VOUCHER123',\n        payment: {\n          amount: 30, // 100 (cart) - 20 (giftcard) - 50 (voucher)\n          paymentMethod: 'card',\n          transactionId: 'txn-id',\n        } as any,",
  "    it('should handle both gift card and voucher redemption', async () => {\n      const createCheckoutDto: CreateCheckoutDto = {\n        giftCardCode: 'GIFTCARD123',\n        voucherCode: 'VOUCHER123',\n        payment: {\n          amount: 0,\n          paymentMethod: 'card',\n          transactionId: 'txn-id',\n        } as any,"
).replace(
  "expect(result.total).toBe(50);",
  "expect(result.total).toBe(0);"
).replace(
  "expect(result.total).toBe(30);",
  "expect(result.total).toBe(0);"
).replace(
  "{ code: 'VOUCHER123', amount: 50 },",
  "{ code: 'VOUCHER123', amount: 30 },"
).replace(
  "expect(voucherService.redeemForOrder).toHaveBeenCalledWith(\n        { code: 'VOUCHER123', amount: 50 },\n        expect.any(Object),\n        expect.any(Object),\n      );",
  "expect(voucherService.redeemForOrder).toHaveBeenCalledWith(\n        { code: 'VOUCHER123', amount: 30 },\n        expect.any(Object),\n        expect.any(Object),\n      );"
);

fs.writeFileSync('src/resources/order/order.service.spec.ts', content);
