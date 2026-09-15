import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentProviderService } from '../services/payment-provider.service';
import { McomWalletService } from '../services/mcom-wallet.service';
import { WalletTopUpProxyService } from '../services/wallet-topup-proxy.service';
import {
  ConfirmWalletTopUpDto,
  InitiateWalletTopUpDto,
} from '../dto/wallet-topup.dto';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PauseResumeTrialDto } from '../dto/pause-resume-trial.dto';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { CreatePaypalOrderDto } from '../dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from '../dto/capture-paypal-order.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly mcomWalletService: McomWalletService,
    private readonly walletTopUpProxyService: WalletTopUpProxyService,
  ) {}

  @Post('stripe/create-intent')
  createStripePaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createStripePaymentIntent(
      createPaymentIntentDto,
    );
  }

  @Post('paypal/create-order')
  createPaypalOrder(@Body() createPaypalOrderDto: CreatePaypalOrderDto) {
    return this.paymentsService.createPaypalOrder(createPaypalOrderDto);
  }

  @Post('paypal/capture-order')
  capturePaypalOrder(@Body() capturePaypalOrderDto: CapturePaypalOrderDto) {
    return this.paymentProviderService.capturePaypalOrder(
      capturePaypalOrderDto.orderId,
    );
  }

  @Post('record')
  @UseGuards(JwtAuthGuard)
  recordPayment(@Body() recordPaymentDto: RecordPaymentDto, @Req() req) {
    const userId = req.user.id;
    return this.paymentsService.recordPayment(recordPaymentDto, userId);
  }

  @Get('/status')
  @UseGuards(JwtAuthGuard)
  getSubscriptionStatus(@Req() req) {
    const userId = req.user.id;
    return this.paymentsService.getSubscriptionStatus(userId);
  }

  @Get('/history')
  @UseGuards(JwtAuthGuard)
  getPaymentHistory(@Req() req) {
    const userId = req.user.id;
    return this.paymentsService.getPaymentHistory(userId);
  }

  @Get('wallet/balance')
  @UseGuards(JwtAuthGuard)
  async getWalletBalance(@Req() req) {
    const centralUserId = req.user?.centralUserId;
    if (!centralUserId) {
      return {
        success: false,
        linked: false,
        message: 'MCOM Wallet is not linked. Please re-authenticate via SSO.',
        topUpUrl: this.mcomWalletService.getTopUpUrl(),
      };
    }
    try {
      const balance = await this.mcomWalletService.getBalance(centralUserId);
      return { ...balance, topUpUrl: this.mcomWalletService.getTopUpUrl() };
    } catch (err: any) {
      throw this.mcomWalletService.toHttpException(err);
    }
  }

  @Get('wallet/config')
  getWalletConfig() {
    return {
      enabled: this.mcomWalletService.isEnabled(),
      topUpUrl: this.mcomWalletService.getTopUpUrl(),
    };
  }

  @Get('wallet/topup/config')
  @UseGuards(JwtAuthGuard)
  getWalletTopUpConfig() {
    // Publishable keys are public by design — safe to expose to the browser.
    return {
      cardTopUpAvailable: this.walletTopUpProxyService.isCardTopUpAvailable(),
      publishableKey: this.walletTopUpProxyService.getPublishableKey() || null,
      limits: { min: 5, max: 500, currency: 'GBP' },
    };
  }

  @Post('wallet/topup/initiate')
  @UseGuards(JwtAuthGuard)
  initiateWalletTopUp(@Body() dto: InitiateWalletTopUpDto, @Req() req) {
    return this.walletTopUpProxyService.initiateTopUp(
      req.user.id,
      dto.amount,
      dto.currency || 'GBP',
    );
  }

  @Post('wallet/topup/confirm')
  @UseGuards(JwtAuthGuard)
  confirmWalletTopUp(@Body() dto: ConfirmWalletTopUpDto, @Req() req) {
    return this.walletTopUpProxyService.confirmTopUp(
      req.user.id,
      dto.topUpRequestId,
      dto.paymentIntentId,
    );
  }
}
