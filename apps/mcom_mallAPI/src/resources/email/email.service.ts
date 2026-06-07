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
  ) {}

  async sendUserWelcomeEmail(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to McomMall!',
        template: './welcome',
        context: {
          name: user.firstName,
        },
      });
    } catch (error) {
      console.error(`Failed to send welcome email to ${user.email}:`, error.message);
    }
  }

  async sendOtp({ email, type }: SendOtpDto) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user && type === OtpType.PASSWORD_RESET) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Log the OTP to console for easy local testing when SMTP is not connected
    console.log(`[EmailService] Generated OTP for ${email}: ${otp}`);

    await this.otpRepository.save({
      otp,
      type,
      expiresAt,
      user: user || null,
      email: email,
    });

    try {
      await this.mailerService.sendMail({
        to: email,
        subject:
          type === OtpType.VERIFICATION
            ? 'Verify your email'
            : 'Reset your password',
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      });
    } catch (error) {
      console.error(`Failed to send OTP email to ${email}:`, error.message);
    }

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

  async sendPartnershipRequestEmail(
    receiver: User,
    sender: User,
    itemDetails?: { baseItemName: string; plusItemName: string },
  ) {
    const actionUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/dashboard/marketing/my-partners`;
    const senderInitials =
      (sender.firstName?.[0] || 'U') + (sender.lastName?.[0] || '');

    await this.mailerService.sendMail({
      to: receiver.email,
      subject: itemDetails
        ? `Proposal: Connect ${itemDetails.baseItemName} + ${itemDetails.plusItemName}`
        : `New Partnership Request from ${sender.firstName}`,
      template: './partnership-request',
      context: {
        receiverName: receiver.firstName,
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderEmail: sender.email,
        senderInitials: senderInitials.toUpperCase(),
        isItemRequest: !!itemDetails,
        baseItemName: itemDetails?.baseItemName,
        plusItemName: itemDetails?.plusItemName,
        actionUrl,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendBookingNotification(booking: any, isOwner: boolean) {
    const receiver = isOwner ? booking.service.business.user : booking.user;
    const subject = isOwner
      ? `New Booking Request: ${booking.service.name}`
      : `Booking Confirmation: ${booking.service.name}`;

    const startTime = new Date(booking.startTime);
    const dateFormatted = startTime.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeFormatted = startTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPaid = !!booking.payment || !!booking.paymentIntentId;

    await this.mailerService.sendMail({
      to: receiver.email,
      subject,
      template: './booking-notification',
      context: {
        receiverName: receiver.firstName,
        isOwner,
        serviceName: booking.service.name,
        bookingId: booking.id.slice(0, 8).toUpperCase(),
        date: dateFormatted,
        time: timeFormatted,
        address: booking.address,
        phone: booking.phone,
        guests: booking.numberOfGuests,
        staff: booking.numberOfStaff,
        totalAmount: (booking.totalAmount || 0).toFixed(2),
        isPaid,
        status: booking.status,
        problemDescription: booking.problemDescription,
        year: new Date().getFullYear(),
      },
    });
  }
}
