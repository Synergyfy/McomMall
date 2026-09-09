import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Client,
  Environment,
  OrderRequest,
  CheckoutPaymentIntent,
  OrdersController,
  PaymentsController,
} from '@paypal/paypal-server-sdk';

@Injectable()
export class PaymentProviderService {
  private stripe: Stripe;
  private ordersController: OrdersController;
  private paymentsController: PaymentsController;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey && process.env.NODE_ENV === 'production') {
      throw new Error('STRIPE_SECRET_KEY is required in production environment');
    }
    this.stripe = new Stripe(stripeKey || 'dummy_stripe_secret_key_dev');

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    const client = new Client({
      environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId || '',
        oAuthClientSecret: clientSecret || '',
      },
    });
    this.ordersController = new OrdersController(client);
    this.paymentsController = new PaymentsController(client);
  }

  async createStripePaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
        metadata,
      });
    } catch (error: any) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async createPaypalOrder(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    try {
      const request: OrderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount.toFixed(2),
            },
            customId: metadata ? JSON.stringify(metadata) : undefined,
          },
        ],
      };

      const response = await this.ordersController.createOrder({ body: request });
      return response.result;
    } catch (error: any) {
      throw new Error(`PayPal order creation failed: ${error.message}`);
    }
  }

  async capturePaypalOrder(orderId: string): Promise<any> {
    const response = await this.ordersController.captureOrder({ id: orderId });
    return response.result;
  }

  async verifyStripePaymentIntent(
    intentId: string,
    expectedAmount: number,
    currency: string,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    const intent = await this.stripe.paymentIntents.retrieve(intentId);
    if (!intent) {
      return { ok: false, reason: 'Stripe payment intent not found' };
    }
    if (intent.status !== 'succeeded') {
      return {
        ok: false,
        details: intent,
        reason: `Stripe intent status ${intent.status}`,
      };
    }

    const expectedAmountInCents = Math.round(expectedAmount * 100);
    const amountMatches = intent.amount_received === expectedAmountInCents;
    const currencyMatches =
      intent.currency.toLowerCase() === currency.toLowerCase();

    if (!amountMatches || !currencyMatches) {
      return {
        ok: false,
        details: {
          expectedAmount: expectedAmountInCents,
          actualAmount: intent.amount_received,
          expectedCurrency: currency,
          actualCurrency: intent.currency,
        },
        reason: `Amount or currency mismatch for Stripe intent. Expected: ${expectedAmountInCents} cents (${expectedAmount} ${currency}), Received: ${intent.amount_received} cents (${intent.currency})`,
      };
    }
    return { ok: true, details: intent };
  }

  async captureAndVerifyPaypalOrder(
    orderId: string,
    expectedAmount: number,
    currency: string,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    const result = await this.capturePaypalOrder(orderId);
    // Basic validations based on PayPal capture response
    const status = result?.status;
    if (status !== 'COMPLETED') {
      return {
        ok: false,
        details: result,
        reason: `PayPal order status ${status}`,
      };
    }
    try {
      const captureAmount = Number(
        result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
      );
      const captureCurrency =
        result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount
          ?.currency_code;
      const amountMatches = captureAmount === Number(expectedAmount);
      const currencyMatches =
        (captureCurrency || '').toLowerCase() === currency.toLowerCase();
      if (!amountMatches || !currencyMatches) {
        return {
          ok: false,
          details: result,
          reason: 'Amount or currency mismatch for PayPal order',
        };
      }
    } catch (_e) {
      return {
        ok: false,
        details: result,
        reason: 'Unable to parse PayPal capture amount',
      };
    }
    return { ok: true, details: result };
  }

  async createStripeTransfer(
    amount: number,
    currency: string,
    destinationAccountId: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency,
      destination: destinationAccountId,
      metadata,
    });
  }

  async refundStripePayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }
    return this.stripe.refunds.create(refundParams);
  }

  async createPaypalPayout(
    amount: number,
    currency: string,
    receiverEmail: string,
  ): Promise<any> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return { batch_header: { payout_batch_id: `payout_sim_${Date.now()}`, batch_status: 'PENDING' } };
    }

    // Call PayPal REST API endpoint for Payouts
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `batch_${Date.now()}`,
          email_subject: 'You have a payout from Mcom Mall',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: { value: amount.toFixed(2), currency },
            receiver: receiverEmail,
            note: 'Thank you for your business with Mcom Mall',
          },
        ],
      }),
    });
    return response.json();
  }

  async refundPaypalOrder(captureId: string, amount?: number, currency = 'GBP'): Promise<any> {
    try {
      const response = await this.paymentsController.refundCapturedPayment({
        captureId,
        body: amount
          ? {
              amount: {
                value: amount.toFixed(2),
                currencyCode: currency,
              },
            }
          : {},
      });
      return response.result;
    } catch (error: any) {
      if (!this.configService.get<string>('PAYPAL_CLIENT_ID')) {
        return { id: `refund_sim_${Date.now()}`, status: 'COMPLETED' };
      }
      throw error;
    }
  }
}
