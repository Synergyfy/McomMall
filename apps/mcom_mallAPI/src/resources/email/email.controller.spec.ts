import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { OtpType } from './entities/otp.entity';

describe('EmailController', () => {
  let controller: EmailController;
  let service: EmailService;

  const mockEmailService = {
    sendOtp: jest.fn(),
    validateOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should call emailService.sendOtp', () => {
      const sendOtpDto: SendOtpDto = {
        email: 'test@example.com',
        type: OtpType.VERIFICATION,
      };
      controller.sendOtp(sendOtpDto);
      expect(service.sendOtp).toHaveBeenCalledWith(sendOtpDto);
    });
  });

  describe('validateOtp', () => {
    it('should call emailService.validateOtp', () => {
      const validateOtpDto: ValidateOtpDto = {
        email: 'test@example.com',
        otp: '123456',
        type: OtpType.VERIFICATION,
      };
      controller.validateOtp(validateOtpDto);
      expect(service.validateOtp).toHaveBeenCalledWith(validateOtpDto);
    });
  });
});
