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
  const payload = {
    ...initiateMembershipPaymentDto,
    tier: initiateMembershipPaymentDto.tier.toLowerCase(),
  };
  const response = await api.post(
    '/membership/initiate-payment',
    payload
  );
  return response.data;
};

export const verifyMembershipPayment = async (
  verifyMembershipPaymentDto: VerifyMembershipPaymentDto
): Promise<Membership> => {
  const payload = {
    ...verifyMembershipPaymentDto,
    purchaseDetails: {
      ...verifyMembershipPaymentDto.purchaseDetails,
      tier: verifyMembershipPaymentDto.purchaseDetails.tier.toLowerCase(),
    },
  };
  const response = await api.post(
    '/membership/verify-payment',
    payload
  );
  return response.data;
};