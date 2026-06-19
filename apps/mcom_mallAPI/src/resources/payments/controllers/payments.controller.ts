import { Controller, Post, Body, Get, Param, Patch, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentProviderService } from '../services/payment-provider.service';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PauseResumeTrialDto } from '../dto/pause-resume-trial.dto';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { CreatePaypalOrderDto } from '../dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from '../dto/capture-paypal-order.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentProviderService: PaymentProviderService,
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
  recordPayment(@Body() recordPaymentDto: RecordPaymentDto, @Req() req) {
    const userId = req.user.id;
    return this.paymentsService.recordPayment(recordPaymentDto, userId);
  }

  @Get('/status')
  getSubscriptionStatus(@Req() req) {
    const userId = req.user.id;
    return this.paymentsService.getSubscriptionStatus(userId);
  }

  @Get('/history')
  getPaymentHistory(@Req() req) {
    const userId = req.user.id;
    return this.paymentsService.getPaymentHistory(userId);
  }
}
