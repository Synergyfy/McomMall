import api from '@/service/api';
import {
    CreateStripeIntentDto,
    StripeIntentResponseDto,
    CreatePaypalOrderDto,
    PaypalOrderResponseDto
} from './types';

export const createStripeIntent = async (data: CreateStripeIntentDto): Promise<StripeIntentResponseDto> => {
    const response = await api.post<StripeIntentResponseDto>('/payments/stripe/create-intent', data);
    return response.data;
};

export const createPaypalOrder = async (data: CreatePaypalOrderDto): Promise<PaypalOrderResponseDto> => {
    const response = await api.post<PaypalOrderResponseDto>('/payments/paypal/create-order', data);
    return response.data;
};
