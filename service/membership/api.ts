import api from '../api';
import {
  InitiateMembershipPaymentDto,
  Membership,
  VerifyMembershipPaymentDto,
} from './types';

export const getMyMembership = async (): Promise<Membership> => {
  const response = await api.get('/membership/my');
  return response.data;
};

export const initiateMembershipPayment = async (
  initiateMembershipPaymentDto: InitiateMembershipPaymentDto
): Promise<{ clientSecret?: string; orderId?: string; provider: string }> => {
  const response = await api.post(
    '/membership/initiate-payment',
    initiateMembershipPaymentDto
  );
  return response.data;
};

export const verifyMembershipPayment = async (
  verifyMembershipPaymentDto: VerifyMembershipPaymentDto
): Promise<Membership> => {
  const response = await api.post(
    '/membership/verify-payment',
    verifyMembershipPaymentDto
  );
  return response.data;
};