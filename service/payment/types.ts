export interface CreateStripeIntentDto {
    amount: number;
}

export interface StripeIntentResponseDto {
    clientSecret: string;
    id: string;
}

export interface CreatePaypalOrderDto {
    amount: number;
}

export interface PaypalOrderResponseDto {
    orderId: string;
}
