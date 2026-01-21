import { useMutation } from '@tanstack/react-query';
import { createStripeIntent, createPaypalOrder } from './index';
import { CreateStripeIntentDto, CreatePaypalOrderDto } from './types';

export const useCreateStripeIntent = () => {
    return useMutation({
        mutationFn: (data: CreateStripeIntentDto) => createStripeIntent(data),
    });
};

export const useCreatePaypalOrder = () => {
    return useMutation({
        mutationFn: (data: CreatePaypalOrderDto) => createPaypalOrder(data),
    });
};
