import api from '../api';
import {
  CreateGroupDto,
  Group,
  InitiateContributionPaymentDto,
  VerifyContributionPaymentDto,
} from './types';

export const initiateContributionPayment = async (
  groupId: string,
  data: InitiateContributionPaymentDto,
) => {
  const response = await api.post(
    `/grouping/${groupId}/initiate-contribution`,
    data,
  );
  return response.data;
};

export const verifyContributionPayment = async (
  groupId: string,
  data: VerifyContributionPaymentDto,
) => {
  const response = await api.post(
    `/grouping/${groupId}/verify-contribution`,
    data,
  );
  return response.data;
};

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