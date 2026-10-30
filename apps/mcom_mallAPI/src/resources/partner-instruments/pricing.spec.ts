import {
  computeCouponDiscount,
  computeInstrumentApplication,
} from './pricing';

describe('computeCouponDiscount', () => {
  it('caps a fixed discount at the eligible subtotal', () => {
    expect(
      computeCouponDiscount({
        discountType: 'fixed',
        discountValue: 30,
        base: 20,
      }),
    ).toBe(20);
  });

  it('applies a fixed discount normally', () => {
    expect(
      computeCouponDiscount({
        discountType: 'fixed',
        discountValue: 10,
        base: 20,
      }),
    ).toBe(10);
  });

  it('applies a percentage discount on the eligible subtotal', () => {
    expect(
      computeCouponDiscount({
        discountType: 'percentage',
        discountValue: 20,
        base: 50,
      }),
    ).toBe(10);
  });

  it('caps a percentage discount with maxDiscount', () => {
    expect(
      computeCouponDiscount({
        discountType: 'percentage',
        discountValue: 50,
        base: 100,
        maxDiscount: 30,
      }),
    ).toBe(30);
  });

  it('rounds to 2dp and never goes negative', () => {
    expect(
      computeCouponDiscount({
        discountType: 'percentage',
        discountValue: 33.333,
        base: 10,
      }),
    ).toBe(3.33);
    expect(
      computeCouponDiscount({
        discountType: 'fixed',
        discountValue: 10,
        base: -5,
      }),
    ).toBe(0);
  });
});

describe('computeInstrumentApplication', () => {
  it('applies the full balance when everything is eligible', () => {
    expect(
      computeInstrumentApplication({
        balance: 30,
        eligiblePayable: 50,
        remainingPayable: 50,
      }),
    ).toBe(30);
  });

  it('caps at the eligible payable (scope)', () => {
    expect(
      computeInstrumentApplication({
        balance: 30,
        eligiblePayable: 12.5,
        remainingPayable: 50,
      }),
    ).toBe(12.5);
  });

  it('caps at the requested amount', () => {
    expect(
      computeInstrumentApplication({
        requested: 5,
        balance: 30,
        eligiblePayable: 50,
        remainingPayable: 50,
      }),
    ).toBe(5);
  });

  it('never exceeds the remaining payable', () => {
    expect(
      computeInstrumentApplication({
        balance: 30,
        eligiblePayable: 50,
        remainingPayable: 7.25,
      }),
    ).toBe(7.25);
  });

  it('never returns a negative amount', () => {
    expect(
      computeInstrumentApplication({
        requested: 5,
        balance: 30,
        eligiblePayable: 50,
        remainingPayable: -1,
      }),
    ).toBe(0);
  });
});
