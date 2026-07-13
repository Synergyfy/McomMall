import { Test, TestingModule } from '@nestjs/testing';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';
import { McomCentralService } from './mcom-central.service';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../../common/role.enum';

describe('SsoController', () => {
  let controller: SsoController;

  const mockSsoService = {
    generateState: jest.fn().mockReturnValue('mock-state-hex'),
    getAuthorizeUrl: jest.fn().mockReturnValue('http://central/api/v1/auth/sso/authorize?state=mock'),
    handleCallback: jest.fn(),
  };

  const mockMcomCentralService = {
    getUserMembership: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.MALL_FRONTEND_URL = 'http://mall:3002';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SsoController],
      providers: [
        { provide: SsoService, useValue: mockSsoService },
        { provide: McomCentralService, useValue: mockMcomCentralService },
      ],
    }).compile();

    controller = module.get<SsoController>(SsoController);
  });

  afterEach(() => {
    delete process.env.MALL_FRONTEND_URL;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initiateSso', () => {
    it('should generate state, set cookie, and redirect to authorize URL', () => {
      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      controller.initiateSso(mockRes);

      expect(mockSsoService.generateState).toHaveBeenCalled();
      expect(mockSsoService.getAuthorizeUrl).toHaveBeenCalledWith(
        'mock-state-hex',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'sso_state',
        'mock-state-hex',
        expect.objectContaining({
          httpOnly: true,
          signed: true,
          sameSite: 'lax',
          maxAge: 300000,
        }),
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://central/api/v1/auth/sso/authorize?state=mock',
      );
    });

    it('should set secure flag in production', () => {
      process.env.NODE_ENV = 'production';
      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      controller.initiateSso(mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'sso_state',
        'mock-state-hex',
        expect.objectContaining({ secure: true }),
      );

      delete process.env.NODE_ENV;
    });

    it('should not set secure flag in development', () => {
      process.env.NODE_ENV = 'development';
      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      controller.initiateSso(mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'sso_state',
        'mock-state-hex',
        expect.objectContaining({ secure: false }),
      );
    });
  });

  describe('handleCallback', () => {
    it('should redirect to frontend with tokens on success', async () => {
      mockSsoService.handleCallback.mockResolvedValue({
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        userId: 'user-1',
        name: 'John Doe',
        role: UserRole.CUSTOMER,
      });

      const mockReq = {
        signedCookies: { sso_state: 'valid-state' },
      };
      const mockRes = {
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      await controller.handleCallback(
        { code: 'auth-code', state: 'valid-state' } as any,
        mockReq,
        mockRes,
      );

      expect(mockSsoService.handleCallback).toHaveBeenCalledWith(
        'auth-code',
        'valid-state',
        'valid-state',
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith('sso_state');
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('http://mall:3002/auth/sso?'),
      );
      const redirectUrl = mockRes.redirect.mock.calls[0][0];
      expect(redirectUrl).toContain('accessToken=at-123');
      expect(redirectUrl).toContain('refreshToken=rt-456');
      expect(redirectUrl).toContain('userId=user-1');
      expect(redirectUrl).toContain('name=John+Doe');
    });

    it('should redirect to signin with generic error on failure', async () => {
      mockSsoService.handleCallback.mockRejectedValue(
        new Error('CSRF State mismatch'),
      );

      const mockReq = {
        signedCookies: { sso_state: 'wrong-state' },
      };
      const mockRes = {
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      await controller.handleCallback(
        { code: 'code', state: 'state-a' } as any,
        mockReq,
        mockRes,
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/signin?error=sso_authentication_failed'),
      );
      expect(mockRes.redirect).not.toHaveBeenCalledWith(
        expect.stringContaining('CSRF'),
      );
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockSsoService.handleCallback.mockRejectedValue('string error');

      const mockReq = {
        signedCookies: { sso_state: 'state' },
      };
      const mockRes = {
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      await controller.handleCallback(
        { code: 'code', state: 'state' } as any,
        mockReq,
        mockRes,
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/signin?error=sso_authentication_failed'),
      );
    });

    it('should pass missing cookie state to service', async () => {
      mockSsoService.handleCallback.mockRejectedValue(
        new Error('CSRF State mismatch'),
      );

      const mockReq = {
        signedCookies: {},
      };
      const mockRes = {
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      await controller.handleCallback(
        { code: 'code', state: 'state' } as any,
        mockReq,
        mockRes,
      );

      expect(mockSsoService.handleCallback).toHaveBeenCalledWith(
        'code',
        'state',
        undefined,
      );
    });
  });

  describe('getUserMembership', () => {
    it('should return membership data on success', async () => {
      mockMcomCentralService.getUserMembership.mockResolvedValue({
        membershipLevel: 'Gold',
        membershipTier: 'Pro',
        hasActiveMall: true,
        packages: [],
      });

      const result = await controller.getUserMembership('user-1');

      expect(result).toEqual({
        status: 'success',
        data: {
          membershipLevel: 'Gold',
          membershipTier: 'Pro',
          hasActiveMall: true,
          packages: [],
        },
      });
    });

    it('should throw BadRequestException when membership is null', async () => {
      mockMcomCentralService.getUserMembership.mockResolvedValue(null);

      await expect(
        controller.getUserMembership('user-2'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call McomCentralService with correct userId', async () => {
      mockMcomCentralService.getUserMembership.mockResolvedValue({
        membershipLevel: null,
        membershipTier: null,
        hasActiveMall: false,
        packages: [],
      });

      await controller.getUserMembership('user-3');

      expect(
        mockMcomCentralService.getUserMembership,
      ).toHaveBeenCalledWith('user-3');
    });
  });
});
