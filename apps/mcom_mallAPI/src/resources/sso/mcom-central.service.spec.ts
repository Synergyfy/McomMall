import { Test, TestingModule } from '@nestjs/testing';
import { McomCentralService } from './mcom-central.service';
import * as crypto from 'crypto';

describe('McomCentralService', () => {
  let service: McomCentralService;

  beforeEach(async () => {
    process.env.MCOM_SOLUTIONS_BACKEND_URL = 'http://central:3010';
    process.env.SSO_CLIENT_ID = 'mcom-mall';
    process.env.SSO_API_SECRET = 'mcom_mall_dev_secret_change_in_prod';

    const module: TestingModule = await Test.createTestingModule({
      providers: [McomCentralService],
    }).compile();

    service = module.get<McomCentralService>(McomCentralService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.MCOM_SOLUTIONS_BACKEND_URL;
    delete process.env.SSO_CLIENT_ID;
    delete process.env.SSO_API_SECRET;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserMembership', () => {
    it('should send HMAC signed headers with the request', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: null }),
      });

      await service.getUserMembership('user-1');

      const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
        .headers;
      expect(calledHeaders['X-Service-Id']).toBe('mcom-mall');
      expect(calledHeaders['X-Timestamp']).toBeDefined();
      expect(calledHeaders['X-Signature']).toBeDefined();

      const timestamp = calledHeaders['X-Timestamp'];
      const expectedSignature = crypto
        .createHmac('sha256', 'mcom_mall_dev_secret_change_in_prod')
        .update(`mcom-mall:${timestamp}`)
        .digest('hex');
      expect(calledHeaders['X-Signature']).toBe(expectedSignature);
    });

    it('should return membership data with active mall using platform field', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            membershipLevel: 'Gold',
            membershipTier: 'Pro',
            packages: [
              { platform: 'mall', status: 'active' },
              { platform: 'loyalty', status: 'inactive' },
            ],
          },
        }),
      });

      const result = await service.getUserMembership('user-1');

      expect(result).toEqual({
        membershipLevel: 'Gold',
        membershipTier: 'Pro',
        hasActiveMall: true,
        packages: [
          { platform: 'mall', status: 'active' },
          { platform: 'loyalty', status: 'inactive' },
        ],
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://central:3010/api/v1/data/user?userId=user-1',
        expect.anything(),
      );
    });

    it('should return hasActiveMall=false when no active mall package', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            membershipLevel: 'Silver',
            membershipTier: 'Basic',
            packages: [{ platform: 'loyalty', status: 'active' }],
          },
        }),
      });

      const result = await service.getUserMembership('user-2');

      expect(result.hasActiveMall).toBe(false);
      expect(result.membershipLevel).toBe('Silver');
    });

    it('should be case-insensitive when checking platform name', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [{ platform: 'Mall', status: 'active' }],
          },
        }),
      });

      const result = await service.getUserMembership('user-3');

      expect(result.hasActiveMall).toBe(true);
    });

    it('should return null when response is not OK', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.getUserMembership('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when data is null', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: null }),
      });

      const result = await service.getUserMembership('user-3');

      expect(result).toBeNull();
    });

    it('should return null when packages array is missing', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            membershipLevel: 'Gold',
            membershipTier: 'Pro',
          },
        }),
      });

      const result = await service.getUserMembership('user-4');

      expect(result.hasActiveMall).toBe(false);
      expect(result.packages).toEqual([]);
    });

    it('should return null on network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.getUserMembership('user-5');

      expect(result).toBeNull();
    });

    it('should return null on JSON parse error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      const result = await service.getUserMembership('user-6');

      expect(result).toBeNull();
    });

    it('should encode userId in the URL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: null }),
      });

      await service.getUserMembership('user/with/slashes');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `userId=${encodeURIComponent('user/with/slashes')}`,
        ),
        expect.anything(),
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true when central is healthy', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should send HMAC headers for health check', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      await service.healthCheck();

      const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
        .headers;
      expect(calledHeaders['X-Service-Id']).toBe('mcom-mall');
      expect(calledHeaders['X-Signature']).toBeDefined();
    });

    it('should return false when central returns non-OK', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('getUserPackages', () => {
    it('should return tierId and isActive when user has active MCOM Mall package', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'MCOM Mall', tierId: 'tier-uuid-123', status: 'active' },
              { platform: 'MCOM Rewards', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-1');

      expect(result).toEqual({
        tierId: 'tier-uuid-123',
        isActive: true,
        packages: [
          { platform: 'MCOM Mall', tierId: 'tier-uuid-123', status: 'active' },
          { platform: 'MCOM Rewards', status: 'active' },
        ],
      });
    });

    it('should return isActive: false when package status is inactive', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'MCOM Mall', tierId: 'tier-uuid-456', status: 'inactive' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-2');

      expect(result).toEqual({
        tierId: 'tier-uuid-456',
        isActive: false,
        packages: [
          { platform: 'MCOM Mall', tierId: 'tier-uuid-456', status: 'inactive' },
        ],
      });
    });

    it('should return null when packages array is empty', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { packages: [] },
        }),
      });

      const result = await service.getUserPackages('user-3');

      expect(result).toEqual({
        tierId: null,
        isActive: false,
        packages: [],
      });
    });

    it('should return null when no MCOM Mall platform entry exists', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'MCOM Rewards', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-4');

      expect(result).toEqual({
        tierId: null,
        isActive: false,
        packages: [
          { platform: 'MCOM Rewards', status: 'active' },
        ],
      });
    });

    it('should return null on network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.getUserPackages('user-5');

      expect(result).toBeNull();
    });

    it('should return null on non-OK response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.getUserPackages('user-6');

      expect(result).toBeNull();
    });

    it('should handle missing tierId gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'MCOM Mall', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-7');

      expect(result).toEqual({
        tierId: null,
        isActive: true,
        packages: [
          { platform: 'MCOM Mall', status: 'active' },
        ],
      });
    });

    it('should be case-insensitive when matching platform name', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'mcom mall', tierId: 'tier-789', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-8');

      expect(result.tierId).toBe('tier-789');
      expect(result.isActive).toBe(true);
    });

    it('should also match "mall" as platform name', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'mall', tierId: 'tier-mall', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-9');

      expect(result.tierId).toBe('tier-mall');
      expect(result.isActive).toBe(true);
    });

    it('should handle packages in body.data.packages', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            packages: [
              { platform: 'MCOM Mall', tierId: 'tier-top', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserPackages('user-10');

      expect(result.tierId).toBe('tier-top');
      expect(result.isActive).toBe(true);
    });

    it('should send HMAC signed headers', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { packages: [] } }),
      });

      await service.getUserPackages('user-11');

      const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
        .headers;
      expect(calledHeaders['X-Service-Id']).toBe('mcom-mall');
      expect(calledHeaders['X-Timestamp']).toBeDefined();
      expect(calledHeaders['X-Signature']).toBeDefined();

      const timestamp = calledHeaders['X-Timestamp'];
      const expectedSignature = crypto
        .createHmac('sha256', 'mcom_mall_dev_secret_change_in_prod')
        .update(`mcom-mall:${timestamp}`)
        .digest('hex');
      expect(calledHeaders['X-Signature']).toBe(expectedSignature);
    });

    it('should use the same endpoint as getUserMembership', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { packages: [] } }),
      });

      await service.getUserPackages('user-12');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/data/user?userId='),
        expect.anything(),
      );
    });
  });
});
