import { PaymentMethod } from '../order/entities/order-payment.entity';
import { PaymentGateway } from './enums/payment-gateway.enum';

/** Map a MCOM Pay charge method (`stripe`/`paypal`/`wallet`) to the API enum. */
export function paymentMethodFromMcom(method: string): PaymentMethod {
  const normalized = String(method || '').toLowerCase();
  if (normalized === 'paypal') return PaymentMethod.PAYPAL;
  if (normalized === 'wallet' || normalized === 'mcom_wallet') {
    return PaymentMethod.MCOM_WALLET;
  }
  return PaymentMethod.STRIPE;
}

/** Map a MCOM Pay charge method to the money-engine gateway enum. */
export function paymentGatewayFromMcom(method: string): PaymentGateway {
  const normalized = String(method || '').toLowerCase();
  if (normalized === 'paypal') return PaymentGateway.PAYPAL;
  if (normalized === 'wallet' || normalized === 'mcom_wallet') {
    return PaymentGateway.MCOM_WALLET;
  }
  return PaymentGateway.STRIPE;
}
