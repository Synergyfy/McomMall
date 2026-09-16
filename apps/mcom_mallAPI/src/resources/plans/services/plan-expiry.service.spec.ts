import { PlanExpiryService } from './plan-expiry.service';

describe('PlanExpiryService', () => {
  const service = new PlanExpiryService();

  it('standard lasts 90 days', () => {
    const expiry = service.standardExpiry(new Date('2026-01-01T00:00:00.000Z'));
    expect(expiry.toISOString()).toBe('2026-04-01T00:00:00.000Z');
  });

  it('pro lasts 180 days', () => {
    const expiry = service.proExpiry(new Date('2026-01-01T00:00:00.000Z'));
    expect(expiry.toISOString()).toBe('2026-06-30T00:00:00.000Z');
  });

  it('pro+ lasts one calendar year', () => {
    const expiry = service.proPlusExpiry(new Date('2026-03-15T00:00:00.000Z'));
    expect(expiry.toISOString()).toBe('2027-03-15T00:00:00.000Z');
  });

  it('pro+ clamps leap day to Feb 28 (no free extra day)', () => {
    const expiry = service.proPlusExpiry(new Date('2024-02-29T12:00:00.000Z'));
    expect(expiry.toISOString()).toBe('2025-02-28T12:00:00.000Z');
  });
});
