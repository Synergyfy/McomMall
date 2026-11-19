import { Logger } from '@nestjs/common';

// @nestjs/schedule v12 ships ESM-only; the sweep logic does not depend on it,
// so stub the decorator surface for Jest's CommonJS runtime.
jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
  CronExpression: { EVERY_5_MINUTES: '*/5 * * * *' },
}));

import { VoucherExpiryService } from './voucher-expiry.service';
import {
  expireDueVouchers,
  VOUCHER_EXPIRY_BATCH_SIZE,
} from './voucher-expiry.util';

function row(id: string) {
  return { id };
}

describe('expireDueVouchers', () => {
  it('expires due wallets in batches until the backlog is drained', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce(
        Array.from({ length: VOUCHER_EXPIRY_BATCH_SIZE }, (_, i) =>
          row(`${i}`),
        ),
      )
      .mockResolvedValueOnce([row('last')]);

    const runner = { query };
    const now = new Date('2026-11-18T12:00:00.000Z');

    const expired = await expireDueVouchers(runner, now);

    expect(expired).toBe(VOUCHER_EXPIRY_BATCH_SIZE + 1);
    expect(query).toHaveBeenCalledTimes(2);

    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('FOR UPDATE SKIP LOCKED');
    expect(sql).toContain(`"state" = 'expired'`);
    expect(params).toEqual([now, VOUCHER_EXPIRY_BATCH_SIZE]);
  });

  it('returns zero and makes one query when nothing is due', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await expect(expireDueVouchers({ query })).resolves.toBe(0);
    expect(query).toHaveBeenCalledTimes(1);
  });
});

describe('VoucherExpiryService', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs the number of wallets it expires', async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([row('a'), row('b')]),
    };
    const service = new VoucherExpiryService(dataSource as any);

    await expect(service.sweepExpiredVouchers()).resolves.toBe(2);
    expect(logSpy).toHaveBeenCalledWith(
      'Expired 2 voucher wallet(s) past their expiry.',
    );
  });

  it('swallows sweep failures so the scheduler keeps running', async () => {
    const dataSource = {
      query: jest.fn().mockRejectedValue(new Error('db down')),
    };
    const service = new VoucherExpiryService(dataSource as any);

    await expect(service.sweepExpiredVouchers()).resolves.toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('does not run overlapping sweeps in the same process', async () => {
    let release: (rows: any[]) => void = () => undefined;
    const pending = new Promise<any[]>((resolve) => {
      release = resolve;
    });
    const dataSource = { query: jest.fn().mockReturnValue(pending) };
    const service = new VoucherExpiryService(dataSource as any);

    const first = service.sweepExpiredVouchers();
    await expect(service.sweepExpiredVouchers()).resolves.toBe(0);

    release([row('a')]);
    await expect(first).resolves.toBe(1);
    expect(dataSource.query).toHaveBeenCalledTimes(1);
  });
});
