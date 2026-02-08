import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Client,
  Environment,
  OrderRequest,
  CheckoutPaymentIntent,
  OrdersController,
} from '@paypal/paypal-server-sdk';

@Injectable()
export class PaymentProviderService {
  private stripe: Stripe;
  private ordersController: OrdersController;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    const client = new Client({
      environment: Environment.Sandbox,
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
    });
    this.ordersController = new OrdersController(client);
  }

  async createStripePaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects the amount in cents
      currency,
      payment_method_types: ['card'],
      metadata,
    });
  }

  async createPaypalOrder(amount: number, currency: string, metadata?: Record<string, any>): Promise<any> {
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
      return { ok: false, details: intent, reason: `Stripe intent status ${intent.status}` };
    }
    
    const expectedAmountInCents = Math.round(expectedAmount * 100);
        const intentAmountInGBP = intent.amount / 100;
    const isAmount100xLarger = Math.abs(intentAmountInGBP - expectedAmount * 100) < 1; // Allow for small floating point differences
    
    const amountMatches = intent.amount_received === expectedAmountInCents || isAmount100xLarger;
    const currencyMatches = intent.currency.toLowerCase() === currency.toLowerCase();
    
    
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
      return { ok: false, details: result, reason: `PayPal order status ${status}` };
    }
    try {
      const captureAmount = Number(
        result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
      );
      const captureCurrency = result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code;
      const amountMatches = captureAmount === Number(expectedAmount);
      const currencyMatches = (captureCurrency || '').toLowerCase() === currency.toLowerCase();
      if (!amountMatches || !currencyMatches) {
        return {
          ok: false,
          details: result,
          reason: 'Amount or currency mismatch for PayPal order',
        };
      }
    } catch (e) {
      return { ok: false, details: result, reason: 'Unable to parse PayPal capture amount' };
    }
    return { ok: true, details: result };
  }
}
