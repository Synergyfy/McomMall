import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Otp, OtpType } from './entities/otp.entity';
import { SendOtpDto } from './dto/send-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { HashService } from 'src/common/hash/hash.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly hashService: HashService,
  ) { }

  async sendUserWelcomeEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to McomMall!',
      template: './welcome',
      context: {
        name: user.firstName,
      },
    });
  }

  async sendOtp({ email, type }: SendOtpDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user && type === OtpType.PASSWORD_RESET) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.otpRepository.save({
      otp,
      type,
      expiresAt,
      user: user || null,
      email: email,
    });

    await this.mailerService.sendMail({
      to: email,
      subject:
        type === OtpType.VERIFICATION
          ? 'Verify your email'
          : 'Reset your password',
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    return { message: 'OTP sent successfully' };
  }

  async validateOtp({ email, otp, type }: ValidateOtpDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    let otpDetails;
    if (user) {
        otpDetails = await this.otpRepository.findOne({
          where: { user: { id: user.id }, otp, type },
          order: { expiresAt: 'DESC' },
        });
    } else {
        otpDetails = await this.otpRepository.findOne({
            where: { email, otp, type },
            order: { expiresAt: 'DESC' },
        });
    }

    if (!otpDetails) {
      throw new NotFoundException('Invalid OTP');
    }

    if (otpDetails.expiresAt < new Date()) {
      throw new NotFoundException('OTP has expired');
    }

    if (type === OtpType.VERIFICATION && user) {
      user.isEmailVerified = true;
      await this.userRepository.save(user);
    }

    return { message: 'OTP validated successfully' };
  }

  async resetPassword({ email, password, otp }: ResetPasswordDto) {
    await this.validateOtp({ email, otp, type: OtpType.PASSWORD_RESET });

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await this.hashService.hashPassword(password);
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }
}
