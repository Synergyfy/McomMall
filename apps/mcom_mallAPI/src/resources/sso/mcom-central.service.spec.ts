import { Test, TestingModule } from '@nestjs/testing';
import { McomCentralService } from './mcom-central.service';

describe('McomCentralService', () => {
  let service: McomCentralService;

  beforeEach(async () => {
    process.env.MCOM_CENTRAL_BASE_URL = 'http://central:3010';
    process.env.SSO_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [McomCentralService],
    }).compile();

    service = module.get<McomCentralService>(McomCentralService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.MCOM_CENTRAL_BASE_URL;
    delete process.env.SSO_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserMembership', () => {
    it('should return membership data with active mall', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            membershipLevel: 'Gold',
            membershipTier: 'Pro',
            packages: [
              { platformName: 'MCOM Mall', status: 'active' },
              { platformName: 'MCOM Loyalty', status: 'inactive' },
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
          { platformName: 'MCOM Mall', status: 'active' },
          { platformName: 'MCOM Loyalty', status: 'inactive' },
        ],
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://central:3010/api/v1/data/user?userId=user-1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Api-Key': 'test-api-key',
          }),
        }),
      );
    });

    it('should return hasActiveMall=false when no active MCOM Mall package', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            membershipLevel: 'Silver',
            membershipTier: 'Basic',
            packages: [
              { platformName: 'MCOM Loyalty', status: 'active' },
            ],
          },
        }),
      });

      const result = await service.getUserMembership('user-2');

      expect(result.hasActiveMall).toBe(false);
      expect(result.membershipLevel).toBe('Silver');
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
});
