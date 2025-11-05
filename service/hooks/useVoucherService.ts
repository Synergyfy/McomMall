'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVoucherProducts,
  addVoucherProduct,
  editVoucherProduct,
  deleteVoucherProduct,
  getMyVouchers,
  initiateVoucherReload,
  verifyVoucherReload,
  getVoucherProduct,
  initiateVoucherPurchase,
  verifyVoucherPurchase,
  getBusinessVoucherProducts,
  redeemVoucherManual,
  getSoldVouchers,
} from '@/service/vouchers';
import {
  CreateVoucherProductDto,
  InitiateReloadDto,
  UpdateVoucherProductDto,
  VerifyReloadDto,
  InitiateVoucherPurchaseDto,
  VerifyVoucherPurchaseDto,
  RedeemVoucherDto,
} from '@/service/vouchers/types';

// Hook to get all voucher products for a business
export const useGetVoucherProducts = () => {
  const {
    data: voucherProducts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['voucherProducts'],
    queryFn: getVoucherProducts,
  });

  return { voucherProducts, isLoading, isError, mutate: refetch };
};

// Hook to get a single voucher product by ID
export const useGetVoucherProduct = (id: string) => {
  const {
    data: voucherProduct,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['voucherProduct', id],
    queryFn: () => getVoucherProduct(id),
    enabled: !!id,
  });

  return { voucherProduct, isLoading, isError };
};

// Hook to add a new voucher product
export const useAddVoucherProduct = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newProduct: CreateVoucherProductDto) =>
      addVoucherProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucherProducts'] });
    },
  });

  return mutation.mutateAsync;
};

// Hook to edit an existing voucher product
export const useEditVoucherProduct = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      updatedProduct,
    }: {
      id: string;
      updatedProduct: UpdateVoucherProductDto;
    }) => editVoucherProduct(id, updatedProduct),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['voucherProducts'] });
      queryClient.invalidateQueries({ queryKey: ['voucherProduct', id] });
    },
  });

  return mutation.mutateAsync;
};

// Hook to delete a voucher product
export const useDeleteVoucherProduct = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => deleteVoucherProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucherProducts'] });
    },
  });
  return mutation.mutateAsync;
};

// Hook for a customer to get their own vouchers
export const useGetMyVoucherById = (id: string) => {
  const {
    data: myVoucher,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myVoucher', id],
    queryFn: () => getMyVoucherById(id),
    enabled: !!id,
  });

  return { myVoucher, isLoading, isError };
};

export const useGetMyVouchers = () => {
  const {
    data: myVouchers,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['myVouchers'],
    queryFn: getMyVouchers,
  });

  return { myVouchers, isLoading, isError, mutate: refetch };
};

// Hook to initiate a voucher reload
export const useInitiateVoucherReload = (code: string) => {
  const mutation = useMutation({
    mutationFn: (data: InitiateReloadDto) => initiateVoucherReload(code, data),
  });
  return mutation;
};

// Hook to verify a voucher reload
export const useVerifyVoucherReload = (code: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: VerifyReloadDto) => verifyVoucherReload(code, data),
    onSuccess: () => {
      // Invalidate queries for my vouchers to reflect the updated balance
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });
    },
  });
  return mutation;
};

// Hook to initiate a voucher purchase
export const useInitiateVoucherPurchase = () => {
  const mutation = useMutation({
    mutationFn: (data: InitiateVoucherPurchaseDto) =>
      initiateVoucherPurchase(data),
  });
  return mutation;
};

// Hook to verify a voucher purchase
export const useVerifyVoucherPurchase = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: VerifyVoucherPurchaseDto) => verifyVoucherPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });
    },
  });
  return mutation;
};

// Hook to get all voucher products for a business (public view)
export const useGetBusinessVoucherProducts = (businessId: string) => {
  const {
    data: voucherProducts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['businessVoucherProducts', businessId],
    queryFn: () => getBusinessVoucherProducts(businessId),
    enabled: !!businessId,
  });

  return { voucherProducts, isLoading, isError };
};

// Hook to redeem a voucher manually (for businesses)
export const useRedeemVoucherManual = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: RedeemVoucherDto) => redeemVoucherManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soldVouchers'] });
    },
  });
  return mutation;
};

// Hook to get all sold vouchers for a business
export const useGetSoldVouchers = () => {
  const {
    data: soldVouchers,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['soldVouchers'],
    queryFn: getSoldVouchers,
  });

  return { soldVouchers, isLoading, isError, mutate: refetch };
};