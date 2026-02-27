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

describe('AuthController', () => {
  let controller: AuthController;
  let emailService: EmailService;

  const mockEmailService = {
    sendOtp: jest.fn(),
    resetPassword: jest.fn(),
    validateOtp: jest.fn(),
  };

  const mockActivityTimerService = {
    getUserActiveTasks: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {},
        },
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
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    emailService = module.get<EmailService>(EmailService);
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
});
