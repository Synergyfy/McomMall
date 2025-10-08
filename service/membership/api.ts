import api from '../api';
import {
  InitiateMembershipPaymentDto,
  Membership,
  VerifyMembershipPaymentDto,
} from './types';

export const getMyMembership = async (): Promise<Membership | null> => {
  try {
    const response = await api.get<Membership>('/membership/my');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
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