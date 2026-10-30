import { CouponService } from './coupon.service';

/**
 * Regression guard for the checkout blocker:
 * `relations: [...]` + `pessimistic_write` makes TypeORM emit `FOR UPDATE` on
 * the nullable side of a LEFT JOIN, which Postgres rejects. The redemption
 * helpers must lock the base row first and load relations afterwards.
 */
describe('CouponService locked redemption reads', () => {
  const service = Object.create(CouponService.prototype) as CouponService;

  it('locks the coupon row without joins, then loads relations', async () => {
    const locked = { id: 'coupon-1', code: 'SAVE10' };
    const loaded = { ...locked, campaign: null, business: null };
    const findOne = jest
      .fn()
      .mockResolvedValueOnce(locked)
      .mockResolvedValueOnce(loaded);
    const repo = { findOne };

    const result = await (service as any).lockAndLoadCoupon(repo, 'SAVE10');

    expect(result).toBe(loaded);
    expect(findOne).toHaveBeenNthCalledWith(1, {
      where: { code: 'SAVE10' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(findOne.mock.calls[0][0]).not.toHaveProperty('relations');
    expect(findOne).toHaveBeenNthCalledWith(2, {
      where: { id: 'coupon-1' },
      relations: ['campaign', 'business', 'business.user'],
    });
  });

  it('returns null when the coupon does not exist', async () => {
    const repo = { findOne: jest.fn().mockResolvedValue(null) };
    await expect(
      (service as any).lockAndLoadCoupon(repo, 'MISSING'),
    ).resolves.toBeNull();
  });
});
