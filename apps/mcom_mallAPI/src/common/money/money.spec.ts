import {
  moneyArrayTransformer,
  moneyJsonTransformer,
  moneyTransformer,
  penceAggregateToPounds,
  penceToPounds,
  poundsToPence,
} from './money';

describe('money (pence) helpers', () => {
  it('converts pounds to integer pence without floating point drift', () => {
    expect(poundsToPence(19.99)).toBe(1999);
    expect(poundsToPence('0.1')).toBe(10);
    expect(poundsToPence(0.005)).toBe(1);
    expect(poundsToPence(1.005)).toBe(101);
    expect(poundsToPence(null)).toBeNull();
    expect(poundsToPence('not-a-number')).toBeNull();
  });

  it('converts stored pence strings back to pounds', () => {
    expect(penceToPounds('1999')).toBe(19.99);
    expect(penceToPounds(1234)).toBe(12.34);
    expect(penceToPounds(null)).toBeNull();
  });

  it('exposes a column transformer that round-trips', () => {
    expect(moneyTransformer.to!(12.34)).toBe(1234);
    expect(moneyTransformer.from!('1234')).toBe(12.34);
    expect(moneyTransformer.to!(null)).toBeNull();
    expect(moneyTransformer.from!(null)).toBeNull();
    // Unset values must stay undefined so TypeORM can use column defaults.
    expect(moneyTransformer.to!(undefined)).toBeUndefined();
  });

  it('round-trips money arrays', () => {
    expect(moneyArrayTransformer.to!([5, 10.25])).toEqual([500, 1025]);
    expect(moneyArrayTransformer.from!(['500', '1025'])).toEqual([5, 10.25]);
  });

  it('round-trips money keys inside jsonb payloads', () => {
    const payload = [
      { name: 'Red', priceModifier: 3, stock: 5 },
      { nested: { price: 12.5, salePrice: '10.25' } },
      { duration: 60, travelFee: 4 },
    ];
    const stored = moneyJsonTransformer.to!(payload);
    expect(stored).toEqual([
      { name: 'Red', priceModifier: 300, stock: 5 },
      { nested: { price: 1250, salePrice: 1025 } },
      { duration: 60, travelFee: 400 },
    ]);
    expect(moneyJsonTransformer.from!(stored)).toEqual([
      { name: 'Red', priceModifier: 3, stock: 5 },
      { nested: { price: 12.5, salePrice: 10.25 } },
      { duration: 60, travelFee: 4 },
    ]);
  });

  it('converts pence aggregates back to pounds', () => {
    expect(penceAggregateToPounds('1234')).toBe(12.34);
    expect(penceAggregateToPounds(null)).toBe(0);
  });
});
