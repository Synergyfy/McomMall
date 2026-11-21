import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
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
    private readonly paymentOrchestrator: PaymentOrchestratorService,
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

    const result = await this.paymentOrchestrator.confirm({
      // Prefer the charge id: MCOM Pay resolves it back to the provider
      // intent itself, so a stale client id cannot redirect the credit.
      rail: 'stripe',
      reference: topUpRequestId || paymentIntentId,
      amount,
      currency: charge.currency,
      payer: { mallUserId },
    });
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
        'topup',
        topUpRequestId,
      ),
    });

    try {
      await this.paymentProviderService.allocateCharge({
        mcomChargeId: topUpRequestId,
        purpose: 'WALLET_TOPUP',
        entityType: 'wallet_topup',
        entityId: topUpRequestId,
        userId: mallUserId,
        amountMinor: String(Math.round(Number(amount) * 100)),
        currency: 'GBP',
      });
    } catch (err: any) {
      // The browser-driven /wallet/fund/verify path may have already
      // allocated this charge to its audit order. That is the same business
      // event, so treat the conflict as already-recorded instead of failing
      // the webhook (which Central would retry forever).
      const message = String(err?.message ?? err);
      if (!message.includes('CHARGE_ALREADY_USED')) throw err;
    }

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
