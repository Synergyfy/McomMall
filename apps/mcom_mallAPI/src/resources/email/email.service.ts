import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

type MailOptions = Parameters<MailerService['sendMail']>[0];

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Emails are a best-effort side effect: a mail failure must never fail the
   * business operation (partnership request, booking, …) that triggered it.
   */
  private async send(options: MailOptions, description: string) {
    try {
      return await this.mailerService.sendMail(options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send ${description}: ${message}`);
      return null;
    }
  }

  async sendUserWelcomeEmail(user: User) {
    await this.send(
      {
        to: user.email,
        subject: 'Welcome to McomMall!',
        template: './welcome',
        context: {
          name: user.firstName,
        },
      },
      `welcome email to ${user.email}`,
    );
  }

  async sendPartnershipRequestEmail(
    receiver: User,
    sender: User,
    itemDetails?: { baseItemName: string; plusItemName: string },
  ) {
    const frontendUrl = (
      process.env.MALL_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3003'
    ).replace(/\/$/, '');
    const actionUrl = `${frontendUrl}/dashboard/marketing/my-partners`;
    const senderInitials =
      (sender.firstName?.[0] || 'U') + (sender.lastName?.[0] || '');

    await this.send(
      {
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
      },
      `partnership request email to ${receiver.email}`,
    );
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

    await this.send(
      {
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
      },
      `booking notification to ${receiver.email}`,
    );
  }
}
