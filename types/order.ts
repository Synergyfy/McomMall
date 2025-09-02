export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export interface OrderPaymentDto {
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId: string;
}

export interface CreateOrderDto {
  productId: string;
  quantity: number;
  payment: OrderPaymentDto;
}
