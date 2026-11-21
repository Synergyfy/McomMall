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
  @UseGuards(JwtAuthGuard)
  createStripePaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Req() req,
  ) {
    return this.paymentsService.createStripePaymentIntent(
      createPaymentIntentDto,
      req.user.id,
    );
  }

  @Post('paypal/create-order')
  @UseGuards(JwtAuthGuard)
  createPaypalOrder(
    @Body() createPaypalOrderDto: CreatePaypalOrderDto,
    @Req() req,
  ) {
    return this.paymentsService.createPaypalOrder(
      createPaypalOrderDto,
      req.user.id,
    );
  }

  @Post('paypal/capture-order')
  @UseGuards(JwtAuthGuard)
  capturePaypalOrder(
    @Body() capturePaypalOrderDto: CapturePaypalOrderDto,
    @Req() req,
  ) {
    return this.paymentProviderService.capturePaypalOrder(
      capturePaypalOrderDto.orderId,
      { mallUserId: req.user.id },
    );
  }

  @Get('config')
  @UseGuards(JwtAuthGuard)
  getPaymentConfig(@Req() req) {
    // Publishable keys are public by design; never expose secrets here.
    return {
      mcomPayEnabled: this.paymentProviderService.isEnabled(),
      publishableKey: this.walletTopUpProxyService.getPublishableKey() || null,
      walletEnabled: this.mcomWalletService.isEnabled(),
      topUpUrl: this.mcomWalletService.getTopUpUrl(),
      paypalMode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
      currency: 'GBP',
    };
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
      return {
        ...balance,
        linked: true,
        centralUserId,
        topUpUrl: this.mcomWalletService.getTopUpUrl(),
      };
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
}
