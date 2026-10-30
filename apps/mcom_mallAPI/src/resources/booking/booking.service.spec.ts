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
