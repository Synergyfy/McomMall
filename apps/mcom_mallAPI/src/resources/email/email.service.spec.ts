import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import { OtpType } from './entities/otp.entity';
import { HashService } from 'src/common/hash/hash.service';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;
  let userRepository: Repository<User>;
  let otpRepository: Repository<Otp>;
  let hashService: HashService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockOtpRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockHashService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: mockOtpRepository,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    otpRepository = module.get<Repository<Otp>>(getRepositoryToken(Otp));
    hashService = module.get<HashService>(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should send an OTP', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockOtpRepository.save.mockResolvedValue({});
      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendOtp({
        email: 'test@example.com',
        type: OtpType.VERIFICATION,
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockOtpRepository.save).toHaveBeenCalled();
      expect(mockMailerService.sendMail).toHaveBeenCalled();
    });
  });

  describe('validateOtp', () => {
    it('should validate an OTP', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const otp = {
        id: '1',
        otp: '123456',
        type: OtpType.VERIFICATION,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockOtpRepository.findOne.mockResolvedValue(otp);
      mockUserRepository.save.mockResolvedValue(user);

      await service.validateOtp({
        email: 'test@example.com',
        otp: '123456',
        type: OtpType.VERIFICATION,
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockOtpRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset a user password', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'oldPassword',
      };

      // Spy on validateOtp to avoid integration issues within unit test
      jest
        .spyOn(service, 'validateOtp')
        .mockResolvedValue({ message: 'OTP validated' });

      mockUserRepository.findOne.mockResolvedValue(user);
      mockHashService.hashPassword.mockResolvedValue('newHashedPassword');
      mockUserRepository.save.mockResolvedValue({
        ...user,
        password: 'newHashedPassword',
      });

      await service.resetPassword({
        email: 'test@example.com',
        password: 'newPassword',
        confirmPassword: 'newPassword',
        otp: '123456',
      });

      expect(service.validateOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        otp: '123456',
        type: OtpType.PASSWORD_RESET,
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockHashService.hashPassword).toHaveBeenCalledWith('newPassword');
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...user,
        password: 'newHashedPassword',
      });
    });
  });
});
