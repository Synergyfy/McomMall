import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { PaymentProviderService } from './payment-provider.service';
import { McomWalletService } from './mcom-wallet.service';

/**
 * In-app MCOM Wallet top-up through MCOM Pay.
 *
 * Card money is collected by MCOM Pay (Central owns the Stripe account); once
 * the charge is verified the mall credits the payer's central MCOM Wallet.
 * The net effect is the same as a top-up, but every movement is recorded in
 * the MCOM Pay ledger as well as the wallet ledger.
 */
@Injectable()
export class WalletTopUpProxyService {
  private readonly logger = new Logger(WalletTopUpProxyService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly mcomWalletService: McomWalletService,
  ) {}

  getPublishableKey(): string {
    return (
      this.configService.get<string>(
        'NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY',
      ) ||
      this.configService.get<string>(
        'MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY',
      ) ||
      ''
    ).trim();
  }

  isCardTopUpAvailable(): boolean {
    // The publishable key is public by design. The server-side charge is
    // created by MCOM Pay, so no per-user Solutions token is required.
    return this.getPublishableKey().length > 0;
  }

  async initiateTopUp(
    mallUserId: string,
    amount: number,
    currency = 'GBP',
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    topUpRequestId: string;
    amount: number;
    currency: string;
    checkoutUrl?: string | null;
  }> {
    if (!(amount >= 5 && amount <= 500)) {
      throw new BadRequestException(
        'Top-up amount must be between 5 and 500 GBP per attempt.',
      );
    }
    const user = await this.userRepository.findOne({
      where: { id: mallUserId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.centralUserId) {
      throw new BadRequestException(
        'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
      );
    }

    const intent =
      await this.paymentProviderService.createStripePaymentIntent(
        amount,
        currency,
        {
          reference: `wallet-topup-${mallUserId}`,
          userId: mallUserId,
          idempotencyKey: `wallet-topup-${mallUserId}-${randomUUID()}`,
          description: 'MCOM Wallet top-up',
        },
      );

    if (!intent.client_secret) {
      throw new BadRequestException('Could not start the card top-up.');
    }

    return {
      clientSecret: intent.client_secret,
      // The MCOM charge id is what confirm needs. MCOM Pay resolves the
      // provider intent from its own ledger.
      paymentIntentId: intent.id,
      topUpRequestId: intent.id,
      amount,
      currency,
    };
  }

  async confirmTopUp(
    mallUserId: string,
    topUpRequestId: string,
    paymentIntentId: string,
  ): Promise<{
    success: boolean;
    credited?: number;
    centralWalletTransactionId?: string;
  }> {
    const charge = await this.paymentProviderService.getMcomCharge(
      topUpRequestId,
    );
    if (!charge) {
      throw new NotFoundException('Top-up payment was not found.');
    }
    const amount = this.paymentProviderService.fromMinorUnits(
      charge.amountMinor,
    );

    const result =
      await this.paymentProviderService.verifyStripePaymentIntent(
        // Prefer the charge id: MCOM Pay resolves it back to the provider
        // intent itself, so a stale client id cannot redirect the credit.
        topUpRequestId || paymentIntentId,
        amount,
        charge.currency,
      );
    if (!result.ok) {
      throw new BadRequestException(
        `Card top-up could not be verified: ${result.reason}`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: mallUserId },
    });
    if (!user?.centralUserId) {
      throw new BadRequestException(
        'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
      );
    }

    const credited = await this.mcomWalletService.credit({
      userId: user.centralUserId,
      amount,
      category: 'TRANSFER_IN',
      description: 'MCOM Mall wallet top-up',
      reference: topUpRequestId,
      metadata: { platform: 'mcom-mall', mallUserId, chargeId: topUpRequestId },
      idempotencyKey: this.mcomWalletService.buildKey(
        'wallet-topup',
        topUpRequestId,
      ),
    });

    await this.paymentProviderService.allocateCharge({
      mcomChargeId: topUpRequestId,
      purpose: 'WALLET_TOPUP',
      entityType: 'wallet_topup',
      entityId: topUpRequestId,
      userId: mallUserId,
      amountMinor: String(Math.round(Number(amount) * 100)),
      currency: 'GBP',
    });

    this.logger.log(
      `Wallet top-up ${topUpRequestId} credited ${amount} (central txn ${credited.transactionId})`,
    );

    return {
      success: true,
      credited: amount,
      centralWalletTransactionId: credited.transactionId,
    };
  }
}
