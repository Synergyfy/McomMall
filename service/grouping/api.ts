import api from '../api';
import {
  CreateGroupDto,
  Group,
  InitiateContributionPaymentDto,
  VerifyContributionPaymentDto,
} from './types';

export const createGroup = async (groupData: CreateGroupDto): Promise<Group> => {
  const response = await api.post('/grouping', groupData);
  return response.data;
};

export const getMyGroups = async (): Promise<Group[]> => {
  const response = await api.get('/grouping');
  return response.data;
};

export const getGroupById = async (groupId: string): Promise<Group> => {
  const response = await api.get(`/grouping/${groupId}`);
  return response.data;
};

export const joinGroup = async (groupId: string) => {
  const response = await api.post(`/grouping/${groupId}/join`);
  return response.data;
};

export const initiateContributionPayment = async (
  groupId: string,
  dto: InitiateContributionPaymentDto
): Promise<{ clientSecret?: string; orderId?: string; provider: string }> => {
  const response = await api.post(
    `/grouping/${groupId}/initiate-contribution`,
    dto
  );
  return response.data;
};

export const verifyContributionPayment = async (
  groupId: string,
  dto: VerifyContributionPaymentDto
) => {
  const response = await api.post(`/grouping/${groupId}/verify-contribution`, dto);
  return response.data;
};