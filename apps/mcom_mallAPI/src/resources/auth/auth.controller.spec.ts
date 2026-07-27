import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { HashService } from '../../common/hash/hash.service';

import { EmailService } from '../email/email.service';
import { OtpType } from '../email/entities/otp.entity';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';
import { McomCentralService } from '../sso/mcom-central.service';
import { ForbiddenException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let emailService: EmailService;
  let mcomCentralService: McomCentralService;

  const mockEmailService = {
    sendOtp: jest.fn(),
    resetPassword: jest.fn(),
    validateOtp: jest.fn(),
  };

  const mockActivityTimerService = {
    getUserActiveTasks: jest.fn().mockResolvedValue([]),
  };

  const mockAuthService = {
    loginWithSso: jest.fn(),
  };

  const mockUsersService = {
    findCurrentUser: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockMcomCentralService = {
    getUserPackages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: HashService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ActivityTimerService,
          useValue: mockActivityTimerService,
        },
        {
          provide: McomCentralService,
          useValue: mockMcomCentralService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    emailService = module.get<EmailService>(EmailService);
    mcomCentralService = module.get<McomCentralService>(McomCentralService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should call emailService.sendOtp', async () => {
      const email = 'test@example.com';
      await controller.forgotPassword(email);
      expect(emailService.sendOtp).toHaveBeenCalledWith({
        email,
        type: OtpType.PASSWORD_RESET,
      });
    });
  });

  describe('resetPassword', () => {
    it('should call emailService.resetPassword', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'pass',
        confirmPassword: 'pass',
        otp: '123456',
      };
      await controller.resetPassword(dto);
      expect(emailService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('ssoLogin', () => {
    const ssoToken = 'valid-sso-token';

    it('should return auth data when subscription is active with tierId', async () => {
      mockAuthService.loginWithSso.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        email: 'user@test.com',
      });
      mockUsersService.findCurrentUser.mockResolvedValue({
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'owner',
        centralUserId: 'central-1',
      });
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-1',
        isActive: true,
        packages: [],
      });

      const result = await controller.ssoLogin(ssoToken);

      expect(result.auth.accessToken).toBe('access');
      expect(result.name).toBe('John Doe');
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith('user-1');
    });

    it('should throw when subscription is inactive', async () => {
      mockAuthService.loginWithSso.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        email: 'user@test.com',
      });
      mockUsersService.findCurrentUser.mockResolvedValue({
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'owner',
        centralUserId: 'central-1',
      });
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: null,
        isActive: false,
        packages: [],
      });

      await expect(controller.ssoLogin(ssoToken)).rejects.toThrow();
    });

    it('should throw when tierId is missing', async () => {
      mockAuthService.loginWithSso.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        email: 'user@test.com',
      });
      mockUsersService.findCurrentUser.mockResolvedValue({
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'owner',
        centralUserId: 'central-1',
      });
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: null,
        isActive: true,
        packages: [],
      });

      await expect(controller.ssoLogin(ssoToken)).rejects.toThrow();
    });

    it('should succeed for customer role without subscription check', async () => {
      mockAuthService.loginWithSso.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        email: 'customer@test.com',
      });
      mockUsersService.findCurrentUser.mockResolvedValue({
        id: 'user-2',
        firstName: 'Jane',
        lastName: 'Customer',
        role: 'customer',
        centralUserId: 'central-2',
      });

      const result = await controller.ssoLogin(ssoToken);

      expect(result.auth.accessToken).toBe('access');
      expect(result.name).toBe('Jane Customer');
      expect(result.role).toBe('customer');
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith('user-2');
    });
  });
});
