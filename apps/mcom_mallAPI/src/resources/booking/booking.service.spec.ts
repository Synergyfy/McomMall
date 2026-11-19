import { BookingService } from './booking.service';

/**
 * Booking availability used to compare the numeric `DayOfWeek` enum against
 * day-name strings (`"MONDAY"`), so no business ever returned slots. These
 * tests pin the matcher to both representations.
 */
describe('BookingService day matching', () => {
  const service = Object.create(BookingService.prototype) as BookingService;
  const isDayMatch = (value: unknown, date: Date) =>
    (service as any).isDayMatch(value, date);

  // 2026-10-30 is a Friday (numeric enum value 5).
  const friday = new Date(2026, 9, 30);

  it('matches the numeric DayOfWeek enum value', () => {
    expect(isDayMatch(5, friday)).toBe(true);
    expect(isDayMatch(1, friday)).toBe(false);
  });

  it('matches the string day name used by some clients', () => {
    expect(isDayMatch('FRIDAY', friday)).toBe(true);
    expect(isDayMatch('friday', friday)).toBe(true);
    expect(isDayMatch('MONDAY', friday)).toBe(false);
  });

  it('matches numeric strings and rejects empty values', () => {
    expect(isDayMatch('5', friday)).toBe(true);
    expect(isDayMatch('0', friday)).toBe(false);
    expect(isDayMatch('', friday)).toBe(false);
    expect(isDayMatch(null, friday)).toBe(false);
    expect(isDayMatch(undefined, friday)).toBe(false);
  });
});

describe('BookingService bundled service pricing', () => {
  const service = Object.create(BookingService.prototype) as BookingService;
  const start = new Date('2026-11-19T10:00:00.000Z');
  const end = new Date('2026-11-19T12:00:00.000Z');

  const fixedService = {
    pricingModel: 'fixed',
    fixedPrice: 75,
    bookingFee: 5,
    deliveryConfig: { mode: 'onsite', travelFee: 8.5 },
  } as any;

  it('prices a fixed service with fee and travel using the booking engine', () => {
    const pricing = service.quoteForService(fixedService, start, end);
    expect(pricing.totalAmount).toBe(88.5);
    expect(pricing.commissionAmount).toBe(8.85);
    expect(pricing.providerAmount).toBe(79.65);
  });

  it('prices hourly services by the selected duration', () => {
    const pricing = service.quoteForService(
      { pricingModel: 'perHour', pricePerHour: 35 } as any,
      start,
      end,
    );
    expect(pricing.totalAmount).toBe(70);
  });

  it('rejects an end time that is not after the start time', () => {
    expect(() =>
      service.quoteForService(fixedService, end, start),
    ).toThrow(/later end time/i);
  });
});
