import api from '../api';
import {
  CreateMembershipDto,
  Membership,
  VerifyPaymentDto,
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
  dto: CreateMembershipDto
): Promise<{ clientSecret: string }> => {
  const response = await api.post('/membership/initiate-payment', dto);
  return response.data;
};

export const verifyMembershipPayment = async (
  dto: VerifyPaymentDto
): Promise<Membership> => {
  const response = await api.post('/membership/verify-payment', dto);
  return response.data;
};

export const joinTrial = async (tierId: string): Promise<Membership> => {
  const response = await api.post('/membership/join-trial', { tierId });
  return response.data;
};