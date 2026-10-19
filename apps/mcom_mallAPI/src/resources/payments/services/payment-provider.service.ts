import {
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Client,
  Environment,
  OrderRequest,
  CheckoutPaymentIntent,
  OrdersController,
  PaymentsController,
  Refund,
  RefundStatus,
} from '@paypal/paypal-server-sdk';

export interface PaypalPayoutBatch {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
}

function isPaypalPayoutBatch(payload: unknown): payload is PaypalPayoutBatch {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const header = (payload as { batch_header?: unknown }).batch_header;
  return (
    typeof header === 'object' &&
    header !== null &&
    typeof (header as { payout_batch_id?: unknown }).payout_batch_id ===
      'string'
  );
}

@Injectable()
export class PaymentProviderService {
  private readonly logger = new Logger(PaymentProviderService.name);
  private stripe: Stripe;
  private ordersController: OrdersController;
  private paymentsController: PaymentsController;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(stripeKey);

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required');
    }

    const usesSandboxPaypal = clientId?.startsWith('sb-') ?? false;
    if (process.env.NODE_ENV === 'production' && usesSandboxPaypal) {
      throw new Error(
        'PAYPAL_CLIENT_ID appears to be a sandbox credential. Production environment cannot use sandbox PayPal credentials.',
      );
    }
    if (usesSandboxPaypal) {
      this.logger.warn(
        'PayPal client credentials appear to be sandbox/test credentials.',
      );
    }

    const client = new Client({
      environment:
        process.env.NODE_ENV === 'production'
          ? Environment.Production
          : Environment.Sandbox,
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
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
      throw new Error(
        `Stripe payment intent creation failed: ${error.message}`,
      );
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

      const response = await this.ordersController.createOrder({
        body: request,
      });
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
  ): Promise<PaypalPayoutBatch> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'PayPal Payouts is not configured. PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set.',
      );
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const baseUrl =
      process.env.NODE_ENV === 'production'
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
          sender_batch_id: randomUUID(),
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

    const payload: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `PayPal payout failed (${response.status}): ${
          JSON.stringify(payload) || response.statusText
        }`,
      );
    }

    if (!isPaypalPayoutBatch(payload)) {
      throw new ServiceUnavailableException(
        'PayPal payout response is missing payout_batch_id.',
      );
    }

    return payload;
  }

  async refundPaypalOrder(
    captureId: string,
    amount?: number,
    currency = 'GBP',
  ): Promise<Refund> {
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
      const result = response.result;
      if (result?.status === RefundStatus.Failed) {
        throw new ServiceUnavailableException(
          `PayPal refund failed: ${result.id} status ${result.status}`,
        );
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new ServiceUnavailableException(
        `PayPal refund failed for capture ${captureId}: ${message}`,
      );
    }
  }

  /**
   * Verifies a Stripe webhook signature and returns the parsed event.
   * Throws if the webhook secret is not configured or the signature is invalid.
   */
  constructStripeEvent(
    payload: Buffer | string,
    signature: string,
  ): Stripe.Event {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException(
        'STRIPE_WEBHOOK_SECRET is not configured',
      );
    }
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Verifies a PayPal webhook by calling PayPal's verify-webhook-signature API.
   * Fails closed when credentials/webhook id are missing or verification fails.
   */
  async verifyPaypalWebhook(
    headers: Record<string, any>,
    body: any,
  ): Promise<{ ok: boolean; reason?: string }> {
    const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    if (!webhookId || !clientId || !clientSecret) {
      return {
        ok: false,
        reason: 'PayPal webhook verification is not configured',
      };
    }
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const tokenJson: any = await tokenRes.json();
      if (!tokenRes.ok || !tokenJson?.access_token) {
        return { ok: false, reason: 'Unable to obtain PayPal access token' };
      }

      const verifyRes = await fetch(
        `${baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: body,
          }),
        },
      );
      const verifyJson: any = await verifyRes.json();
      if (verifyJson?.verification_status === 'SUCCESS') {
        return { ok: true };
      }
      return {
        ok: false,
        reason: `PayPal verification_status=${verifyJson?.verification_status}`,
      };
    } catch (error: any) {
      return {
        ok: false,
        reason: error?.message ?? 'PayPal verification error',
      };
    }
  }
}
