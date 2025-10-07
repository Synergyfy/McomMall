import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';
import { IService, SearchServiceDto } from './types';

const searchServices = async (searchDto: SearchServiceDto): Promise<IService[]> => {
  const { data } = await api.get('/services/search', {
    params: { term: searchDto.term },
  });
  return data;
};

export const useSearchServices = () => {
  return useMutation({
    mutationFn: searchServices,
  });
};