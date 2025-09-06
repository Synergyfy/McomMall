import { PaymentMethod } from "@/service/bookings/types";

export interface CreateOrderDto {
    productId: string;
    quantity: number;
    payment: {
        paymentMethod: PaymentMethod;
        amount: number;
        transactionId: string;
    };
}
