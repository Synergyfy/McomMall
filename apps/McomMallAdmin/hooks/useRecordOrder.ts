import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';
import { CreateOrderDto } from '@/types/order';

/**
 * Buy-now checkout. The old `POST /order` route was a stub; all purchases now
 * go through the same server-priced `/order/checkout` flow as the cart.
 */
const recordOrder = async (orderData: CreateOrderDto) => {
  const { data } = await api.post('/order/checkout', {
    payment: orderData.payment,
    directPurchase: {
      productId: orderData.productId,
      quantity: orderData.quantity,
    },
    couponCode: orderData.couponCode,
    offerId: orderData.offerId,
  });
  return data;
};

export const useRecordOrder = () => {
  return useMutation({
    mutationFn: recordOrder,
  });
};
