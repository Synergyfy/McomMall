import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly mailerService: MailerService) {}

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
      console.error(
        `Failed to send welcome email to ${user.email}:`,
        error.message,
      );
    }
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
