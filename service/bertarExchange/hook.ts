import api from '@/service/api';
import { CreateItemDto, Item } from './types';
import { useMutation, useQueryClient, useQuery} from '@tanstack/react-query';




// APIS
const createItem = async (itemData: CreateItemDto): Promise<Item> => {  
    const { data } = await api.post("/exchange/items", itemData);
    return data;
}

const getExchangeItems = async (page = 0, limit = 10): Promise<Item[]> => {
    const { data } = await api.get("/exchange/items", {
        params: { page, limit },
    });
    return data;
};

const createProposal = async (proposalData: any): Promise<any> => {  
    const { data } = await api.post("/exchange/proposals", proposalData);
    return data;
}



// HOOKS  
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemDto) => createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeItems'] });
    }

  });
}


export const useGetExchangeItems = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["exchange-items", page, limit],
    queryFn: () => getExchangeItems(page, limit),
    placeholderData: (prevData) => prevData ?? [],
  });
};


export function useCreateProposal() { 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createProposal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }

  });
}
