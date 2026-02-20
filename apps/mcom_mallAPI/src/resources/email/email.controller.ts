import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post('send-otp')
  sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.emailService.sendOtp(sendOtpDto);
  }

  @Public()
  @Post('validate-otp')
  validateOtp(@Body() validateOtpDto: ValidateOtpDto) {
    return this.emailService.validateOtp(validateOtpDto);
  }
}
