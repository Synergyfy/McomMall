import { Test, TestingModule } from '@nestjs/testing';
import { SsoService } from './sso.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../common/role.enum';
import { McomCentralService } from './mcom-central.service';

describe('SsoService', () => {
  let service: SsoService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockUserService = {
    create: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({ id: 'mall-1' }),
      save: jest.fn().mockResolvedValue({ id: 'mall-1' }),
    }),
  };

  const mockMcomCentralService = {
    getUserPackages: jest.fn(),
    getUserMembership: jest.fn(),
    getUserContext: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: UserRole.CUSTOMER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SsoService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: McomCentralService,
          useValue: mockMcomCentralService,
        },
      ],
    }).compile();

    service = module.get<SsoService>(SsoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateState', () => {
    it('should return a 64-character hex string', () => {
      const state = service.generateState();
      expect(state).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(state)).toBe(true);
    });

    it('should return unique values on each call', () => {
      const state1 = service.generateState();
      const state2 = service.generateState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('getAuthorizeUrl', () => {
    it('should return a valid URL with query params', () => {
      process.env.MCOM_SOLUTIONS_FRONTEND_URL = 'http://central-frontend:3000';
      process.env.MCOM_SOLUTIONS_BACKEND_URL = 'http://central:3010';
      process.env.SSO_CLIENT_ID = 'mcom-mall';
      process.env.MALL_FRONTEND_URL = 'http://mall:3003';

      const url = service.getAuthorizeUrl('test-state');
      expect(url).toContain('http://central-frontend:3000/api/v1/auth/sso/authorize');
      expect(url).toContain('client_id=mcom-mall');
      expect(url).toContain('response_type=code');
      expect(url).toContain('state=test-state');
      expect(url).toContain(
        `redirect_uri=${encodeURIComponent('http://mall:3003/auth/callback')}`,
      );
    });

    it('should use default values when env vars are missing', () => {
      delete process.env.MCOM_SOLUTIONS_FRONTEND_URL;
      delete process.env.MCOM_SOLUTIONS_BACKEND_URL;
      delete process.env.SSO_CLIENT_ID;
      delete process.env.MALL_FRONTEND_URL;

      const url = service.getAuthorizeUrl('state');
      expect(url).toContain('http://localhost:3000/api/v1/auth/sso/authorize');
      expect(url).toContain('client_id=mcom-mall');
    });
  });

  describe('exchangeCode', () => {
    beforeEach(() => {
      process.env.MCOM_SOLUTIONS_BACKEND_URL = 'http://central:3010';
      process.env.SSO_CLIENT_ID = 'mcom-mall';
      process.env.SSO_CLIENT_SECRET = 'secret';
      process.env.MALL_FRONTEND_URL = 'http://mall:3003';
    });

    it('should return token data on success', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: 'at',
          refreshToken: 'rt',
          user: { email: 'a@b.com' },
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.exchangeCode('auth-code');
      expect(result).toEqual({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { email: 'a@b.com' },
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://central:3010/api/v1/auth/sso/token',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should throw UnauthorizedException on non-OK response', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'invalid_code' }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.exchangeCode('bad-code')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with default message when error body has no error field', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.exchangeCode('code')).rejects.toThrow(
        'SSO token exchange failed',
      );
    });

    it('should throw UnauthorizedException when response is not JSON', async () => {
      const mockResponse = {
        ok: false,
        status: 502,
        json: jest.fn().mockRejectedValue(new Error('Not JSON')),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.exchangeCode('code')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when success response is not JSON', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Not JSON')),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.exchangeCode('code')).rejects.toThrow(
        'Invalid response from MCOM Solutions token endpoint',
      );
    });
  });

  describe('handleCallback', () => {
    beforeEach(() => {
      process.env.MCOM_SOLUTIONS_BACKEND_URL = 'http://central:3010';
      process.env.SSO_CLIENT_ID = 'mcom-mall';
      process.env.SSO_CLIENT_SECRET = 'secret';
      process.env.MALL_FRONTEND_URL = 'http://mall:3003';

      mockJwtService.sign.mockReturnValue('mock-jwt-token');
    });

    it('should throw UnauthorizedException on CSRF state mismatch', async () => {
      await expect(
        service.handleCallback('code', 'state-a', 'state-b'),
      ).rejects.toThrow('CSRF State mismatch');
    });

    it('should throw UnauthorizedException when cookie state is missing', async () => {
      await expect(
        service.handleCallback('code', 'state-a', undefined),
      ).rejects.toThrow('CSRF State mismatch');
    });

    it('should throw UnauthorizedException when query state is missing', async () => {
      await expect(
        service.handleCallback('code', undefined, 'state-a'),
      ).rejects.toThrow('CSRF State mismatch');
    });

    it('should throw UnauthorizedException when MCOM Central returns no user', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ user: null }),
      });

      await expect(
        service.handleCallback('code', 'state', 'state'),
      ).rejects.toThrow('Invalid user data received from MCOM Solutions');
    });

    it('should throw UnauthorizedException when MCOM Central returns user without email', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ user: { name: 'No Email' } }),
      });

      await expect(
        service.handleCallback('code', 'state', 'state'),
      ).rejects.toThrow('Invalid user data received from MCOM Solutions');
    });

    it('should create a new user when user does not exist locally', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.CUSTOMER,
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            email: 'new@example.com',
            name: 'Jane Smith',
            role: 'customer',
          },
        }),
      });

      const result = await service.handleCallback('code', 'state', 'state');

      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.CUSTOMER,
        }),
      );
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('should create user with OWNER role when central role is "business"', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.OWNER,
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            email: 'biz@example.com',
            name: 'Biz Owner',
            role: 'business',
          },
        }),
      });

      await service.handleCallback('code', 'state', 'state');

      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.OWNER,
        }),
      );
    });

    it('should use email prefix as first name when name is missing', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.CUSTOMER,
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: { email: 'anon@example.com', role: 'customer' },
        }),
      });

      await service.handleCallback('code', 'state', 'state');

      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'anon',
          lastName: 'User',
        }),
      );
    });

    it('should update existing user when names or role changed', async () => {
      const existingUser = { ...mockUser, role: UserRole.CUSTOMER };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            email: 'test@example.com',
            name: 'Jane Updated',
            role: 'business',
          },
        }),
      });

      const result = await service.handleCallback('code', 'state', 'state');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Updated',
          role: UserRole.OWNER,
        }),
      );
      expect(result.role).toBe(UserRole.OWNER);
    });

    it('should not save existing user when nothing changed', async () => {
      const existingUser = {
        ...mockUser,
        role: UserRole.CUSTOMER,
        firstName: 'John',
        lastName: 'Doe',
      };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            email: 'test@example.com',
            name: 'John Doe',
            role: 'customer',
          },
        }),
      });

      await service.handleCallback('code', 'state', 'state');

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should generate JWT tokens for the user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            email: 'test@example.com',
            name: 'John Doe',
            role: 'customer',
          },
        }),
      });

      const result = await service.handleCallback('code', 'state', 'state');

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.userId).toBe('user-1');
      expect(result.name).toBe('John Doe');
      expect(result.role).toBe(UserRole.CUSTOMER);
    });

    it('should throw ForbiddenException when user has no active MCOM Mall package', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: null,
        isActive: false,
        packages: [],
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            sub: 'central-user-1',
            email: 'test@example.com',
            name: 'John Doe',
            role: 'customer',
          },
        }),
      });

      await expect(
        service.handleCallback('code', 'state', 'state'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when getUserPackages returns null', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue(null);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            sub: 'central-user-2',
            email: 'test@example.com',
            name: 'John Doe',
            role: 'customer',
          },
        }),
      });

      await expect(
        service.handleCallback('code', 'state', 'state'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should proceed with JIT provisioning when user has active package', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-uuid-123',
        isActive: true,
        packages: [{ platform: 'MCOM Mall', status: 'active' }],
      });
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.CUSTOMER,
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            sub: 'central-user-3',
            email: 'newuser@example.com',
            name: 'New User',
            role: 'customer',
          },
        }),
      });

      const result = await service.handleCallback('code', 'state', 'state');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.userId).toBe('user-1');
    });

    it('should include tierId in packageInfo when package is active', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-uuid-456',
        isActive: true,
        packages: [{ platform: 'MCOM Mall', status: 'active' }],
      });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            sub: 'central-user-4',
            email: 'test@example.com',
            name: 'John Doe',
            role: 'customer',
          },
        }),
      });

      const result = await service.handleCallback('code', 'state', 'state');

      expect(result.packageInfo).toEqual({ planType: 'tier-uuid-456' });
    });

    it('should set packageInfo to null when tierId is missing', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: null,
        isActive: true,
        packages: [{ platform: 'MCOM Mall', status: 'active' }],
      });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            sub: 'central-user-5',
            email: 'test@example.com',
            name: 'John Doe',
            role: 'customer',
          },
        }),
      });

      const result = await service.handleCallback('code', 'state', 'state');

      expect(result.packageInfo).toBeNull();
    });
  });
});
